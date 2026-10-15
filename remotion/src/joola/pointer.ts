/**
 * p20: ONE continuous cursor. Keys are [frame, page point]. Between two different
 * points the cursor travels in screen space, so a camera hard cut mid-travel
 * does not teleport it. While it rests on one point it tracks that point.
 * Hover is geometric with latch — not elementFromPoint — so it cannot flicker.
 */
import { R } from "./proto-rects.generated";
import {
  camAt, CART_CUT, CLICK, CONF_FADE, EASE_OUT, lerp, MORPH, MOVE_E, OW, OH, PILL_ARRIVE, PILL_FILL, PILL_W0, PILL_W1,
  ADD_MOVE, OPEN_MOVE, PAN_AB, QTY_MOVE, ROWS_ZOOM, prog, type Cam,
} from "./timeline";

/** Cursor is on the search field two frames before that move ends. */
const OPEN_MOVE_END = OPEN_MOVE[1] - 2;

export type Pt = [number, number];
export type Rect = [number, number, number, number];
const ctr = (k: string): Pt => [R[k][0] + R[k][2] / 2, R[k][1] + R[k][3] / 2];
export const toScreen = (cam: Cam, x: number, y: number): Pt => [(x - cam.cx) * cam.s + OW / 2, (y - cam.cy) * cam.s + OH / 2];
export const toPage = (cam: Cam, x: number, y: number): Pt => [(x - OW / 2) / cam.s + cam.cx, (y - OH / 2) / cam.s + cam.cy];

const PILL_RIGHT = R["qo-search.cartPill"][0] + R["qo-search.cartPill"][2];
const PILL_CY = R["qo-search.cartPill"][1] + R["qo-search.cartPill"][3] / 2;

/** Hotspot targets (page px), each inside the real hit box. */
export const P = {
  start: [420, 280] as Pt,
  search: [330, 142] as Pt,
  result: [560, 198] as Pt,
  // Centre of the 12 preset chip.
  qty: [R["qo-search.preset12"][0] + R["qo-search.preset12"][2] / 2, R["qo-search.preset12"][1] + R["qo-search.preset12"][3] / 2] as Pt,
  tpl: [1130, 556] as Pt,
  tplAdd: [ctr("qo-search.tplAdd")[0], ctr("qo-search.tplAdd")[1]] as Pt,
  add: [ctr("qo-search.addBtn")[0], ctr("qo-search.addBtn")[1]] as Pt,
  // Hyperion row, on the thumbnail side of the name, so the new line is what the cursor is on.
  rowIn: [286, 358] as Pt,
  // Final cart icon (pill grows left). Not on the amount.
  pillIcon: [PILL_RIGHT - PILL_W1 + 20, PILL_CY] as Pt,
  // Right of the Place order label, well inside the button — not on the top edge.
  place: [ctr("cart.place")[0] + 48, ctr("cart.place")[1]] as Pt,
  // Below the summary button, off the "Placing order" label.
  away: [1160, 448] as Pt,
};
export type Key = [number, Pt];
export const KEYS: Key[] = [
  [MORPH[1], P.start],
  // Lands during the open move. The travel from frame 11 is still 19 frames.
  [OPEN_MOVE_END, P.search],
  [CLICK.search + 15, P.search],
  // 7-frame travel onto the result, then a short hold, then the camera.
  [CLICK.result - 3, P.result],
  [QTY_MOVE[0], P.result],
  [QTY_MOVE[1], P.qty],
  // Stay on the chip until the camera leaves. Sliding across "12" on the still
  // reads as the number drifting under the cursor.
  [PAN_AB[0], P.qty],
  [CLICK.tpl - 3, P.tpl],
  [CLICK.tpl + 4, P.tpl],
  // Settled on Add to order before the press. The zoom starts the next move.
  [CLICK.tplAdd - 8, P.tplAdd],
  // The zoom reveals the lines. The cursor arrives on the new line as it settles,
  // holds, then travels onto Add to cart before the press.
  [ROWS_ZOOM[0], P.tplAdd],
  [ROWS_ZOOM[1], P.rowIn],
  [ADD_MOVE[0], P.rowIn],
  [ADD_MOVE[1], P.add],
  // Press is 3 frames. Then a straight travel up to the header cart, landing
  // the frame before the close-up so the cut opens with the cursor on the icon.
  [CLICK.add + 3, P.add],
  [PILL_ARRIVE, [PILL_RIGHT - PILL_W0 + 20, PILL_CY]],
  // The cut is the click. Land just above Place order, then settle onto it.
  // A screen-space blend from the pill icon would drop the cursor on the credit line.
  [CART_CUT, [P.place[0], P.place[1] - 28]],
  [CLICK.place - 9, P.place],
  [CLICK.place + 2, P.place],
  [CLICK.place + 10, P.away],
  [CONF_FADE[0], P.away],
];
const sp = (k: Key): Pt => toScreen(camAt(k[0]), k[1][0], k[1][1]);
export const pointerAt = (f: number): Pt => {
  // Ride the cart icon while the pill grows left. Same curve as the width,
  // so the cursor stays on the icon instead of waiting in the space it opens.
  if (f >= PILL_ARRIVE && f < CART_CUT) {
    const r = pillRectAt(f);
    return toScreen(camAt(f), r[0] + 20, r[1] + r[3] / 2);
  }
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

/** Pill hugs: right edge fixed, width eases empty → filled on the UI ease-out. */
export const pillRectAt = (f: number): Rect => {
  const t = f >= PILL_FILL[0] ? prog(f, PILL_FILL[0], PILL_FILL[1], EASE_OUT) : 0;
  const w = lerp(PILL_W0, PILL_W1, t);
  return [PILL_RIGHT - w, R["qo-search.cartPill"][1], w, R["qo-search.cartPill"][3]];
};

/** The qty beat is a chip click, so the pointer stays an arrow. */
export const cursorKind = (_f: number): "arrow" | "ibeam" => "arrow";

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
export type HoverId = "result" | "qty" | "tpl" | "tplAdd" | "add" | "pill" | "place";
export const hoverState = (frame: number): { id: HoverId; sel: string; active: boolean }[] => {
  const specs: { id: HoverId; sel: string; rectAt: (f: number) => Rect; from: number; until: number; click: number; press: number }[] = [
    { id: "result", sel: "[data-search-result]", rectAt: fixed(R["qo-search.result"]), from: CLICK.result - 20, until: CLICK.result + 4, click: CLICK.result, press: 4 },
    { id: "qty", sel: "[data-set-perseus='12']", rectAt: fixed(R["qo-search.preset12"]), from: CLICK.qty - 16, until: CLICK.qty + 4, click: CLICK.qty, press: 4 },
    { id: "tpl", sel: "[data-template='tpl-match']", rectAt: fixed(R["qo-search.tplMatch"]), from: CLICK.tpl - 24, until: CLICK.tplAdd + 4, click: CLICK.tpl, press: 4 },
    { id: "tplAdd", sel: "[data-tpl-apply='add']", rectAt: fixed(R["qo-search.tplAdd"]), from: CLICK.tplAdd - 20, until: CLICK.tplAdd + 4, click: CLICK.tplAdd, press: 4 },
    // Add to cart: the press is 3 frames. Hover ends with it.
    { id: "add", sel: "[data-add-all]", rectAt: fixed(R["qo-search.addBtn"]), from: CLICK.add - 24, until: CLICK.add + 3, click: CLICK.add, press: 3 },
    // Hover, then a 3-frame colour press. The cut on the next frame is the click.
    { id: "pill", sel: "[data-cart-pill]", rectAt: pillRectAt, from: PILL_ARRIVE, until: CART_CUT, click: CLICK.pill, press: 3 },
    { id: "place", sel: "[data-place-order]", rectAt: fixed(R["cart.place"]), from: CART_CUT, until: CLICK.place + 4, click: CLICK.place, press: 4 },
  ];
  return specs
    .filter((s) => latched(frame, s.rectAt, s.from, s.until))
    .map((s) => ({ id: s.id, sel: s.sel, active: s.click >= 0 && frame >= s.click && frame < s.click + s.press }));
};

/**
 * 2.2× the original 1.25 (2.75× the SVG). Drawn at that size, so the arrow
 * stays a vector at card width. The tip fraction does not change with scale,
 * so the hotspot stays on the point. Press dips to 0.9, then eases back.
 */
export const cursorScale = (f: number) => {
  const base = 1.25 * 2.2;
  for (const c of Object.values(CLICK)) {
    const d = f - c;
    if (d >= 0 && d < 3) return base * 0.9;
    if (d >= 3 && d < 7) return base * lerp(0.9, 1, (d - 3) / 4);
  }
  return base;
};
export const CLICK_TARGETS: [keyof typeof CLICK, string][] = [
  ["search", "qo-search.search"], ["result", "qo-search.result"], ["qty", "qo-search.preset12"], ["tpl", "qo-search.tplMatch"],
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
