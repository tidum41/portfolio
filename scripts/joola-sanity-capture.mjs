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

async function scrollEntirePageAndWait(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(200, Math.floor(window.innerHeight * 0.75));
    let y = 0;
    const max = document.documentElement.scrollHeight;
    while (y < max) {
      window.scrollTo(0, y);
      await delay(250);
      y += step;
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await delay(3000);
  });
}

async function assertNoVisibleSkeletons(page) {
  const visible = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("[data-joola-skeleton]")];
    return nodes.filter((el) => {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    }).map((el) => el.getAttribute("data-joola-skeleton"));
  });
  if (visible.length > 0) {
    throw new Error(
      `Skeleton UI still visible after full-page scroll + 3s: ${visible.join(", ")}`,
    );
  }
}

async function assertSegmentedFootersCentered(page) {
  const bad = await page.evaluate(() => {
    const footers = [...document.querySelectorAll(".joola-proto-figure__footer--center")];
    return footers
      .filter((el) => getComputedStyle(el).justifyContent !== "center")
      .map((el) => el.closest("[data-joola-figure]")?.getAttribute("data-joola-figure") ?? "?");
  });
  if (bad.length > 0) {
    throw new Error(`Segmented footer not centered for figures: ${bad.join(", ")}`);
  }
}

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
  const heroFooter = await page
    .locator('[data-joola-figure="quick-order-hero"] iframe')
    .contentFrame()
    .getByText(/Adds 5 lines/)
    .count();
  if (heroFooter < 1) {
    throw new Error("Hero footer must summarize five visible rows (Adds 5 lines)");
  }
  const heroFrame = page
    .locator('[data-joola-figure="quick-order-hero"] iframe')
    .contentFrame();
  const presetChips = await heroFrame.locator(".qty-stepper__presets button").count();
  if (presetChips > 0) {
    throw new Error("Hero quick-order must use compact stepper only (no preset chips)");
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
  await scrollEntirePageAndWait(page);
  await assertNoVisibleSkeletons(page);
  await assertSegmentedFootersCentered(page);
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
