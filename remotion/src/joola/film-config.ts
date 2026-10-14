/**
 * Single source of tunable numbers for the JOOLA B2B film.
 * Defaults match pass 19 in timeline (visual parity when unchanged).
 */
export type CamConfig = { cx: number; cy: number; s: number };

export type EasingPreset =
  | "camera"
  | "push"
  | "settle"
  | "ui"
  | "fade"
  | "pointer"
  | "move"
  | "easeOut"
  | "inOut";

export type FilmConfig = {
  fps: number;
  /** Logo glide into sidebar slot [start, end] */
  morph: [number, number];
  /** Frames cursor leads a click (hover before press) */
  clickLead: number;
  /** Cursor travel easing between keys */
  cursorMovePreset: EasingPreset;
  /** Click frames */
  clicks: {
    search: number;
    result: number;
    qty: number;
    tpl: number;
    tplAdd: number;
    add: number;
    pill: number;
    place: number;
  };
  /** Beat durations / windows (frames) */
  beats: {
    typeSearchDuration: number;
    dropdownOpenAt: number;
    resultHoverLead: number;
    rowInsertDuration: number;
    typeQtyDuration: number;
    panAbDuration: number;
    panAbStart: number;
    popoverInDuration: number;
    templateRowsDuration: number;
    panBcDuration: number;
    panBcStart: number;
    pillFillDuration: number;
    panCartDuration: number;
    panCartStart: number;
    orderMorphDuration: number;
    orderPlacedHold: number;
    logoOutDuration: number;
    logoOutTail: number;
  };
  camera: {
    shotA: CamConfig;
    shotB: CamConfig;
    shotB2: CamConfig;
    shotSummary: CamConfig;
    shotOrderPlaced: CamConfig;
    moveEasing: EasingPreset;
    morphMoveEasing: EasingPreset;
  };
  easings: Record<EasingPreset, [number, number, number, number]>;
};

export const DEFAULT_FILM_CONFIG: FilmConfig = {
  fps: 30,
  morph: [4, 18],
  clickLead: 2,
  cursorMovePreset: "move",
  clicks: {
    search: 26,
    result: 58,
    qty: 76,
    tpl: 108,
    tplAdd: 136,
    add: 172,
    pill: 200,
    place: 266,
  },
  beats: {
    typeSearchDuration: 13,
    dropdownOpenAt: 34,
    resultHoverLead: 2,
    rowInsertDuration: 6,
    typeQtyDuration: 4,
    panAbStart: 90,
    panAbDuration: 14,
    popoverInDuration: 5,
    templateRowsDuration: 10,
    panBcStart: 156,
    panBcDuration: 14,
    pillFillDuration: 9,
    panCartStart: 224,
    panCartDuration: 18,
    orderMorphDuration: 14,
    orderPlacedHold: 45,
    logoOutDuration: 36,
    logoOutTail: 6,
  },
  camera: {
    shotA: { cx: 605, cy: 280, s: 1.8 },
    shotB: { cx: 925, cy: 455, s: 2.05 },
    shotB2: { cx: 800, cy: 378, s: 1.48 },
    shotSummary: { cx: 980, cy: 250, s: 1.95 },
    shotOrderPlaced: { cx: 770, cy: 235, s: 1.88 },
    moveEasing: "move",
    morphMoveEasing: "inOut",
  },
  easings: {
    camera: [0.4, 0, 0.2, 1],
    push: [0.33, 0.4, 0.2, 1],
    settle: [0.33, 1, 0.68, 1],
    ui: [0.2, 0, 0, 1],
    fade: [0.4, 0, 0.2, 1],
    pointer: [0.3, 0, 0, 1],
    move: [0.45, 0, 0.25, 1],
    easeOut: [0.2, 0, 0, 1],
    inOut: [0.45, 0, 0.55, 1],
  },
};

export function mergeFilmConfig(partial: Partial<FilmConfig> | FilmConfig): FilmConfig {
  const base = DEFAULT_FILM_CONFIG;
  return {
    ...base,
    ...partial,
    clicks: { ...base.clicks, ...partial.clicks },
    beats: { ...base.beats, ...partial.beats },
    camera: { ...base.camera, ...partial.camera },
    easings: { ...base.easings, ...partial.easings },
    morph: partial.morph ?? base.morph,
  };
}
