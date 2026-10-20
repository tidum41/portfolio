#!/usr/bin/env node
/**
 * Font proof + 2× element crops for placement polish QA.
 * Usage: node scripts/capture-dialogue-placement-proofs.mjs [--base=http://localhost:3000]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir =
  process.env.PLACEMENT_PROOF_DIR ??
  path.join(root, ".playwright-screenshots", "dialogue-placement-proofs");
const base =
  process.argv.find((a) => a.startsWith("--base="))?.slice("--base=".length) ??
  "http://localhost:3000";

execSync("node scripts/ensure-dialogue-areal-fonts.mjs", { cwd: root, stdio: "inherit" });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
await page.goto(`${base}/dev/dialogue-placement-export/docked`, { waitUntil: "networkidle" });
await page.waitForSelector("#export-root");
await page.waitForSelector("[data-placement-proof-text]", { timeout: 60000 });
await page.waitForFunction(async () => {
  const sample = document.querySelector("[data-placement-proof-text]");
  if (!sample) return false;
  try {
    await document.fonts.load('400 15px "ABC Areal Placement"');
    await document.fonts.load('500 15px "ABC Areal Placement"');
    await document.fonts.ready;
  } catch {
    return false;
  }
  const family = getComputedStyle(sample).fontFamily.toLowerCase();
  return (
    family.includes("abc areal placement") &&
    document.fonts.check('400 13px "ABC Areal Placement"') &&
    document.fonts.check('500 15px "ABC Areal Placement"')
  );
});

const fontReport = await page.evaluate(() => {
  const exportRoot = document.getElementById("export-root");
  const computedFontFamily = exportRoot ? getComputedStyle(exportRoot).fontFamily : null;
  const sample = document.querySelector("[data-placement-proof-text]");
  const sampleFont = sample ? getComputedStyle(sample).fontFamily : null;
  const areal = [...document.fonts].find((f) => /abc areal placement/i.test(f.family));
  return {
    computedFontFamily,
    sampleFont,
    arealLoaded:
      document.fonts.check('400 13px "ABC Areal Placement"') &&
      document.fonts.check('500 15px "ABC Areal Placement"'),
    arealFamily: areal?.family ?? null,
    arealStatus: areal?.status ?? null,
    documentFonts: [...document.fonts]
      .filter((f) => /abc areal placement/i.test(f.family))
      .map((f) => ({ family: f.family, weight: f.weight, status: f.status })),
  };
});

fs.writeFileSync(path.join(outDir, "font-proof.json"), JSON.stringify(fontReport, null, 2));
console.log("Font proof:", JSON.stringify(fontReport, null, 2));

if (!fontReport.arealLoaded) {
  await browser.close();
  process.exit(1);
}

await page.evaluate(() => {
  const exportRoot = document.getElementById("export-root");
  if (!exportRoot) return;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
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

const crops = [
  { name: "transcript", selector: "[data-placement-crop='transcript']" },
  { name: "assistant-top", selector: "[data-placement-crop='assistant-top']" },
  { name: "funnel", selector: "[data-placement-crop='funnel']" },
  { name: "player", selector: "[data-placement-crop='player']" },
];

for (const { name, selector } of crops) {
  const loc = page.locator(selector);
  await loc.waitFor({ state: "visible", timeout: 15000 });
  await loc.screenshot({ path: path.join(outDir, `crop-${name}-2x.png`), type: "png", scale: "css" });
  console.log(`Wrote crop-${name}-2x.png`);
}

await browser.close();
