"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";

export function muxPosterUrl(playbackId: string, width: number, time = 1) {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=${time}&width=${width}`;
}

type Playable = { play?: () => Promise<void> | void; muted?: boolean };

function playMux(el: MuxPlayerElement | null) {
  if (!el) return;
  try {
    el.muted = true;
  } catch {
    /* custom element may not expose muted yet */
  }
  const media = (el as MuxPlayerElement & { media?: HTMLMediaElement }).media;
  for (const node of [el, media] as Playable[]) {
    try {
      const p = node?.play?.();
      if (p && typeof (p as Promise<void>).catch === "function") {
        (p as Promise<void>).catch(() => {});
      }
    } catch {
      /* autoplay can reject until the slot has a real box and is on-screen */
    }
  }
}

/**
 * Case-study Mux: the poster <img> is in normal flow so the slot is the
 * video's real aspect ratio (not a guessed 16:9). The player sits on top
 * at full opacity from the first paint — no skeleton, no overlay fade —
 * so muted autoplay is allowed. The still is just the first frame until
 * HLS catches up.
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
  const playerRef = useRef<MuxPlayerElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const kickPlay = useCallback(() => {
    const root = rootRef.current;
    if (root && root.getBoundingClientRect().height < 8) return;
    playMux(playerRef.current);
  }, []);

  useEffect(() => {
    kickPlay();
    const t1 = window.setTimeout(kickPlay, 60);
    const t2 = window.setTimeout(kickPlay, 240);
    const t3 = window.setTimeout(kickPlay, 800);
    const onVis = () => {
      if (document.visibilityState === "visible") kickPlay();
    };
    window.addEventListener("soft-nav-settled", kickPlay);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("soft-nav-settled", kickPlay);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [playbackId, kickPlay]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => kickPlay());
    ro.observe(root);
    return () => ro.disconnect();
  }, [kickPlay]);

  return (
    <div
      ref={rootRef}
      className={["mux-media-slot", className].filter(Boolean).join(" ")}
      style={style}
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
      <MuxPlayer
        ref={playerRef}
        key={playbackId}
        playbackId={playbackId}
        streamType="on-demand"
        autoPlay="muted"
        loop
        muted
        playsInline
        nohotkeys
        defaultHiddenCaptions
        preload="auto"
        thumbnailTime={thumbnailTime}
        poster={poster}
        onCanPlay={kickPlay}
        onPlaying={kickPlay}
        onLoadedData={kickPlay}
        className="mux-cover"
      />
    </div>
  );
}
