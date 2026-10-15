/**
 * Same painter as assets/joola-b2b/digit-roll.js (the prototype's cart roll).
 * The film calls this per frame. The prototype plays it over 450ms on Add to cart.
 *
 * Each column is only as tall as the ink of the two glyphs it swaps, and every
 * column shares one baseline. A digit therefore rolls through its own body
 * instead of a 1.28em line box, which is what sliced the comma and left a
 * ghost of the old total floating above the new one.
 */
type Metrics = { w: number; asc: number; desc: number; base: number };
type Hit = { probe: HTMLSpanElement; mark: HTMLSpanElement; widths: Map<string, Metrics>; canvas: CanvasRenderingContext2D };

const cache = new Map<string, Hit>();

function fontKey(cs: CSSStyleDeclaration) {
  return [cs.fontFamily, cs.fontSize, cs.fontWeight, cs.letterSpacing, cs.fontStyle].join("|");
}

function probeFor(el: HTMLElement): Hit {
  const cs = getComputedStyle(el);
  const key = fontKey(cs);
  const hit = cache.get(key);
  if (hit) return hit;
  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = [
    "position:absolute", "left:0", "top:0", "visibility:hidden", "pointer-events:none",
    "white-space:pre", "padding:0", "margin:0", "border:0", "display:inline-block",
    `font-family:${cs.fontFamily}`,
    `font-size:${cs.fontSize}`,
    `font-weight:${cs.fontWeight}`,
    `font-style:${cs.fontStyle}`,
    `letter-spacing:${cs.letterSpacing}`,
    "font-variant-numeric:tabular-nums",
    'font-feature-settings:"tnum" 1',
    "line-height:normal",
    "text-box:none",
  ].join(";");
  const mark = document.createElement("span");
  mark.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  probe.appendChild(mark);
  (el.ownerDocument.body || el.ownerDocument.documentElement).appendChild(probe);
  const canvas = el.ownerDocument.createElement("canvas").getContext("2d")!;
  const family = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
  canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} "${family}"`;
  const next = { probe, mark, widths: new Map<string, Metrics>(), canvas };
  cache.set(key, next);
  return next;
}

/** Layout pixels. getBoundingClientRect includes ancestor transforms. */
function layoutBox(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  let sx = 1;
  let sy = 1;
  let el: Element | null = node;
  while (el) {
    const t = getComputedStyle(el).transform;
    if (t && t !== "none") {
      const m = new DOMMatrix(t);
      sx *= m.a || 1;
      sy *= m.d || 1;
    }
    el = el.parentElement;
  }
  return { w: rect.width / sx, h: rect.height / sy, top: rect.top };
}

function metrics(el: HTMLElement, text: string): Metrics {
  const ready = !document.fonts || document.fonts.status === "loaded";
  if (!ready) cache.clear();
  const hit = probeFor(el);
  if (text.length === 1 && ready) {
    const known = hit.widths.get(text);
    if (known) return known;
  }
  if (text.length !== 1) {
    hit.probe.insertBefore(hit.probe.ownerDocument.createTextNode(text), hit.mark);
    // width of a whole string; ink is unused
    const box = layoutBox(hit.probe);
    // remove the text node we just inserted (leave the baseline mark)
    const n = hit.probe.firstChild;
    if (n && n.nodeType === 3) n.parentNode?.removeChild(n);
    return { w: box.w, asc: 0, desc: 0, base: 0 };
  }
  const ch = text === " " ? " " : text;
  hit.probe.insertBefore(hit.probe.ownerDocument.createTextNode(ch), hit.mark);
  const box = layoutBox(hit.probe);
  const base = hit.mark.getBoundingClientRect().top - box.top;
  const ink = hit.canvas.measureText(ch);
  const n = hit.probe.firstChild;
  if (n && n.nodeType === 3) n.parentNode?.removeChild(n);
  const m: Metrics = {
    w: ch === " " ? 0 : box.w,
    asc: ink.actualBoundingBoxAscent || 0,
    desc: ink.actualBoundingBoxDescent || 0,
    base,
  };
  if (ready && m.w >= 0) hit.widths.set(text, m);
  return m;
}

function clearRoll(el: HTMLElement) {
  el.classList.remove("j-roll");
  el.style.width = "";
  el.style.height = "";
  el.style.lineHeight = "";
  el.style.display = "";
  el.style.overflow = "";
  el.style.textAlign = "";
  el.style.margin = "";
  el.style.removeProperty("text-box");
}

/** Layout box of an on-stage element, baseline from a zero-width mark. */
export function measureBox(el: HTMLElement, mark: HTMLElement): { w: number; h: number; base: number } {
  const box = layoutBox(el);
  let sy = 1;
  let node: Element | null = el;
  while (node) {
    const t = getComputedStyle(node).transform;
    if (t && t !== "none") sy *= new DOMMatrix(t).d || 1;
    node = node.parentElement;
  }
  const base = (mark.getBoundingClientRect().top - el.getBoundingClientRect().top) / (sy || 1);
  return { w: box.w, h: box.h, base };
}

export function measureText(el: HTMLElement, text: string) {
  return metrics(el, text).w;
}

/** Line box of `text` in `el`'s font, in layout pixels. The probe is unscaled. */
export function measureLine(el: HTMLElement, text: string): { w: number; h: number; base: number } {
  const ready = !document.fonts || document.fonts.status === "loaded";
  if (!ready) cache.clear();
  const hit = probeFor(el);
  hit.probe.insertBefore(hit.probe.ownerDocument.createTextNode(text), hit.mark);
  const box = layoutBox(hit.probe);
  const base = hit.mark.getBoundingClientRect().top - box.top;
  const n = hit.probe.firstChild;
  if (n && n.nodeType === 3) n.parentNode?.removeChild(n);
  return { w: box.w, h: box.h, base };
}

export type LockBox = { w: number; h: number; baseline: number };

/** Drop measured glyph widths. The first paint of a page can run before the face is ready. */
export function clearDigitCache() {
  cache.clear();
}

/**
 * Per-digit roll inside a box that does not change size between the settled
 * frames and the moving ones. Every column is the same line box, so a comma
 * and a dollar sign roll through the window instead of a slot as short as
 * their own ink. Digit columns share one advance (tabular).
 * `pixel` rounds every edge and the travel to whole layout pixels.
 */
export function paintLockedRoll(
  el: HTMLElement,
  from: string,
  to: string,
  t: number,
  opts: { maxBlur?: number; align?: "left" | "right"; lock: LockBox; pixel?: boolean },
): number {
  const maxBlur = opts.maxBlur != null ? opts.maxBlur : 1;
  const align = opts.align || "left";
  const pixel = !!opts.pixel;
  const snap = (n: number) => (pixel ? Math.round(n) : Math.round(n * 64) / 64);
  const px = (n: number) => `${snap(n)}px`;
  const tt = from === to || t <= 0 ? 0 : t >= 1 ? 1 : t;
  let digitW = 0;
  for (const d of "0123456789") digitW = Math.max(digitW, metrics(el, d).w);
  const widthOf = (ch: string) => {
    if (ch === " ") return 0;
    if (ch >= "0" && ch <= "9") return digitW;
    return metrics(el, ch).w;
  };
  // One line box for every column, measured from the DOM face (not canvas ink).
  const line = measureLine(el, "8");
  const slotH = Math.max(pixel ? 1 : 0.01, pixel ? Math.ceil(line.h) : snap(line.h));
  const n = Math.max(from.length, to.length);
  const a = align === "right" ? from.padStart(n, " ") : from.padEnd(n, " ");
  const b = align === "right" ? to.padStart(n, " ") : to.padEnd(n, " ");
  type Col = { a: string; b: string; w: number };
  const cols: Col[] = [];
  for (let i = 0; i < n; i++) {
    const w = Math.max(widthOf(a[i]), widthOf(b[i]));
    cols.push({ a: a[i], b: b[i], w: snap(w) });
  }
  const rawSum = cols.reduce((s, c) => s + c.w, 0);
  const baseline = snap(opts.lock.baseline);
  const marginTop = snap(baseline - line.base);
  el.classList.add("j-roll");
  el.style.setProperty("text-box", "none", "important");
  el.style.setProperty("display", "flex", "important");
  el.style.setProperty("justify-content", align === "right" ? "flex-end" : "flex-start", "important");
  el.style.setProperty("align-items", "flex-start", "important");
  el.style.setProperty("overflow", "hidden", "important");
  el.style.setProperty("width", "100%", "important");
  el.style.setProperty("height", "100%", "important");
  el.style.whiteSpace = "nowrap";
  el.style.fontVariantNumeric = "tabular-nums";
  el.style.fontFeatureSettings = '"tnum" 1';
  el.style.lineHeight = "normal";
  el.replaceChildren();
  const blur = Math.sin(Math.PI * tt) * maxBlur;
  const place = (ch: string, into: HTMLElement) => {
    if (ch === " ") return;
    const tx = document.createElement("span");
    tx.className = "j-roll-glyph";
    tx.textContent = ch;
    tx.style.display = "block";
    tx.style.height = px(slotH);
    tx.style.textAlign = "center";
    tx.style.lineHeight = "normal";
    tx.style.whiteSpace = "pre";
    tx.style.fontVariantNumeric = "tabular-nums";
    tx.style.fontFeatureSettings = '"tnum" 1';
    tx.style.setProperty("text-box", "none", "important");
    tx.style.setProperty("overflow", "hidden", "important");
    into.appendChild(tx);
  };
  for (const c of cols) {
    if (c.w <= 0) continue;
    const slot = document.createElement("span");
    slot.className = "j-roll-slot";
    slot.style.position = "relative";
    slot.style.display = "block";
    slot.style.flex = "0 0 auto";
    slot.style.setProperty("overflow", "clip", "important");
    slot.style.setProperty("clip-path", "inset(0)", "important");
    slot.style.setProperty("width", px(c.w), "important");
    slot.style.setProperty("height", px(slotH), "important");
    slot.style.setProperty("max-height", px(slotH), "important");
    slot.style.marginTop = px(marginTop);
    if (c.a === c.b || tt === 0 || tt === 1) {
      place(tt >= 1 ? c.b : c.a, slot);
    } else {
      const col = document.createElement("span");
      col.className = "j-roll-col";
      col.style.position = "absolute";
      col.style.left = "0";
      col.style.top = "0";
      col.style.width = "100%";
      const dy = snap(-tt * slotH);
      col.style.transform = `translateY(${dy}px)`;
      if (blur >= 0.35) col.style.filter = `blur(${blur.toFixed(2)}px)`;
      [c.a, c.b].forEach((ch) => {
        const cell = document.createElement("span");
        cell.style.display = "block";
        cell.style.position = "relative";
        cell.style.height = px(slotH);
        cell.style.setProperty("overflow", "hidden", "important");
        place(ch, cell);
        col.appendChild(cell);
      });
      slot.appendChild(col);
    }
    el.appendChild(slot);
  }
  return snap(rawSum);
}

export function paintDigitRoll(
  el: HTMLElement,
  from: string,
  to: string,
  t: number,
  opts?: { maxBlur?: number; align?: "left" | "right" },
) {
  const maxBlur = opts && opts.maxBlur != null ? opts.maxBlur : 1;
  const align = opts?.align || "left";
  const natural = metrics(el, to).w;
  if (t <= 0 || t >= 1 || from === to) {
    clearRoll(el);
    el.textContent = t >= 1 || from === to ? to : from;
    if (align === "right" && from !== to) {
      el.style.display = "inline-block";
      el.style.textAlign = "right";
      el.style.width = `${natural.toFixed(3)}px`;
    }
    return;
  }
  const n = Math.max(from.length, to.length);
  const a = align === "right" ? from.padStart(n, " ") : from.padEnd(n, " ");
  const b = align === "right" ? to.padStart(n, " ") : to.padEnd(n, " ");
  type Col = { a: string; b: string; asc: number; desc: number; h: number; w: number };
  const cols: Col[] = [];
  let maxAsc = 0;
  let maxDesc = 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const A = metrics(el, a[i]);
    const B = metrics(el, b[i]);
    const asc = Math.max(A.asc, B.asc);
    const desc = Math.max(A.desc, B.desc);
    const h = Math.max(asc + desc, 0.01);
    const w = Math.max(A.w, B.w);
    maxAsc = Math.max(maxAsc, asc);
    maxDesc = Math.max(maxDesc, desc);
    sum += w;
    cols.push({ a: a[i], b: b[i], asc, desc, h, w });
  }
  if (sum > 0 && Math.abs(natural - sum) < 2 && cols.length) {
    cols[cols.length - 1].w += natural - sum;
    sum = natural;
  }
  const parentH = Math.max(maxAsc + maxDesc, 1);
  el.classList.add("j-roll");
  el.style.setProperty("text-box", "none", "important");
  el.style.setProperty("display", "inline-flex", "important");
  el.style.setProperty("align-items", "flex-start", "important");
  el.style.setProperty("overflow", "hidden", "important");
  el.style.setProperty("height", `${parentH.toFixed(3)}px`, "important");
  el.style.setProperty("width", `${sum.toFixed(3)}px`, "important");
  el.style.whiteSpace = "nowrap";
  el.style.fontVariantNumeric = "tabular-nums";
  el.style.fontFeatureSettings = '"tnum" 1';
  el.style.lineHeight = "normal";
  el.replaceChildren();
  const blur = Math.sin(Math.PI * t) * maxBlur;
  const place = (ch: string, into: HTMLElement, asc: number) => {
    if (ch === " ") return;
    const m = metrics(el, ch);
    const tx = document.createElement("span");
    tx.className = "j-roll-glyph";
    tx.textContent = ch;
    tx.style.position = "absolute";
    tx.style.left = "0";
    tx.style.width = "100%";
    tx.style.top = `${(asc - m.base).toFixed(3)}px`;
    tx.style.textAlign = "center";
    tx.style.lineHeight = "normal";
    tx.style.whiteSpace = "pre";
    tx.style.setProperty("text-box", "none", "important");
    into.appendChild(tx);
  };
  for (const c of cols) {
    if (c.w <= 0) continue;
    const slot = document.createElement("span");
    slot.className = "j-roll-slot";
    slot.style.position = "relative";
    slot.style.display = "block";
    slot.style.flex = "0 0 auto";
    slot.style.setProperty("overflow", "hidden", "important");
    slot.style.setProperty("width", `${c.w.toFixed(3)}px`, "important");
    slot.style.setProperty("height", `${c.h.toFixed(3)}px`, "important");
    slot.style.marginTop = `${(maxAsc - c.asc).toFixed(3)}px`;
    if (c.a === c.b) {
      place(c.b, slot, c.asc);
    } else {
      const col = document.createElement("span");
      col.className = "j-roll-col";
      col.style.position = "absolute";
      col.style.left = "0";
      col.style.top = "0";
      col.style.width = "100%";
      col.style.transform = `translateY(${(-t * c.h).toFixed(3)}px)`;
      if (blur >= 0.35) col.style.filter = `blur(${blur.toFixed(2)}px)`;
      [c.a, c.b].forEach((ch) => {
        const cell = document.createElement("span");
        cell.style.display = "block";
        cell.style.position = "relative";
        cell.style.height = `${c.h.toFixed(3)}px`;
        cell.style.setProperty("overflow", "hidden", "important");
        place(ch, cell, c.asc);
        col.appendChild(cell);
      });
      slot.appendChild(col);
    }
    el.appendChild(slot);
  }
}
