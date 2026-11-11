/**
 * Toggled JOOLA figures must never show an empty chrome slot (no blank flash).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chromium } from "playwright";

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

describe("joola embed toggles", () => {
  it("never leaves variant chrome empty while switching", async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle", timeout: 120000 });

    const toggles = [
      { section: "#decision-2", tabs: ["Cases", "Reorder", "Stock status"] },
      { section: "#decision-4", tabs: ["Split inbox", "Ledger"] },
    ];

    for (const block of toggles) {
      await page.locator(block.section).scrollIntoViewIfNeeded();
      for (const tab of block.tabs) {
        await page.getByRole("tab", { name: tab }).click();
        await page.waitForTimeout(400);
        const lum = await chromeLuminance(page, `${block.section} .joola-proto-figure__chrome`);
        assert.ok(lum > 15, `Chrome looked empty after selecting ${tab} (luminance ${lum})`);
      }
    }

    await browser.close();
  });
});
