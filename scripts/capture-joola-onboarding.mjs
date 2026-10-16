/**
 * Capture JOOLA B2B onboarding screens at 1440 and 390.
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const OUT = "/opt/cursor/artifacts/screenshots";
const BASE = "http://localhost:3000/dev/joola-b2b/onboarding";

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("wrote", file);
}

async function hideOverlays(page) {
  await page.evaluate(() => {
    document.documentElement.dataset.joolaProto = "1";
    document
      .querySelectorAll(".dialkit-root, [data-custom-cursor], [class*='agentation']")
      .forEach((el) => el.remove());
  });
}

async function clickBtn(page, name) {
  await hideOverlays(page);
  await page.locator(".joola-b2b").getByRole("button", { name }).evaluate((el) => {
    el.click();
  });
}

async function goThrough(page, width, height, prefix) {
  await page.setViewportSize({ width, height });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector(".ob-title");
  await hideOverlays(page);
  await shot(page, `${prefix}-01-welcome.png`);

  await clickBtn(page, "Set up your account");
  await page.waitForSelector("#ob-defaults-title");
  await hideOverlays(page);
  await shot(page, `${prefix}-02-defaults-empty.png`);

  // Show PO validation error
  await page.fill("#ob-po", "bad po!!");
  await page.locator("#ob-po").evaluate((el) => el.blur());
  await page.waitForSelector(".field-error");
  await hideOverlays(page);
  await shot(page, `${prefix}-02b-po-error.png`);

  // Fix PO, continue without ship-to to show ship-to error
  await page.fill("#ob-po", "ENG-9812");
  await page.locator("#ob-po").evaluate((el) => el.blur());
  await clickBtn(page, "Save defaults");
  await page.waitForSelector("text=Choose a ship-to address");
  await hideOverlays(page);
  await shot(page, `${prefix}-02c-shipto-error.png`);

  // Pick ship-to and continue
  await page.locator(".joola-b2b .ship-card").evaluate((el) => el.click());
  await page
    .locator(".joola-b2b .ship-option")
    .first()
    .evaluate((el) => el.click());
  await clickBtn(page, "Save defaults");
  await page.waitForSelector("#ob-terms-title");
  await hideOverlays(page);
  await shot(page, `${prefix}-03-terms.png`);

  await clickBtn(page, "Continue");
  await page.waitForSelector("#ob-first-title");
  await hideOverlays(page);
  await shot(page, `${prefix}-04-first-order.png`);

  await clickBtn(page, "Go to Quick Order");
  await page.waitForSelector("#ob-finish-title");
  await hideOverlays(page);
  await shot(page, `${prefix}-05-finish.png`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await goThrough(page, 1440, 900, "joola-onboarding-desktop");
  await goThrough(page, 390, 844, "joola-onboarding-mobile");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
