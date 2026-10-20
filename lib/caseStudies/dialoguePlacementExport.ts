import { studyPlayerBlockTopY } from "@/lib/caseStudies/dialogueStudyPlacementLayout";

/**
 * Dialogue placement moment tiles (section-6 / section-6b).
 * Keep export math in one place for capture scripts and layout audits.
 */

/** @2x Moment pair export (4:3) */
export const PLACEMENT_TILE_WIDTH = 1600;
export const PLACEMENT_TILE_HEIGHT = 1200;

export const PLACEMENT_TILE_BG = "#F6F4F1";

/** Composed subject (host + assistant) should fill this much of the full tile, centered. */
export const PLACEMENT_SUBJECT_WIDTH_RATIO = 0.8;
export const PLACEMENT_SUBJECT_HEIGHT_RATIO = 0.8;

export const PLACEMENT_SUBJECT_BOX_WIDTH = Math.round(
  PLACEMENT_TILE_WIDTH * PLACEMENT_SUBJECT_WIDTH_RATIO,
);
export const PLACEMENT_SUBJECT_BOX_HEIGHT = Math.round(
  PLACEMENT_TILE_HEIGHT * PLACEMENT_SUBJECT_HEIGHT_RATIO,
);

/**
 * Design-time layout (px) before scale-to-fit. Same bbox for docked + floating.
 * Aspect matches the 80% subject box (1280×960) so scale fills width and height.
 */
export const PLACEMENT_LAYOUT_HEIGHT = 740;
export const PLACEMENT_SIDEBAR_WIDTH = 300;
export const PLACEMENT_LAYOUT_WIDTH = Math.round(
  (PLACEMENT_SUBJECT_BOX_WIDTH / PLACEMENT_SUBJECT_BOX_HEIGHT) * PLACEMENT_LAYOUT_HEIGHT,
);
export const PLACEMENT_STUDY_WIDTH_DOCKED = PLACEMENT_LAYOUT_WIDTH - PLACEMENT_SIDEBAR_WIDTH;

export const PLACEMENT_COMPOSITION_SCALE = Math.min(
  PLACEMENT_SUBJECT_BOX_WIDTH / PLACEMENT_LAYOUT_WIDTH,
  PLACEMENT_SUBJECT_BOX_HEIGHT / PLACEMENT_LAYOUT_HEIGHT,
);

export const PLACEMENT_COMPOSITION_WIDTH = PLACEMENT_LAYOUT_WIDTH * PLACEMENT_COMPOSITION_SCALE;
export const PLACEMENT_COMPOSITION_HEIGHT = PLACEMENT_LAYOUT_HEIGHT * PLACEMENT_COMPOSITION_SCALE;

export const PLACEMENT_TILE_MARGIN_LEFT = (PLACEMENT_TILE_WIDTH - PLACEMENT_COMPOSITION_WIDTH) / 2;
export const PLACEMENT_TILE_MARGIN_TOP = (PLACEMENT_TILE_HEIGHT - PLACEMENT_COMPOSITION_HEIGHT) / 2;

export type PlacementVariant = "docked" | "floating";

/** Floating chat stack: panel sits over transcript only; launcher stays bottom-right. */
export const PLACEMENT_FLOATING_LAUNCHER_SIZE = 50;
export const PLACEMENT_FLOATING_LAUNCHER_GAP = 10;
export const PLACEMENT_FLOATING_EDGE = 14;
/** Overlap the player on the right; full answer card must fit below. */
export const PLACEMENT_FLOATING_CHAT_TOP = studyPlayerBlockTopY();
export const PLACEMENT_FLOATING_PANEL_BOTTOM =
  PLACEMENT_FLOATING_EDGE + PLACEMENT_FLOATING_LAUNCHER_SIZE + PLACEMENT_FLOATING_LAUNCHER_GAP;
