/**
 * Film timeline: pure numbers + camera maths, no Remotion imports, so
 * scripts/timeline-report.mjs can evaluate it in node (camera velocity vs content animation).
 *
 * Rules (critic passes 3 + 4):
 *  - camera moves and UI actions never overlap: camera first, settle, then the UI action
 *  - no zoom change bigger than 0.6x inside any 0.8s (24-frame) window
 *  - every state change follows a visible pointer click
 *  - screen pushes run with the camera still and last 1.0s
 *  - reading holds: Confirmation and Collin's reply ~1.2s each with nothing moving but the pointer
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
export const CAM_E = bezier(0.4, 0, 0.2, 1); // p13: soft start, long ease-out tail, no overshoot
export const PUSH_E = bezier(0.33, 0.4, 0.2, 1); // strong ease-out; 12% on frame 1 so it reads as a push, not a cut
export const SETTLE = bezier(0.33, 1, 0.68, 1);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) => e(clamp01((f - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- beats (frames) — pass 9: MOTION SPEC (motion-refs/report.md) ---------- */
// spec easings
export const UI_E = bezier(0.2, 0, 0, 1); // UI + state changes
export const FADE_E = bezier(0.4, 0, 0.2, 1); // fades
export const PTR_E = bezier(0.3, 0, 0, 1); // cursor travel

/* ---------- pass 17: one continuous cursor drives every change (hover, then press). Three story moves:
   A (search + first row) -> B (Reorder rail) -> B2 (rows + footer + header pill: Add and badge in one frame);
   hard cut to Cart on B2's framing, then move 3 to the order summary; dissolve to Order placed. ~8.9s. ---------- */
/** One curve family for every cursor and camera move. */
export const MOVE_E = bezier(0.45, 0, 0.25, 1);
export const MORPH = [6, 16] as const; // intro: logo card dissolves into shot A (mirror of the outro)
export const UI_IN = MORPH[0];
export const LEAD = 2; // hover settles this many frames before the press
export const CLICK = { search: 32, result: 57, qty: 74, tpl: 116, tplAdd: 130, add: 164, pill: 190, place: 226 };
export const ENTER = CLICK.result + 3; // the result shows its press, then the row is added
export const TYPE_SEARCH = [CLICK.search + 2, CLICK.search + 15] as const; // "Perseus", 2f/char
export const DROPDOWN_OPEN = 40;
export const RESULT_HOVER = [55, 57] as const;
export const INSERT = [ENTER, ENTER + 6] as const;
export const TYPE_QTY = [CLICK.qty + 2, CLICK.qty + 6] as const; // "120": 1 -> 12 -> 120, values instant per key
export const QTY_SET = TYPE_QTY[1];
export const PAN_AB = [92, 110] as const; // move 1: qty read -> Reorder rail (0.6s)
export const TPL_HOVER = [CLICK.tpl - LEAD, CLICK.tplAdd] as const;
export const POP_IN = [CLICK.tpl, CLICK.tpl + 6] as const;
export const POP_HOVER = CLICK.tplAdd - LEAD;
export const TPL_ROWS = [CLICK.tplAdd + 6, CLICK.tplAdd + 16] as const;
export const PAN_BC = [144, 160] as const; // move 2: ease out to rows + footer + header (Add and its badge in one frame)
export const PILL_FILL = [CLICK.add + 2, CLICK.add + 7] as const; // badge fires 2f after the press, same frame
export const CART_CUT = CLICK.pill; // hard cut on the pill click, same framing: pill and cursor stay put
export const CART_FADE = [CART_CUT, CART_CUT] as const;
export const PAN_CART = [194, 216] as const; // move 3: to the order summary (total, credit, Place order)
export const CREDIT_ANIM = [CART_CUT, CART_CUT] as const; // p17: Cart shows the prototype's real credit (no film-only animation)
export const CONF_CUT = CLICK.place + 3; // Place order shows its press before the dissolve
export const CONF_XFADE = [CONF_CUT, CONF_CUT + 8] as const;
export const CONF_HOLD = [CONF_XFADE[1], CONF_XFADE[1] + 15] as const;
export const END_FADE = [CONF_HOLD[1], CONF_HOLD[1] + 12] as const;
export const DURATION = END_FADE[1] + 6; // logo card holds 6f, then frame 0 (same card): seamless loop
export const MORPH_OUT = END_FADE;
export const POINTER_OFF = END_FADE[1];

export const CUTS: number[] = [CART_CUT];
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["results + select", DROPDOWN_OPEN, RESULT_HOVER[1]],
  ["result click + row insert", ENTER, INSERT[1]],
  ["qty click + 120", CLICK.qty, TYPE_QTY[1]],
  ["template popover", CLICK.tpl, POP_IN[1]],
  ["template rows", TPL_ROWS[0], TPL_ROWS[1]],
  ["badge pop", PILL_FILL[0], PILL_FILL[1]],
];

/* ---------- camera ---------- */
export type Cam = { cx: number; cy: number; s: number };
export type Move = { a: number; b: number; to: Cam; label: string; dip?: number; ease?: (t: number) => number };
/** Output frame = the portfolio card's 4:3 media slot; the UI itself is still laid out at 1920x1080. */
export const OW = 1440;
export const OH = 1080;
export const UI_W = 1312; // p16: film viewport (narrowest width where the table clears the rail), 4:3
export const UI_H = 756;
export const INOUT_E = bezier(0.45, 0, 0.55, 1); // ease-in-out for the push-ins
export const PAN_E = MOVE_E;
/** A: search + table through line total, content area only (x 220..1020); framed so title, search and row 1 sit optically centred. 1.8x */
export const SHOT_A: Cam = { cx: 620, cy: 230, s: 1.8 };
/** B: qty + line totals + Reorder rail + popover (x 553..1311, y 188..756), 1.9x */
export const SHOT_B: Cam = { cx: 932, cy: 472, s: 1.9 };
/** B2: rows from the product names, rail, footer Add button and header pill in one frame (x 280..1312), 1.395x */
export const SHOT_B2: Cam = { cx: 774, cy: 378, s: OW / 1076 }; // x 236..1312: "Quick order" title and Cart product names whole
/** Cart summary: line totals + summary + header pill, optically centred, 1.92x */
export const SHOT_SUM: Cam = { cx: 965, cy: 189, s: 1.92 }; // x 590..1340, y -92..470: lines + summary + pill, no cut-off PO field or ship-to "Change"
/** Order placed: panel centred under the header, 1.9x */
export const SHOT_D: Cam = { cx: 766, cy: 284, s: 1.9 };
export const WIDE = SHOT_A;
export const CART_CAM = SHOT_B2;
export const CONF_CAM = SHOT_D;
export const MOVES: Move[] = [
  { a: PAN_AB[0], b: PAN_AB[1], to: SHOT_B, label: "move 1: qty -> Reorder rail", ease: MOVE_E },
  { a: PAN_BC[0], b: PAN_BC[1], to: SHOT_B2, label: "move 2: ease out to footer + header pill", ease: MOVE_E },
  { a: PAN_CART[0], b: PAN_CART[1], to: SHOT_SUM, label: "move 3: Cart -> order summary", ease: MOVE_E },
  { a: CONF_CUT, b: CONF_CUT, to: SHOT_D, label: "dissolve to Order placed (centred)" },
];
// p10: no clamp; the camera centres each subject and the backdrop fills beyond the page
export const clampCam = (c: Cam): Cam => {
  const hw = OW / 2 / c.s, hh = OH / 2 / c.s;
  return {
    s: c.s,
    cx: 2 * hw >= UI_W ? UI_W / 2 : Math.min(Math.max(c.cx, hw), UI_W - hw),
    cy: 2 * hh >= UI_H ? UI_H / 2 : Math.min(Math.max(c.cy, hh), UI_H - hh),
  };
};
/** Confirmation is shown in its own centred camera (crossfade layer). */
export const confCam = (): Cam => clampCam(CONF_CAM);
export const camAt = (f: number): Cam => {
  let st: Cam = WIDE;
  for (const m of MOVES) {
    if (f < m.a) return st;
    const from = st;
    if (m.b === m.a) { st = m.to; continue; } // hard cut
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
