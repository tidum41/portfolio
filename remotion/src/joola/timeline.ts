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

/* ---------- pass 16: dense 1312x756 viewport, close framing, ONE story camera move.
   Shot A (search + qty, sidebar + header, 1.6x) -> pan to shot B (rows + Reorder rail + footer + header pill, 1.338x).
   Template, Add 4 to cart and the badge all play in B with the camera still; Cart and Order placed reuse B's framing
   (hard cut keeps the pill in place; staggered dissolve to Order placed). ---------- */
export const MORPH = [8, 32] as const; // logo glides from centre into the sidebar slot, dashboard dissolves in
export const UI_IN = MORPH[0];
export const LEAD = 6; // the cursor arrives a beat before each click
export const CLICK = { search: 44, qty: 86, tpl: 136, tplAdd: 152, add: 186, pill: 220, place: 262 };
export const ENTER = 64;
export const TYPE_SEARCH = [CLICK.search + 1, CLICK.search + 14] as const; // "Perseus", 2f/char
export const DROPDOWN_OPEN = 51;
export const RESULT_HOVER = [58, 61] as const;
export const INSERT = [ENTER, ENTER + 6] as const;
export const TYPE_QTY = [CLICK.qty + 2, CLICK.qty + 6] as const; // "120": 1 -> 12 -> 120, values instant per key
export const QTY_SET = TYPE_QTY[1];
export const PAN_AB = [104, 122] as const; // the one camera move: qty done -> Reorder rail (0.6s, p14 curve)
export const TPL_HOVER = [CLICK.tpl - LEAD, CLICK.tplAdd] as const;
export const POP_IN = [CLICK.tpl, CLICK.tpl + 6] as const;
export const POP_HOVER = CLICK.tplAdd - LEAD;
export const TPL_ROWS = [CLICK.tplAdd + 6, CLICK.tplAdd + 16] as const;
export const PAN_BC = [CLICK.add + 2, CLICK.add + 14] as const; // move 2: footer -> header pill (0.4s)
export const PILL_FILL = [PAN_BC[1], PAN_BC[1] + 5] as const; // badge fires as the pan lands (12f after the click)
export const CART_CUT = CLICK.pill; // hard cut, same camera: the pill does not move
export const CART_FADE = [CART_CUT, CART_CUT] as const;
export const CREDIT_ANIM = [CART_CUT + 12, CART_CUT + 24] as const;
export const CONF_CUT = CLICK.place;
export const CONF_XFADE = [CONF_CUT, CONF_CUT + 8] as const;
export const CONF_HOLD = [CONF_XFADE[1], CONF_XFADE[1] + 26] as const;
export const END_FADE = [CONF_HOLD[1], CONF_HOLD[1] + 14] as const;
export const DURATION = END_FADE[1] + 8; // logo card holds 8f, then frame 0 (same card): seamless loop
export const MORPH_OUT = END_FADE;
export const POINTER_OFF = CLICK.place + 6;
// legacy names (p15 push-ins removed)
export const PUSH_QTY = PAN_AB, OUT_QTY = PAN_AB, PUSH_TPL = PAN_AB, OUT_TPL = PAN_AB, PUSH_PILL = PAN_AB, PUSH_CREDIT = [CART_CUT, CART_CUT] as const;
export const HEADER_PAN = PAN_AB;

export const CUTS: number[] = [CART_CUT];
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["results + select", DROPDOWN_OPEN, RESULT_HOVER[1]],
  ["enter + row insert", ENTER, INSERT[1]],
  ["qty click + 120", CLICK.qty, TYPE_QTY[1]],
  ["template popover", CLICK.tpl, POP_IN[1]],
  ["template rows", TPL_ROWS[0], TPL_ROWS[1]],
  ["badge pop", PILL_FILL[0], PILL_FILL[1]],
  ["credit bar", CREDIT_ANIM[0], CREDIT_ANIM[1]],
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
export const PAN_E = bezier(0.5, 0, 0.4, 1); // p14 pan curve
/** Shot A: sidebar (logo slot) + search + rows through the qty column, 1.6x (body ~10.5px at 676). */
export const SHOT_A: Cam = { cx: 450, cy: 337.5, s: 1.6 };
/** Shot B: qty + line totals + Reorder rail + popover + footer Add button (x 553..1311, y 188..756), 1.9x (body ~12.5px). */
export const SHOT_B: Cam = { cx: 932, cy: 472, s: 1.9 };
/** Shot C: same columns, up to the header (y 0..568): cart pill badge; Cart reuses it so the pill holds across the cut. */
export const SHOT_C: Cam = { cx: 932, cy: 284, s: 1.9 };
/** Order placed: the panel (x 526..1006) optically centred with the header above, same 1.9x. */
export const SHOT_D: Cam = { cx: 766, cy: 284, s: 1.9 };
export const WIDE = SHOT_A;
export const CART_CAM = SHOT_C;
export const CONF_CAM = SHOT_D;
export const MOVES: Move[] = [
  { a: PAN_AB[0], b: PAN_AB[1], to: SHOT_B, label: "move 1: qty -> Reorder rail + footer", ease: PAN_E },
  { a: PAN_BC[0], b: PAN_BC[1], to: SHOT_C, label: "move 2: Add 4 to cart -> header pill", ease: PAN_E },
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
