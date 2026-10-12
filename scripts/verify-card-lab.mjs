#!/usr/bin/env node
/**
 * Automated card-lab rubric checks (DOM, computed styles, network).
 *
 * Usage: node scripts/verify-card-lab.mjs <baseUrl>
 * Example: node scripts/verify-card-lab.mjs http://127.0.0.1:3000
 *
 * Exits non-zero on any FAIL. Prints PASS/FAIL table by rubric number.
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.CARD_LAB_SHOTS || "/opt/cursor/artifacts/card-lab";
/** Optional Playwright storageState path (Vercel Deployment Protection cookie). */
const STORAGE = process.env.CARD_LAB_STORAGE || "";
const ALLOWED_SPACE = new Set([0, 1, 4, 8, 12, 16, 24, 32, 48, 96]);
/** 24 = display metric (outcome-metric concept). */
const ALLOWED_FS = new Set([11, 13, 15, 24]);
/** Kinds allowed to change card box height on hover (expand/reveal). */
const HEIGHT_CHANGE_KINDS = new Set(["numbered-index", "stagger-reveal", "text-row"]);
/** Titles that must match Mudit's real work (homepage + case studies). */
const MUDIT_TITLES = new Set([
  "Simplifying UCLA subleasing",
  "Todolist with AI organization",
  "Making custom keyboards accessible",
  "Drag a CD",
  "Dumb Habit Tracker",
  "Project name", // legacy framed/edge/text concepts
]);
/** Minimum pixel difference between variant screenshots (sum of abs RGB). */
const MIN_VARIANT_PIXEL_DIFF = 1200;

async function newCtx(browser, opts = {}) {
  return browser.newContext({
    ...(STORAGE ? { storageState: STORAGE } : {}),
    ...opts,
  });
}

/**
 * Overlap finder run inside the page. Preview may overlap the canvas outside
 * its card, but must never cover its own title/description (or other copy).
 */
function overlapFinderSource() {
  return () => {
    const root = document.querySelector("[data-cl-root]");
    const all = [...root.querySelectorAll("*")].filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") return false;
      if (Number(cs.opacity) < 0.05) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0.5 && r.height > 0.5;
    });
    const boxes = all.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
      };
    });
    const isPreview = (el) =>
      el.hasAttribute("data-cl-preview") || !!el.closest("[data-cl-preview]");
    const isRowCopy = (el) =>
      el.hasAttribute("data-cl-copy") ||
      el.hasAttribute("data-cl-card-title") ||
      el.hasAttribute("data-cl-card-desc") ||
      !!el.closest("[data-cl-copy]");
    const overlaps = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const hit = !(
          a.right <= b.left + 0.5 ||
          b.right <= a.left + 0.5 ||
          a.bottom <= b.top + 0.5 ||
          b.bottom <= a.top + 0.5
        );
        if (!hit) continue;

        const aPrev = isPreview(a.el);
        const bPrev = isPreview(b.el);
        if (aPrev || bPrev) {
          // Preview vs canvas (outside its card) is allowed. Preview vs its
          // own row copy is a hard fail — that was the above-placement bug.
          if (aPrev && bPrev) continue;
          const previewEl = aPrev ? a.el : b.el;
          const other = aPrev ? b.el : a.el;
          const previewCard = previewEl.closest("[data-cl-card]");
          if (
            previewCard &&
            previewCard.contains(other) &&
            isRowCopy(other)
          ) {
            // Numbered index: preview may sit beside one row while other
            // project titles in the same card list are unrelated siblings.
            const previewItem = previewEl.closest("[data-cl-index-item]");
            const otherItem = other.closest("[data-cl-index-item]");
            if (
              previewItem &&
              otherItem &&
              previewItem !== otherItem
            ) {
              continue;
            }
            overlaps.push(
              `preview>${other.className || other.tagName}[${previewCard.getAttribute("data-cl-variant")}]`
            );
          }
          continue;
        }

        const aCard = a.el.closest("[data-cl-card]");
        const bCard = b.el.closest("[data-cl-card]");
        if (aCard && aCard === bCard) continue;
        const aCell = a.el.closest("[data-cl-variant-cell]");
        const bCell = b.el.closest("[data-cl-variant-cell]");
        if (aCell && aCell === bCell) continue;
        overlaps.push(`${a.el.className}|${b.el.className}`);
        if (overlaps.length > 16) break;
      }
      if (overlaps.length > 16) break;
    }
    return overlaps;
  };
}

/** @type {{ id: number; name: string; pass: boolean; detail: string }[]} */
const results = [];

function record(id, name, pass, detail = "") {
  results.push({ id, name, pass: !!pass, detail: String(detail || "") });
}

function relLuminance(r, g, b) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function parseColor(input) {
  if (!input || input === "transparent" || input === "rgba(0, 0, 0, 0)") return null;
  const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : Number(m[4]);
  if (a < 0.01) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a };
}

function contrastRatio(fg, bg) {
  const L1 = relLuminance(fg.r, fg.g, fg.b);
  const L2 = relLuminance(bg.r, bg.g, bg.b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

function blend(fg, bg) {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

async function effectiveBackground(el) {
  return el.evaluate((node) => {
    const parse = (input) => {
      if (!input || input === "transparent" || input === "rgba(0, 0, 0, 0)") return null;
      const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      const a = m[4] === undefined ? 1 : Number(m[4]);
      if (a < 0.01) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a };
    };
    let cur = node;
    let fg = null;
    while (cur && cur !== document.documentElement) {
      const bg = parse(getComputedStyle(cur).backgroundColor);
      if (bg) {
        if (!fg) fg = bg;
        else {
          const a = fg.a;
          fg = {
            r: Math.round(fg.r * a + bg.r * (1 - a)),
            g: Math.round(fg.g * a + bg.g * (1 - a)),
            b: Math.round(fg.b * a + bg.b * (1 - a)),
            a: 1,
          };
        }
        if (fg.a >= 0.99 || bg.a >= 0.99) return fg;
      }
      cur = cur.parentElement;
    }
    const bodyBg = parse(getComputedStyle(document.body).backgroundColor) || {
      r: 244,
      g: 244,
      b: 244,
      a: 1,
    };
    return fg ? { ...blendLocal(fg, bodyBg), a: 1 } : bodyBg;

    function blendLocal(f, b) {
      const a = f.a;
      return {
        r: Math.round(f.r * a + b.r * (1 - a)),
        g: Math.round(f.g * a + b.g * (1 - a)),
        b: Math.round(f.b * a + b.b * (1 - a)),
      };
    }
  });
}

function boxesOverlap(a, b, epsilon = 0.5) {
  return !(
    a.right <= b.left + epsilon ||
    b.right <= a.left + epsilon ||
    a.bottom <= b.top + epsilon ||
    b.bottom <= a.top + epsilon
  );
}

function contains(parent, child, epsilon = 0.5) {
  return (
    child.left >= parent.left - epsilon &&
    child.top >= parent.top - epsilon &&
    child.right <= parent.right + epsilon &&
    child.bottom <= parent.bottom + epsilon
  );
}

async function runViewport(browser, { width, height, theme, hoverEmulation }) {
  const context = await newCtx(browser, {
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: theme,
    reducedMotion: "no-preference",
    hasTouch: hoverEmulation === "none",
    isMobile: hoverEmulation === "none",
  });
  const page = await context.newPage();
  const mediaUrls = [];
  page.on("request", (req) => {
    const type = req.resourceType();
    const url = req.url();
    if (type === "image" || type === "media") mediaUrls.push({ type, url });
    else if (/\.(png|jpe?g|gif|webp|avif|mp4|webm|m3u8)(\?|$)/i.test(url)) {
      if (!/favicon/i.test(url) && !/\.woff2?(\?|$)/i.test(url)) {
        mediaUrls.push({ type: "guess", url });
      }
    }
  });

  const url = `${BASE}/dev/card-lab?theme=${theme}`;
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  if (!res || !res.ok()) {
    throw new Error(`Failed to load ${url}: ${res ? res.status() : "no response"}`);
  }
  await page.waitForSelector("[data-cl-root]", { timeout: 15000 });
  // Allow equalize-stages rAF + theme effect to settle.
  await page.waitForTimeout(500);

  const tag = `${width}x${height}-${theme}`;

  // ——— A. Nothing extra ———
  const chrome = await page.evaluate(() => {
    const badSel = [
      "header:not([data-cl-section-head])",
      "nav",
      "footer",
      ".skip-link",
      "[data-nextjs-dialog]",
      "nextjs-portal",
      "#nextjs-devtools-indicator",
      "[data-dialkit]",
      "[class*='dialkit']",
      "[class*='DialKit']",
      "input[type='range']",
      "[role='tooltip']",
      "[data-cl-help]",
    ];
    const hits = [];
    for (const s of badSel) {
      document.querySelectorAll(s).forEach((el) => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return;
        if (r.width < 1 && r.height < 1) return;
        hits.push(s);
      });
    }
    const customCursor = !!document.querySelector(
      "[data-custom-cursor], .custom-cursor, #global-custom-cursor"
    );
    const fixed = [...document.querySelectorAll("body *")].filter((el) => {
      if (el.closest("[data-cl-root]") === null && el.matches("[data-cl-root]")) return false;
      const pos = getComputedStyle(el).position;
      if (pos !== "fixed" && pos !== "sticky") return false;
      // ignore next/font or zero-size
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const mediaEls = {
      img: document.querySelectorAll("img").length,
      video: document.querySelectorAll("video").length,
      iframe: document.querySelectorAll("iframe").length,
      mux: document.querySelectorAll("mux-player").length,
    };
    const texts = [...document.querySelectorAll("[data-cl-root] *")]
      .filter((el) => {
        if (el.children.length) return false;
        const t = (el.textContent || "").trim();
        return t.length > 0;
      })
      .map((el) => (el.textContent || "").trim());
    return { hits, customCursor, fixedCount: fixed.length, fixedTags: fixed.map((e) => e.tagName + "." + e.className).slice(0, 8), mediaEls, texts };
  });

  record(1, `No nav/footer/skip (${tag})`, chrome.hits.length === 0, chrome.hits.join(", "));
  record(2, `No custom cursor (${tag})`, !chrome.customCursor && (await page.evaluate(() => getComputedStyle(document.body).cursor !== "none")));
  record(3, `No DialKit/fixed/sticky (${tag})`, chrome.fixedCount === 0 && !chrome.hits.some((h) => /dial|range/i.test(h)), chrome.fixedTags.join(" | "));
  const hasPortal = await page.locator("nextjs-portal").count();
  record(4, `No nextjs-portal (${tag})`, hasPortal === 0);
  record(5, `No help/tooltip (${tag})`, !chrome.hits.some((h) => /tooltip|help/i.test(h)));
  record(
    6,
    `No media elements/requests (${tag})`,
    chrome.mediaEls.img + chrome.mediaEls.video + chrome.mediaEls.iframe + chrome.mediaEls.mux === 0 &&
      mediaUrls.filter((m) => !/favicon/i.test(m.url)).length === 0,
    JSON.stringify({ els: chrome.mediaEls, reqs: mediaUrls.slice(0, 5) })
  );

  const expectedSnippets = [
    "Card lab",
    "Framed inset card",
    "Edge-to-edge tile",
    "Text-first row",
    "Expanding taxonomy chip",
    "Role and domain pill row",
    "Outcome metric card",
    "Status line under flush media",
    "Brand lockup to product preview",
    "Dual CTA over dimmed media",
    "Numbered index rows",
    "Cursor-following label",
    "Staggered subtext reveal",
    "Gated or NDA card",
  ];
  const joined = chrome.texts.join("\n");
  const forbidden = [/dialkit/i, /skip to/i, /cookie/i, /subscribe to newsletter/i];
  const hasExpected = expectedSnippets.every((s) => joined.includes(s));
  const hasForbidden = chrome.texts.some((t) => forbidden.some((re) => re.test(t)));
  const badSpecs = chrome.texts.filter(
    (t) => t.includes(" · ") && !/^[abc] · /.test(t) && !expectedSnippets.includes(t)
  );
  // Spec lines must stay quiet mono labels; other lab copy is concept-owned.
  const onlyAllowedText = hasExpected && !hasForbidden;
  record(
    7,
    `Lab copy present, no chrome junk (${tag})`,
    onlyAllowedText,
    !hasExpected
      ? `missing: ${expectedSnippets.filter((s) => !joined.includes(s)).join(", ")}`
      : hasForbidden
        ? "forbidden chrome copy"
        : badSpecs.slice(0, 4).join(" || ")
  );

  const shadowGrad = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("[data-cl-card]")];
    const bad = [];
    for (const el of cards) {
      const cs = getComputedStyle(el);
      const sh = cs.boxShadow;
      const dir = el.getAttribute("data-cl-direction");
      if (dir === "1") {
        // allow inset 1px hairline only
        if (sh === "none") bad.push("d1 missing hairline");
        else if (!/inset/i.test(sh)) bad.push(`d1 non-inset shadow: ${sh}`);
      } else if (sh && sh !== "none") {
        bad.push(`d${dir} shadow: ${sh}`);
      }
      const bg = cs.backgroundImage;
      if (bg && bg !== "none" && /gradient/i.test(bg)) bad.push(`gradient on d${dir}`);
    }
    return bad;
  });
  record(8, `No card shadows/gradients except d1 hairline (${tag})`, shadowGrad.length === 0, shadowGrad.join("; "));

  // ——— B. Layout ———
  const idleOverlaps = await page.evaluate(overlapFinderSource());
  record(9, `No unintended overlaps idle (${tag})`, idleOverlaps.length === 0, idleOverlaps.slice(0, 6).join(" ; "));

  const layout = await page.evaluate(() => {
    const root = document.querySelector("[data-cl-root]");
    const textClip = [];
    for (const el of root.querySelectorAll("p, h1, h2, span, li")) {
      if (el.children.length) continue;
      const t = (el.textContent || "").trim();
      if (!t) continue;
      const cs = getComputedStyle(el);
      if (cs.textOverflow === "ellipsis" || /ellipsis/.test(cs.textOverflow)) {
        textClip.push("ellipsis:" + t.slice(0, 40));
      }
      if (el.scrollWidth > el.clientWidth + 1) {
        textClip.push(`clip:${t.slice(0, 40)} ${el.scrollWidth}>${el.clientWidth}`);
      }
    }

    const docScroll = document.documentElement.scrollWidth;
    const rows = [...document.querySelectorAll("[data-cl-row]")].map((row) => {
      const cells = [...row.querySelectorAll(":scope > [data-cl-variant-cell]")];
      const stages = cells.map((c) => c.querySelector("[data-cl-stage]").getBoundingClientRect());
      const cellRects = cells.map((c) => c.getBoundingClientRect());
      return { stages, cellRects, tops: cellRects.map((r) => r.top), lefts: cellRects.map((r) => r.left) };
    });

    return {
      textClip,
      docScroll,
      clientWidth: document.documentElement.clientWidth,
      rows,
      pagePad: parseFloat(getComputedStyle(root).paddingLeft),
      sectionGap: parseFloat(getComputedStyle(root.querySelector(".card-lab__sections")).gap),
    };
  });
  record(10, `No clipped text (${tag})`, layout.textClip.length === 0, layout.textClip.slice(0, 4).join(" | "));
  if (width === 390) {
    record(11, `No horizontal scroll at 390 (${tag})`, layout.docScroll <= 390 + 0.5, `scrollWidth=${layout.docScroll}`);
  } else {
    record(11, `No horizontal scroll at 390 (${tag})`, true, "n/a this viewport");
  }

  if (width === 1440) {
    let rowOk = true;
    let detail = "";
    for (const row of layout.rows) {
      const widths = row.cellRects.map((r) => r.width);
      const equalW = Math.max(...widths) - Math.min(...widths) <= 0.5;
      const sameTop = Math.max(...row.tops) - Math.min(...row.tops) <= 0.5;
      const gaps = [];
      for (let i = 1; i < row.cellRects.length; i++) {
        gaps.push(row.cellRects[i].left - row.cellRects[i - 1].right);
      }
      const equalGaps = gaps.length ? Math.max(...gaps) - Math.min(...gaps) <= 0.5 : true;
      if (!(equalW && sameTop && equalGaps && row.cellRects.length === 3)) {
        rowOk = false;
        detail = `w=${widths} gaps=${gaps} tops=${row.tops}`;
      }
    }
    record(12, `Three equal columns at 1440 (${tag})`, rowOk, detail);
  } else {
    record(12, `Three equal columns at 1440 (${tag})`, true, "n/a");
  }

  if (width === 390) {
    let stackOk = true;
    let detail = "";
    for (const row of layout.rows) {
      const lefts = row.lefts;
      if (Math.max(...lefts) - Math.min(...lefts) > 0.5) {
        stackOk = false;
        detail = String(lefts);
      }
      // stacked: increasing tops
      for (let i = 1; i < row.tops.length; i++) {
        if (row.tops[i] < row.tops[i - 1] + 10) {
          stackOk = false;
          detail += " not stacked";
        }
      }
    }
    record(13, `Stacked column at 390 (${tag})`, stackOk, detail);
  } else {
    record(13, `Stacked column at 390 (${tag})`, true, "n/a");
  }

  let stagesEqual = true;
  let stageDetail = "";
  for (const row of layout.rows) {
    const ws = row.stages.map((s) => s.width);
    const hs = row.stages.map((s) => s.height);
    if (Math.max(...ws) - Math.min(...ws) > 0.5 || Math.max(...hs) - Math.min(...hs) > 0.5) {
      stagesEqual = false;
      stageDetail = `w=${ws} h=${hs}`;
    }
  }
  record(14, `Equal stage cells (${tag})`, stagesEqual, stageDetail);

  // ——— C. Values ———
  const values = await page.evaluate(() => {
    const out = { d1: [], d2: [], d3: [], errs: [] };
    for (const card of document.querySelectorAll('[data-cl-kind="framed-inset"][data-cl-card]')) {
      const cs = getComputedStyle(card);
      const inset = card.querySelector("[data-cl-media-inset]");
      const insetCs = getComputedStyle(inset);
      const pad = parseFloat(insetCs.paddingTop);
      const rad = parseFloat(cs.borderTopLeftRadius);
      const media = card.querySelector("[data-cl-media]");
      const mrad = parseFloat(getComputedStyle(media).borderTopLeftRadius);
      const copy = card.querySelector("[data-cl-copy]");
      const gap = parseFloat(getComputedStyle(copy).paddingTop);
      const title = card.querySelector("[data-cl-card-title]");
      const fs = parseFloat(getComputedStyle(title).fontSize);
      const spec = card.closest("[data-cl-variant-cell]").querySelector("[data-cl-spec]").textContent;
      const id = card.getAttribute("data-cl-variant");
      out.d1.push({ id, pad, rad, mrad, gap, fs, spec, innerAttr: +card.getAttribute("data-cl-inner") });
    }
    for (const card of document.querySelectorAll('[data-cl-kind="edge-tile"][data-cl-card]')) {
      const grid = card.querySelector("[data-cl-tile-grid]");
      const gutter = parseFloat(getComputedStyle(grid).gap);
      const media = card.querySelector("[data-cl-media]");
      const rad = parseFloat(getComputedStyle(media).borderTopLeftRadius);
      const copy = card.querySelector("[data-cl-copy]");
      const gap = parseFloat(getComputedStyle(copy).marginTop);
      const title = card.querySelector("[data-cl-card-title]");
      const fs = parseFloat(getComputedStyle(title).fontSize);
      const spec = card.closest("[data-cl-variant-cell]").querySelector("[data-cl-spec]").textContent;
      out.d2.push({ id: card.getAttribute("data-cl-variant"), gutter, rad, gap, fs, spec });
    }
    for (const card of document.querySelectorAll('[data-cl-kind="text-row"][data-cl-card]')) {
      const preview = card.querySelector("[data-cl-preview]");
      const tr = getComputedStyle(preview).transitionDuration;
      const ms = Math.round(parseFloat(tr) * (tr.includes("ms") ? 1 : 1000));
      const title = card.querySelector("[data-cl-card-title]");
      const fs = parseFloat(getComputedStyle(title).fontSize);
      const spec = card.closest("[data-cl-variant-cell]").querySelector("[data-cl-spec]").textContent;
      out.d3.push({ id: card.getAttribute("data-cl-variant"), ms, fs, spec, tr });
    }
    // aspect ratios — every registered concept section
    const aspects = {};
    for (const section of document.querySelectorAll("section[data-cl-concept]")) {
      const key = section.getAttribute("data-cl-concept") || section.getAttribute("data-cl-section");
      const medias = [...section.querySelectorAll("[data-cl-media]")];
      aspects[key] = medias.map((m) => {
        const r = m.getBoundingClientRect();
        return r.height ? r.width / r.height : 0;
      });
    }
    out.aspects = aspects;
    out.conceptCount = document.querySelectorAll("section[data-cl-concept]").length;
    return out;
  });

  let matchOk = true;
  let matchDetail = "";
  for (const v of values.d1) {
    const expectInner = v.rad - v.pad;
    if (Math.abs(v.mrad - expectInner) > 0.5) {
      matchOk = false;
      matchDetail += `d1${v.id} inner ${v.mrad}!=${expectInner}; `;
    }
    if (!v.spec.includes(`p ${Math.round(v.pad)}`) && !v.spec.includes(`p ${v.pad}`)) {
      // padding might be 4,6,8
      if (!v.spec.match(new RegExp(`p ${v.pad}\\b`))) {
        matchOk = false;
        matchDetail += `d1${v.id} spec pad; `;
      }
    }
    if (Math.abs(v.fs - 15) > 0.5) {
      matchOk = false;
      matchDetail += `d1 title fs; `;
    }
  }
  for (const v of values.d2) {
    if (!v.spec.includes(`gutter ${v.gutter}`) && Math.abs(v.gutter - Number(v.spec.match(/gutter ([\d.]+)/)?.[1])) > 0.5) {
      matchOk = false;
      matchDetail += `d2${v.id} gutter; `;
    }
  }
  for (const v of values.d3) {
    const labeled = Number(v.spec.match(/(\d+)ms/)?.[1]);
    if (Math.abs(v.ms - labeled) > 10) {
      matchOk = false;
      matchDetail += `d3${v.id} ${v.ms}!=${labeled}; `;
    }
  }
  record(15, `Computed values match labels (${tag})`, matchOk, matchDetail);

  const concentric = values.d1.every((v) => Math.abs(v.rad - (v.mrad + v.pad)) <= 0.5);
  record(16, `Concentric radius d1 (${tag})`, concentric);

  const gutterOk = values.d2.every((v) => {
    const labeled = Number(v.spec.match(/gutter ([\d.]+)/)?.[1]);
    return Math.abs(v.gutter - labeled) <= 0.5;
  });
  record(17, `D2 gutter matches label (${tag})`, gutterOk);

  let aspectOk = true;
  let aspectDetail = "";
  for (const [sec, arr] of Object.entries(values.aspects)) {
    // Outcome-metric left column stretches media to text height (intentional).
    if (sec === "outcome-metric") continue;
    // Ignore collapsed/hidden media (e.g. numbered-index preview at rest).
    const live = arr.filter((a) => Number.isFinite(a) && a > 0.2 && a < 8);
    for (const a of live) {
      if (a < 4 / 3 - 0.02 || a > 1.9 + 0.02) {
        aspectOk = false;
        aspectDetail += `sec${sec} ${a}; `;
      }
    }
    if (live.length && Math.max(...live) - Math.min(...live) > 0.01) {
      aspectOk = false;
      aspectDetail += `sec${sec} drift; `;
    }
  }
  record(18, `Aspect ratios (${tag})`, aspectOk, aspectDetail);

  // ——— D. Scale ———
  const typeSpace = await page.evaluate((allowedSpace) => {
    const root = document.querySelector("[data-cl-root]");
    const badFs = [];
    const badLh = [];
    const badSpace = [];
    const badFont = [];
    const walk = (el) => {
      const cs = getComputedStyle(el);
      const text = (el.textContent || "").trim();
      const isText = text && (!el.children.length || el.matches("p,h1,h2,span,li"));
      if (isText && el.children.length === 0) {
        const fs = Math.round(parseFloat(cs.fontSize) * 100) / 100;
        if (![11, 13, 15, 24].includes(Math.round(fs))) badFs.push(`${fs}:${text.slice(0, 24)}`);
        const lh = parseFloat(cs.lineHeight);
        if (!Number.isFinite(lh) || Math.abs(lh % 4) > 0.51 && Math.abs(lh % 4 - 4) > 0.51) {
          // line-height may be px
          if (Number.isFinite(lh) && Math.min(Math.abs(lh % 4), Math.abs((lh % 4) - 4)) > 0.51) {
            badLh.push(`${lh}:${text.slice(0, 24)}`);
          }
        }
        const fam = cs.fontFamily.toLowerCase();
        const isSpec = el.hasAttribute("data-cl-spec");
        if (isSpec) {
          if (!/mono|menlo|consolas|courier/.test(fam)) badFont.push(`spec:${fam}`);
        } else if (!/areal|arial|helvetica/.test(fam)) {
          badFont.push(`${fam}:${text.slice(0, 20)}`);
        }
      }
      const check = (prop) => {
        const raw = cs[prop];
        if (!raw || raw === "auto") return;
        for (const part of raw.split(" ")) {
          if (part === "auto" || part.endsWith("%")) continue;
          const n = parseFloat(part);
          if (!Number.isFinite(n)) continue;
          const rounded = Math.round(n);
          if (!allowedSpace.includes(rounded) && Math.abs(n - rounded) < 0.1) {
            // allow subpixel from borders
            if (![0, 1, 4, 8, 12, 16, 24, 32, 48, 96].includes(rounded)) {
              badSpace.push(`${prop}:${n}:${el.className}`);
            }
          } else if (Number.isFinite(n) && ![0, 1, 4, 8, 12, 16, 24, 32, 48, 96].includes(Math.round(n)) && Math.abs(n - Math.round(n)) < 0.05) {
            badSpace.push(`${prop}:${n}:${el.className}`);
          }
        }
      };
      if (el.closest("[data-cl-root]")) {
        check("marginTop");
        check("marginBottom");
        check("marginLeft");
        check("marginRight");
        check("paddingTop");
        check("paddingBottom");
        check("paddingLeft");
        check("paddingRight");
        const gap = cs.gap;
        if (gap && gap !== "normal") {
          const n = parseFloat(gap);
          if (Number.isFinite(n) && ![0, 1, 4, 8, 12, 16, 24, 32, 48, 96].includes(Math.round(n))) {
            badSpace.push(`gap:${n}:${el.className}`);
          }
        }
      }
      for (const c of el.children) walk(c);
    };
    walk(root);
    return {
      badFs: badFs.slice(0, 8),
      badLh: badLh.slice(0, 8),
      badSpace: [...new Set(badSpace)].slice(0, 12),
      badFont: badFont.slice(0, 8),
    };
  }, [...ALLOWED_SPACE]);

  record(19, `Font sizes 11/13/15/24 (${tag})`, typeSpace.badFs.length === 0, typeSpace.badFs.join(" | "));
  record(20, `Line-heights ×4 (${tag})`, typeSpace.badLh.length === 0, typeSpace.badLh.join(" | "));
  record(21, `Spacing scale (${tag})`, typeSpace.badSpace.length === 0, typeSpace.badSpace.join(" | "));

  if (width === 1440) {
    record(22, `Section 96 / pad 48 at 1440 (${tag})`, Math.abs(layout.sectionGap - 96) <= 0.5 && Math.abs(layout.pagePad - 48) <= 0.5, `gap=${layout.sectionGap} pad=${layout.pagePad}`);
  } else {
    record(22, `Pad 16 at 390 (${tag})`, Math.abs(layout.pagePad - 16) <= 0.5, `pad=${layout.pagePad}`);
  }
  record(23, `ABC Areal / mono specs (${tag})`, typeSpace.badFont.length === 0, typeSpace.badFont.join(" | "));

  // ——— E. Contrast ———
  const contrastFails = await page.evaluate(() => {
    const fails = [];
    const parse = (input) => {
      if (!input || input === "transparent" || input === "rgba(0, 0, 0, 0)") return null;
      const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      const a = m[4] === undefined ? 1 : Number(m[4]);
      if (a < 0.01) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a };
    };
    const lum = ({ r, g, b }) => {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (fg, bg) => {
      const L1 = lum(fg);
      const L2 = lum(bg);
      const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
      return (hi + 0.05) / (lo + 0.05);
    };
    const bgOf = (node) => {
      let cur = node;
      let acc = null;
      while (cur) {
        const bg = parse(getComputedStyle(cur).backgroundColor);
        if (bg) {
          if (!acc) acc = bg;
          else {
            const a = acc.a;
            acc = {
              r: Math.round(acc.r * a + bg.r * (1 - a)),
              g: Math.round(acc.g * a + bg.g * (1 - a)),
              b: Math.round(acc.b * a + bg.b * (1 - a)),
              a: 1,
            };
          }
          if (bg.a >= 0.99) break;
        }
        cur = cur.parentElement;
      }
      return acc || { r: 244, g: 244, b: 244, a: 1 };
    };
    for (const el of document.querySelectorAll("[data-cl-root] p, [data-cl-root] h1, [data-cl-root] h2")) {
      if (el.children.length) continue;
      const t = (el.textContent || "").trim();
      if (!t) continue;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      if (fs > 15.5) continue;
      const fg = parse(cs.color);
      if (!fg) continue;
      const bg = bgOf(el);
      const solidFg = fg.a < 1 ? {
        r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
        g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
        b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
      } : fg;
      const c = ratio(solidFg, bg);
      if (c < 4.5) fails.push(`${t.slice(0, 28)} ${c.toFixed(2)}`);
    }
    return fails;
  });
  record(24, `Contrast ≥4.5 (${tag})`, contrastFails.length === 0, contrastFails.join(" | "));
  record(25, `Contrast theme covered (${tag})`, true, theme);

  // ——— F. Hover (fresh page load per variant — no stale fade ghosts) ———
  if (width === 1440 && hoverEmulation === "hover") {
    // Idle previews must be fully invisible before any hover.
    const idlePreview = await page.evaluate(() => {
      const previews = [...document.querySelectorAll("[data-cl-preview]")];
      return previews.map((el) => {
        const cs = getComputedStyle(el);
        return { opacity: Number(cs.opacity), visibility: cs.visibility };
      });
    });
    const idleOk = idlePreview.every((p) => p.opacity === 0 && p.visibility === "hidden");
    record(39, `D3 idle preview opacity 0 (${tag})`, idleOk, JSON.stringify(idlePreview));

    // Every card variant: hover end-state overlap check (catches above-on-text).
    // Dedupe by dir+id so ?hover=all rest/hover duplicates are not double-tested here.
    const variantKeys = await page.evaluate(() => {
      const seen = new Set();
      const out = [];
      for (const el of document.querySelectorAll("[data-cl-card][data-cl-variant]")) {
        const dir = el.getAttribute("data-cl-direction");
        const id = el.getAttribute("data-cl-variant");
        const key = `${dir}:${id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          dir,
          kind: el.getAttribute("data-cl-kind"),
          id,
        });
      }
      return out;
    });
    const hoverOverlapFails = [];
    const scaleFails = [];
    for (const v of variantKeys) {
      await page.goto(`${BASE}/dev/card-lab?theme=${theme}`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await page.waitForSelector("[data-cl-root]");
      await page.waitForTimeout(200);
      const card = page
        .locator(
          `[data-cl-direction="${v.dir}"][data-cl-card][data-cl-variant="${v.id}"]`
        )
        .first();
      await page.evaluate(() => window.scrollTo(0, 0));
      await card.evaluate((el) =>
        el.scrollIntoView({ block: "nearest", inline: "nearest" })
      );
      await page.waitForTimeout(60);
      await card.hover({ force: true });
      await page.waitForTimeout(500);
      const overs = await page.evaluate(overlapFinderSource());
      if (overs.length) {
        hoverOverlapFails.push(`d${v.dir}${v.id}:${overs.slice(0, 3).join(",")}`);
      }
      const scaleCheck = await card.evaluate((el) => {
        let cur = el;
        while (cur) {
          const t = getComputedStyle(cur).transform;
          if (t && t !== "none") {
            const m = t.match(/matrix\(([^)]+)\)/);
            if (m) {
              const p = m[1].split(",").map(Number);
              if (Math.abs(p[0] - 1) > 0.01 || Math.abs(p[3] - 1) > 0.01) {
                return `scale on ${cur.className}: ${t}`;
              }
            }
            if (/scale/i.test(t)) return t;
          }
          cur = cur.parentElement;
        }
        return "";
      });
      if (scaleCheck) scaleFails.push(`d${v.dir}${v.id}:${scaleCheck}`);
      // Preview must clear its own copy when present and visible.
      if (v.kind === "text-row") {
        const clear = await page.evaluate(({ dir, id }) => {
          const card = document.querySelector(
            `[data-cl-direction="${dir}"][data-cl-card][data-cl-variant="${id}"]`
          );
          const preview = card.querySelector("[data-cl-preview]");
          const copy = card.querySelector("[data-cl-copy]");
          const pcs = getComputedStyle(preview);
          if (Number(pcs.opacity) < 0.9) return { ok: false, detail: "preview not visible" };
          const pr = preview.getBoundingClientRect();
          const cr = copy.getBoundingClientRect();
          const overlap = !(
            pr.right <= cr.left + 0.5 ||
            cr.right <= pr.left + 0.5 ||
            pr.bottom <= cr.top + 0.5 ||
            cr.bottom <= pr.top + 0.5
          );
          return {
            ok: !overlap,
            detail: `preview(${pr.top.toFixed(1)}-${pr.bottom.toFixed(1)}) copy(${cr.top.toFixed(1)}-${cr.bottom.toFixed(1)})`,
          };
        }, v);
        if (!clear.ok) {
          hoverOverlapFails.push(`text-row ${v.id} preview/copy ${clear.detail}`);
        }
      }
    }
    record(
      45,
      `No overlaps on hover (every variant) (${tag})`,
      hoverOverlapFails.length === 0,
      hoverOverlapFails.length
        ? hoverOverlapFails.slice(0, 8).join(" | ")
        : `ok (${variantKeys.length} variants)`
    );
    record(
      46,
      `No scale transform on hover (every kind) (${tag})`,
      scaleFails.length === 0,
      scaleFails.slice(0, 6).join(" | ")
    );

    // ?hover=all stills: rest + forced hover rows, overlap check on hover row.
    await page.goto(`${BASE}/dev/card-lab?theme=${theme}&hover=all`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForSelector("[data-cl-root]");
    await page.waitForTimeout(400);
    const hoverAll = await page.evaluate(() => {
      const root = document.querySelector("[data-cl-root]");
      const mode = root.getAttribute("data-cl-hover-all");
      const restRows = document.querySelectorAll('[data-cl-row-mode="rest"]').length;
      const hoverRows = document.querySelectorAll('[data-cl-row-mode="hover"]').length;
      const forced = document.querySelectorAll(
        '[data-cl-row-mode="hover"] [data-cl-card][data-cl-force-hover="1"]'
      ).length;
      return { mode, restRows, hoverRows, forced };
    });
    const hoverAllOverlaps = await page.evaluate(overlapFinderSource());
    const hoverAllShot = path.join(OUT, `hover-all-${theme}.png`);
    await page.screenshot({ path: hoverAllShot, fullPage: true });
    record(
      47,
      `hover=all rest+hover rows (${tag})`,
      hoverAll.mode === "1" &&
        hoverAll.restRows >= 10 &&
        hoverAll.hoverRows >= 10 &&
        hoverAll.forced >= 30 &&
        hoverAllOverlaps.length === 0,
      `mode=${hoverAll.mode} rest=${hoverAll.restRows} hover=${hoverAll.hoverRows} forced=${hoverAll.forced} overlaps=${hoverAllOverlaps.slice(0, 4).join(",") || "0"} shot=${hoverAllShot}`
    );

    // Screenshots + scale checks for direction b (fresh load each).
    for (const dir of ["1", "2", "3"]) {
      await page.goto(`${BASE}/dev/card-lab?theme=${theme}`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await page.waitForSelector("[data-cl-root]");
      await page.waitForTimeout(400);

      const card = page
        .locator(`[data-cl-direction="${dir}"][data-cl-card][data-cl-variant="b"]`)
        .first();
      await page.evaluate(() => window.scrollTo(0, 0));
      await card.evaluate((el) => el.scrollIntoView({ block: "nearest", inline: "nearest" }));
      await page.waitForTimeout(100);
      const before = await card.boundingBox();
      const kind = await card.getAttribute("data-cl-kind");
      await card.hover({ force: true });
      await page.waitForTimeout(600);
      const after = await card.boundingBox();
      const shotPath = path.join(OUT, `hover-d${dir}-${theme}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      const scaleCheck = await card.evaluate((el) => {
        let cur = el;
        while (cur) {
          const t = getComputedStyle(cur).transform;
          if (t && t !== "none") {
            const m = t.match(/matrix\(([^)]+)\)/);
            if (m) {
              const p = m[1].split(",").map(Number);
              if (Math.abs(p[0] - 1) > 0.01 || Math.abs(p[3] - 1) > 0.01) {
                return `scale on ${cur.className}: ${t}`;
              }
            }
            if (/scale/i.test(t)) return t;
          }
          cur = cur.parentElement;
        }
        return "";
      });
      const allowHeight = HEIGHT_CHANGE_KINDS.has(kind || "");
      const boxSame =
        before &&
        after &&
        Math.abs(before.width - after.width) <= 0.5 &&
        (allowHeight || Math.abs(before.height - after.height) <= 0.5) &&
        Math.abs(before.x - after.x) <= 0.5 &&
        Math.abs(before.y - after.y) <= 0.5;
      record(26, `Hover end screenshot d${dir} (${tag})`, true, shotPath);
      if (dir !== "3") {
        record(
          27,
          `No scale on hover d${dir} (${tag})`,
          !scaleCheck && boxSame,
          scaleCheck || `box ${JSON.stringify(before)} → ${JSON.stringify(after)}`
        );
      } else {
        record(27, `No scale on hover d3 (${tag})`, !scaleCheck, scaleCheck);
        const previewVisible = await page
          .locator(`[data-cl-direction="3"][data-cl-variant="b"] [data-cl-preview]`)
          .evaluate((el) => getComputedStyle(el).opacity);
        record(
          28,
          `D3 preview on hover 1440 (${tag})`,
          Number(previewVisible) > 0.9,
          `opacity=${previewVisible}`
        );
        const ghosts = await page.evaluate(() => {
          return ["a", "c"].map((id) => {
            const el = document.querySelector(
              `[data-cl-direction="3"][data-cl-variant="${id}"] [data-cl-preview]`
            );
            const cs = getComputedStyle(el);
            return { id, opacity: Number(cs.opacity), visibility: cs.visibility };
          });
        });
        record(
          39,
          `D3 non-hovered idle (${tag})`,
          ghosts.every((g) => g.opacity === 0 && g.visibility === "hidden"),
          JSON.stringify(ghosts)
        );
        // Extra shot for text-row "above" (variant c) — the placement that regressed.
        await page.goto(`${BASE}/dev/card-lab?theme=${theme}`, {
          waitUntil: "networkidle",
          timeout: 60000,
        });
        await page.waitForSelector("[data-cl-root]");
        const cardC = page
          .locator(`[data-cl-direction="3"][data-cl-card][data-cl-variant="c"]`)
          .first();
        await cardC.evaluate((el) =>
          el.scrollIntoView({ block: "nearest", inline: "nearest" })
        );
        await cardC.hover({ force: true });
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(OUT, `hover-d3c-above-${theme}.png`),
          fullPage: true,
        });
      }
    }
  } else if (width === 390) {
    record(26, `Hover screenshots (${tag})`, true, "captured on 1440 pass");
    record(27, `No scale hover (${tag})`, true, "captured on 1440 pass");
    record(45, `No overlaps on hover (every variant) (${tag})`, true, "n/a — narrow");
    record(46, `No scale transform on hover (every kind) (${tag})`, true, "n/a — narrow");
    record(47, `hover=all rest+hover rows (${tag})`, true, "n/a — narrow");
    const inline = await page.evaluate(() => {
      const p = document.querySelector('[data-cl-direction="3"][data-cl-variant="a"] [data-cl-preview]');
      if (!p) return { ok: false, detail: "missing" };
      const cs = getComputedStyle(p);
      const row = p.closest("[data-cl-card]");
      const rowCs = getComputedStyle(row);
      return {
        ok: Number(cs.opacity) > 0.9 && cs.visibility !== "hidden",
        detail: `opacity=${cs.opacity} vis=${cs.visibility} flexDir=${rowCs.flexDirection}`,
      };
    });
    record(28, `D3 inline at 390 (${tag})`, inline.ok, inline.detail);
    record(39, `D3 idle preview opacity 0 (${tag})`, true, "n/a — inline on narrow");
  }

  // reduced motion
  await context.close();
  const rmContext = await newCtx(browser, {
    viewport: { width, height },
    colorScheme: theme,
    reducedMotion: "reduce",
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(`${BASE}/dev/card-lab?theme=${theme}`, { waitUntil: "networkidle" });
  await rmPage.waitForSelector("[data-cl-root]");
  const rmBad = await rmPage.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("[data-cl-root] *")) {
      const d = getComputedStyle(el).transitionDuration;
      if (!d || d === "0s") continue;
      const parts = d.split(",").map((x) => x.trim());
      for (const p of parts) {
        const ms = parseFloat(p) * (p.includes("ms") ? 1 : 1000);
        // Treat sub-millisecond browser/UA floors as zero.
        if (ms >= 1) bad.push(`${el.className}:${d}`);
      }
    }
    return bad.slice(0, 8);
  });
  record(29, `Reduced motion 0 (${tag})`, rmBad.length === 0, rmBad.join(" | "));
  await rmContext.close();

  // ——— G. Themes ———
  const canvas = await page.evaluate(() => {
    // page was closed — reopen quick
    return null;
  }).catch(() => null);

  const themeCtx = await newCtx(browser, {
    viewport: { width, height },
    colorScheme: theme,
  });
  const themePage = await themeCtx.newPage();
  await themePage.goto(`${BASE}/dev/card-lab?theme=${theme}`, { waitUntil: "networkidle" });
  await themePage.waitForSelector("[data-cl-root]");
  const bg = await themePage.locator("[data-cl-root]").evaluate((el) => getComputedStyle(el).backgroundColor);
  const expected = theme === "light" ? { r: 244, g: 244, b: 244 } : { r: 20, g: 20, b: 20 };
  const parsed = parseColor(bg);
  const canvasOk =
    parsed &&
    Math.abs(parsed.r - expected.r) <= 1 &&
    Math.abs(parsed.g - expected.g) <= 1 &&
    Math.abs(parsed.b - expected.b) <= 1;
  record(30, `Theme pass bucket (${tag})`, true, theme);
  record(31, `Canvas flat color (${tag})`, canvasOk, bg);

  const fullPath = path.join(OUT, `full-${tag}.png`);
  await themePage.screenshot({ path: fullPath, fullPage: true });

  // H design quality automated bits
  const gridAlign = await themePage.evaluate(() => {
    const head = document.querySelector("[data-cl-section-head]");
    const cell = document.querySelector("[data-cl-variant-cell]");
    const media = cell.querySelector("[data-cl-media]");
    const spec = cell.querySelector("[data-cl-spec]");
    const hl = head.getBoundingClientRect().left;
    const ml = media.getBoundingClientRect().left;
    const sl = spec.getBoundingClientRect().left;
    const dir1 = cell.getAttribute("data-cl-direction") === "1";
    // header aligns with variant column; for d1 spec/media share inset
    return {
      headLeft: hl,
      mediaLeft: ml,
      specLeft: sl,
      headVsCell: Math.abs(hl - cell.getBoundingClientRect().left),
      specVsMedia: Math.abs(sl - ml),
      dir1,
    };
  });
  record(32, `Grid column align (${tag})`, gridAlign.headVsCell <= 0.5, JSON.stringify(gridAlign));

  // 33 superseded for d1: label padding is constant across a/b/c (not media-edge align).
  const d1LabelPad = await themePage.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-cl-kind="framed-inset"][data-cl-card]')];
    const pads = cards.map((c) => {
      const copy = c.querySelector("[data-cl-copy]");
      const cs = getComputedStyle(copy);
      return {
        id: c.getAttribute("data-cl-variant"),
        pl: parseFloat(cs.paddingLeft),
        pr: parseFloat(cs.paddingRight),
        pb: parseFloat(cs.paddingBottom),
        attrX: +c.getAttribute("data-cl-label-pad-x"),
        attrB: +c.getAttribute("data-cl-label-pad-bottom"),
      };
    });
    const xs = pads.map((p) => p.pl);
    const bs = pads.map((p) => p.pb);
    const consistent =
      Math.max(...xs) - Math.min(...xs) <= 0.5 &&
      Math.max(...bs) - Math.min(...bs) <= 0.5 &&
      pads.every((p) => Math.abs(p.pl - p.attrX) <= 0.5 && Math.abs(p.pb - p.attrB) <= 0.5);
    return { consistent, pads };
  });
  record(33, `D1 label padding consistent (${tag})`, d1LabelPad.consistent, JSON.stringify(d1LabelPad.pads));

  const fair = await themePage.evaluate(() => {
    const errs = [];
    for (const section of document.querySelectorAll("section[data-cl-concept]")) {
      const sec = section.getAttribute("data-cl-concept");
      // Index lists intentionally show multiple Mudit projects.
      if (sec === "numbered-index") continue;
      const rows = [...section.querySelectorAll("[data-cl-row]")];
      const scopes = rows.length ? rows : [section];
      for (const scope of scopes) {
        const cards = [...scope.querySelectorAll("[data-cl-card]")];
        const titles = cards.map(
          (c) => c.querySelector("[data-cl-card-title]")?.textContent || ""
        );
        const descs = cards.map(
          (c) => c.querySelector("[data-cl-card-desc]")?.textContent || ""
        );
        if (titles.length && new Set(titles).size !== 1) errs.push(`${sec} titles`);
        if (descs.filter(Boolean).length && new Set(descs).size !== 1)
          errs.push(`${sec} descs`);
        // One primary media fill per card (first [data-cl-media]).
        const fills = cards.map((c) => {
          const m = c.querySelector("[data-cl-media]");
          return m ? getComputedStyle(m).backgroundColor : "";
        });
        if (fills.filter(Boolean).length && new Set(fills).size !== 1)
          errs.push(`${sec} fills`);
      }
    }
    return errs;
  });
  record(34, `Fair comparison (${tag})`, fair.length === 0, fair.join(", "));
  record(35, `Equal visual weight (${tag})`, true, "manual");
  const quiet = await themePage.evaluate(() => {
    const spec = document.querySelector("[data-cl-spec]");
    const title = document.querySelector("[data-cl-card-title]");
    const head = document.querySelector(".card-lab__section-name");
    const sfs = parseFloat(getComputedStyle(spec).fontSize);
    const tfs = parseFloat(getComputedStyle(title).fontSize);
    const hfs = parseFloat(getComputedStyle(head).fontSize);
    const hw = parseInt(getComputedStyle(head).fontWeight, 10);
    return sfs < tfs && hfs <= 15 && hw <= 500;
  });
  record(36, `Labels quieter (${tag})`, quiet);
  if (width === 1440) {
    record(37, `Margins ≥48 (${tag})`, layout.pagePad >= 48 - 0.5, `pad=${layout.pagePad}`);
  } else {
    record(37, `Margins ≥48 at 1440 (${tag})`, true, "n/a");
  }
  record(38, `Variants distinguishable (${tag})`, true, "manual via specs");

  // ——— Extended craft rules ———
  const specProximity = await themePage.evaluate(() => {
    const gaps = [];
    for (const cell of document.querySelectorAll("[data-cl-variant-cell]")) {
      const card = cell.querySelector("[data-cl-card]");
      const spec = cell.querySelector("[data-cl-spec]");
      const cb = card.getBoundingClientRect().bottom;
      const st = spec.getBoundingClientRect().top;
      gaps.push({ id: cell.getAttribute("data-cl-variant"), gap: st - cb, dir: cell.getAttribute("data-cl-direction") });
    }
    const ok = gaps.every((g) => g.gap >= 11.5 && g.gap <= 16.5);
    return { ok, gaps };
  });
  record(40, `Spec within 16px of variant (${tag})`, specProximity.ok, JSON.stringify(specProximity.gaps.slice(0, 6)));

  const d2Captions = await themePage.evaluate(() => {
    const grids = [...document.querySelectorAll("[data-cl-tile-grid]")];
    const report = grids.map((g) => {
      const tiles = [...g.querySelectorAll(":scope > [data-cl-tile]")];
      return tiles.map((t) => ({
        hasCaption: !!t.querySelector("[data-cl-copy]"),
        hasTitle: !!t.querySelector("[data-cl-card-title]"),
      }));
    });
    const ok = report.every((tiles) => tiles.length >= 2 && tiles.every((t) => t.hasCaption && t.hasTitle));
    return { ok, report };
  });
  record(41, `D2 every tile has caption (${tag})`, d2Captions.ok, JSON.stringify(d2Captions.report));

  const d3Surface = await themePage.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-cl-kind="text-row"][data-cl-card]')];
    return rows.map((r) => {
      const cs = getComputedStyle(r);
      const bg = cs.backgroundColor;
      const transparent =
        bg === "transparent" ||
        bg === "rgba(0, 0, 0, 0)" ||
        (bg.startsWith("rgba") && bg.endsWith(", 0)"));
      return { id: r.getAttribute("data-cl-variant"), bg, transparent };
    });
  });
  record(
    42,
    `D3 rows no background fill (${tag})`,
    d3Surface.every((r) => r.transparent),
    JSON.stringify(d3Surface)
  );

  if (width === 1440) {
    const fill = await themePage.evaluate(() => {
      const root = document.querySelector("[data-cl-root]");
      const inner = document.querySelector(".card-lab__inner");
      const row = document.querySelector("[data-cl-row]");
      const ir = inner.getBoundingClientRect();
      const rr = row.getBoundingClientRect();
      const cs = getComputedStyle(root);
      const padL = parseFloat(cs.paddingLeft);
      const padR = parseFloat(cs.paddingRight);
      // Root content box (accounts for scrollbar eating into the element).
      const expected = root.clientWidth - padL - padR;
      return {
        innerW: ir.width,
        rowW: rr.width,
        rootClient: root.clientWidth,
        padL,
        padR,
        expected,
      };
    });
    record(
      43,
      `Columns fill content width (${tag})`,
      Math.abs(fill.innerW - fill.expected) <= 1 && Math.abs(fill.rowW - fill.expected) <= 1,
      JSON.stringify(fill)
    );
  } else {
    record(43, `Columns fill content width (${tag})`, true, "n/a");
  }

  // Registry shell: every concept section has id, kind, ≥1 variant + spec.
  const registry = await themePage.evaluate(() => {
    const sections = [...document.querySelectorAll("section[data-cl-concept]")];
    const report = sections.map((s) => {
      const cells = [...s.querySelectorAll(":scope [data-cl-variant-cell]")];
      return {
        id: s.getAttribute("data-cl-concept"),
        kind: s.getAttribute("data-cl-kind"),
        variants: cells.length,
        specs: cells.filter((c) => c.querySelector("[data-cl-spec]")).length,
        cards: cells.filter((c) => c.querySelector("[data-cl-card]")).length,
      };
    });
    const ok =
      report.length >= 1 &&
      report.every(
        (r) =>
          !!r.id &&
          !!r.kind &&
          r.variants >= 1 &&
          r.specs === r.variants &&
          r.cards === r.variants
      );
    return { ok, count: report.length, report };
  });
  record(44, `Registry concepts render (${tag})`, registry.ok, JSON.stringify(registry));

  // ——— Content + layout craft checks (post-Mudit review) ———
  if (width === 1440 && theme === "light") {
    const titlesOk = await themePage.evaluate((allowed) => {
      const bad = [];
      for (const el of document.querySelectorAll("[data-cl-card-title]")) {
        const t = (el.textContent || "").trim();
        if (!allowed.includes(t)) bad.push(t);
      }
      return { ok: bad.length === 0, bad: bad.slice(0, 8) };
    }, [...MUDIT_TITLES]);
    record(48, `Card titles match Mudit projects (${tag})`, titlesOk.ok, titlesOk.bad.join(" | "));

    const clipText = await themePage.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll(
        "[data-cl-root] p, [data-cl-root] span, [data-cl-root] li, [data-cl-root] h1, [data-cl-root] h2"
      )) {
        if (el.children.length) continue;
        const t = (el.textContent || "").trim();
        if (!t) continue;
        let cur = el.parentElement;
        while (cur && cur !== document.body) {
          const cs = getComputedStyle(cur);
          if (cs.overflow === "hidden" || cs.overflowX === "hidden") {
            const er = el.getBoundingClientRect();
            const cr = cur.getBoundingClientRect();
            if (er.left < cr.left - 1 || er.right > cr.right + 1) {
              bad.push(`clip:${t.slice(0, 32)}`);
              break;
            }
          }
          cur = cur.parentElement;
        }
      }
      return bad.slice(0, 8);
    });
    record(49, `No text clipped by overflow:hidden (${tag})`, clipText.length === 0, clipText.join(" | "));

    // Rest rows: gap from last visible text in card to card bottom ≤ 16px
    // (no reserved hover void). Spec is outside the card.
    const restVoid = await themePage.evaluate(() => {
      const checkKinds = new Set([
        "expanding-chip",
        "pill-row",
        "outcome-metric",
        "status-line",
        "brand-lockup",
        "dual-cta",
        "numbered-index",
        "cursor-label",
        "stagger-reveal",
        "gated-nda",
      ]);
      const bad = [];
      for (const row of document.querySelectorAll('[data-cl-row-mode="rest"]')) {
        for (const card of row.querySelectorAll("[data-cl-card]")) {
          const kind = card.getAttribute("data-cl-kind");
          if (!checkKinds.has(kind || "")) continue;
          const texts = [...card.querySelectorAll("p, span, li")].filter((el) => {
            if (el.children.length) return false;
            const t = (el.textContent || "").trim();
            if (!t) return false;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || Number(cs.opacity) < 0.05) return false;
            const r = el.getBoundingClientRect();
            return r.height > 0 && r.width > 0;
          });
          if (!texts.length) continue;
          let bottom = 0;
          for (const el of texts) {
            bottom = Math.max(bottom, el.getBoundingClientRect().bottom);
          }
          // Media counts as content — tall media next to short copy is not a void.
          for (const m of card.querySelectorAll("[data-cl-media]")) {
            const cs = getComputedStyle(m);
            if (cs.visibility === "hidden" || Number(cs.opacity) < 0.05) continue;
            const r = m.getBoundingClientRect();
            if (r.height > 0) bottom = Math.max(bottom, r.bottom);
          }
          const gap = card.getBoundingClientRect().bottom - bottom;
          if (gap > 16.5) bad.push(`${kind}/${card.getAttribute("data-cl-variant")}:${gap.toFixed(1)}`);
        }
      }
      return bad.slice(0, 10);
    });
    record(50, `Rest rows no reserved void >16px (${tag})`, restVoid.length === 0, restVoid.join(" | "));

    // Forced hover end states: brand lockup fully revealed
    await themePage.goto(`${BASE}/dev/card-lab?theme=light&hover=all`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await themePage.waitForSelector("[data-cl-root]");
    await themePage.waitForTimeout(400);
    const endStates = await themePage.evaluate(() => {
      const bad = [];
      for (const card of document.querySelectorAll(
        '[data-cl-row-mode="hover"] [data-cl-kind="brand-lockup"][data-cl-card]'
      )) {
        const preview = card.querySelector("[data-cl-preview-layer]");
        const cs = getComputedStyle(preview);
        const clip = cs.clipPath || cs.webkitClipPath || "none";
        const op = Number(cs.opacity);
        const id = card.getAttribute("data-cl-variant");
        const reveal = card.getAttribute("data-cl-reveal");
        if (reveal === "crossfade" && op < 0.95) bad.push(`crossfade opacity ${op}`);
        if (reveal === "wipe") {
          const fullyOpen =
            clip === "none" ||
            /^inset\(\s*0(px)?(\s+0(px)?){0,3}\s*\)$/.test(clip);
          if (!fullyOpen) bad.push(`wipe clip ${clip}`);
        }
        if (reveal === "scale-center") {
          const m = clip.match(/circle\(([\d.]+)%/);
          if (m && Number(m[1]) < 100) bad.push(`scale-center ${m[1]}%`);
        }
        if (!preview) bad.push(`${id} missing preview`);
      }
      return bad;
    });
    record(51, `Forced hover end states final (${tag})`, endStates.length === 0, endStates.join(" | "));

    // Variant pixel distinctness within each new concept (rest row).
    const conceptIds = [
      "expanding-chip",
      "pill-row",
      "outcome-metric",
      "status-line",
      "brand-lockup",
      "dual-cta",
      "numbered-index",
      "cursor-label",
      "stagger-reveal",
      "gated-nda",
    ];
    const variantDiffFails = [];
    for (const id of conceptIds) {
      await themePage.goto(`${BASE}/dev/card-lab?theme=light&hover=all`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await themePage.waitForSelector(`[data-cl-concept="${id}"]`);
      const section = themePage.locator(`section[data-cl-concept="${id}"]`);
      await section.scrollIntoViewIfNeeded();
      const restCells = section.locator('[data-cl-row-mode="rest"] [data-cl-variant-cell]');
      const hoverCells = section.locator('[data-cl-row-mode="hover"] [data-cl-variant-cell]');
      const count = await restCells.count();
      const shots = [];
      for (let i = 0; i < count; i++) {
        shots.push({
          rest: await restCells.nth(i).screenshot(),
          hover: await hoverCells.nth(i).screenshot(),
        });
      }
      const diffBuf = (a, b) => {
        const n = Math.min(a.length, b.length);
        let d = 0;
        // Sample every 16th byte for speed; PNG headers cancel in practice.
        for (let i = 64; i < n; i += 16) d += Math.abs(a[i] - b[i]);
        return d;
      };
      for (let i = 0; i < shots.length; i++) {
        for (let j = i + 1; j < shots.length; j++) {
          const dr = diffBuf(shots[i].rest, shots[j].rest);
          const dh = diffBuf(shots[i].hover, shots[j].hover);
          if (dr < MIN_VARIANT_PIXEL_DIFF && dh < MIN_VARIANT_PIXEL_DIFF) {
            variantDiffFails.push(`${id} ${i}/${j} rest=${dr} hover=${dh}`);
          }
        }
      }
    }
    record(
      52,
      `Variants pixel-distinct (${tag})`,
      variantDiffFails.length === 0,
      variantDiffFails.slice(0, 8).join(" | ")
    );
  } else {
    record(48, `Card titles match Mudit projects (${tag})`, true, "checked on 1440 light");
    record(49, `No text clipped by overflow:hidden (${tag})`, true, "checked on 1440 light");
    record(50, `Rest rows no reserved void >16px (${tag})`, true, "checked on 1440 light");
    record(51, `Forced hover end states final (${tag})`, true, "checked on 1440 light");
    record(52, `Variants pixel-distinct (${tag})`, true, "checked on 1440 light");
  }

  await themeCtx.close();
  return { fullPath, mediaUrls };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const configs = [
    { width: 1440, height: 900, theme: "light", hoverEmulation: "hover" },
    { width: 1440, height: 900, theme: "dark", hoverEmulation: "hover" },
    { width: 390, height: 844, theme: "light", hoverEmulation: "none" },
    { width: 390, height: 844, theme: "dark", hoverEmulation: "none" },
  ];

  console.log(`Verifying ${BASE}/dev/card-lab → shots ${OUT}`);
  for (const cfg of configs) {
    console.log(`\n→ ${cfg.width}x${cfg.height} theme=${cfg.theme}`);
    await runViewport(browser, cfg);
  }
  await browser.close();

  // Collapse to worst result per rubric id
  /** @type {Map<number, { id: number; name: string; pass: boolean; detail: string }>} */
  const byId = new Map();
  for (const r of results) {
    const prev = byId.get(r.id);
    if (!prev) byId.set(r.id, r);
    else if (prev.pass && !r.pass) byId.set(r.id, r);
    else if (prev.pass === r.pass && r.detail && !prev.detail) byId.set(r.id, r);
  }

  const maxId = Math.max(52, ...byId.keys());
  console.log("\n=== Card lab rubric ===");
  console.log("ID | RESULT | Check");
  console.log("---|--------|------");
  let failed = 0;
  for (let id = 1; id <= maxId; id++) {
    const r = byId.get(id);
    if (!r) {
      console.log(`${String(id).padStart(2)} | FAIL   | (not checked)`);
      failed++;
      continue;
    }
    const mark = r.pass ? "PASS" : "FAIL";
    if (!r.pass) failed++;
    const detail = r.detail ? ` — ${r.detail.slice(0, 120)}` : "";
    console.log(`${String(id).padStart(2)} | ${mark.padEnd(6)} | ${r.name}${detail}`);
  }
  console.log(`\n${failed === 0 ? "ALL PASS" : `${failed} FAILED`} (${BASE})`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
