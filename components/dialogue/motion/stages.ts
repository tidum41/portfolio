/**
 * Recording stages for the /dialogue demos (app/dialogue/motion, scripts/record-dialogue-motion.mjs).
 * Plain stage: the 423px panel with 48px of well left, right and bottom, and 104px on top so the play button
 * (44px, 8px inset) clears the panel down to a 257px-wide video (104/519 x 257 = 52).
 * Annotated stage (only where the point would be missed without a note): 48px on top and a 176px well gutter on the
 * right that holds the note and the play button (176/647 x 257 = 70).
 */
export const STAGE_PANEL_W = 423;
export const STAGE_AIR = 48;
export const STAGE_TOP_PLAIN = 104;
export const STAGE_GUTTER = 176;

export const STAGES = {
  hero: { ratio: 1, tone: "solution", zoom: 1, note: false },
  side: { ratio: 1, tone: "solution", zoom: 0.92, note: false },
  clip: { ratio: 0.8, tone: "solution", zoom: 0.88, note: false },
  before: { ratio: 0.75, tone: "problem", zoom: 1, note: true },
  // Tall enough that each side opens its people and clip without the panel scrolling; the card never shifts.
  every: { ratio: 1.5, tone: "problem", zoom: 0.88, note: false },
  picker: { ratio: 1, tone: "problem", zoom: 0.8, note: false },
  // Insight, Chart, People, Source; the body eases down slowly when the clip opens.
  toggles: { ratio: 1.1, tone: "solution", zoom: 0.88, note: false },
  thin: { ratio: 1.1, tone: "system", zoom: 0.88, note: true },
} as const;
export type MotionDemo = keyof typeof STAGES;
export const MOTION_DEMOS = Object.keys(STAGES) as MotionDemo[];
/** Frame geometry in css px: panel box height stays 519 x ratio - 96, as before; only the well around it changes. */
export function stageBox(d: MotionDemo) {
  const note = STAGES[d].note;
  const top = note ? STAGE_AIR : STAGE_TOP_PLAIN;
  const panelH = Math.round(519 * STAGES[d].ratio) - 2 * STAGE_AIR;
  return { w: STAGE_AIR + STAGE_PANEL_W + (note ? STAGE_GUTTER : STAGE_AIR), h: top + panelH + STAGE_AIR, top, panelH, note };
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
