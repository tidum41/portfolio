/**
 * Film timeline: pure numbers + camera maths, no Remotion imports, so
 * scripts/timeline-report.mjs can evaluate it in node (camera velocity vs content animation).
 *
 * Pass 28: after Add to order, the camera eases out alone, holds, then the
 * kit lines land. A second ease carries the cursor onto Add to cart.
 * The cart total is the prototype's per-digit roll (about 450ms), after the
 * pill is already wide enough to hold it.
 */
export const FPS = 30;

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
/**
 * One curve family. Travel (camera, cursor, fades) is MOVE_E.
 * UI entrances (insert, pill width, badge) are the shared ease-out.
 */
export const MOVE_E = bezier(0.45, 0, 0.25, 1);
export const CAM_E = MOVE_E;
export const FADE_E = MOVE_E;
export const PUSH_E = MOVE_E;
export const PTR_E = MOVE_E;
export const INOUT_E = MOVE_E;
export const SETTLE = MOVE_E;
export const EASE_OUT = bezier(0.2, 0, 0, 1);
export const UI_E = EASE_OUT;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) => e(clamp01((f - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- pass 27 beats ---------- */
/** Logo leaves first (quick), then the dashboard fades up off the solid ground. */
export const LOGO_OUT = [0, 5] as const;
export const UI_IN = [5, 11] as const;
export const MORPH = [0, UI_IN[1]] as const;
export const LEAD = 2;
/** Ease from the dashboard shot into the search shot before the first click. */
export const OPEN_MOVE = [20, 32] as const;
export const CLICK = { search: 36, result: 66, qty: 90, tpl: 136, tplAdd: 170, add: 248, place: 334 };
export const ENTER = CLICK.result + 3;
export const TYPE_SEARCH = [CLICK.search + 2, CLICK.search + 15] as const;
export const DROPDOWN_OPEN = CLICK.search + 8;
export const RESULT_HOVER = [CLICK.result - 2, CLICK.result] as const;
export const INSERT = [ENTER, ENTER + 6] as const;
/** Kept for API compat; no blue just-added tint. */
export const ROW_HL = [ENTER, ENTER] as const;
/** One click on the 12 chip. Dependent money rolls for 6 frames (200ms). */
export const TYPE_QTY = [CLICK.qty, CLICK.qty] as const;
export const QTY_SET = CLICK.qty;
export const ROLL_F = 6;
/** Eye travels onto the new row as it inserts, and lands while the qty is still 1. */
export const QTY_MOVE = [69, 82] as const;
/** 20 frames, 0.67s. Same MOVE_E. Scale step is about 12% smaller than pass 24. */
export const PAN_AB = [106, 126] as const;
export const TPL_HOVER = [CLICK.tpl - LEAD, CLICK.tplAdd] as const;
/** Solid on the open frame. Scale 0.98→1 over 3 frames (100ms), opacity stays 1. */
export const POP_IN = [CLICK.tpl, CLICK.tpl + 3] as const;
export const POP_HOVER = CLICK.tplAdd - LEAD;
/**
 * The three template rows start after the cut to the table, so they arrive
 * where the eye already is. Perseus is already on the order.
 */
/**
 * 18 frames, 0.6s, MOVE_E. Starts after the popover has closed and held.
 * The kit lines are not in the table yet, so the zoom is the only motion.
 */
export const ROWS_ZOOM = [182, 200] as const;
export const ROWS_CUT = ROWS_ZOOM[0];
/**
 * The three kit lines are already in the table before the zoom starts.
 * The tight Match kit shot does not show them. The zoom is the reveal.
 */
export const TPL_ROWS = [176, 176] as const;
/**
 * Eased move from the table onto Add to cart. Not a cut.
 * Lands before the press so the button can be read with the cursor on it.
 */
export const ADD_MOVE = [218, 236] as const;
export const ADD_CUT = ADD_MOVE[1];
export const PAN_BC = ADD_MOVE;
/** Hard cut to a tight cart pill still showing $0.00. */
export const PILL_SHOT = 260;
export const PILL_W0 = 85;
/** Filled pill for "$4,908.66" at weight 700 plus the badge. Right edge stays 1284. */
export const PILL_W1 = 143;
/** Width at which "$4,908.66" fits next to the icon, before the badge takes space. */
export const PILL_NUM_W = 115;
/** Cursor lands on the empty cart icon, then rides it as the pill grows. */
export const PILL_ARRIVE = 264;
/** Digit roll starts the frame the width finishes. 14 frames, 467ms. */
export const PILL_ROLL = 276;
export const ROLL_PILL_F = 14;
/** Width first, on its own. The number stays $0.00 until the pill can hold $4,908.66. */
export const PILL_FILL = [268, 276] as const;
/** Badge after the digits have settled. Scale 0.6→1, colour only on the pill itself. */
export const PILL_BADGE = [290, 296] as const;
/** Hard cut to the cart summary: total + Place order are the hero. */
export const CART_CUT = 302;
export const CART_FADE = [CART_CUT, CART_CUT] as const;
export const PAN_CART = [CART_CUT, CART_CUT] as const;
export const CREDIT_ANIM = [CART_CUT, CART_CUT] as const;
/** "Place order" crossfades to the processing face. Done as the hold becomes readable. */
export const PROC_XFADE = [337, 341] as const;
/** Press, then "Placing order" holds ~0.73s once the label is solid. */
export const PROC = [338, 363] as const;
/** Whole-button colour, 5 frames ≈ 167ms, then the check stroke, 8 frames ≈ 267ms. */
export const PLACE_COLOR = [355, 360] as const;
export const CHECK_DRAW = [360, 368] as const;
/** "Order placed" on the green button, ~0.4s. */
export const SUCCESS_HOLD = [371, 383] as const;
/** Summary content fades. The card chrome stays. */
export const CONF_FADE = [383, 387] as const;
export const CONF_CUT = 387;
/** Top-anchored height ease, ~300ms, MOVE_E. */
export const CONF_GROW = [387, 396] as const;
/** Short recenter once the card has grown. */
export const CONF_RECENTER = [402, 412] as const;
export const CONF_SETTLE = CONF_GROW;
export const CONF_MORPH = CONF_GROW;
export const CONF_XFADE = CONF_FADE;
/** Hold Order placed, then fade the UI to the ground before the logo. */
export const CONF_HOLD = [412, 457] as const;
/** UI fades to the solid ground, then the logo fades and scales 0.96→1 over 9 frames (300ms). */
export const UI_OUT = [457, 465] as const;
export const LOGO_IN = [465, 474] as const;
export const END_FADE = [UI_OUT[0], 488] as const;
export const DURATION = END_FADE[1] + 1;
export const MORPH_OUT = END_FADE;
export const POINTER_OFF = END_FADE[1];

export const CUTS: number[] = [PILL_SHOT, CART_CUT, CONF_CUT];
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["results + select", DROPDOWN_OPEN, RESULT_HOVER[1]],
  ["result click + row insert", ENTER, INSERT[1]],
  ["qty chip 12 + digit roll", CLICK.qty, CLICK.qty + ROLL_F],
  ["template popover", CLICK.tpl, POP_IN[1]],
  ["template rows", TPL_ROWS[0], TPL_ROWS[1]],
  ["pill width", PILL_FILL[0], PILL_FILL[1]],
  ["pill digit roll", PILL_ROLL, PILL_ROLL + ROLL_PILL_F],
  ["pill badge", PILL_BADGE[0], PILL_BADGE[1]],
  ["placing order", PROC[0], CHECK_DRAW[1]],
  ["order placed grow", CONF_GROW[0], CONF_RECENTER[1]],
];

/* ---------- camera ---------- */
export type Cam = { cx: number; cy: number; s: number };
export type Move = { a: number; b: number; to: Cam; label: string; dip?: number; ease?: (t: number) => number };
export const OW = 1440;
export const OH = 1080;
export const UI_W = 1312;
export const UI_H = 756;
export const PAN_E = MOVE_E;

/**
 * Pass 24: focal text aims for ~14px cap height at 676px.
 * Measured on the pass-23 qty digits: 14px type at s=1.8 is ~9.4px tall at 676,
 * so 13px type needs s ≳ 2.9 and 14px type needs s ≳ 2.7.
 * Three moves (open -> search, search -> qty, qty -> Add to order), then cuts.
 */
/**
 * Logo in the sidebar. Frame stops at the search field so Upload CSV
 * and the Price header are not sliced letters.
 */
/** Wide enough that the search field's right radius is whole, and Upload CSV stays out. */
export const SHOT_OPEN: Cam = { cx: 328, cy: 210, s: 2.24 };
/**
 * Search field. Frame stops at the field (page x ~648) so the Price header
 * is not a sliced "Pri", and Quick order stays whole on the left.
 */
export const SHOT_A: Cam = { cx: 440, cy: 148.4, s: 3.45 };
/** Qty row, below the search field so that field is not a sliced pill. */
export const SHOT_B: Cam = { cx: 803, cy: 332.4, s: 3.3 };
/**
 * Add to order. Match kit is whole; the card above and the footer
 * Add button are outside the frame so nothing is sliced.
 */
/** Add to order. Popover radius is whole; the line above Match kit and the footer rule stay out.
 *  cy +0.4 follows the Quick order title locking to a 28px line box. */
export const SHOT_B2: Cam = { cx: 1158, cy: 595.4, s: 6.4 };
/** Add 4 to cart. Low enough that the rail price above the footer is out of frame. */
/** Add 4 lines to cart. Centre is the wider label. */
export const SHOT_ADD: Cam = { cx: 1212.5, cy: 748.4, s: 4.4 };
/** The order table, framed so three new rows can arrive under Perseus. */
export const SHOT_ROWS: Cam = { cx: 640, cy: 370.4, s: 1.78 };
/**
 * Filled pill centred. Right edge stays at 1284, filled width 142,
 * so the centre is 1213. cy is the pill's vertical centre.
 */
export const SHOT_PILL: Cam = { cx: 1213, cy: 23, s: 8.8 };
/**
 * Place order and Order placed share one scale and the same offset from each
 * card's page centre. s=2.95 is the largest scale that keeps SO-48213 inside
 * the frame (the number sits ~25px from the card edge). d=6 lifts the card
 * a hair without clipping the title. The 24px total is the larger focal.
 */
/**
 * Both cards share s=2.68 (~9% smaller than pass 24's 2.95) and are centred
 * on their own content. cy values are corrected after the height:auto stills.
 */
export const CARD_S = 2.68;
/** Centred on the height:auto summary (page centre y 273.11). */
export const SHOT_SUM: Cam = { cx: 1044, cy: 273.11, s: CARD_S };
/** Confirmation top locked to the summary's screen top while the card grows. */
export const SHOT_GROW: Cam = { cx: 766, cy: 221.07, s: CARD_S };
/** Centred on the height:auto confirmation (page centre y 238.23). */
export const SHOT_D: Cam = { cx: 766, cy: 238.23, s: CARD_S };

export const WIDE = SHOT_OPEN;
export const CART_CAM = SHOT_SUM;
export const CONF_CAM = SHOT_D;
export const MOVES: Move[] = [
  { a: OPEN_MOVE[0], b: OPEN_MOVE[1], to: SHOT_A, label: "open: logo -> search", ease: MOVE_E },
  { a: QTY_MOVE[0], b: QTY_MOVE[1], to: SHOT_B, label: "move: search -> qty", ease: MOVE_E },
  { a: PAN_AB[0], b: PAN_AB[1], to: SHOT_B2, label: "move: qty -> Add to order", ease: MOVE_E },
  { a: ROWS_ZOOM[0], b: ROWS_ZOOM[1], to: SHOT_ROWS, label: "zoom out to the order", ease: MOVE_E },
  { a: ADD_MOVE[0], b: ADD_MOVE[1], to: SHOT_ADD, label: "ease: order -> Add to cart", ease: MOVE_E },
  { a: PILL_SHOT, b: PILL_SHOT, to: SHOT_PILL, label: "cut: cart pill" },
  { a: CART_CUT, b: CART_CUT, to: SHOT_SUM, label: "cut: order summary" },
  { a: CONF_CUT, b: CONF_CUT, to: SHOT_GROW, label: "cut: order placed, top locked" },
  { a: CONF_RECENTER[0], b: CONF_RECENTER[1], to: SHOT_D, label: "recenter order placed", ease: MOVE_E },
];
export const clampCam = (c: Cam): Cam => {
  const hw = OW / 2 / c.s, hh = OH / 2 / c.s;
  return {
    s: c.s,
    cx: 2 * hw >= UI_W ? UI_W / 2 : Math.min(Math.max(c.cx, hw), UI_W - hw),
    cy: 2 * hh >= UI_H ? UI_H / 2 : Math.min(Math.max(c.cy, hh), UI_H - hh),
  };
};
export const confCam = (): Cam => clampCam(CONF_CAM);
export const camAt = (f: number): Cam => {
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
