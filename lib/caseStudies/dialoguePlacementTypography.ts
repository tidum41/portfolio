/**
 * Placement scene type scale (layout px, before composition scale).
 * Weights: 400 regular, 500 medium only.
 */

export const PLACEMENT_GRID_PAD_X = 16;
export const PLACEMENT_GRID_PAD_Y = 12;
export const PLACEMENT_SPACE_1 = 8;
export const PLACEMENT_SPACE_2 = 16;
export const PLACEMENT_RADIUS_SM = 8;
export const PLACEMENT_RADIUS_MD = 10;
export const PLACEMENT_RADIUS_LG = 12;
export const PLACEMENT_ICON_SIZE = 16;
export const PLACEMENT_ICON_STROKE = 1.25;
export const PLACEMENT_AVATAR_SIZE = 20;

export const placementType = {
  title: {
    fontSize: 15,
    lineHeight: "20px",
    fontWeight: 500,
    letterSpacing: "-0.02em",
  },
  meta: {
    fontSize: 12,
    lineHeight: "16px",
    fontWeight: 400,
    letterSpacing: "-0.01em",
  },
  body: {
    fontSize: 13,
    lineHeight: "20px",
    fontWeight: 400,
    letterSpacing: "-0.01em",
  },
  label: {
    fontSize: 12,
    lineHeight: "16px",
    fontWeight: 500,
    letterSpacing: "-0.01em",
  },
  labelRegular: {
    fontSize: 12,
    lineHeight: "16px",
    fontWeight: 400,
    letterSpacing: "-0.01em",
  },
  tabular: {
    fontVariantNumeric: "tabular-nums" as const,
    fontFeatureSettings: '"tnum"',
  },
};
