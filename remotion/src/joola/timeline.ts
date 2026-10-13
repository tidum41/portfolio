/**
 * Film timeline: pure numbers + camera maths, no Remotion imports, so
 * scripts/timeline-report.mjs can evaluate it in node (camera velocity vs content animation).
 *
 * Pass 18: sidebar-visible framings, cart-pill width ease, Place-order→Order-placed morph,
 * single just-added row highlight. Still ≤3 story moves, ~9–10s, one continuous cursor.
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
export const EASE_OUT = bezier(0.2, 0, 0, 1); // pill width ~0.3s ease-out
export const INOUT_E = bezier(0.45, 0, 0.55, 1); // order morph ~0.45s ease-in-out

/* ---------- pass 18 beats ---------- */
/** Intro: logo glides into the sidebar slot while the dashboard fades up. */
export const MORPH = [4, 22] as const;
export const UI_IN = MORPH[0];
export const LEAD = 2;
export const CLICK = { search: 36, result: 61, qty: 78, tpl: 120, tplAdd: 134, add: 168, pill: 194, place: 230 };
export const ENTER = CLICK.result + 3;
export const TYPE_SEARCH = [CLICK.search + 2, CLICK.search + 15] as const;
export const DROPDOWN_OPEN = 44;
export const RESULT_HOVER = [59, 61] as const;
export const INSERT = [ENTER, ENTER + 6] as const;
/** Soft just-added highlight (single fade-out); hover suppressed while active. */
export const ROW_HL = [ENTER, ENTER + 14] as const;
export const TYPE_QTY = [CLICK.qty + 2, CLICK.qty + 6] as const;
export const QTY_SET = TYPE_QTY[1];
export const PAN_AB = [96, 114] as const; // move 1
export const TPL_HOVER = [CLICK.tpl - LEAD, CLICK.tplAdd] as const;
export const POP_IN = [CLICK.tpl, CLICK.tpl + 5] as const; // opacity only (no translate)
export const POP_HOVER = CLICK.tplAdd - LEAD;
export const TPL_ROWS = [CLICK.tplAdd + 6, CLICK.tplAdd + 16] as const;
export const PAN_BC = [148, 164] as const; // move 2
export const PILL_FILL = [CLICK.add + 2, CLICK.add + 11] as const; // width ease ~0.3s
export const CART_CUT = CLICK.pill;
export const CART_FADE = [CART_CUT, CART_CUT] as const;
export const PAN_CART = [198, 220] as const; // move 3
export const CREDIT_ANIM = [CART_CUT, CART_CUT] as const;
export const CONF_CUT = CLICK.place + 3;
/** Shared-element morph cart summary → Order placed panel (~0.45s). */
export const CONF_MORPH = [CONF_CUT, CONF_CUT + 14] as const;
export const CONF_XFADE = CONF_MORPH; // alias
export const CONF_HOLD = [CONF_MORPH[1], CONF_MORPH[1] + 16] as const;
export const END_FADE = [CONF_HOLD[1], CONF_HOLD[1] + 12] as const;
export const DURATION = END_FADE[1] + 6;
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
  ["badge + pill width", PILL_FILL[0], PILL_FILL[1]],
  ["order morph", CONF_MORPH[0], CONF_MORPH[1]],
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
 * 13px UI ≈ 10px on card needs s ≳ 1.64. Keep sidebar (220px) peeking on open/close + QO shots.
 */
/** A: sidebar logo/nav + search + row through line total (right edge clears $16,197.60). */
export const SHOT_A: Cam = { cx: 508, cy: 250, s: 1.48 };
/** B: qty + Reorder rail + popover (story move 1 target). */
export const SHOT_B: Cam = { cx: 900, cy: 470, s: 1.85 };
/** B2: Quick order title + rows + footer + full cart pill (right edge clear). Thin sidebar strip. */
export const SHOT_B2: Cam = { cx: 750, cy: 378, s: 1.28 };
/** Cart summary: subtotal + credit line + Place order fully in frame. */
export const SHOT_SUM: Cam = { cx: 1020, cy: 255, s: 1.55 };
/** Order placed: full confirmation panel (values unclipped). */
export const SHOT_D: Cam = { cx: 770, cy: 250, s: 1.4 };

export const WIDE = SHOT_A;
export const CART_CAM = SHOT_B2;
export const CONF_CAM = SHOT_D;
export const MOVES: Move[] = [
  { a: PAN_AB[0], b: PAN_AB[1], to: SHOT_B, label: "move 1: qty -> Reorder rail", ease: MOVE_E },
  { a: PAN_BC[0], b: PAN_BC[1], to: SHOT_B2, label: "move 2: ease out to footer + header pill", ease: MOVE_E },
  { a: PAN_CART[0], b: PAN_CART[1], to: SHOT_SUM, label: "move 3: Cart -> order summary", ease: MOVE_E },
  { a: CONF_MORPH[0], b: CONF_MORPH[1], to: SHOT_D, label: "morph to Order placed", ease: INOUT_E },
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
