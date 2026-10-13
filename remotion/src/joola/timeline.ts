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
export const CAM_E = bezier(0.65, 0, 0.35, 1);
export const SETTLE = bezier(0.33, 1, 0.68, 1);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) => e(clamp01((f - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- beats (frames) ---------- */
export const LOGO_IN = [0, 18] as const; // centre -> sidebar slot
export const SIDEBAR_IN = [14, 28] as const; // sidebar grows out of the logo
export const CONTENT_IN = [22, 34] as const; // content area slides in

export const CLICK = { search: 64, result: 92, preset: 124, qty: 138, add: 198, pill: 218, po: 283, place: 365, msg: 459 };
export const TYPE_SEARCH = [CLICK.search + 2, CLICK.search + 23] as const; // 7 chars, 3f each
export const DROPDOWN_OPEN = CLICK.search + 11; // after "Per"
export const INSERT = [CLICK.result + 2, CLICK.result + 12] as const;
export const PRESET_COUNT = [CLICK.preset + 1, CLICK.preset + 11] as const;
export const QTY_SELECT = [CLICK.qty, CLICK.qty + 5] as const; // "24" highlighted
export const QTY_KEYS = [[CLICK.qty + 5, "1"], [CLICK.qty + 10, "12"], [CLICK.qty + 15, "120"]] as const; // 5f per char
export const QTY_COMMIT = CLICK.qty + 22; // Enter after a visible beat with the caret after "120"
export const QTY_COUNT = [QTY_COMMIT + 1, QTY_COMMIT + 13] as const;
export const PILL_FILL = [CLICK.add + 2, CLICK.add + 14] as const;
export const PUSH = 33; // 1.1s screen push, camera still
export const TYPE_PO = [CLICK.po + 2, CLICK.po + 26] as const; // 8 chars, 3f each
export const CREDIT_ANIM = [343, 359] as const;
export const BUBBLE = [496, 508] as const;
export const HOLD_CONF = [421, 457] as const; // reading hold, camera + UI still
export const HOLD_REPLY = [508, 544] as const; // reading hold on Collin's reply
export const CONTENT_OUT = [576, 592] as const; // content area slides/fades away
export const SIDEBAR_OUT = [588, 604] as const; // sidebar collapses into its logo
export const LOGO_OUT = [602, 620] as const; // logo grows back to centre
export const DURATION = LOGO_OUT[1]; // last frame == frame 0 state

export const SCREENS: [string, number, number][] = [
  ["qo-desktop", -1, -1],
  ["cart", CLICK.pill + 2, CLICK.pill + 2 + PUSH],
  ["confirmation", CLICK.place + 2, CLICK.place + 2 + PUSH],
  ["messages", CLICK.msg + 2, CLICK.msg + 2 + PUSH],
];

/** Every UI (content) animation window. The camera must be still inside these. */
export const CONTENT_ANIMS: [string, number, number][] = [
  ["logo in", LOGO_IN[0], LOGO_IN[1]],
  ["sidebar in", SIDEBAR_IN[0], SIDEBAR_IN[1]],
  ["content in", CONTENT_IN[0], CONTENT_IN[1]],
  ["search focus + typing", CLICK.search, TYPE_SEARCH[1]],
  ["dropdown open", DROPDOWN_OPEN, DROPDOWN_OPEN + 6],
  ["result click + row insert", CLICK.result, INSERT[1]],
  ["preset 24 + count", CLICK.preset, PRESET_COUNT[1]],
  ["qty select + typing 120 + count", CLICK.qty, QTY_COUNT[1]],
  ["add click + pill fill", CLICK.add, PILL_FILL[1] + 8],
  ["pill click + push to cart", CLICK.pill, CLICK.pill + 2 + PUSH],
  ["PO typing", CLICK.po, TYPE_PO[1]],
  ["credit bar", CREDIT_ANIM[0], CREDIT_ANIM[1]],
  ["place click + push to confirmation", CLICK.place, CLICK.place + 2 + PUSH],
  ["confirmation reading hold", HOLD_CONF[0], HOLD_CONF[1]],
  ["message click + push to messages", CLICK.msg, CLICK.msg + 2 + PUSH],
  ["Collin reply bubble", BUBBLE[0], BUBBLE[1]],
  ["reply reading hold", HOLD_REPLY[0], HOLD_REPLY[1]],
  ["content out", CONTENT_OUT[0], CONTENT_OUT[1]],
  ["sidebar collapse", SIDEBAR_OUT[0], SIDEBAR_OUT[1]],
  ["logo out", LOGO_OUT[0], LOGO_OUT[1]],
];

/* ---------- camera ---------- */
export type Cam = { cx: number; cy: number; s: number };
export type Move = { a: number; b: number; to: Cam; label: string };
export const MOVES: Move[] = [
  { a: 34, b: 62, to: { cx: 600, cy: 338, s: 1.6 }, label: "to search + table" },
  { a: 104, b: 122, to: { cx: 860, cy: 300, s: 1.75 }, label: "to Perseus row" },
  { a: 174, b: 196, to: { cx: 985, cy: 432, s: 1.25 }, label: "to rows + footer + pill" },
  { a: 254, b: 281, to: { cx: 560, cy: 430, s: 1.85 }, label: "to PO field" },
  { a: 311, b: 341, to: { cx: 1552, cy: 260, s: 1.85 }, label: "to summary + credit" },
  { a: 401, b: 420, to: { cx: 1070, cy: 300, s: 1.6 }, label: "to confirmation (same framing for messages)" },
  { a: 545, b: 575, to: { cx: 960, cy: 540, s: 1.0 }, label: "pull out to full frame" },
];
export const clampCam = (c: Cam): Cam => ({
  s: c.s,
  cx: Math.min(Math.max(c.cx, 960 / c.s), 1920 - 960 / c.s),
  cy: Math.min(Math.max(c.cy, 540 / c.s), 1080 - 540 / c.s),
});
export const camAt = (f: number): Cam => {
  let st: Cam = { cx: 960, cy: 540, s: 1 };
  for (const m of MOVES) {
    if (f < m.a) return clampCam(st);
    const from = clampCam(st);
    if (f <= m.b) {
      const t = CAM_E((f - m.a) / (m.b - m.a));
      const to = clampCam(m.to);
      return clampCam({ cx: lerp(from.cx, to.cx, t), cy: lerp(from.cy, to.cy, t), s: lerp(from.s, to.s, t) });
    }
    st = m.to;
  }
  return clampCam(st);
};
