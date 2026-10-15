/**
 * Film timeline: pure numbers + camera maths, no Remotion imports, so
 * scripts/timeline-report.mjs can evaluate it in node (camera velocity vs content animation).
 *
 * Pass 35: 14.0s. Frames 0–90 and everything from the cart cut (300) keep
 * their pass-33 values. The middle keeps pass 34's locked order framing,
 * cursor dwells and arcs, reading holds, the 12-chip beat, and the staggered
 * kit lines. Those lines start only after the saved-orders popup's Add to
 * order click. The post-search zoom is a hard cut. Place order, the check,
 * the card grow, and both logo fades keep their pass-32 lengths.
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
 * Fades and the confirmation recenter stay on MOVE_E so the logo and the
 * Order placed card keep their pass-32 feel. The open push uses CAM_E.
 * Cursor travel uses PTR_E: ease-in-out with a long settle.
 */
export const MOVE_E = bezier(0.45, 0, 0.25, 1);
export const CAM_E = bezier(0.42, 0, 0.16, 1);
export const FADE_E = MOVE_E;
export const PUSH_E = MOVE_E;
export const PTR_E = bezier(0.42, 0, 0.18, 1);
/** Middle of the film only. Symmetric ease-in-out. Not used before frame 91 or from the cart cut. */
export const FLOW_E = bezier(0.65, 0, 0.35, 1);
export const INOUT_E = MOVE_E;
export const SETTLE = MOVE_E;
export const EASE_OUT = bezier(0.2, 0, 0, 1);
export const UI_E = EASE_OUT;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) => e(clamp01((f - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- pass 35 beats (420 frames, cart cut at 300) ---------- */
/** Logo leaves first (quick), then the dashboard fades up off the solid ground. */
export const LOGO_OUT = [0, 5] as const;
export const UI_IN = [5, 11] as const;
export const MORPH = [0, UI_IN[1]] as const;
export const LEAD = 2;
/**
 * One zoom, 18 frames (600ms), CAM_E. The cursor rests on the dashboard
 * the whole way. It travels to the field only after the push has settled.
 */
export const OPEN_MOVE = [12, 30] as const;
export const CLICK = { search: 50, result: 97, qty: 137, tpl: 175, tplAdd: 199, add: 255, pill: 296, place: 321 };
export const ENTER = CLICK.result;
export const TYPE_SEARCH = [CLICK.search + 2, CLICK.search + 16] as const;
export const DROPDOWN_OPEN = CLICK.search + 8;
/** Dropdown eases in over 8 frames. It finishes as the hold before the next travel starts. */
export const DROP_F = 8;
export const RESULT_HOVER = [CLICK.result - 2, CLICK.result] as const;
/**
 * Hard cut from the search field onto the whole order, one frame after the
 * cursor arrives on the result. No zoom. The result stays under the cursor.
 */
export const CUT_ORDER = 91;
/** The Perseus line eases in over 12 frames. The dropdown leaves on the same ease. */
export const INSERT = [ENTER, ENTER + 12] as const;
/** Kept for API compat; no blue just-added tint. */
export const ROW_HL = [ENTER, ENTER] as const;
/** One click on the 12 chip. The line price rolls for 10 frames. */
export const TYPE_QTY = [CLICK.qty, CLICK.qty] as const;
export const QTY_SET = CLICK.qty;
export const ROLL_F = 10;
export const TPL_HOVER = [CLICK.tpl - LEAD, CLICK.tplAdd] as const;
/** Popup scale 0.98→1 over 6 frames. Opacity stays 1. Then the cursor rests. */
export const POP_IN = [CLICK.tpl, CLICK.tpl + 6] as const;
export const POP_HOVER = CLICK.tplAdd - LEAD;
/** Hard cut onto Match kit. The card and the popup are the cause, and they have to be readable. */
export const CUT_TPL = 159;
/**
 * Hard cut back to the order on the Add to order release. The three kit
 * lines start on this frame. They never appear before the popup click.
 */
export const CUT_LINES = CLICK.tplAdd + 4;
/**
 * The other three lines land as one gesture. 2 frames apart (~67ms) and the
 * same 18-frame ease. The cursor is still.
 */
export const FILL = CUT_LINES;
export const FILL_STAGGER = 2;
export const FILL_F = 18;
export const FILL_END = FILL + FILL_STAGGER * 2 + FILL_F;
/** The button is "Add 4 lines" once it is wide enough, before the read hold. */
export const ADD_GROW = [FILL, FILL + 14] as const;
/**
 * Hard cut to the header cart on the Add to cart release. The cursor keeps its
 * screen pixel, below the pill. The amount, the width, and the count circle
 * start on this same frame.
 */
export const PILL_SHOT = CLICK.add + 3;
/**
 * Tabular advance of "$0.00" and "$4,908.66" at 13px / 700, from the face.
 * The pill is border-box: 1px border + 12px pad each side, a 16px icon with
 * a -2px margin, an 8px gap, the amount, and (once it grows in) an 8px gap
 * plus a 20px badge. Right edge stays 1284; the pill grows left. Padding is
 * 12px on both ends at $0.00 and at $4,908.66.
 */
export const PILL_AMT0 = 38;
export const PILL_AMT1 = 67;
export const PILL_W0 = 2 + 24 + 14 + 8 + PILL_AMT0;
export const PILL_W1 = PILL_W0 + (PILL_AMT1 - PILL_AMT0) + 8 + 20;
/** Amount width once "$4,908.66" has settled. The badge is not included. */
export const PILL_NUM_W = PILL_AMT1;
/** Cursor reaches the cart icon after the roll, and dwells before the click. */
export const PILL_ARRIVE = 290;
/**
 * Digit roll, pill width, and the count circle share one window: the release
 * frame, then 9 frames (300ms), one ease-out.
 */
export const PILL_ROLL = PILL_SHOT;
export const ROLL_PILL_F = 9;
export const PILL_FILL = [PILL_ROLL, PILL_ROLL + ROLL_PILL_F] as const;
export const PILL_BADGE = [PILL_ROLL, PILL_ROLL + ROLL_PILL_F] as const;

/** One eased t for the pill's width, the digits, and the count circle. */
export const pillMotion = (f: number) =>
  f >= PILL_ROLL ? prog(f, PILL_ROLL, PILL_ROLL + ROLL_PILL_F, EASE_OUT) : 0;

/**
 * Whole-pixel box for this frame. The badge slot grows with the same t, and
 * a negative margin cancels the 8px flex gap until the circle has room, so
 * the 12px end padding does not jump.
 */
export const pillBox = (f: number) => {
  const t = pillMotion(f);
  // The box leads the digits, same start and inside the same 300ms, so the $
  // is on screen before the roll's middle. The ends stay the tabular widths.
  const wt = Math.min(1, t / 0.35);
  const amt = Math.round(lerp(PILL_AMT0, PILL_AMT1, wt));
  const badge = Math.round(20 * wt);
  const pull = Math.round(-8 * (1 - wt));
  const extra = badge === 0 ? 0 : 8 + pull + badge;
  return { t, amt, badge, pull, w: 48 + amt + extra };
};
/**
 * Hard cut to the cart summary. Everything from here to the last frame is the
 * pass-32 Place order / Order placed / logo outro block, shifted so the film
 * ends at frame 419.
 */
export const CART_CUT = 300;
export const CART_FADE = [CART_CUT, CART_CUT] as const;
export const PAN_CART = [CART_CUT, CART_CUT] as const;
export const CREDIT_ANIM = [CART_CUT, CART_CUT] as const;
/** "Place order" crossfades to the processing face. Done as the hold becomes readable. */
export const PROC_XFADE = [324, 328] as const;
/** Press, then "Placing order" holds ~0.73s once the label is solid. */
export const PROC = [324, 347] as const;
/** Whole-button colour, 5 frames ≈ 167ms, then the check stroke, 8 frames ≈ 267ms. */
export const PLACE_COLOR = [334, 339] as const;
export const CHECK_DRAW = [339, 347] as const;
/** "Order placed" on the green button, ~0.4s. */
export const SUCCESS_HOLD = [347, 353] as const;
/** Summary content fades. The card chrome stays. */
export const CONF_FADE = [353, 357] as const;
export const CONF_CUT = 357;
/** Top-anchored height ease, ~300ms, MOVE_E. */
export const CONF_GROW = [357, 366] as const;
/** Short recenter once the card has grown. */
export const CONF_RECENTER = [372, 382] as const;
export const CONF_SETTLE = CONF_GROW;
export const CONF_MORPH = CONF_GROW;
export const CONF_XFADE = CONF_FADE;
/** Hold Order placed, then fade the UI to the ground before the logo. */
export const CONF_HOLD = [382, 392] as const;
/** UI fades to the solid ground, then the logo fades and scales 0.96→1 over 9 frames (300ms). */
export const UI_OUT = [392, 400] as const;
export const LOGO_IN = [400, 409] as const;
export const END_FADE = [UI_OUT[0], 419] as const;
export const DURATION = END_FADE[1] + 1;
export const MORPH_OUT = END_FADE;
export const POINTER_OFF = END_FADE[1];

export const CUTS: number[] = [CUT_ORDER, CUT_TPL, CUT_LINES, PILL_SHOT, CART_CUT, CONF_CUT];
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["results dropdown", DROPDOWN_OPEN, DROPDOWN_OPEN + DROP_F],
  ["row insert", INSERT[0], INSERT[1]],
  ["qty digit roll", CLICK.qty, CLICK.qty + ROLL_F],
  ["template popover", POP_IN[0], POP_IN[1]],
  ["order fills", FILL, FILL_END],
  ["pill width", PILL_FILL[0], PILL_FILL[1]],
  ["pill digit roll", PILL_ROLL, PILL_ROLL + ROLL_PILL_F],
  ["pill badge", PILL_BADGE[0], PILL_BADGE[1]],
  ["placing order", PROC[0], CHECK_DRAW[1]],
  ["order placed grow", CONF_GROW[0], CONF_GROW[1]],
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
/**
 * Kit lines and Add 4 lines to cart in one hold. s=1.32 is the widest scale
 * that keeps the table (x 248) and the button (right edge 1284) inside with
 * the sidebar (220) just out, so no nav label is sliced. The view is taller
 * than the page, so the header and the footer are both in frame.
 */
export const SHOT_BOTH: Cam = { cx: 766, cy: 378, s: 1.32 };
/**
 * The whole order. Held from the cut off the search field through the 12-chip
 * beat, and again while the kit lines land. s=1.35 keeps the result, the 12
 * chip, all four rows, Add to cart, and the filled pill inside, with the
 * sidebar (220) just outside the left edge.
 */
export const SHOT_ORDER: Cam = { cx: 768, cy: 378, s: 1.35 };
/** Kept so a report can name the old tight shots. Not a camera target. */
export const SHOT_ADD: Cam = { cx: 1212.5, cy: 748.4, s: 4.4 };
export const SHOT_ROWS: Cam = { cx: 640, cy: 370.4, s: 1.78 };
/**
 * Header cart, held for the whole update. s=5.6 keeps the filled pill
 * (right edge 1284, y 5–41) inside the frame with the amount clear of the
 * edge. The table starts at y 187, below the frame.
 * Not a second zoom: the camera is this shot from the cut until Place order.
 */
export const SHOT_HEADER: Cam = { cx: 1206, cy: 84, s: 5.6 };
/** Old macro on the pill. Not a camera target. */
export const SHOT_PILL: Cam = { cx: 1284 - PILL_W1 / 2, cy: 23, s: 7.6 };
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
  { a: OPEN_MOVE[0], b: OPEN_MOVE[1], to: SHOT_A, label: "open: rest, then search", ease: CAM_E },
  { a: CUT_ORDER, b: CUT_ORDER, to: SHOT_ORDER, label: "cut: the order" },
  { a: CUT_TPL, b: CUT_TPL, to: SHOT_B2, label: "cut: saved orders" },
  { a: CUT_LINES, b: CUT_LINES, to: SHOT_ORDER, label: "cut: lines land" },
  { a: PILL_SHOT, b: PILL_SHOT, to: SHOT_HEADER, label: "cut: header cart" },
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
