/**
 * Recording stages for the /dialogue demos (app/dialogue/motion, scripts/record-dialogue-motion.mjs).
 * P16, one visual system: every panel renders at zoom 1.0 (the real 423px chat panel) with a 56px well gutter on
 * every side. 56px also clears the play button (44px at an 8px inset). Stages are 1:1; the two annotated takes are
 * 4:3 with a 176px right gutter that holds the note. First try and kept share one stage so they read as before and after.
 */
export const STAGE_PANEL_W = 423;
export const STAGE_GUTTER = 56;
export const STAGE_NOTE_GUTTER = 176;

export const STAGES = {
  hero: { shape: "square", tone: "solution", note: false },
  side: { shape: "square", tone: "solution", note: false },
  clip: { shape: "square", tone: "solution", note: false },
  before: { shape: "wide", tone: "problem", note: true },
  every: { shape: "square", tone: "problem", note: false },
  picker: { shape: "square", tone: "problem", note: false },
  toggles: { shape: "square", tone: "solution", note: false },
  thin: { shape: "wide", tone: "system", note: true },
} as const;
export type MotionDemo = keyof typeof STAGES;
export const MOTION_DEMOS = Object.keys(STAGES) as MotionDemo[];
/** Frame geometry in css px. Square: 535 x 535. Wide (annotated): 655 x 491, 4:3. */
export function stageBox(d: MotionDemo) {
  const note = STAGES[d].note;
  const w = STAGE_GUTTER + STAGE_PANEL_W + (note ? STAGE_NOTE_GUTTER : STAGE_GUTTER);
  const h = STAGES[d].shape === "square" ? w : Math.round((w * 3) / 4);
  return { w, h, top: STAGE_GUTTER, panelH: h - 2 * STAGE_GUTTER, note };
}

const FILES: Record<string, MotionDemo> = {
  "live-hero-ask": "hero", "live-side": "side", "live-clip": "clip", "variant-before-full": "before",
  "variant-every-full": "every", "variant-picker-full": "picker", "variant-toggles-full": "toggles", "live-thin": "thin",
};
/** CSS aspect-ratio of a recording, from its file name, so the video box always matches the take (no crop, no letterbox). */
export function recordingAspect(src: string): string | undefined {
  const name = src.split("/").pop()?.replace(/(-dark)?\.(mp4|jpg)$/, "") ?? "";
  const d = FILES[name];
  if (!d) return undefined;
  const b = stageBox(d);
  return `${b.w} / ${b.h}`;
}
