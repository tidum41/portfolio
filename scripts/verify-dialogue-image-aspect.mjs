#!/usr/bin/env node
import { chromium } from "playwright";

const BASE =
  process.env.DIALOGUE_PREVIEW_URL ||
  "https://portfolio-git-cursor-dialogue-c-72afce-mudits-projects-d560e6b3.vercel.app/dev/dialogue-canvas-v2";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

const TOLERANCE = 0.005;

async function checkAspectRatios(page) {
  const failures = [];
  const dataList = await page.locator(".dialogue-case-study img").evaluateAll((elements) =>
    elements
      .map((el) => {
        const src = el.currentSrc || el.getAttribute("src") || "";
        if (!src.includes("dialogue")) return null;
        const r = el.getBoundingClientRect();
        return {
          src,
          w: r.width,
          h: r.height,
          nw: el.naturalWidth,
          nh: el.naturalHeight,
        };
      })
      .filter(Boolean),
  );
  const count = dataList.length;
  for (const data of dataList) {
    if (!data.nw || !data.nh || !data.w || !data.h) continue;
    const rendered = data.w / data.h;
    const natural = data.nw / data.nh;
    const drift = Math.abs(rendered - natural) / natural;
    if (drift > TOLERANCE) {
      failures.push({ ...data, rendered, natural, drift });
    }
  }
  if (count < 5) {
    throw new Error(`expected dialogue rasters on page, found ${count}`);
  }
  return { count, failures };
}

async function checkLightbox(page) {
  const trigger = page.locator(".dialogue-case-study .cs-figure-zoom-trigger").first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const backdrop = page.locator(".cs-lightbox-backdrop");
  await backdrop.waitFor({ state: "visible", timeout: 5000 });
  const close = page.locator(".cs-lightbox-close");
  const hasX = await close.locator("span").textContent();
  if (!hasX?.includes("×")) {
    throw new Error("lightbox close control missing ×");
  }
  await page.keyboard.press("Escape");
  await backdrop.waitFor({ state: "hidden", timeout: 5000 });
}

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const resp = await page.goto(BASE, { waitUntil: "networkidle", timeout: 120000 });
  const status = resp?.status() ?? 0;
  if (status !== 200) throw new Error(`HTTP ${status} at ${vp.name}`);
  const { count, failures } = await checkAspectRatios(page);
  if (failures.length) {
    throw new Error(`${vp.name} aspect failures: ${JSON.stringify(failures, null, 2)}`);
  }
  if (vp.name === "1440") await checkLightbox(page);
  const out = `/opt/cursor/artifacts/dialogue-aspect-${vp.name}.png`;
  await page.screenshot({ path: out, fullPage: true });
  results.push({ viewport: vp.name, imagesChecked: count, screenshot: out });
}

await browser.close();
console.log("verify ok", results);
