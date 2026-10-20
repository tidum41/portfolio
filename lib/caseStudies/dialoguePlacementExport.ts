/**
 * Dialogue placement moment tiles (section-6 / section-6b).
 * Keep export math in one place for capture scripts and layout audits.
 */

/** @2x Moment pair export (4:3) */
export const PLACEMENT_TILE_WIDTH = 1600;
export const PLACEMENT_TILE_HEIGHT = 1200;

export const PLACEMENT_TILE_BG = "#F6F4F1";

/** Equal top/bottom padding inside the tile (px at export resolution). */
export const PLACEMENT_MARGIN_TB = 40;

/**
 * Target subject width as a fraction of tile width (~75–85%).
 * Scene is centered horizontally; side margins are the remainder (larger than TB).
 */
export const PLACEMENT_SUBJECT_WIDTH_RATIO = 0.8;

export const PLACEMENT_SUBJECT_WIDTH = Math.round(
  PLACEMENT_TILE_WIDTH * PLACEMENT_SUBJECT_WIDTH_RATIO,
);

export const PLACEMENT_MARGIN_LR = Math.round(
  (PLACEMENT_TILE_WIDTH - PLACEMENT_SUBJECT_WIDTH) / 2,
);

export const PLACEMENT_SUBJECT_HEIGHT =
  PLACEMENT_TILE_HEIGHT - PLACEMENT_MARGIN_TB * 2;

/** Render study + assistant UI at ~1.3–1.5× “native” component pixels. */
export const PLACEMENT_UI_SCALE = 1.42;

export type PlacementVariant = "docked" | "floating";
