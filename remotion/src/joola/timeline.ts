/**
 * Film timeline: pure numbers + camera maths, no Remotion imports, so
 * scripts/timeline-report.mjs can evaluate it in node (camera velocity vs content animation).
 *
 * Pass 40: 16.2s. Every beat through the logo fade-in is pass 38.
 * The extra 1.2s is hold on the settled logo (opacity 1, scale 1).
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
/** Middle of the film only. Symmetric ease-in-out. Not used on the open, and not from the cart cut. */
export const FLOW_E = bezier(0.65, 0, 0.35, 1);
/** Pill width, the dollar roll, and the count circle. Not the cursor, not the camera. */
export const PILL_E = bezier(0.22, 1, 0.36, 1);
export const INOUT_E = MOVE_E;
export const SETTLE = MOVE_E;
export const EASE_OUT = bezier(0.2, 0, 0, 1);
export const UI_E = EASE_OUT;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) => e(clamp01((f - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- pass 38 beats (450 frames, cart click at 326) ---------- */
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
/**
 * Pass 41. Two calm reads, 9 frames (0.3s) each. The summary read sits on the
 * cut, before the cursor travels. The confirmation read sits after the card
 * has recentered, before the UI fade. Every move between them keeps its length.
 */
export const CART_READ = 9;
export const CONF_READ = 9;
const afterCart = (n: number) => n + CART_READ;
const afterBoth = (n: number) => n + CART_READ + CONF_READ;
export const CLICK = { search: 50, result: 97, qty: 151, tpl: 223, tplAdd: 239, add: 282, pill: 326, place: afterCart(351) };
export const ENTER = CLICK.result;
export const TYPE_SEARCH = [CLICK.search + 2, CLICK.search + 16] as const;
export const DROPDOWN_OPEN = CLICK.search + 8;
/** Dropdown eases in over 8 frames. It finishes as the hold before the next travel starts. */
export const DROP_F = 8;
export const RESULT_HOVER = [CLICK.result - 2, CLICK.result] as const;
/**
 * After the line has landed and settled. 24 frames (800ms), ease-in-out.
 * The cursor stays on the result the whole way. Not the post-search move.
 */
export const ZOOM_OUT = [109, 133] as const;
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
/**
 * After the qty price has been read. One pull-back, 24 frames (800ms),
 * ease-in-out. The cursor stays on the 12 chip. The hold that follows is
 * the Saved label with Match kit under it. No cut on this move.
 */
export const REVEAL = [168, 192] as const;
/**
 * Popup is gone on this frame (u = 0). The zoom then eases to the order.
 * 22 frames, 733ms, ease-in-out. Not a cut.
 */
export const ZOOM_LINES = [CLICK.tplAdd + 4, CLICK.tplAdd + 4 + 22] as const;
/**
 * Kit lines start once their names are inside the moving frame (frame 260),
 * and finish as the zoom settles. 2 frames apart, 10-frame ease. They never
 * appear before the popup click. The cursor stays on Add to order.
 */
export const FILL = 260;
export const FILL_STAGGER = 2;
export const FILL_F = 10;
export const FILL_END = FILL + FILL_STAGGER * 2 + FILL_F;
/** "Add 4 lines to cart" measured width. The button is this wide from the first frame. */
export const ADD_W = 155;
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
/**
 * Digit roll, pill width, and the count circle share one window: the release
 * frame, then 14 frames (~467ms), one curve. They arrive on the same frame.
 */
export const PILL_ROLL = PILL_SHOT;
export const ROLL_PILL_F = 14;
export const PILL_FILL = [PILL_ROLL, PILL_ROLL + ROLL_PILL_F] as const;
export const PILL_BADGE = [PILL_ROLL, PILL_ROLL + ROLL_PILL_F] as const;
/** 400ms after the roll lands. The cursor stays under the pill until here. */
export const PILL_REST = PILL_ROLL + ROLL_PILL_F + 12;
/** Cursor reaches the cart icon after that hold, and dwells before the click. */
export const PILL_ARRIVE = PILL_REST + 11;

/** One eased t for the pill's width, the digits, and the count circle. */
export const pillMotion = (f: number) =>
  f >= PILL_ROLL ? prog(f, PILL_ROLL, PILL_ROLL + ROLL_PILL_F, PILL_E) : 0;

/**
 * Sub-pixel box. Width, the amount window, and the badge share one t, so
 * they land together. At the ends the box is the tabular 86 and 143.
 * `pull` cancels the 8px flex gap until the circle has room.
 */
export const pillBox = (f: number) => {
  const t = pillMotion(f);
  const amt = lerp(PILL_AMT0, PILL_AMT1, t);
  const extra = t <= 0 ? 0 : 28 * t;
  return { t, amt, badge: 20 * t, pull: -8 * (1 - t), w: 48 + amt + extra };
};
/**
 * Hard cut to the cart summary. Everything from here to the last frame is the
 * pass-32 Place order / Order placed / logo outro block, shifted so the film
 * ends at frame 419.
 */
export const CART_CUT = 330;
export const CART_FADE = [CART_CUT, CART_CUT] as const;
export const PAN_CART = [CART_CUT, CART_CUT] as const;
export const CREDIT_ANIM = [CART_CUT, CART_CUT] as const;
/** "Place order" crossfades to the processing face. Done as the hold becomes readable. */
export const PROC_XFADE = [afterCart(354), afterCart(358)] as const;
/** Press, then "Placing order" holds ~0.73s once the label is solid. */
export const PROC = [afterCart(354), afterCart(377)] as const;
/** Whole-button colour, 5 frames ≈ 167ms, then the check stroke, 8 frames ≈ 267ms. */
export const PLACE_COLOR = [afterCart(364), afterCart(369)] as const;
export const CHECK_DRAW = [afterCart(369), afterCart(377)] as const;
/** "Order placed" on the green button, ~0.4s. */
export const SUCCESS_HOLD = [afterCart(377), afterCart(383)] as const;
/** Summary content fades. The card chrome stays. */
export const CONF_FADE = [afterCart(383), afterCart(387)] as const;
export const CONF_CUT = afterCart(387);
/** Top-anchored height ease, ~300ms, MOVE_E. */
export const CONF_GROW = [afterCart(387), afterCart(396)] as const;
/** Short recenter once the card has grown. */
export const CONF_RECENTER = [afterCart(402), afterCart(412)] as const;
export const CONF_SETTLE = CONF_GROW;
export const CONF_MORPH = CONF_GROW;
export const CONF_XFADE = CONF_FADE;
/** Hold Order placed, plus the 0.3s calm read, then fade the UI. */
export const CONF_HOLD = [afterCart(412), afterBoth(422)] as const;
/** UI fades to the solid ground, then the logo fades and scales 0.96→1 over 9 frames (300ms). */
export const UI_OUT = [afterBoth(422), afterBoth(430)] as const;
export const LOGO_IN = [afterBoth(430), afterBoth(439)] as const;
/** Logo settles, then holds. 504 frames is 16.8s. */
export const END_FADE = [UI_OUT[0], afterBoth(485)] as const;
export const DURATION = END_FADE[1] + 1;
export const MORPH_OUT = END_FADE;
export const POINTER_OFF = END_FADE[1];

export const CUTS: number[] = [PILL_SHOT, CART_CUT, CONF_CUT];
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["results dropdown", DROPDOWN_OPEN, DROPDOWN_OPEN + DROP_F],
  ["row insert", INSERT[0], INSERT[1]],
  ["zoom out to the line", ZOOM_OUT[0], ZOOM_OUT[1]],
  ["qty digit roll", CLICK.qty, CLICK.qty + ROLL_F],
  ["pull back to saved orders", REVEAL[0], REVEAL[1]],
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
 * and the Unit price header are not sliced letters.
 */
/** Wide enough that the search field's right radius is whole, and Upload CSV stays out. */
export const SHOT_OPEN: Cam = { cx: 328, cy: 210, s: 2.24 };
/**
 * Search field. Frame stops at the field (page x ~648) so the Unit price
 * header is not sliced, and Quick order stays whole on the left.
 */
export const SHOT_A: Cam = { cx: 440, cy: 148.4, s: 3.45 };
/** Qty row, below the search field so that field is not a sliced pill. */
export const SHOT_B: Cam = { cx: 803, cy: 332.4, s: 3.3 };
/**
 * Add to order. Match kit is whole; the card above and the footer
 * Add button are outside the frame so nothing is sliced.
 */
/** Old Match kit macro. Not a camera target. */
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
/**
 * Qty chips, the unit price, and the line total, close enough to read at a
 * 400px card. s=3 puts a 12px chip near 10px and a 14px price near 12px at
 * that width. The frame holds the resting cursor, the price, the chips, and
 * the line total. The product name was already read in the search close-up.
 */
export const SHOT_QTY: Cam = { cx: 782, cy: 360, s: 3 };
/**
 * Qty chip, the Saved label, Match kit, and the popup in one hold.
 * s=2.55 is the largest scale that keeps the resting cursor and the popup
 * inside together, so the pull-back does not need a second move.
 */
export const SHOT_SAVED: Cam = { cx: 1016, cy: 486, s: 2.55 };
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
  { a: ZOOM_OUT[0], b: ZOOM_OUT[1], to: SHOT_QTY, label: "zoom out: the line", ease: FLOW_E },
  { a: REVEAL[0], b: REVEAL[1], to: SHOT_SAVED, label: "pull back: saved orders", ease: FLOW_E },
  { a: ZOOM_LINES[0], b: ZOOM_LINES[1], to: SHOT_ORDER, label: "zoom out: kit lines", ease: FLOW_E },
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
