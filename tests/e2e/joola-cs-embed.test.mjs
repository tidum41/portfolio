/**
 * Case-study embed mode (cs=1): hover works; click, selection, and focus do not.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chromium } from "playwright";

const BASE = process.env.JOOLA_CAPTURE_BASE ?? "http://localhost:3000";
const URL = `${BASE}/joola?sanity_preview=1`;

describe("joola case-study embed (cs=1)", () => {
  it("blocks interaction inside iframes but keeps segmented controls usable", async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      extraHTTPHeaders: { "x-joola-sanity-preview": "1" },
    });
  const page = await context.newPage();
  try {
    await page.goto(URL, { waitUntil: "load", timeout: 120000 });
    await page.locator('[data-joola-figure="quick-order-hero"] iframe').waitFor({ state: "visible" });
    await page.waitForTimeout(2000);

    const heroFrame = page.frameLocator('[data-joola-figure="quick-order-hero"] iframe');
    const line = heroFrame.locator("[data-qo-line]").first();
    const plus = line.locator("[data-qo-plus]");
    const qty = line.locator('input[data-qo-fit]');
    const before = await qty.inputValue();
    await plus.click({ force: true });
    const after = await qty.inputValue();
    assert.equal(after, before, "Qty must not change after click inside cs embed");

    const hero = page.locator('[data-joola-figure="quick-order-hero"] iframe');
    const box = await hero.boundingBox();
    assert.ok(box);
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.35);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.45);
    await page.mouse.up();
    const selection = await heroFrame
      .locator("body")
      .evaluate(() => window.getSelection()?.toString() ?? "");
    assert.equal(selection, "", "Text selection inside embed should be empty");

    const hoverBtn = line.locator("[data-qo-plus]");
    const bgDefault = await hoverBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const btnBox = await hoverBtn.boundingBox();
    assert.ok(btnBox);
    await page.mouse.move(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);
    await page.waitForTimeout(80);
    const bgHover = await hoverBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    assert.notEqual(
      bgHover,
      bgDefault,
      "Qty stepper button hover style should still apply under cs=1",
    );

    await page.locator("#decision-2").scrollIntoViewIfNeeded();
    const stockTab = page.getByRole("tab", { name: "Stock status" });
    await stockTab.click();
    await page.waitForTimeout(300);
    const active = await stockTab.getAttribute("aria-selected");
    assert.equal(active, "true", "Case-study segmented control outside iframe must remain clickable");

  } finally {
    await context.close();
    await browser.close();
  }
  });
});
