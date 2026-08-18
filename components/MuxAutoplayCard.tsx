"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { useDialKit } from "dialkit";
import { motion } from "framer-motion";
import { CARD_HOVER_SPRING, CARD_HOVER_SCALE } from "./cardHover";

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
  /** Opt out of the hover press-in scale — e.g. an external-link card that
   *  redirects immediately doesn't benefit from the "press and settle" feel. */
  hoverScale?: boolean;
}

export default function MuxAutoplayCard({ playbackId, href, title, sub, aspectRatio, active = true, hoverScale = true }: Props) {
  const dk = useDialKit("ProjectCard", {
    cardRadius:    [4,  0, 24],
    cardGap:       [6,  0, 24],
    labelFontSize: [18, 10, 32],
  });

  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // A CDN thumbnail so the card always shows a frame — even if playback is
  // blocked (e.g. iOS Low Power Mode) or hasn't started yet — instead of a
  // flat placeholder rectangle. Matches MuxHero's approach.
  const poster = `https://image.mux.com/${playbackId}/thumbnail.webp`;

  // Only drive playback while the card is on/near screen. Browsers cap how many
  // videos can decode simultaneously; gating on visibility keeps a grid full of
  // autoplaying videos from starving each other so some never "render in".
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px 200px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const shouldPlay = active && inView;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (!shouldPlay) {
      player.pause?.();
      return;
    }

    let cancelled = false;
    const attempt = () => {
      const p = playerRef.current?.play?.();
      // Swallow the rejection here — autoplay may be blocked (iOS Low Power
      // Mode / strict autoplay). Recovery is handled by the gesture listeners.
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    attempt();

    // If autoplay was blocked, resume on the first real user interaction
    // anywhere on the page — muted playback is always permitted post-gesture.
    const onGesture = () => {
      if (cancelled) return;
      if (shouldPlay && playerRef.current?.paused) attempt();
    };
    const opts: AddEventListenerOptions = { passive: true, capture: true };
    const events = ["pointerdown", "touchstart", "keydown", "click"] as const;
    events.forEach((e) => window.addEventListener(e, onGesture, opts));

    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, onGesture, opts));
    };
  }, [shouldPlay]);

  const video = (
    <div ref={cardRef} className="project-image project-img-wrap" style={{ borderRadius: dk.cardRadius, overflow: "hidden", background: "var(--color-placeholder)", aspectRatio, position: "relative", width: "100%" }}>
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        poster={poster}
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
    <motion.div
      className="project-card"
      {...(hoverScale ? { whileHover: { scale: CARD_HOVER_SCALE }, transition: CARD_HOVER_SPRING } : {})}
      style={{ display: "flex", flexDirection: "column", gap: dk.cardGap }}
    >
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{video}</a>
      ) : (
        <Link href={href} prefetch style={linkStyle}>{video}</Link>
      )}
      <CardLabel title={title} sub={sub} labelFontSize={dk.labelFontSize} />
    </motion.div>
  );
}
