#!/usr/bin/env node
/**
 * Captures section-6b (docked) and section-6 (floating) from the dev export route.
 * Usage: node scripts/capture-dialogue-placement.mjs [--base=http://localhost:3000]
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

const TILE_W = 1600;
const TILE_H = 1200;

const shots = [
  { variant: "docked", out: "public/dialogue/section-6b.png" },
  { variant: "floating", out: "public/dialogue/section-6.png" },
];

const browser = await chromium.launch();

for (const { variant, out } of shots) {
  const context = await browser.newContext({
    viewport: { width: TILE_W, height: TILE_H },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  const url = `${base}/dev/dialogue-placement-export/${variant}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("#export-root");
  await page.waitForFunction(() => {
    const img = document.querySelector('img[data-dialogue-placement-still="true"]');
    return img instanceof HTMLImageElement && img.complete && img.naturalWidth >= 1900;
  });
  await page.evaluate(() => {
    const exportRoot = document.getElementById("export-root");
    if (!exportRoot) return;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.background = "#F6F4F1";
    let chain = exportRoot;
    while (chain.parentElement && chain.parentElement !== document.body) {
      const parent = chain.parentElement;
      for (const sib of [...parent.children]) {
        if (sib !== chain) sib.style.setProperty("display", "none", "important");
      }
      chain = parent;
    }
    for (const child of [...document.body.children]) {
      if (!child.contains(exportRoot)) child.style.setProperty("display", "none", "important");
    }
  });
  await page.waitForTimeout(80);
  const dest = path.join(root, out);
  await page.locator("#export-root").screenshot({
    path: dest,
    type: "png",
    animations: "disabled",
  });
  // Trim occasional 1px viewport gutter on the far right.
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(dest).raw().toBuffer({ resolveWithObject: true });
  let trimRight = 0;
  for (let x = info.width - 1; x >= info.width - 24 && x >= 0; x--) {
    let dark = 0;
    for (let y = 0; y < info.height; y++) {
      const i = (y * info.width + x) * info.channels;
      if (data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40) dark++;
    }
    if (dark > info.height * 0.9) trimRight++;
    else break;
  }
  if (trimRight > 0) {
    const tmp = `${dest}.tmp.png`;
    await sharp(dest)
      .extract({ left: 0, top: 0, width: info.width - trimRight, height: info.height })
      .extend({
        right: trimRight,
        background: { r: 246, g: 244, b: 241 },
      })
      .png()
      .toFile(tmp);
    fs.renameSync(tmp, dest);
  }
  console.log(`Wrote ${out}${trimRight ? ` (padded ${trimRight}px gutter)` : ""}`);
  await context.close();
}

await browser.close();
