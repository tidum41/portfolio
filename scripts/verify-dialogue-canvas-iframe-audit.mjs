#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const STORE = "/cursor/stores/bot/dialogue-canvas-verify";
fs.mkdirSync(STORE, { recursive: true });

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

async function slowScrollAndSettle(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const max = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0);
    const step = Math.max(120, Math.floor(window.innerHeight * 0.35));
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await sleep(140);
    }
    window.scrollTo(0, max);
    await sleep(2000);
    window.scrollTo(0, 0);
    await sleep(400);
  });
}

async function measureContentInFrame(iframeLocator) {
  const handle = await iframeLocator.elementHandle();
  const frame = handle && (await handle.contentFrame());
  if (!frame) return { error: "no contentFrame" };
  return frame.evaluate(() => {
    const root =
      document.querySelector("[data-export-section-canvas]") ||
      document.querySelector("[data-export-canvas]") ||
      document.body;
    const r = root.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      frameW: vw,
      frameH: vh,
      contentW: r.width,
      contentH: r.height,
      contentLeft: r.left,
      contentTop: r.top,
      fillW: r.width / vw,
      fillH: r.height / vh,
      selector: root.getAttribute("data-export-section-canvas")
        ? "data-export-section-canvas"
        : root.getAttribute("data-export-canvas")
          ? "data-export-canvas"
          : "body",
    };
  });
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(120000);

const report = { viewports: {}, iframes: [], overflow390: null };

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(`${BASE}/dev/dialogue-canvas-v2`, { waitUntil: "load" });
  await page.waitForSelector(".dcv2-live__viewport", { timeout: 60000 });
  await slowScrollAndSettle(page);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (vp.name === "390") report.overflow390 = overflow;

  const fullPath = path.join(STORE, `canvas-full-${vp.name}.png`);
  await page.screenshot({ path: fullPath, fullPage: true });

  const rows = page.locator(".dcv2-live__row");
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const id = (await row.getAttribute("id")) || `row-${i}`;
    const assetId = id.replace(/^live-/, "");
    const viewport = row.locator(".dcv2-live__viewport");
    const hostBox = await viewport.boundingBox();
    const shotPath = path.join(STORE, `iframe-${assetId}-${vp.name}.png`);
    await viewport.screenshot({ path: shotPath });

    const iframeEl = row.locator(".dcv2-live__iframe");
    let content = null;
    try {
      await iframeEl.waitFor({ state: "attached", timeout: 15000 });
      content = await measureContentInFrame(iframeEl);
    } catch (e) {
      content = { error: String(e) };
    }

    const hostW = hostBox?.width ?? 0;
    const hostH = hostBox?.height ?? 0;
    const entry = {
      assetId,
      viewport: vp.name,
      hostFrame: { width: hostW, height: hostH },
      iframeDocument: content,
      shot: shotPath,
      flags: [],
    };
    if (content && !content.error) {
      if (content.fillW < 0.7 || content.fillH < 0.7) {
        entry.flags.push(`low_fill:w=${(content.fillW * 100).toFixed(1)}% h=${(content.fillH * 100).toFixed(1)}%`);
      }
    }
    report.iframes.push(entry);
  }

  report.viewports[vp.name] = { fullPage: fullPath, iframeCount: count, overflow };
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
