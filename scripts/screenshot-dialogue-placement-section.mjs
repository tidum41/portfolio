#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? "http://localhost:3000";
const outDir = process.argv[3] ?? path.join(root, "../opt/cursor/artifacts");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const [label, width, height] of [
  ["1440", 1440, 900],
  ["390", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${base}/dialogue#placement`, { waitUntil: "networkidle" });
  await page.locator("#placement").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.locator("#placement").screenshot({
    path: path.join(outDir, `dialogue-placement-section-${label}.png`),
    type: "png",
  });
  console.log(`Wrote dialogue-placement-section-${label}.png`);
  await page.close();
}
await browser.close();
