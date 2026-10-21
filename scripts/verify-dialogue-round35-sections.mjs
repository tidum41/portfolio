#!/usr/bin/env node
/**
 * Round 35 verification: full /dialogue page + every section @ 1440 and 390.
 * Scrolls the page, waits for ScrollReveal + lazy iframes, captures screenshots
 * and layout metrics for self-critique.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ARTIFACT_ROOT = process.env.ROUND35_STORE || "/opt/cursor/artifacts/dialogue-round35-sections";
const SELF_STORE = "/cursor/stores/self/round35";

fs.mkdirSync(ARTIFACT_ROOT, { recursive: true });
fs.mkdirSync(SELF_STORE, { recursive: true });

const SECTIONS = [
  { id: "hero", selector: ".dialogue-hero-breakout" },
  { id: "problem", selector: "#problem" },
  { id: "why-it-matters", selector: "#why-it-matters" },
  { id: "one-structure", selector: "#one-structure" },
  { id: "fitted-charts", selector: "#fitted-charts" },
  { id: "proof", selector: "#proof" },
  { id: "clips", selector: "#clips" },
  { id: "imperfect-evidence", selector: "#imperfect-evidence" },
  { id: "share-finding", selector: "#share-finding" },
  { id: "placement", selector: "#placement" },
  { id: "full-answer", selector: "#full-answer" },
  { id: "outcome", selector: "#outcome" },
  { id: "reflection", selector: "#reflection" },
];

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

async function waitForPageReady(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const maxScroll = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    );
    const step = Math.max(180, Math.floor(window.innerHeight * 0.7));
    for (let y = 0; y <= maxScroll; y += step) {
      window.scrollTo(0, y);
      await sleep(140);
    }
    window.scrollTo(0, maxScroll);
    await sleep(400);
    const root = document.querySelector(".dialogue-case-study") ?? document.body;
    for (const el of root.querySelectorAll(".reveal:not(.visible)")) {
      el.scrollIntoView({ block: "center", behavior: "instant" });
      await sleep(100);
    }
    for (const el of root.querySelectorAll(".dialogue-live-figure")) {
      el.scrollIntoView({ block: "center", behavior: "instant" });
      await sleep(120);
    }
    window.scrollTo(0, 0);
    await sleep(500);
  });

  await page.waitForFunction(
    () => {
      const reveals = [...document.querySelectorAll(".dialogue-case-study .reveal")];
      if (reveals.length === 0) return true;
      return reveals.every((el) => el.classList.contains("visible"));
    },
    { timeout: 120000 },
  );

  await page.waitForFunction(
    () => {
      const figures = [...document.querySelectorAll(".dialogue-case-study .dialogue-live-figure iframe")];
      if (figures.length === 0) return true;
      return figures.every((f) => f.getAttribute("src"));
    },
    { timeout: 120000 },
  );

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
}

async function measureSection(page, selector) {
  return page.evaluate((sel) => {
    const root = document.querySelector(".dialogue-case-study");
    const el = document.querySelector(sel);
    if (!root || !el) return { ok: false, reason: "missing" };

    const rootRect = root.getBoundingClientRect();
    const figures = [...el.querySelectorAll(".dialogue-live-figure, .dialogue-rachel-frame")];
    const contentCol = root.querySelector(".cs-content");
    const colWidth = contentCol?.clientWidth ?? 0;

    const figureWidths = figures.map((f) => {
      const r = f.getBoundingClientRect();
      return Math.round(r.width);
    });

    const iframeMetrics = [...el.querySelectorAll("iframe")].map((iframe) => {
      let minFontIntrinsic = null;
      let letterboxGap = null;
      const iframeRect = iframe.getBoundingClientRect();
      const intrinsicW = iframe.width || iframeRect.width || 1;
      const renderScale = iframeRect.width / intrinsicW;
      try {
        const doc = iframe.contentDocument;
        if (doc?.body) {
          const sizes = [...doc.body.querySelectorAll("p, span, li, button, td, th, label, h1, h2, h3")]
            .map((node) => {
              const text = node.textContent?.replace(/\s+/g, " ").trim() ?? "";
              if (text.length < 2) return null;
              const px = parseFloat(getComputedStyle(node).fontSize);
              return Number.isFinite(px) ? px : null;
            })
            .filter((n) => n != null && n >= 10);
          minFontIntrinsic = sizes.length ? Math.min(...sizes) : null;
          const bodyRect = doc.body.getBoundingClientRect();
          const canvas = doc.querySelector("[data-export-canvas]") ?? doc.body.firstElementChild;
          const canvasRect = canvas?.getBoundingClientRect();
          if (canvasRect && bodyRect.width > 0) {
            letterboxGap = 1 - canvasRect.width / bodyRect.width;
          }
        }
      } catch {
        /* cross-origin */
      }
      const minFontRendered =
        minFontIntrinsic != null ? minFontIntrinsic * renderScale : null;
      const viewport = iframe.closest(".dialogue-live-figure__viewport");
      const vpRect = viewport?.getBoundingClientRect();
      const clipped =
        vpRect && iframe.getBoundingClientRect().height > vpRect.height + 2;
      return {
        minFontIntrinsic,
        minFontRendered,
        renderScale,
        letterboxGap,
        clipped,
      };
    });

    const rect = el.getBoundingClientRect();
    const overflowX =
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

    return {
      ok: true,
      colWidth: Math.round(colWidth),
      sectionWidth: Math.round(rect.width),
      figureWidths,
      widthMatch:
        figureWidths.length === 0 ||
        figureWidths.every((w) => Math.abs(w - colWidth) <= 28 || w <= colWidth),
      iframeMetrics,
      minFontInSection: iframeMetrics.reduce(
        (m, x) =>
          x.minFontRendered != null ? Math.min(m ?? 99, x.minFontRendered) : m,
        null,
      ),
      overflowX,
      clippedIframes: iframeMetrics.filter((x) => x.clipped).length,
    };
  }, selector);
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(120000);

const report = { shots: [], critique: [], issues: [], viewports: [] };

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const resp = await page.goto(`${BASE}/dialogue`, { waitUntil: "load", timeout: 120000 });
  if ((resp?.status() ?? 0) !== 200) {
    report.issues.push(`http-${vp.name}:${resp?.status()}`);
    continue;
  }
  await page.waitForSelector(".dialogue-case-study", { timeout: 60000 });
  await waitForPageReady(page);

  const fullFile = `${ARTIFACT_ROOT}/full-page-${vp.name}.png`;
  await page.screenshot({ path: fullFile, fullPage: true });
  report.shots.push(fullFile);

  for (const sec of SECTIONS) {
    const el = page.locator(sec.selector).first();
    const count = await el.count();
    if (count === 0) {
      report.issues.push(`${sec.id}@${vp.name}: selector missing`);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const visible = await el.isVisible().catch(() => false);
    if (!visible) {
      report.issues.push(`${sec.id}@${vp.name}: not visible`);
      continue;
    }
    const file = `${ARTIFACT_ROOT}/${sec.id}-${vp.name}.png`;
    await el.screenshot({ path: file });
    report.shots.push(file);

    const metrics = await measureSection(page, sec.selector);
    report.critique.push({ section: sec.id, viewport: vp.name, ...metrics });
    if (metrics.overflowX) report.issues.push(`overflow-x@${vp.name}:${sec.id}`);
    if (metrics.minFontInSection != null && metrics.minFontInSection < 12) {
      report.issues.push(`font<12@${vp.name}:${sec.id}:${metrics.minFontInSection}`);
    }
    if (metrics.clippedIframes > 0) {
      report.issues.push(`clipped@${vp.name}:${sec.id}`);
    }
    if (
      sec.id !== "hero" &&
      metrics.ok &&
      metrics.figureWidths?.length &&
      !metrics.widthMatch
    ) {
      report.issues.push(`width-mismatch@${vp.name}:${sec.id}`);
    }
  }

  report.viewports.push(vp.name);
}

for (const shot of report.shots) {
  const dest = path.join(SELF_STORE, path.basename(shot));
  fs.copyFileSync(shot, dest);
}

const reportPath = path.join(SELF_STORE, "verify-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
fs.copyFileSync(reportPath, path.join(ARTIFACT_ROOT, "verify-report.json"));

await browser.close();
console.log(JSON.stringify({ ...report, reportPath, selfStore: SELF_STORE }, null, 2));
if (report.issues.some((i) => i.startsWith("hero@"))) {
  process.exitCode = 1;
}
