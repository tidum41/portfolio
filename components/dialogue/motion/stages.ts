/**
 * Recording stages for the /dialogue demos (app/dialogue/motion, scripts/record-dialogue-motion.mjs).
 * Every stage is the 423px panel with 48px of well on the left, top and bottom and a 176px well gutter on the right.
 * The gutter holds the static annotations and keeps the play button off the panel at every width
 * (176/647 of the video width is at least 52px, the button plus its 8px inset, from 192px wide up).
 */
export const STAGE_PANEL_W = 423;
export const STAGE_AIR = 48;
export const STAGE_GUTTER = 176;
export const STAGE_W = STAGE_AIR + STAGE_PANEL_W + STAGE_GUTTER;

export const STAGES = {
  hero: { ratio: 1, tone: "solution", zoom: 1 },
  side: { ratio: 1, tone: "solution", zoom: 0.92 },
  clip: { ratio: 0.8, tone: "solution", zoom: 0.88 },
  before: { ratio: 0.75, tone: "problem", zoom: 1 },
  // Tall enough that each side opens its people and clip without the panel scrolling; the card never shifts.
  every: { ratio: 1.5, tone: "problem", zoom: 0.88 },
  picker: { ratio: 1, tone: "problem", zoom: 0.8 },
  // Insight, Chart, People, Source; the body eases down slowly when the clip opens.
  toggles: { ratio: 1.1, tone: "solution", zoom: 0.88 },
  thin: { ratio: 1.1, tone: "system", zoom: 0.88 },
} as const;
export type MotionDemo = keyof typeof STAGES;
export const MOTION_DEMOS = Object.keys(STAGES) as MotionDemo[];
export const stageHeight = (d: MotionDemo) => Math.round(519 * STAGES[d].ratio);

const FILES: Record<string, MotionDemo> = {
  "live-hero-ask": "hero", "live-side": "side", "live-clip": "clip", "variant-before-full": "before",
  "variant-every-full": "every", "variant-picker-full": "picker", "variant-toggles-full": "toggles", "live-thin": "thin",
};
/** CSS aspect-ratio of a recording, from its file name, so the video box always matches the take (no crop, no letterbox). */
export function recordingAspect(src: string): string | undefined {
  const name = src.split("/").pop()?.replace(/(-dark)?\.(mp4|jpg)$/, "") ?? "";
  const d = FILES[name];
  return d ? `${STAGE_W} / ${stageHeight(d)}` : undefined;
}
