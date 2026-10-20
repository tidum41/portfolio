#!/usr/bin/env node
/**
 * Side-by-side PNG vs scaled live export iframe for canvas assets.
 * Outputs to /cursor/stores/bot/dialogue-canvas-verify/live-parity-*.png
 */
import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const STORE = "/cursor/stores/bot/dialogue-canvas-verify";
const SAMPLES = ["D-06", "D-04", "D-09"];

fs.mkdirSync(STORE, { recursive: true });

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

async function waitForLiveSection(page) {
  await page.goto(`${BASE}/dev/dialogue-canvas-v2`, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector(".dcv2-live__viewport", { timeout: 60000 });
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const root = document.querySelector(".dcv2-live");
    if (!root) return;
    for (const el of root.querySelectorAll(".dcv2-live__row")) {
      el.scrollIntoView({ block: "center", behavior: "instant" });
      await sleep(120);
    }
    await sleep(800);
  });
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(120000);

const report = { samples: SAMPLES, shots: {} };

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await waitForLiveSection(page);

  for (const id of SAMPLES) {
    const row = page.locator(`#live-${id}`);
    await row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const png = row.locator(".dcv2-live__parity-png");
    const live = row.locator(".dcv2-live__frame");
    const hasParity = (await png.count()) > 0;
    const box = hasParity ? row : live;
    const out = `${STORE}/live-parity-${id}-${vp.name}.png`;
    await box.screenshot({ path: out });
    report.shots[`${id}-${vp.name}`] = out;
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
