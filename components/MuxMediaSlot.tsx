"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import type Hls from "hls.js";

export function muxPosterUrl(playbackId: string, width: number, time = 1) {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=${time}&width=${width}`;
}

function muxHlsUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/**
 * Case-study Mux hero: native <video> + HLS so muted autoplay is a real
 * media element. The poster <img> is in-flow so the slot is the video's
 * real aspect ratio — not a guessed 16:9. HLS is imported inside the
 * effect so a bundling failure can't block this component from hydrating.
 */
export default function MuxMediaSlot({
  playbackId,
  thumbnailTime = 1,
  className,
  style,
}: {
  playbackId: string;
  thumbnailTime?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const poster = muxPosterUrl(playbackId, 1280, thumbnailTime);
  const src = muxHlsUrl(playbackId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const kickPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video;
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (!video) return;

      let cancelled = false;
      video.muted = true;

      const start = async () => {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;

        // Prefer hls.js in Chrome; native HLS is Safari. canPlayType("maybe")
        // on Chromium is not enough to skip MSE.
        if (Hls.isSupported()) {
          const hls = new Hls({
            startLevel: -1,
            maxBufferLength: 8,
            enableWorker: false,
          });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, kickPlay);
          hls.on(Hls.Events.ERROR, (_evt, data) => {
            if (data?.fatal) {
              rootRef.current?.setAttribute("data-hls", `error:${data.type}:${data.details}`);
            }
          });
          rootRef.current?.setAttribute("data-hls", "hls.js");
          kickPlay();
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
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
    [src, kickPlay],
  );

  useEffect(() => {
    const video = videoRef.current;
    const stop = attachVideo(video);
    const t1 = window.setTimeout(kickPlay, 60);
    const t2 = window.setTimeout(kickPlay, 400);
    const onVis = () => {
      if (document.visibilityState === "visible") kickPlay();
    };
    window.addEventListener("soft-nav-settled", kickPlay);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop?.();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("soft-nav-settled", kickPlay);
      document.removeEventListener("visibilitychange", onVis);
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [attachVideo, kickPlay]);

  return (
    <div
      ref={rootRef}
      className={["mux-media-slot", className].filter(Boolean).join(" ")}
      style={style}
      data-hls="pending"
    >
      {/* Intrinsic Mux thumbnail — native img so the slot is the video's real ratio. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mux-media-sizer"
        src={poster}
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        onLoad={kickPlay}
      />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className="mux-cover"
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={kickPlay}
        onPlaying={kickPlay}
        onLoadedData={kickPlay}
      />
    </div>
  );
}
