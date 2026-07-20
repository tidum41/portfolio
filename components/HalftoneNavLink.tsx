"use client";

import Link from "next/link";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { HalftoneDotField } from "./HalftoneDotField";
import { useHalftoneMorph } from "./useHalftoneMorph";
import { useIsMobile } from "./useIsMobile";

// Shared between the base span's own inline style and the dot-field's mask
// bake, so the two can't drift apart (see useHalftoneMorph.ts's comment on
// how exactly this kind of duplication caused the old opacity bug).
// lineHeightPx matters for alignment too — the bake uses it to reproduce
// the exact baseline position CSS line-height centering puts the real text
// at, see halftoneMask.ts's buildTextMask.
const TEXT_STYLE = { fontWeight: 400, fontSizePx: 16, lineHeightPx: 24 };

export default function HalftoneNavLink({ href, label, isActive, dk }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseColor = isActive ? "var(--color-text-primary)" : "var(--color-text-muted)";
  const hoverColor = "var(--color-text-primary)"; // Or read from dk
  const isMobile = useIsMobile();
  
  // isHovered drives desktop; isTapped (pointerdown → pointerup/cancel/leave)
  // is the touch equivalent — there's no hover state on mobile to piggyback
  // on, so activation needs its own explicit touch-and-hold trigger. If
  // it's already the active page, don't show the effect either way.
  // ON MOBILE: Invert the logic. Inactive = Halftone on, Active = Solid off.
  // Tap triggers the solid state temporarily before navigation.
  // dk.keepEffectOn (DialKit dev panel) forces the effect active regardless
  // of real hover/tap — including overriding the !isActive gate, since
  // without that override the current page's own nav link would stay
  // permanently untunable while standing on it. Lets the mouse move to the
  // (separately positioned) DialKit panel and drag a slider while the
  // effect stays pinned visible, instead of losing hover the moment the
  // cursor leaves this link.
  const active = dk.enabled ? (dk.keepEffectOn || (!isActive && (isHovered || isTapped))) : false;

  const { filterId, t } = useHalftoneMorph(dk, active);
  const reduced = useReducedMotion();

  // Scale is still a pure function of the same `t` that drives the dot
  // field's own per-dot sweep (see HalftoneDotField) — the overlay is never a
  // static end-state fading in, it's visibly changing shape as it becomes
  // visible, which is what actually reads as a morph instead of a crossfade.
  const baseScale = useTransform(t, [0, 1], [1, dk.bouncePhysics?.textEndScale ?? 1]);
  const overlayScale = useTransform(t, [0, 1], [1, dk.bouncePhysics?.dotsEndScale ?? 1]);

  // Fixed-duration, active-driven crossfade — NOT derived from `t`. See
  // useHalftoneMorph.ts's doc comment: base and overlay always share this
  // exact duration and start together, a strict complementary pair
  // (opacity: active?0:1 vs active?1:0), which is what guarantees the crisp
  // text and the halftone dots are never both substantially gone at once.
  // Reduced-motion collapses it to a near-instant swap (kept nonzero, not
  // 0, so it still reads as a crossfade rather than a hard cut).
  const crossfadeMs = reduced ? 1 : active ? (dk?.showHideSpeed?.showDurationMs ?? 220) : (dk?.showHideSpeed?.hideDurationMs ?? 550);
  const crossfadeTransition = { duration: crossfadeMs / 1000, ease: "easeInOut" as const };

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
        userSelect: "none",
        WebkitTapHighlightColor: "transparent"
      }}
      // Guarded like VolumeControl.tsx's onEnter — without this, a tap on
      // touch devices can trigger a synthetic mouseenter with no matching
      // mouseleave ever firing (no cursor to leave), leaving isHovered
      // stuck true forever and the link permanently dimmed/halftoned.
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setIsHovered(true);
      }}
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
      {/* Base Text (Solid) */}
      <motion.span
        style={{
          scale: baseScale,
          color: baseColor,
          fontWeight: TEXT_STYLE.fontWeight,
          fontSize: TEXT_STYLE.fontSizePx,
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          willChange: "transform, opacity",
        }}
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={crossfadeTransition}
      >
        {label}
      </motion.span>

      {/* Halftone Overlay (independently-animated dots, see HalftoneDotField) */}
      <motion.span
        aria-hidden
        style={{
          scale: overlayScale,
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={crossfadeTransition}
      >
        <HalftoneDotField
          id={filterId}
          dk={dk}
          hoverColor={hoverColor}
          t={t}
          content={{ type: "text", text: label, fontWeight: TEXT_STYLE.fontWeight, fontSizePx: TEXT_STYLE.fontSizePx, lineHeightPx: TEXT_STYLE.lineHeightPx }}
        />
      </motion.span>
    </Link>
  );
}
