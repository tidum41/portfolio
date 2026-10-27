/**
 * In-browser audit of one rendered canvas pane, same rules as the token audit
 * (/dialogue/ds-parity/token-audit): a colour that resolves to no --dp/--ds
 * token, text under WCAG AA contrast, and a non-DM Sans font inside product UI.
 */
export type AuditFlag = {
  pane: "light" | "dark";
  kind: "hardcoded" | "contrast" | "font" | "no-surface";
  el: string;
  message: string;
};

let tokenNames: string[] | null = null;
function collectTokenNames(): string[] {
  if (tokenNames) return tokenNames;
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      const style = (rule as CSSStyleRule).style;
      if (!style) continue;
      for (const n of Array.from(style)) if (/^--(dp|ds)-/.test(n)) names.add(n);
    }
  }
  tokenNames = [...names];
  return tokenNames;
}

const channels = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
const alpha = (c: string) => {
  const m = channels(c);
  return m.length > 3 ? m[3]! : 1;
};
function lum(c: string) {
  let m = channels(c);
  if (c.startsWith("color(")) m = m.map((v) => v * 255);
  const f = (x: number) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(m[0]!) + 0.7152 * f(m[1]!) + 0.0722 * f(m[2]!);
}
/** First opaque background up the tree, and whether it was the canvas pane itself (no surface of its own). */
function effectiveBg(e: Element | null, pane: Element): { color: string; fromPane: boolean } {
  while (e) {
    const c = getComputedStyle(e).backgroundColor;
    if (alpha(c) > 0.5) return { color: c, fromPane: e === pane };
    e = e.parentElement;
  }
  return { color: "rgb(255, 255, 255)", fromPane: true };
}
/** Text drawn over a video still or image: its backdrop is pixels, not a CSS colour, so contrast is not measurable here. */
function overMedia(e: Element, pane: Element): boolean {
  const r = e.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (const m of Array.from(pane.querySelectorAll("img, video, canvas, picture"))) {
    const b = m.getBoundingClientRect();
    if (b.width > r.width * 2 && cx > b.left && cx < b.right && cy > b.top && cy < b.bottom) return true;
  }
  for (let a: Element | null = e; a && a !== pane; a = a.parentElement)
    if (getComputedStyle(a).backgroundImage.includes("url(")) return true;
  return false;
}
const label = (e: Element) =>
  (typeof e.className === "string" && e.className.split(" ").find((c) => /^(dp-|dialogue)/.test(c))) ||
  e.tagName.toLowerCase();

export function auditPane(pane: HTMLElement, theme: "light" | "dark"): AuditFlag[] {
  const flags: AuditFlag[] = [];
  const seen = new Set<string>();
  const roots = Array.from(pane.querySelectorAll<HTMLElement>(".dialogue-product-root"));
  for (const root of roots.length ? roots : [pane]) {
    // One hidden batch of probes per root: a single style recalc, not one per token.
    const box = document.createElement("div");
    box.hidden = true;
    const names = collectTokenNames();
    for (const n of names) {
      const probe = document.createElement("i");
      probe.style.color = `var(${n})`;
      box.appendChild(probe);
    }
    root.appendChild(box);
    const tokenValues = new Set(Array.from(box.children).map((c) => getComputedStyle(c).color));
    box.remove();
    for (const e of Array.from(root.querySelectorAll("*"))) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || !e.getClientRects().length) continue;
      const text = Array.from(e.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent?.trim())
        .join("")
        .trim();
      const name = label(e);
      const add = (f: Omit<AuditFlag, "pane">) => {
        const k = f.kind + name + f.message;
        if (seen.has(k)) return;
        seen.add(k);
        flags.push({ pane: theme, ...f });
      };
      const props: [string, string][] = [];
      if (text) props.push(["color", cs.color]);
      if (alpha(cs.backgroundColor) > 0) props.push(["background", cs.backgroundColor]);
      for (const [prop, val] of props)
        // Partial-alpha fills come from color-mix() tokens whose serialisation
        // does not round-trip reliably, so only opaque literals are flagged.
        if (alpha(val) === 1 && !tokenValues.has(val)) add({ kind: "hardcoded", el: name, message: `${prop} ${val} matches no --dp/--ds token` });
      if (!text) continue;
      if (overMedia(e, pane)) continue;
      const { color: bg, fromPane } = effectiveBg(e, pane);
      const [a, b] = [lum(cs.color), lum(bg)];
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const size = parseFloat(cs.fontSize);
      const need = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700) ? 3 : 4.5;
      if (ratio < need && fromPane && theme === "dark")
        add({ kind: "no-surface", el: name, message: `no surface of its own; ${ratio.toFixed(2)}:1 straight on the dark well` });
      else if (ratio < need) add({ kind: "contrast", el: name, message: `${ratio.toFixed(2)}:1, needs ${need}:1 (“${text.slice(0, 24)}”)` });
      const font = cs.fontFamily.split(",")[0]!.replace(/"/g, "").trim();
      if (!/DM Sans|DM Mono|Zilla/i.test(font)) add({ kind: "font", el: name, message: `${font}, DM Sans expected` });
    }
  }
  return flags;
}
