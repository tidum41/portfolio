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
export const CAM_E = bezier(0.4, 0, 0.2, 1); // calm, no overshoot
export const PUSH_E = bezier(0.33, 0.4, 0.2, 1); // strong ease-out; 12% on frame 1 so it reads as a push, not a cut
export const SETTLE = bezier(0.33, 1, 0.68, 1);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) => e(clamp01((f - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- beats (frames) — pass 8: no Messages, hard cuts, calm ease-outs ---------- */
export const UI_IN = 8; // logo card 0..7, hard cut into the UI
export const LOGO_CARD = 311; // hard cut from the confirmation hold to the logo card (== frame 0)
export const DURATION = 333;

export const CLICK = { search: 17, result: 45, preset: 79, qty: 95, add: 130, pill: 157, po: 191, place: 267 };
export const TYPE_SEARCH = [CLICK.search + 1, CLICK.search + 22] as const; // "Perseus", 3f/char
export const DROPDOWN_OPEN = CLICK.search + 7;
export const INSERT = [CLICK.result + 1, CLICK.result + 6] as const;
export const NAME_HOLD = [INSERT[1], 65] as const;
export const PRESET_COUNT = [CLICK.preset - 1, CLICK.preset] as const; // qty, price and line all snap on the click frame
export const PRICE_FLASH = [CLICK.preset, CLICK.preset + 7] as const; // subtle tier-price tint
export const HOLD_PRESET = [PRICE_FLASH[1], CLICK.qty] as const;
export const QTY_SELECT = [CLICK.qty, CLICK.qty + 1] as const;
export const QTY_KEYS = [[CLICK.qty + 1, "120"]] as const;
export const QTY_COMMIT = CLICK.qty + 1;
export const QTY_COUNT = [QTY_COMMIT - 1, QTY_COMMIT] as const; // line total snaps with the qty
export const QTY_SETTLE_HOLD = [QTY_COUNT[1], 115] as const;
export const ADDED = CLICK.add + 2; // button reads "Added" and the film hard-cuts to the pill
export const PILL_CUT = ADDED;
export const PILL_FILL = [PILL_CUT + 1, PILL_CUT + 6] as const; // total snaps; badge 1 -> 1.08 -> 1 (0.17s)
export const PUSH = 8; // cart crossfade 0.27s
export const TYPE_PO = [CLICK.po + 1, CLICK.po + 16] as const; // ENG-9812, 2f/char
export const CREDIT_ANIM = [236, 246] as const;
export const HOLD_CREDIT = [CREDIT_ANIM[1], CLICK.place] as const;
export const CONF_CUT = CLICK.place + 3; // hard cut to the centred confirmation
export const CONF_FADE = [CONF_CUT, CONF_CUT + 11] as const; // card fades up 10px in place
export const HOLD_CONF = [CONF_FADE[1], LOGO_CARD] as const;

export const SCREENS: [string, number, number][] = [
  ["qo-desktop", -1, -1],
  ["cart", CLICK.pill + 2, CLICK.pill + 2 + PUSH],
  ["confirmation", CONF_CUT, CONF_CUT], // no push: cut + fade-up
];
/** Intentional hard cuts (frame where the new picture first appears). */
export const CUTS = [UI_IN, PILL_CUT, CONF_CUT, LOGO_CARD];

/** Every UI (content) animation window. The camera must be still inside these. */
export const CONTENT_ANIMS: [string, number, number][] = [
  ["search click + typing", CLICK.search, TYPE_SEARCH[1]],
  ["result click + row insert", CLICK.result, INSERT[1]],
  ["Perseus name hold", NAME_HOLD[0], NAME_HOLD[1]],
  ["preset 24 snap + tint + hold", CLICK.preset, HOLD_PRESET[1]],
  ["qty 120 + hold", CLICK.qty, QTY_SETTLE_HOLD[1]],
  ["add click + Added", CLICK.add, ADDED],
  ["pill snap + badge pop", PILL_FILL[0], PILL_FILL[1]],
  ["pill click + push to cart", CLICK.pill, CLICK.pill + 2 + PUSH],
  ["PO typing", CLICK.po, TYPE_PO[1]],
  ["credit bar + hold", CREDIT_ANIM[0], HOLD_CREDIT[1]],
  ["place click", CLICK.place, CONF_CUT - 1],
  ["confirmation fade-up + hold", CONF_FADE[0] + 1, HOLD_CONF[1] - 1],
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
export const SEARCH_CAM: Cam = { cx: 600, cy: 330, s: 1.9 };
export const MOVES: Move[] = [
  { a: 65, b: 76, to: { cx: 1060, cy: 280, s: 2.0 }, label: "to Perseus qty + line total" },
  { a: 115, b: 126, to: { cx: 1500, cy: 520, s: 1.9 }, label: "to add button" },
  { a: PILL_CUT, b: PILL_CUT, to: { cx: 1640, cy: 230, s: 2.3 }, label: "HARD CUT to pill + account" },
  { a: 177, b: 188, to: { cx: 560, cy: 430, s: 1.85 }, label: "to PO field" },
  { a: 219, b: 230, to: { cx: 1368, cy: 260, s: 2.0 }, label: "to summary + credit" },
  { a: CONF_CUT, b: CONF_CUT, to: { cx: 1070, cy: 256, s: 2.0 }, label: "HARD CUT to centred confirmation" },
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
