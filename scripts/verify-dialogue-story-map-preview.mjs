#!/usr/bin/env node
import { chromium } from "playwright";

const BASE =
  process.env.DIALOGUE_STORY_MAP_URL ||
  "https://portfolio-git-cursor-dialogue-c-72afce-mudits-projects-d560e6b3.vercel.app/dev/dialogue-canvas-v2";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

async function verifyViewport(page, { name, width, height }) {
  await page.setViewportSize({ width, height });
  const resp = await page.goto(BASE, { waitUntil: "networkidle", timeout: 120000 });
  const status = resp?.status() ?? 0;
  const url = page.url();
  const is404 = await page.getByText("let").filter({ hasText: /back to more/ }).count();
  const caseStudy = await page.locator("#dcv2-case-study").count();
  const chips = await page.locator(".dc-raster__chip").count();
  const artifacts = await page.locator(".dcv2-artifacts__row").count();
  let loaded = 0;
  const n = await page.locator(".dc-raster__chip").count();
  for (let i = 0; i < Math.min(n, 2); i++) {
    const row = page.locator(".dc-raster").nth(i);
    const img = row.locator("img").first();
    const ok = await img.evaluate((el) => el.complete && el.naturalWidth > 0).catch(() => false);
    if (ok) loaded++;
  }
  const out = `/opt/cursor/artifacts/dialogue-canvas-v2-preview-${name}.png`;
  await page.screenshot({ path: out, fullPage: true });
  if (status !== 200 || is404 > 0 || caseStudy < 1 || chips < 10 || artifacts < 10 || loaded < 1) {
    throw new Error(
      JSON.stringify({ name, status, url, is404, caseStudy, chips, artifacts, loaded, out }),
    );
  }
  return { name, status, url, chips, artifacts, loaded, out };
}

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];
for (const vp of VIEWPORTS) {
  results.push(await verifyViewport(page, vp));
}
await browser.close();
console.log("verify ok", results);
