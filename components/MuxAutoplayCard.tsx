"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { useDialKit } from "dialkit";
import NortheastArrow from "@/components/icons/NortheastArrow";
import ProjectCardLift from "@/components/ProjectCardLift";

function CardLabel({
  title,
  sub,
  labelFontSize,
  external,
}: {
  title: string;
  sub?: string;
  labelFontSize: number;
  external?: boolean;
}) {
  return (
    <div style={{ padding: "3px 2px" }}>
      <p style={{
        fontFamily: "var(--font-sans-medium)",
        fontWeight: 500,
        fontSize: labelFontSize,
        lineHeight: 1.4,
        color: "var(--color-text-primary)",
        margin: 0,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        {title}
        {external && <NortheastArrow size={13} color="var(--color-link-blue)" />}
      </p>
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

export default function MuxAutoplayCard({
  playbackId,
  href,
  title,
  sub,
  aspectRatio,
  active = true,
}: Props) {
  const dk = useDialKit("ProjectCard", {
    cardRadius:    [4,  0, 24],
    cardGap:       [6,  0, 24],
    labelFontSize: [18, 10, 32],
  });

  const playerRef    = useRef<MuxPlayerRefAttributes>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Viewport-only mount while the work route is active. Leaving "/" clears
  // the latch so HLS stacks are not remounted en masse on return — only
  // cards that re-enter view spin up again.
  useEffect(() => {
    if (!active) {
      setShouldLoad(false);
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px 200px 0px" },
    );
    obs.observe(container);
    return () => obs.disconnect();
  }, [active]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (active) player.play?.().catch(() => {});
    else player.pause?.();
  }, [active, shouldLoad]);

  // Poster while the live player isn't mounted — Mux thumbnail is a still,
  // not a second decoder. Live player only mounts when this card has entered
  // view AND the work route is active, so leaving "/" releases HLS memory.
  const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?time=1&width=640`;
  const showPlayer = shouldLoad && active;

  const video = (
    <div className="project-media">
      <div
        ref={containerRef}
        className="project-image project-img-wrap"
        style={{
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          background: "var(--color-placeholder)",
          aspectRatio,
          position: "relative",
          width: "100%",
        }}
      >
        <img
          src={posterUrl}
          alt=""
          aria-hidden
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: showPlayer ? 0 : 1,
            transition: "opacity 180ms var(--spring-panel)",
            pointerEvents: "none",
          }}
        />
        {showPlayer && (
          <MuxPlayer
            ref={playerRef}
            playbackId={playbackId}
            autoPlay="muted"
            loop
            muted
            playsInline
            nohotkeys
            poster={posterUrl}
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
        )}
      </div>
    </div>
  );

  const linkStyle = { textDecoration: "none", display: "block" } as const;
  // Blue northeast arrow only when the card leaves the site — derived from
  // href, not a hard-coded project id.
  const external = /^(https?:|mailto:|tel:)/i.test(href);

  return (
    <div className="project-card project-card--video" style={{ gap: dk.cardGap }}>
      <ProjectCardLift style={{ gap: dk.cardGap }}>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{video}</a>
        ) : (
          <Link href={href} prefetch style={linkStyle}>{video}</Link>
        )}
        <CardLabel title={title} sub={sub} labelFontSize={dk.labelFontSize} external={external} />
      </ProjectCardLift>
    </div>
  );
}
