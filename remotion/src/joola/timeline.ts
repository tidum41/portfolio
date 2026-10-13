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
export const CAM_E = bezier(0.3, 0, 0, 1); // p11: smooth ease-out moves, no overshoot
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

/* ---------- pass 12: full dashboard, logo morph in/out, search, one-tap reorder ---------- */
export const MORPH = [8, 32] as const; // logo glides from centre into the sidebar slot (0.8s ease-out)
export const UI_IN = MORPH[0]; // dashboard appears under the moving logo
export const DURATION = 350; // 11.67s

/** Cursor clicks (press 0.9 for 3f, back over 4f). ENTER is a keypress (no cursor). */
export const CLICK = { search: 60, tpl: 122, add: 162, pill: 214, place: 266 };
export const ENTER = 80;
export const TYPE_SEARCH = [CLICK.search + 1, CLICK.search + 14] as const; // "Perseus", 2f/char
export const DROPDOWN_OPEN = 67;
export const RESULT_HOVER = [74, 77] as const;
export const INSERT = [ENTER, ENTER + 6] as const; // Perseus row: fade + 6px rise, 200ms (qty 1)
export const QO_ZOOM = [38, 54] as const; // the one zoom: wide 1.4 -> 1.75 (1.25x)
export const RAIL_PAN = [90, 106] as const; // pan to row totals + Reorder rail + Add (0.53s ease-out)
export const TPL_HOVER = [CLICK.tpl - 8, CLICK.tpl + 16] as const; // real :hover state on the saved template
export const QTY_SET = CLICK.tpl; // one tap: Perseus restock -> 120 / $134.98 / $16,197.60 (instant)
export const HEADER_PAN = [CLICK.add + 4, CLICK.add + 18] as const; // up to the real header (0.47s ease-out)
export const PILL_FILL = [HEADER_PAN[1], HEADER_PAN[1] + 5] as const; // amount swaps, badge 0.6 -> 1 over 160ms
export const PILL_CUT = -1; // unused (no isolated pill)
export const CART_CUT = CLICK.pill; // hard cut on the pill click
export const CREDIT_ANIM = [228, 240] as const; // number swaps at 228, bar width over 400ms
export const CONF_CUT = CLICK.place; // hard cut to the real confirmation screen
export const CONF_XFADE = [CONF_CUT, CONF_CUT + 6] as const; // panel 6px settle (no fade, cut)
export const OUT_ZOOM = [306, 322] as const; // back to the wide framing (1.25x out)
export const MORPH_OUT = [324, 348] as const; // logo lifts from the sidebar slot back to centre
export const LOGO_IN = MORPH_OUT; // compat
export const FADE_OUT = MORPH_OUT; // compat
export const POINTER_OFF = CLICK.place + 1; // cursor hidden on the confirmation + outro

export const SCREENS: [string, number, number][] = [
  ["qo-desktop", -1, -1],
  ["cart", CART_CUT, CART_CUT],
  ["confirmation", CONF_CUT, CONF_CUT],
];
/** Intentional hard cuts (frame where the new picture first appears). */
export const CUTS = [CART_CUT, CONF_CUT];

/** Every UI (content) animation window. The camera must be still inside these. */
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["results + select", DROPDOWN_OPEN, RESULT_HOVER[1]],
  ["enter + row insert", ENTER, INSERT[1]],
  ["template hover + tap", TPL_HOVER[0] + 8, CLICK.tpl + 7],
  ["badge pop", PILL_FILL[0] + 1, PILL_FILL[1]],
  ["credit bar", CREDIT_ANIM[0], CREDIT_ANIM[1]],
];

/* ---------- camera ---------- */
export type Cam = { cx: number; cy: number; s: number };
export type Move = { a: number; b: number; to: Cam; label: string };
/** Output frame = the portfolio card's 4:3 media slot; the UI itself is still laid out at 1920x1080. */
export const OW = 1440;
export const OH = 1080;
export const UI_W = 1920;
export const UI_H = 1080;
export const WIDE: Cam = { cx: 533, cy: 400, s: 1.35 }; // intro/outro framing: sidebar + header + table start
export const SEARCH_CAM: Cam = { cx: 514, cy: 386, s: 1.4 }; // wide: sidebar logo slot, header, search, table
export const MOVES: Move[] = [
  { a: QO_ZOOM[0], b: QO_ZOOM[1], to: { cx: 560, cy: 320, s: 1.75 }, label: "zoom 1.25x to search + table" },
  { a: RAIL_PAN[0], b: RAIL_PAN[1], to: { cx: 1370, cy: 420, s: 1.75 }, label: "pan to qty/line + Reorder rail + Add" },
  { a: HEADER_PAN[0], b: HEADER_PAN[1], to: { cx: 1370, cy: 0, s: 1.75 }, label: "pan up to the real header (clamped)" },
  { a: CART_CUT, b: CART_CUT, to: { cx: 1300, cy: 0, s: 1.75 }, label: "CUT to Cart: header + lines + summary" },
  { a: CONF_CUT, b: CONF_CUT, to: { cx: 1070, cy: 0, s: 1.75 }, label: "CUT to confirmation" },
  { a: OUT_ZOOM[0], b: OUT_ZOOM[1], to: { cx: 514, cy: 386, s: 1.4 }, label: "zoom out 1.25x to wide" },
];
// p10: no clamp; the camera centres each subject and the backdrop fills beyond the page
export const clampCam = (c: Cam): Cam => ({
  s: c.s,
  cx: Math.min(Math.max(c.cx, OW / 2 / c.s), UI_W - OW / 2 / c.s),
  cy: Math.min(Math.max(c.cy, OH / 2 / c.s), UI_H - OH / 2 / c.s),
});
export const camAt = (f: number): Cam => {
  let st: Cam = SEARCH_CAM;
  for (const m of MOVES) {
    if (f < m.a) return clampCam(st);
    const from = clampCam(st);
    if (m.b === m.a) { st = m.to; continue; } // hard cut
    if (f <= m.b) {
      const t = CAM_E((f - m.a) / (m.b - m.a));
      const to = clampCam(m.to);
      return clampCam({ cx: lerp(from.cx, to.cx, t), cy: lerp(from.cy, to.cy, t), s: lerp(from.s, to.s, t) });
    }
    st = m.to;
  }
  return clampCam(st);
};
