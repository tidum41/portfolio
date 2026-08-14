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
// XMB column-focus: same ease on fade + settle so they read as one glide.
export const EASE_ENTRANCE: CubicBezier = [0.23, 1, 0.32, 1];

export const cssEase = (c: CubicBezier) => `cubic-bezier(${c.join(",")})`;

// Page spawn does not scale. Column-focus enter is fade + settle-up.
export const XMB_ENTRANCE_SCALE = 1;

/** Resting / reduced-motion transform for spawn items. */
export const SPAWN_REST = "translate(0px, 0px)";

/** Hidden opacity for spawn — never 0, so a skipped tween cannot hide content.
 *  Dim enough to read as XMB unfocused → focused, still visible if a tween skips. */
export const SPAWN_FROM_OPACITY = 0.12;

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

/** XMB column focus — destination fades in as one CSS layer. Previous
 *  page is display:none immediately so two documents never composite. */
export const PAGE_FOCUS = {
  inMs: 400,
  y: 8,
  fromOpacity: 0.2,
  ease: [0.23, 1, 0.32, 1] as CubicBezier,
} as const;

export interface EntranceDefaults {
  x: number;          // px, unused for column-focus (always 0)
  y: number;          // px, slight settle-up
  duration: number;   // s, per-item
  stagger: number;    // s, delay increment between items
  maxSpread: number;  // s, cap on total stagger spread regardless of item count
  /** Always 1 for page content — scale on cards/type reads as a glitch. */
  scale: number;
}

// Column-focus enter — XMB unfocused → focused. Fade does the character;
// a little extra travel + a longer ease-out tail keeps it graceful.
export const ENTRANCE_DEFAULTS: EntranceDefaults = {
  x: 0,
  y: 16,
  duration: 0.36,
  stagger: 0.06,
  maxSpread: 0.18,
  scale: 1,
};

// Case-study open — type only. Media is instant (autoplay + readability).
// Under 300ms, ease-out, no scale on titles (XMB scale is for icons).
export const CASE_STUDY_ENTRANCE_DEFAULTS: EntranceDefaults = {
  x: 0,
  y: 6,
  duration: 0.22,
  stagger: 0.045,
  maxSpread: 0.14,
  scale: 1,
};
