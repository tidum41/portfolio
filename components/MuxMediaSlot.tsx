"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { cssEase, EASE_OPACITY, MUX_POSTER_FADE_MS } from "@/lib/motion";

const FADE = `opacity ${MUX_POSTER_FADE_MS}ms ${cssEase(EASE_OPACITY)}`;
const FALLBACK_AR = "16 / 9";

export function muxPosterUrl(playbackId: string, width: number, time = 1) {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=${time}&width=${width}`;
}

export function muxBlurUrl(playbackId: string, time = 1) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}&width=32`;
}

function ratioFromImg(img: HTMLImageElement): string | null {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return null;
  return `${w} / ${h}`;
}

/**
 * One layout box for Mux: the slot's width/height is the poster's intrinsic
 * ratio (same as the rendered video). Blur + poster sit on top of the player
 * and both fade out on canplay — the player stays opacity 1 so muted autoplay
 * is allowed, and it never paints a black hole over the still.
 */
export default function MuxMediaSlot({
  playbackId,
  thumbnailTime = 1,
  aspectRatio,
  className,
  style,
}: {
  playbackId: string;
  thumbnailTime?: number;
  /** Fallback until the poster reports native dimensions. */
  aspectRatio?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const poster = muxPosterUrl(playbackId, 1280, thumbnailTime);
  const blur = muxBlurUrl(playbackId, thumbnailTime);
  const playerRef = useRef<MuxPlayerElement>(null);
  const [ready, setReady] = useState(false);
  const [ratio, setRatio] = useState(aspectRatio ?? FALLBACK_AR);

  const applyPosterSize = useCallback((img: HTMLImageElement | null) => {
    const next = img ? ratioFromImg(img) : null;
    if (next) setRatio(next);
  }, []);

  const kickPlay = useCallback(() => {
    const el = playerRef.current;
    if (!el) return;
    try {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch { /* autoplay may reject until the slot is on-screen */ }
  }, []);

  useEffect(() => {
    setReady(false);
    setRatio(aspectRatio ?? FALLBACK_AR);
  }, [playbackId, aspectRatio]);

  useEffect(() => {
    kickPlay();
    const t1 = window.setTimeout(kickPlay, 120);
    const t2 = window.setTimeout(kickPlay, 700);
    window.addEventListener("soft-nav-settled", kickPlay);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("soft-nav-settled", kickPlay);
    };
  }, [playbackId, kickPlay]);

  const onReady = () => {
    setReady(true);
    kickPlay();
  };

  return (
    <div
      className={["mux-media-slot", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        overflow: "hidden",
        background: "var(--color-placeholder)",
        isolation: "isolate",
        ...style,
      }}
    >
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
        preload="auto"
        thumbnailTime={thumbnailTime}
        poster={poster}
        onCanPlay={onReady}
        onPlaying={onReady}
        onLoadedData={onReady}
        className="mux-cover"
      />
      <img
        src={blur}
        alt=""
        aria-hidden
        className={ready ? undefined : "mux-media-slot__breathe"}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scale(1.08)",
          filter: "blur(16px)",
          pointerEvents: "none",
          zIndex: 2,
          opacity: ready ? 0 : 1,
          transition: FADE,
        }}
      />
      <img
        src={poster}
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        onLoad={(e) => applyPosterSize(e.currentTarget)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          zIndex: 3,
          opacity: ready ? 0 : 1,
          transition: FADE,
        }}
      />
    </div>
  );
}
