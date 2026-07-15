"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { useDialKit } from "dialkit";

function CardLabel({ title, sub, labelFontSize }: { title: string; sub?: string; labelFontSize: number }) {
  return (
    <div style={{ padding: "3px 2px" }}>
      <p style={{
        fontFamily: "var(--font-sans-medium)",
        fontWeight: 500,
        fontSize: labelFontSize,
        lineHeight: 1.4,
        color: "var(--color-text-primary)",
        margin: 0,
      }}>{title}</p>
      {sub && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--color-text-tertiary)",
          margin: "5px 0 0",
          letterSpacing: "0.01em",
        }}>{sub}</p>
      )}
    </div>
  );
}

interface Props {
  playbackId: string;
  href: string;
  title: string;
  sub?: string;
  aspectRatio: string;
  /** Whether this card is on the currently-visible route. Defaults to true
   *  for standalone use; the persistent work shell passes this so background
   *  cards pause (rather than reload) while a case study is open. */
  active?: boolean;
}

export default function MuxAutoplayCard({ playbackId, href, title, sub, aspectRatio, active = true }: Props) {
  const dk = useDialKit("ProjectCard", {
    cardRadius:    [4,  0, 24],
    cardGap:       [6,  0, 24],
    labelFontSize: [18, 10, 32],
  });

  const playerRef = useRef<MuxPlayerRefAttributes>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (active) player.play?.().catch(() => {});
    else player.pause?.();
  }, [active]);

  const video = (
    <div className="project-image project-img-wrap" style={{ borderRadius: dk.cardRadius, overflow: "hidden", background: "var(--color-placeholder)", aspectRatio, position: "relative", width: "100%" }}>
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        autoPlay="muted"
        loop
        muted
        playsInline
        nohotkeys
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          // @ts-ignore CSS custom properties
          "--controls": "none",
          "--media-background-color": "transparent",
        }}
      />
    </div>
  );

  const linkStyle = { textDecoration: "none", display: "block" } as const;
  const external = href.startsWith("http");

  return (
    <div className="project-card" style={{ display: "flex", flexDirection: "column", gap: dk.cardGap }}>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{video}</a>
      ) : (
        <Link href={href} prefetch style={linkStyle}>{video}</Link>
      )}
      <CardLabel title={title} sub={sub} labelFontSize={dk.labelFontSize} />
    </div>
  );
}
