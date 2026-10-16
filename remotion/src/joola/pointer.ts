/**
 * ONE continuous cursor. Keys are [frame, page point]. Between two different
 * points the cursor travels in screen space, so a camera hard cut mid-travel
 * does not teleport it. While it rests on one point it tracks that point.
 * Two keys that share one array track the page point through a cut and jump.
 * Every control the tip crosses takes hover from that tip. The tip is the
 * painted arrow tip, after the camera and the cursor scale. Hover turns on
 * 2 stage-px inside and turns off the instant the tip leaves the rect.
 */
import { R } from "./proto-rects.generated";
import {
  ADD_W, camAt, CART_CUT, CLICK, CONF_FADE, CUT_TPL, DROPDOWN_OPEN, DURATION, FILL, FILL_STAGGER, FLOW_E, FPS, INSERT, lerp, MORPH, OW, OH, PILL_ARRIVE, PILL_ROLL, PILL_SHOT, PILL_W1, ROLL_PILL_F,
  OPEN_MOVE, PTR_E, SHOT_B2, SHOT_HEADER, SHOT_ORDER, SHOT_QTY, pillBox, prog, type Cam,
} from "./timeline";

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
  // Centre of the reserved 155px box. The right edge stays the prototype's.
  add: [R["qo-search.addBtn"][0] + R["qo-search.addBtn"][2] - ADD_W / 2, R["qo-search.addBtn"][1] + R["qo-search.addBtn"][3] / 2] as Pt,
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

/** Gentle curve. Perpendicular bow, small enough that the path does not loop. */
const BOW = 0.06;

/** Screen-continuous landing in the Match kit close-up. The card is already under the tip. */
const tplLand: Pt = toPage(SHOT_B2, ...toScreen(SHOT_QTY, P.qty[0], P.qty[1]));
/** Add to cart's screen pixel, mapped into the header shot so the cut does not teleport. */
const headerLand: Pt = toPage(SHOT_HEADER, ...toScreen(SHOT_ORDER, P.add[0], P.add[1]));

export const KEYS: Key[] = [
  [MORPH[1], P.start],
  // The open push moves the page under a resting cursor.
  [OPEN_MOVE[1], P.start],
  // Onto the field, dwell, click, type, hold the results.
  [44, P.search],
  [72, P.search],
  [90, P.result],
  // Rest through the click, the line, and the zoom out. Same point, so the
  // camera move carries the cursor instead of the cursor travelling.
  [133, P.result],
  [145, P.qty],
  // Rest on 12 through the price and the read.
  [CUT_TPL - 1, P.qty],
  [CUT_TPL, tplLand],
  [179, P.tpl],
  // Rest through the template click and the popup opening.
  [191, P.tpl],
  [201, P.tplAdd],
  // Rest through the Add to order click, the cut back, the stagger, and the read.
  // Same point, so the cut keeps the cursor on the button that caused the lines.
  [241, P.tplAdd],
  [249, P.add],
  // Last pressed frame. The release is the cut, so this key cannot share that frame.
  [CLICK.add + 2, P.add],
  [PILL_SHOT, headerLand],
  // Same point through the roll, so the cursor does not travel across the amount.
  [PILL_ROLL + ROLL_PILL_F, headerLand],
  [PILL_ARRIVE, P.pillIcon],
  [CLICK.pill + 2, P.pillIcon],
  // Hold on the icon through the frame before the cut. A shared point with
  // the next key would slide the arrow off the pill during that hold.
  [CART_CUT - 1, [P.pillIcon[0], P.pillIcon[1]]],
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
  if (f <= KEYS[0][0]) return sp(KEYS[0]);
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [fa, pa] = KEYS[i], [fb, pb] = KEYS[i + 1];
    if (f <= fb) {
      if (pa === pb) return toScreen(camAt(f), pa[0], pa[1]);
      const a = sp(KEYS[i]), b = sp(KEYS[i + 1]);
      // PTR_E keeps frames 0–90 and the Place order approach. FLOW_E is only
      // a travel whose both keys sit strictly inside the rewritten section.
      const ease = fa > 90 && fb < CART_CUT ? FLOW_E : PTR_E;
      const t = prog(f, fa, fb, ease);
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const bow = BOW * Math.sin(Math.PI * t);
      return [lerp(a[0], b[0], t) + dy * bow, lerp(a[1], b[1], t) - dx * bow];
    }
  }
  return sp(KEYS[KEYS.length - 1]);
};
/**
 * 15% larger than pass 35's 1.25×1.6, and constant. The arrow is painted
 * outside the camera, so this is the on-screen size at every zoom. Press is
 * a colour change on the control. The cursor does not dip.
 */
export const CURSOR_SCALE = 1.25 * 1.6 * 1.15;
export const cursorScale = (_f: number) => CURSOR_SCALE;

/** Stage px → whole film px. Matches the cursor component. */
const snapFilm = (n: number) => Math.round(n * (1920 / OW)) / (1920 / OW);

/**
 * Painted arrow tip, in stage px. The svg is offset by the (1.7, 1.7) hotspot
 * and the path tip sits at (1.5, 1.5), then both are snapped the way the
 * component snaps them. Hover tests this point, not the unsnapped hotspot.
 */
export const cursorTip = (f: number): Pt => {
  const [x, y] = pointerAt(f);
  const w = 19 * cursorScale(f);
  const h = 25 * cursorScale(f);
  const left = snapFilm(x - (1.7 / 17) * w);
  const top = snapFilm(y - (1.7 / 22) * h);
  return [left + (1.5 / 17) * w, top + (1.5 / 22) * h];
};

export const pageAt = (f: number): Pt => toPage(camAt(f), ...cursorTip(f));
export const inRect = (p: Pt, r: Rect, pad = 0) =>
  p[0] >= r[0] - pad && p[0] <= r[0] + r[2] + pad && p[1] >= r[1] - pad && p[1] <= r[1] + r[3] + pad;

/** "Add 4 lines to cart", from the first frame. Right edge stays the prototype's. */
export const addRectAt = (_f: number): Rect => {
  const r = R["qo-search.addBtn"];
  const right = r[0] + r[2];
  return [right - ADD_W, r[1], ADD_W, r[3]];
};

/** Pill hugs: right edge fixed. Before the header cut the box is p33's 92px. */
export const pillRectAt = (f: number): Rect => {
  const w = f < PILL_SHOT ? 92 : pillBox(f).w;
  return [PILL_RIGHT - w, R["qo-search.cartPill"][1], w, R["qo-search.cartPill"][3]];
};

/** The qty beat is a chip click, so the pointer stays an arrow. */
export const cursorKind = (_f: number): "arrow" | "ibeam" => "arrow";

/**
 * Enter band, in stage px. Dividing by cam.s makes it the same on-screen
 * distance at every zoom. Exit is the rect boundary: a tip outside cannot
 * leave the control hovered.
 */
const HOVER_ENTER = 2;
/** Linear colour ramp while the tip is inside. 80ms at 30fps. */
const HOVER_STEP = 1 / (0.08 * FPS);

const edge = (p: Pt, r: Rect) => Math.min(p[0] - r[0], r[0] + r[2] - p[0], p[1] - r[1], r[1] + r[3] - p[1]);
const fixed = (r: Rect) => () => r;

export type HoverKind = "chip" | "result" | "row" | "rail" | "primary" | "outline" | "pill";
export type HoverHit = { id: string; sel: string; kind: HoverKind; mix: number; active: boolean };

type Spec = {
  id: string;
  sel: string;
  kind: HoverKind;
  rectAt: (f: number) => Rect;
  visible: (f: number) => boolean;
  click?: number;
  press?: number;
};

const popOpen = (f: number) => f >= CLICK.tpl && f < CLICK.tplAdd + 4;
const onQuickOrder = (f: number) => f < CART_CUT;

/**
 * Controls the tip actually crosses. Rows below Perseus and the popup
 * buttons exist only while they are on screen, so a later sweep through
 * their old coordinates does not light them up.
 */
const SPECS: Spec[] = [
  { id: "result", sel: "[data-search-result]", kind: "result", rectAt: fixed(R["qo-search.result"]), visible: (f) => f >= DROPDOWN_OPEN && f < INSERT[1], click: CLICK.result, press: 4 },
  { id: "dec", sel: "[data-product='perseus'] [data-action='dec']", kind: "chip", rectAt: fixed([721, 236.6, 36, 40]), visible: (f) => f >= INSERT[0] && onQuickOrder(f) },
  { id: "qty6", sel: "[data-set-perseus='6']", kind: "chip", rectAt: fixed([721, 277.6, 49, 28]), visible: (f) => f >= INSERT[0] && onQuickOrder(f) },
  { id: "qty", sel: "[data-set-perseus='12']", kind: "chip", rectAt: fixed(R["qo-search.preset12"]), visible: (f) => f >= INSERT[0] && onQuickOrder(f), click: CLICK.qty, press: 4 },
  { id: "qty24", sel: "[data-set-perseus='24']", kind: "chip", rectAt: fixed(R["qo-search.preset24"]), visible: (f) => f >= INSERT[0] && onQuickOrder(f) },
  { id: "rowPerseus", sel: "[data-product='perseus']", kind: "row", rectAt: fixed(R["qo-search.row0"]), visible: (f) => f >= INSERT[0] && onQuickOrder(f) },
  { id: "rowHyperion", sel: "[data-product='hyperion']", kind: "row", rectAt: fixed([248, 314.6, 768, 87]), visible: (f) => f >= FILL && onQuickOrder(f) },
  { id: "rowHc40", sel: "[data-product='hc40']", kind: "row", rectAt: fixed([248, 401.6, 768, 87]), visible: (f) => f >= FILL + FILL_STAGGER && onQuickOrder(f) },
  { id: "rowBag", sel: "[data-product='bag']", kind: "row", rectAt: fixed([248, 488.6, 768, 87]), visible: (f) => f >= FILL + FILL_STAGGER * 2 && onQuickOrder(f) },
  { id: "railPerseus", sel: "[data-template='tpl-perseus']", kind: "rail", rectAt: fixed([1055, 447.6, 206, 72]), visible: onQuickOrder },
  { id: "tpl", sel: "[data-template='tpl-match']", kind: "rail", rectAt: fixed(R["qo-search.tplMatch"]), visible: onQuickOrder, click: CLICK.tpl, press: 4 },
  { id: "tplAdd", sel: "[data-tpl-apply='add']", kind: "primary", rectAt: fixed(R["qo-search.tplAdd"]), visible: popOpen, click: CLICK.tplAdd, press: 4 },
  { id: "replace", sel: "[data-tpl-apply='replace']", kind: "outline", rectAt: fixed([1076, 643, 164, 32]), visible: popOpen },
  { id: "add", sel: "[data-add-all]", kind: "primary", rectAt: addRectAt, visible: onQuickOrder, click: CLICK.add, press: 3 },
  { id: "pill", sel: "[data-cart-pill]", kind: "pill", rectAt: pillRectAt, visible: onQuickOrder, click: CLICK.pill, press: 3 },
  { id: "place", sel: "[data-place-order]", kind: "primary", rectAt: fixed(R["cart.place"]), visible: (f) => f >= CART_CUT && f < CONF_FADE[0], click: CLICK.place, press: 4 },
];

type Mem = { on: boolean; mix: number };
const hoverMem = new Map<string, Mem[]>();

/** Pure in the frame. The ramp is integrated from frame 0 so a still matches the film. */
const hoverAt = (spec: Spec, frame: number): Mem => {
  let arr = hoverMem.get(spec.id);
  if (!arr) { arr = []; hoverMem.set(spec.id, arr); }
  if (arr[frame]) return arr[frame];
  let i = arr.length;
  let prev: Mem = i === 0 ? { on: false, mix: 0 } : arr[i - 1];
  for (; i <= frame; i++) {
    let on = prev.on;
    if (!spec.visible(i)) on = false;
    else {
      const m = edge(pageAt(i), spec.rectAt(i));
      const enter = HOVER_ENTER / camAt(i).s;
      if (!on && m >= enter) on = true;
      else if (on && m < 0) on = false;
    }
    const target = on ? 1 : 0;
    let mix = prev.mix + Math.sign(target - prev.mix) * Math.min(HOVER_STEP, Math.abs(target - prev.mix));
    // A colour outside the rect is a miss, including the frame the tip leaves.
    if (!on) mix = 0;
    prev = { on, mix };
    arr[i] = prev;
  }
  return arr[frame];
};

export const hoverState = (frame: number): HoverHit[] =>
  SPECS.flatMap((s) => {
    const { on, mix } = hoverAt(s, frame);
    const active = on && s.click != null && s.press != null && frame >= s.click && frame < s.click + s.press;
    if (mix <= 0 && !active) return [];
    return [{ id: s.id, sel: s.sel, kind: s.kind, mix, active }];
  });

const screenRect = (cam: Cam, r: Rect): Rect => {
  const [x0, y0] = toScreen(cam, r[0], r[1]);
  const [x1, y1] = toScreen(cam, r[0] + r[2], r[1] + r[3]);
  const left = Math.min(x0, x1), top = Math.min(y0, y1);
  return [left, top, Math.abs(x1 - x0), Math.abs(y1 - y0)];
};

export type HoverViolation = { frame: number; id: string; mix: number; active: boolean; reason: string };

/**
 * Every frame: a hovered or pressed control must contain the painted tip.
 * Pressed only inside that control's click window. 0.75 stage px covers the
 * film-pixel snap, and nothing looser.
 */
export const hoverAudit = () => {
  const violations: HoverViolation[] = [];
  for (let f = 0; f < DURATION; f++) {
    const tip = cursorTip(f);
    const cam = camAt(f);
    for (const h of hoverState(f)) {
      const spec = SPECS.find((s) => s.id === h.id);
      if (!spec) continue;
      const sr = screenRect(cam, spec.rectAt(f));
      if (!inRect(tip, sr, 0.75)) {
        violations.push({ frame: f, id: h.id, mix: +h.mix.toFixed(3), active: h.active, reason: "tip-outside" });
      }
      if (h.active && (spec.click == null || spec.press == null || f < spec.click || f >= spec.click + spec.press)) {
        violations.push({ frame: f, id: h.id, mix: +h.mix.toFixed(3), active: true, reason: "press-outside-click" });
      }
    }
  }
  return { ok: violations.length === 0, count: violations.length, sample: violations.slice(0, 24) };
};

export const CLICK_TARGETS: [keyof typeof CLICK, string][] = [
  ["search", "qo-search.search"], ["result", "qo-search.result"], ["qty", "qo-search.preset12"], ["tpl", "qo-search.tplMatch"],
  ["tplAdd", "qo-search.tplAdd"], ["add", "qo-search.addBtn"], ["place", "cart.place"],
];
export const clickReport = () =>
  CLICK_TARGETS.map(([k, rk]) => {
    const f = CLICK[k];
    const tip = cursorTip(f);
    const [px, py] = pageAt(f);
    const r = k === "add" ? addRectAt(f) : k === "pill" ? pillRectAt(f) : R[rk];
    const inside = px >= r[0] && px <= r[0] + r[2] && py >= r[1] && py <= r[1] + r[3];
    const margin = Math.min(px - r[0], r[0] + r[2] - px, py - r[1], r[1] + r[3] - py);
    return { click: k, frame: f, screen: [+tip[0].toFixed(1), +tip[1].toFixed(1)], page: [+px.toFixed(1), +py.toFixed(1)], target: rk, rect: r, inside, margin: +margin.toFixed(1) };
  });
