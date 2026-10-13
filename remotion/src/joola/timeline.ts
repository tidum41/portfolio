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
export const CAM_E = bezier(0.45, 0, 0.15, 1); // quick, ease-out weighted
export const PUSH_E = bezier(0.33, 0.4, 0.2, 1); // strong ease-out; 12% on frame 1 so it reads as a push, not a cut
export const SETTLE = bezier(0.33, 1, 0.68, 1);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) => e(clamp01((f - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- beats (frames) — pass 7: 12.0s, snappy ---------- */
export const LOGO_IN = [0, 10] as const; // centre -> sidebar slot
export const SIDEBAR_IN = [8, 16] as const; // sidebar grows out of the logo
export const CONTENT_IN = [12, 20] as const; // content area slides in

export const CLICK = { search: 35, result: 54, preset: 81, qty: 92, add: 122, pill: 152, po: 182, place: 226, msg: 274 };
export const TYPE_SEARCH = [CLICK.search + 1, CLICK.search + 15] as const; // "Perseus", 2f/char
export const DROPDOWN_OPEN = CLICK.search + 7; // after "Per"
export const INSERT = [CLICK.result + 1, CLICK.result + 6] as const;
export const NAME_HOLD = [INSERT[1], INSERT[1] + 6] as const; // Perseus name + $179.97 read before the pan
export const PRESET_COUNT = [CLICK.preset + 1, CLICK.preset + 2] as const; // instant snap
export const PRICE_FLASH = [CLICK.preset + 1, CLICK.preset + 9] as const; // ~0.25s subtle tier-price highlight
export const QTY_SELECT = [CLICK.qty, CLICK.qty + 1] as const;
export const QTY_KEYS = [[CLICK.qty + 1, "120"]] as const; // 120 set directly
export const QTY_COMMIT = CLICK.qty + 2;
export const QTY_COUNT = [QTY_COMMIT + 1, QTY_COMMIT + 2] as const; // instant
export const QTY_SETTLE_HOLD = [QTY_COUNT[1], 108] as const; // read $16,197.60
export const PILL_FILL = [140, 148] as const; // pill total snaps, badge pops 1 -> 1.2 -> 1
export const PUSH = 12; // 0.4s screen push, strong ease-out
export const TYPE_PO = [CLICK.po + 1, CLICK.po + 9] as const; // ENG-9812, 1f/char
export const CREDIT_ANIM = [208, 216] as const;
export const HOLD_CREDIT = [216, CLICK.place] as const;
export const HOLD_CONF = [254, 272] as const;
export const BUBBLE = [302, 307] as const;
export const HOLD_REPLY = [307, 325] as const;
export const CONTENT_OUT = [339, 346] as const;
export const SIDEBAR_OUT = [344, 352] as const;
export const LOGO_OUT = [350, 360] as const;
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
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["result click + row insert", CLICK.result, INSERT[1]],
  ["Perseus name hold", NAME_HOLD[0], NAME_HOLD[1]],
  ["preset 24 snap + price highlight", CLICK.preset, PRICE_FLASH[1]],
  ["qty 120 + hold", CLICK.qty, QTY_SETTLE_HOLD[1]],
  ["add click + Added", CLICK.add, CLICK.add + 6],
  ["pill snap + badge pop", PILL_FILL[0], PILL_FILL[1]],
  ["pill click + push to cart", CLICK.pill, CLICK.pill + 2 + PUSH],
  ["PO typing", CLICK.po, TYPE_PO[1]],
  ["credit bar + hold", CREDIT_ANIM[0], HOLD_CREDIT[1]],
  ["place click + push to confirmation", CLICK.place, CLICK.place + 2 + PUSH],
  ["confirmation hold", HOLD_CONF[0], HOLD_CONF[1]],
  ["message click + push to messages", CLICK.msg, CLICK.msg + 2 + PUSH],
  ["Collin reply bubble + hold", BUBBLE[0], HOLD_REPLY[1]],
  ["content out", CONTENT_OUT[0], CONTENT_OUT[1]],
  ["sidebar collapse", SIDEBAR_OUT[0], SIDEBAR_OUT[1]],
  ["logo out", LOGO_OUT[0], LOGO_OUT[1]],
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
export const MOVES: Move[] = [
  { a: 20, b: 33, to: { cx: 600, cy: 330, s: 1.9 }, label: "to search" },
  { a: 66, b: 79, to: { cx: 1060, cy: 280, s: 2.0 }, label: "to Perseus qty + line total" },
  { a: 108, b: 120, to: { cx: 1500, cy: 520, s: 1.9 }, label: "to add button" },
  { a: 128, b: 139, to: { cx: 1541, cy: 284, s: 1.9 }, label: "pan up to cart pill (no zoom)" },
  { a: 167, b: 180, to: { cx: 560, cy: 430, s: 1.85 }, label: "to PO field" },
  { a: 194, b: 207, to: { cx: 1368, cy: 260, s: 2.0 }, label: "to summary + credit" },
  { a: 241, b: 253, to: { cx: 1070, cy: 270, s: 2.0 }, label: "to confirmation" },
  { a: 289, b: 301, to: { cx: 880, cy: 330, s: 1.8 }, label: "to Collin's reply" },
  { a: 325, b: 338, to: WIDE, label: "pull out to wide" },
];
export const clampCam = (c: Cam): Cam => ({
  s: c.s,
  cx: Math.min(Math.max(c.cx, OW / 2 / c.s), UI_W - OW / 2 / c.s),
  cy: Math.min(Math.max(c.cy, OH / 2 / c.s), UI_H - OH / 2 / c.s),
});
export const camAt = (f: number): Cam => {
  let st: Cam = WIDE;
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
