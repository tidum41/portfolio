#!/usr/bin/env node
/**
 * Captures section-6b (docked) and section-6 (floating) from the dev export route.
 * Usage: node scripts/capture-dialogue-placement.mjs [--base http://localhost:3000]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base =
  process.argv.find((a) => a.startsWith("--base="))?.slice("--base=".length) ??
  process.env.PLACEMENT_CAPTURE_BASE ??
  "http://localhost:3000";

const shots = [
  { variant: "docked", out: "public/dialogue/section-6b.png" },
  { variant: "floating", out: "public/dialogue/section-6.png" },
];

const browser = await chromium.launch();

for (const { variant, out } of shots) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1,
  });
  const url = `${base}/dev/dialogue-placement-export/${variant}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("#export-root");
  await page.addStyleTag({
    content: `
      body { margin: 0 !important; background: #F6F4F1 !important; }
      body * { visibility: hidden !important; }
      #export-root, #export-root * { visibility: visible !important; }
    `,
  });
  const dest = path.join(root, out);
  await page.locator("#export-root").screenshot({ path: dest, type: "png" });
  console.log(`Wrote ${out}`);
  await page.close();
}

await browser.close();
