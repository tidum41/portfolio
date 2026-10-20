#!/usr/bin/env node
/**
 * Captures section-6b (docked) and section-6 (floating) from the dev export route.
 * Usage: node scripts/capture-dialogue-placement.mjs [--base=http://localhost:3000]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
execSync("node scripts/ensure-dialogue-areal-fonts.mjs", { cwd: root, stdio: "inherit" });
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

const proofOutDir = path.join(root, ".playwright-screenshots", "dialogue-placement-proofs");
fs.mkdirSync(proofOutDir, { recursive: true });

function findArealPlacementCss() {
  const chunkDir = path.join(root, ".next/static/chunks");
  if (!fs.existsSync(chunkDir)) return null;
  for (const file of fs.readdirSync(chunkDir)) {
    if (!file.endsWith(".css")) continue;
    const text = fs.readFileSync(path.join(chunkDir, file), "utf8");
    if (text.includes("ABC Areal Placement")) return file;
  }
  return null;
}

const arealCssFile = findArealPlacementCss();
if (!arealCssFile) {
  console.error("Missing built ABC Areal Placement CSS chunk. Run npm run build after ensure-dialogue-areal-fonts.");
  process.exit(1);
}

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
  await page.addStyleTag({ url: `${base}/_next/static/chunks/${arealCssFile}` });
  await page.waitForFunction(async () => {
    const root = document.getElementById("export-root");
    if (!root) return false;
    try {
      await document.fonts.load('400 15px "ABC Areal Placement"');
      await document.fonts.load('500 15px "ABC Areal Placement"');
      await document.fonts.ready;
    } catch {
      return false;
    }
    const family = getComputedStyle(root).fontFamily.toLowerCase();
    return (
      family.includes("abc areal placement") &&
      document.fonts.check('400 13px "ABC Areal Placement"') &&
      document.fonts.check('500 15px "ABC Areal Placement"')
    );
  });
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

  if (variant === "docked") {
    const fontReport = await page.evaluate(() => {
      const root = document.getElementById("export-root");
      const bodyLine = [...document.querySelectorAll("div")].find((el) =>
        el.textContent?.startsWith("Walk me through what happened at checkout."),
      );
      return {
        exportRootFont: root ? getComputedStyle(root).fontFamily : null,
        bodyLineFont: bodyLine ? getComputedStyle(bodyLine).fontFamily : null,
        arealLoaded:
          document.fonts.check('400 13px "ABC Areal Placement"') &&
          document.fonts.check('500 15px "ABC Areal Placement"'),
        documentFonts: [...document.fonts]
          .filter((f) => /abc areal placement/i.test(f.family))
          .map((f) => ({ family: f.family, weight: f.weight, status: f.status })),
      };
    });
    fs.writeFileSync(path.join(proofOutDir, "font-proof.json"), JSON.stringify(fontReport, null, 2));
    console.log("Font proof:", JSON.stringify(fontReport));

    const sharp = (await import("sharp")).default;
    const cropSpecs = [
      { name: "transcript", locator: page.getByText("Transcript", { exact: true }).locator("xpath=ancestor::div[3]") },
      { name: "assistant-top", locator: page.getByText("Research assistant", { exact: true }).locator("xpath=ancestor::header[1]") },
      { name: "funnel", locator: page.getByText("Checkout funnel, % of participants still in study") },
      { name: "player", locator: page.locator('img[data-dialogue-placement-still="true"]').locator("xpath=ancestor::div[1]") },
    ];
    for (const { name, locator } of cropSpecs) {
      const cropPath = path.join(proofOutDir, `crop-${name}-2x.png`);
      await locator.first().screenshot({ path: cropPath, type: "png", scale: "css" });
      const meta = await sharp(cropPath).metadata();
      const zoomed = `${cropPath}.zoom.png`;
      await sharp(cropPath)
        .resize((meta.width ?? 1) * 2, (meta.height ?? 1) * 2, { kernel: "lanczos3" })
        .png()
        .toFile(zoomed);
      fs.renameSync(zoomed, cropPath);
      console.log(`Wrote ${path.relative(root, cropPath)}`);
    }
  }

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
