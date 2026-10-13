/**
 * JOOLA B2B wholesale: buyer story film (r11 prototype), seamless loop.
 *
 * The UI is NOT re-drawn: the r11 prototype's own CSS and rendered screen markup are
 * captured by scripts/capture-proto.py into joola/proto.generated.ts and mounted here
 * verbatim. Each frame only sets state on that markup the way the prototype's JS would.
 * All timing + camera maths live in joola/timeline.ts (checked by scripts/timeline-report.mjs).
 */
import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PROTO_CSS, PROTO_SCREENS } from "./joola/proto.generated";
import { R } from "./joola/proto-rects.generated";
import {
  bezier, BUBBLE, CAM_E, camAt, CLICK, CONTENT_IN, CONTENT_OUT, CREDIT_ANIM, DROPDOWN_OPEN, DURATION, FPS, INSERT, lerp,
  LOGO_IN, LOGO_OUT, PILL_FILL, PRESET_COUNT, prog, PUSH, QTY_COMMIT, QTY_COUNT, QTY_KEYS, QTY_SELECT, SCREENS, SETTLE,
  SIDEBAR_IN, SIDEBAR_OUT, TYPE_PO, TYPE_SEARCH, type Cam,
} from "./joola/timeline";

export const JOOLA_FPS = FPS;
export const JOOLA_DURATION = DURATION;

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
const ctr = (k: string): [number, number] => {
  const r = R[k];
  return [r[0] + r[2] / 2, r[1] + r[3] / 2];
};

/** Film-only compaction: lift the sticky Quick order footer to sit under the table/rail. */
const FOOTER_LIFT = R["qo-search.footer"][1] - (R["qo-search.rail"][1] + R["qo-search.rail"][3] + 48);
const toScreen = (cam: Cam, x: number, y: number) => [(x - cam.cx) * cam.s + 960, (y - cam.cy) * cam.s + 540];

/* ---------- pointer (canvas coords); every move arrives just before its click ---------- */
const addBtn = ctr("qo-search.addBtn");
const P = {
  start: [760, 560] as [number, number],
  search: [330, 142] as [number, number],
  result: [340, 196] as [number, number],
  preset: ctr("qo-search.preset24"),
  qty: ctr("qo-search.qty0"),
  add: [addBtn[0] + 46, addBtn[1] - FOOTER_LIFT + 10] as [number, number],
  pill: [1594, 30] as [number, number],
  po: [360, 434] as [number, number],
  place: [ctr("cart.place")[0] + 100, ctr("cart.place")[1] + 10] as [number, number],
  msg: ctr("confirmation.msgBtn"),
};
const PATH: [number, [number, number]][] = [
  [40, P.start],
  [CLICK.search - 2, P.search],
  [CLICK.result - 12, P.search],
  [CLICK.result - 2, P.result],
  [CLICK.preset - 2, P.preset],
  [CLICK.qty - 12, P.preset],
  [CLICK.qty - 2, P.qty],
  [QTY_COMMIT + 4, P.qty],
  [QTY_COMMIT + 30, [P.qty[0] + 60, P.qty[1] + 80]],
  [CLICK.add - 2, P.add],
  [CLICK.pill - 14, P.add],
  [CLICK.pill - 2, P.pill],
  [CLICK.po - 20, [P.pill[0] - 600, P.pill[1] + 300]],
  [CLICK.po - 2, P.po],
  [CLICK.place - 20, [P.po[0] + 500, P.po[1] + 40]],
  [CLICK.place - 2, P.place],
  [CLICK.msg - 16, [P.msg[0] + 140, P.msg[1] + 30]],
  [CLICK.msg - 2, P.msg],
];
const POINTER_VIS = [38, 46, CLICK.msg + 2 + PUSH, CLICK.msg + 2 + PUSH + 10] as const;
const POINTER_E = bezier(0.5, 0, 0.25, 1);
const pointerAt = (f: number): [number, number] => {
  if (f <= PATH[0][0]) return PATH[0][1];
  for (let i = 0; i < PATH.length - 1; i++) {
    const [fa, a] = PATH[i];
    const [fb, b] = PATH[i + 1];
    if (f <= fb) {
      const t = prog(f, fa, fb, POINTER_E);
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
const typedCount = (f: number, a: number, b: number, len: number) =>
  Math.max(0, Math.min(len, Math.floor(interpolate(f, [a, b], [0, len + 0.999], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));

/* ---------- per-screen state ---------- */
function applyQuickOrder(root: HTMLElement, f: number) {
  q(root, "[data-order-footer]")!.style.transform = `translateY(${-FOOTER_LIFT}px)`;

  // Search: click -> focus ring + caret, then typing (3f per character)
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

  const res = q(root, "[data-search-results]")!;
  const open = f >= DROPDOWN_OPEN && f < CLICK.result + 1;
  res.hidden = !open;
  res.classList.toggle("is-closed", !open);
  const dp = prog(f, DROPDOWN_OPEN, DROPDOWN_OPEN + 6, SETTLE);
  res.style.opacity = `${dp}`;
  res.style.transform = `translateY(${(1 - dp) * -6}px)`;
  const hit = q(res, "[data-search-result]");
  if (hit) hit.style.background = f >= CLICK.result - 6 ? "var(--band)" : "";

  // Perseus row slides in after the result click
  const rows = qa(root, "[data-order-row]");
  const pr = rows[0];
  const inserted = f >= INSERT[0];
  pr.style.display = inserted ? "" : "none";
  const ip = prog(f, INSERT[0], INSERT[1], SETTLE);
  pr.style.opacity = `${ip}`;
  pr.style.transform = `translateY(${(1 - ip) * -10}px)`;
  pr.style.background = inserted ? `rgba(44,62,224,${0.06 * (1 - prog(f, INSERT[1], INSERT[1] + 30))})` : "";
  rows.slice(1).forEach((r) => (r.style.transform = inserted ? `translateY(${-(1 - ip) * 87}px)` : ""));

  // Qty: 1 -> click preset 24 -> 24 -> click qty, "24" selected, type 1,12,120 (5f/char), Enter
  let qty = 1;
  if (f >= CLICK.preset) qty = 24;
  if (f >= QTY_COMMIT) qty = 120;
  let qtyText = f >= CLICK.preset ? "24" : "1";
  for (const [k, t] of QTY_KEYS) if (f >= k) qtyText = t;
  const editing = f >= CLICK.qty && f < QTY_COMMIT;
  const qtyEl = q(pr, ".qty")!;
  qtyEl.textContent = qtyText;
  qtyEl.style.background = f >= QTY_SELECT[0] && f < QTY_SELECT[1] ? "rgba(44,62,224,0.22)" : "";
  qtyEl.style.borderRadius = "3px";
  caret(qtyEl, editing && f >= QTY_SELECT[1]);
  q(pr, "[data-qty-stepper]")!.style.boxShadow = editing ? "0 0 0 2px var(--blue)" : "";
  qa(pr, "[data-set-perseus]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-set-perseus") === "24" && qty === 24));
  press(q(pr, "[data-set-perseus='24']"), f, CLICK.preset);
  const unit = unitAt(qty);
  q(pr, ".unit")!.innerHTML = `${money(unit)}<span class="ea">ea</span>`;
  const prevQty = qty === 120 ? 24 : 1;
  const [ca, cb] = qty === 120 ? QTY_COUNT : qty === 24 ? PRESET_COUNT : INSERT;
  const lineFrom = r2(unitAt(prevQty) * prevQty);
  const line = r2(lerp(qty === 1 ? r2(unit) : lineFrom, r2(unit * qty), prog(f, ca, cb, SETTLE)));
  q(pr, ".line-total")!.textContent = money(line);

  // Footer
  const lines = inserted ? 4 : 3;
  q(root, "[data-line-count]")!.textContent = `${lines} items`;
  const total = inserted ? OTHER_LINES + line : OTHER_LINES;
  q(root, "[data-order-footer] [data-order-total]")!.textContent = money(r2(total));
  const add = q<HTMLButtonElement>(root, "[data-add-all]")!;
  // r11 applyAddAll(): button -> "Added" (disabled), inline "Added to cart"
  const added = f >= CLICK.add + 2;
  add.textContent = added ? "Added" : `Add ${lines} to cart`;
  add.disabled = added;
  if (!added) press(add, f, CLICK.add);
  else add.style.transform = "";
  const ok = q(root, "[data-inline-success]");
  if (ok) {
    ok.textContent = added ? "Added to cart" : "";
    ok.classList.toggle("show", added);
  }
  pill(root, f);
}

/** Cart pill fills right after "Add 4 to cart"; r11 typeBump on amount + count chip. */
function pill(root: HTMLElement, f: number) {
  const pl = q(root, "[data-cart-pill]");
  if (!pl) return;
  press(pl, f, CLICK.pill);
  const amt = q(pl, "[data-cart-total]")!;
  const chip = q(pl, "[data-cart-count]")!;
  if (f < PILL_FILL[0]) {
    amt.hidden = true;
    chip.hidden = true;
    return;
  }
  const p = prog(f, PILL_FILL[0], PILL_FILL[1], SETTLE);
  amt.hidden = false;
  chip.hidden = false;
  amt.textContent = money(ORDER_TOTAL);
  chip.textContent = "4";
  amt.style.maxWidth = p < 1 ? `${p * 90}px` : "";
  amt.style.whiteSpace = "nowrap";
  amt.style.clipPath = p < 1 ? `inset(-6px ${(1 - p) * 100}% -6px 0)` : "";
  const since = f - (PILL_FILL[0] + 6);
  const bump = since >= 0 && since <= 13 ? 1 + 0.12 * Math.sin((since / 13) * Math.PI) : 1;
  amt.style.transform = `scale(${bump})`;
  chip.style.transform = `scale(${p * bump})`;
}

function applyCart(root: HTMLElement, f: number) {
  const input = q<HTMLInputElement>(root, "[data-po-input]")!;
  const n = typedCount(f, TYPE_PO[0], TYPE_PO[1], PO.length);
  input.value = PO.slice(0, n);
  input.setAttribute("value", input.value);
  const focused = f >= CLICK.po && f < TYPE_PO[1] + 8;
  input.style.borderColor = focused ? "var(--blue)" : "";
  input.style.boxShadow = focused ? "0 0 0 3px rgba(44,62,224,0.14)" : "";
  let c = q(input.parentElement!, ":scope > .film-caret");
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
  const p = prog(f, CLICK.place + 2, CLICK.place + 2 + PUSH, CAM_E);
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
}

const APPLY: Record<string, (r: HTMLElement, f: number) => void> = {
  "qo-desktop": applyQuickOrder,
  cart: applyCart,
  confirmation: applyConfirmation,
  messages: applyMessages,
};

/* ---------- component ---------- */
const LOGO = R["qo-search.logo"]; // sidebar logo slot (canvas)
const LOGO_AR = LOGO[3] / LOGO[2];
const MAIN_X = 220; // r11 sidebar width: main column starts here
const PUSH_DIST = 1700; // incoming page travels the full main column
const PARALLAX = 420;

/** Shell build/teardown: 0 = only the logo, 1 = full UI. sidebar and content are separate. */
type Shell = { sidebar: number; content: number };
const shellAt = (f: number): Shell => ({
  sidebar: prog(f, SIDEBAR_IN[0], SIDEBAR_IN[1]) * (1 - prog(f, SIDEBAR_OUT[0], SIDEBAR_OUT[1])),
  content: prog(f, CONTENT_IN[0], CONTENT_IN[1]) * (1 - prog(f, CONTENT_OUT[0], CONTENT_OUT[1])),
});

const Layer: React.FC<{ screen: string; frame: number; slide: number; clipLeft?: number; shell: Shell }> = ({ screen, frame, slide, clipLeft, shell }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [markup] = useState(() => ({ __html: html(screen) }));
  useLayoutEffect(() => {
    const root = ref.current!;
    APPLY[screen](root, frame);
    const page = q(root, ".page, .messages-layout");
    if (page) page.style.transform = slide ? `translateX(${slide}px)` : "";
    // content area (topbar + page) slides in from / away to the right with a fade
    const main = q(root, ".main-column")!;
    main.style.opacity = `${shell.content}`;
    main.style.transform = shell.content < 1 ? `translateX(${(1 - shell.content) * 120}px)` : "";
    // sidebar grows out of / collapses into its logo: vertical first, then horizontal
    const sb = q(root, ".sidebar")!;
    const v = Math.min(1, shell.sidebar * 2); // 0..0.5: width, 0.5..1: height
    const hz = Math.max(0, shell.sidebar * 2 - 1);
    const lx = LOGO[0] - 8, ly = LOGO[1] - 8, lw = LOGO[2] + 16, lh = LOGO[3] + 16;
    const right = lerp(220 - (lx + lw), 0, v);
    const bottom = lerp(1080 - (ly + lh), 0, hz);
    sb.style.clipPath = shell.sidebar < 1 ? `inset(${lerp(ly, 0, v)}px ${right}px ${bottom}px ${lerp(lx, 0, v)}px round ${lerp(8, 0, v)}px)` : "";
    const brand = q(root, ".sidebar-brand img");
    if (brand) brand.style.visibility = shell.sidebar <= 0.001 ? "hidden" : "";
  });
  return (
    <div
      ref={ref}
      className="film-layer"
      style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, overflow: "hidden", clipPath: clipLeft ? `inset(0 0 0 ${clipLeft}px)` : undefined }}
      dangerouslySetInnerHTML={markup}
    />
  );
};

const Cursor: React.FC<{ x: number; y: number; press: number; ring: number; opacity: number }> = ({ x, y, press: pr, ring, opacity }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none" }}>
    {ring >= 0 && (
      <div style={{ position: "absolute", left: -28, top: -28, width: 56, height: 56, borderRadius: "50%", border: "3px solid rgba(44,62,224,0.55)", transform: `scale(${0.35 + ring * 0.85})`, opacity: 1 - ring }} />
    )}
    <svg width={34} height={44} viewBox="0 0 17 22" style={{ position: "absolute", left: -3, top: -2, transformOrigin: "3px 2px", transform: `scale(${1 - 0.18 * pr})`, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.28))" }}>
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
  let idx = 0;
  for (let i = 1; i < SCREENS.length; i++) if (frame >= SCREENS[i][1]) idx = i;
  const cur = SCREENS[idx];
  const tIn = idx > 0 ? prog(frame, cur[1], cur[2], bezier(0.37, 0, 0.63, 1)) : 1;
  const prev = idx > 0 && tIn < 1 ? SCREENS[idx - 1] : null;
  const shell = shellAt(frame);

  // Flying logo (intro: centre -> slot; outro: slot -> centre, mirrored easing)
  const lp = frame < LOGO_OUT[0] ? prog(frame, LOGO_IN[0], LOGO_IN[1]) : 1 - prog(frame, LOGO_OUT[0], LOGO_OUT[1]);
  const flying = frame <= LOGO_IN[1] || frame >= LOGO_OUT[0];
  const [sx, sy] = toScreen(cam, LOGO[0], LOGO[1]);
  const bigW = 520;
  const logoW = lerp(bigW, LOGO[2] * cam.s, lp);
  const logoX = lerp(960 - bigW / 2, sx, lp);
  const logoY = lerp(540 - (bigW * LOGO_AR) / 2, sy, lp);

  const [px, py] = pointerAt(frame);
  const [spx, spy] = toScreen(cam, px, py);
  const pOpacity = prog(frame, POINTER_VIS[0], POINTER_VIS[1]) * (1 - prog(frame, POINTER_VIS[2], POINTER_VIS[3]));
  const uiVisible = shell.sidebar > 0 || shell.content > 0;

  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      <style>{CSS + (flying ? ".film-layer .sidebar-brand img{visibility:hidden!important}" : "")}</style>
      {uiVisible && (
        <div style={{ position: "absolute", width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(960px,540px) scale(${cam.s}) translate(${-cam.cx}px,${-cam.cy}px)` }}>
          {/* push: incoming page slides over from the right at full contrast, outgoing parallaxes left */}
          {prev && <Layer key={prev[0]} screen={prev[0]} frame={frame} slide={-PARALLAX * tIn} shell={shell} />}
          <Layer key={cur[0]} screen={cur[0]} frame={frame} slide={prev ? PUSH_DIST * (1 - tIn) : 0} clipLeft={prev ? MAIN_X + PUSH_DIST * (1 - tIn) : 0} shell={shell} />
          {prev && (
            <div style={{ position: "absolute", top: 0, bottom: 0, left: MAIN_X + PUSH_DIST * (1 - tIn) - 28, width: 28, background: "linear-gradient(to right, rgba(26,26,26,0), rgba(26,26,26,0.08))" }} />
          )}
        </div>
      )}
      {flying && <img className="film-logo" src={`${A}/joola-logo.png`} style={{ position: "absolute", left: logoX, top: logoY, width: logoW, height: logoW * LOGO_AR }} />}
      {pOpacity > 0 && <Cursor x={spx} y={spy} press={pressAmt(frame)} ring={ringAt(frame)} opacity={pOpacity} />}
    </AbsoluteFill>
  );
};
