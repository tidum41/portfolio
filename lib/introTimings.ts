// Shared mutable intro timing config — "Fast cinematic" (Nov 18, 2026, see
// design/RULES.md). Updated by IntroDials whenever dials change; read by
// components on replay. First-load intro only: the global ENTRANCE_DEFAULTS
// (lib/motion.ts) are deliberately untouched.
export const introTimings = {
  patternDuration: 0.9,  // s — PS3Silk swell, floor → full (ease-out cubic)
  heroDelay:       0.15, // s — when H1 starts fading in
  heroDuration:    0.8,  // s — H1 + subtitle fade/rise duration
  subDelay:        0.5,  // s — when the subtitle starts fading in
  gateDuration:    0.9,  // s — when intro-done fires (matches patternDuration)
};

/** Shader opacity (0..1 of resting) on the first drawn silk frame. The old
 *  intro started at 0 and eased in, so the first ~500ms read as black. */
export const INTRO_SILK_FLOOR = 0.4;

/** Reduced-motion silk fade (ms). Also the reduced-motion intro gate. */
export const INTRO_REDUCED_MS = 350;

/** Safety net if the silk never signals completion (WebGL failure, a very
 *  slow shader compile). Must stay above gateDuration. */
export const INTRO_FAILSAFE_MS = 1800;

/** Quiet window after `intro-done` before idle prefetch / HLS warm-up start:
 *  the grid reveal (stagger spread + card duration) plus a little slack. */
export const INTRO_POST_GATE_SETTLE_MS = 1300;

/** Nav / footer fade once the gate lifts (CSS, mirrored in app/layout.tsx and
 *  app/globals.css). */
export const INTRO_NAV_FADE_S = 0.45;

/** First-load grid + control-panel reveal. Passed to EntranceItem / the
 *  "Entrance" dial panel as `defaults`, never written into ENTRANCE_DEFAULTS. */
export const INTRO_ENTRANCE_DEFAULTS = {
  duration: 0.7,
  stagger: 0.1,
  // stagger × (cards − 1): the global 0.28 cap would squash 0.1s to ~0.05s.
  maxSpread: 0.6,
};
