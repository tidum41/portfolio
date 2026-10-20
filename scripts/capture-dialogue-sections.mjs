import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const BASE =
  "https://portfolio-git-cursor-dialogue-c-137e56-mudits-projects-d560e6b3.vercel.app/dialogue?_vercel_share=erDMkrK3IIqeM8Vbbw4ZUU1V9kpbmSU0";
const OUT = "/opt/cursor/artifacts/dialogue-sections";

const SECTIONS = [
  { n: "01", slug: "problem", id: "problem" },
  { n: "02", slug: "why-it-matters", id: "why-it-matters" },
  { n: "03", slug: "one-structure", id: "one-structure" },
  { n: "04", slug: "fitted-charts", id: "fitted-charts" },
  { n: "05", slug: "proof", id: "proof" },
  { n: "06", slug: "clips", id: "clips" },
  { n: "07", slug: "imperfect-evidence", id: "imperfect-evidence" },
  { n: "08", slug: "share-finding", id: "share-finding" },
  { n: "09", slug: "placement", id: "placement" },
  { n: "10", slug: "full-answer", id: "full-answer" },
  { n: "11", slug: "outcome", id: "outcome" },
  { n: "12", slug: "reflection", id: "reflection" },
];

async function waitForImages(page) {
  return page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const imgs = () => [...document.querySelectorAll("img")];

    for (let pass = 0; pass < 8; pass++) {
      for (const img of imgs()) {
        if (img.loading === "lazy") img.loading = "eager";
        if (!img.complete) {
          await new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          });
        }
      }
      await sleep(150);
    }

    const broken = imgs()
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => ({ src: img.currentSrc || img.src, alt: img.alt }));

    return broken;
  });
}

async function slowScroll(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(280, Math.floor(window.innerHeight * 0.45));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await sleep(220);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await sleep(300);
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    document.documentElement.setAttribute("data-theme", "light");
    try {
      localStorage.setItem("theme", "light");
    } catch {
      /* ignore */
    }
  });

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.removeAttribute("data-intro");
  });
  await page.waitForTimeout(800);

  await slowScroll(page);
  let broken = await waitForImages(page);
  if (broken.length) {
    await slowScroll(page);
    broken = await waitForImages(page);
  }

  const paths = [];

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);

  for (const { n, slug, id } of SECTIONS) {
    const el = page.locator(`#${id}`);
    await el.scrollIntoViewIfNeeded({ timeout: 30_000 });
    await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }, id);
    await page.waitForTimeout(400);
    await waitForImages(page);
    const file = `${OUT}/${n}-${slug}-1440.png`;
    await page.screenshot({ path: file, fullPage: false });
    paths.push(file);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(500);
  await waitForImages(page);
  paths.push(`${OUT}/00-hero-390.png`);
  await page.screenshot({ path: `${OUT}/00-hero-390.png`, fullPage: false });

  for (const { n, slug, id } of SECTIONS) {
    const el = page.locator(`#${id}`);
    await el.scrollIntoViewIfNeeded({ timeout: 30_000 });
    await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }, id);
    await page.waitForTimeout(500);
    await waitForImages(page);
    const file = `${OUT}/${n}-${slug}-390.png`;
    await page.screenshot({ path: file, fullPage: false });
    paths.push(file);
  }

  const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));

  await browser.close();

  console.log(JSON.stringify({ paths, broken, theme }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
