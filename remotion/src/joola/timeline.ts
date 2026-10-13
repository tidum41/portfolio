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
export const CAM_E = bezier(0.45, 0, 0.2, 1); // spec camera curve
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

export const UI_IN = 24; // logo card 0..23 (0.8s), cut to Quick order
export const DURATION = 330; // 11.0s

/** Cursor clicks (press 0.9 for 3f, back over 4f). ENTER is a keypress (no cursor). */
export const CLICK = { search: 42, qty: 98, add: 136, pill: 160, po: 180, place: 247 };
export const ENTER = 62;
export const TYPE_SEARCH = [CLICK.search + 1, CLICK.search + 14] as const; // "Perseus", 2f/char
export const DROPDOWN_OPEN = 49; // after "Per": fade + 6px rise over 6f
export const RESULT_HOVER = [56, 59] as const; // first result selected, bg over 3f
export const INSERT = [ENTER, ENTER + 6] as const; // Perseus row: fade + 6px rise, 200ms
export const QO_ZOOM = [68, 86] as const; // the one zoom on Quick order (0.6s), ends 0.4s before the qty click
export const QTY_SET = CLICK.qty; // 120 / $134.98 / $16,197.60 swap on the click frame
export const PILL_CUT = CLICK.add; // hard cut on the Add click
export const PILL_FILL = [PILL_CUT, PILL_CUT + 5] as const; // badge 0.6 -> 1 over 160ms, amount swaps instantly
export const CART_CUT = CLICK.pill; // hard cut on the pill click
export const TYPE_PO = [CLICK.po + 1, CLICK.po + 16] as const; // ENG-9812, 2f/char
export const CART_MOVE = [198, 216] as const; // the one camera move on Cart: PO -> summary (0.6s)
export const CREDIT_ANIM = [217, 229] as const; // number swaps at 217, bar width over 400ms
export const CONF_XFADE = [CLICK.place, CLICK.place + 8] as const; // cart cross-fades to the centred chip
export const CONF_ICON = [CONF_XFADE[1], CONF_XFADE[1] + 6] as const; // check: fade + 0.9 -> 1
export const CONF_TEXT = CONF_ICON[0] + 2; // text 2f later (fade + 6px rise, 2f stagger)
export const HOLD_CONF = [CONF_TEXT + 8, 304] as const;
export const FADE_OUT = [304, 313] as const; // 0.3s fade to the background colour
export const LOGO_IN = [313, 322] as const; // 0.3s logo fade-up, then hold == frame 0
export const POINTER_OFF = CLICK.place + 1; // cursor hidden on the confirmation + logo

export const SCREENS: [string, number, number][] = [
  ["qo-desktop", -1, -1],
  ["cart", CART_CUT, CART_CUT],
];
/** Intentional hard cuts (frame where the new picture first appears). */
export const CUTS = [UI_IN, PILL_CUT, CART_CUT];

/** Every UI (content) animation window. The camera must be still inside these. */
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["results in + select", DROPDOWN_OPEN, RESULT_HOVER[1]],
  ["enter + row insert", ENTER, INSERT[1]],
  ["qty click + 120", CLICK.qty, CLICK.qty + 7],
  ["badge pop", PILL_FILL[0] + 1, PILL_FILL[1]],
  ["PO click + typing", CLICK.po, TYPE_PO[1]],
  ["credit bar", CREDIT_ANIM[0], CREDIT_ANIM[1]],
  ["place click + crossfade + chip", CLICK.place, HOLD_CONF[1]],
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
export const SEARCH_CAM: Cam = { cx: 600, cy: 330, s: 1.7 }; // Quick order base: 14px text = 11.2px at 676
export const MOVES: Move[] = [
  { a: QO_ZOOM[0], b: QO_ZOOM[1], to: { cx: 1430, cy: 470, s: 2.0 }, label: "QO zoom 1.18x onto Perseus qty + Add" },
  { a: PILL_CUT, b: PILL_CUT, to: { cx: 1640, cy: 230, s: 2.3 }, label: "CUT to account + cart pill" },
  { a: CART_CUT, b: CART_CUT, to: { cx: 560, cy: 430, s: 1.85 }, label: "CUT to Cart, PO framing" },
  { a: CART_MOVE[0], b: CART_MOVE[1], to: { cx: 1368, cy: 260, s: 2.0 }, label: "Cart move 1.08x to summary + credit" },
];
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
