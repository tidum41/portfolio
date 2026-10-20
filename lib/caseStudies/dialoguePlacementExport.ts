import { studyPlayerBlockTopY } from "@/lib/caseStudies/dialogueStudyPlacementLayout";

/**
 * Dialogue placement moment tiles (section-6 / section-6b).
 * Keep export math in one place for capture scripts and layout audits.
 */

/** @2x Moment pair export (4:3) */
export const PLACEMENT_TILE_WIDTH = 1600;
export const PLACEMENT_TILE_HEIGHT = 1200;

export const PLACEMENT_TILE_BG = "#F6F4F1";

/** Tile margins: subject ~90% of 1600×1200 (80px L/R, 60px T/B on #F6F4F1). */
export const PLACEMENT_TILE_MARGIN_X = 80;
export const PLACEMENT_TILE_MARGIN_Y = 60;

export const PLACEMENT_SUBJECT_BOX_WIDTH = PLACEMENT_TILE_WIDTH - PLACEMENT_TILE_MARGIN_X * 2;
export const PLACEMENT_SUBJECT_BOX_HEIGHT = PLACEMENT_TILE_HEIGHT - PLACEMENT_TILE_MARGIN_Y * 2;

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

export const PLACEMENT_TILE_MARGIN_LEFT = PLACEMENT_TILE_MARGIN_X;
export const PLACEMENT_TILE_MARGIN_TOP = PLACEMENT_TILE_MARGIN_Y;

export type PlacementVariant = "docked" | "floating";

/** Floating chat stack: panel sits over transcript only; launcher stays bottom-right. */
export const PLACEMENT_FLOATING_LAUNCHER_SIZE = 50;
export const PLACEMENT_FLOATING_LAUNCHER_GAP = 10;
export const PLACEMENT_FLOATING_EDGE = 14;
/** Overlap the player on the right; full answer card must fit below. */
export const PLACEMENT_FLOATING_CHAT_TOP = studyPlayerBlockTopY();
export const PLACEMENT_FLOATING_PANEL_BOTTOM =
  PLACEMENT_FLOATING_EDGE + PLACEMENT_FLOATING_LAUNCHER_SIZE + PLACEMENT_FLOATING_LAUNCHER_GAP;
