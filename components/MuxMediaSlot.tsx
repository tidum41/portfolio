"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import type Hls from "hls.js";
import { HLS_LIGHT_SRC } from "@/lib/hlsLight";
import { constrainedNetwork } from "@/lib/networkHint";

type HlsStatic = typeof import("hls.js").default;

export function muxPosterUrl(playbackId: string, width: number, time = 1) {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=${time}&width=${width}`;
}

function muxHlsUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/**
 * Card streams cap the ladder. A grid tile doesn't need a 1080p rendition,
 * and a smaller first segment is what lets playback start during the intro.
 * The hero (fill=false) keeps the full ladder.
 */
export function muxCardStreamUrl(playbackId: string) {
  const phone = typeof window !== "undefined" && window.innerWidth < 800;
  const cap = constrainedNetwork() || phone ? "480p" : "720p";
  return `${muxHlsUrl(playbackId)}?max_resolution=${cap}`;
}

function cardStartEstimate() {
  if (constrainedNetwork()) return 280_000;
  // A phone-width tile starts on the 480p rung. Desktop can take 720p.
  if (typeof window !== "undefined" && window.innerWidth < 800) return 350_000;
  return 2_500_000;
}

let hlsModulePromise: Promise<HlsStatic> | null = null;

function warmPlaylist(playbackId: string): string | null {
  const raw = document.getElementById("mux-card-warm")?.textContent;
  if (!raw) return null;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    return typeof map[playbackId] === "string" ? map[playbackId] : null;
  } catch {
    return null;
  }
}

/**
 * The light player is a real script tag (preloaded from the homepage HTML)
 * so it can download during the intro, before this component hydrates.
 */
export function preloadHlsModule() {
  if (typeof window === "undefined") return;
  void loadHlsCtor();
}

function loadHlsCtor(): Promise<HlsStatic> {
  const w = window as Window & { Hls?: HlsStatic };
  if (w.Hls) return Promise.resolve(w.Hls);
  if (hlsModulePromise) return hlsModulePromise;
  hlsModulePromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (w.Hls) resolve(w.Hls);
      else reject(new Error("Hls missing"));
    };
    let script = document.querySelector("script[data-hls-light]") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.src = HLS_LIGHT_SRC;
      script.async = true;
      script.setAttribute("data-hls-light", "1");
      document.head.appendChild(script);
    }
    if (w.Hls) {
      finish();
      return;
    }
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("Hls failed")), { once: true });
    // The homepage boot script can finish in the gap before this listener exists.
    if (w.Hls) finish();
  });
  hlsModulePromise.catch(() => {
    hlsModulePromise = null;
  });
  return hlsModulePromise;
}

/**
 * Native <video> + HLS so muted autoplay is a real media element.
 * Default: poster <img> is in-flow so the slot is the video's real ratio.
 * `fill`: cover a parent aspect box (work-grid cards) — no mux-player chrome.
 * The video stays invisible until it is actually on the poster frame, so a
 * rejected autoplay (iOS Low Power Mode) leaves the still in place.
 */
export default function MuxMediaSlot({
  playbackId,
  thumbnailTime = 1,
  className,
  style,
  fill = false,
  playing = true,
  posterWidth,
  posterHeight,
}: {
  playbackId: string;
  thumbnailTime?: number;
  className?: string;
  style?: CSSProperties;
  /** Fill a parent box (work-grid cards) with object-fit: cover. */
  fill?: boolean;
  /** Pause without tearing down HLS (soft-nav). */
  playing?: boolean;
  /**
   * Intrinsic poster size. CSS is `width: 100%; height: auto`, so without
   * these the slot is 0px tall until the thumbnail arrives and the hero jumps.
   */
  posterWidth?: number;
  posterHeight?: number;
}) {
  const poster = muxPosterUrl(playbackId, fill ? 640 : 1280, thumbnailTime);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const revealIfOnPoster = useCallback(() => {
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;
    if (root.getAttribute("data-frame") === "shown") return;
    // Stay on the still until the decoded frame is the one the poster shows.
    if (thumbnailTime > 0 && video.currentTime < thumbnailTime - 0.35) return;
    if (video.readyState < 2) return;
    root.setAttribute("data-frame", "shown");
  }, [thumbnailTime]);

  const kickPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !playingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.muted = true;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      // Low Power Mode and other autoplay blocks: the poster stays up.
      attempt.catch(() => {});
    }
  }, []);

  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video;
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (!video) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      let cancelled = false;
      video.muted = true;

      const start = async () => {
        // Phone cards open the exact 480p playlist the HTML already fetched,
        // so the first segment is a cache hit. Desktop keeps the full ladder.
        const narrow =
          window.innerWidth < 800 || constrainedNetwork();
        const warmed = fill && narrow ? warmPlaylist(playbackId) : null;
        const stream = warmed || (fill ? muxCardStreamUrl(playbackId) : muxHlsUrl(playbackId));

        let Hls: HlsStatic | null = null;
        try {
          Hls = await loadHlsCtor();
        } catch {
          Hls = null;
        }
        if (cancelled) return;

        // Prefer hls.js in Chrome; native HLS is Safari. canPlayType("maybe")
        // on Chromium is not enough to skip MSE.
        if (Hls?.isSupported()) {
          const hls = new Hls({
            // Begin on the poster frame instead of frame 0 (that mismatch is the pop).
            startPosition: thumbnailTime,
            // Don't spend a round trip probing the lowest rung before playback.
            testBandwidth: false,
            abrEwmaDefaultEstimate: cardStartEstimate(),
            capLevelToPlayerSize: true,
            maxBufferLength: fill ? 2 : 8,
            maxMaxBufferLength: fill ? 8 : 24,
            startFragPrefetch: true,
            enableWorker: true,
          });
          hlsRef.current = hls;
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, kickPlay);
          let recovered = false;
          hls.on(Hls.Events.ERROR, (_evt, data) => {
            if (!data?.fatal || cancelled) return;
            // The preloaded playlist is a signed URL. If it fails, open the
            // live master once instead of leaving the card on the still.
            const live = fill ? muxCardStreamUrl(playbackId) : muxHlsUrl(playbackId);
            if (!recovered && stream !== live) {
              recovered = true;
              hls.loadSource(live);
              hls.startLoad(thumbnailTime);
              return;
            }
            rootRef.current?.setAttribute("data-hls", `error:${data.type}:${data.details}`);
          });
          rootRef.current?.setAttribute("data-hls", "hls.js");
          kickPlay();
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          const seekToPoster = () => {
            if (thumbnailTime > 0 && video.currentTime < thumbnailTime - 0.35) {
              try { video.currentTime = thumbnailTime; } catch { /* metadata not ready */ }
            }
          };
          video.addEventListener("loadedmetadata", seekToPoster, { once: true });
          video.src = stream;
          rootRef.current?.setAttribute("data-hls", "native");
          kickPlay();
          return;
        }

        rootRef.current?.setAttribute("data-hls", "unsupported");
      };

      void start();
      return () => {
        cancelled = true;
      };
    },
    [playbackId, kickPlay, fill, thumbnailTime],
  );

  useEffect(() => {
    const video = videoRef.current;
    const stop = attachVideo(video);
    const onFrame = () => revealIfOnPoster();
    video?.addEventListener("playing", onFrame);
    video?.addEventListener("timeupdate", onFrame);
    video?.addEventListener("seeked", onFrame);
    const onEnded = () => {
      const el = videoRef.current;
      if (!el || thumbnailTime <= 0) return;
      // Loop from the poster frame so the card doesn't flash frame 0.
      try { el.currentTime = thumbnailTime; } catch { /* ignore */ }
      kickPlay();
    };
    video?.addEventListener("ended", onEnded);
    const t1 = window.setTimeout(kickPlay, 60);
    const t2 = window.setTimeout(kickPlay, 400);
    const onVis = () => {
      if (document.visibilityState === "visible") kickPlay();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) kickPlay();
    };
    const onSoftStart = () => {
      try { videoRef.current?.pause(); } catch { /* ignore */ }
    };
    window.addEventListener("soft-nav-start", onSoftStart);
    window.addEventListener("soft-nav-settled", kickPlay);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop?.();
      video?.removeEventListener("playing", onFrame);
      video?.removeEventListener("timeupdate", onFrame);
      video?.removeEventListener("seeked", onFrame);
      video?.removeEventListener("ended", onEnded);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("soft-nav-start", onSoftStart);
      window.removeEventListener("soft-nav-settled", kickPlay);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVis);
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [attachVideo, kickPlay, revealIfOnPoster, thumbnailTime]);

  useEffect(() => {
    if (playing) kickPlay();
    else {
      try { videoRef.current?.pause(); } catch { /* ignore */ }
    }
  }, [playing, kickPlay]);

  return (
    <div
      ref={rootRef}
      className={["mux-media-slot", fill ? "mux-media-slot--fill" : "", className].filter(Boolean).join(" ")}
      style={style}
      data-hls="pending"
    >
      {/* Intrinsic Mux thumbnail — native img so the slot is the video's real ratio.
          Fill/grid cards already paint a poster underneath; skip a second 1280 fetch. */}
      {!fill && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="mux-media-sizer"
          src={poster}
          alt=""
          aria-hidden
          width={posterWidth}
          height={posterHeight}
          decoding="async"
          fetchPriority="high"
          onLoad={kickPlay}
        />
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className="mux-cover"
        poster={fill ? undefined : poster}
        autoPlay
        muted
        loop={thumbnailTime <= 0}
        playsInline
        preload="auto"
        onCanPlay={kickPlay}
        onPlaying={kickPlay}
        onLoadedData={kickPlay}
      />
    </div>
  );
}
