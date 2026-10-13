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
  OW, OH, camAt, CLICK, CART_MOVE, CONF_ICON, CONF_TEXT, CONF_XFADE, CREDIT_ANIM, DROPDOWN_OPEN, DURATION, ENTER, FADE_E, FADE_OUT, FPS,
  INSERT, lerp, LOGO_IN, PILL_FILL, POINTER_OFF, prog, PTR_E, QTY_SET, RESULT_HOVER, SCREENS, TYPE_PO, TYPE_SEARCH, UI_E, UI_IN, type Cam,
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
const toScreen = (cam: Cam, x: number, y: number) => [(x - cam.cx) * cam.s + OW / 2, (y - cam.cy) * cam.s + OH / 2];

/* ---------- pointer (canvas coords); every move arrives just before its click ---------- */
const addBtn = ctr("qo-search.addBtn");
const QO_ZOOM_A = 68;
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
/** Cursor keys: [frame, UI point, frame whose camera projects it]. Travel is interpolated in SCREEN space
 *  (the cursor moves first, the camera follows) and holds its screen position across hard cuts. */
type Key = [number, [number, number], number];
const KEYS: Key[] = [
  [UI_IN, [470, 330], UI_IN],
  [CLICK.search - 6, P.search, CLICK.search],
  [QO_ZOOM_A, P.search, QO_ZOOM_A],
  [CLICK.qty - 12, P.qty, CLICK.qty],
  [CLICK.qty + 4, P.qty, CLICK.qty],
  [CLICK.qty + 14, [P.qty[0] + 70, P.qty[1] + 26], CLICK.qty],
  [CLICK.add - 6, P.add, CLICK.add - 1],
  [CLICK.add + 4, P.add, CLICK.add - 1], // stays put on screen through the cut
  [CLICK.pill - 6, P.pill, CLICK.pill - 1],
  [CLICK.pill + 2, P.pill, CLICK.pill - 1],
  [CLICK.po - 6, P.po, CLICK.po],
  [TYPE_PO[1], P.po, CLICK.po],
  [CLICK.place - 31, P.place, CLICK.place],
];
const pointerAt = (f: number): [number, number] => {
  const sp = (k: Key) => toScreen(camAt(k[2]), k[1][0], k[1][1]) as [number, number];
  if (f <= KEYS[0][0]) return sp(KEYS[0]);
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (f <= KEYS[i + 1][0]) {
      const a = sp(KEYS[i]), b = sp(KEYS[i + 1]);
      const t = prog(f, KEYS[i][0], KEYS[i + 1][0], PTR_E);
      return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    }
  }
  return sp(KEYS[KEYS.length - 1]);
};
/** Click: 0.9 for 3 frames, back to 1 over 4 frames. */
const cursorScale = (f: number) => {
  for (const c of Object.values(CLICK)) {
    const d = f - c;
    if (d >= 0 && d < 3) return 0.9;
    if (d >= 3 && d < 7) return lerp(0.9, 1, (d - 2) / 4);
  }
  return 1;
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
  el.style.transform = on ? `scale(${1 - 0.02 * k})` : "";
  el.style.opacity = on ? `${1 - 0.1 * k}` : "";
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

  // Search: click -> focus ring + caret, then typing (2f per character, cursor still)
  const field = q(root, "[data-search-field]")!;
  const typed = SEARCH.slice(0, typedCount(f, TYPE_SEARCH[0], TYPE_SEARCH[1], SEARCH.length));
  const focused = f >= CLICK.search && f < ENTER;
  field.classList.toggle("has-value", typed.length > 0);
  const val = q(field, ".value")!;
  if (val.firstChild && val.firstChild.nodeType === 3) val.firstChild.textContent = typed;
  else val.insertBefore(document.createTextNode(typed), val.firstChild);
  caret(val, focused && typed.length > 0);
  caret(field, focused && typed.length === 0);
  field.style.borderColor = focused ? "var(--blue)" : "";
  field.style.boxShadow = focused ? "0 0 0 3px rgba(44,62,224,0.14)" : "";

  // results: enter (fade + 6px rise, 200ms), first result selected (bg, 100ms), leave (fade, 120ms)
  const res = q(root, "[data-search-results]")!;
  const open = f >= DROPDOWN_OPEN && f < ENTER + 4;
  res.hidden = !open;
  res.classList.toggle("is-closed", !open);
  const dIn = prog(f, DROPDOWN_OPEN, DROPDOWN_OPEN + 6, UI_E);
  const dOut = 1 - prog(f, ENTER, ENTER + 4, FADE_E);
  res.style.opacity = `${dIn * dOut}`;
  res.style.transform = `translateY(${(1 - dIn) * 6}px)`;
  const hit = q(res, "[data-search-result]");
  const hv = prog(f, RESULT_HOVER[0], RESULT_HOVER[1], FADE_E);
  if (hit) hit.style.background = hv > 0 ? `rgba(241,242,244,${hv})` : "";

  // Perseus row enters on Enter: fade + 6px rise over 200ms; rows below make room on the same curve
  const rows = qa(root, "[data-order-row]");
  const pr = rows[0];
  const inserted = f >= INSERT[0];
  pr.style.display = inserted ? "" : "none";
  const ip = prog(f, INSERT[0], INSERT[1], UI_E);
  pr.style.opacity = `${ip}`;
  pr.style.transform = `translateY(${(1 - ip) * 6}px)`;
  pr.style.background = "";
  rows.slice(1).forEach((r) => (r.style.transform = inserted ? `translateY(${-(1 - ip) * 87}px)` : ""));

  // Qty: click the field -> 120 (instant); price tier 179.97 -> 134.98 and line total swap on the same frame
  const qty = f >= QTY_SET ? 120 : 1;
  const qtyEl = q(pr, ".qty")!;
  qtyEl.textContent = `${qty}`;
  const ring = prog(f, CLICK.qty, CLICK.qty + 3, FADE_E) * (1 - prog(f, CLICK.qty + 18, CLICK.qty + 21, FADE_E));
  q(pr, "[data-qty-stepper]")!.style.boxShadow = ring > 0 ? `0 0 0 2px rgba(44,62,224,${ring})` : "";
  qa(pr, "[data-set-perseus]").forEach((b) => b.classList.remove("on"));
  const unit = unitAt(qty);
  q(pr, ".unit")!.innerHTML = `${money(unit)}<span class="ea">ea</span>`;
  const line = r2(unit * qty);
  q(pr, ".line-total")!.textContent = money(line);

  // Footer
  const lines = inserted ? 4 : 3;
  q(root, "[data-line-count]")!.textContent = `${lines} items`;
  const total = inserted ? OTHER_LINES + line : OTHER_LINES;
  q(root, "[data-order-footer] [data-order-total]")!.textContent = money(r2(total));
  const add = q<HTMLButtonElement>(root, "[data-add-all]")!;
  // r11 applyAddAll(): button -> "Added" (disabled), inline "Added to cart"
  const added = f >= CLICK.add;
  // lock geometry: width fixed to the "Add 4 to cart" label, so "Added" never reflows the footer
  add.style.width = "";
  add.style.whiteSpace = "nowrap";
  add.textContent = "Add 4 to cart";
  const lockW = add.offsetWidth;
  add.textContent = added ? "Added" : `Add ${lines} to cart`;
  add.style.width = `${lockW}px`;
  add.style.justifyContent = "center";
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
  // geometry locked: amount + badge always laid out, only revealed at the snap (pill never grows)
  amt.hidden = false;
  chip.hidden = false;
  amt.textContent = money(ORDER_TOTAL);
  chip.textContent = "4";
  amt.style.whiteSpace = "nowrap";
  const on = f >= PILL_FILL[0];
  amt.style.visibility = on ? "" : "hidden";
  chip.style.visibility = on ? "" : "hidden";
  // badge grows into place 0.6 -> 1 over 160ms, no overshoot; the amount swaps instantly
  const t = prog(f, PILL_FILL[0], PILL_FILL[1], UI_E);
  chip.style.transform = on && t < 1 ? `scale(${0.6 + 0.4 * t})` : "";
}

function applyCart(root: HTMLElement, f: number) {
  const input = q<HTMLInputElement>(root, "[data-po-input]")!;
  const n = typedCount(f, TYPE_PO[0], TYPE_PO[1], PO.length);
  input.value = PO.slice(0, n);
  input.setAttribute("value", input.value);
  const focused = f >= CLICK.po && f < CART_MOVE[0];
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

  // number swaps instantly at the start of the bar move; the bar width eases over 400ms
  const cp = prog(f, CREDIT_ANIM[0], CREDIT_ANIM[1], UI_E);
  const left = f >= CREDIT_ANIM[0] ? CREDIT_AFTER : CREDIT_BEFORE;
  q(root, "[data-cart-summary] [data-credit-available]")!.textContent = `${money(left)} left of ${money(CREDIT_LIMIT)}`;
  const bar = q(root, "[data-cart-summary] [data-credit-bar]")!;
  const used = (CREDIT_PRIOR_USED / CREDIT_LIMIT) * 100;
  bar.style.setProperty("--credit-used-end", `${used}%`);
  bar.style.setProperty("--credit-order-end", `${used + ((ORDER_TOTAL * cp) / CREDIT_LIMIT) * 100}%`);
  press(q(root, "[data-place-order]"), f, CLICK.place);
}


const APPLY: Record<string, (r: HTMLElement, f: number) => void> = {
  "qo-desktop": applyQuickOrder,
  cart: applyCart,
};

/* ---------- component ---------- */
const LOGO = R["qo-search.logo"]; // sidebar logo slot (canvas)
const LOGO_AR = LOGO[3] / LOGO[2];
const BG = "#f5f4f1"; // warm off-white background (logo card + confirmation), Ramp-style

/** Shell build/teardown: 0 = only the logo, 1 = full UI. sidebar and content are separate. */
const Layer: React.FC<{ screen: string; frame: number; slide: number; opacity?: number }> = ({ screen, frame, slide, opacity = 1 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [markup] = useState(() => ({ __html: html(screen) }));
  useLayoutEffect(() => {
    const root = ref.current!;
    APPLY[screen](root, frame);
    const page = q(root, ".page, .messages-layout");
    if (page) page.style.transform = slide ? `translateX(${slide}px)` : "";
  });
  return (
    <div
      ref={ref}
      className="film-layer"
      style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, overflow: "hidden", opacity, background: "#fff" }}
      dangerouslySetInnerHTML={markup}
    />
  );
};

/** macOS arrow, ~1.3% of frame width, black with a white outline and a 15% soft shadow. Tip at (x, y). */
const Cursor: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <svg width={19} height={25} viewBox="0 0 17 22" style={{ position: "absolute", left: x - 1.7, top: y - 1.7, transformOrigin: "1.7px 1.7px", transform: `scale(${scale})`, filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.15))", overflow: "visible" }}>
    <path d="M1.5 1.5 L1.5 17.5 L5.6 13.6 L8.4 20 L11 18.9 L8.3 12.6 L14 12.6 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
  </svg>
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

  const [spx, spy] = pointerAt(frame);
  const uiVisible = frame >= UI_IN && frame < CONF_XFADE[1];
  // Order placed: the cart cross-fades (8f) to a centred Ramp-style chip on the background colour
  const xf = prog(frame, CONF_XFADE[0], CONF_XFADE[1], FADE_E);
  const chipOn = frame >= CONF_XFADE[0] && frame < LOGO_IN[0];
  const chipOut = 1 - prog(frame, FADE_OUT[0], FADE_OUT[1], FADE_E);
  const icon = prog(frame, CONF_ICON[0], CONF_ICON[1], UI_E);
  const tx = (k: number) => prog(frame, CONF_TEXT + 2 * k, CONF_TEXT + 2 * k + 6, UI_E);
  // logo card == frame 0; fades up from the background over 0.3s at the end of the loop
  const logoA = frame < UI_IN ? 1 : frame >= LOGO_IN[0] ? prog(frame, LOGO_IN[0], LOGO_IN[1], FADE_E) : 0;
  const logoW = 340;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Comp is 1920x1440 so the prototype keeps its 1920px-viewport layout (it has a min-width:1800px query);
          everything below is staged in a 1440x1080 (4:3) space and scaled up 4/3. */}
      <div style={{ position: "absolute", left: 0, top: 0, width: OW, height: OH, overflow: "hidden", transformOrigin: "0 0", transform: `scale(${1920 / OW})` }}>
      <style>{CSS}</style>
      {uiVisible && (
        <div style={{ position: "absolute", width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${OW / 2}px,${OH / 2}px) scale(${cam.s * (1 + 0.06 * xf)}) translate(${-cam.cx}px,${-cam.cy}px)` }}>
          <Layer key={cur[0]} screen={cur[0]} frame={frame} slide={0} />
        </div>
      )}
      {chipOn && (
        <div style={{ position: "absolute", inset: 0, background: BG, opacity: xf, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ opacity: chipOut, display: "flex", alignItems: "center", gap: 26, padding: "30px 40px 30px 30px", background: "#fff", borderRadius: 18, boxShadow: "0 1px 2px rgba(26,26,26,0.06), 0 8px 28px rgba(26,26,26,0.06)", fontFamily: "FKGroteskNeue, sans-serif", color: "#1a1a1a" }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, background: "#2c3ee0", display: "flex", alignItems: "center", justifyContent: "center", opacity: icon, transform: `scale(${0.9 + 0.1 * icon})` }}>
              <svg width={36} height={36} viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.01em", opacity: tx(0), transform: `translateY(${(1 - tx(0)) * 6}px)` }}>Order placed</div>
              <div style={{ fontSize: 25, color: "#6b6b6b", marginTop: 6, opacity: tx(1), transform: `translateY(${(1 - tx(1)) * 6}px)` }}>
                SO-48213 for <span style={{ color: "#1a1a1a" }}>$19,306.50</span> on Net 30
              </div>
              <div style={{ fontSize: 25, color: "#6b6b6b", marginTop: 2, opacity: tx(2), transform: `translateY(${(1 - tx(2)) * 6}px)` }}>PO ENG-9812, Collin Johns confirms the ship date</div>
            </div>
          </div>
        </div>
      )}
      {logoA > 0 && (
        <img className="film-logo" src={`${A}/joola-logo.png`} style={{ position: "absolute", opacity: logoA, left: Math.round(OW / 2 - logoW / 2), top: Math.round(OH / 2 - (logoW * LOGO_AR) / 2), width: logoW, height: logoW * LOGO_AR }} />
      )}
      {uiVisible && frame < POINTER_OFF && <Cursor x={spx} y={spy} scale={cursorScale(frame)} />}
      </div>
    </AbsoluteFill>
  );
};
