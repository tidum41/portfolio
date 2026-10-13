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
  OW, OH, camAt, CLICK, DROPDOWN_OPEN, DURATION, ENTER, FADE_E, FPS, MORPH, POP_IN, TPL_ROWS, TYPE_QTY,
  INSERT, PILL_FILL, prog, TYPE_SEARCH, UI_E, type Cam, CONF_XFADE, END_FADE,
  UI_W, UI_H, CART_FADE,
} from "./joola/timeline";

export const JOOLA_FPS = FPS;
export const JOOLA_DURATION = DURATION;

/* ---------- ledger (mirrors assets/joola-b2b/ledger.js; verified by scripts/check-film.py) ---------- */
const PERSEUS_TIER = [[1, 179.97], [6, 164.97], [12, 149.98], [24, 134.98]] as const;
const OTHER_LINES = 2483.52 + 262.56 + 362.82; // Hyperion 24, HC-40 48, Tour Elite Bag 6 = 3,108.90
const ORDER_TOTAL = 19306.5;
const CREDIT_LIMIT = 50000;
const CREDIT_PRIOR_USED = 5000;
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

import { pointerAt, cursorScale } from "./joola/pointer";

/* ---------- markup ---------- */
const A = staticFile("joola-b2b");
// p17: the prototype's own :hover / :active rules, driven by the film cursor (hit-tested every frame)
const CSS =
  PROTO_CSS.split("__A__").join(A).split(":hover").join(".film-hover").split(":active").join(".film-active") +
  `
:root{--switcher-h:0px !important}
#devSwitcher{display:none!important}
.film-layer *,.film-layer *::before,.film-layer *::after{transition:none!important;animation:none!important}
.film-layer .screen.active{min-height:756px;height:756px}
.film-layer #app{padding-top:0;min-height:756px}
.film-layer .messages-layout{position:relative;z-index:0}
.film-layer .inv-modal{z-index:1000}
.film-caret{display:inline-block;width:1.5px;height:16px;margin-left:1px;background:var(--ink);vertical-align:-3px}
`;
const html = (k: string) =>
  `<div id="app">${PROTO_SCREENS[k].split("__A__").join(A).replace('class="screen"', 'class="screen active"')}</div>`;

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T | null;
const qa = (root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)) as HTMLElement[];
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

  // Reorder rail: Match kit click -> Add to order / Replace order popover (hover + press come from the cursor hit-test)
  const tpl = q(root, '[data-template="tpl-match"]');
  const pop = q(root, "[data-tpl-pop]");
  const POP_CLOSE = CLICK.tplAdd + 4; // the popover stays through the "Add to order" press, then closes
  const popOpen = f >= CLICK.tpl && f < POP_CLOSE + 3;
  if (tpl) tpl.classList.toggle("is-open", popOpen);
  if (pop && tpl) {
    pop.hidden = !popOpen;
    pop.style.top = `${tpl.offsetTop + tpl.offsetHeight + 4}px`;
    const pin = prog(f, POP_IN[0], POP_IN[1], UI_E) * (1 - prog(f, POP_CLOSE, POP_CLOSE + 3, FADE_E));
    pop.style.opacity = `${pin}`;
    pop.style.transform = `translateY(${(1 - pin) * 6}px)`;
  }

  // Search: click -> focus ring + caret, then typing (2f per character, cursor still)
  const field = q(root, "[data-search-field]")!;
  const typed = SEARCH.slice(0, typedCount(f, TYPE_SEARCH[0], TYPE_SEARCH[1], SEARCH.length));
  const focused = f >= CLICK.search && f < ENTER;
  field.classList.toggle("has-value", typed.length > 0);
  const val = q(field, ".value")!;
  if (val.firstChild && val.firstChild.nodeType === 3) val.firstChild.textContent = typed;
  else val.insertBefore(document.createTextNode(typed), val.firstChild);
  caret(val, focused && typed.length > 0);
  // empty + focused: the caret sits at the start of the placeholder (absolutely placed, so nothing shifts)
  const ph = q(field, ".placeholder");
  if (ph) {
    caret(ph, focused && typed.length === 0);
    const pc = q(ph, ":scope > .film-caret");
    if (pc) { pc.style.position = "absolute"; pc.style.marginLeft = "-2px"; pc.style.marginTop = "2px"; if (ph.firstChild !== pc) ph.insertBefore(pc, ph.firstChild); }
  }
  field.style.borderColor = focused ? "var(--blue)" : "";
  field.style.boxShadow = focused ? "0 0 0 3px rgba(44,62,224,0.14)" : "";

  // results: enter (fade + 6px rise, 200ms), first result selected (bg, 100ms), leave (fade, 120ms)
  const res = q(root, "[data-search-results]")!;
  const open = f >= DROPDOWN_OPEN && f < ENTER;
  res.hidden = !open;
  res.classList.toggle("is-closed", !open);
  const dIn = prog(f, DROPDOWN_OPEN, DROPDOWN_OPEN + 6, UI_E);
  const dOut = 1; // p10: the dropdown closes on Enter (no overlap with the table header)
  res.style.opacity = `${dIn * dOut}`;
  res.style.transform = `translateY(${(1 - dIn) * 6}px)`;

  // Perseus row enters on Enter: fade + 6px rise over 200ms; rows below make room on the same curve
  const rows = qa(root, "[data-order-row]");
  const pr = rows[0];
  const inserted = f >= INSERT[0];
  pr.style.display = inserted ? "" : "none";
  const ip = prog(f, INSERT[0], INSERT[1], UI_E);
  pr.style.opacity = `${ip}`;
  pr.style.transform = `translateY(${(1 - ip) * 6}px)`;
  pr.style.background = "";
  pr.hidden = false;
  // Match kit "Add to order": its 3 lines join below Perseus, fade + 6px rise, 66ms stagger
  const tplIn = f >= TPL_ROWS[0];
  rows.slice(1).forEach((r, i) => {
    r.hidden = false;
    r.style.display = tplIn ? "" : "none";
    const t = prog(f, TPL_ROWS[0] + 2 * i, TPL_ROWS[0] + 2 * i + 6, UI_E);
    r.style.opacity = `${t}`;
    r.style.transform = `translateY(${(1 - t) * 6}px)`;
  });

  // Qty: click the field -> 120 (instant); price tier 179.97 -> 134.98 and line total swap on the same frame
  // Qty: click the field, type "120" (2f per key); price tier and line total follow each keystroke instantly
  const QTY_STEPS = [1, 12, 120];
  const qty = f < TYPE_QTY[0] ? 1 : QTY_STEPS[Math.min(2, Math.floor((f - TYPE_QTY[0]) / 2))];
  const qFocus = f >= CLICK.qty && f < TYPE_QTY[1] + 14;
  q(pr, "[data-qty-stepper]")!.style.boxShadow = qFocus ? "0 0 0 2px rgba(44,62,224,0.9)" : "";
  const qtyEl = q(pr, ".qty")!;
  qtyEl.textContent = `${qty}`;
  qa(pr, "[data-set-perseus]").forEach((b) => b.classList.remove("on"));
  const unit = unitAt(qty);
  q(pr, ".unit")!.innerHTML = `${money(unit)}<span class="ea">ea</span>`;
  const line = r2(unit * qty);
  q(pr, ".line-total")!.textContent = money(line);

  // Footer
  const lines = (inserted ? 1 : 0) + (tplIn ? 3 : 0);
  q(root, "[data-line-count]")!.textContent = `${lines} ${lines === 1 ? "item" : "items"}`;
  const total = (inserted ? line : 0) + (tplIn ? OTHER_LINES : 0);
  q(root, "[data-order-footer] [data-order-total]")!.textContent = money(r2(total));
  const add = q<HTMLButtonElement>(root, "[data-add-all]")!;
  // p14 prototype: the button never changes on click (same label, width, colour); the cart pill is the feedback
  add.style.whiteSpace = "nowrap";
  add.textContent = `Add ${lines} to cart`;
  pill(root, f);
}

/** Cart pill fills right after "Add 4 to cart"; r11 typeBump on amount + count chip. */
function pill(root: HTMLElement, f: number) {
  const pl = q(root, "[data-cart-pill]");
  if (!pl) return;
  const amt = q(pl, "[data-cart-total]")!;
  const chip = q(pl, "[data-cart-count]")!;
  // geometry locked: amount + badge always laid out, only revealed at the snap (pill never grows)
  amt.hidden = false;
  chip.hidden = false;
  const on = f >= PILL_FILL[0];
  amt.textContent = money(on ? ORDER_TOTAL : 0); // $0.00 -> $19,306.50, instant; the width is reserved
  chip.textContent = "4";
  amt.style.whiteSpace = "nowrap";
  amt.style.visibility = "";
  chip.style.visibility = on ? "" : "hidden";
  // badge grows into place 0.6 -> 1 over 160ms, no overshoot; the amount swaps instantly
  const t = prog(f, PILL_FILL[0], PILL_FILL[1], UI_E);
  chip.style.transform = on && t < 1 ? `scale(${0.6 + 0.4 * t})` : "";
}

function applyCart(root: HTMLElement, f: number) {
  // PO already on file (shown on the confirmation); no PO entry beat in p12
  const input = q<HTMLInputElement>(root, "[data-po-input]")!;
  input.value = PO;
  input.setAttribute("value", PO);

  // number swaps instantly at the start of the bar move; the bar width eases over 400ms
  const cp = 1; // p17: the prototype's real Cart state (this order already counted against credit)
  const left = CREDIT_AFTER;
  q(root, "[data-cart-summary] [data-credit-available]")!.textContent = `${money(left)} available of $${Math.round(CREDIT_LIMIT).toLocaleString("en-US")}`;
  const bar = q(root, "[data-cart-summary] [data-credit-bar]")!;
  const used = (CREDIT_PRIOR_USED / CREDIT_LIMIT) * 100;
  bar.style.setProperty("--credit-used-end", `${used}%`);
  bar.style.setProperty("--credit-order-end", `${used + ((ORDER_TOTAL * cp) / CREDIT_LIMIT) * 100}%`);
}


function applyConfirmation(root: HTMLElement, f: number) {
  // hard cut to the real screen; nothing animates on the panel
  // the order was placed, so the cart pill is empty again (prototype behaviour)
  const amt = q(root, "[data-cart-pill] [data-cart-total]");
  const chip = q(root, "[data-cart-pill] [data-cart-count]");
  if (amt) amt.hidden = true;
  if (chip) chip.hidden = true;
}

const APPLY: Record<string, (r: HTMLElement, f: number) => void> = {
  "qo-desktop": applyQuickOrder,
  cart: applyCart,
  confirmation: applyConfirmation,
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
      style={{ position: "absolute", left: 0, top: 0, width: UI_W, height: UI_H, overflow: "hidden", opacity, background: "#fff" }}
      dangerouslySetInnerHTML={markup}
    />
  );
};

/** macOS arrow, ~1.3% of frame width, black with a white outline and a 15% soft shadow. Tip at (x, y). */
const Cursor: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <svg width={19} height={25} viewBox="0 0 17 22" style={{ position: "absolute", pointerEvents: "none", left: x - 1.7, top: y - 1.7, transformOrigin: "1.7px 1.7px", transform: `scale(${scale})`, filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.15))", overflow: "visible" }}>
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

  // screens: one layer; during a fade the outgoing layer keeps its last camera, the incoming one starts wide
  const TR: [number, number, string, string][] = [
    [CART_FADE[0], CART_FADE[1] - CART_FADE[0], "qo-desktop", "cart"],
    [CONF_XFADE[0], CONF_XFADE[1] - CONF_XFADE[0], "cart", "confirmation"],
  ];
  const scrAt = (f: number) => (f >= CONF_XFADE[0] ? "confirmation" : f >= CART_FADE[0] ? "cart" : "qo-desktop");
  const tr = TR.find(([a, n]) => frame >= a && frame < a + n);
  // staggered dissolve: outgoing fades over the first ~60%, incoming over the last ~60%, so layouts never read double
  const layers: { screen: string; cam: Cam; o: number }[] = tr
    ? [
        { screen: tr[2], cam: camAt(tr[0] - 1), o: 1 - prog(frame, tr[0], tr[0] + Math.ceil(tr[1] * 0.6), FADE_E) },
        { screen: tr[3], cam: camAt(frame), o: prog(frame, tr[0] + tr[1] - Math.ceil(tr[1] * 0.6), tr[0] + tr[1], FADE_E) },
      ]
    : [{ screen: scrAt(frame), cam: camAt(frame), o: 1 }];

  const [spx, spy] = pointerAt(frame);
  // intro (mirror of the outro): the centred logo card fades out, then shot A fades in
  const logoW = 340;
  const lw = logoW, lx = OW / 2 - logoW / 2, ly = OH / 2 - (logoW * LOGO_AR) / 2;
  const intro = frame < MORPH[1];
  const outro = frame >= END_FADE[0];
  const uiOut = prog(frame, END_FADE[0], END_FADE[0] + 8, FADE_E);
  const logoT = prog(frame, END_FADE[0] + 6, END_FADE[1], FADE_E);
  const logoOpacity = intro ? 1 - prog(frame, MORPH[0], MORPH[0] + 5, FADE_E) : outro ? logoT : 0;
  const uiOpacity = intro ? prog(frame, MORPH[0] + 3, MORPH[1], FADE_E) : 1 - uiOut;
  const uiOn = frame >= MORPH[0] && frame < END_FADE[1];
  // one cursor for the whole film: fades in once the dashboard is up, fades out with it
  const showPtr = frame >= MORPH[1] && frame < END_FADE[0] + 8;
  const ptrOpacity = prog(frame, MORPH[1], MORPH[1] + 4, FADE_E) * (1 - uiOut);
  const stageRef = useRef<HTMLDivElement>(null);
  // the prototype's own hover / press states: hit-test the hotspot every frame (children have applied their state)
  useLayoutEffect(() => {
    const st = stageRef.current;
    if (!st) return;
    st.querySelectorAll(".film-hover, .film-active").forEach((e) => e.classList.remove("film-hover", "film-active"));
    if (!showPtr) return;
    // hover only once the cursor has slowed onto something (a fast pass over the rail or credit bar would flash states)
    const [qx, qy] = pointerAt(frame - 1);
    if (Math.hypot(spx - qx, spy - qy) > 6) return;
    const k = 1920 / OW;
    let el = document.elementFromPoint(spx * k, spy * k) as HTMLElement | null;
    const pressing = Object.values(CLICK).some((c) => frame - c >= 0 && frame - c < 4);
    st.setAttribute("data-hit", el ? `${el.tagName}.${el.className}` : "");
    while (el && el !== st && !el.classList.contains("film-layer")) {
      el.classList.add("film-hover");
      if (pressing) el.classList.add("film-active");
      el = el.parentElement;
    }
  });
  const camT = (c: Cam) => `translate(${OW / 2}px,${OH / 2}px) scale(${c.s}) translate(${-c.cx}px,${-c.cy}px)`;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Comp is 1920x1440 so the prototype keeps its 1920px-viewport layout (it has a min-width:1800px query);
          everything below is staged in a 1440x1080 (4:3) space and scaled up 4/3. */}
      <div ref={stageRef} style={{ position: "absolute", left: 0, top: 0, width: OW, height: OH, overflow: "hidden", transformOrigin: "0 0", transform: `scale(${1920 / OW})` }}>
      <style>{CSS}</style>
      {uiOn && (
        <div style={{ position: "absolute", inset: 0, opacity: uiOpacity }}>
          {layers.map((l) => l.o > 0 && (
            <div key={l.screen} style={{ position: "absolute", width: UI_W, height: UI_H, transformOrigin: "0 0", transform: camT(l.cam), opacity: l.o, boxShadow: "0 0 0 600px #fff" }}>
              <Layer key={l.screen} screen={l.screen} frame={frame} slide={0} />
            </div>
          ))}
        </div>
      )}
      {logoOpacity > 0 && (
        <img className="film-logo" src={`${A}/joola-logo.png`} style={{ position: "absolute", left: lx, top: ly, width: lw, height: lw * LOGO_AR, opacity: logoOpacity, pointerEvents: "none" }} />
      )}
      {showPtr && <div style={{ opacity: ptrOpacity, pointerEvents: "none" }}><Cursor x={spx} y={spy} scale={cursorScale(frame)} /></div>}
      </div>
    </AbsoluteFill>
  );
};
