/**
 * JOOLA B2B wholesale: buyer story film (r11 prototype, 12.9s seamless loop).
 *
 * The UI is NOT re-drawn: the r11 prototype's own CSS and rendered screen markup are
 * captured by scripts/capture-proto.py into joola/proto.generated.ts and mounted here
 * verbatim. Each frame only sets state on that markup (typed text, quantities, totals,
 * credit bar, open/pressed states) the same way the prototype's JS would.
 * One continuous camera (Catmull-Rom through key framings) and a screen-space pointer.
 */
import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PROTO_CSS, PROTO_SCREENS } from "./joola/proto.generated";
import { R } from "./joola/proto-rects.generated";

export const JOOLA_FPS = 30;
export const JOOLA_DURATION = 387; // 12.9s

/* ---------- ledger (mirrors assets/joola-b2b/ledger.js; verified by scripts/check-film.py) ---------- */
const PERSEUS_TIER = [[1, 179.97], [6, 164.97], [12, 149.98], [24, 134.98]] as const;
const OTHER_LINES = 2483.52 + 262.56 + 362.82; // Hyperion 24, HC-40 48, Tour Elite Bag 6 = 3,108.90
const ORDER_TOTAL = 19306.5;
const CREDIT_LIMIT = 50000;
const CREDIT_PRIOR_USED = 5000;
const CREDIT_BEFORE = CREDIT_LIMIT - CREDIT_PRIOR_USED; // 45,000.00
const CREDIT_AFTER = CREDIT_LIMIT - CREDIT_PRIOR_USED - ORDER_TOTAL; // 25,693.50
const PO = "ENG-9812";
const SEARCH = "Perseus";

const unitAt = (q: number) => {
  let p: number = PERSEUS_TIER[0][1];
  for (const [min, price] of PERSEUS_TIER) if (q >= min) p = price;
  return p;
};
const r2 = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/* ---------- timing ---------- */
const CLICK = { search: 34, result: 62, preset: 81, qty: 95, add: 131, po: 165, place: 227, msg: 303, inv: 338 };
const TYPE_SEARCH = [37, 56] as const;
const DROPDOWN = [45, 63] as const;
const INSERT = 63;
const QTY_KEYS = [[95, "24"], [98, "1"], [100, "12"], [102, "120"]] as const;
const QTY_COMMIT = 105;
const TYPE_PO = [167, 187] as const;
const CREDIT_ANIM = [192, 214] as const;
/** Screen layer windows: [screen, inStart, inEnd] (crossfade + content slide). */
const SCREENS: [string, number, number][] = [
  ["qo-desktop", -1, -1],
  ["cart", 139, 151],
  ["confirmation", 231, 243],
  ["messages", 306, 318],
  ["invoices", 341, 353],
];
const INTRO_END = 24;
const LOGO_AR = R["qo-search.logo"][3] / R["qo-search.logo"][2];
const OUTRO = [360, JOOLA_DURATION] as const;

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const prog = (f: number, a: number, b: number, e = ease) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const ctr = (k: string): [number, number] => {
  const r = R[k];
  return [r[0] + r[2] / 2, r[1] + r[3] / 2];
};

/* ---------- camera: Catmull-Rom through [frame, cx, cy, scale] (canvas coords) ---------- */
const CAM: [number, number, number, number][] = [
  [-24, 960, 540, 1.0],
  [0, 960, 540, 1.0],
  [22, 760, 400, 1.3],
  [36, 470, 190, 1.95],
  [56, 520, 220, 2.05],
  [70, 820, 280, 1.8],
  [84, 1120, 285, 2.05],
  [100, 1200, 270, 2.15],
  [114, 1240, 290, 2.0],
  [119, 760, 760, 1.5],
  [131, 1250, 760, 1.5],
  [144, 1420, 330, 1.6],
  [156, 900, 330, 1.55],
  [170, 560, 440, 2.15],
  [186, 640, 430, 2.15],
  [193, 1050, 360, 1.7],
  [201, 1470, 270, 2.05],
  [216, 1540, 300, 2.15],
  [229, 1560, 345, 2.0],
  [246, 1080, 250, 1.9],
  [272, 1070, 235, 2.3],
  [294, 1075, 300, 2.3],
  [308, 1090, 380, 1.8],
  [322, 900, 210, 1.9],
  [334, 1520, 230, 2.0],
  [342, 1700, 235, 2.0],
  [356, 820, 330, 1.7],
  [366, 900, 420, 1.4],
  [376, 960, 520, 1.1],
  [JOOLA_DURATION, 960, 540, 1.0],
  [JOOLA_DURATION + 24, 960, 540, 1.0],
];
const catmull = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
const camAt = (f: number) => {
  let i = 1;
  while (i < CAM.length - 2 && CAM[i + 1][0] <= f) i++;
  const [a, b, c, d] = [CAM[i - 1], CAM[i], CAM[i + 1], CAM[i + 2]];
  const t = (f - b[0]) / (c[0] - b[0]);
  // time-normalised tangents keep velocity continuous across uneven key spacing
  const k = (j: number) => {
    const m1 = ((c[j] - a[j]) / (c[0] - a[0])) * (c[0] - b[0]);
    const m2 = ((d[j] - b[j]) / (d[0] - b[0])) * (c[0] - b[0]);
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * b[j] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * c[j] + (t3 - t2) * m2;
  };
  void catmull;
  const s = k(3);
  const cx = Math.min(Math.max(k(1), 960 / s), 1920 - 960 / s);
  const cy = Math.min(Math.max(k(2), 540 / s), 1080 - 540 / s);
  return { cx, cy, s };
};
const toScreen = (cam: ReturnType<typeof camAt>, x: number, y: number) => [
  (x - cam.cx) * cam.s + 960,
  (y - cam.cy) * cam.s + 540,
];

/* ---------- pointer path (canvas coords); moves arrive at each click ---------- */
const P = {
  start: [900, 640] as [number, number],
  search: [330, 142] as [number, number],
  result: [340, 196] as [number, number],
  preset: ctr("qo-search.preset24"),
  qty: ctr("qo-search.qty0"),
  add: [ctr("qo-search.addBtn")[0] + 50, ctr("qo-search.addBtn")[1] + 12] as [number, number],
  po: [360, 434] as [number, number],
  place: [ctr("cart.place")[0] + 100, ctr("cart.place")[1] + 10] as [number, number],
  msg: ctr("confirmation.msgBtn"),
  inv: ctr("messages.viewInv"),
};
const PATH: [number, [number, number]][] = [
  [22, P.start],
  [CLICK.search, P.search],
  [50, P.search],
  [CLICK.result, P.result],
  [69, P.result],
  [CLICK.preset, P.preset],
  [86, P.preset],
  [CLICK.qty, P.qty],
  [112, [P.qty[0] + 30, P.qty[1] + 40]],
  [120, [760, 1000]],
  [CLICK.add, P.add],
  [150, [P.add[0] - 300, P.add[1] - 400]],
  [CLICK.po, P.po],
  [192, [P.po[0] + 260, P.po[1] + 20]],
  [CLICK.place, P.place],
  [252, [P.place[0] - 300, P.place[1] + 40]],
  [CLICK.msg, P.msg],
  [318, [P.msg[0] + 200, P.msg[1] - 120]],
  [CLICK.inv, P.inv],
  [362, [P.inv[0] - 600, P.inv[1] + 250]],
];
const pointerAt = (f: number): [number, number] => {
  if (f <= PATH[0][0]) return PATH[0][1];
  for (let i = 0; i < PATH.length - 1; i++) {
    const [fa, a] = PATH[i];
    const [fb, b] = PATH[i + 1];
    if (f <= fb) {
      const t = prog(f, fa, fb, Easing.bezier(0.55, 0, 0.15, 1));
      return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    }
  }
  return PATH[PATH.length - 1][1];
};
const pressAmt = (f: number) => {
  let v = 0;
  for (const c of Object.values(CLICK)) {
    const d = f - c;
    if (d >= -1 && d <= 5) v = Math.max(v, d < 1 ? (d + 1) / 2 : 1 - (d - 1) / 4);
  }
  return Math.max(0, Math.min(1, v));
};
const ringAt = (f: number) => {
  for (const c of Object.values(CLICK)) {
    const d = f - c;
    if (d >= 0 && d <= 12) return d / 12;
  }
  return -1;
};

/* ---------- markup ---------- */
const A = staticFile("joola-b2b");
const CSS =
  PROTO_CSS.split("__A__").join(A) +
  `
:root{--switcher-h:0px !important}
#devSwitcher{display:none!important}
.film-layer *,.film-layer *::before,.film-layer *::after{transition:none!important;animation:none!important}
.film-layer .screen.active{min-height:1080px;height:1080px}
.film-layer #app{padding-top:0;min-height:1080px}
.film-caret{display:inline-block;width:1.5px;height:16px;margin-left:1px;background:var(--ink);vertical-align:-3px}
`;
const html = (k: string) =>
  `<div id="app">${PROTO_SCREENS[k].split("__A__").join(A).replace('class="screen"', 'class="screen active"')}</div>`;

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T | null;
const qa = (root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)) as HTMLElement[];
const press = (el: HTMLElement | null, f: number, c: number) => {
  if (!el) return;
  const d = f - c;
  const on = d >= 0 && d <= 4;
  el.style.transform = on ? `scale(${0.97 + 0.03 * (d / 4)})` : "";
  el.style.opacity = on ? `${0.86 + 0.14 * (d / 4)}` : "";
};
const caret = (host: HTMLElement, on: boolean) => {
  let c = q(host, ".film-caret");
  if (on && !c) {
    c = document.createElement("span");
    c.className = "film-caret";
    host.appendChild(c);
  }
  if (c) c.style.display = on ? "inline-block" : "none";
};
const countUp = (f: number, a: number, from: number, to: number, len = 10) => r2(lerp(from, to, prog(f, a, a + len, easeOut)));

/* ---------- per-screen state ---------- */
function applyQuickOrder(root: HTMLElement, f: number) {
  // Search field: focus, typing, caret
  const field = q(root, "[data-search-field]")!;
  const n = Math.max(0, Math.min(SEARCH.length, Math.floor(interpolate(f, [TYPE_SEARCH[0], TYPE_SEARCH[1]], [0, SEARCH.length + 0.999], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));
  const typed = SEARCH.slice(0, n);
  const focused = f >= CLICK.search && f < CLICK.result;
  field.classList.toggle("has-value", typed.length > 0);
  const val = q(field, ".value")!;
  if (val.firstChild && val.firstChild.nodeType === 3) val.firstChild.textContent = typed;
  else val.insertBefore(document.createTextNode(typed), val.firstChild);
  caret(typed.length ? val : field, focused);
  if (!typed.length) caret(val, false);
  field.style.borderColor = focused ? "var(--blue)" : "";
  field.style.boxShadow = focused ? "0 0 0 3px rgba(44,62,224,0.14)" : "";

  // Dropdown
  const res = q(root, "[data-search-results]")!;
  const open = f >= DROPDOWN[0] && f < DROPDOWN[1];
  res.hidden = !open;
  res.classList.toggle("is-closed", !open);
  const dp = prog(f, DROPDOWN[0], DROPDOWN[0] + 6, easeOut);
  res.style.opacity = `${dp}`;
  res.style.transform = `translateY(${(1 - dp) * -6}px)`;
  const hit = q(res, "[data-search-result]");
  if (hit) hit.style.background = f >= CLICK.result - 6 ? "var(--band)" : "";

  // Perseus row insert + qty/price/line
  const rows = qa(root, "[data-order-row]");
  const pr = rows[0];
  const inserted = f >= INSERT;
  pr.style.display = inserted ? "" : "none";
  const rowH = 87;
  const ip = prog(f, INSERT, INSERT + 10, easeOut);
  pr.style.opacity = `${ip}`;
  pr.style.transform = `translateY(${(1 - ip) * -10}px)`;
  pr.style.background = inserted ? `rgba(44,62,224,${0.06 * (1 - prog(f, INSERT + 10, INSERT + 40))})` : "";
  rows.slice(1).forEach((r) => (r.style.transform = inserted ? `translateY(${-(1 - ip) * rowH}px)` : ""));

  let qtyText = f >= CLICK.preset ? "24" : "1";
  let qty = 1;
  for (const [k, t] of QTY_KEYS) if (f >= k) qtyText = t;
  if (f >= CLICK.preset) qty = 24;
  if (f >= QTY_COMMIT) qty = 120;
  const editing = f >= CLICK.qty && f < QTY_COMMIT;
  const qtyEl = q(pr, ".qty")!;
  qtyEl.textContent = f < CLICK.preset ? "1" : qtyText;
  qtyEl.style.background = f >= CLICK.qty && f < QTY_KEYS[1][0] ? "rgba(44,62,224,0.18)" : "";
  qtyEl.style.borderRadius = "3px";
  caret(qtyEl, editing && f >= QTY_KEYS[1][0]);
  const stepper = q(pr, "[data-qty-stepper]")!;
  stepper.style.boxShadow = editing ? "0 0 0 2px var(--blue)" : "";
  qa(pr, "[data-set-perseus]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-set-perseus") === "24" && f >= CLICK.preset && qty === 24));
  press(q(pr, "[data-set-perseus='24']"), f, CLICK.preset);
  const unit = unitAt(qty);
  q(pr, ".unit")!.innerHTML = `${money(unit)}<span class="ea">ea</span>`;
  const prevQty = qty === 120 ? 24 : 1;
  const changeAt = qty === 120 ? QTY_COMMIT : qty === 24 ? CLICK.preset : INSERT;
  const line = countUp(f, changeAt, r2(unitAt(prevQty) * prevQty), r2(unit * qty));
  q(pr, ".line-total")!.textContent = money(line);

  // Footer
  const lines = inserted ? 4 : 3;
  q(root, "[data-line-count]")!.textContent = `${lines} items`;
  const total = inserted ? countUp(f, changeAt, OTHER_LINES + (qty === 1 ? 0 : r2(unitAt(prevQty) * prevQty)), OTHER_LINES + r2(unit * qty)) : OTHER_LINES;
  q(root, "[data-order-footer] [data-order-total]")!.textContent = money(r2(total));
  const add = q(root, "[data-add-all]")!;
  add.textContent = `Add ${lines} to cart`;
  press(add, f, CLICK.add);

  pill(root, f >= CLICK.add + 2 ? prog(f, CLICK.add + 2, CLICK.add + 12, easeOut) : 0, f - (CLICK.add + 2));
}

/** Cart pill fill + r11 typeBump on the amount and count chip. */
function pill(root: HTMLElement, p: number, since: number) {
  const pl = q(root, "[data-cart-pill]");
  if (!pl) return;
  const amt = q(pl, "[data-cart-total]")!;
  const chip = q(pl, "[data-cart-count]")!;
  if (p <= 0) {
    amt.hidden = true;
    chip.hidden = true;
    return;
  }
  amt.hidden = false;
  chip.hidden = false;
  amt.textContent = money(ORDER_TOTAL);
  chip.textContent = "4";
  amt.style.maxWidth = `${p * 90}px`;
  amt.style.overflow = "hidden";
  amt.style.whiteSpace = "nowrap";
  const bump = since >= 0 && since <= 13 ? 1 + 0.12 * Math.sin((since / 13) * Math.PI) : 1;
  amt.style.transform = `scale(${bump})`;
  chip.style.transform = `scale(${p * bump})`;
}

function applyCart(root: HTMLElement, f: number) {
  const input = q<HTMLInputElement>(root, "[data-po-input]")!;
  const n = Math.max(0, Math.min(PO.length, Math.floor(interpolate(f, [TYPE_PO[0], TYPE_PO[1]], [0, PO.length + 0.999], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));
  input.value = PO.slice(0, n);
  input.setAttribute("value", input.value);
  const focused = f >= CLICK.po && f < TYPE_PO[1] + 8;
  input.style.borderColor = focused ? "var(--blue)" : "";
  input.style.boxShadow = focused ? "0 0 0 3px rgba(44,62,224,0.14)" : "";
  // caret: overlay after the measured text width
  let c = q(input.parentElement!, ".film-caret");
  if (!c) {
    c = document.createElement("span");
    c.className = "film-caret";
    c.style.position = "absolute";
    input.parentElement!.style.position = "relative";
    input.parentElement!.appendChild(c);
  }
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = getComputedStyle(input).font;
  const w = n ? ctx.measureText(input.value).width : 0;
  c.style.display = focused ? "inline-block" : "none";
  c.style.left = `${input.offsetLeft + parseFloat(getComputedStyle(input).paddingLeft) + w + 1}px`;
  c.style.top = `${input.offsetTop + (input.offsetHeight - 16) / 2}px`;

  // Net 30 credit: $45,000.00 available before this order -> $25,693.50 left
  const cp = prog(f, CREDIT_ANIM[0], CREDIT_ANIM[1], ease);
  const left = r2(lerp(CREDIT_BEFORE, CREDIT_AFTER, cp));
  const avail = q(root, "[data-cart-summary] [data-credit-available]")!;
  avail.textContent = `${money(left)} left of ${money(CREDIT_LIMIT)}`;
  const bar = q(root, "[data-cart-summary] [data-credit-bar]")!;
  const used = (CREDIT_PRIOR_USED / CREDIT_LIMIT) * 100;
  bar.style.setProperty("--credit-used-end", `${used}%`);
  bar.style.setProperty("--credit-order-end", `${used + ((CREDIT_BEFORE - left) / CREDIT_LIMIT) * 100}%`);
  press(q(root, "[data-place-order]"), f, CLICK.place);
}

function applyConfirmation(root: HTMLElement, f: number) {
  press(q(root, ".confirm-actions .btn-text"), f, CLICK.msg);
}
function applyMessages(root: HTMLElement, f: number) {
  const v = qa(root, "a,button").find((e) => /View invoice/.test(e.textContent || ""));
  press(v ?? null, f, CLICK.inv);
}

const APPLY: Record<string, (r: HTMLElement, f: number) => void> = {
  "qo-desktop": applyQuickOrder,
  cart: applyCart,
  confirmation: applyConfirmation,
  messages: applyMessages,
  invoices: () => {},
};

/* ---------- component ---------- */
const Layer: React.FC<{ screen: string; frame: number; opacity: number; slide: number; pageOpacity: number }> = ({ screen, frame, opacity, slide, pageOpacity }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [markup] = useState(() => ({ __html: html(screen) }));
  useLayoutEffect(() => {
    const root = ref.current!;
    APPLY[screen](root, frame);
    const page = q(root, ".page");
    if (page) {
      page.style.transform = slide ? `translateX(${slide}px)` : "";
      page.style.opacity = `${pageOpacity}`;
    }
  });
  return (
    <div
      ref={ref}
      className="film-layer"
      style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, overflow: "hidden", opacity }}
      dangerouslySetInnerHTML={markup}
    />
  );
};

const Cursor: React.FC<{ x: number; y: number; press: number; ring: number; opacity: number }> = ({ x, y, press: pr, ring, opacity }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none" }}>
    {ring >= 0 && (
      <div
        style={{
          position: "absolute",
          left: -28,
          top: -28,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "3px solid rgba(44,62,224,0.55)",
          transform: `scale(${0.35 + ring * 0.85})`,
          opacity: 1 - ring,
        }}
      />
    )}
    <svg width={34} height={44} viewBox="0 0 17 22" style={{ position: "absolute", left: -3, top: -2, transformOrigin: "3px 2px", transform: `scale(${1 - 0.16 * pr})`, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.28))" }}>
      <path d="M1.5 1.5 L1.5 17.5 L5.6 13.6 L8.4 20 L11 18.9 L8.3 12.6 L14 12.6 Z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  </div>
);

export const JoolaB2B: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("r11 fonts + images"));
  useLayoutEffect(() => {
    const imgs = Array.from(document.querySelectorAll(".film-layer img, .film-logo")) as HTMLImageElement[];
    Promise.all([
      ...["400", "500", "700"].map((w) => document.fonts.load(`${w} 16px FKGroteskNeue`)),
      ...imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = r; i.onerror = r; }))),
    ]).then(() => continueRender(handle));
  }, [handle]);

  const cam = camAt(frame);

  // Active + incoming layers
  let idx = 0;
  for (let i = 1; i < SCREENS.length; i++) if (frame >= SCREENS[i][1]) idx = i;
  const cur = SCREENS[idx];
  const tIn = idx > 0 ? prog(frame, cur[1], cur[2], ease) : 1;
  const prev = idx > 0 && tIn < 1 ? SCREENS[idx - 1] : null;

  // Intro / outro: logo match cut into the sidebar logo slot
  const uiIn = prog(frame, 4, INTRO_END, ease) * (1 - prog(frame, OUTRO[0] + 4, OUTRO[1] - 5, ease));
  const lp = prog(frame, 0, 19, Easing.bezier(0.65, 0, 0.25, 1)) * (1 - prog(frame, OUTRO[0], OUTRO[1] + 1, Easing.bezier(0.65, 0, 0.25, 1)));
  const [sx, sy] = toScreen(cam, R["qo-search.logo"][0], R["qo-search.logo"][1]);
  const sw = R["qo-search.logo"][2] * cam.s;
  const bigW = 520;
  const logoW = lerp(bigW, sw, lp);
  const logoX = lerp(960 - bigW / 2, sx, lp);
  const logoY = lerp(540 - (bigW * LOGO_AR) / 2, sy, lp);
  const showLogo = lp < 0.999;

  const [px, py] = pointerAt(frame);
  const [spx, spy] = toScreen(cam, px, py);
  const pOpacity = prog(frame, 22, 30) * (1 - prog(frame, 352, 362));

  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      <style>{CSS + (showLogo ? ".film-layer .sidebar-brand img{visibility:hidden}" : "")}</style>
      <AbsoluteFill style={{ opacity: uiIn }}>
        <div
          style={{
            position: "absolute",
            width: 1920,
            height: 1080,
            transformOrigin: "0 0",
            transform: `translate(960px,540px) scale(${cam.s}) translate(${-cam.cx}px,${-cam.cy}px)`,
          }}
        >
          {prev && <Layer key={prev[0]} screen={prev[0]} frame={frame} opacity={1} slide={-28 * tIn} pageOpacity={1 - prog(tIn, 0, 0.55, (x) => x)} />}
          <Layer key={cur[0]} screen={cur[0]} frame={frame} opacity={tIn} slide={28 * (1 - tIn)} pageOpacity={idx > 0 ? prog(tIn, 0.35, 1, (x) => x) : 1} />
        </div>
      </AbsoluteFill>
      {showLogo && (
        <img
          className="film-logo"
          src={`${A}/joola-logo.png`}
          style={{ position: "absolute", left: logoX, top: logoY, width: logoW, height: logoW * LOGO_AR }}
        />
      )}
      {pOpacity > 0 && <Cursor x={spx} y={spy} press={pressAmt(frame)} ring={ringAt(frame)} opacity={pOpacity} />}
    </AbsoluteFill>
  );
};
