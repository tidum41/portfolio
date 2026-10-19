/**
 * Early-hover race: Slow 4G reload, hover at ~300ms and ~1s; others paused within 200ms.
 * Run: node scripts/verify-card-focus-early-hover.mjs (dev on :3000)
 */
import { chromium } from "playwright";

const PAUSE_DEADLINE_MS = 200;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function othersPausedForActive(page, activeId) {
  return page.evaluate((id) => {
    if (!document.documentElement.hasAttribute("data-card-focus")) return false;
    const active = document.querySelector("[data-card-focus-active]")?.getAttribute("data-grid-card");
    if (active !== id) return false;
    const cards = [...document.querySelectorAll(".portfolio-grid-card")];
    const withVideo = cards.filter((c) => c.querySelector("video"));
    if (withVideo.length < 2) return true;
    for (const c of cards) {
      if (c.getAttribute("data-grid-card") === id) continue;
      for (const v of c.querySelectorAll("video")) {
        if (!v.paused) return false;
      }
    }
    return true;
  }, activeId);
}

async function assertOthersPausedWithin(page, activeId, label) {
  const start = Date.now();
  while (Date.now() - start < PAUSE_DEADLINE_MS) {
    if (await othersPausedForActive(page, activeId)) return;
    await page.waitForTimeout(8);
  }
  const detail = await page.evaluate(() =>
    [...document.querySelectorAll(".portfolio-grid-card")].map((c) => ({
      id: c.getAttribute("data-grid-card"),
      active: c.hasAttribute("data-card-focus-active"),
      paused: [...c.querySelectorAll("video")].map((v) => v.paused),
    })),
  );
  throw new Error(`${label}: non-focused videos not paused within ${PAUSE_DEADLINE_MS}ms: ${JSON.stringify(detail)}`);
}

async function hoverFirstCard(page) {
  const box = await page.locator(".portfolio-grid-col").first().locator(".portfolio-grid-card").first().boundingBox();
  assert(box, "need first card box");
  const id = await page.locator(".portfolio-grid-col").first().locator(".portfolio-grid-card").first().getAttribute("data-grid-card");
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(100, box.height / 2);
  await page.mouse.move(x, y, { steps: 2 });
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-card-focus"), { timeout: 500 });
  return { id, x, y };
}

async function neutral(page) {
  await page.mouse.move(8, 8, { steps: 2 });
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-card-focus"), { timeout: 2000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    downloadThroughput: (500 * 1024) / 8,
    uploadThroughput: (500 * 1024) / 8,
    latency: 400,
  });

  const navStart = Date.now();
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".portfolio-grid-card", { timeout: 20000 });
  await page.evaluate(() => document.documentElement.removeAttribute("data-intro"));
  await page.waitForFunction(() => window.__cardFocusReady === true, { timeout: 30000 });

  const waitUntilFromNav = async (msFromNav) => {
    const elapsed = Date.now() - navStart;
    if (elapsed < msFromNav) await page.waitForTimeout(msFromNav - elapsed);
  };

  await waitUntilFromNav(300);
  const { id: idEarly } = await hoverFirstCard(page);
  await assertOthersPausedWithin(page, idEarly, "hover at ~300ms");

  await neutral(page);
  await waitUntilFromNav(1000);
  const { id: idLate } = await hoverFirstCard(page);
  assert(idLate === idEarly, "same card id");
  await assertOthersPausedWithin(page, idLate, "hover at ~1s");

  const reloadNavStart = Date.now();
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".portfolio-grid-card", { timeout: 20000 });
  await page.evaluate(() => document.documentElement.removeAttribute("data-intro"));
  await page.waitForFunction(() => window.__cardFocusReady === true, { timeout: 30000 });

  const waitReloadFromNav = async (msFromNav) => {
    const elapsed = Date.now() - reloadNavStart;
    if (elapsed < msFromNav) await page.waitForTimeout(msFromNav - elapsed);
  };

  await waitReloadFromNav(300);
  const { id: idR1 } = await hoverFirstCard(page);
  await assertOthersPausedWithin(page, idR1, "hard reload hover ~300ms");

  await neutral(page);
  await waitReloadFromNav(1000);
  const { id: idR2 } = await hoverFirstCard(page);
  await assertOthersPausedWithin(page, idR2, "hard reload hover ~1s");

  console.log("card-focus early-hover: all assertions passed");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
