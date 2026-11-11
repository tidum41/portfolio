/**
 * Capture /joola preview and production-mode pages for review artifacts.
 * Usage: SANITY_PREVIEW_DRAFTS=1 node scripts/joola-sanity-capture.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("artifacts/joola-sanity");
const BASE = process.env.JOOLA_CAPTURE_BASE ?? "http://localhost:3000";

async function shot(page, name, width, height, theme) {
  await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
  await page.setViewportSize({ width, height });
  await page.goto(`${BASE}/joola`, { waitUntil: "networkidle" });
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }, theme);
  await page.waitForSelector("[data-joola-iframe]", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const shots = [];
  for (const [w, h, tag] of [
    [1440, 900, "1440"],
    [390, 844, "390"],
  ]) {
    shots.push(await shot(page, `joola-preview-${tag}-light`, w, h, "light"));
    shots.push(await shot(page, `joola-preview-${tag}-dark`, w, h, "dark"));
  }

  const prodPage = await browser.newPage();
  await prodPage.addInitScript(() => {
    delete window.__SANITY_PREVIEW__;
  });
  for (const [w, h, tag] of [
    [1440, 900, "1440"],
    [390, 844, "390"],
  ]) {
    await prodPage.emulateMedia({ colorScheme: "light" });
    await prodPage.setViewportSize({ width: w, height: h });
    await prodPage.goto(`${BASE}/joola`, { waitUntil: "networkidle" });
    const file = path.join(OUT, `joola-production-${tag}.png`);
    await prodPage.screenshot({ path: file, fullPage: true });
    shots.push(file);
  }

  await browser.close();
  await writeFile(
    path.join(OUT, "capture-manifest.json"),
    JSON.stringify({ base: BASE, shots, at: new Date().toISOString() }, null, 2),
  );
  console.log("Wrote", shots.length, "screenshots to", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
