/**
 * PR #192 audit: sidebar flush to frame bottom, copy guards, per-variant captures.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.JOOLA_SITE_BASE ?? "http://localhost:3000";
const PREVIEW = `${BASE}/joola?sanity_preview=1`;
const OUT = process.env.JOOLA_AUDIT_OUT ?? "/opt/cursor/artifacts";

const BANNED = [
  { id: "case-pack", re: /\bcase[\s-]?pack\b|\bcase of\b|by the case/i },
  { id: "tier", re: /\btier(?:ed|s)?\b|\bprice break/i },
  { id: "dot-sep", re: /·/ },
  { id: "store-link", re: /joola\.com store/i },
];

async function sidebarGap(page, figureId) {
  const frame = page.frameLocator(`[data-joola-figure="${figureId}"] iframe`).first();
  await frame.locator(".shell__sidebar").waitFor({ state: "visible", timeout: 60000 });
  return frame.locator(".shell__sidebar").evaluate((sidebar) => {
    const sb = sidebar.getBoundingClientRect();
    const shell =
      sidebar.closest(".buyer-shell, .admin-shell, .shell") ?? sidebar.parentElement;
    const sh = shell?.getBoundingClientRect();
    const frameBottom = document.documentElement.clientHeight;
    const target = sh ? Math.min(sh.bottom, frameBottom) : frameBottom;
    if (!sh) return 999;
    return Math.max(0, Math.round(target - sb.bottom));
  });
}

async function beforeAfterCircleDelta(page) {
  const deltas = await page.locator(".joola-before-after__step").evaluateAll((steps) =>
    steps.map((step) => {
      const num = step.querySelector(".joola-before-after__num");
      const text = step.querySelector(".joola-before-after__text");
      if (!num || !text) return 999;
      const nr = num.getBoundingClientRect();
      const tr = text.getBoundingClientRect();
      const lh = parseFloat(getComputedStyle(text).lineHeight);
      const lineH = Number.isFinite(lh) ? lh : parseFloat(getComputedStyle(text).fontSize) * 1.45;
      const firstLineCenter = tr.top + lineH / 2;
      const numCenter = nr.top + nr.height / 2;
      return Math.abs(firstLineCenter - numCenter);
    }),
  );
  return Math.max(...deltas, 0);
}

async function iframeBannedText(page, figureId) {
  const frame = page.frameLocator(`[data-joola-figure="${figureId}"] iframe`).first();
  const text = await frame.locator("body").innerText().catch(() => "");
  const bad = [];
  for (const rule of BANNED) {
    if (rule.re.test(text)) bad.push(rule.id);
  }
  return bad;
}

async function captureFigure(page, figureId, slug) {
  const host = page.locator(`[data-joola-figure="${figureId}"]`);
  await host.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const file = path.join(OUT, slug);
  await host.screenshot({ path: file });
  return file;
}

async function runViewport(page, viewport, tag) {
  await page.setViewportSize(viewport);
  await page.goto(PREVIEW, { waitUntil: "load", timeout: 120000 });
  await page.locator('[data-joola-figure="quick-order-hero"] iframe').waitFor({
    state: "visible",
    timeout: 120000,
  });
  await page.waitForTimeout(2500);

  const tocText = await page.locator("nav, aside, [class*='toc']").first().innerText().catch(() => "");
  assert.ok(!/\bcase[\s-]?pack\b/i.test(tocText), `TOC case-pack @ ${tag}`);
  assert.ok(!/\btier/i.test(tocText), `TOC tier @ ${tag}`);

  const figures = [
    "quick-order-hero",
    "quick-order-portal",
    "quick-order-row-search",
    "quick-order-row-compare",
    "review-checkout",
    "approval-queue",
  ];

  for (const fig of figures) {
    const bad = await iframeBannedText(page, fig);
    assert.equal(bad.length, 0, `${fig} @ ${tag}: ${bad.join(", ")}`);
  }

  await page.locator("#solution").scrollIntoViewIfNeeded();
  const circleDelta = await beforeAfterCircleDelta(page);
  assert.ok(
    circleDelta <= 0.5,
    `Before/after step circle alignment @ ${tag}: ${circleDelta.toFixed(2)}px`,
  );
  await captureFigure(page, "solution-before-after", `joola-audit-${tag}-solution-flow.png`);

  await captureFigure(page, "quick-order-hero", `joola-audit-${tag}-hero.png`);
  await captureFigure(page, "quick-order-portal", `joola-audit-${tag}-solution.png`);
  await captureFigure(page, "quick-order-row-search", `joola-audit-${tag}-d1.png`);
  await captureFigure(page, "review-checkout", `joola-audit-${tag}-d3.png`);

  const d2Variants = [
    { tab: "Compact", v: "d2-compact" },
    { tab: "Reorder", v: "d2-reorder" },
    { tab: "Stock status", v: "d2-stock" },
  ];
  await page.locator("#decision-2").scrollIntoViewIfNeeded();
  for (const { tab, v } of d2Variants) {
    await page.getByRole("tab", { name: tab }).click();
    await page.waitForTimeout(1200);
    const gap = await sidebarGap(page, "quick-order-row-compare");
    assert.equal(gap, 0, `D2 ${tab} sidebar gap @ ${tag}: ${gap}px`);
    await captureFigure(page, "quick-order-row-compare", `joola-audit-${tag}-${v}.png`);
  }

  await page.locator("#decision-4").scrollIntoViewIfNeeded();
  for (const tab of ["Split inbox", "Ledger"]) {
    const slug = tab === "Split inbox" ? "d4-split" : "d4-ledger";
    await page.getByRole("tab", { name: tab }).click();
    await page.waitForTimeout(1200);
    const gap = await sidebarGap(page, "approval-queue");
    assert.equal(gap, 0, `D4 ${tab} sidebar gap @ ${tag}: ${gap}px`);
    await captureFigure(page, "approval-queue", `joola-audit-${tag}-${slug}.png`);
  }
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const theme of ["light", "dark"]) {
  const context = await browser.newContext({
    extraHTTPHeaders: { "x-joola-sanity-preview": "1" },
    viewport: { width: 1440, height: 900 },
    colorScheme: theme,
  });
  const page = await context.newPage();
  await runViewport(page, { width: 1440, height: 900 }, `1440-${theme}`);
  await runViewport(page, { width: 1024, height: 900 }, `1024-${theme}`);
  await context.close();
}
await browser.close();
console.log("Joola audit embed checks passed. Screenshots in", OUT);
