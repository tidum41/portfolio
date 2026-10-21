#!/usr/bin/env node
/**
 * Round 36: side-by-side approved reference (/dialogue/ds-parity) vs case-study figure.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const PORT = Number(process.env.ROUND36_PORT || 3020);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = process.env.ROUND36_STORE || "/cursor/stores/self/round36/parity";
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

const PAIRS = [
  {
    id: "answer-card",
    ref: '[data-parity-id="answer-card"]',
    live: '#problem [data-dialogue-asset-id="D-02"] .dp-study-chat',
  },
  {
    id: "funnel",
    ref: '[data-parity-id="funnel"]',
    live: "#one-structure .dp-study-chat",
  },
  {
    id: "clip-row",
    ref: '[data-parity-id="clip-row"]',
    live: "#one-structure .dp-clip-thumbs",
  },
  {
    id: "trend",
    ref: '[data-parity-id="answer-card"]',
    live: '.dialogue-chart-gallery__cell:first-child .dp-study-chat',
  },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const report = { pairs: [], equalHeight: [], issues: [] };

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(`${BASE}/dialogue/ds-parity`, { waitUntil: "load", timeout: 120000 });
  await page.goto(`${BASE}/dialogue`, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector(".dialogue-case-study", { timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  for (const pair of PAIRS) {
    await page.goto(`${BASE}/dialogue/ds-parity`, { waitUntil: "load" });
    const refLoc = page.locator(pair.ref).first();
    const refBuf = await refLoc.screenshot({ animations: "disabled" }).catch(() => null);

    await page.goto(`${BASE}/dialogue`, { waitUntil: "load" });
    await page.waitForSelector(".dialogue-case-study");
    const liveLoc = page.locator(pair.live).first();
    await liveLoc.scrollIntoViewIfNeeded();
    const liveBuf = await liveLoc.screenshot({ animations: "disabled" }).catch(() => null);

    if (!refBuf || !liveBuf) {
      report.issues.push(`capture-failed:${vp.name}:${pair.id}`);
      continue;
    }

    const refMeta = await sharp(refBuf).metadata();
    const liveMeta = await sharp(liveBuf).metadata();
    const h = Math.max(refMeta.height ?? 0, liveMeta.height ?? 0);
    const padRef = await sharp(refBuf)
      .extend({
        top: 0,
        bottom: h - (refMeta.height ?? 0),
        left: 0,
        right: 0,
        background: { r: 244, g: 241, b: 236, alpha: 1 },
      })
      .toBuffer();
    const padLive = await sharp(liveBuf)
      .extend({
        top: 0,
        bottom: h - (liveMeta.height ?? 0),
        left: 0,
        right: 0,
        background: { r: 244, g: 241, b: 236, alpha: 1 },
      })
      .toBuffer();

    const refW = refMeta.width ?? 0;
    const liveW = liveMeta.width ?? 0;
    const combined = await sharp({
      create: {
        width: refW + liveW + 12,
        height: h,
        channels: 3,
        background: { r: 32, g: 30, b: 28 },
      },
    })
      .composite([
        { input: padRef, left: 0, top: 0 },
        { input: padLive, left: refW + 12, top: 0 },
      ])
      .png()
      .toBuffer();

    const outPath = path.join(OUT, `${pair.id}-${vp.name}.png`);
    fs.writeFileSync(outPath, combined);
    report.pairs.push(outPath);
  }

  const heights = await page.evaluate(() => {
    const panels = [...document.querySelectorAll(".dialogue-lead-answer__panel .dp-scaled-viewport")];
    return panels.map((el) => Math.round(el.getBoundingClientRect().height));
  });
  if (heights.length === 3) {
    const spread = Math.max(...heights) - Math.min(...heights);
    report.equalHeight.push({ viewport: vp.name, heights, spread });
    if (spread > 2) report.issues.push(`lead-answer-height@${vp.name}:${spread}px`);
  }

  await page.close();
}

fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify({ out: OUT, issues: report.issues, count: report.issues.length }, null, 2));
process.exit(report.issues.length ? 1 : 0);
