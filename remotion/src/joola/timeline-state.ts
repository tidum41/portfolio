import { DEFAULT_FILM_CONFIG, type EasingPreset, type FilmConfig } from "./film-config";

/** cubic-bezier(x1,y1,x2,y2) as a function of t in [0,1] (Newton + bisection). */
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-6) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 30; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Cam = { cx: number; cy: number; s: number };
export type Move = { a: number; b: number; to: Cam; label: string; dip?: number; ease?: (t: number) => number };

export type TimelineState = ReturnType<typeof createTimelineState>;

export function createTimelineState(config: FilmConfig = DEFAULT_FILM_CONFIG) {
  const preset = (p: EasingPreset) => {
    const [x1, y1, x2, y2] = config.easings[p];
    return bezier(x1, y1, x2, y2);
  };

  const FPS = config.fps;
  const CAM_E = preset("camera");
  const PUSH_E = preset("push");
  const SETTLE = preset("settle");
  const UI_E = preset("ui");
  const FADE_E = preset("fade");
  const PTR_E = preset("pointer");
  const MOVE_E = preset("move");
  const EASE_OUT = preset("easeOut");
  const INOUT_E = preset("inOut");

  const MORPH = config.morph;
  const UI_IN = MORPH[0];
  const LEAD = config.clickLead;
  const CLICK = { ...config.clicks };
  const ENTER = CLICK.result + 3;
  const TYPE_SEARCH = [CLICK.search + 2, CLICK.search + 2 + config.beats.typeSearchDuration] as const;
  const DROPDOWN_OPEN = config.beats.dropdownOpenAt;
  const RESULT_HOVER = [CLICK.result - config.beats.resultHoverLead, CLICK.result] as const;
  const INSERT = [ENTER, ENTER + config.beats.rowInsertDuration] as const;
  const ROW_HL = [ENTER, ENTER] as const;
  const TYPE_QTY = [CLICK.qty + 2, CLICK.qty + config.beats.typeQtyDuration] as const;
  const QTY_SET = TYPE_QTY[1];
  const PAN_AB = [config.beats.panAbStart, config.beats.panAbStart + config.beats.panAbDuration] as const;
  const TPL_HOVER = [CLICK.tpl - LEAD, CLICK.tplAdd] as const;
  const POP_IN = [CLICK.tpl, CLICK.tpl + config.beats.popoverInDuration] as const;
  const POP_HOVER = CLICK.tplAdd - LEAD;
  const TPL_ROWS = [CLICK.tplAdd + 6, CLICK.tplAdd + 6 + config.beats.templateRowsDuration] as const;
  const PAN_BC = [config.beats.panBcStart, config.beats.panBcStart + config.beats.panBcDuration] as const;
  const PILL_FILL = [CLICK.add + 2, CLICK.add + 2 + config.beats.pillFillDuration] as const;
  const CART_CUT = CLICK.pill;
  const CART_FADE = [CART_CUT, CART_CUT] as const;
  const PAN_CART = [config.beats.panCartStart, config.beats.panCartStart + config.beats.panCartDuration] as const;
  const CREDIT_ANIM = [CART_CUT, CART_CUT] as const;
  const CONF_CUT = CLICK.place + 3;
  const CONF_MORPH = [CONF_CUT, CONF_CUT + config.beats.orderMorphDuration] as const;
  const CONF_XFADE = CONF_MORPH;
  const CONF_HOLD = [CONF_MORPH[1], CONF_MORPH[1] + config.beats.orderPlacedHold] as const;
  const END_FADE = [CONF_HOLD[1], CONF_HOLD[1] + config.beats.logoOutDuration] as const;
  const DURATION = END_FADE[1] + config.beats.logoOutTail;
  const MORPH_OUT = END_FADE;
  const POINTER_OFF = END_FADE[1];

  const CUTS: number[] = [CART_CUT];
  const CONTENT_ANIMS: [string, number, number][] = [
    ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
    ["results + select", DROPDOWN_OPEN, RESULT_HOVER[1]],
    ["result click + row insert", ENTER, INSERT[1]],
    ["qty click + 120", CLICK.qty, TYPE_QTY[1]],
    ["template popover", CLICK.tpl, POP_IN[1]],
    ["template rows", TPL_ROWS[0], TPL_ROWS[1]],
    ["badge + pill width", PILL_FILL[0], PILL_FILL[1]],
    ["order morph", CONF_MORPH[0], CONF_MORPH[1]],
  ];

  const OW = 1440;
  const OH = 1080;
  const UI_W = 1312;
  const UI_H = 756;
  const PAN_E = MOVE_E;

  const SHOT_A: Cam = { ...config.camera.shotA };
  const SHOT_B: Cam = { ...config.camera.shotB };
  const SHOT_B2: Cam = { ...config.camera.shotB2 };
  const SHOT_SUM: Cam = { ...config.camera.shotSummary };
  const SHOT_D: Cam = { ...config.camera.shotOrderPlaced };

  const WIDE = SHOT_A;
  const CART_CAM = SHOT_B2;
  const CONF_CAM = SHOT_D;
  const moveEase = preset(config.camera.moveEasing);
  const morphEase = preset(config.camera.morphMoveEasing);

  const MOVES: Move[] = [
    { a: PAN_AB[0], b: PAN_AB[1], to: SHOT_B, label: "move 1: qty -> Reorder rail", ease: moveEase },
    { a: PAN_BC[0], b: PAN_BC[1], to: SHOT_B2, label: "move 2: ease out to footer + header pill", ease: moveEase },
    { a: PAN_CART[0], b: PAN_CART[1], to: SHOT_SUM, label: "move 3: Cart -> order summary", ease: moveEase },
    { a: CONF_MORPH[0], b: CONF_MORPH[1], to: SHOT_D, label: "morph to Order placed", ease: morphEase },
  ];

  const clampCam = (c: Cam): Cam => {
    const hw = OW / 2 / c.s, hh = OH / 2 / c.s;
    return {
      s: c.s,
      cx: 2 * hw >= UI_W ? UI_W / 2 : Math.min(Math.max(c.cx, hw), UI_W - hw),
      cy: 2 * hh >= UI_H ? UI_H / 2 : Math.min(Math.max(c.cy, hh), UI_H - hh),
    };
  };
  const confCam = (): Cam => clampCam(CONF_CAM);
  const camAt = (f: number): Cam => {
    let st: Cam = WIDE;
    for (const m of MOVES) {
      if (f < m.a) return st;
      const from = st;
      if (m.b === m.a) { st = m.to; continue; }
      if (f <= m.b) {
        const u = (f - m.a) / (m.b - m.a);
        const t = (m.ease || CAM_E)(u);
        const to = m.to;
        const s = lerp(from.s, to.s, t) - (m.dip || 0) * Math.sin(Math.PI * t);
        return { cx: lerp(from.cx, to.cx, t), cy: lerp(from.cy, to.cy, t), s };
      }
      st = m.to;
    }
    return st;
  };

  const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) =>
    e(clamp01((f - a) / (b - a)));

  const cursorMoveE = preset(config.cursorMovePreset);

  return {
    config,
    FPS,
    CAM_E,
    PUSH_E,
    SETTLE,
    UI_E,
    FADE_E,
    PTR_E,
    MOVE_E,
    EASE_OUT,
    INOUT_E,
    MORPH,
    UI_IN,
    LEAD,
    CLICK,
    ENTER,
    TYPE_SEARCH,
    DROPDOWN_OPEN,
    RESULT_HOVER,
    INSERT,
    ROW_HL,
    TYPE_QTY,
    QTY_SET,
    PAN_AB,
    TPL_HOVER,
    POP_IN,
    POP_HOVER,
    TPL_ROWS,
    PAN_BC,
    PILL_FILL,
    CART_CUT,
    CART_FADE,
    PAN_CART,
    CREDIT_ANIM,
    CONF_CUT,
    CONF_MORPH,
    CONF_XFADE,
    CONF_HOLD,
    END_FADE,
    DURATION,
    MORPH_OUT,
    POINTER_OFF,
    CUTS,
    CONTENT_ANIMS,
    OW,
    OH,
    UI_W,
    UI_H,
    PAN_E,
    SHOT_A,
    SHOT_B,
    SHOT_B2,
    SHOT_SUM,
    SHOT_D,
    WIDE,
    CART_CAM,
    CONF_CAM,
    MOVES,
    clampCam,
    confCam,
    camAt,
    prog,
    lerp,
    clamp01,
    bezier,
    cursorMoveE,
  };
}
