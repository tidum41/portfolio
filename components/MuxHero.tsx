"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { cssEase, EASE_OPACITY, MUX_POSTER_FADE_MS } from "@/lib/motion";

const FADE = `opacity ${MUX_POSTER_FADE_MS}ms ${cssEase(EASE_OPACITY)}`;

function muxPoster(playbackId: string, width: number, time = 1) {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=${time}&width=${width}`;
}

function muxBlur(playbackId: string, time = 1) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}&width=32`;
}

/**
 * Case-study hero Mux. The slot is sized up front (aspect-ratio) so the
 * layout never jumps. A blurred LQIP + sharp poster paint immediately; the
 * player sits underneath and only crossfades in on canplay — a black
 * mux-player chrome used to cover the poster before HLS was ready, which
 * read as "the video didn't load."
 */
export default function MuxHero({
  playbackId,
  aspectRatio = "16 / 9",
}: {
  playbackId: string;
  aspectRatio?: string;
}) {
  const poster = muxPoster(playbackId, 1280);
  const blur = muxBlur(playbackId);
  const [ready, setReady] = useState(false);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  return (
    <div
      className="mux-media-slot"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        overflow: "hidden",
        background: "var(--color-placeholder)",
        isolation: "isolate",
      }}
    >
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
          zIndex: 1,
        }}
      />
      <img
        src={poster}
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          zIndex: 2,
          opacity: ready ? 0 : 1,
          transition: FADE,
        }}
      />
      {mount && (
        <MuxPlayer
          key={playbackId}
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay="muted"
          loop
          muted
          playsInline
          nohotkeys
          preload="auto"
          poster={poster}
          onCanPlay={() => setReady(true)}
          onPlaying={() => setReady(true)}
          className="mux-cover"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            display: "block",
            "--controls": "none",
            "--media-background-color": "transparent",
            "--media-object-fit": "cover",
          }}
        />
      )}
    </div>
  );
}
