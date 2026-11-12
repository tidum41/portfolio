/**
 * Toggled JOOLA figures must never show an empty chrome slot (no blank flash).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chromium } from "playwright";
import {
  assertAllImagesLoaded,
  waitForImages,
} from "../joola/assertImagesLoaded.mjs";

const BASE = process.env.JOOLA_CAPTURE_BASE ?? "http://localhost:3000";
const URL = `${BASE}/joola?sanity_preview=1`;

async function chromeLuminance(page, selector) {
  return page.$eval(selector, (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return 0;
    const style = getComputedStyle(el);
    const bg = style.backgroundColor;
    const m = bg.match(/\d+/g);
    if (!m || m.length < 3) return 128;
    return (Number(m[0]) + Number(m[1]) + Number(m[2])) / 3;
  });
}

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

describe("joola embed toggles", () => {
  it("never leaves variant chrome empty while switching", async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      extraHTTPHeaders: { "x-joola-sanity-preview": "1" },
    });
    const page = await context.newPage();
    try {
    await page.goto(URL, { waitUntil: "load", timeout: 120000 });
    await page.locator('[data-joola-figure="quick-order-hero"] iframe').waitFor({ state: "visible" });
    await page.waitForTimeout(2000);

    const toggles = [
      { section: "#decision-2", tabs: ["Cases", "Reorder", "Stock status"] },
      { section: "#decision-4", tabs: ["Split inbox", "Ledger"] },
    ];

    for (const block of toggles) {
      await page.locator(block.section).scrollIntoViewIfNeeded();
      const justify = await page.$eval(
        `${block.section} .joola-proto-figure__footer`,
        (el) => getComputedStyle(el).justifyContent,
      );
      assert.equal(justify, "center", `Footer should be centered in ${block.section}`);
      for (const tab of block.tabs) {
        await page.getByRole("tab", { name: tab }).click();
        await page.waitForTimeout(400);
        const lum = await chromeLuminance(page, `${block.section} .joola-proto-figure__chrome`);
        assert.ok(lum > 15, `Chrome looked empty after selecting ${tab} (luminance ${lum})`);
      }
    }

    await scrollEntirePageAndWait(page);
    await waitForImages(page);
    await assertAllImagesLoaded(page);
    const skeletonCount = await page.locator("[data-joola-skeleton]:visible").count();
    assert.equal(skeletonCount, 0, "No skeleton should remain after full-page scroll + 3s");

    } finally {
    await context.close();
    await browser.close();
    }
  });
});
