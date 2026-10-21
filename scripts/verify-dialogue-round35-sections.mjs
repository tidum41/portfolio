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
  { id: "clips", selector: "#clips" },
  { id: "placement", selector: "#placement" },
  { id: "full-answer", selector: "#full-answer" },
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
    for (const el of root.querySelectorAll(".dialogue-react-figure")) {
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
      const figures = [...document.querySelectorAll(".dialogue-case-study .dialogue-react-figure iframe")];
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

    const sectionW = el.getBoundingClientRect().width;
    const iframeMetrics = [...el.querySelectorAll("iframe")].map((iframe) => {
      let minChatFont = null;
      let letterboxGap = null;
      const iframeRect = iframe.getBoundingClientRect();
      const isFullWidth = iframeRect.width >= sectionW * 0.55;
      try {
        const doc = iframe.contentDocument;
        if (doc?.body) {
          const panel = doc.querySelector("[data-export-chat-panel]");
          const scope = panel ?? doc.body;
          const bodies = [...scope.querySelectorAll(".text-body, p.text-body, [class*='text-body']")];
          const sizes = bodies
            .map((node) => {
              const text = node.textContent?.replace(/\s+/g, " ").trim() ?? "";
              if (text.length < 4) return null;
              return parseFloat(getComputedStyle(node).fontSize);
            })
            .filter((n) => Number.isFinite(n));
          minChatFont = sizes.length ? Math.min(...sizes) : null;
          if (isFullWidth) {
            const fill =
              panel ??
              doc.querySelector("[data-export-section-canvas], [data-export-canvas]");
            const fillRect = fill?.getBoundingClientRect();
            if (iframeRect.width > 0) {
              const contentW = Math.max(
                fillRect?.width ?? 0,
                doc.documentElement.clientWidth,
                doc.body.clientWidth,
              );
              letterboxGap = Math.max(0, 1 - contentW / iframeRect.width);
            }
          }
        }
      } catch {
        /* cross-origin */
      }
      return { minChatFont, letterboxGap, clipped: false, isFullWidth };
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
        (m, x) => (x.minChatFont != null ? Math.min(m ?? 99, x.minChatFont) : m),
        null,
      ),
      maxLetterboxGap: iframeMetrics.reduce(
        (m, x) =>
          x.isFullWidth && x.letterboxGap != null ? Math.max(m ?? 0, x.letterboxGap) : m,
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
    await page.evaluate((sel) => {
      const node = document.querySelector(sel);
      if (node) {
        const y = node.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo(0, Math.max(0, y));
      }
    }, sec.selector);
    await page.waitForTimeout(900);
    const visible = await el.isVisible().catch(() => false);
    if (!visible) {
      report.issues.push(`${sec.id}@${vp.name}: not visible`);
      continue;
    }
    const file = `${ARTIFACT_ROOT}/${sec.id}-${vp.name}.png`;
    const box = await el.boundingBox();
    if (box) {
      await page.screenshot({
        path: file,
        clip: {
          x: Math.max(0, box.x),
          y: Math.max(0, box.y),
          width: Math.min(box.width, vp.width),
          height: Math.min(box.height, 2000),
        },
        animations: "disabled",
      });
      report.shots.push(file);
    }

    const metrics = await measureSection(page, sec.selector);
    report.critique.push({ section: sec.id, viewport: vp.name, ...metrics });
    if (metrics.overflowX) report.issues.push(`overflow-x@${vp.name}:${sec.id}`);
    if (
      metrics.iframeMetrics?.length &&
      metrics.minFontInSection != null &&
      metrics.minFontInSection < 12
    ) {
      report.issues.push(`font<12@${vp.name}:${sec.id}:${metrics.minFontInSection}`);
    }
    if (metrics.maxLetterboxGap != null && metrics.maxLetterboxGap > 0.08) {
      report.issues.push(`letterbox@${vp.name}:${sec.id}:${metrics.maxLetterboxGap}`);
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
const passTable = SECTIONS.flatMap((sec) =>
  VIEWPORTS.map((vp) => {
    const row = report.critique.find((c) => c.section === sec.id && c.viewport === vp.name);
    const failed = report.issues.some((i) => i.includes(`@${vp.name}:${sec.id}`));
    return {
      section: sec.id,
      viewport: vp.name,
      pass: row?.ok && !failed,
      minFont: row?.minFontInSection ?? null,
      letterbox: row?.maxLetterboxGap ?? null,
      overflow: row?.overflowX ?? null,
    };
  }),
);
console.log(JSON.stringify({ ...report, passTable, reportPath, selfStore: SELF_STORE }, null, 2));
if (report.issues.length > 0) {
  process.exitCode = 1;
}
