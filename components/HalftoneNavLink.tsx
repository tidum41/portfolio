"use client";

import Link from "next/link";
import { motion, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { HalftoneFilterDef } from "./HalftoneFilterDef";
import { useHalftoneMorph } from "./useHalftoneMorph";

export default function HalftoneNavLink({ href, label, isActive, dk }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseColor = isActive ? "var(--color-text-primary)" : "var(--color-text-muted)";
  const hoverColor = "var(--color-text-primary)"; // Or read from dk
  // isHovered drives desktop; isTapped (pointerdown → pointerup/cancel/leave)
  // is the touch equivalent — there's no hover state on mobile to piggyback
  // on, so activation needs its own explicit touch-and-hold trigger. If
  // it's already the active page, don't show the effect either way.
  const active = !isActive && (isHovered || isTapped) && dk.enabled;
  const { filterId, t } = useHalftoneMorph(dk, active);

  // Both layers' opacity/scale are pure functions of the same `t` that also
  // drives the filter's own dot/blur/threshold sweep (see HalftoneFilterDef)
  // — the overlay is never a static end-state fading in, it's visibly
  // changing shape as it becomes visible, which is what actually reads as a
  // morph instead of a crossfade.
  const baseOpacity = useTransform(t, [0, 1], [1, 0]);
  const baseScale = useTransform(t, [0, 1], [1, dk.hoverScaleBase ?? 1]);
  // Uses |t|, not t, and a floor above 0 — the deliberately underdamped
  // "out" spring (see Nav.tsx) sends t slightly negative as it settles, and
  // without abs() this layer would clamp near-invisible for exactly that
  // window, hiding the bubble effect the undershoot is there to produce.
  // The floor itself avoids a rasterization cold-start flicker the first
  // time this layer becomes visible again, same guard the original
  // crossfade used.
  const overlayOpacity = useTransform(t, (v) => Math.max(Math.abs(v) * 1.5, 0.0001));
  const overlayScale = useTransform(t, [0, 1], [1, dk.hoverScaleHalf ?? 1]);

  return (
    <Link
      href={href}
      prefetch
      aria-current={isActive ? "page" : undefined}
      className="nav-link"
      style={{
        position: "relative",
        textDecoration: "none",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: "24px",
        outline: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      // A real tap fires pointerup (often <150ms after pointerdown) and then
      // click/navigation almost immediately after that — well before the
      // ~200ms "in" spring has become visible. Resetting isTapped on
      // pointerup cut the effect off before it could ever be seen. Instead,
      // leave it active through the tap: navigating flips `isActive` true
      // for this link, which naturally deactivates it via the `!isActive`
      // gate above once the new page renders. The timeout is just a
      // failsafe in case navigation doesn't happen (e.g. a modifier-click
      // opening a new tab), so this can't get stuck active forever.
      onPointerDown={() => {
        setIsTapped(true);
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => setIsTapped(false), 1000);
      }}
      onPointerCancel={() => {
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        setIsTapped(false);
      }}
    >
      {/* SVG Filter Definition */}
      <HalftoneFilterDef id={filterId} dk={dk} hoverColor={hoverColor} t={t} />

      {/* Base Text (Solid) */}
      <motion.span
        style={{
          opacity: baseOpacity,
          scale: baseScale,
          color: baseColor,
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          willChange: "transform, opacity",
        }}
      >
        {label}
      </motion.span>

      {/* Halftone Overlay Text (Filtered) */}
      <motion.span
        aria-hidden
        style={{
          opacity: overlayOpacity,
          scale: overlayScale,
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",

          // Apply the SVG Filter
          filter: `url(#${filterId})`,

          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center", // ensure alignment matches

          color: hoverColor, // fallback/source color
          willChange: "transform, opacity, filter",
        }}
      >
        {label}
      </motion.span>
    </Link>
  );
}
