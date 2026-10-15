/**
 * JOOLA B2B wholesale: buyer story film (p20), seamless loop.
 *
 * UI from scripts/capture-proto.py → joola/proto.generated.ts. Timing in joola/timeline.ts.
 * After Add to cart: centred pill, hard cut to the summary, hard cut to Order placed.
 */
import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PROTO_CSS, PROTO_SCREENS } from "./joola/proto.generated";
import {
  OW, OH, camAt, CLICK, DROPDOWN_OPEN, DROP_F, DURATION, ENTER, FADE_E, FPS, MORPH,
  ADD_GROW, FILL, FILL_END, FILL_F, FILL_STAGGER, FLOW_E,
  INSERT, PILL_BADGE, PILL_FILL, PILL_ROLL, PILL_W0, PILL_W1, prog, TYPE_SEARCH, UI_E, EASE_OUT, type Cam, CONF_CUT,
  UI_W, UI_H, CART_CUT, lerp, MOVE_E, CHECK_DRAW, PLACE_COLOR, CONF_FADE, CONF_GROW, PROC_XFADE,
  LOGO_OUT, UI_IN, UI_OUT, LOGO_IN, ROLL_F, ROLL_PILL_F, clamp01,
} from "./joola/timeline";
import { pointerAt, cursorScale, hoverState, cursorKind, type HoverKind } from "./joola/pointer";
import { clearDigitCache, measureBox, measureLine, measureText, paintCanvasRoll, paintLockedRoll } from "./joola/digit-roll";

export const JOOLA_FPS = FPS;
export const JOOLA_DURATION = DURATION;

const PERSEUS_TIER = [[1, 179.97], [6, 164.97], [12, 149.98], [24, 134.98]] as const;
const QTY_FINAL = 12;
const ORDER_TOTAL = 4908.66;
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
.film-layer [data-screen="qo-desktop"] .page h1{
  line-height:28px!important;height:28px!important;
}
.film-layer [data-screen="qo-desktop"] .rail-card > h3{
  height:15px!important;line-height:15px!important;margin:0 0 12px!important;
}
.film-layer .rail-item .rail-action{
  top:24px!important;right:4px!important;width:40px!important;height:24px!important;
  margin:0!important;padding:0!important;transform:none!important;line-height:24px!important;
  box-sizing:border-box!important;
}
.film-layer .rail-item .rail-id,
.film-layer .rail-item .name,
.film-layer .rail-item .meta{line-height:16px!important}
/* The Add label fades with the same 80ms hover ramp as the row. Open menus keep it hidden. */
.film-layer .rail-item .rail-action{opacity:var(--film-hov, 0)!important}
.film-layer .tpl-pop{position:absolute!important;margin:0!important;transition:none!important}
.film-layer .tpl-pop .tpl-choice{
  height:32px!important;box-sizing:border-box!important;font-weight:500!important;
  border-width:1px!important;transform:none!important;transition:none!important;opacity:1!important;
}
.film-layer .tpl-pop .btn-primary{border-color:transparent!important}
.film-layer .cart-pill .count-chip{transform-origin:center center!important}
.film-layer .cart-pill.film-hover{background:var(--band)!important}
.film-layer .cart-pill.film-active{background:var(--wash)!important}
/* Distance: totals, the confirmation title, and buttons are full ink.
   The search value stays at the prototype weight (500). */
.film-layer .sum-total .big,
.film-layer .confirm-panel h1,
.film-layer .confirm-rows .v,
.film-layer .cart-amount-display{font-weight:700!important;color:var(--ink)!important}
.film-layer .btn-primary{font-weight:700!important}
/* Cards size to their content. Height is set per frame (auto, or the grow). */
.film-layer .cart-summary,
.film-layer .confirm-panel{
  min-height:0!important;max-height:none!important;
  width:480px!important;max-width:480px!important;min-width:480px!important;
  padding:24px!important;border-radius:12px!important;border-width:1px!important;
  box-sizing:border-box!important;overflow:hidden!important;
}
.film-layer [data-place-order]{position:relative!important;overflow:hidden!important;width:430px!important;height:40px!important;min-width:430px!important;max-width:430px!important}
/* The roll lives in the prototype. Each column clips to its own ink box
   on a shared baseline, so text-box trim must not apply. */
.film-layer .j-roll,
.film-layer .j-roll .j-roll-slot,
.film-layer .j-roll .j-roll-glyph{
  text-box:none!important;
  font-variant-numeric:tabular-nums;
  font-feature-settings:"tnum" 1;
}
.film-layer .cart-pill .cart-amount-display.j-roll{
  text-box:none!important;
  line-height:normal!important;
  display:inline-flex!important;
  align-items:flex-start!important;
}
.film-layer .j-roll-slot{overflow:hidden!important}
/* Price rolls sit in the line box they replace, so "ea" and the row do not jump. */
.film-layer .film-amt{
  display:inline-block; position:relative; vertical-align:baseline;
  line-height:normal; white-space:nowrap;
  font-variant-numeric:tabular-nums; font-feature-settings:"tnum" 1;
}
.film-layer .film-sizer{visibility:hidden}
.film-layer .film-base{display:inline-block;width:0;height:0;vertical-align:baseline}
.film-layer .film-paint{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;text-box:none!important}
.film-layer .line-total,.film-layer [data-order-footer] [data-order-total]{text-align:right}
/* Flex + line-height 1 centers the em box. The prototype's cap trim is off so
   it cannot move the ink. The tabular 4 still paints 2.5 film px high at
   s=5.6. A 0.33px translate on the figure is the optical correction. */
.film-layer .cart-pill .count-chip{
  width:20px!important;height:20px!important;min-width:20px!important;max-width:20px!important;
  flex:0 0 20px!important;margin:0!important;padding:0!important;box-sizing:border-box!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  font-variant-numeric:tabular-nums!important;font-feature-settings:"tnum" 1!important;
  line-height:1!important;font-size:12px!important;font-weight:500!important;
  text-box:none!important;
  transform-origin:center center!important;
}
.film-layer .cart-pill .count-chip .count-fig{
  display:block;line-height:1;text-box:none;
  transform:translateY(0.33px);
}
.film-layer .cart-pill .cart-amount-display{flex-shrink:0!important}
.film-layer .film-face,.film-layer .order-face{
  position:absolute!important;inset:0!important;margin:0!important;z-index:1!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  gap:8px!important;white-space:nowrap!important;pointer-events:none!important;
}
.film-layer .film-spin,.film-layer .film-draw{display:block!important;flex:none!important}
/* The cart and confirmation shots are the card. A topbar rule in that frame is a sliced hairline. */
.film-layer [data-screen="cart"] .topbar,
.film-layer [data-screen="confirmation"] .topbar{border-bottom-color:transparent!important}
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

const BLUE = "#2c3ee0";
const EMERALD = "#12824a";
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
};

const BAND = "#f4f5f7";
const WASH = "#eceef2";
const INK = "#1a1a1a";
const MUTED = "#5c5c66";
const BLUE_HOV = "#2433c4";
const BLUE_HOT = "#1a2599";

/** Frame-accurate stand-in for an 80ms background/colour transition. */
function paintHover(el: HTMLElement, kind: HoverKind, amount: number, active: boolean) {
  const pct = (amount * 100).toFixed(1);
  const blend = (rest: string, hov: string) => `color-mix(in srgb, ${hov} ${pct}%, ${rest})`;
  if (kind === "rail") el.style.setProperty("--film-hov", el.classList.contains("is-open") ? "0" : amount.toFixed(3));
  if (kind === "chip") {
    const selected = el.classList.contains("on");
    const restBg = selected ? WASH : "transparent";
    const restFg = selected ? INK : MUTED;
    el.style.setProperty("background-color", active ? WASH : blend(restBg, BAND), "important");
    el.style.setProperty("color", active ? INK : blend(restFg, INK), "important");
    return;
  }
  const open = kind === "rail" && el.classList.contains("is-open");
  const rest = kind === "primary" ? BLUE : kind === "outline" || kind === "pill" ? "#fff" : open ? BAND : "transparent";
  const hov = kind === "primary" ? BLUE_HOV : BAND;
  const hot = kind === "primary" ? BLUE_HOT : WASH;
  el.style.setProperty("background-color", active ? hot : blend(rest, hov), "important");
}

/** 1–2px on the 1920 film. The close pill shot must not magnify a 1px UI blur. */
function blurCap(s: number) {
  return Math.min(1, 1.5 / (s * (1920 / OW)));
}

/** Prototype digit roll. t is eased here; the painter only places glyphs. */
function rollAt(
  segments: { at: number; text: string; dur?: number }[],
  frame: number,
  dur: number,
  ease: (t: number) => number = EASE_OUT,
) {
  let i = 0;
  while (i + 1 < segments.length && frame >= segments[i + 1].at) i++;
  const to = segments[i].text;
  const from = i === 0 ? to : segments[i - 1].text;
  const at = i === 0 ? frame + 1 : segments[i].at;
  const segDur = segments[i].dur ?? dur;
  const raw = frame < at ? 0 : frame >= at + segDur ? 1 : (frame - at) / segDur;
  const t = raw <= 0 || raw >= 1 ? raw : ease(clamp01(raw));
  return { from, to, t };
}

/**
 * The number paints into an absolute layer. A hidden sizer keeps the line box,
 * so the roll cannot change the height or the position of the neighbours.
 * The box is the widest string this element will show, from the first frame.
 */
function showStable(
  el: HTMLElement,
  segments: { at: number; text: string; dur?: number }[],
  frame: number,
  dur: number,
  maxBlur: number,
  align: "left" | "right" = "right",
  ease: (t: number) => number = EASE_OUT,
) {
  const { from, to, t } = rollAt(segments, frame, dur, ease);
  const block = el.classList.contains("line-total") || el.hasAttribute("data-order-total");
  let amt = block ? q(el, ":scope > .film-amt") : el;
  if (block && !amt) {
    el.classList.remove("j-roll");
    el.style.display = "";
    el.style.width = "";
    el.style.height = "";
    el.style.overflow = "";
    el.replaceChildren();
    amt = document.createElement("span");
    amt.className = "film-amt";
    el.appendChild(amt);
  }
  if (!amt) return;
  el.style.textAlign = align;
  amt.classList.add("film-amt");
  let sizer = q(amt, ":scope > .film-sizer");
  let paint = q(amt, ":scope > .film-paint");
  if (!sizer || !paint) {
    amt.replaceChildren();
    sizer = document.createElement("span");
    sizer.className = "film-sizer";
    const mark = document.createElement("span");
    mark.className = "film-base";
    sizer.appendChild(mark);
    paint = document.createElement("span");
    paint.className = "film-paint";
    amt.appendChild(sizer);
    amt.appendChild(paint);
  }
  // Right-aligned cells lock to the widest value up front, so the edge never moves.
  // The footer total is left-aligned and only as wide as the value on screen.
  const samples = align === "right" ? segments.map((s) => s.text) : [from, to];
  let wide = samples[0];
  let wideW = -1;
  for (const sample of samples) {
    const w = measureText(amt, sample);
    if (w > wideW) { wideW = w; wide = sample; }
  }
  const textNode = Array.from(sizer.childNodes).find((n) => n.nodeType === 3);
  if (!textNode) sizer.appendChild(document.createTextNode(wide));
  else if (textNode.textContent !== wide) textNode.textContent = wide;
  const mark = q(sizer, ":scope > .film-base");
  const line = mark ? measureBox(amt, mark) : measureLine(amt, wide);
  const used = paintLockedRoll(paint, from, to, t, {
    maxBlur,
    align,
    lock: { w: line.w, h: line.h, baseline: line.base },
  });
  amt.style.minWidth = `${used}px`;
}

function applyQuickOrder(root: HTMLElement, f: number) {
  const tpl = q(root, '[data-template="tpl-match"]');
  const pop = q(root, "[data-tpl-pop]");
  if (tpl) tpl.classList.remove("is-open");
  if (pop) pop.hidden = true;

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
  // Opens on the search ease. Closes with the row, so the click never leaves an empty frame.
  const closing = f < ENTER ? 0 : prog(f, ENTER, INSERT[1], FLOW_E);
  const dIn = f < ENTER ? prog(f, DROPDOWN_OPEN, DROPDOWN_OPEN + DROP_F, UI_E) : 1 - closing;
  const open = f >= DROPDOWN_OPEN && dIn > 0.001;
  res.hidden = !open;
  res.classList.toggle("is-closed", !open);
  res.style.opacity = `${dIn}`;
  res.style.transform = `translateY(${(1 - dIn) * 6}px)`;

  const rows = qa(root, "[data-order-row]");
  const pr = rows[0];
  const inserted = f >= INSERT[0];
  pr.style.display = inserted ? "" : "none";
  const ip = prog(f, INSERT[0], INSERT[1], FLOW_E);
  pr.style.opacity = `${ip}`;
  pr.style.transform = `translateY(${(1 - ip) * 6}px)`;
  pr.hidden = false;
  // p19: no blue just-added / press fill — cursor press is the only feedback
  pr.classList.remove("is-just-added");
  pr.style.background = "";

  // One staggered landing. Same ease, two frames apart, cursor still.
  rows.slice(1).forEach((r, i) => {
    const a = FILL + i * FILL_STAGGER;
    const tp = prog(f, a, a + FILL_F, FLOW_E);
    const on = f >= a;
    r.hidden = false;
    r.style.display = on ? "" : "none";
    r.style.opacity = on ? `${tp}` : "0";
    r.style.transform = on ? `translateY(${(1 - tp) * 10}px)` : "";
  });

  const qty = f < CLICK.qty ? 1 : QTY_FINAL;
  q(pr, "[data-qty-stepper]")!.style.boxShadow = "";
  const qtyEl = q(pr, ".qty")!;
  qtyEl.textContent = `${qty}`;
  qa(root, ".qty-presets button.on, .qty-group .qty-presets button.on").forEach((b) => b.classList.remove("on"));
  const chip = q(pr, `[data-set-perseus="${QTY_FINAL}"]`);
  if (chip && f >= CLICK.qty) chip.classList.add("on");
  const unitEl = q(pr, ".unit")!;
  let unitRoll = q(unitEl, ":scope > .film-roll");
  const ea = q(unitEl, ".ea");
  if (!ea) unitEl.insertAdjacentHTML("beforeend", `<span class="ea">ea</span>`);
  if (!unitRoll) {
    unitRoll = document.createElement("span");
    unitRoll.className = "film-roll";
    unitEl.insertBefore(unitRoll, unitEl.firstChild);
  }
  Array.from(unitEl.childNodes).forEach((n) => {
    if (n !== unitRoll && n !== q(unitEl, ".ea") && n.nodeType === 3) n.parentNode?.removeChild(n);
  });
  const one = money(unitAt(1));
  const twelve = money(unitAt(QTY_FINAL));
  const blur = blurCap(camAt(f).s);
  showStable(unitRoll, [{ at: 0, text: one }, { at: CLICK.qty, text: twelve, dur: ROLL_F }], f, ROLL_F, blur, "right", FLOW_E);
  const lineEl = q(pr, ".line-total")!;
  showStable(lineEl, [{ at: 0, text: one }, { at: CLICK.qty, text: money(r2(unitAt(QTY_FINAL) * QTY_FINAL)), dur: ROLL_F }], f, ROLL_F, blur, "right", FLOW_E);

  const restock = q(root, '[data-template="tpl-perseus"] .meta-left');
  if (restock) restock.textContent = `12 units, ${money(r2(unitAt(QTY_FINAL) * QTY_FINAL))}`;

  const lines = (inserted ? 1 : 0) + (f >= ADD_GROW[1] ? 3 : 0);
  const lineWord = lines === 0 ? "" : `${lines} ${lines === 1 ? "line" : "lines"}`;
  q(root, "[data-line-count]")!.textContent = lines === 0 ? "0 lines" : lineWord;
  const totalEl = q(root, "[data-order-footer] [data-order-total]")!;
  const perseusOnly = money(r2(unitAt(1) * 1));
  const perseusTwelve = money(r2(unitAt(QTY_FINAL) * QTY_FINAL));
  showStable(totalEl, [
    { at: 0, text: money(0) },
    { at: INSERT[0], text: perseusOnly, dur: INSERT[1] - INSERT[0] },
    { at: CLICK.qty, text: perseusTwelve, dur: ROLL_F },
    { at: FILL, text: money(ORDER_TOTAL), dur: FILL_END - FILL },
  ], f, ROLL_F, blur, "left", FLOW_E);
  const add = q<HTMLButtonElement>(root, "[data-add-all]")!;
  add.style.whiteSpace = "nowrap";
  add.textContent = lines === 0 ? "Add to cart" : `Add ${lineWord} to cart`;
  // The wider label eases in with the lines, and is finished before the read.
  if (f >= FILL) {
    const w = lerp(143.3, 155, prog(f, ADD_GROW[0], ADD_GROW[1], FLOW_E));
    add.style.boxSizing = "border-box";
    add.style.width = `${w}px`;
    add.style.minWidth = `${w}px`;
  }
  pill(root, f);
}

function pill(root: HTMLElement, f: number) {
  const pl = q(root, "[data-cart-pill]");
  if (!pl) return;
  const amt = q(pl, "[data-cart-total]")!;
  const chip = q(pl, "[data-cart-count]")!;
  // Width opens on the release frame. The digits and the circle share one
  // longer ease from that same frame, so the roll starts with no wait.
  const tw = f >= PILL_FILL[0] ? prog(f, PILL_FILL[0], PILL_FILL[1], FLOW_E) : 0;
  const motion = f >= PILL_ROLL ? prog(f, PILL_ROLL, PILL_ROLL + ROLL_PILL_F, FLOW_E) : 0;
  const wpx = Math.round(lerp(PILL_W0, PILL_W1, tw));
  amt.hidden = false;
  amt.style.visibility = "";
  amt.style.whiteSpace = "nowrap";
  const from = money(0);
  const to = money(ORDER_TOTAL);
  const line = measureLine(amt, to);
  const zeroLine = measureLine(amt, from);
  // Whole pixels. Height and baseline stay the line box for the whole shot,
  // so the digits do not step when the roll starts or ends.
  // Two extra pixels so a rounded column cannot shave the $ against overflow.
  const fullW = Math.ceil(line.w) + 2;
  const zeroW = Math.ceil(zeroLine.w) + 2;
  const amtW = Math.round(lerp(zeroW, fullW, tw));
  const fontPx = parseFloat(getComputedStyle(amt).fontSize) || 13;
  const h = Math.max(Math.round(line.h), Math.ceil(fontPx * 1.45));
  amt.style.position = "relative";
  amt.style.setProperty("display", "block", "important");
  amt.style.setProperty("width", `${amtW}px`, "important");
  amt.style.setProperty("min-width", `${amtW}px`, "important");
  amt.style.setProperty("height", `${h}px`, "important");
  amt.style.setProperty("min-height", `${h}px`, "important");
  amt.style.setProperty("overflow", "hidden", "important");
  amt.style.setProperty("transform", "none", "important");
  amt.style.setProperty("flex-shrink", "0", "important");
  amt.style.setProperty("text-box", "none", "important");
  amt.style.setProperty("line-height", `${h}px`, "important");
  // The canvas is the full amount. Shifted so its right edge stays put, the
  // growing box reveals the left digits instead of clipping the $.
  paintCanvasRoll(amt, from, f >= PILL_ROLL ? to : from, motion, {
    w: fullW,
    h,
    scale: Math.ceil(camAt(f).s * (1920 / OW)),
    baseline: line.base,
    lineH: line.h,
  });
  const canvas = amt.querySelector("canvas");
  if (canvas instanceof HTMLCanvasElement) canvas.style.marginLeft = `${amtW - fullW}px`;
  pl.style.setProperty("--film-pill-w", `${wpx}px`);
  pl.style.minWidth = "0";
  pl.style.overflow = "hidden";
  pl.style.justifyContent = "flex-start";
  const showBadge = f >= PILL_BADGE[0];
  chip.hidden = !showBadge;
  let fig = chip.querySelector(".count-fig");
  if (!fig) {
    chip.textContent = "";
    fig = document.createElement("span");
    fig.className = "count-fig";
    chip.appendChild(fig);
  }
  fig.textContent = "4";
  // The slot grows with the same ease, so the circle does not pop a 20px gap.
  const slotW = tw >= 1 ? 20 : lerp(0, 20, tw);
  chip.style.setProperty("width", `${slotW}px`, "important");
  chip.style.setProperty("height", "20px", "important");
  chip.style.setProperty("min-width", "0", "important");
  chip.style.setProperty("max-width", "20px", "important");
  chip.style.setProperty("flex", `0 0 ${slotW}px`, "important");
  chip.style.setProperty("margin", "0", "important");
  chip.style.setProperty("margin-left", `${lerp(-8, 0, tw)}px`, "important");
  chip.style.setProperty("padding", "0", "important");
  chip.style.setProperty("display", "flex", "important");
  chip.style.setProperty("align-items", "center", "important");
  chip.style.setProperty("justify-content", "center", "important");
  chip.style.setProperty("line-height", "1", "important");
  chip.style.setProperty("text-box", "none", "important");
  chip.style.setProperty("overflow", "hidden", "important");
  chip.style.setProperty("transform-origin", "center center", "important");
  if (showBadge) {
    const sc = motion >= 1 ? 1 : lerp(0.6, 1, motion);
    chip.style.visibility = "";
    chip.style.opacity = `${motion}`;
    // Settled frame has no transform, so the circle cannot sit a subpixel off its slot.
    chip.style.transform = sc === 1 ? "none" : `scale(${sc.toFixed(3)})`;
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
  const totalText = money(ORDER_TOTAL);
  const leftText = `${money(left)} left of $${Math.round(CREDIT_LIMIT).toLocaleString("en-US")}`;
  qa(root, "[data-cart-summary] [data-order-total]").forEach((el) => { el.textContent = totalText; });
  const avail = q(root, "[data-cart-summary] [data-credit-available]");
  if (avail) avail.textContent = leftText;
  const tip = q(root, "[data-cart-summary] [data-credit-tip]");
  if (tip) {
    const rows = qa(tip, "div");
    if (rows[0]) rows[0].innerHTML = `<strong>Used</strong> ${money(CREDIT_PRIOR_USED)}`;
    if (rows[1]) rows[1].innerHTML = `<strong>This order</strong> ${totalText}`;
    if (rows[2]) rows[2].innerHTML = `<strong>Left</strong> ${money(left)}`;
  }
  const barLabel = q(root, "[data-cart-summary] [data-credit-bar]");
  if (barLabel) barLabel.setAttribute("aria-label", `Net 30 credit: ${leftText}`);
  const bar = barLabel;
  if (bar) {
    const used = (CREDIT_PRIOR_USED / CREDIT_LIMIT) * 100;
    bar.style.setProperty("--credit-used-end", `${used}%`);
    bar.style.setProperty("--credit-order-end", `${used + (ORDER_TOTAL / CREDIT_LIMIT) * 100}%`);
  }
  pill(root, f);
  // The centred 66% frame bisects the line-price column and clips the header
  // pills. Hide both so the margin is the page and the header rule is the context.
  const main = q(root, ".cart-main");
  if (main) main.style.opacity = "0";
  qa(root, ".account-chip, .cart-pill").forEach((el) => { el.style.visibility = "hidden"; });
  const sum = q(root, "[data-cart-summary]");
  if (sum) {
    sum.classList.remove("is-morph-exit");
    sum.style.opacity = "1";
    sum.style.transition = "none";
    sum.style.setProperty("height", "auto", "important");
    const fade = f < CONF_FADE[0] ? 1 : 1 - prog(f, CONF_FADE[0], CONF_FADE[1], MOVE_E);
    qa(sum, ":scope > .sum-row, :scope > .sum-total, :scope > .credit-meter, :scope > [data-place-order]").forEach((el) => {
      el.style.opacity = `${fade}`;
    });
  }
  placeButton(root, f);
}

/** Summary border-box. Replaced after the height:auto still; the grow starts here. */
const SUMMARY_BOX_H = 298;

const SPIN_SVG = `<svg class="film-spin" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path d="M9 1.6a7.4 7.4 0 1 1-7.4 7.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;
const CHECK_SVG = `<svg class="film-draw" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path data-draw d="M3.2 8.3 L6.5 11.5 L12.8 4.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function placeButton(root: HTMLElement, f: number) {
  const btn = q<HTMLButtonElement>(root, "[data-place-order]");
  if (!btn) return;
  if (btn.dataset.filmFaces !== "1") {
    btn.dataset.filmFaces = "1";
    btn.textContent = "";
    btn.insertAdjacentHTML(
      "beforeend",
      `<span class="film-face" data-face="idle">Place order</span><span class="film-face" data-face="proc">${SPIN_SVG}<span>Placing order</span></span><span class="film-face" data-face="done">${CHECK_SVG}</span>`,
    );
  }
  // The label swaps in one frame. A crossfade of two words reads as a double exposure.
  const placing = f >= PROC_XFADE[0];
  const success = f >= CHECK_DRAW[0];
  const face = (name: string) => q(btn, `[data-face="${name}"]`);
  const idleEl = face("idle"), procEl = face("proc"), doneEl = face("done");
  if (idleEl) idleEl.style.visibility = placing ? "hidden" : "visible";
  if (procEl) procEl.style.visibility = placing && !success ? "visible" : "hidden";
  if (doneEl) doneEl.style.visibility = success ? "visible" : "hidden";
  const spin = q<SVGElement>(btn, ".film-spin");
  if (spin) spin.style.transform = `rotate(${(f - PROC_XFADE[0]) * 24}deg)`;
  const path = q<SVGPathElement>(btn, "[data-draw]");
  if (path && success) {
    const len = path.getTotalLength();
    const t = prog(f, CHECK_DRAW[0], CHECK_DRAW[1], EASE_OUT);
    path.style.strokeDasharray = `${len}`;
    // t is 0 on the first frame, which hides the whole stroke and leaves a blank green button.
    const drawn = Math.max(t, 0.12);
    path.style.strokeDashoffset = `${len * (1 - drawn)}`;
  }
  const ct = f < PLACE_COLOR[0] ? 0 : prog(f, PLACE_COLOR[0], PLACE_COLOR[1], EASE_OUT);
  if (ct > 0) btn.style.setProperty("background-color", mix(BLUE, EMERALD, ct), "important");
  else btn.style.removeProperty("background-color");
}

function applyConfirmation(root: HTMLElement, f: number) {
  const amt = q(root, "[data-cart-pill] [data-cart-total]");
  const chip = q(root, "[data-cart-pill] [data-cart-count]");
  if (amt) { amt.hidden = false; amt.textContent = money(0); }
  if (chip) chip.hidden = true;
  const pl = q(root, "[data-cart-pill]");
  if (pl) pl.style.width = `${PILL_W0}px`;

  // Same header treatment as the summary so the cut does not reveal a clipped chip.
  qa(root, ".account-chip, .cart-pill").forEach((el) => { el.style.visibility = "hidden"; });
  qa(root, "[data-confirm-panel] [data-order-total]").forEach((el) => { el.textContent = money(ORDER_TOTAL); });
  const panel = q(root, "[data-confirm-panel]");
  if (!panel) return;
  panel.style.transform = "none";
  panel.style.setProperty("height", "auto", "important");
  const nat = panel.offsetHeight;
  const grown = prog(f, CONF_GROW[0], CONF_GROW[1], MOVE_E);
  panel.style.setProperty("height", `${lerp(SUMMARY_BOX_H, nat, grown)}px`, "important");
  const bits = [
    q(panel, ".confirm-title-row"),
    q(panel, ".confirm-lede"),
    ...qa(panel, ".confirm-rows .row"),
    q(panel, ".confirm-actions"),
  ].filter((el): el is HTMLElement => !!el);
  bits.forEach((el, i) => {
    const a = CONF_CUT - 2 + i * 2;
    const u = prog(f, a, a + 5, UI_E);
    el.style.opacity = `${u}`;
    el.style.transform = `translateY(${(1 - u) * 4}px)`;
  });
}

const APPLY: Record<string, (r: HTMLElement, f: number) => void> = {
  "qo-desktop": applyQuickOrder,
  cart: applyCart,
  confirmation: applyConfirmation,
};

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

/** Stage px → whole film px. The stage is scaled by 1920/1440, so a 0.75 step is 1px. */
const snapFilm = (n: number) => Math.round(n * (1920 / OW)) / (1920 / OW);

/**
 * Drawn at the final size, not CSS-scaled from a 19px bitmap, so the arrow
 * stays sharp at card width. The hotspot is the tip, snapped to a film pixel.
 */
const Cursor: React.FC<{ x: number; y: number; scale: number; kind: "arrow" | "ibeam" }> = ({ x, y, scale, kind }) => {
  if (kind === "ibeam") {
    const w = 15 * scale;
    const h = 23 * scale;
    return (
      <svg width={w} height={h} viewBox="0 0 15 23" style={{ position: "absolute", pointerEvents: "none", left: snapFilm(x - w / 2), top: snapFilm(y - h / 2), overflow: "visible" }}>
        <path d="M3 2.5 H12 M7.5 2.5 V20.5 M3 20.5 H12" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" />
        <path d="M3 2.5 H12 M7.5 2.5 V20.5 M3 20.5 H12" fill="none" stroke="#111" strokeWidth={1.35} strokeLinecap="butt" />
      </svg>
    );
  }
  const w = 19 * scale;
  const h = 25 * scale;
  const hx = (1.7 / 17) * w;
  const hy = (1.7 / 22) * h;
  return (
    <svg width={w} height={h} viewBox="0 0 17 22" shapeRendering="geometricPrecision" style={{ position: "absolute", pointerEvents: "none", left: snapFilm(x - hx), top: snapFilm(y - hy), overflow: "visible", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))" }}>
      <path d="M1.5 1.5 L1.5 17.5 L5.6 13.6 L8.4 20 L11 18.9 L8.3 12.6 L14 12.6 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
  );
};

export const JoolaB2B: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("r11 fonts + images"));
  const [fontsReady, setFontsReady] = useState(false);
  const cacheCleared = useRef(false);
  // The first layout paints before the face is ready and would be the frame
  // Remotion captures. Clear the metric cache and paint again, then release.
  if (fontsReady && !cacheCleared.current) {
    clearDigitCache();
    cacheCleared.current = true;
  }
  useLayoutEffect(() => {
    let cancel = false;
    const imgs = Array.from(document.querySelectorAll(".film-layer img, .film-logo")) as HTMLImageElement[];
    Promise.all([
      ...["400", "500", "700"].map((w) => document.fonts.load(`${w} 16px FKGroteskNeue`)),
      ...imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = r; i.onerror = r; }))),
    ]).then(() => { if (!cancel) setFontsReady(true); });
    return () => { cancel = true; };
  }, []);
  useLayoutEffect(() => {
    if (fontsReady) continueRender(handle);
  }, [fontsReady, handle]);

  const screen = frame >= CONF_CUT ? "confirmation" : frame >= CART_CUT ? "cart" : "qo-desktop";
  const cam = camAt(frame);

  // The cursor eases off the button during "Placing order" and is gone once
  // the confirmation card is the subject.
  const ptrFrame = Math.min(frame, CONF_CUT - 1);
  const [spx, spy] = pointerAt(ptrFrame);
  // Logo and UI never share a frame. Each fades against the solid ground.
  // Settled mark is 32% of the 1920 frame (inside the 30–35% band). The SVG
  // viewBox is the artwork, so this width is the ink, not a padded box.
  const logoW0 = Math.round(1920 * 0.32);
  const logoH0 = logoW0 * (157.76 / 500);
  const lw = logoW0;
  const lx = (1920 - logoW0) / 2;
  const ly = (1440 - logoH0) / 2;
  let logoOpacity = 0;
  let logoScale = 1;
  if (frame <= LOGO_OUT[1]) {
    const t = prog(frame, LOGO_OUT[0], LOGO_OUT[1], MOVE_E);
    logoOpacity = 1 - t;
    logoScale = lerp(1, 0.96, t);
  } else if (frame >= LOGO_IN[0]) {
    const t = prog(frame, LOGO_IN[0], LOGO_IN[1], MOVE_E);
    logoOpacity = t;
    logoScale = lerp(0.96, 1, t);
  }
  const uiOpacity = frame < UI_IN[0] || frame >= UI_OUT[1]
    ? 0
    : frame < UI_IN[1]
      ? prog(frame, UI_IN[0], UI_IN[1], MOVE_E)
      : frame < UI_OUT[0]
        ? 1
        : 1 - prog(frame, UI_OUT[0], UI_OUT[1], MOVE_E);
  const uiOn = uiOpacity > 0;
  // The Place order hotspot is higher in its card than the confirmation actions,
  // so a cursor frozen across the cut sits in the blank middle of Order placed.
  // The press is still on screen through frame 269; the cut removes the pointer.
  const showPtr = frame >= MORPH[1] && frame < CONF_CUT;
  const ptrFade = prog(frame, CONF_FADE[0], CONF_FADE[1], FADE_E);
  const ptrOpacity = 1 - ptrFade;
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const st = stageRef.current;
    if (!st) return;
    st.querySelectorAll(".film-hover, .film-active").forEach((e) => e.classList.remove("film-hover", "film-active"));
    if (frame >= CONF_CUT) return;
    const layer = st.querySelector(".film-layer");
    if (!layer) return;
    // Colour is sampled from the 80ms ramp. A CSS transition would follow wall
    // clock time between seeks, not the frame.
    qa(layer, "[data-search-result], [data-set-perseus], [data-action='dec'], [data-order-row], [data-rail-add], [data-tpl-apply], [data-add-all], [data-cart-pill], [data-place-order]").forEach((el) => {
      el.style.removeProperty("background-color");
      el.style.removeProperty("color");
      el.style.removeProperty("--film-hov");
    });
    for (const h of hoverState(frame)) {
      const el = q(layer, h.sel);
      if (!el) continue;
      paintHover(el, h.kind, h.mix, h.active);
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
      {showPtr && <div style={{ opacity: ptrOpacity, pointerEvents: "none" }}><Cursor x={spx} y={spy} scale={cursorScale(frame)} kind={cursorKind(ptrFrame)} /></div>}
      </div>
      {logoOpacity > 0 && (
        <img className="film-logo" src={`${A}/joola-logo.svg`} style={{ position: "absolute", left: lx, top: ly, width: lw, height: logoH0, opacity: logoOpacity, transform: `scale(${logoScale})`, transformOrigin: "center center", pointerEvents: "none" }} />
      )}
    </AbsoluteFill>
  );
};
