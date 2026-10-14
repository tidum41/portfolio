/**
 * Film timeline: pure numbers + camera maths, no Remotion imports, so
 * scripts/timeline-report.mjs can evaluate it in node (camera velocity vs content animation).
 *
 * Pass 21: ~12s. Popover is opacity-only. Qty 120 is one frame.
 * The cart pill is one gesture: a beat on $0, one ease-out width, the total
 * swaps once the width can hold it, then the badge scales in. No bounce.
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
export const CAM_E = bezier(0.4, 0, 0.2, 1);
export const PUSH_E = bezier(0.33, 0.4, 0.2, 1);
export const SETTLE = bezier(0.33, 1, 0.68, 1);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) => e(clamp01((f - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const UI_E = bezier(0.2, 0, 0, 1);
export const FADE_E = bezier(0.4, 0, 0.2, 1);
export const PTR_E = bezier(0.3, 0, 0, 1);
export const MOVE_E = bezier(0.45, 0, 0.25, 1);
export const EASE_OUT = bezier(0.2, 0, 0, 1); // pill width + order settle
export const INOUT_E = bezier(0.45, 0, 0.55, 1);

/* ---------- pass 20 beats (~12.2s) ---------- */
/** Intro: logo glides into the sidebar slot on a dashboard shot (sidebar + header). */
export const MORPH = [4, 18] as const;
export const UI_IN = MORPH[0];
export const LEAD = 2;
/** Ease from the dashboard shot into the table shot before the first click. */
export const OPEN_MOVE = [20, 32] as const;
export const CLICK = { search: 36, result: 68, qty: 86, tpl: 118, tplAdd: 146, add: 182, place: 266 };
export const ENTER = CLICK.result + 3;
export const TYPE_SEARCH = [CLICK.search + 2, CLICK.search + 15] as const;
export const DROPDOWN_OPEN = CLICK.search + 8;
export const RESULT_HOVER = [CLICK.result - 2, CLICK.result] as const;
export const INSERT = [ENTER, ENTER + 6] as const;
/** Kept for API compat; no blue just-added tint. */
export const ROW_HL = [ENTER, ENTER] as const;
/** Value swaps 1 → 120 on the click frame. The range is a single frame. */
export const TYPE_QTY = [CLICK.qty, CLICK.qty] as const;
export const QTY_SET = CLICK.qty;
export const PAN_AB = [100, 114] as const; // move 1: qty -> reorder
export const TPL_HOVER = [CLICK.tpl - LEAD, CLICK.tplAdd] as const;
export const POP_IN = [CLICK.tpl, CLICK.tpl + 5] as const;
export const POP_HOVER = CLICK.tplAdd - LEAD;
export const TPL_ROWS = [CLICK.tplAdd + 6, CLICK.tplAdd + 16] as const;
export const PAN_BC = [166, 180] as const; // move 2: reorder -> Add button
/** Hard cut to a tight cart pill still showing $0.00. */
export const PILL_SHOT = 188;
export const PILL_W0 = 85;
export const PILL_W1 = 151;
/** Width at which "$19,306.50" fits next to the icon, before the badge takes space. */
export const PILL_NUM_W = 130;
/** Cursor lands on the empty cart icon, then rides it as the pill grows. */
export const PILL_ARRIVE = 200;
/** One ease-out (cubic-bezier 0.2,0,0,1) after the $0 beat. Not an ease-in-out. */
export const PILL_FILL = [200, 214] as const;
/** Badge is the last beat: scale 0.6→1 over 5 frames, overlapping the end of the width. */
export const PILL_BADGE = [213, 218] as const;
/** Hard cut to the cart summary: total + Place order are the hero. */
export const CART_CUT = 234;
export const CART_FADE = [CART_CUT, CART_CUT] as const;
export const PAN_CART = [CART_CUT, CART_CUT] as const; // no pan; hard cut
export const CREDIT_ANIM = [CART_CUT, CART_CUT] as const;
/** Hard cut after the Place order press, then an 8-frame scale settle. */
export const CONF_CUT = CLICK.place + 4;
export const CONF_SETTLE = [CONF_CUT, CONF_CUT + 8] as const;
export const CONF_MORPH = CONF_SETTLE; // alias so older imports still compile
export const CONF_XFADE = CONF_SETTLE;
/** Hold Order placed ~1.5s before the logo. */
export const CONF_HOLD = [CONF_SETTLE[1], CONF_SETTLE[1] + 45] as const;
export const END_FADE = [CONF_HOLD[1], CONF_HOLD[1] + 36] as const;
export const DURATION = END_FADE[1] + 6;
export const MORPH_OUT = END_FADE;
export const POINTER_OFF = END_FADE[1];

export const CUTS: number[] = [PILL_SHOT, CART_CUT, CONF_CUT];
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["results + select", DROPDOWN_OPEN, RESULT_HOVER[1]],
  ["result click + row insert", ENTER, INSERT[1]],
  ["qty click + 120", CLICK.qty, CLICK.qty + 1],
  ["template popover", CLICK.tpl, POP_IN[1]],
  ["template rows", TPL_ROWS[0], TPL_ROWS[1]],
  ["pill width + total + badge", PILL_FILL[0], PILL_BADGE[1]],
  ["order settle", CONF_SETTLE[0], CONF_SETTLE[1]],
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
 * Readable at 676px: card_px ≈ css_px * s * 676/1440.
 * Opening shot is wide enough to show the sidebar logo and the header bar.
 * After Add, shots are unclamped so an edge control (pill, summary) can sit in the centre.
 */
/** First screen: full sidebar (logo + nav) and the header bar, search still readable. */
export const SHOT_OPEN: Cam = { cx: 439, cy: 329, s: 1.64 };
/** A: search + Perseus row through the line total. */
export const SHOT_A: Cam = { cx: 605, cy: 300, s: 1.8 };
/** B: qty + Reorder rail + popover. */
export const SHOT_B: Cam = { cx: 925, cy: 455, s: 2.05 };
/** B2: the Add-to-cart framing from pass 19 (header pill + footer share the frame). */
export const SHOT_B2: Cam = { cx: 800, cy: 378, s: 1.48 };
/** Tight pill: filled pill centred. Crop stays under the search field. */
/** Pill update: full account chip stays in frame while the pill grows left. */
export const SHOT_PILL: Cam = { cx: 1112, cy: -12, s: 4.05 };
/**
 * Summary hero. cy is high enough that the card's top radius clears the frame
 * (cy 262 left only ~6px and clipped the top corners) and the Place order
 * button still clears the bottom. A header sliver would pull the line-item
 * prices in or shove the card off centre, so this shot stays on the card.
 */
export const SHOT_SUM: Cam = { cx: 1130, cy: 258, s: 3.75 };
/**
 * Order placed, centred. Frame top sits at y≈42 so the header's bottom rule
 * is in frame and the account chip (ends y≈41) is not sliced.
 */
export const SHOT_D: Cam = { cx: 766, cy: 241, s: 2.72 };

export const WIDE = SHOT_OPEN;
export const CART_CAM = SHOT_SUM;
export const CONF_CAM = SHOT_D;
export const MOVES: Move[] = [
  { a: OPEN_MOVE[0], b: OPEN_MOVE[1], to: SHOT_A, label: "open: dashboard -> table", ease: MOVE_E },
  { a: PAN_AB[0], b: PAN_AB[1], to: SHOT_B, label: "move 1: qty -> Reorder rail", ease: MOVE_E },
  { a: PAN_BC[0], b: PAN_BC[1], to: SHOT_B2, label: "move 2: Reorder -> Add", ease: MOVE_E },
  { a: PILL_SHOT, b: PILL_SHOT, to: SHOT_PILL, label: "cut: cart pill" },
  { a: CART_CUT, b: CART_CUT, to: SHOT_SUM, label: "cut: order summary" },
  { a: CONF_CUT, b: CONF_CUT, to: SHOT_D, label: "cut: order placed" },
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
