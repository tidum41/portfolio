#!/usr/bin/env node
/**
 * Playwright screenshots of each routing template at 1440 wide and at the 448px panel.
 * Requires the next server on PORT (default 3000) and /dialogue/routing-shots.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../shots/routing-demo");
const PORT = process.env.PORT || "3000";
const BASE = `http://127.0.0.1:${PORT}`;
const TEMPLATES = [
  "count_split",
  "segment_comparison",
  "quote_list",
  "clip_list",
  "thin_data",
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

async function shot(name, width, clipPanel) {
  await page.setViewportSize({ width, height: 1200 });
  await page.goto(`${BASE}/dialogue/routing-shots#shot-${name}`, {
    waitUntil: "networkidle",
  });
  const section = page.locator(`#shot-${name}`);
  await section.waitFor({ state: "visible" });
  const target = clipPanel ? section.locator(".dlg-route-shot__panel") : section;
  const path = join(
    OUT,
    clipPanel ? `${name}-448.png` : `${name}-1440.png`,
  );
  await target.screenshot({ path, type: "png" });
  console.log(`wrote ${path}`);
}

for (const t of TEMPLATES) {
  await shot(t, 1440, false);
  await shot(t, 1440, true);
}

await browser.close();
console.log(`Done. ${TEMPLATES.length * 2} screenshots in ${OUT}`);
