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

// Page spawn does not scale (Mux letterboxes; type reads as a glitch).
export const XMB_ENTRANCE_SCALE = 1;

/** Resting / reduced-motion transform for spawn items. */
export const SPAWN_REST = "translate(0px, 0px)";

/** Hidden opacity for spawn — never 0, so a skipped tween cannot hide content. */
export const SPAWN_FROM_OPACITY = 0.4;

export function spawnHidden(x: number, y: number): string {
  return `translate(${x}px, ${y}px)`;
}

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
  x: number;          // px, unused (always 0) — kept so DialKit can still expose it
  y: number;          // px, slide-up distance
  duration: number;   // s, per-item
  stagger: number;    // s, delay increment between items
  maxSpread: number;  // s, cap on total stagger spread regardless of item count
  /** Always 1 for page content — scale on cards/type reads as a glitch. */
  scale: number;
  /** Animation `from` opacity. Resting state stays 1. */
  fromOpacity?: number;
}

// XMB-like column focus: fade + short settle, no scale. Snappier than the
// original 450ms Framer page spawn so Work↔About↔Archive doesn't feel late.
export const ENTRANCE_DEFAULTS: EntranceDefaults = {
  x: 0,
  y: 12,
  duration: 0.28,
  stagger: 0.04,
  maxSpread: 0.24,
  scale: 1,
};

// Case-study open — type only. Media is instant. CSS in globals.css
// `.cs-open-type` (keep those numbers in sync). Tuned in /dev/motion-lab.
export const CASE_STUDY_ENTRANCE_DEFAULTS: EntranceDefaults = {
  x: 0,
  y: 8,
  duration: 1.14,
  stagger: 0.15,
  maxSpread: 0.28,
  scale: 1,
  fromOpacity: 0.29,
};
