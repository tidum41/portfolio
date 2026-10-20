#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL =
  process.env.DIALOGUE_REVIEW_BASE_URL || "http://127.0.0.1:3003/dev/dialogue-canvas-v2";

const ZOOM_LEVELS = [4, 25, 100, 200];

function rectsIntersect(a, b, slack = 0) {
  return (
    a.x + slack < b.x + b.width &&
    a.x + a.width > b.x + slack &&
    a.y + slack < b.y + b.height &&
    a.y + a.height > b.y + slack
  );
}

async function assertNoLabelOverlaps(page, zoomLabel) {
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll("[data-archive-screen-label]")]
      .filter((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity !== "0" && Number.parseFloat(style.fontSize) > 1;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }),
  );
  const caps = await page.locator("[data-archive-caption]").all();
  const medias = await page.locator("[data-archive-tile-media]").all();
  const capBoxes = [];
  for (const c of caps) {
    const b = await c.boundingBox();
    if (b) capBoxes.push(b);
  }
  const mediaBoxes = [];
  for (const m of medias) {
    const b = await m.boundingBox();
    if (b) mediaBoxes.push(b);
  }
  for (const label of labels) {
    for (const cap of capBoxes) {
      if (rectsIntersect(label, cap, -1)) throw new Error(`Label ∩ caption at ${zoomLabel}`);
    }
    for (const media of mediaBoxes) {
      if (rectsIntersect(label, media, -1)) throw new Error(`Label ∩ media at ${zoomLabel}`);
    }
  }
}

async function waitForCamera(page) {
  await page.waitForFunction(() => typeof window.__dialogueReviewCamera?.setZoom === "function");
}

async function setZoomPercent(page, pct) {
  await waitForCamera(page);
  if (pct <= 6) {
    await page.locator("[data-archive-toolbar]").getByRole("button", { name: "Fit all", exact: true }).click();
    await page.waitForTimeout(400);
    return;
  }
  if (pct === 100) {
    await page.locator("[data-archive-toolbar]").getByRole("button", { name: "100%", exact: true }).click();
    await page.waitForTimeout(300);
    return;
  }
  await page.evaluate((p) => window.__dialogueReviewCamera.setZoom(p / 100), pct);
  await page.waitForTimeout(200);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => localStorage.removeItem("dialogue-review-camera-v1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-review-tile]", { state: "attached", timeout: 60_000 });
  await waitForCamera(page);
  await page.evaluate(() => document.fonts.ready);

  for (const pct of ZOOM_LEVELS) {
    await setZoomPercent(page, pct);
    await assertNoLabelOverlaps(page, `${pct}%`);
  }

  await setZoomPercent(page, 4);
  const fitOut = "/opt/cursor/artifacts/dialogue-review-fit-all-1440.png";
  await page.screenshot({ path: fitOut });

  await setZoomPercent(page, 100);
  const z100 = "/opt/cursor/artifacts/dialogue-review-100-1440.png";
  await page.screenshot({ path: z100 });

  console.log("verify ok", { zoomLevels: ZOOM_LEVELS, fitOut, z100 });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
