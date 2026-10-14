/**
 * JOOLA B2B wholesale: buyer story film (p20), seamless loop.
 *
 * UI from scripts/capture-proto.py → joola/proto.generated.ts. Timing in joola/timeline.ts.
 * After Add to cart: tight pill update, hard cut to the summary, hard cut + scale settle to Order placed.
 */
import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PROTO_CSS, PROTO_SCREENS } from "./joola/proto.generated";
import { R } from "./joola/proto-rects.generated";
import {
  OW, OH, camAt, CLICK, DROPDOWN_OPEN, DURATION, ENTER, FADE_E, FPS, MORPH, POP_IN, TPL_ROWS,
  INSERT, PILL_BADGE, PILL_FILL, PILL_NUM_W, PILL_W0, PILL_W1, prog, TYPE_SEARCH, UI_E, EASE_OUT, type Cam, CONF_CUT, CONF_SETTLE, END_FADE,
  UI_W, UI_H, CART_CUT, lerp, MOVE_E,
} from "./joola/timeline";
import { pointerAt, cursorScale, toScreen, hoverState, cursorKind } from "./joola/pointer";

export const JOOLA_FPS = FPS;
export const JOOLA_DURATION = DURATION;

const PERSEUS_TIER = [[1, 179.97], [6, 164.97], [12, 149.98], [24, 134.98]] as const;
const OTHER_LINES = 2483.52 + 262.56 + 362.82;
const ORDER_TOTAL = 19306.5;
const CREDIT_LIMIT = 50000;
const CREDIT_PRIOR_USED = 5000;
const CREDIT_AFTER = CREDIT_LIMIT - CREDIT_PRIOR_USED - ORDER_TOTAL;
const PO = "ENG-9812";
const SEARCH = "Perseus";
const unitAt = (q: number) => {
  let p: number = PERSEUS_TIER[0][1];
  for (const [min, price] of PERSEUS_TIER) if (q >= min) p = price;
  return p;
};
const r2 = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const A = staticFile("joola-b2b");
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
.film-layer .order-row.is-just-added,
.film-layer .order-row.is-just-added.film-hover,
.film-layer .order-row.is-just-added .film-hover{background:transparent!important}
.film-layer .search-result.film-hover{background:var(--band)!important}
.film-layer .search-result.film-active{background:var(--wash)!important}
.film-layer .qty-presets button.on,
.film-layer .qty-group .qty-presets button.on{color:var(--ink)!important;background:var(--wash)!important;border-color:var(--line)!important}
.film-layer .qty-presets button.film-hover,
.film-layer .qty-group .qty-presets button.film-hover{background:var(--band)!important;color:var(--ink)!important}
.film-layer .qty-presets button.film-active,
.film-layer .qty-group .qty-presets button.film-active{background:var(--wash)!important}
/* Colour only. Higher specificity than the prototype's !important width/background transitions,
   so hover and active cannot restart a fade or scale the control. */
.film-layer .cart-pill,
.film-layer .btn-primary,
.film-layer .btn-outline,
.film-layer .tpl-choice,
.film-layer .rail-item{
  transition:none!important;animation:none!important;transform:none!important;
}
/* max-content !important would ignore the per-frame width and snap the total. */
.film-layer .cart-pill{
  width:var(--film-pill-w, max-content)!important;
  min-width:0!important;
  overflow:hidden!important;
  flex-shrink:0!important;
}
/* Prototype pins the menu with position:fixed !important. Inside the scaled stage that
   escapes the rail; absolute coords below are relative to the rail card. */
.film-layer .rail-item{
  height:72px!important;min-height:72px!important;max-height:72px!important;
  box-sizing:border-box!important;border-width:0!important;
}
.film-layer .rail-item .rail-id,
.film-layer .rail-item .name,
.film-layer .rail-item .meta{line-height:16px!important}
.film-layer .tpl-pop{position:absolute!important;margin:0!important;transform:none!important;transition:none!important}
.film-layer .tpl-pop .tpl-choice{
  height:32px!important;box-sizing:border-box!important;font-weight:500!important;
  border-width:1px!important;transform:none!important;transition:none!important;opacity:1!important;
}
.film-layer .tpl-pop .btn-primary{border-color:transparent!important}
.film-layer .qty-stepper .qty{position:relative}
.film-qty-caret{
  position:absolute;top:50%;left:calc(50% + 22px);width:1.5px;height:14px;margin-top:-7px;
  background:#1a1a1a;pointer-events:none;
}
.film-layer .cart-pill .count-chip{transform-origin:center center!important}
.film-layer .cart-pill.film-hover{background:var(--band)!important}
.film-layer .cart-pill.film-active{background:var(--wash)!important}
.film-layer .btn-primary.film-hover{background:#2433c4!important;opacity:1!important}
.film-layer .btn-primary.film-active{background:#1a2599!important;opacity:1!important}
.film-layer .btn-outline.film-hover{background:var(--band)!important;opacity:1!important}
.film-layer .btn-outline.film-active{background:var(--wash)!important;opacity:1!important}
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

function applyQuickOrder(root: HTMLElement, f: number) {
  const tpl = q(root, '[data-template="tpl-match"]');
  const pop = q(root, "[data-tpl-pop]");
  const POP_CLOSE = CLICK.tplAdd + 4;
  const popOpen = f >= CLICK.tpl && f < POP_CLOSE + 3;
  if (tpl) tpl.classList.toggle("is-open", popOpen);
  if (pop && tpl) {
    pop.hidden = !popOpen;
    // Integer pixels, identical every frame. The row is 72px tall; reading a
    // fractional offsetHeight here is what shifted the menu by a device pixel.
    pop.style.position = "absolute";
    pop.style.left = `${Math.round(tpl.offsetLeft) + 12}px`;
    pop.style.width = `${Math.max(160, Math.round(tpl.offsetWidth) - 24)}px`;
    pop.style.right = "auto";
    pop.style.top = `${Math.round(tpl.offsetTop) + 72 + 4}px`;
    pop.style.margin = "0";
    pop.style.transform = "none";
    const pin = popOpen
      ? prog(f, POP_IN[0], POP_IN[1], FADE_E) * (1 - prog(f, POP_CLOSE, POP_CLOSE + 3, FADE_E))
      : 0;
    pop.style.opacity = `${pin}`;
  }

  const field = q(root, "[data-search-field]")!;
  const typed = SEARCH.slice(0, typedCount(f, TYPE_SEARCH[0], TYPE_SEARCH[1], SEARCH.length));
  const focused = f >= CLICK.search && f < ENTER;
  field.classList.toggle("has-value", typed.length > 0);
  const val = q(field, ".value")!;
  if (val.firstChild && val.firstChild.nodeType === 3) val.firstChild.textContent = typed;
  else val.insertBefore(document.createTextNode(typed), val.firstChild);
  caret(val, focused && typed.length > 0);
  const ph = q(field, ".placeholder");
  if (ph) {
    caret(ph, focused && typed.length === 0);
    const pc = q(ph, ":scope > .film-caret");
    if (pc) { pc.style.position = "absolute"; pc.style.marginLeft = "-2px"; pc.style.marginTop = "2px"; if (ph.firstChild !== pc) ph.insertBefore(pc, ph.firstChild); }
  }
  field.style.borderColor = focused ? "var(--blue)" : "";
  field.style.boxShadow = focused ? "0 0 0 3px rgba(44,62,224,0.14)" : "";

  const res = q(root, "[data-search-results]")!;
  const open = f >= DROPDOWN_OPEN && f < ENTER;
  res.hidden = !open;
  res.classList.toggle("is-closed", !open);
  const dIn = prog(f, DROPDOWN_OPEN, DROPDOWN_OPEN + 6, UI_E);
  res.style.opacity = `${dIn}`;
  res.style.transform = `translateY(${(1 - dIn) * 6}px)`;

  const rows = qa(root, "[data-order-row]");
  const pr = rows[0];
  const inserted = f >= INSERT[0];
  pr.style.display = inserted ? "" : "none";
  const ip = prog(f, INSERT[0], INSERT[1], UI_E);
  pr.style.opacity = `${ip}`;
  pr.style.transform = `translateY(${(1 - ip) * 6}px)`;
  pr.hidden = false;
  // p19: no blue just-added / press fill — cursor press is the only feedback
  pr.classList.remove("is-just-added");
  pr.style.background = "";

  const tplIn = f >= TPL_ROWS[0];
  rows.slice(1).forEach((r, i) => {
    r.hidden = false;
    r.style.display = tplIn ? "" : "none";
    const t = prog(f, TPL_ROWS[0] + 2 * i, TPL_ROWS[0] + 2 * i + 6, UI_E);
    r.style.opacity = `${t}`;
    r.style.transform = `translateY(${(1 - t) * 6}px)`;
  });

  const qty = f < CLICK.qty ? 1 : 120;
  const qFocus = f >= CLICK.qty && f < CLICK.tpl;
  // Neutral focus ring — no blue glow on the stepper.
  q(pr, "[data-qty-stepper]")!.style.boxShadow = qFocus ? "0 0 0 2px rgba(26,26,26,0.35)" : "";
  const qtyEl = q(pr, ".qty")!;
  qtyEl.textContent = `${qty}`;
  if (qFocus && Math.floor((f - CLICK.qty) / 8) % 2 === 0) {
    const mark = document.createElement("span");
    mark.className = "film-qty-caret";
    qtyEl.appendChild(mark);
  }
  // never show blue/selected preset fills in the film
  qa(root, ".qty-presets button.on, .qty-group .qty-presets button.on").forEach((b) => b.classList.remove("on"));
  const unit = unitAt(qty);
  q(pr, ".unit")!.innerHTML = `${money(unit)}<span class="ea">ea</span>`;
  const line = r2(unit * qty);
  q(pr, ".line-total")!.textContent = money(line);

  const lines = (inserted ? 1 : 0) + (tplIn ? 3 : 0);
  q(root, "[data-line-count]")!.textContent = `${lines} ${lines === 1 ? "item" : "items"}`;
  const total = (inserted ? line : 0) + (tplIn ? OTHER_LINES : 0);
  q(root, "[data-order-footer] [data-order-total]")!.textContent = money(r2(total));
  const add = q<HTMLButtonElement>(root, "[data-add-all]")!;
  add.style.whiteSpace = "nowrap";
  add.textContent = `Add ${lines} to cart`;
  pill(root, f);
}

function pill(root: HTMLElement, f: number) {
  const pl = q(root, "[data-cart-pill]");
  if (!pl) return;
  const amt = q(pl, "[data-cart-total]")!;
  const chip = q(pl, "[data-cart-count]")!;
  const tw = f >= PILL_FILL[0] ? prog(f, PILL_FILL[0], PILL_FILL[1], EASE_OUT) : 0;
  const wpx = lerp(PILL_W0, PILL_W1, tw);
  // Swap the full total on the first frame the eased width can hold every glyph.
  // Showing it earlier clips "$19,306.50" down to a partial string.
  const showTotal = wpx >= PILL_NUM_W;
  amt.hidden = false;
  amt.textContent = money(showTotal ? ORDER_TOTAL : 0);
  amt.style.visibility = "";
  amt.style.whiteSpace = "nowrap";
  pl.style.setProperty("--film-pill-w", `${wpx}px`);
  pl.style.minWidth = "0";
  pl.style.overflow = "hidden";
  pl.style.justifyContent = "flex-start";
  const showBadge = f >= PILL_BADGE[0];
  chip.hidden = !showBadge;
  chip.textContent = "4";
  if (showBadge) {
    const bt = prog(f, PILL_BADGE[0], PILL_BADGE[1], EASE_OUT);
    chip.style.visibility = "";
    chip.style.opacity = `${bt}`;
    chip.style.transform = `scale(${lerp(0.6, 1, bt)})`;
  } else {
    chip.style.visibility = "hidden";
    chip.style.opacity = "0";
    chip.style.transform = "scale(0.6)";
  }
}

function applyCart(root: HTMLElement, f: number) {
  const input = q<HTMLInputElement>(root, "[data-po-input]");
  if (input) {
    input.value = PO;
    input.setAttribute("value", PO);
  }
  const left = CREDIT_AFTER;
  const avail = q(root, "[data-cart-summary] [data-credit-available]");
  if (avail) avail.textContent = `${money(left)} available of $${Math.round(CREDIT_LIMIT).toLocaleString("en-US")}`;
  const bar = q(root, "[data-cart-summary] [data-credit-bar]");
  if (bar) {
    const used = (CREDIT_PRIOR_USED / CREDIT_LIMIT) * 100;
    bar.style.setProperty("--credit-used-end", `${used}%`);
    bar.style.setProperty("--credit-order-end", `${used + (ORDER_TOTAL / CREDIT_LIMIT) * 100}%`);
  }
  pill(root, f);
  const sum = q(root, "[data-cart-summary]");
  if (sum) {
    sum.classList.remove("is-morph-exit");
    sum.style.opacity = "1";
    sum.style.transition = "none";
  }
}

function applyConfirmation(root: HTMLElement, f: number) {
  const amt = q(root, "[data-cart-pill] [data-cart-total]");
  const chip = q(root, "[data-cart-pill] [data-cart-count]");
  if (amt) { amt.hidden = false; amt.textContent = money(0); }
  if (chip) chip.hidden = true;
  const pl = q(root, "[data-cart-pill]");
  if (pl) pl.style.width = `${PILL_W0}px`;

  const panel = q(root, "[data-confirm-panel]");
  if (!panel) return;
  // Hard cut already swapped the screen. The card settles with a uniform scale
  // (type stays sharp; a non-uniform FLIP smeared it at 676px).
  const parts = qa(panel, ".confirm-title-row, .confirm-lede, .confirm-rows, .confirm-actions");
  parts.forEach((p) => { p.style.opacity = ""; p.style.transition = "none"; });
  if (f < CONF_SETTLE[1]) {
    const t = prog(f, CONF_SETTLE[0], CONF_SETTLE[1], EASE_OUT);
    const s = lerp(0.97, 1, t);
    const y = lerp(6, 0, t);
    panel.style.transformOrigin = "center center";
    panel.style.transform = `translateY(${y}px) scale(${s})`;
  } else {
    panel.style.transform = "";
    panel.style.transformOrigin = "";
  }
}

const APPLY: Record<string, (r: HTMLElement, f: number) => void> = {
  "qo-desktop": applyQuickOrder,
  cart: applyCart,
  confirmation: applyConfirmation,
};

const LOGO = R["qo-search.logo"];
const LOGO_AR = LOGO[3] / LOGO[2];
const BG = "#f5f4f1";

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

const Cursor: React.FC<{ x: number; y: number; scale: number; kind: "arrow" | "ibeam" }> = ({ x, y, scale, kind }) => (
  kind === "ibeam" ? (
    <svg width={15} height={23} viewBox="0 0 15 23" style={{ position: "absolute", pointerEvents: "none", left: x - 7.5, top: y - 11.5, transformOrigin: "7.5px 11.5px", transform: `scale(${scale})`, overflow: "visible" }}>
      <path d="M3 2.5 H12 M7.5 2.5 V20.5 M3 20.5 H12" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M3 2.5 H12 M7.5 2.5 V20.5 M3 20.5 H12" fill="none" stroke="#111" strokeWidth={1.35} strokeLinecap="butt" />
    </svg>
  ) : (
    <svg width={19} height={25} viewBox="0 0 17 22" style={{ position: "absolute", pointerEvents: "none", left: x - 1.7, top: y - 1.7, transformOrigin: "1.7px 1.7px", transform: `scale(${scale})`, filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.15))", overflow: "visible" }}>
      <path d="M1.5 1.5 L1.5 17.5 L5.6 13.6 L8.4 20 L11 18.9 L8.3 12.6 L14 12.6 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
  )
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

  const screen = frame >= CONF_CUT ? "confirmation" : frame >= CART_CUT ? "cart" : "qo-desktop";
  const cam = camAt(frame);

  // Freeze the cursor in screen space across the order-placed cut. Resting on
  // Place order would otherwise reproject through the new camera and jump.
  const ptrFrame = Math.min(frame, CONF_CUT - 1);
  const [spx, spy] = pointerAt(ptrFrame);
  // Logo glide: centred card → real sidebar slot under shot A
  const logoW0 = 340;
  const [slotX, slotY] = toScreen(camAt(MORPH[1]), LOGO[0], LOGO[1]);
  const glide = prog(frame, MORPH[0], MORPH[1], MOVE_E);
  const intro = frame < MORPH[1];
  const outro = frame >= END_FADE[0];
  const uiOut = prog(frame, END_FADE[0], END_FADE[0] + 8, FADE_E);
  const logoOut = prog(frame, END_FADE[0] + 6, END_FADE[1], FADE_E);
  const lw = intro ? lerp(logoW0, LOGO[2], glide) : logoW0;
  const lx = intro ? lerp(OW / 2 - logoW0 / 2, slotX, glide) : OW / 2 - logoW0 / 2;
  const ly = intro ? lerp(OH / 2 - (logoW0 * LOGO_AR) / 2, slotY, glide) : OH / 2 - (logoW0 * LOGO_AR) / 2;
  const logoOpacity = intro ? 1 - prog(frame, MORPH[1] - 4, MORPH[1], FADE_E) : outro ? logoOut : 0;
  const uiOpacity = intro ? prog(frame, MORPH[0] + 6, MORPH[1], FADE_E) : 1 - uiOut;
  const uiOn = frame >= MORPH[0] && frame < END_FADE[1];
  const showPtr = frame >= MORPH[1] && frame < CONF_CUT + 4;
  const ptrFade = prog(frame, CONF_CUT - 1, CONF_CUT + 3, FADE_E);
  const ptrOpacity = prog(frame, MORPH[1], MORPH[1] + 4, FADE_E) * (1 - ptrFade);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const st = stageRef.current;
    if (!st) return;
    st.querySelectorAll(".film-hover, .film-active").forEach((e) => e.classList.remove("film-hover", "film-active"));
    if (frame >= CONF_CUT) return;
    const layer = st.querySelector(".film-layer");
    if (!layer) return;
    // Geometry + latch. Classes are set once per state, never from a moving hit-test.
    for (const h of hoverState(frame)) {
      const el = layer.querySelector(h.sel);
      if (!el) continue;
      el.classList.add("film-hover");
      if (h.active) el.classList.add("film-active");
    }
  });
  const camT = (c: Cam) => `translate(${OW / 2}px,${OH / 2}px) scale(${c.s}) translate(${-c.cx}px,${-c.cy}px)`;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div ref={stageRef} style={{ position: "absolute", left: 0, top: 0, width: OW, height: OH, overflow: "hidden", transformOrigin: "0 0", transform: `scale(${1920 / OW})` }}>
      <style>{CSS}</style>
      {uiOn && (
        <div style={{ position: "absolute", inset: 0, opacity: uiOpacity }}>
          <div style={{ position: "absolute", width: UI_W, height: UI_H, transformOrigin: "0 0", transform: camT(cam), boxShadow: "0 0 0 600px #fff" }}>
            <Layer key={screen} screen={screen} frame={frame} slide={0} />
          </div>
        </div>
      )}
      {logoOpacity > 0 && (
        <img className="film-logo" src={`${A}/joola-logo.svg`} style={{ position: "absolute", left: lx, top: ly, width: lw, height: lw * LOGO_AR, opacity: logoOpacity, pointerEvents: "none" }} />
      )}
      {showPtr && <div style={{ opacity: ptrOpacity, pointerEvents: "none" }}><Cursor x={spx} y={spy} scale={cursorScale(frame)} kind={cursorKind(ptrFrame)} /></div>}
      </div>
    </AbsoluteFill>
  );
};
