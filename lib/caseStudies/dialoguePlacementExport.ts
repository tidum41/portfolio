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
export const PLACEMENT_SIDEBAR_WIDTH = 400;
export const PLACEMENT_LAYOUT_WIDTH = Math.round(
  (PLACEMENT_SUBJECT_BOX_WIDTH / PLACEMENT_SUBJECT_BOX_HEIGHT) * PLACEMENT_LAYOUT_HEIGHT,
);
export const PLACEMENT_STUDY_WIDTH_DOCKED = PLACEMENT_LAYOUT_WIDTH - PLACEMENT_SIDEBAR_WIDTH;

export const STUDY_PLAYER_PAD_X = 16;
export const PLACEMENT_PLAYER_BODY_WIDTH = PLACEMENT_STUDY_WIDTH_DOCKED - STUDY_PLAYER_PAD_X * 2;
export const PLACEMENT_PLAYER_VIDEO_HEIGHT = Math.round((PLACEMENT_PLAYER_BODY_WIDTH * 9) / 16);
export const PLACEMENT_PLAYER_TOTAL_HEIGHT = PLACEMENT_PLAYER_VIDEO_HEIGHT;

export const PLACEMENT_COMPOSITION_SCALE = Math.min(
  PLACEMENT_SUBJECT_BOX_WIDTH / PLACEMENT_LAYOUT_WIDTH,
  PLACEMENT_SUBJECT_BOX_HEIGHT / PLACEMENT_LAYOUT_HEIGHT,
);

export const PLACEMENT_COMPOSITION_WIDTH = PLACEMENT_LAYOUT_WIDTH * PLACEMENT_COMPOSITION_SCALE;
export const PLACEMENT_COMPOSITION_HEIGHT = PLACEMENT_LAYOUT_HEIGHT * PLACEMENT_COMPOSITION_SCALE;

export const PLACEMENT_TILE_MARGIN_LEFT = PLACEMENT_TILE_MARGIN_X;
export const PLACEMENT_TILE_MARGIN_TOP = PLACEMENT_TILE_MARGIN_Y;

export type PlacementVariant = "docked" | "floating";

/** Floating overlay: 400px card inset from top/right; launcher below with bottom/right inset. */
export const PLACEMENT_FLOATING_PANEL_WIDTH = 400;
export const PLACEMENT_FLOATING_LAUNCHER_SIZE = 48;
export const PLACEMENT_FLOATING_LAUNCHER_GAP = 16;
export const PLACEMENT_FLOATING_EDGE = 16;
/** Panel top inset (matches right inset — reads as floating card, not docked column). */
export const PLACEMENT_FLOATING_PANEL_TOP = PLACEMENT_FLOATING_EDGE;

/** Max panel card height leaving room for gap + launcher + bottom inset. */
export const PLACEMENT_FLOATING_PANEL_MAX_HEIGHT =
  PLACEMENT_LAYOUT_HEIGHT -
  PLACEMENT_FLOATING_PANEL_TOP -
  PLACEMENT_FLOATING_LAUNCHER_GAP -
  PLACEMENT_FLOATING_LAUNCHER_SIZE -
  PLACEMENT_FLOATING_EDGE;
