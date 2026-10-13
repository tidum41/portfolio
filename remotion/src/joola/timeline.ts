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

/* ---------- pass 15: LOCKED WIDE + PUSH-IN. Three still wide shots (Quick order, Cart, Order placed); the only
   camera moves are one short 1.15x push-in per micro-interaction (qty, Match kit popover, cart badge, credit), each
   eased in/out over 0.4s, holding while the change happens. Screens change by short fades. ---------- */
export const MORPH = [8, 32] as const; // logo glides from centre into the sidebar slot, dashboard dissolves in
export const UI_IN = MORPH[0];

/** Cursor clicks. The cursor arrives LEAD frames before each one. ENTER is a keypress (no cursor). */
export const LEAD = 6;
export const CLICK = { search: 42, qty: 92, tpl: 142, tplAdd: 158, add: 202, pill: 234, place: 282 };
export const ENTER = 62;
export const TYPE_SEARCH = [CLICK.search + 1, CLICK.search + 14] as const; // "Perseus", 2f/char
export const DROPDOWN_OPEN = 49;
export const RESULT_HOVER = [56, 59] as const;
export const INSERT = [ENTER, ENTER + 6] as const;
export const PUSH_QTY = [72, 84] as const;
export const TYPE_QTY = [CLICK.qty + 2, CLICK.qty + 6] as const; // "120": 1 -> 12 -> 120, values instant per key
export const QTY_SET = TYPE_QTY[1];
export const OUT_QTY = [108, 120] as const;
export const PUSH_TPL = [122, 134] as const;
export const TPL_HOVER = [CLICK.tpl - LEAD, CLICK.tplAdd] as const;
export const POP_IN = [CLICK.tpl, CLICK.tpl + 6] as const;
export const POP_HOVER = CLICK.tplAdd - LEAD; // hover darken on "Add to order" as the cursor arrives
export const TPL_ROWS = [CLICK.tplAdd + 6, CLICK.tplAdd + 16] as const;
export const OUT_TPL = [182, 194] as const;
export const PUSH_PILL = [206, 218] as const;
export const PILL_FILL = [220, 225] as const; // badge appears (scale .6 -> 1, 160ms), amount swaps instantly
export const HEADER_PAN = PUSH_PILL; // legacy name
export const CART_FADE = [CLICK.pill, CLICK.pill + 6] as const;
export const CART_CUT = CLICK.pill;
export const PUSH_CREDIT = [246, 258] as const;
export const CREDIT_ANIM = [262, 274] as const;
export const CONF_CUT = CLICK.place;
export const CONF_XFADE = [CONF_CUT, CONF_CUT + 8] as const;
export const CONF_HOLD = [CONF_XFADE[1], CONF_XFADE[1] + 24] as const;
export const END_FADE = [CONF_HOLD[1], CONF_HOLD[1] + 14] as const;
export const DURATION = END_FADE[1] + 8; // logo card holds 8f, then frame 0 (same card): seamless loop
export const MORPH_OUT = END_FADE;
export const POINTER_OFF = CLICK.place + 6;

export const CUTS: number[] = [];
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
export const UI_W = 1920;
export const UI_H = 1080;
export const INOUT_E = bezier(0.45, 0, 0.55, 1); // ease-in-out for the push-ins
export const WIDE: Cam = { cx: 868, cy: 540, s: 0.83 }; // Quick order + Cart: full dashboard, sidebar (x0) to rail/pill edge (x1712) + 24px
export const SEARCH_CAM = WIDE;
export const CART_CAM = WIDE; // same framing as Quick order, so the header pill holds its place across the fade
export const CONF_CAM: Cam = { cx: 670, cy: 504, s: 1.07 }; // Order placed: sidebar + header + panel (panel ends x1310)
/** Push-in 1.15x toward an element. x is kept inside the dashboard content (sidebar to rail edge + 24px), so a
 *  push never reveals empty page margin; vertically the page always fits, so it stays centred. */
const CONTENT_R = 1736;
const push = (cx: number, cy: number): Cam => {
  const s = WIDE.s * 1.15, hw = OW / 2 / s;
  return { cx: Math.min(Math.max(cx, hw), CONTENT_R - hw), cy, s };
};
export const MOVES: Move[] = [
  { a: PUSH_QTY[0], b: PUSH_QTY[1], to: push(1260, 290), label: "push 1.15x: qty + line total", ease: INOUT_E },
  { a: OUT_QTY[0], b: OUT_QTY[1], to: WIDE, label: "ease back to wide", ease: INOUT_E },
  { a: PUSH_TPL[0], b: PUSH_TPL[1], to: push(1600, 560), label: "push 1.15x: Match kit + popover", ease: INOUT_E },
  { a: OUT_TPL[0], b: OUT_TPL[1], to: WIDE, label: "ease back to wide", ease: INOUT_E },
  { a: PUSH_PILL[0], b: PUSH_PILL[1], to: push(1620, 23), label: "push 1.15x: header cart pill (clamped)", ease: INOUT_E },
  { a: CART_FADE[0], b: CART_FADE[0], to: CART_CAM, label: "fade to Cart, wide" },
  { a: PUSH_CREDIT[0], b: PUSH_CREDIT[1], to: push(1552, 320), label: "push 1.15x: credit line + Place order", ease: INOUT_E },
  { a: CONF_XFADE[0], b: CONF_XFADE[0], to: CONF_CAM, label: "fade to Order placed" },
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
    if (f < m.a) return clampCam(st);
    const from = clampCam(st);
    if (m.b === m.a) { st = m.to; continue; } // hard cut
    if (f <= m.b) {
      const u = (f - m.a) / (m.b - m.a);
      const t = (m.ease || CAM_E)(u);
      const to = clampCam(m.to);
      const s = lerp(from.s, to.s, t) - (m.dip || 0) * Math.sin(Math.PI * t);
      return clampCam({ cx: lerp(from.cx, to.cx, t), cy: lerp(from.cy, to.cy, t), s });
    }
    st = m.to;
  }
  return clampCam(st);
};
