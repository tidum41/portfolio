/**
 * Dialogue — local draft case study. Not on the homepage grid.
 * Route: /dialogue
 * Raster paths are fcc87a2 / round-18 approved PNGs only (no post-cutoff assets).
 */

export const DIALOGUE_DRAFT = true;

export const DIALOGUE_TITLE = "Answers you can pinpoint";

/** Hero uses fcc87a2 approved frame (section-6.png). */
export const DIALOGUE_HERO_SRC = "/dialogue/section-6.png";

/** Intrinsic pixel size of approved round-18 / fcc87a2 section PNGs (all 1600×1000). */
export const DIALOGUE_RASTER_WIDTH = 1600;
export const DIALOGUE_RASTER_HEIGHT = 1000;

export const DIALOGUE_IMAGES = {
  /** DecisionBlock: closest approved stand-ins for post-cutoff alt frames */
  altParagraphs: "/dialogue/section-1.png",
  altQuoteList: "/dialogue/section-2.png",
  altStructured: "/dialogue/section-4.png",
  problemBefore: "/dialogue/section-1.png",
  problemAfter: "/dialogue/section-1.png",
  answerShapes: "/dialogue/section-2.png",
  anatomy: "/dialogue/section-3.png",
  proofSolution: "/dialogue/section-4.png",
  clipsSolution: "/dialogue/section-5.png",
  dockedSidebar: "/dialogue/section-6b.png",
  floatingBubble: "/dialogue/section-6.png",
  fullAnswer: "/dialogue/section-7.png",
} as const;
