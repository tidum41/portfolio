"use client";

import MuxPlayer from "@mux/mux-player-react";

export default function MuxHero({ playbackId }: { playbackId: string }) {
  const thumbnail = `https://image.mux.com/${playbackId}/thumbnail.webp`;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Invisible thumbnail sets the exact aspect ratio before the video loads,
          preventing any layout shift. Mux serves this from CDN near-instantly. */}
      <img
        src={thumbnail}
        alt=""
        aria-hidden
        fetchPriority="high"
        style={{ display: "block", width: "100%", height: "auto", visibility: "hidden" }}
      />
      <MuxPlayer
        playbackId={playbackId}
        autoPlay="muted"
        loop
        muted
        playsInline
        nohotkeys
        poster={thumbnail}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          // @ts-ignore CSS custom properties
          "--controls": "none",
          "--media-background-color": "transparent",
        }}
      />
    </div>
  );
}
