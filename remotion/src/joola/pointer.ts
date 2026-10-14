/**
 * p20: ONE continuous cursor. Keys are [frame, page point]. Between two different
 * points the cursor travels in screen space, so a camera hard cut mid-travel
 * does not teleport it. While it rests on one point it tracks that point.
 * Hover is geometric with latch — not elementFromPoint — so it cannot flicker.
 */
import { R } from "./proto-rects.generated";
import {
  camAt, CART_CUT, CLICK, lerp, MORPH, MOVE_E, OW, OH, PILL_FILL, PILL_SHOT,
  prog, type Cam,
} from "./timeline";

export type Pt = [number, number];
export type Rect = [number, number, number, number];
const ctr = (k: string): Pt => [R[k][0] + R[k][2] / 2, R[k][1] + R[k][3] / 2];
export const toScreen = (cam: Cam, x: number, y: number): Pt => [(x - cam.cx) * cam.s + OW / 2, (y - cam.cy) * cam.s + OH / 2];
export const toPage = (cam: Cam, x: number, y: number): Pt => [(x - OW / 2) / cam.s + cam.cx, (y - OH / 2) / cam.s + cam.cy];

const PILL_RIGHT = R["qo-search.cartPill"][0] + R["qo-search.cartPill"][2];
const PILL_CY = R["qo-search.cartPill"][1] + R["qo-search.cartPill"][3] / 2;
const PILL_W1 = 151;

/** Hotspot targets (page px), each inside the real hit box. */
export const P = {
  start: [420, 280] as Pt,
  search: [330, 142] as Pt,
  result: [560, 198] as Pt,
  qty: [770, 257] as Pt,
  tpl: [1130, 556] as Pt,
  tplAdd: [ctr("qo-search.tplAdd")[0], ctr("qo-search.tplAdd")[1]] as Pt,
  add: [ctr("qo-search.addBtn")[0] + 18, ctr("qo-search.addBtn")[1]] as Pt,
  // Final cart icon (pill grows left). Not on the amount.
  pillIcon: [PILL_RIGHT - PILL_W1 + 22, PILL_CY] as Pt,
  // Right of the Place order label, well inside the button — not on the top edge.
  place: [ctr("cart.place")[0] + 48, ctr("cart.place")[1]] as Pt,
};
export type Key = [number, Pt];
export const KEYS: Key[] = [
  [MORPH[1], P.start],
  [CLICK.search - 4, P.search],
  [CLICK.search + 15, P.search],
  [CLICK.result - 4, P.result],
  [CLICK.result + 3, P.result],
  [CLICK.qty - 4, P.qty],
  [CLICK.qty + 8, P.qty],
  [CLICK.tpl - 3, P.tpl],
  [CLICK.tpl + 4, P.tpl],
  [CLICK.tplAdd - 5, P.tplAdd],
  [CLICK.tplAdd + 6, P.tplAdd],
  [CLICK.add - 2, P.add],
  [CLICK.add + 4, P.add],
  // Travel across the pill hard cut, then rest on the icon while the total is read.
  [PILL_SHOT + 12, P.pillIcon],
  [CART_CUT - 6, P.pillIcon],
  // Travel across the summary hard cut and arrive inside Place order.
  [CART_CUT + 16, P.place],
  [CLICK.place + 4, P.place],
];
const sp = (k: Key): Pt => toScreen(camAt(k[0]), k[1][0], k[1][1]);
export const pointerAt = (f: number): Pt => {
  if (f <= KEYS[0][0]) return sp(KEYS[0]);
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [fa, pa] = KEYS[i], [fb, pb] = KEYS[i + 1];
    if (f <= fb) {
      if (pa === pb) return toScreen(camAt(f), pa[0], pa[1]);
      const a = sp(KEYS[i]), b = sp(KEYS[i + 1]);
      const t = prog(f, fa, fb, MOVE_E);
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const bow = 0.045 * Math.sin(Math.PI * t);
      return [lerp(a[0], b[0], t) + dy * bow, lerp(a[1], b[1], t) - dx * bow];
    }
  }
  return sp(KEYS[KEYS.length - 1]);
};
export const pageAt = (f: number): Pt => {
  const [sx, sy] = pointerAt(f);
  return toPage(camAt(f), sx, sy);
};
export const inRect = (p: Pt, r: Rect, pad = 0) =>
  p[0] >= r[0] - pad && p[0] <= r[0] + r[2] + pad && p[1] >= r[1] - pad && p[1] <= r[1] + r[3] + pad;

/** Pill hugs: right edge fixed, width eases empty → filled. */
export const pillRectAt = (f: number): Rect => {
  const t = f >= PILL_FILL[0] ? prog(f, PILL_FILL[0], PILL_FILL[1], MOVE_E) : 0;
  const w = lerp(R["qo-search.cartPill"][2], PILL_W1, f >= PILL_FILL[0] ? t : 0);
  return [PILL_RIGHT - w, R["qo-search.cartPill"][1], w, R["qo-search.cartPill"][3]];
};

/**
 * Hover turns on when the hotspot enters `rect` and stays on until `until`,
 * unless the cursor clearly leaves (14px) before the press window.
 * Pure function of frame — no hit-test, no per-frame class restart.
 */
export const latched = (frame: number, rectAt: (f: number) => Rect, from: number, until: number) => {
  if (frame < from || frame > until) return false;
  let on = false;
  const start = Math.max(from, frame - 48);
  for (let t = start; t <= frame; t++) {
    const p = pageAt(t);
    const rect = rectAt(t);
    if (inRect(p, rect, 0)) on = true;
    else if (on && !inRect(p, rect, 14) && t < until - 4) on = false;
  }
  return on;
};

const fixed = (r: Rect) => () => r;
export type HoverId = "result" | "tpl" | "tplAdd" | "add" | "pill" | "place";
export const hoverState = (frame: number): { id: HoverId; sel: string; active: boolean }[] => {
  const press = (c: number) => frame >= c && frame < c + 4;
  const specs: { id: HoverId; sel: string; rectAt: (f: number) => Rect; from: number; until: number; click: number }[] = [
    { id: "result", sel: "[data-search-result]", rectAt: fixed(R["qo-search.result"]), from: CLICK.result - 20, until: CLICK.result + 4, click: CLICK.result },
    { id: "tpl", sel: "[data-template='tpl-match']", rectAt: fixed(R["qo-search.tplMatch"]), from: CLICK.tpl - 24, until: CLICK.tplAdd + 4, click: CLICK.tpl },
    { id: "tplAdd", sel: "[data-tpl-apply='add']", rectAt: fixed(R["qo-search.tplAdd"]), from: CLICK.tplAdd - 20, until: CLICK.tplAdd + 4, click: CLICK.tplAdd },
    { id: "add", sel: "[data-add-all]", rectAt: fixed(R["qo-search.addBtn"]), from: CLICK.add - 24, until: CLICK.add + 4, click: CLICK.add },
    { id: "pill", sel: "[data-cart-pill]", rectAt: pillRectAt, from: PILL_SHOT, until: CART_CUT, click: -1 },
    { id: "place", sel: "[data-place-order]", rectAt: fixed(R["cart.place"]), from: CART_CUT, until: CLICK.place + 4, click: CLICK.place },
  ];
  return specs
    .filter((s) => latched(frame, s.rectAt, s.from, s.until))
    .map((s) => ({ id: s.id, sel: s.sel, active: press(s.click) }));
};

export const cursorScale = (f: number) => {
  for (const c of Object.values(CLICK)) {
    const d = f - c;
    if (d >= 0 && d < 3) return 0.9;
    if (d >= 3 && d < 7) return lerp(0.9, 1, (d - 2) / 4);
  }
  return 1;
};
export const CLICK_TARGETS: [keyof typeof CLICK, string][] = [
  ["search", "qo-search.search"], ["result", "qo-search.result"], ["qty", "qo-search.qty0"], ["tpl", "qo-search.tplMatch"],
  ["tplAdd", "qo-search.tplAdd"], ["add", "qo-search.addBtn"], ["place", "cart.place"],
];
export const clickReport = () =>
  CLICK_TARGETS.map(([k, rk]) => {
    const f = CLICK[k];
    const [sx, sy] = pointerAt(f);
    const [px, py] = toPage(camAt(f - 0.001), sx, sy);
    const r = R[rk];
    const inside = px >= r[0] && px <= r[0] + r[2] && py >= r[1] && py <= r[1] + r[3];
    const margin = Math.min(px - r[0], r[0] + r[2] - px, py - r[1], r[1] + r[3] - py);
    return { click: k, frame: f, screen: [+sx.toFixed(1), +sy.toFixed(1)], page: [+px.toFixed(1), +py.toFixed(1)], target: rk, rect: r, inside, margin: +margin.toFixed(1) };
  });
