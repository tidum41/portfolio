// Canonical motion tokens for the site's route/reveal language — smooth,
// physical "settle," snappy dismissal. Reused across AnimationProvider,
// GridFirstLoad, ScrollReveal, and HeroText so every entrance/exit reads as
// part of one considered motion language instead of independently-tuned
// one-offs. Mirrors app/globals.css's --spring-panel custom property — keep
// both in sync if either changes.

export type CubicBezier = [number, number, number, number];

export const EASE_OPACITY: CubicBezier = [0.16, 1, 0.3, 1];   // == --spring-panel
export const EASE_Y:       CubicBezier = [0.22, 1, 0.36, 1];  // "settle" curve
export const EASE_EXIT:    CubicBezier = [0.4, 0, 1, 1];      // fast, simple dismissal
export const EASE_EXPAND:  CubicBezier = [0.25, 0, 0, 1];     // == --expand-ease / PS3ControlPanel

export const cssEase = (c: CubicBezier) => `cubic-bezier(${c.join(",")})`;

// XMB icons shrink slightly when unselected. Page entrances use the same
// "settle into focus" scale — not a bounce, not a pop.
export const XMB_ENTRANCE_SCALE = 0.97;

export const PANEL_DURATION = {
  backdrop: { enter: 0.22, exit: 0.16 },
  panel:    { enter: 0.26, exit: 0.16 },
  embed:    { enter: 0.22, exit: 0.16 },
} as const;

export const DURATION = {
  routeExit:         0.16,
  // Fast, opacity-only — every route's above-the-fold content owns its own
  // richer entrance (EntranceStagger/EntranceItem), so the page crossfade
  // just needs to swap without a visible cut, not carry any "personality"
  // of its own, or it'd compete with the inner stagger.
  routeEnterFast:    0.18,
} as const;

export interface EntranceDefaults {
  y: number;          // px, slide-up distance
  duration: number;   // s, per-item
  stagger: number;    // s, delay increment between items
  maxSpread: number;  // s, cap on total stagger spread regardless of item count
  /** 1 = no scale (body type). Icon-like tiles use XMB_ENTRANCE_SCALE. */
  scale: number;
}

// Content entrance: fade-up + slide-up, staggered.
// Shared by the work-page grid, about page, and BentoGallery — BentoGallery
// reads the matching dialkit key ("Entrance") directly rather than importing
// this object, since it stays framer-motion-free, but the numbers here are
// the single source of truth for what those live-tunable defaults should be.
export const ENTRANCE_DEFAULTS: EntranceDefaults = {
  y: 20,
  duration: 0.45,
  stagger: 0.05,
  maxSpread: 0.4,
  scale: XMB_ENTRANCE_SCALE,
};

// Case-study open — type only. Media is instant (autoplay + readability).
// Under 300ms, ease-out, no scale on titles (XMB scale is for icons).
export const CASE_STUDY_ENTRANCE_DEFAULTS: EntranceDefaults = {
  y: 6,
  duration: 0.22,
  stagger: 0.045,
  maxSpread: 0.14,
  scale: 1,
};
