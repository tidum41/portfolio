/**
 * JOOLA B2B wholesale: buyer story film (p20), seamless loop.
 *
 * UI from scripts/capture-proto.py → joola/proto.generated.ts. Timing in joola/timeline.ts.
 * After Add to cart: centred pill, hard cut to the summary, hard cut to Order placed.
 */
import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PROTO_CSS, PROTO_SCREENS } from "./joola/proto.generated";
import { R } from "./joola/proto-rects.generated";
import {
  OW, OH, camAt, CLICK, DROPDOWN_OPEN, DURATION, ENTER, FADE_E, FPS, MORPH, POP_IN, TPL_ROWS,
  INSERT, PILL_BADGE, PILL_FILL, PILL_ROLL, PILL_W0, PILL_W1, prog, TYPE_SEARCH, UI_E, EASE_OUT, type Cam, CONF_CUT,
  UI_W, UI_H, CART_CUT, PILL_SHOT, lerp, MOVE_E, CHECK_DRAW, PLACE_COLOR, CONF_FADE, CONF_GROW, PROC_XFADE,
  LOGO_OUT, UI_IN, UI_OUT, LOGO_IN, ROLL_F, clamp01,
} from "./joola/timeline";
import { pointerAt, cursorScale, hoverState, cursorKind } from "./joola/pointer";

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
.film-roll{display:inline-flex;align-items:flex-end;font-variant-numeric:tabular-nums;white-space:nowrap;vertical-align:baseline}
.film-layer .line-total.film-roll{display:flex;justify-content:flex-end;width:100%}
.film-roll .slot{display:inline-block;position:relative;overflow:hidden;height:1em;line-height:1em}
.film-roll .col{display:block;will-change:transform}
.film-roll .glyph{display:block;height:1em;line-height:1em}
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

/** Old glyph leaves upward, new glyph enters from below. Unchanged glyphs stay.
 *  The column is two lines, so -50% of it is one line. -100% would empty the slot. */
function paintRoll(el: HTMLElement, from: string, to: string, frame: number, at: number) {
  const t = frame < at ? 0 : frame >= at + ROLL_F ? 1 : EASE_OUT(clamp01((frame - at) / ROLL_F));
  const shown = t >= 1 ? to : from;
  if (t <= 0 || t >= 1 || from === to) {
    el.textContent = shown;
    return;
  }
  const n = Math.max(from.length, to.length);
  const a = from.padStart(n, " ");
  const b = to.padStart(n, " ");
  el.replaceChildren();
  const blur = Math.sin(Math.PI * t) * 0.6;
  for (let i = 0; i < n; i++) {
    if (a[i] === " " && b[i] === " ") continue;
    const slot = document.createElement("span");
    slot.className = "slot";
    if (a[i] === b[i]) {
      slot.textContent = b[i];
      el.appendChild(slot);
      continue;
    }
    const col = document.createElement("span");
    col.className = "col";
    const oldG = document.createElement("span");
    oldG.className = "glyph";
    oldG.textContent = a[i] === " " ? "\u00a0" : a[i];
    const newG = document.createElement("span");
    newG.className = "glyph";
    newG.textContent = b[i] === " " ? "\u00a0" : b[i];
    col.append(oldG, newG);
    col.style.transform = `translateY(${(-t * 50).toFixed(2)}%)`;
    if (blur > 0.04) col.style.filter = `blur(${blur.toFixed(2)}px)`;
    slot.appendChild(col);
    el.appendChild(slot);
  }
}

function showRoll(el: HTMLElement, segments: { at: number; text: string }[], frame: number) {
  el.classList.add("film-roll");
  let i = 0;
  while (i + 1 < segments.length && frame >= segments[i + 1].at) i++;
  const to = segments[i].text;
  const from = i === 0 ? to : segments[i - 1].text;
  paintRoll(el, from, to, frame, i === 0 ? frame + 1 : segments[i].at);
}

function applyQuickOrder(root: HTMLElement, f: number) {
  const tpl = q(root, '[data-template="tpl-match"]');
  const pop = q(root, "[data-tpl-pop]");
  const POP_CLOSE = CLICK.tplAdd + 4;
  const popOpen = f >= CLICK.tpl && f < POP_CLOSE;
  if (tpl) tpl.classList.toggle("is-open", popOpen);
  if (pop && tpl) {
    pop.hidden = !popOpen;
    // Integer pixels, identical every frame. The row is 72px tall; reading a
    // fractional offsetHeight here is what shifted the menu by a device pixel.
    pop.style.position = "absolute";
    pop.style.left = `${tpl.offsetLeft + 12}px`;
    pop.style.width = `${Math.max(160, tpl.offsetWidth - 24)}px`;
    pop.style.right = "auto";
    // offsetTop/Width are integers once the row and the Reorder label are locked.
    // Rounding a live rect here is what flipped the menu by a pixel.
    pop.style.top = `${tpl.offsetTop + 72 + 4}px`;
    pop.style.margin = "0";
    // Solid on every frame it is open. A 100ms scale from the top anchor,
    // never a partial opacity that shows the card through the menu.
    const sc = popOpen ? lerp(0.98, 1, prog(f, POP_IN[0], POP_IN[1], UI_E)) : 1;
    pop.style.setProperty("opacity", "1", "important");
    pop.style.setProperty("transform-origin", "top center", "important");
    pop.style.setProperty("transform", `scale(${sc})`, "important");
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
  showRoll(unitRoll, [{ at: 0, text: one }, { at: CLICK.qty, text: twelve }], f);
  const lineEl = q(pr, ".line-total")!;
  showRoll(lineEl, [{ at: 0, text: one }, { at: CLICK.qty, text: money(r2(unitAt(QTY_FINAL) * QTY_FINAL)) }], f);

  const restock = q(root, '[data-template="tpl-perseus"] .meta-left');
  if (restock) restock.textContent = `12 units, ${money(r2(unitAt(QTY_FINAL) * QTY_FINAL))}`;

  const lines = (inserted ? 1 : 0) + (tplIn ? 3 : 0);
  const lineWord = `${lines} ${lines === 1 ? "line" : "lines"}`;
  q(root, "[data-line-count]")!.textContent = lineWord;
  const totalEl = q(root, "[data-order-footer] [data-order-total]")!;
  const perseusOnly = money(r2(unitAt(1) * 1));
  const perseusTwelve = money(r2(unitAt(QTY_FINAL) * QTY_FINAL));
  showRoll(totalEl, [
    { at: 0, text: money(0) },
    { at: INSERT[0], text: perseusOnly },
    { at: CLICK.qty, text: perseusTwelve },
    { at: TPL_ROWS[0], text: money(ORDER_TOTAL) },
  ], f);
  const add = q<HTMLButtonElement>(root, "[data-add-all]")!;
  add.style.whiteSpace = "nowrap";
  add.textContent = `Add ${lineWord} to cart`;
  pill(root, f);
  // The tight pill frame covers the retailer name once the pill is full, and
  // slices "Pickleball" while the pill is still $0. Hide the chip for that shot.
  if (f >= PILL_SHOT && f < CART_CUT) {
    qa(root, ".account-chip").forEach((el) => { el.style.visibility = "hidden"; });
  }
}

function pill(root: HTMLElement, f: number) {
  const pl = q(root, "[data-cart-pill]");
  if (!pl) return;
  const amt = q(pl, "[data-cart-total]")!;
  const chip = q(pl, "[data-cart-count]")!;
  const tw = f >= PILL_FILL[0] ? prog(f, PILL_FILL[0], PILL_FILL[1], EASE_OUT) : 0;
  const wpx = lerp(PILL_W0, PILL_W1, tw);
  amt.hidden = false;
  amt.style.visibility = "";
  amt.style.whiteSpace = "nowrap";
  showRoll(amt, [{ at: 0, text: money(0) }, { at: PILL_ROLL, text: money(ORDER_TOTAL) }], f);
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

  // The cursor eases off the button during "Placing order" and is gone once
  // the confirmation card is the subject.
  const ptrFrame = Math.min(frame, CONF_CUT - 1);
  const [spx, spy] = pointerAt(ptrFrame);
  // Logo and UI never share a frame. Each fades against the solid ground.
  const logoW0 = 340;
  const lw = logoW0;
  const lx = OW / 2 - logoW0 / 2;
  const ly = OH / 2 - (logoW0 * LOGO_AR) / 2;
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
        <img className="film-logo" src={`${A}/joola-logo.svg`} style={{ position: "absolute", left: lx, top: ly, width: lw, height: lw * LOGO_AR, opacity: logoOpacity, transform: `scale(${logoScale})`, transformOrigin: "center center", pointerEvents: "none" }} />
      )}
      {showPtr && <div style={{ opacity: ptrOpacity, pointerEvents: "none" }}><Cursor x={spx} y={spy} scale={cursorScale(frame)} kind={cursorKind(ptrFrame)} /></div>}
      </div>
    </AbsoluteFill>
  );
};
