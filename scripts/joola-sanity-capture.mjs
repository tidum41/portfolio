/**
 * Capture /joola preview and production-mode pages for review artifacts.
 * Preview: ?sanity_preview=1 + x-joola-sanity-preview header (no dev-server env required).
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("artifacts/joola-sanity");
const BASE = process.env.JOOLA_CAPTURE_BASE ?? "http://localhost:3000";
const PREVIEW_URL = `${BASE}/joola?sanity_preview=1`;

async function assertPreviewPage(page, theme) {
  const dom = await page.evaluate(() => ({
    heroIframe: Boolean(
      document.querySelector(
        '.joola-hero-embed [data-joola-iframe], [data-joola-figure="quick-order-hero"] iframe',
      ),
    ),
    heroPng: Boolean(
      document.querySelector('.cs-hero-media-frame img[src*="hero-ruth"]'),
    ),
    text: document.body.innerText,
    bg: getComputedStyle(document.body).backgroundColor,
  }));

  if (!dom.heroIframe || dom.heroPng) {
    throw new Error("Preview hero must be live iframe, not hero-ruth PNG");
  }
  for (const needle of ["Buy 24+", "Engage Pickleball", "Engage account"]) {
    if (dom.text.includes(needle)) {
      throw new Error(`Banned tier/legacy copy on page: "${needle}"`);
    }
  }

  const m = dom.bg.match(/\d+/g);
  const rgb = m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  const lum = (rgb[0] + rgb[1] + rgb[2]) / 3;
  if (theme === "light" && lum < 180) {
    throw new Error(`Light capture background too dark: ${dom.bg} (lum ${lum.toFixed(0)})`);
  }
  if (theme === "dark" && lum > 90) {
    throw new Error(`Dark capture background too light: ${dom.bg} (lum ${lum.toFixed(0)})`);
  }
}

async function shot(context, name, width, height, theme) {
  const page = await context.newPage();
  await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
  await page.setViewportSize({ width, height });
  await page.goto(PREVIEW_URL, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector(".joola-hero-embed [data-joola-iframe]", {
    timeout: 120000,
  });
  await page.waitForTimeout(2500);
  await assertPreviewPage(page, theme);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
  return file;
}

async function previewContext(browser, theme) {
  const context = await browser.newContext({
    extraHTTPHeaders: { "x-joola-sanity-preview": "1" },
  });
  await context.addInitScript((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }, theme);
  return context;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  const shots = [];
  for (const [w, h, tag] of [
    [1440, 900, "1440"],
    [390, 844, "390"],
  ]) {
    const lightCtx = await previewContext(browser, "light");
    shots.push(await shot(lightCtx, `joola-preview-${tag}-light`, w, h, "light"));
    await lightCtx.close();

    const darkCtx = await previewContext(browser, "dark");
    shots.push(await shot(darkCtx, `joola-preview-${tag}-dark`, w, h, "dark"));
    await darkCtx.close();
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
    JSON.stringify({ base: BASE, previewUrl: PREVIEW_URL, shots, at: new Date().toISOString() }, null, 2),
  );
  console.log("Wrote", shots.length, "screenshots to", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
