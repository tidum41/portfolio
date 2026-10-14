/**
 * p19: ONE continuous cursor. Keys are [frame, page point]; each key is projected with the camera at its own frame and
 * the cursor travels between keys in screen space on MOVE_E with a slight arc.
 */
import { R } from "./proto-rects.generated";
import { createTimelineState, type TimelineState } from "./timeline-state";
import { DEFAULT_FILM_CONFIG } from "./film-config";

export type Pt = [number, number];
const ctr = (k: string): Pt => [R[k][0] + R[k][2] / 2, R[k][1] + R[k][3] / 2];

export const toScreen = (cam: { cx: number; cy: number; s: number }, x: number, y: number, OW = 1440, OH = 1080): Pt =>
  [(x - cam.cx) * cam.s + OW / 2, (y - cam.cy) * cam.s + OH / 2];
export const toPage = (cam: { cx: number; cy: number; s: number }, x: number, y: number, OW = 1440, OH = 1080): Pt =>
  [(x - OW / 2) / cam.s + cam.cx, (y - OH / 2) / cam.s + cam.cy];

export function buildPointerData(tl: TimelineState) {
  const { camAt, CLICK, MORPH, OW, OH, prog, lerp } = tl;
  const P = {
    start: [700, 330] as Pt,
    search: [330, 142] as Pt,
    result: [560, 198] as Pt,
    qty: [770, 257] as Pt,
    tpl: [1130, 556] as Pt,
    tplAdd: [ctr("qo-search.tplAdd")[0], ctr("qo-search.tplAdd")[1]] as Pt,
    add: [ctr("qo-search.addBtn")[0] + 22, ctr("qo-search.addBtn")[1] + 4] as Pt,
    pill: [1205, 23] as Pt,
    place: [ctr("cart.place")[0] + 70, ctr("cart.place")[1] + 4] as Pt,
  };
  type Key = [number, Pt];
  const KEYS: Key[] = [
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
    [CLICK.add + 12, P.add],
    [CLICK.pill - 5, P.pill],
    [CLICK.pill + 6, P.pill],
    [CLICK.place - 4, P.place],
  ];
  const sp = (k: Key): Pt => toScreen(camAt(k[0]), k[1][0], k[1][1], OW, OH);
  const pointerAt = (f: number): Pt => {
    if (f <= KEYS[0][0]) return sp(KEYS[0]);
    for (let i = 0; i < KEYS.length - 1; i++) {
      const [fa, pa] = KEYS[i], [fb, pb] = KEYS[i + 1];
      if (f <= fb) {
        if (pa === pb) return toScreen(camAt(f), pa[0], pa[1], OW, OH);
        const a = sp(KEYS[i]), b = sp(KEYS[i + 1]);
        const t = prog(f, fa, fb, tl.cursorMoveE);
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const bow = 0.08 * Math.sin(Math.PI * t);
        return [lerp(a[0], b[0], t) + dy * bow, lerp(a[1], b[1], t) - dx * bow];
      }
    }
    return sp(KEYS[KEYS.length - 1]);
  };
  const cursorScale = (f: number) => {
    for (const c of Object.values(CLICK)) {
      const d = f - c;
      if (d >= 0 && d < 3) return 0.9;
      if (d >= 3 && d < 7) return lerp(0.9, 1, (d - 2) / 4);
    }
    return 1;
  };
  const CLICK_TARGETS: [keyof typeof CLICK, string][] = [
    ["search", "qo-search.search"], ["result", "qo-search.result"], ["qty", "qo-search.qty0"], ["tpl", "qo-search.tplMatch"],
    ["tplAdd", "qo-search.tplAdd"], ["add", "qo-search.addBtn"], ["pill", "qo-search.cartPill"], ["place", "cart.place"],
  ];
  const clickReport = () =>
    CLICK_TARGETS.map(([k, rk]) => {
      const fr = CLICK[k];
      const [sx, sy] = pointerAt(fr);
      const [px, py] = toPage(camAt(fr - 0.001), sx, sy, OW, OH);
      const r = R[rk];
      let rect = r;
      if (k === "pill") {
        const filledW = 152;
        rect = [r[0] + r[2] - filledW, r[1], filledW, r[3]];
      }
      const inside = px >= rect[0] && px <= rect[0] + rect[2] && py >= rect[1] && py <= rect[1] + rect[3];
      const margin = Math.min(px - rect[0], rect[0] + rect[2] - px, py - rect[1], rect[1] + rect[3] - py);
      return { click: k, frame: fr, screen: [+sx.toFixed(1), +sy.toFixed(1)], page: [+px.toFixed(1), +py.toFixed(1)], target: rk, rect, inside, margin: +margin.toFixed(1) };
    });
  return { P, KEYS, pointerAt, cursorScale, clickReport, CLICK_TARGETS };
}

const defaultPtr = buildPointerData(createTimelineState(DEFAULT_FILM_CONFIG));
export const P = defaultPtr.P;
export const KEYS = defaultPtr.KEYS;
export const pointerAt = defaultPtr.pointerAt;
export const cursorScale = defaultPtr.cursorScale;
export const clickReport = defaultPtr.clickReport;
export const CLICK_TARGETS = defaultPtr.CLICK_TARGETS;
