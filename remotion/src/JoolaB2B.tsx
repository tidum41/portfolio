/**
 * JOOLA B2B wholesale: buyer story film (r11 prototype), seamless loop.
 *
 * The UI is NOT re-drawn: the r11 prototype's own CSS and rendered screen markup are
 * captured by scripts/capture-proto.py into joola/proto.generated.ts and mounted here
 * verbatim. Each frame only sets state on that markup (typed text, quantities, totals,
 * credit bar, open/pressed states, invoice modal) the way the prototype's JS would.
 *
 * Motion rules (critic pass 3): one camera made of eased moves (cubic-bezier .65,0,.35,1)
 * with a slow push-in drift between them; UI content animates only after the camera has
 * settled; every state change follows a visible pointer click; screen changes are
 * push-slides with the sidebar/topbar staying put; the loop is a spatial reverse of the intro
 * (UI collapses into the sidebar logo, which then grows back to centre).
 */
import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PROTO_CSS, PROTO_SCREENS } from "./joola/proto.generated";
import { R } from "./joola/proto-rects.generated";

export const JOOLA_FPS = 30;

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

/* ---------- easing ---------- */
const CAM_E = Easing.bezier(0.65, 0, 0.35, 1); // camera, logo, screen slides, clip reveal
const SETTLE = Easing.bezier(0.33, 1, 0.68, 1); // content settles (no overshoot)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const prog = (f: number, a: number, b: number, e: (t: number) => number = CAM_E) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const ctr = (k: string): [number, number] => {
  const r = R[k];
  return [r[0] + r[2] / 2, r[1] + r[3] / 2];
};

/* ---------- timeline (frames @30fps) ---------- */
const LOGO_IN = [0, 22] as const; // centre -> sidebar slot
const REVEAL = [16, 38] as const; // UI expands out of the logo slot
const CLICK = { search: 56, result: 76, preset: 116, qty: 132, add: 194, pill: 230, po: 268, place: 334, msg: 382, inv: 466 };
const TYPE_SEARCH = [58, 70] as const;
const DROPDOWN = [64, CLICK.result + 1] as const;
const INSERT = CLICK.result + 2; // row slides in, camera static
const QTY_KEYS = [[CLICK.qty + 5, "1"], [CLICK.qty + 9, "12"], [CLICK.qty + 13, "120"]] as const;
const QTY_COMMIT = CLICK.qty + 18;
const PILL_FILL = CLICK.add + 2;
const TYPE_PO = [CLICK.po + 2, CLICK.po + 16] as const;
const CREDIT_ANIM = [312, 328] as const; // after camera settles on the summary
const PUSH = 28; // frames per screen push
const CONF_PANEL = [CLICK.place + 2, CLICK.place + 2 + PUSH] as const;
const BUBBLE = [416, 428] as const; // Collin's reply lands after the camera settles
const MODAL = [CLICK.inv + 2, CLICK.inv + 26] as const;
const COLLAPSE = [536, 562] as const; // UI collapses into the sidebar logo
const LOGO_OUT = [556, 580] as const; // logo grows back to centre
export const JOOLA_DURATION = LOGO_OUT[1]; // last frame == frame 0 state

/** Screen layers: [screen, pushStart, pushEnd]. */
const SCREENS: [string, number, number][] = [
  ["qo-desktop", -1, -1],
  ["cart", CLICK.pill + 2, CLICK.pill + 2 + PUSH],
  ["confirmation", CLICK.place + 2, CLICK.place + 2 + PUSH],
  ["messages", CLICK.msg + 2, CLICK.msg + 2 + PUSH],
];

/** Film-only compaction: lift the sticky Quick order footer to sit under the table/rail. */
const FOOTER_LIFT = R["qo-search.footer"][1] - (R["qo-search.rail"][1] + R["qo-search.rail"][3] + 48);

/* ---------- camera: eased moves + slow push-in drift between them ---------- */
type Cam = { cx: number; cy: number; s: number; top?: number };
type Move = { a: number; b: number; to: Cam; dip?: number };
const MOVES: Move[] = [
  { a: 26, b: 52, to: { cx: 505, cy: 290, s: 1.9 } }, // search + table
  { a: 90, b: 112, to: { cx: 860, cy: 300, s: 1.75 } }, // Perseus row: preset, qty, line total
  { a: 164, b: 188, to: { cx: 985, cy: 432, s: 1.25 } }, // rows + lifted footer + Add + pill
  { a: 210, b: 226, to: { cx: 1560, cy: 170, s: 2.2, top: 70 } }, // push in on the filled cart pill
  { a: 230, b: 264, to: { cx: 560, cy: 430, s: 2.0 }, dip: 0.28 }, // push into cart, PO field
  { a: 288, b: 310, to: { cx: 1552, cy: 260, s: 2.1 }, dip: 0.12 }, // summary + credit
  { a: 336, b: 366, to: { cx: 1070, cy: 245, s: 2.2 }, dip: 0.22 }, // confirmation panel
  { a: 384, b: 414, to: { cx: 1060, cy: 300, s: 1.75 }, dip: 0.2 }, // messages thread
  { a: 440, b: 462, to: { cx: 1371, cy: 300, s: 1.75 } }, // order details / View invoice
  { a: 470, b: 514, to: { cx: 960, cy: 540, s: 1.5 } }, // full INV-1042 modal, readable
  { a: 514, b: 540, to: { cx: 960, cy: 540, s: 1.0 } }, // pull back as the UI collapses into the logo slot
];
const DRIFT = 0.0006; // scale per frame while holding (~1.8%/s push-in)
const clampCam = (c: Cam): Cam => ({
  s: c.s,
  cx: Math.min(Math.max(c.cx, 960 / c.s), 1920 - 960 / c.s),
  cy: Math.min(Math.max(c.cy, 540 / c.s - (c.top ?? 0)), 1080 - 540 / c.s),
  top: c.top,
});
const camAt = (f: number): Cam => {
  let st: Cam = { cx: 960, cy: 540, s: 1 };
  let last = 0;
  const drift = (c: Cam, d: number): Cam => ({ ...c, s: c.s * (1 + DRIFT * Math.max(0, d)) });
  for (const m of MOVES) {
    if (f < m.a) return clampCam(drift(st, f - last));
    const from = clampCam(drift(st, m.a - last));
    if (f <= m.b) {
      const t = CAM_E((f - m.a) / (m.b - m.a));
      const to = clampCam(m.to);
      const s = lerp(from.s, to.s, t) * (1 - (m.dip ?? 0) * Math.sin(Math.PI * t));
      return clampCam({ cx: lerp(from.cx, to.cx, t), cy: lerp(from.cy, to.cy, t), s, top: lerp(from.top ?? 0, to.top ?? 0, t) });
    }
    st = m.to;
    last = m.b;
  }
  return clampCam(drift(st, f - last));
};
const toScreen = (cam: Cam, x: number, y: number) => [(x - cam.cx) * cam.s + 960, (y - cam.cy) * cam.s + 540];

/* ---------- pointer path (canvas coords); each move arrives just before its click ---------- */
const addBtn = ctr("qo-search.addBtn");
const P = {
  start: [700, 520] as [number, number],
  search: [330, 142] as [number, number],
  result: [340, 196] as [number, number],
  preset: ctr("qo-search.preset24"),
  qty: ctr("qo-search.qty0"),
  add: [addBtn[0] + 46, addBtn[1] - FOOTER_LIFT + 10] as [number, number],
  pill: [1594, 30] as [number, number], // on the filled pill's "Cart" label, clear of amount + badge
  po: [360, 434] as [number, number],
  place: [ctr("cart.place")[0] + 100, ctr("cart.place")[1] + 10] as [number, number],
  msg: ctr("confirmation.msgBtn"),
  inv: ctr("messages.viewInv"),
};
const PATH: [number, [number, number]][] = [
  [40, P.start],
  [CLICK.search - 2, P.search],
  [CLICK.result - 12, P.search],
  [CLICK.result - 2, P.result],
  [CLICK.preset - 14, [P.result[0] + 200, P.result[1] + 60]],
  [CLICK.preset - 2, P.preset],
  [CLICK.qty - 12, P.preset],
  [CLICK.qty - 2, P.qty],
  [CLICK.qty + 26, [P.qty[0] + 40, P.qty[1] + 50]],
  [CLICK.add - 2, P.add],
  [CLICK.pill - 14, P.add],
  [CLICK.pill - 2, P.pill],
  [CLICK.po - 16, [P.pill[0] - 700, P.pill[1] + 300]],
  [CLICK.po - 2, P.po],
  [CLICK.place - 16, [P.po[0] + 500, P.po[1] + 40]],
  [CLICK.place - 2, P.place],
  [CLICK.msg - 16, [P.msg[0] + 160, P.msg[1] + 30]],
  [CLICK.msg - 2, P.msg],
  [CLICK.inv - 18, [P.msg[0] + 400, P.msg[1] - 60]],
  [CLICK.inv - 2, P.inv],
];
const POINTER_VIS = [36, 44, CLICK.inv + 8, CLICK.inv + 18] as const;
const pointerAt = (f: number): [number, number] => {
  if (f <= PATH[0][0]) return PATH[0][1];
  for (let i = 0; i < PATH.length - 1; i++) {
    const [fa, a] = PATH[i];
    const [fb, b] = PATH[i + 1];
    if (f <= fb) {
      const t = prog(f, fa, fb, Easing.bezier(0.5, 0, 0.25, 1));
      return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    }
  }
  return PATH[PATH.length - 1][1];
};
const pressAmt = (f: number) => {
  let v = 0;
  for (const c of Object.values(CLICK)) {
    const d = f - c;
    if (d >= -2 && d <= 6) v = Math.max(v, d < 0 ? (d + 2) / 2 : 1 - d / 6);
  }
  return Math.max(0, Math.min(1, v));
};
const ringAt = (f: number) => {
  for (const c of Object.values(CLICK)) {
    const d = f - c;
    if (d >= 0 && d <= 14) return d / 14;
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
.film-layer .messages-layout{position:relative;z-index:0}
.film-layer .inv-modal{z-index:1000}
.film-caret{display:inline-block;width:1.5px;height:16px;margin-left:1px;background:var(--ink);vertical-align:-3px}
`;
const html = (k: string) =>
  `<div id="app">${PROTO_SCREENS[k].split("__A__").join(A).replace('class="screen"', 'class="screen active"')}</div>`;

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T | null;
const qa = (root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)) as HTMLElement[];
/** r11 :active feedback (scale .98, opacity .88) held for a few frames around the click. */
const press = (el: HTMLElement | null, f: number, c: number) => {
  if (!el) return;
  const d = f - c;
  const on = d >= 0 && d <= 6;
  const k = on ? 1 - d / 6 : 0;
  el.style.transform = on ? `scale(${1 - 0.03 * k})` : "";
  el.style.opacity = on ? `${1 - 0.14 * k}` : "";
};
const caret = (host: HTMLElement, on: boolean) => {
  let c = q(host, ":scope > .film-caret");
  if (on && !c) {
    c = document.createElement("span");
    c.className = "film-caret";
    host.appendChild(c);
  }
  if (c) c.style.display = on ? "inline-block" : "none";
};
const countUp = (f: number, a: number, from: number, to: number, len = 12) => r2(lerp(from, to, prog(f, a, a + len, SETTLE)));
const typedCount = (f: number, a: number, b: number, len: number) =>
  Math.max(0, Math.min(len, Math.floor(interpolate(f, [a, b], [0, len + 0.999], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));

/* ---------- per-screen state ---------- */
function applyQuickOrder(root: HTMLElement, f: number) {
  // film-only compaction: footer sits under the table instead of the viewport bottom
  q(root, "[data-order-footer]")!.style.transform = `translateY(${-FOOTER_LIFT}px)`;

  // Search: click -> focus ring + caret, then typing
  const field = q(root, "[data-search-field]")!;
  const typed = SEARCH.slice(0, typedCount(f, TYPE_SEARCH[0], TYPE_SEARCH[1], SEARCH.length));
  const focused = f >= CLICK.search && f < CLICK.result;
  field.classList.toggle("has-value", typed.length > 0);
  const val = q(field, ".value")!;
  if (val.firstChild && val.firstChild.nodeType === 3) val.firstChild.textContent = typed;
  else val.insertBefore(document.createTextNode(typed), val.firstChild);
  caret(val, focused && typed.length > 0);
  caret(field, focused && typed.length === 0);
  field.style.borderColor = focused ? "var(--blue)" : "";
  field.style.boxShadow = focused ? "0 0 0 3px rgba(44,62,224,0.14)" : "";

  // Dropdown
  const res = q(root, "[data-search-results]")!;
  const open = f >= DROPDOWN[0] && f < DROPDOWN[1];
  res.hidden = !open;
  res.classList.toggle("is-closed", !open);
  const dp = prog(f, DROPDOWN[0], DROPDOWN[0] + 6, SETTLE);
  res.style.opacity = `${dp}`;
  res.style.transform = `translateY(${(1 - dp) * -6}px)`;
  const hit = q(res, "[data-search-result]");
  if (hit) hit.style.background = f >= CLICK.result - 6 ? "var(--band)" : "";

  // Perseus row slides in after the result click
  const rows = qa(root, "[data-order-row]");
  const pr = rows[0];
  const inserted = f >= INSERT;
  pr.style.display = inserted ? "" : "none";
  const rowH = rows[1] ? 87 : 0;
  const ip = prog(f, INSERT, INSERT + 12, SETTLE);
  pr.style.opacity = `${ip}`;
  pr.style.transform = `translateY(${(1 - ip) * -10}px)`;
  pr.style.background = inserted ? `rgba(44,62,224,${0.06 * (1 - prog(f, INSERT + 14, INSERT + 44))})` : "";
  rows.slice(1).forEach((r) => (r.style.transform = inserted ? `translateY(${-(1 - ip) * rowH}px)` : ""));

  // Qty: 1 -> (click preset 24) 24 -> (click qty, select, type) 120 -> commit
  let qty = 1;
  if (f >= CLICK.preset) qty = 24;
  if (f >= QTY_COMMIT) qty = 120;
  let qtyText = f >= CLICK.preset ? "24" : "1";
  for (const [k, t] of QTY_KEYS) if (f >= k) qtyText = t;
  const editing = f >= CLICK.qty && f < QTY_COMMIT;
  const qtyEl = q(pr, ".qty")!;
  qtyEl.textContent = qtyText;
  qtyEl.style.background = f >= CLICK.qty && f < QTY_KEYS[0][0] ? "rgba(44,62,224,0.2)" : "";
  qtyEl.style.borderRadius = "3px";
  caret(qtyEl, editing && f >= QTY_KEYS[0][0]);
  const stepper = q(pr, "[data-qty-stepper]")!;
  stepper.style.boxShadow = editing ? "0 0 0 2px var(--blue)" : "";
  qa(pr, "[data-set-perseus]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-set-perseus") === "24" && qty === 24));
  press(q(pr, "[data-set-perseus='24']"), f, CLICK.preset);
  const unit = unitAt(qty);
  q(pr, ".unit")!.innerHTML = `${money(unit)}<span class="ea">ea</span>`;
  const prevQty = qty === 120 ? 24 : 1;
  const changeAt = qty === 120 ? QTY_COMMIT : qty === 24 ? CLICK.preset + 1 : INSERT;
  const line = countUp(f, changeAt, r2(unitAt(prevQty) * prevQty), r2(unit * qty));
  q(pr, ".line-total")!.textContent = money(line);

  // Footer
  const lines = inserted ? 4 : 3;
  q(root, "[data-line-count]")!.textContent = `${lines} items`;
  const total = inserted
    ? countUp(f, changeAt, OTHER_LINES + (qty === 1 ? 0 : r2(unitAt(prevQty) * prevQty)), OTHER_LINES + r2(unit * qty))
    : OTHER_LINES;
  q(root, "[data-order-footer] [data-order-total]")!.textContent = money(r2(total));
  const add = q(root, "[data-add-all]")!;
  add.textContent = `Add ${lines} to cart`;
  press(add, f, CLICK.add);

  pill(root, f);
}

/** Cart pill fills right after "Add 4 to cart"; r11 typeBump on amount + count chip. */
function pill(root: HTMLElement, f: number) {
  const pl = q(root, "[data-cart-pill]");
  if (!pl) return;
  press(pl, f, CLICK.pill);
  const amt = q(pl, "[data-cart-total]")!;
  const chip = q(pl, "[data-cart-count]")!;
  const p = prog(f, PILL_FILL, PILL_FILL + 12, SETTLE);
  if (f < PILL_FILL) {
    amt.hidden = true;
    chip.hidden = true;
    return;
  }
  amt.hidden = false;
  chip.hidden = false;
  amt.textContent = money(ORDER_TOTAL);
  chip.textContent = "4";
  // width grows for layout; clip-path (not overflow) reveals it so the comma's descender is never cut
  amt.style.maxWidth = p < 1 ? `${p * 90}px` : "";
  amt.style.whiteSpace = "nowrap";
  amt.style.clipPath = p < 1 ? `inset(-6px ${(1 - p) * 100}% -6px 0)` : "";
  const since = f - (PILL_FILL + 6);
  const bump = since >= 0 && since <= 13 ? 1 + 0.12 * Math.sin((since / 13) * Math.PI) : 1;
  amt.style.transform = `scale(${bump})`;
  chip.style.transform = `scale(${p * bump})`;
}

function applyCart(root: HTMLElement, f: number) {
  const input = q<HTMLInputElement>(root, "[data-po-input]")!;
  const n = typedCount(f, TYPE_PO[0], TYPE_PO[1], PO.length);
  input.value = PO.slice(0, n);
  input.setAttribute("value", input.value);
  const focused = f >= CLICK.po && f < TYPE_PO[1] + 10;
  input.style.borderColor = focused ? "var(--blue)" : "";
  input.style.boxShadow = focused ? "0 0 0 3px rgba(44,62,224,0.14)" : "";
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

  // Net 30 credit: $45,000.00 available before this order -> $25,693.50 left (after camera settles)
  const cp = prog(f, CREDIT_ANIM[0], CREDIT_ANIM[1], CAM_E);
  const left = r2(lerp(CREDIT_BEFORE, CREDIT_AFTER, cp));
  q(root, "[data-cart-summary] [data-credit-available]")!.textContent = `${money(left)} left of ${money(CREDIT_LIMIT)}`;
  const bar = q(root, "[data-cart-summary] [data-credit-bar]")!;
  const used = (CREDIT_PRIOR_USED / CREDIT_LIMIT) * 100;
  bar.style.setProperty("--credit-used-end", `${used}%`);
  bar.style.setProperty("--credit-order-end", `${used + ((CREDIT_BEFORE - left) / CREDIT_LIMIT) * 100}%`);
  press(q(root, "[data-place-order]"), f, CLICK.place);
}

function applyConfirmation(root: HTMLElement, f: number) {
  const p = prog(f, CONF_PANEL[0], CONF_PANEL[1], CAM_E);
  const panel = q(root, "[data-confirm-panel]")!;
  panel.style.transform = `scale(${0.96 + 0.04 * p})`;
  panel.style.transformOrigin = "50% 30%";
  press(q(root, ".confirm-actions .btn-text"), f, CLICK.msg);
}

function applyMessages(root: HTMLElement, f: number) {
  // the order was placed, so the cart is empty again (as on r11's confirmation screen)
  const amt = q(root, "[data-cart-pill] [data-cart-total]");
  const chip = q(root, "[data-cart-pill] [data-cart-count]");
  if (amt) amt.hidden = true;
  if (chip) chip.hidden = true;
  const sam = q(root, "[data-msg-sam]")!;
  const b = prog(f, BUBBLE[0], BUBBLE[1], SETTLE);
  sam.style.opacity = `${b}`;
  sam.style.transform = `translateY(${(1 - b) * 12}px)`;
  press(q(root, "[data-open-invoice]"), f, CLICK.inv);
  // r11 invoice modal (opened by View invoice): scrim fade + panel scale .96 -> 1
  const modal = q(root, "[data-inv-modal]")!;
  modal.hidden = f < MODAL[0];
  const m = prog(f, MODAL[0] + 2, MODAL[1], CAM_E);
  q(root, ".im-scrim")!.style.opacity = `${prog(f, MODAL[0], MODAL[0] + 24, CAM_E)}`;
  const pnl = q(root, ".im-panel")!;
  pnl.style.opacity = `${prog(f, MODAL[0] + 2, MODAL[0] + 12, CAM_E)}`;
  pnl.style.transform = `scale(${0.96 + 0.04 * m})`;
  // ledger customerPo = the PO Anna entered (r11 prints L.customerPo || "None")
  const poV = qa(root, ".im-meta > div").find((d) => /Your PO/.test(d.textContent || ""));
  const v = poV && q(poV, ".v");
  if (v) v.textContent = PO;
}

const APPLY: Record<string, (r: HTMLElement, f: number) => void> = {
  "qo-desktop": applyQuickOrder,
  cart: applyCart,
  confirmation: applyConfirmation,
  messages: applyMessages,
};

/* ---------- component ---------- */
const Layer: React.FC<{ screen: string; frame: number; slide: number; clipLeft?: number }> = ({ screen, frame, slide, clipLeft }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [markup] = useState(() => ({ __html: html(screen) }));
  useLayoutEffect(() => {
    const root = ref.current!;
    APPLY[screen](root, frame);
    const page = q(root, ".page, .messages-layout");
    if (page) {
      page.style.transform = slide ? `translateX(${slide}px)` : "";
    }
  });
  return (
    <div
      ref={ref}
      className="film-layer"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        overflow: "hidden",
        clipPath: clipLeft ? `inset(0 0 0 ${clipLeft}px)` : undefined,
        boxShadow: undefined,
      }}
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
    <svg width={34} height={44} viewBox="0 0 17 22" style={{ position: "absolute", left: -3, top: -2, transformOrigin: "3px 2px", transform: `scale(${1 - 0.18 * pr})`, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.28))" }}>
      <path d="M1.5 1.5 L1.5 17.5 L5.6 13.6 L8.4 20 L11 18.9 L8.3 12.6 L14 12.6 Z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  </div>
);

const LOGO = R["qo-search.logo"]; // sidebar logo slot (canvas)
const MAIN_X = 220; // r11 sidebar width: main column starts here
const PUSH_DIST = 1700; // incoming page travels the main column width
const PARALLAX = 340;
const LOGO_AR = LOGO[3] / LOGO[2];

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

  // Screen layers (push-slide: outgoing slides left + fades, incoming slides in from the right)
  let idx = 0;
  for (let i = 1; i < SCREENS.length; i++) if (frame >= SCREENS[i][1]) idx = i;
  const cur = SCREENS[idx];
  const tIn = idx > 0 ? prog(frame, cur[1], cur[2], CAM_E) : 1;
  const prev = idx > 0 && tIn < 1 ? SCREENS[idx - 1] : null;

  // Clip: UI expands out of the logo slot (intro) and collapses back into it (outro)
  const open = prog(frame, REVEAL[0], REVEAL[1]) * (1 - prog(frame, COLLAPSE[0], COLLAPSE[1]));
  // geometric size interpolation so the rect shrinks/grows at a constant perceived rate
  const pad = 6;
  const lx = LOGO[0] - pad, ly = LOGO[1] - pad, lw = LOGO[2] + 2 * pad, lh = LOGO[3] + 2 * pad;
  const w = lw * Math.pow(1920 / lw, open);
  const h = lh * Math.pow(1080 / lh, open);
  const kx = (w - lw) / (1920 - lw);
  const ky = (h - lh) / (1080 - lh);
  const x0 = lerp(lx, 0, kx), y0 = lerp(ly, 0, ky);
  const clip = `inset(${y0}px ${1920 - x0 - w}px ${1080 - y0 - h}px ${x0}px round ${lerp(8, 0, open)}px)`;
  const uiVisible = frame >= REVEAL[0] && frame < COLLAPSE[1];

  // Flying logo: centre -> slot (intro), slot -> centre (outro), same easing mirrored
  const lp = frame < LOGO_OUT[0] ? prog(frame, LOGO_IN[0], LOGO_IN[1]) : 1 - prog(frame, LOGO_OUT[0], LOGO_OUT[1]);
  const flying = frame < LOGO_IN[1] + 1 || frame >= LOGO_OUT[0] || !uiVisible;
  const [sx, sy] = toScreen(cam, LOGO[0], LOGO[1]);
  const bigW = 520;
  const logoW = lerp(bigW, LOGO[2] * cam.s, lp);
  const logoX = lerp(960 - bigW / 2, sx, lp);
  const logoY = lerp(540 - (bigW * LOGO_AR) / 2, sy, lp);

  const [px, py] = pointerAt(frame);
  const [spx, spy] = toScreen(cam, px, py);
  const pOpacity = prog(frame, POINTER_VIS[0], POINTER_VIS[1]) * (1 - prog(frame, POINTER_VIS[2], POINTER_VIS[3]));

  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      <style>{CSS + (flying ? ".film-layer .sidebar-brand img{visibility:hidden}" : "")}</style>
      {uiVisible && (
        <div
          style={{
            position: "absolute",
            width: 1920,
            height: 1080,
            transformOrigin: "0 0",
            transform: `translate(960px,540px) scale(${cam.s}) translate(${-cam.cx}px,${-cam.cy}px)`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, clipPath: clip }}>
            {/* push: incoming page slides over from the right (full contrast), outgoing parallaxes left */}
            {prev && <Layer key={prev[0]} screen={prev[0]} frame={frame} slide={-PARALLAX * tIn} />}
            <Layer key={cur[0]} screen={cur[0]} frame={frame} slide={prev ? PUSH_DIST * (1 - tIn) : 0} clipLeft={prev ? MAIN_X + PUSH_DIST * (1 - tIn) : 0} />
            {prev && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: MAIN_X + PUSH_DIST * (1 - tIn) - 24,
                  width: 24,
                  background: "linear-gradient(to right, rgba(26,26,26,0), rgba(26,26,26,0.06))",
                }}
              />
            )}
          </div>
        </div>
      )}
      {flying && (
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
