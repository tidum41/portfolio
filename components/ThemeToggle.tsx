"use client";
import { useEffect, useRef, useState } from "react";
import { HalftoneDotField } from "./HalftoneDotField";
import { SUN_MASK_SVG, MOON_MASK_SVG, SUN_CLONE_INNER, MOON_CLONE_INNER } from "./halftoneIconMasks";
import { useHalftoneMorph } from "./useHalftoneMorph";
import { useIsMobile } from "./useIsMobile";
import { motion, useReducedMotion } from "framer-motion";

const ICON_SIZE = 15;

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle({ dk }: { dk?: any }) {
  const [isDark, setIsDark] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const baseColor = "var(--color-text-muted)";
  const hoverColor = "var(--color-text-primary)";
  // isHovered drives desktop. isTapped is the touch equivalent, but unlike
  // HalftoneNavLink this button never navigates away, so there's no
  // "isActive flips true" event to naturally end it — a real tap's
  // pointerup fires almost immediately (often <150ms), well before the
  // ~200ms "in" spring becomes visible, so tying deactivation to it would
  // cut the effect off before it's ever seen. Instead this plays as a
  // fixed-duration one-shot flash, timed in the pointerdown handler below.
  // Active is when hovered/tapped on desktop. On mobile, inactive (untapped) is halftoned.
  // dk.keepEffectOn (DialKit dev panel) pins the effect active regardless
  // of real hover/tap — see HalftoneNavLink.tsx's matching comment for why.
  const active = !!dk?.enabled && (!!dk?.keepEffectOn || isHovered || isTapped);
  const { filterId, t } = useHalftoneMorph(dk, active);

  // Fixed-duration, active-driven crossfade — NOT derived from `t`. See
  // useHalftoneMorph.ts's doc comment: base and overlay always share this
  // exact duration and start together, a strict complementary pair, which
  // is what guarantees the crisp icon and the halftone dots are never both
  // substantially gone at once.
  const crossfadeMs = reduced ? 1 : active ? (dk?.showHideSpeed?.showDurationMs ?? 220) : (dk?.showHideSpeed?.hideDurationMs ?? 550);
  const crossfadeTransition = { duration: crossfadeMs / 1000, ease: "easeInOut" as const };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved !== "light";
    setIsDark(dark);
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    const theme = newDark ? "dark" : "light";
    const html = document.documentElement;
    html.classList.add("theme-switching");
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    setTimeout(() => html.classList.remove("theme-switching"), 300);
  };

  // Reduced-motion: keep the opacity crossfade (aids comprehension), drop
  // scale and blur (position/filter changes removed per prefers-reduced-motion).
  const spring = reduced
    ? { duration: 0.15 }
    : { type: "spring" as const, duration: 0.3, bounce: 0 };

  const visibleAnim   = { opacity: 1, scale: 1,                       filter: "blur(0px)" };
  const hiddenAnim    = { opacity: 0, scale: reduced ? 1 : 0.25,      filter: reduced ? "blur(0px)" : "blur(4px)" };

  return (
    <button
      onClick={toggle}
      // Guarded like VolumeControl.tsx's onEnter — without this, a tap on
      // touch devices can trigger a synthetic mouseenter with no matching
      // mouseleave ever firing (no cursor to leave), leaving isHovered
      // stuck true forever and the icon permanently dimmed/halftoned.
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      onPointerDown={() => {
        setIsTapped(true);
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => setIsTapped(false), 350);
      }}
      onPointerCancel={() => {
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        setIsTapped(false);
      }}
      className="nav-link theme-toggle-btn"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        lineHeight: 0,
        WebkitTapHighlightColor: "transparent",
        // Fixed size so stacked absolute icons don't shift layout
        position: "relative",
        width: ICON_SIZE,
        height: ICON_SIZE,
      }}
    >
      {/* Base Icon */}
      <motion.div
        style={{ position: "absolute", inset: 0, color: baseColor, willChange: "opacity" }}
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={crossfadeTransition}
      >
        <motion.span
          aria-hidden
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={false}
          animate={isDark ? visibleAnim : hiddenAnim}
          transition={spring}
        >
          <SunIcon />
        </motion.span>
        <motion.span
          aria-hidden
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={false}
          animate={isDark ? hiddenAnim : visibleAnim}
          transition={spring}
        >
          <MoonIcon />
        </motion.span>
      </motion.div>

      {/* Halftone Overlay Icon (independently-animated dots, see HalftoneDotField) */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          willChange: "opacity"
        }}
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={crossfadeTransition}
      >
        <motion.span
          aria-hidden
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={false}
          animate={isDark ? visibleAnim : hiddenAnim}
          transition={spring}
        >
          <HalftoneDotField id={filterId + "-sun"} dk={dk} hoverColor={hoverColor} t={t} content={{ type: "icon", svgMarkup: SUN_MASK_SVG, sizeCss: ICON_SIZE, cloneInner: SUN_CLONE_INNER }} />
        </motion.span>
        <motion.span
          aria-hidden
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={false}
          animate={isDark ? hiddenAnim : visibleAnim}
          transition={spring}
        >
          <HalftoneDotField id={filterId + "-moon"} dk={dk} hoverColor={hoverColor} t={t} content={{ type: "icon", svgMarkup: MOON_MASK_SVG, sizeCss: ICON_SIZE, cloneInner: MOON_CLONE_INNER }} />
        </motion.span>
      </motion.div>
    </button>
  );
}
