/**
 * Image-load guard against live (or local) JOOLA sanity preview.
 * Usage: JOOLA_CAPTURE_BASE=https://portfolio-git-...vercel.app node scripts/joola-verify-live-images.mjs
 */
import { chromium } from "playwright";
import {
  assertAllImagesLoaded,
  waitForImages,
} from "../tests/joola/assertImagesLoaded.mjs";

const BASE = process.env.JOOLA_CAPTURE_BASE ?? "http://localhost:3000";
const URL = `${BASE}/joola?sanity_preview=1`;

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

const browser = await chromium.launch();
const ctx = await browser.newContext({
  extraHTTPHeaders: { "x-joola-sanity-preview": "1" },
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "load", timeout: 120000 });
await page.locator('[data-joola-figure="quick-order-hero"] iframe').waitFor({ timeout: 60000 });
await scrollEntirePageAndWait(page);
await waitForImages(page);
await assertAllImagesLoaded(page);
console.log("OK: all images loaded at", URL);
await browser.close();
