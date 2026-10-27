/**
 * Dialogue — local draft case study. Not on the homepage grid.
 * Route: /dialogue
 * Raster paths: round-34 approved PNGs in public/dialogue/.
 */

import manifest from "@/lib/caseStudies/dialogueRasterManifest.json";

export const DIALOGUE_DRAFT = true;

export const DIALOGUE_TITLE = "Interactive insights for UX research teams";

/** Kept as the hero subline under the H1. */
export const DIALOGUE_SUBTITLE = "I designed the study chat so every answer shows the interviews behind it";

/** Hero uses round-34 section-6 frame. */
export const DIALOGUE_HERO_SRC = "/dialogue/section-6.png";

export type DialogueSectionKey = keyof typeof manifest.sections;

export function dialogueRasterSizeForSection(key: DialogueSectionKey): { width: number; height: number } {
  const s = manifest.sections[key];
  return { width: s.width, height: s.height };
}

/** Intrinsic pixel size for a committed `/dialogue/section-*.png` path. */
export function dialogueRasterSizeForPublicPath(publicPath: string): { width: number; height: number } {
  const match = publicPath.match(/\/dialogue\/section-(\d+[ab]?)\.png$/);
  if (!match) {
    throw new Error(`Unknown dialogue raster path: ${publicPath}`);
  }
  const key = match[1] as DialogueSectionKey;
  return dialogueRasterSizeForSection(key);
}

export const DIALOGUE_IMAGES = {
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
