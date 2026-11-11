/**
 * Layout / component-spec measurer (Rounds 3–4).
 * Usage: npx --yes tsx scripts/measure.ts [baseUrl]
 * Writes docs/audits/round-3-measure.json and docs/audits/round-4-measure.json
 */
import { chromium, type Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTS } from "../src/data/ledger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const outJsonR3 = path.join(root, "docs/audits/round-3-measure.json");
const outJsonR4 = path.join(root, "docs/audits/round-4-measure.json");
const outJsonR5 = path.join(root, "docs/audits/round-5-measure.json");
const base = process.argv[2] || "http://127.0.0.1:4173";

const SCREENS: { view: string; screen: string; route: string; states: string[] }[] = [
  { view: "portal", screen: "quick-order", route: "/quick-order", states: ["default", "empty", "error", "loading"] },
  { view: "portal", screen: "catalog", route: "/catalog", states: ["default", "empty", "error"] },
  { view: "portal", screen: "saved-orders", route: "/saved-orders", states: ["default", "empty", "error"] },
  { view: "portal", screen: "order-history", route: "/orders", states: ["default", "empty"] },
  { view: "portal", screen: "cart", route: "/cart", states: ["default", "empty", "error"] },
  { view: "portal", screen: "review", route: "/review", states: ["default", "empty"] },
  { view: "portal", screen: "invoices", route: "/invoices", states: ["default", "empty", "error"] },
  { view: "portal", screen: "messages", route: "/messages", states: ["default", "empty"] },
  { view: "portal", screen: "login", route: "/login", states: ["default", "error"] },
  { view: "admin", screen: "approvals", route: "/admin/approvals", states: ["default", "empty", "error", "loading"] },
  { view: "admin", screen: "admin-orders", route: "/admin/orders", states: ["default", "empty", "error"] },
];

const WIDTHS = [1280, 1024] as const;
const SPACING_SCALE = new Set([0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64]);
const TYPE_SCALE = new Set([11, 12, 13, 14, 16, 18, 20, 24, 28, 32]);
const RADIUS_OK = new Set([0, 4, 6, 8, 10, 12, 999, 9999]);

type Finding = {
  severity: "P0" | "P1" | "P2" | "P3";
  rule: string;
  screen: string;
  state: string;
  width: number;
  selector: string;
  detail: string;
  measured?: Record<string, number | string>;
};

type NodeMeasure = {
  selector: string;
  tag: string;
  role: string;
  text: string;
  rect: { x: number; y: number; w: number; h: number };
  pad: { t: number; r: number; b: number; l: number };
  margin: { t: number; r: number; b: number; l: number };
  gap: number;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  radius: number;
  color: string;
  bg: string;
  whiteSpace: string;
  textOverflow: string;
  overflow: string;
  scrollW: number;
  scrollH: number;
  /** Estimated wrapped lines from height / line-height */
  lines: number;
};

/** Round 4 component specs — fail on >1px drift */
const COMPONENT_SPECS: {
  match: (n: NodeMeasure) => boolean;
  height?: number;
  padX?: number;
  padY?: number;
  label: string;
}[] = [
  {
    label: "btn-md",
    match: (n) =>
      n.tag === "button" &&
      (n.selector.startsWith(".btn:") ||
        n.selector.startsWith(".btn--primary") ||
        n.selector.startsWith(".btn--outline") ||
        n.selector.startsWith(".btn--reject") ||
        n.selector.startsWith(".btn--danger")) &&
      !n.selector.includes("quiet") &&
      !n.selector.includes("ghost") &&
      !n.selector.includes("--sm"),
    height: 36,
    padX: 16,
  },
  {
    label: "btn-ghost",
    match: (n) => n.selector.includes("btn--ghost"),
    height: 36,
    padX: 12,
  },
  {
    label: "btn-sm/quiet",
    match: (n) =>
      n.selector.includes("btn--quiet") || n.selector.includes("btn--sm"),
    height: 32,
    padX: 12,
  },
  {
    label: "status-pill",
    match: (n) => n.selector.startsWith(".status-pill"),
    height: 22,
    padX: 8,
  },
  {
    label: "avail-tag",
    match: (n) => n.selector.startsWith(".avail-tag"),
    height: 22,
    padX: 8,
  },
];

function nearScale(n: number, scale: Set<number>, tol = 0.6) {
  for (const s of scale) if (Math.abs(n - s) <= tol) return true;
  return false;
}

function qs(view: string, screen: string, state: string) {
  return new URLSearchParams({
    clean: "1",
    view,
    screen,
    state,
    latency: "0",
    fail: "0",
    account: "dicks",
  }).toString();
}

async function pageMetrics(page: Page): Promise<{
  pageBottom: number;
  discTop: number;
  discGap: number;
}> {
  return page.evaluate(() => {
    const pageEl = document.querySelector(".page");
    const disc = document.querySelector(".disclaimer-strip");
    if (!pageEl || !disc) return { pageBottom: 0, discTop: 0, discGap: 0 };
    const pr = pageEl.getBoundingClientRect();
    const dr = disc.getBoundingClientRect();
    return {
      pageBottom: pr.bottom,
      discTop: dr.top,
      discGap: Math.round(dr.top - pr.bottom),
    };
  });
}

type ColumnEdgeMiss = {
  table: string;
  col: number;
  side: "left" | "right";
  header: number;
  cell: number;
  delta: number;
  headerText: string;
};

/**
 * Round 4b: header text/first-child edge must match body cell text/first-child
 * edge at 0px tolerance (left for start-aligned, right for numeric/end).
 * Also compares content-box edges so padding drift (th pl≠td pl) is caught.
 */
async function measureTableColumnEdges(page: Page): Promise<ColumnEdgeMiss[]> {
  // String form avoids tsx/esbuild injecting `__name` into Playwright's serialized fn.
  return page.evaluate(`(() => {
    const misses = [];
    const TOL = 0;

    const contentBox = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      return { left: r.left + pl, right: r.right - pr, borderLeft: r.left, borderRight: r.right };
    };

    const isControl = (el) =>
      el.matches(
        "button, .btn, .status-pill, .avail-tag, a, input, .qo-thumb, .tpl-thumb, .qty-group, .qty-stepper",
      );

    const isEnd = (el) => {
      const cs = getComputedStyle(el);
      return (
        el.classList.contains("end") ||
        el.classList.contains("actions") ||
        cs.textAlign === "right" ||
        cs.justifySelf === "end"
      );
    };

    /** Left: text content-box, or first child / control border-box. Right: content-box / control border. */
    const edgeOf = (el, side) => {
      const box = contentBox(el);
      if (side === "right") {
        if (isControl(el)) return box.borderRight;
        const kids = [...el.children].filter((c) => {
          if (!(c instanceof HTMLElement)) return false;
          const cs = getComputedStyle(c);
          return cs.display !== "none" && cs.visibility !== "hidden";
        });
        if (kids.length && isControl(kids[kids.length - 1])) {
          return kids[kids.length - 1].getBoundingClientRect().right;
        }
        return box.right;
      }
      const kids = [...el.children].filter((c) => {
        if (!(c instanceof HTMLElement)) return false;
        const cs = getComputedStyle(c);
        return cs.display !== "none" && cs.visibility !== "hidden";
      });
      if (kids.length) {
        const k = kids[0];
        if (k.matches("img, svg")) return box.borderLeft;
        return k.getBoundingClientRect().left;
      }
      if (isControl(el)) return box.borderLeft;
      return box.left;
    };

    const pushMiss = (table, col, side, headerEl, cellEl, headerText) => {
      const header = Math.round(edgeOf(headerEl, side) * 10) / 10;
      const cell = Math.round(edgeOf(cellEl, side) * 10) / 10;
      const delta = Math.round((cell - header) * 10) / 10;
      if (Math.abs(delta) > TOL) {
        misses.push({ table, col, side, header, cell, delta, headerText });
      }
    };

    document.querySelectorAll("table.rep-table").forEach((table) => {
      const name =
        "." +
        (table.className.trim().replace(/\\s+/g, ".") || "rep-table");
      const ths = [...table.querySelectorAll("thead th")];
      const row = table.querySelector("tbody tr");
      if (!row || !ths.length) return;
      const tds = [...row.querySelectorAll(":scope > td")];
      ths.forEach((th, i) => {
        const td = tds[i];
        if (!td) return;
        if (!(th.textContent || "").trim() && !(td.textContent || "").trim()) return;
        const side = isEnd(th) || isEnd(td) ? "right" : "left";
        pushMiss(name, i, side, th, td, (th.textContent || "").trim().slice(0, 40));
      });
    });

    const grids = [
      { name: ".qo-table", head: ".qo-table__head", row: ".qo-table__row" },
      { name: ".invoice-table", head: ".invoice-table__head", row: ".invoice-table__row" },
      { name: ".cart-lines", head: ".cart-lines__head", row: ".cart-line" },
    ];

    for (const g of grids) {
      const head = document.querySelector(g.head);
      const row = document.querySelector(g.row);
      if (!head || !row) continue;
      const hCells = [...head.children];
      const rCells = [...row.children];
      const n = Math.min(hCells.length, rCells.length);
      for (let i = 0; i < n; i++) {
        const th = hCells[i];
        const td = rCells[i];
        const headerText = (th.textContent || "").trim().slice(0, 40);
        const actionCol =
          i === n - 1 &&
          (isControl(td) ||
            Boolean(td.querySelector("button, .btn")) ||
            !headerText);
        // Image-only leading column: compare border boxes via edgeOf controls
        const side =
          isEnd(th) || isEnd(td) || actionCol ? "right" : "left";
        pushMiss(
          g.name,
          i,
          side,
          th,
          td,
          headerText || "(empty)",
        );
      }
    }

    return misses;
  })()`) as Promise<ColumnEdgeMiss[]>;
}


function sharedProductImageFindings(): Finding[] {
  /** Intentional shared assets (none by default after Round 4b). */
  const intentionalPairs = new Set<string>();
  const byImage = new Map<string, string[]>();
  for (const p of Object.values(PRODUCTS)) {
    const list = byImage.get(p.image) ?? [];
    list.push(p.id);
    byImage.set(p.image, list);
  }
  const findings: Finding[] = [];
  for (const [image, ids] of byImage) {
    if (ids.length < 2) continue;
    const key = [...ids].sort().join("+");
    if (intentionalPairs.has(key)) continue;
    findings.push({
      severity: "P1",
      rule: "shared-product-image",
      screen: "catalog",
      state: "default",
      width: 1280,
      selector: image,
      detail: `SKUs share image without intentional allowlist: ${ids.join(", ")}`,
      measured: { count: ids.length },
    });
  }
  return findings;
}

async function collect(page: Page): Promise<NodeMeasure[]> {
  return page.evaluate(() => {
    const pick = [
      "h1",
      ".page-lede",
      ".search-row",
      ".qo-table__row",
      ".qo-table__head",
      ".price-block",
      ".qty-group",
      ".qty-presets button",
      ".btn",
      ".btn--primary",
      ".btn--outline",
      ".btn--quiet",
      ".status-pill",
      ".disclaimer-strip",
      ".rep-table th",
      ".rep-table td",
      ".rep-why__line",
      ".rep-why__pills",
      ".rep-dist strong",
      ".rep-actions .btn",
      ".over.is-over-amt",
      ".tpl-card",
      ".cart-pill",
      ".shell__nav a",
      "input",
      "textarea",
      ".avail-tag",
      ".qo-footer",
      ".error-state",
      ".empty-state",
      ".skel",
    ];
    const seen = new Set<Element>();
    const out: NodeMeasure[] = [];
    for (const sel of pick) {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (seen.has(el)) return;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return;
        seen.add(el);
        const rad = parseFloat(cs.borderTopLeftRadius) || 0;
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) || 16;
        const contentH = Math.max(0, r.height - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0));
        const cls = typeof el.className === "string" ? el.className.trim() : "";
        const clsHint = cls
          ? "." + cls.split(/\s+/).filter(Boolean).slice(0, 4).join(".")
          : "";
        out.push({
          selector: `${sel}:nth(${i})${clsHint}`,
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute("role") || "",
          text: (el.textContent || "").trim().slice(0, 80),
          rect: {
            x: Math.round(r.left * 10) / 10,
            y: Math.round(r.top * 10) / 10,
            w: Math.round(r.width * 10) / 10,
            h: Math.round(r.height * 10) / 10,
          },
          pad: {
            t: parseFloat(cs.paddingTop) || 0,
            r: parseFloat(cs.paddingRight) || 0,
            b: parseFloat(cs.paddingBottom) || 0,
            l: parseFloat(cs.paddingLeft) || 0,
          },
          margin: {
            t: parseFloat(cs.marginTop) || 0,
            r: parseFloat(cs.marginRight) || 0,
            b: parseFloat(cs.marginBottom) || 0,
            l: parseFloat(cs.marginLeft) || 0,
          },
          gap: parseFloat(cs.gap || cs.columnGap) || 0,
          fontSize: parseFloat(cs.fontSize) || 0,
          lineHeight: lh,
          fontWeight: parseInt(cs.fontWeight, 10) || 400,
          radius: rad >= 50 ? 999 : Math.round(rad),
          color: cs.color,
          bg: cs.backgroundColor,
          whiteSpace: cs.whiteSpace,
          textOverflow: cs.textOverflow,
          overflow: cs.overflowX || cs.overflow,
          scrollW: (el as HTMLElement).scrollWidth || 0,
          scrollH: (el as HTMLElement).scrollHeight || 0,
          lines: lh > 0 ? Math.round((contentH / lh) * 10) / 10 : 1,
        });
      });
    }
    return out;
  });
}

function relativeLuminance(rgb: [number, number, number]) {
  const lin = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(fg: string, bg: string): number | null {
  const parse = (c: string): [number, number, number] | null => {
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return null;
    return [Number(m[1]), Number(m[2]), Number(m[3])];
  };
  const f = parse(fg);
  let b = parse(bg);
  // Transparent / unset background → assume white page
  if (b && /rgba?\(\d+,\s*\d+,\s*\d+,\s*0\)/.test(bg.replace(/\s/g, ""))) b = [255, 255, 255];
  if (!b || (b[0] === 0 && b[1] === 0 && b[2] === 0 && bg.includes("0)"))) {
    b = [255, 255, 255];
  }
  if (!f || !b) return null;
  const L1 = relativeLuminance(f);
  const L2 = relativeLuminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function analyze(
  screen: string,
  state: string,
  width: number,
  nodes: NodeMeasure[],
  afterHover?: NodeMeasure[],
  metrics?: { discGap: number },
): Finding[] {
  const findings: Finding[] = [];

  const push = (
    severity: Finding["severity"],
    rule: string,
    selector: string,
    detail: string,
    measured?: Finding["measured"],
  ) => findings.push({ severity, rule, screen, state, width, selector, detail, measured });

  for (const n of nodes) {
    for (const [k, v] of Object.entries(n.pad)) {
      if (v > 0 && !nearScale(v, SPACING_SCALE)) {
        push("P2", "spacing-scale", n.selector, `padding-${k}=${v}px off 4/8 scale`, {
          value: v,
        });
      }
    }
    for (const [k, v] of Object.entries(n.margin)) {
      if (v > 0 && v < 80 && !nearScale(v, SPACING_SCALE)) {
        push("P3", "spacing-scale", n.selector, `margin-${k}=${v}px off 4/8 scale`, {
          value: v,
        });
      }
    }
    if (n.gap > 0 && !nearScale(n.gap, SPACING_SCALE)) {
      push("P2", "spacing-scale", n.selector, `gap=${n.gap}px off 4/8 scale`, {
        value: n.gap,
      });
    }
    if (n.fontSize > 0 && !nearScale(n.fontSize, TYPE_SCALE, 0.5)) {
      push("P2", "type-scale", n.selector, `font-size=${n.fontSize}px outside type scale`, {
        fontSize: n.fontSize,
      });
    }
    if (n.radius > 0 && !RADIUS_OK.has(n.radius) && !(n.radius >= 50)) {
      push("P2", "radius", n.selector, `radius=${n.radius}px not 4/8/12`, {
        radius: n.radius,
      });
    }
    const interactive =
      n.tag === "button" ||
      n.tag === "a" ||
      n.tag === "input" ||
      n.selector.includes(".btn") ||
      n.selector.includes("button");
    if (interactive && (n.rect.w < 32 || n.rect.h < 32) && n.rect.w > 0) {
      // Status pills / tiny meta chips are not primary click targets
      if (n.selector.includes("status-pill") || n.selector.includes("avail-tag")) {
        /* skip */
      } else {
        const sev = Math.min(n.rect.w, n.rect.h) < 24 ? "P1" : "P3";
        push(
          sev,
          "hit-target",
          n.selector,
          `target ${n.rect.w}×${n.rect.h} under 32px`,
          { w: n.rect.w, h: n.rect.h },
        );
      }
    }
  }

  // Legacy container-edge check kept as soft signal; content edges use
  // measureTableColumnEdges() with 0px tolerance (see main).

  // Lede → search gap
  const lede = nodes.find((n) => n.selector.startsWith(".page-lede"));
  const search = nodes.find((n) => n.selector.startsWith(".search-row"));
  if (lede && search) {
    const gap = search.rect.y - (lede.rect.y + lede.rect.h);
    if (gap < 12) {
      push("P1", "stack-gap", ".page-lede→.search-row", `subtitle to search gap ${gap.toFixed(1)}px (<12)`, {
        gap,
      });
    }
  }

  // Price → Qty dead gap on QO rows
  const price = nodes.find((n) => n.selector.startsWith(".price-block"));
  const qty = nodes.find((n) => n.selector.startsWith(".qty-group"));
  if (price && qty) {
    const gap = qty.rect.x - (price.rect.x + price.rect.w);
    if (gap > 24) {
      push("P1", "column-gap", ".price-block→.qty-group", `dead gap ${gap.toFixed(1)}px between Price and Qty`, {
        gap,
      });
    }
  }

  // Disclaimer float: measure .page bottom → disclaimer top (normal margin is 24px)
  if (metrics && metrics.discGap > 40) {
    push(
      "P1",
      "disclaimer-float",
      ".disclaimer-strip",
      `floats ${metrics.discGap}px below page content`,
      { float: metrics.discGap },
    );
  }

  // Danger color: over-limit should be danger token (not magenta drift)
  const over = nodes.find((n) => n.selector.includes("is-over-amt"));
  if (over && over.color) {
    // Flag if clearly magenta-leaning (high R+B vs G) — informational for token fix
    const m = over.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const [, r, g, b] = m.map(Number) as number[];
      if (b > g + 20 && r > 140) {
        push("P1", "danger-hue", over.selector, `over-limit color rgb(${r},${g},${b}) reads magenta`, {
          r,
          g,
          b,
        });
      }
    }
  }

  // Unexpected text wrapping in table cells / single-line labels
  for (const n of nodes) {
    const isTableCell =
      n.selector.startsWith(".rep-table td") ||
      n.selector.startsWith(".rep-why__line") ||
      n.selector.startsWith(".rep-dist strong") ||
      n.selector.startsWith(".over.is-over-amt");
    if (!isTableCell || !n.text) continue;

    // Single-line intended: nowrap with horizontal overflow, or height > ~1.5 lines
    const wrappedByHeight = n.lineHeight > 0 && n.lines > 1.55;
    // Intentional ellipsis truncation is not a wrap failure
    const intentionalClip =
      n.textOverflow === "ellipsis" || n.overflow === "hidden";
    const overflowX =
      n.whiteSpace.includes("nowrap") &&
      !intentionalClip &&
      n.scrollW > n.rect.w + 2;
    // td that only contains multi-line intentional blocks (.rep-why) are OK —
    // flag leaf single-line labels that still wrap
    if (n.selector.startsWith(".rep-table td")) {
      // Skip composite cells; leaf rules cover wrap
      continue;
    }
    if (wrappedByHeight) {
      push(
        "P1",
        "text-wrap",
        n.selector,
        `unexpected wrap (~${n.lines} lines): "${n.text.slice(0, 40)}"`,
        { lines: n.lines, h: n.rect.h, lineHeight: n.lineHeight },
      );
    } else if (overflowX) {
      push(
        "P2",
        "text-wrap",
        n.selector,
        `nowrap overflow ${Math.round(n.scrollW - n.rect.w)}px: "${n.text.slice(0, 40)}"`,
        { scrollW: n.scrollW, w: n.rect.w },
      );
    }
  }

  // Pack-chip contrast AA 4.5:1
  for (const n of nodes.filter((x) => x.selector.startsWith(".qty-presets button"))) {
    const ratio = contrastRatio(n.color, n.bg || "rgb(255,255,255)");
    if (ratio != null && ratio < 4.5) {
      push(
        "P1",
        "contrast",
        n.selector,
        `pack chip contrast ${ratio.toFixed(2)}:1 < 4.5 (AA)`,
        { ratio, color: n.color, bg: n.bg },
      );
    }
  }

  // Round 4 component specs — exact heights/paddings, fail on 1px drift
  for (const n of nodes) {
    for (const spec of COMPONENT_SPECS) {
      if (!spec.match(n)) continue;
      if (spec.height != null && Math.abs(n.rect.h - spec.height) > 1) {
        push(
          "P1",
          "component-spec",
          n.selector,
          `${spec.label} height ${n.rect.h}px ≠ ${spec.height}px (±1)`,
          { h: n.rect.h, expected: spec.height },
        );
      }
      if (spec.padX != null) {
        const px = Math.max(n.pad.l, n.pad.r);
        // Allow asymmetric optical nudge of 2px on one side; require at least one side match
        const near =
          Math.abs(n.pad.l - spec.padX) <= 1 ||
          Math.abs(n.pad.r - spec.padX) <= 1;
        if (!near && Math.abs(px - spec.padX) > 1) {
          push(
            "P1",
            "component-spec",
            n.selector,
            `${spec.label} pad-x ${n.pad.l}/${n.pad.r} ≠ ${spec.padX}px (±1)`,
            { padL: n.pad.l, padR: n.pad.r, expected: spec.padX },
          );
        }
      }
      if (spec.padY != null) {
        if (
          Math.abs(n.pad.t - spec.padY) > 1 ||
          Math.abs(n.pad.b - spec.padY) > 1
        ) {
          push(
            "P1",
            "component-spec",
            n.selector,
            `${spec.label} pad-y ${n.pad.t}/${n.pad.b} ≠ ${spec.padY}px (±1)`,
            { padT: n.pad.t, padB: n.pad.b, expected: spec.padY },
          );
        }
      }
    }
  }

  // Hover layout shift
  if (afterHover) {
    for (const before of nodes) {
      const after = afterHover.find((a) => a.selector === before.selector);
      if (!after) continue;
      const dy = Math.abs(after.rect.y - before.rect.y);
      const dh = Math.abs(after.rect.h - before.rect.h);
      if (dy > 1 || dh > 1) {
        push("P2", "layout-shift", before.selector, `hover shifted y=${dy} h=${dh}`, {
          dy,
          dh,
        });
      }
    }
  }

  return findings;
}

async function main() {
  await mkdir(path.dirname(outJsonR4), { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const allFindings: Finding[] = [];
  const samples: Record<string, NodeMeasure[]> = {};

  allFindings.push(...sharedProductImageFindings());

  // Round 5: assert interactive state styles exist in the loaded stylesheet
  {
    const browserCheck = await chromium.launch({
      executablePath:
        process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const ctx = await browserCheck.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/quick-order?${qs("portal", "quick-order", "default")}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(500);
    const stateCoverage = await page.evaluate(`(() => {
      const needed = [
        ".btn:hover",
        ".btn:focus-visible",
        ".btn:active",
        ".btn:disabled",
        ".btn.is-loading",
        ".btn--primary:disabled",
        ".input:focus-visible",
        ".qty-stepper button:disabled",
      ];
      const sheets = [...document.styleSheets];
      const text = [];
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            text.push(rule.cssText);
          }
        } catch (e) {}
      }
      const blob = text.join("\\n");
      return needed.map((sel) => ({
        sel,
        ok:
          blob.includes(sel) ||
          (sel === ".btn:active" && blob.includes(".btn:not(:disabled):active")) ||
          (sel === ".btn:hover" && blob.includes(":hover:not(:disabled)")) ||
          (sel === ".btn.is-loading" && blob.includes(".is-loading")) ||
          (sel === ".btn--primary:disabled" && blob.includes(".btn--primary:disabled")),
      }));
    })()`) as Promise<{ sel: string; ok: boolean }[]>;
    for (const s of stateCoverage) {
      if (!s.ok) {
        allFindings.push({
          severity: "P1",
          rule: "state-style",
          screen: "global",
          state: "default",
          width: 1280,
          selector: s.sel,
          detail: `Missing interactive state style for ${s.sel}`,
        });
      }
    }
    // Press scale should be 0.97
    const pressScale = await page.evaluate(`(() => {
      const sheets = [...document.styleSheets];
      let hit = "";
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.cssText.includes("scale(0.97)")) hit = "0.97";
            if (rule.cssText.includes("scale(0.96)")) hit = hit || "0.96";
          }
        } catch (e) {}
      }
      return hit;
    })()`) as Promise<string>;
    if (pressScale !== "0.97") {
      allFindings.push({
        severity: "P1",
        rule: "press-scale",
        screen: "global",
        state: "default",
        width: 1280,
        selector: ".btn:active",
        detail: `Press scale is ${pressScale || "missing"}, expected 0.97`,
      });
    }
    // Round 5b regression guards
    await page.goto(
      `${base}/admin/approvals?${qs("admin", "approvals", "default")}`,
      { waitUntil: "domcontentloaded", timeout: 30000 },
    );
    await page.waitForTimeout(700);
    const approvalsChecks = await page.evaluate(`(() => {
      const ths = [...document.querySelectorAll(".rep-table--decision thead th")];
      const labels = ths.map((t) => (t.textContent || "").trim());
      const over = ths.find((t) => /over by/i.test(t.textContent || ""));
      const why = ths.find((t) => /^why$/i.test((t.textContent || "").trim()));
      let gutter = null;
      if (over && why) {
        // Content gutter: Why left − (Over-by right − its padding-right).
        // Adjacent cells touch (0px box gap); visual gutter is the pad.
        const padR = parseFloat(getComputedStyle(over).paddingRight) || 0;
        const contentRight = over.getBoundingClientRect().right - padR;
        gutter = Math.round(why.getBoundingClientRect().left - contentRight);
      }
      const row = document.querySelector(".rep-table--decision tbody tr");
      const first = row && row.querySelector("td");
      let selectedPad = null;
      let accentOverlap = null;
      if (row && first) {
        row.classList.add("is-selected");
        const cs = getComputedStyle(first);
        selectedPad = parseFloat(cs.paddingLeft) || 0;
        const text = first.querySelector("strong, .rep-dist__name") || first;
        const textL = text.getBoundingClientRect().left;
        const cellL = first.getBoundingClientRect().left;
        accentOverlap = Math.round(textL - cellL);
      }
      const body = document.body.innerText || "";
      return {
        labels,
        gutter,
        selectedPad,
        accentOverlap,
        hasCreditLeft: /Credit left/i.test(body),
        hasSecondary: /Secondary:/i.test(body),
        jammedHeader: labels.some((l) => /over by why/i.test(l)),
      };
    })()`) as {
      labels: string[];
      gutter: number | null;
      selectedPad: number | null;
      accentOverlap: number | null;
      hasCreditLeft: boolean;
      hasSecondary: boolean;
      jammedHeader: boolean;
    };
    if (approvalsChecks.jammedHeader) {
      allFindings.push({
        severity: "P0",
        rule: "approvals-header-gutter",
        screen: "approvals",
        state: "default",
        width: 1280,
        selector: "th",
        detail: "Over by and Why headers jammed into one label",
      });
    }
    if (approvalsChecks.gutter != null && approvalsChecks.gutter < 20) {
      allFindings.push({
        severity: "P1",
        rule: "approvals-header-gutter",
        screen: "approvals",
        state: "default",
        width: 1280,
        selector: "th Over by → Why",
        detail: `Why column gutter ${approvalsChecks.gutter}px < 20px (want ≥24)`,
        measured: { gutter: approvalsChecks.gutter },
      });
    }
    if (approvalsChecks.selectedPad != null && approvalsChecks.selectedPad < 8) {
      allFindings.push({
        severity: "P1",
        rule: "approvals-selected-pad",
        screen: "approvals",
        state: "default",
        width: 1280,
        selector: "td:first-child",
        detail: `Selected row first-cell pad-left ${approvalsChecks.selectedPad}px (want ≥12)`,
        measured: { pad: approvalsChecks.selectedPad },
      });
    }
    if (
      approvalsChecks.accentOverlap != null &&
      approvalsChecks.accentOverlap < 8
    ) {
      allFindings.push({
        severity: "P1",
        rule: "approvals-accent-overlap",
        screen: "approvals",
        state: "default",
        width: 1280,
        selector: ".rep-dist__name",
        detail: `Text only ${approvalsChecks.accentOverlap}px from cell left — accent may overlap`,
        measured: { inset: approvalsChecks.accentOverlap },
      });
    }
    if (!approvalsChecks.hasCreditLeft) {
      allFindings.push({
        severity: "P1",
        rule: "approvals-copy",
        screen: "approvals",
        state: "default",
        width: 1280,
        selector: ".rep-over .sub",
        detail: 'Missing "Credit left" in over-by subline',
      });
    }
    if (approvalsChecks.hasSecondary) {
      allFindings.push({
        severity: "P1",
        rule: "approvals-copy",
        screen: "approvals",
        state: "default",
        width: 1280,
        selector: ".rep-dist",
        detail: "Secondary contact still visible",
      });
    }
    const adminNav = await page.evaluate(`(() => {
      return [...document.querySelectorAll(".shell__sidebar .shell__nav a, .shell__sidebar .shell__back")].map((el) => {
        const svg = el.querySelector(".icon-slot svg");
        return {
          label: (el.textContent || "").replace(/\\s+/g, " ").trim(),
          hasIcon: Boolean(svg),
          mark: svg ? svg.innerHTML.replace(/\\s+/g, "") : "",
        };
      });
    })()`) as { label: string; hasIcon: boolean; mark: string }[];
    for (const item of adminNav) {
      if (!item.hasIcon) {
        allFindings.push({
          severity: "P1",
          rule: "nav-icon",
          screen: "approvals",
          state: "default",
          width: 1280,
          selector: ".shell__nav a, .shell__back",
          detail: `Nav item missing icon: ${item.label}`,
        });
      }
    }
    if (adminNav.length < 3) {
      allFindings.push({
        severity: "P1",
        rule: "nav-icon",
        screen: "approvals",
        state: "default",
        width: 1280,
        selector: ".shell__sidebar",
        detail: `Expected Orders, Approvals, and store link, found ${adminNav.length}`,
      });
    }
    const adminMarks = adminNav.map((item) => item.mark).filter(Boolean);
    if (new Set(adminMarks).size !== adminMarks.length) {
      allFindings.push({
        severity: "P1",
        rule: "nav-icon-unique",
        screen: "approvals",
        state: "default",
        width: 1280,
        selector: ".shell__sidebar",
        detail: "Sidebar icons are not unique",
      });
    }

    await page.goto(
      `${base}/quick-order?${qs("portal", "quick-order", "default")}`,
      { waitUntil: "domcontentloaded", timeout: 30000 },
    );
    await page.waitForTimeout(700);
    const qoChecks = await page.evaluate(`(() => {
      const hint = document.querySelector(".qo-table__row .prod-break, .tier-popover");
      const hintText = hint ? (hint.textContent || "").replace(/\\s+/g, " ").trim() : "";
      const empty = document.querySelector(".line-total.is-empty, .line-total.is-muted");
      let emptyColor = null;
      if (empty) emptyColor = getComputedStyle(empty).color;
      const chipPrice = document.querySelector(".qty-presets__price");
      const body = document.body.innerText || "";
      const perseus = [...document.querySelectorAll(".qo-table__row")].find((row) =>
        /Perseus Pro V/.test(row.textContent || ""),
      );
      const unit = perseus
        ? (perseus.querySelector(".unit")?.textContent || "").replace(/\\s+/g, " ").trim()
        : "";
      const sidebar = document.querySelector(".shell__sidebar");
      const shell = document.querySelector(".shell");
      let sidebarFill = null;
      if (sidebar && shell) {
        sidebarFill = Math.round(sidebar.getBoundingClientRect().height - shell.getBoundingClientRect().height);
      }
      const nav = [...document.querySelectorAll(".shell__sidebar .shell__nav a, .shell__sidebar .shell__back")].map((el) => {
        const svg = el.querySelector(".icon-slot svg");
        return {
          label: (el.textContent || "").replace(/\\s+/g, " ").trim(),
          hasIcon: Boolean(svg),
          mark: svg ? svg.innerHTML.replace(/\\s+/g, "") : "",
        };
      });
      return {
        tierUi: Boolean(hint),
        hintText,
        unit,
        hasBuyMore: /Buy \\d+\\+ for/.test(body) || /Best tier unlocked/.test(body),
        emptyColor,
        hasChipPrice: Boolean(chipPrice && (chipPrice.textContent || "").trim()),
        sidebarFill,
        nav,
      };
    })()`) as {
      tierUi: boolean;
      hintText: string;
      unit: string;
      hasBuyMore: boolean;
      emptyColor: string | null;
      hasChipPrice: boolean;
      sidebarFill: number | null;
      nav: { label: string; hasIcon: boolean; mark: string }[];
    };
    if (qoChecks.tierUi || qoChecks.hasBuyMore || qoChecks.hasChipPrice) {
      allFindings.push({
        severity: "P1",
        rule: "qo-no-tier",
        screen: "quick-order",
        state: "default",
        width: 1280,
        selector: ".qo-table__row",
        detail: `Quantity price tiering is still visible (${qoChecks.hintText || "chip price or buy-more hint"})`,
      });
    }
    if (qoChecks.unit !== "$165.57 ea") {
      allFindings.push({
        severity: "P1",
        rule: "qo-account-price",
        screen: "quick-order",
        state: "default",
        width: 1280,
        selector: ".unit",
        detail: `Perseus account price should be $165.57 ea, got "${qoChecks.unit}"`,
      });
    }
    for (const item of qoChecks.nav) {
      if (!item.hasIcon) {
        allFindings.push({
          severity: "P1",
          rule: "nav-icon",
          screen: "quick-order",
          state: "default",
          width: 1280,
          selector: ".shell__nav a, .shell__back",
          detail: `Nav item missing icon: ${item.label}`,
        });
      }
    }
    if (qoChecks.nav.length < 7) {
      allFindings.push({
        severity: "P1",
        rule: "nav-icon",
        screen: "quick-order",
        state: "default",
        width: 1280,
        selector: ".shell__sidebar",
        detail: `Expected 6 nav links + store link, found ${qoChecks.nav.length}`,
      });
    }
    const buyerMarks = qoChecks.nav.map((item) => item.mark).filter(Boolean);
    if (new Set(buyerMarks).size !== buyerMarks.length) {
      allFindings.push({
        severity: "P1",
        rule: "nav-icon-unique",
        screen: "quick-order",
        state: "default",
        width: 1280,
        selector: ".shell__sidebar",
        detail: "Sidebar icons are not unique",
      });
    }
    const perseusChip = page.locator(".qo-table__row").filter({ hasText: "Perseus Pro V" }).locator(".qty-presets button").nth(2);
    await perseusChip.click();
    await page.waitForTimeout(100);
    const afterQty = await page.evaluate(`(() => {
      const row = [...document.querySelectorAll(".qo-table__row")].find((el) =>
        /Perseus Pro V/.test(el.textContent || ""),
      );
      if (!row) return { unit: "", total: "" };
      return {
        unit: (row.querySelector(".unit")?.textContent || "").replace(/\\s+/g, " ").trim(),
        total: (row.querySelector(".line-total")?.textContent || "").replace(/\\s+/g, " ").trim(),
      };
    })()`) as { unit: string; total: string };
    if (afterQty.unit !== "$165.57 ea" || afterQty.total !== "$3,973.68") {
      allFindings.push({
        severity: "P1",
        rule: "qo-price-constant",
        screen: "quick-order",
        state: "default",
        width: 1280,
        selector: ".line-total",
        detail: `Qty 24 must stay $165.57 ea / $3,973.68, got "${afterQty.unit}" / "${afterQty.total}"`,
      });
    }
    if (qoChecks.emptyColor) {
      const faint = await page.evaluate(`(() => {
        const host = document.querySelector(".app") || document.body;
        const el = document.createElement("span");
        el.style.color = "var(--faint)";
        host.appendChild(el);
        const c = getComputedStyle(el).color;
        el.remove();
        return c;
      })()`) as string;
      if (qoChecks.emptyColor !== faint) {
        allFindings.push({
          severity: "P1",
          rule: "qo-empty-total-token",
          screen: "quick-order",
          state: "default",
          width: 1280,
          selector: ".line-total.is-empty",
          detail: `Empty total color ${qoChecks.emptyColor} ≠ var(--faint) ${faint}`,
        });
      }
    }
    if (qoChecks.sidebarFill != null && qoChecks.sidebarFill < -2) {
      allFindings.push({
        severity: "P1",
        rule: "sidebar-full-height",
        screen: "quick-order",
        state: "default",
        width: 1280,
        selector: ".shell__sidebar",
        detail: `Sidebar shorter than shell by ${-qoChecks.sidebarFill}px`,
        measured: { delta: qoChecks.sidebarFill },
      });
    }

    await page.goto(`${base}/cart?${qs("portal", "cart", "default")}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(700);
    const cartChecks = await page.evaluate(`(() => {
      const cta = document.querySelector(".cart-summary__cta, a.btn--primary");
      let underline = null;
      let gap = null;
      if (cta) {
        underline = getComputedStyle(cta).textDecorationLine;
        const total = document.querySelector(".cart-summary__total");
        if (total) {
          gap = Math.round(cta.getBoundingClientRect().top - total.getBoundingClientRect().bottom);
        }
      }
      const headTotal = [...document.querySelectorAll(".cart-lines__head span")].find((s) =>
        /total/i.test(s.textContent || ""),
      );
      let headAlign = null;
      if (headTotal) headAlign = getComputedStyle(headTotal).textAlign;
      const body = document.body.innerText || "";
      const summary = [...document.querySelectorAll(".cart-summary__row, .cart-summary__total")].map(
        (row) => [...row.children].map((child) => (child.textContent || "").trim()).join(" "),
      );
      return {
        underline,
        gap,
        headAlign,
        hasCreditLeftAfter: /Credit left after order/i.test(body),
        hasItems: /Items/i.test(body) && /units/i.test(body),
        hasNet30Remaining: /Net 30 remaining/i.test(body),
        summary,
      };
    })()`) as {
      underline: string | null;
      gap: number | null;
      headAlign: string | null;
      hasCreditLeftAfter: boolean;
      hasItems: boolean;
      hasNet30Remaining: boolean;
      summary: string[];
    };
    if (cartChecks.underline && cartChecks.underline.includes("underline")) {
      allFindings.push({
        severity: "P1",
        rule: "cart-cta-underline",
        screen: "cart",
        state: "default",
        width: 1280,
        selector: ".cart-summary__cta",
        detail: "Continue to review is underlined",
      });
    }
    if (cartChecks.gap != null && cartChecks.gap < 12) {
      allFindings.push({
        severity: "P1",
        rule: "cart-cta-gap",
        screen: "cart",
        state: "default",
        width: 1280,
        selector: ".cart-summary__cta",
        detail: `Gap above CTA ${cartChecks.gap}px < 16`,
        measured: { gap: cartChecks.gap },
      });
    }
    if (cartChecks.headAlign && cartChecks.headAlign !== "right") {
      allFindings.push({
        severity: "P1",
        rule: "cart-numeric-align",
        screen: "cart",
        state: "default",
        width: 1280,
        selector: ".cart-lines__head .end",
        detail: `Total header text-align=${cartChecks.headAlign}, want right`,
      });
    }
    if (!cartChecks.hasCreditLeftAfter || cartChecks.hasNet30Remaining) {
      allFindings.push({
        severity: "P1",
        rule: "cart-summary-copy",
        screen: "cart",
        state: "default",
        width: 1280,
        selector: ".cart-summary",
        detail: 'Summary must use "Credit left after order" (not Net 30 remaining)',
      });
    }
    if (!cartChecks.hasItems) {
      allFindings.push({
        severity: "P1",
        rule: "cart-summary-copy",
        screen: "cart",
        state: "default",
        width: 1280,
        selector: ".cart-summary",
        detail: 'Summary must show Items with units count',
      });
    }
    const wantCart = ["Subtotal $8,467.08", "Credit left after order $9,908.66", "Total $8,467.08"];
    for (const line of wantCart) {
      if (!cartChecks.summary.includes(line)) {
        allFindings.push({
          severity: "P1",
          rule: "cart-account-math",
          screen: "cart",
          state: "default",
          width: 1280,
          selector: ".cart-summary",
          detail: `Missing "${line}". Summary: ${cartChecks.summary.join(" | ")}`,
        });
      }
    }

    await page.goto(`${base}/dev/states-sheet?clean=1`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(500);
    const statesOk = await page.evaluate(`(() => {
      const h1 = (document.querySelector("h1")?.textContent || "").trim();
      const rows = document.querySelectorAll(".states-sheet__row").length;
      return { h1, rows };
    })()`) as { h1: string; rows: number };
    if (!/states sheet/i.test(statesOk.h1) || statesOk.rows < 8) {
      allFindings.push({
        severity: "P0",
        rule: "states-sheet",
        screen: "states-sheet",
        state: "default",
        width: 1280,
        selector: "/dev/states-sheet",
        detail: `Expected States sheet grid, got h1="${statesOk.h1}" rows=${statesOk.rows}`,
      });
    }
    const statesGuard = await page.evaluate(`(() => {
      function overflows(sel) {
        const bad = [];
        for (const root of document.querySelectorAll(sel)) {
          const nodes = [root, ...root.querySelectorAll("*")];
          for (const el of nodes) {
            if (!(el instanceof HTMLElement)) continue;
            if (el.closest("svg")) continue;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            if (el.clientWidth < 2 || el.clientHeight < 2) continue;
            if (el.scrollWidth > el.clientWidth + 1) {
              const label = (typeof el.className === "string" ? el.className : el.tagName).slice(0, 70);
              bad.push(label + " \\"" + (el.innerText || "").trim().slice(0, 28) + "\\" " + el.scrollWidth + ">" + el.clientWidth);
              if (bad.length >= 8) return bad;
            }
          }
        }
        return bad;
      }
      const danger = document.querySelector(".btn--danger.is-demo-hover");
      const ghost = document.querySelector(".btn--ghost.is-demo-hover");
      const body = document.body.innerText || "";
      return {
        overflow: overflows(".states-sheet__cell"),
        dangerBg: danger ? getComputedStyle(danger).backgroundColor : "",
        ghostBg: ghost ? getComputedStyle(ghost).backgroundColor : "",
        hasFire: /Fire toast/.test(body),
        hasSuccess: /Order approved/.test(body),
        hasUndo: /Removed Perseus/.test(body) && /Undo/.test(body),
        hasErr: /Could not save/.test(body),
        naCount: document.querySelectorAll(".states-na").length,
      };
    })()`) as {
      overflow: string[];
      dangerBg: string;
      ghostBg: string;
      hasFire: boolean;
      hasSuccess: boolean;
      hasUndo: boolean;
      hasErr: boolean;
      naCount: number;
    };
    for (const hit of statesGuard.overflow) {
      allFindings.push({
        severity: "P1",
        rule: "states-cell-overflow",
        screen: "states-sheet",
        state: "default",
        width: 1280,
        selector: ".states-sheet__cell",
        detail: `States cell overflow: ${hit}`,
      });
    }
    if (statesGuard.dangerBg === "rgb(36, 52, 199)" || statesGuard.dangerBg === "rgb(36, 51, 196)") {
      allFindings.push({
        severity: "P1",
        rule: "states-danger-hover",
        screen: "states-sheet",
        state: "default",
        width: 1280,
        selector: ".btn--danger.is-demo-hover",
        detail: `Danger hover is blue (${statesGuard.dangerBg})`,
      });
    }
    if (!statesGuard.dangerBg || statesGuard.dangerBg === "rgb(36, 52, 199)") {
      allFindings.push({
        severity: "P1",
        rule: "states-danger-hover",
        screen: "states-sheet",
        state: "default",
        width: 1280,
        selector: ".btn--danger.is-demo-hover",
        detail: `Danger hover background ${statesGuard.dangerBg || "missing"}`,
      });
    }
    if (statesGuard.ghostBg === "rgb(36, 52, 199)" || statesGuard.ghostBg === "rgb(44, 62, 224)") {
      allFindings.push({
        severity: "P1",
        rule: "states-ghost-hover",
        screen: "states-sheet",
        state: "default",
        width: 1280,
        selector: ".btn--ghost.is-demo-hover",
        detail: `Ghost hover is solid blue (${statesGuard.ghostBg})`,
      });
    }
    if (statesGuard.hasFire || !statesGuard.hasSuccess || !statesGuard.hasUndo || !statesGuard.hasErr) {
      allFindings.push({
        severity: "P1",
        rule: "states-toast",
        screen: "states-sheet",
        state: "default",
        width: 1280,
        selector: ".states-toast",
        detail: "Toast row must show success, error, and undo toasts (not a Fire toast button)",
      });
    }
    if (statesGuard.naCount < 4) {
      allFindings.push({
        severity: "P1",
        rule: "states-na",
        screen: "states-sheet",
        state: "default",
        width: 1280,
        selector: ".states-na",
        detail: `Expected N/A for states that do not exist, found ${statesGuard.naCount}`,
      });
    }

    for (const width of [1280, 1024] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `${base}/quick-order?${qs("portal", "quick-order", "default")}`,
        { waitUntil: "domcontentloaded", timeout: 30000 },
      );
      await page.waitForTimeout(500);
      const qoOverflow = await page.evaluate(`(() => {
        const bad = [];
        const roots = document.querySelectorAll(".qo-table__head > *, .qo-table__row > *");
        for (const root of roots) {
          const nodes = [root, ...root.querySelectorAll("*")];
          for (const el of nodes) {
            if (!(el instanceof HTMLElement)) continue;
            if (el.closest("svg")) continue;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            if (el.clientWidth < 2 || el.clientHeight < 2) continue;
            if (el.scrollWidth > el.clientWidth + 1) {
              const label = (typeof el.className === "string" ? el.className : el.tagName).slice(0, 70);
              bad.push(label + " " + el.scrollWidth + ">" + el.clientWidth);
              if (bad.length >= 8) return bad;
            }
          }
        }
        return bad;
      })()`) as string[];
      for (const hit of qoOverflow) {
        allFindings.push({
          severity: "P1",
          rule: "cell-overflow",
          screen: "quick-order",
          state: "default",
          width,
          selector: ".qo-table",
          detail: `Table cell overflow: ${hit}`,
        });
      }
      const qoLayout = await page.evaluate(`(() => {
        const groups = [...document.querySelectorAll(".qo-table__row .qty-group")];
        const lefts = groups.map((g) => Math.round(g.getBoundingClientRect().left));
        const widths = groups.map((g) => Math.round(g.getBoundingClientRect().width));
        const chips = [...document.querySelectorAll(".qo-table__row .qty-presets button")];
        const chipW = chips.map((c) => Math.round(c.getBoundingClientRect().width));
        const table = document.querySelector(".qo-table");
        const btn = document.querySelector(".qo-footer .btn");
        const search = document.querySelector(".search-row");
        const tableR = table ? table.getBoundingClientRect().right : 0;
        const btnR = btn ? btn.getBoundingClientRect().right : 0;
        const searchR = search ? search.getBoundingClientRect().right : 0;
        const total = document.querySelector(".qo-table__row .line-total");
        const totalHead = document.querySelector(".qo-table__head > :last-child");
        return {
          n: groups.length,
          leftSpread: lefts.length ? Math.max(...lefts) - Math.min(...lefts) : 0,
          widthSpread: widths.length ? Math.max(...widths) - Math.min(...widths) : 0,
          chipSpread: chipW.length ? Math.max(...chipW) - Math.min(...chipW) : 0,
          tableR,
          btnR,
          searchR,
          totalRight: total ? total.getBoundingClientRect().right : 0,
          headRight: totalHead ? totalHead.getBoundingClientRect().right : 0,
        };
      })()`) as {
        n: number;
        leftSpread: number;
        widthSpread: number;
        chipSpread: number;
        tableR: number;
        btnR: number;
        searchR: number;
        totalRight: number;
        headRight: number;
      };
      if (qoLayout.n < 2 || qoLayout.leftSpread > 1 || qoLayout.widthSpread > 1) {
        allFindings.push({
          severity: "P1",
          rule: "qty-group-align",
          screen: "quick-order",
          state: "default",
          width,
          selector: ".qty-group",
          detail: `Qty groups do not share one left edge and width (left Δ${qoLayout.leftSpread}px, width Δ${qoLayout.widthSpread}px)`,
        });
      }
      if (qoLayout.chipSpread > 1) {
        allFindings.push({
          severity: "P1",
          rule: "qty-chip-width",
          screen: "quick-order",
          state: "default",
          width,
          selector: ".qty-presets button",
          detail: `Pack chips are not one width (Δ${qoLayout.chipSpread}px)`,
        });
      }
      const edgeDelta = Math.abs(qoLayout.tableR - qoLayout.btnR);
      const searchDelta = Math.abs(qoLayout.tableR - qoLayout.searchR);
      if (edgeDelta > 1 || searchDelta > 1) {
        allFindings.push({
          severity: "P1",
          rule: "table-content-edge",
          screen: "quick-order",
          state: "default",
          width,
          selector: ".qo-table",
          detail: `Table right ${qoLayout.tableR.toFixed(1)} vs Add to cart ${qoLayout.btnR.toFixed(1)} vs search ${qoLayout.searchR.toFixed(1)}`,
        });
      }
      if (Math.abs(qoLayout.totalRight - qoLayout.tableR) > 14) {
        allFindings.push({
          severity: "P1",
          rule: "table-content-edge",
          screen: "quick-order",
          state: "default",
          width,
          selector: ".line-total",
          detail: `Total is not on the table's right edge (Δ${(qoLayout.tableR - qoLayout.totalRight).toFixed(1)}px)`,
        });
      }
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    const aqErrors: string[] = [];
    page.on("pageerror", (err) => aqErrors.push(String(err)));
    const aqUrl = (query: string) =>
      `${base}/prototypes/approval-queue?clean=1&${query}`;
    const ink = "rgb(26, 26, 26)";
    const danger = "rgb(198, 40, 40)";

    await page.goto(aqUrl("v=1"), { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(400);
    const ledgerGuard = (await page.evaluate(`(() => {
      const heroes = [...document.querySelectorAll(".aq-hero")].map((el) => getComputedStyle(el).color);
      const overChip = getComputedStyle(document.querySelector(".aq-pill--over")).color;
      const due = document.querySelector(".aq-pill--due");
      const dueColor = due ? getComputedStyle(due).color : "";
      const buttons = [...document.querySelectorAll(".aq-btn")].map((el) => Math.round(el.getBoundingClientRect().height));
      const btn = document.querySelector(".aq-btn");
      const before = btn.getBoundingClientRect().width;
      btn.setAttribute("data-busy", "");
      const after = btn.getBoundingClientRect().width;
      btn.removeAttribute("data-busy");
      btn.focus({ focusVisible: true });
      const outline = getComputedStyle(btn).outlineStyle;
      const outlineW = parseFloat(getComputedStyle(btn).outlineWidth) || 0;
      let rule = false;
      for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch (e) { continue; }
        for (const r of rules) {
          if (r.selectorText && String(r.selectorText).indexOf(".aq-btn:focus-visible") !== -1) rule = true;
        }
      }
      return { heroes, overChip, dueColor, buttons, shift: Math.abs(after - before), outline, outlineW, rule };
    })()`)) as {
      heroes: string[];
      overChip: string;
      dueColor: string;
      buttons: number[];
      shift: number;
      outline: string;
      outlineW: number;
      rule: boolean;
    };
    if (ledgerGuard.heroes.some((color) => color !== ink)) {
      allFindings.push({
        severity: "P1",
        rule: "aq-overby-ink",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-hero",
        detail: `Over-by figures must be ink, got ${ledgerGuard.heroes.join(", ")}`,
      });
    }
    if (ledgerGuard.overChip !== danger) {
      allFindings.push({
        severity: "P1",
        rule: "aq-over-chip",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-pill--over",
        detail: `Over limit chip color ${ledgerGuard.overChip}`,
      });
    }
    if (ledgerGuard.dueColor !== danger) {
      allFindings.push({
        severity: "P1",
        rule: "aq-overdue-chip",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-pill--due",
        detail: `Overdue invoices chip color ${ledgerGuard.dueColor || "missing"}`,
      });
    }
    if (ledgerGuard.buttons.some((height) => height !== 36)) {
      allFindings.push({
        severity: "P1",
        rule: "aq-target-36",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-btn",
        detail: `Button heights ${ledgerGuard.buttons.join(", ")}`,
      });
    }
    if (ledgerGuard.shift > 1) {
      allFindings.push({
        severity: "P1",
        rule: "aq-busy-width",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-btn",
        detail: `Busy state shifts button width by ${ledgerGuard.shift.toFixed(1)}px`,
      });
    }
    if (!ledgerGuard.rule || ledgerGuard.outline === "none" || ledgerGuard.outlineW < 2) {
      allFindings.push({
        severity: "P1",
        rule: "aq-focus-visible",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-btn:focus-visible",
        detail: `focus-visible outline ${ledgerGuard.outline} ${ledgerGuard.outlineW}px, rule ${ledgerGuard.rule}`,
      });
    }

    await page.locator(".aq-block.is-open .aq-btn").nth(1).click();
    await page.waitForTimeout(150);
    const rejectInvalid = await page.locator(".aq-block.is-open input[aria-invalid='true']").count();
    if (rejectInvalid < 1) {
      allFindings.push({
        severity: "P1",
        rule: "aq-reject-reason",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-reason input",
        detail: "Reject with an empty reason did not mark the field invalid",
      });
    }
    await page.locator(".aq-block.is-open .aq-btn").first().click();
    await page.waitForTimeout(300);
    const approved = await page.locator(".aq-toast").innerText().catch(() => "");
    const stillDicks = await page.locator(".aq-name", { hasText: "Dick's Sporting Goods" }).count();
    if (!approved.includes("Order approved") || stillDicks > 0) {
      allFindings.push({
        severity: "P1",
        rule: "aq-approve-api",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-toast",
        detail: `Approve toast "${approved}" and Dick's still visible ${stillDicks}`,
      });
    }

    await page.goto(aqUrl("v=2"), { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(300);
    const triageGuard = (await page.evaluate(`(() => {
      const text = document.body.innerText;
      const room = getComputedStyle(document.querySelector(".aq-bar__room")).backgroundColor;
      const over = getComputedStyle(document.querySelector(".aq-bar__over")).backgroundColor;
      const figure = getComputedStyle(document.querySelector(".aq-over-figure")).color;
      const buttons = [...document.querySelectorAll(".aq-btn")].map((el) => Math.round(el.getBoundingClientRect().height));
      const caption = document.querySelector(".aq-caption");
      const reject = document.querySelectorAll(".aq-decide .aq-btn")[1];
      const rejectCs = getComputedStyle(reject);
      return {
        text,
        room,
        over,
        figure,
        buttons,
        caption: caption ? caption.textContent : "",
        captionColor: caption ? getComputedStyle(caption).color : "",
        rejectColor: rejectCs.color,
        rejectBorder: rejectCs.borderTopColor,
      };
    })()`)) as {
      text: string;
      room: string;
      over: string;
      figure: string;
      buttons: number[];
      caption: string;
      captionColor: string;
      rejectColor: string;
      rejectBorder: string;
    };
    if (!triageGuard.text.includes("1 of 3")) {
      allFindings.push({
        severity: "P1",
        rule: "aq-triage-label",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-count",
        detail: "Triage card must read 1 of 3",
      });
    }
    if (triageGuard.room === danger || triageGuard.over !== danger || triageGuard.figure !== ink) {
      allFindings.push({
        severity: "P1",
        rule: "aq-triage-bar",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-bar",
        detail: `room ${triageGuard.room}, overflow ${triageGuard.over}, figure ${triageGuard.figure}`,
      });
    }
    if (triageGuard.buttons.some((height) => height !== 36)) {
      allFindings.push({
        severity: "P1",
        rule: "aq-target-36",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-card .aq-btn",
        detail: `Triage button heights ${triageGuard.buttons.join(", ")}`,
      });
    }
    const muted = "rgb(92, 92, 102)";
    if (
      triageGuard.caption !== "Gray is room left. Red is over the limit." ||
      triageGuard.captionColor !== muted
    ) {
      allFindings.push({
        severity: "P1",
        rule: "aq-triage-caption",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-caption",
        detail: `Caption "${triageGuard.caption}" ${triageGuard.captionColor}`,
      });
    }
    if (triageGuard.rejectColor !== ink || triageGuard.rejectBorder === danger) {
      allFindings.push({
        severity: "P1",
        rule: "aq-reject-rest",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-decide .aq-btn",
        detail: `Reject at rest is ${triageGuard.rejectColor} / ${triageGuard.rejectBorder}`,
      });
    }
    await page.locator("#triage-reason").fill("Over the open-to-buy.");
    const armedReject = (await page.evaluate(`(() => {
      const reject = document.querySelectorAll(".aq-decide .aq-btn")[1];
      return getComputedStyle(reject).color;
    })()`)) as string;
    if (armedReject !== danger) {
      allFindings.push({
        severity: "P1",
        rule: "aq-reject-armed",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-btn--danger",
        detail: `Reject with a reason is ${armedReject}, want danger`,
      });
    }

    await page.goto(aqUrl("v=3"), { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(300);
    const splitGuard = (await page.evaluate(`(() => {
      const overs = [...document.querySelectorAll(".aq-list__over, .aq-quad__v")].map((el) => getComputedStyle(el).color);
      const due = document.querySelector(".aq-pill--due");
      return { overs, due: due ? getComputedStyle(due).color : "" };
    })()`)) as { overs: string[]; due: string };
    if (splitGuard.overs.some((color) => color !== ink) || splitGuard.due !== danger) {
      allFindings.push({
        severity: "P1",
        rule: "aq-overby-ink",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-list__over",
        detail: `Split over-by ${splitGuard.overs.join(", ")}; overdue chip ${splitGuard.due}`,
      });
    }
    const splitDetail = await page.locator(".aq-decision").innerText();
    if (splitDetail.includes("Overdue $0.00") || splitDetail.includes("Overdue invoices")) {
      allFindings.push({
        severity: "P1",
        rule: "aq-split-overdue",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-decision",
        detail: "Dick's detail still shows an overdue line at $0.00",
      });
    }
    await page.getByRole("button", { name: /Baseline Pickleball/ }).click();
    const baselineDetail = await page.locator(".aq-decision").innerText();
    if (!baselineDetail.includes("Overdue invoices") || !baselineDetail.includes("$2,840.50")) {
      allFindings.push({
        severity: "P1",
        rule: "aq-split-overdue",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-quad",
        detail: `Baseline detail missing the overdue stat: ${baselineDetail.slice(0, 180)}`,
      });
    }

    const stateChecks: { state: string; query: string; ok: string }[] = [
      { state: "empty", query: "v=1&protoState=empty", ok: ".aq-empty" },
      { state: "loading", query: "v=1&protoState=loading", ok: "[aria-busy='true']" },
      { state: "reject-with-reason", query: "v=1&protoState=reject-with-reason", ok: "input[aria-invalid='true']" },
      { state: "approve-override", query: "v=1&protoState=approve-override", ok: ".aq-toast" },
    ];
    for (const check of stateChecks) {
      await page.goto(aqUrl(check.query), { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(250);
      const count = await page.locator(check.ok).count();
      const text = check.state === "empty" ? await page.locator(".aq-empty").innerText().catch(() => "") : "";
      const toast = check.state === "approve-override" ? await page.locator(".aq-toast").innerText().catch(() => "") : "Order approved";
      const dicks = check.state === "approve-override"
        ? await page.locator(".aq-name", { hasText: "Dick's Sporting Goods" }).count()
        : 0;
      if (count < 1 || (check.state === "empty" && !text.includes("Nothing waiting")) || (check.state === "approve-override" && (!toast.includes("Order approved") || dicks > 0))) {
        allFindings.push({
          severity: "P1",
          rule: "aq-forced-state",
          screen: "approval-queue",
          state: check.state,
          width: 1280,
          selector: check.ok,
          detail: `Forced ${check.state} missing landmark (count ${count})`,
        });
      }
    }

    for (const width of [1280, 1024] as const) {
      await page.setViewportSize({ width, height: 900 });
      for (const query of ["v=1", "v=2", "v=3", "v=1&protoState=empty", "v=1&protoState=loading"]) {
        await page.goto(aqUrl(query), { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(200);
        const gap = (await page.evaluate(`(() => {
          const scroller = document.querySelector(".aq-page");
          const disc = document.querySelector(".aq-disclaimer");
          const picker = document.querySelector(".proto-picker");
          if (!scroller || !disc || !picker) return { missing: true, gap: 0, overlaps: true };
          function measure() {
            const d = disc.getBoundingClientRect();
            const p = picker.getBoundingClientRect();
            const s = scroller.getBoundingClientRect();
            const top = Math.max(d.top, s.top);
            const bottom = Math.min(d.bottom, s.bottom);
            const visible = bottom > top + 1;
            const overlaps = visible && bottom > p.top && top < p.bottom && d.right > p.left && d.left < p.right;
            const clear = p.top - (visible ? bottom : s.bottom);
            return { overlaps, clear };
          }
          const atTop = measure();
          scroller.scrollTop = scroller.scrollHeight;
          const atEnd = measure();
          return {
            missing: false,
            overlaps: atTop.overlaps || atEnd.overlaps,
            clear: Math.min(atTop.clear, atEnd.clear),
          };
        })()`)) as { missing: boolean; overlaps: boolean; clear: number };
        if (gap.missing || gap.overlaps || gap.clear < 23) {
          allFindings.push({
            severity: "P1",
            rule: "aq-picker-clearance",
            screen: "approval-queue",
            state: query,
            width,
            selector: ".aq-disclaimer",
            detail: `Switcher clearance ${gap.clear.toFixed(1)}px on ${query}`,
          });
        }
      }
    }
    await page.setViewportSize({ width: 1280, height: 900 });

    const reduced = await browserCheck.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(aqUrl("v=1"), { waitUntil: "domcontentloaded", timeout: 30000 });
    await reducedPage.waitForTimeout(200);
    const animationName = await reducedPage.evaluate(
      `(() => getComputedStyle(document.querySelector(".aq-detail")).animationName)()`,
    );
    if (animationName !== "none") {
      allFindings.push({
        severity: "P1",
        rule: "aq-reduced-motion",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: ".aq-detail",
        detail: `Reduced motion still animates .aq-detail (${animationName})`,
      });
    }
    await reduced.close();

    if (aqErrors.length) {
      allFindings.push({
        severity: "P1",
        rule: "aq-console",
        screen: "approval-queue",
        state: "default",
        width: 1280,
        selector: "window",
        detail: aqErrors.join(" | "),
      });
    }

    await ctx.close();
    await browserCheck.close();
  }

  for (const width of WIDTHS) {
    for (const job of SCREENS) {
      for (const state of job.states) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
        });
        const page = await context.newPage();
        const url = `${base}${job.route}?${qs(job.view, job.screen, state)}`;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(700);
        const nodes = await collect(page);
        const metrics = await pageMetrics(page);
        samples[`${job.screen}__${state}__${width}`] = nodes;

        let afterHover: NodeMeasure[] | undefined;
        const hoverTarget = page.locator(".btn, .qo-table__row, .tpl-card").first();
        if (await hoverTarget.count()) {
          await hoverTarget.hover({ force: true }).catch(() => undefined);
          await page.waitForTimeout(120);
          afterHover = await collect(page);
        }

        allFindings.push(
          ...analyze(job.screen, state, width, nodes, afterHover, metrics),
        );

        // Table column content-edge rule (0px). Run on default state only.
        if (state === "default") {
          const edgeMisses = await measureTableColumnEdges(page);
          for (const m of edgeMisses) {
            allFindings.push({
              severity: "P1",
              rule: "table-column-edge",
              screen: job.screen,
              state,
              width,
              selector: `${m.table} col:${m.col} (${m.headerText})`,
              detail: `${m.side} edge th=${m.header} td=${m.cell} delta=${m.delta}px (tol 0)`,
              measured: {
                header: m.header,
                cell: m.cell,
                delta: m.delta,
              },
            });
          }
        }
        await context.close();
        process.stdout.write(`.`);
      }
    }
  }

  // Dedupe similar findings
  const key = (f: Finding) =>
    `${f.rule}|${f.screen}|${f.state}|${f.width}|${f.detail}`;
  const deduped = [...new Map(allFindings.map((f) => [key(f), f])).values()];

  const counts = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const f of deduped) counts[f.severity] += 1;

  const report = {
    generatedAt: new Date().toISOString(),
    base,
    widths: WIDTHS,
    counts,
    findingCount: deduped.length,
    findings: deduped.sort((a, b) =>
      a.severity.localeCompare(b.severity) || a.screen.localeCompare(b.screen),
    ),
    sampleKeys: Object.keys(samples),
  };

  await writeFile(outJsonR3, JSON.stringify(report, null, 2));
  await writeFile(outJsonR4, JSON.stringify(report, null, 2));
  await writeFile(outJsonR5, JSON.stringify(report, null, 2));
  await browser.close();
  console.log(
    `\nWrote ${outJsonR5} (${deduped.length} findings: ${JSON.stringify(counts)})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
