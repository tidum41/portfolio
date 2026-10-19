/**
 * Pointer sweeps for card focus @ 1440 — asserts dim state after each step.
 * Run: node scripts/verify-card-focus-sweep.mjs (dev server on :3000)
 */
import { chromium } from "playwright";

const RECEDE_DARK = "0.35";
const RECEDE_LIGHT = "0.45";
const EDGE_MS = 40;
const FADE_IN_MS = 120;
const FADE_OUT_MS = 160;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function nearOpacity(actual, expected, tolerance = 0.06) {
  return Math.abs(parseFloat(actual) - parseFloat(expected)) <= tolerance;
}

async function readState(page) {
  return page.evaluate(() => {
    const hero = document.querySelector(".work-hero");
    const cards = [...document.querySelectorAll(".portfolio-grid-card")];
    const focused = document.documentElement.hasAttribute("data-card-focus");
    const activeId = document.querySelector("[data-card-focus-active]")?.getAttribute("data-grid-card") ?? null;
    const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    return {
      focused,
      activeId,
      theme,
      heroOpacity: hero ? getComputedStyle(hero).opacity : null,
      cards: cards.map((c) => ({
        id: c.getAttribute("data-grid-card"),
        active: c.hasAttribute("data-card-focus-active"),
        childOpacity: c.firstElementChild ? getComputedStyle(c.firstElementChild).opacity : null,
      })),
    };
  });
}

function expectNeutralDom(state, label) {
  assert(!state.focused, `${label}: should not have data-card-focus`);
  assert(state.activeId === null, `${label}: no active card`);
  for (const c of state.cards) {
    assert(!c.active, `${label}: card ${c.id} should not be active`);
  }
}

function expectUndimmed(state, label) {
  assert(state.heroOpacity === "1", `${label}: hero must stay at 1, got ${state.heroOpacity}`);
  expectNeutralDom(state, label);
  for (const c of state.cards) {
    assert(nearOpacity(c.childOpacity, "1"), `${label}: card ${c.id} should be 1, got ${c.childOpacity}`);
  }
}

function expectFocused(state, activeId, label) {
  const recede = state.theme === "light" ? RECEDE_LIGHT : RECEDE_DARK;
  assert(state.heroOpacity === "1", `${label}: hero must stay at 1`);
  assert(state.focused, `${label}: should have data-card-focus`);
  assert(state.activeId === activeId, `${label}: active ${state.activeId} expected ${activeId}`);
  for (const c of state.cards) {
    if (c.id === activeId) {
      assert(c.active, `${label}: ${c.id} should be active`);
      assert(c.childOpacity === "1", `${label}: active card opacity 1`);
    } else {
      assert(!c.active, `${label}: ${c.id} should not be active`);
      assert(nearOpacity(c.childOpacity, recede), `${label}: ${c.id} recede ${c.childOpacity} expected ~${recede}`);
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".portfolio-grid-card");
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), { timeout: 15000 });
  await page.waitForTimeout(500);

  const leftCard = page.locator(".portfolio-grid-col").first().locator(".portfolio-grid-card").first();
  const rightCard = page.locator(".portfolio-grid-col").nth(1).locator(".portfolio-grid-card").first();
  const b0 = await leftCard.boundingBox();
  const b1 = await rightCard.boundingBox();
  assert(b0 && b1, "need cards in both columns");
  const id0 = await leftCard.getAttribute("data-grid-card");
  const id1 = await rightCard.getAttribute("data-grid-card");
  const gutterX = b0.x + b0.width + 4;
  const gutterY = b0.y + 80;
  const cx0 = b0.x + b0.width / 2;
  const cy0 = b0.y + 100;

  expectUndimmed(await readState(page), "initial");

  await page.mouse.move(cx0, cy0, { steps: 4 });
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id0,
    { timeout: 2000 },
  );
  assert(
    (await readState(page)).focused,
    "instant activation: data-card-focus should be set without intent delay",
  );
  await page.waitForTimeout(FADE_IN_MS + 80);
  expectFocused(await readState(page), id0, "on card 0");

  await page.mouse.move(gutterX, gutterY, { steps: 4 });
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-card-focus"), { timeout: 3000 });
  await page.waitForTimeout(FADE_OUT_MS + 100);
  expectUndimmed(await readState(page), "in gutter");

  await page.mouse.move(b1.x + b1.width / 2, b1.y + 100, { steps: 4 });
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id1,
    { timeout: 3000 },
  );
  await page.waitForTimeout(FADE_IN_MS + 80);
  expectFocused(await readState(page), id1, "on card 1 after gap");

  for (let i = 0; i < 8; i++) {
    const box = i % 2 === 0 ? b0 : b1;
    await page.mouse.move(box.x + box.width / 2, box.y + 100, { steps: 1 });
    await page.waitForTimeout(50);
  }
  await page.mouse.move(gutterX, gutterY, { steps: 2 });
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-card-focus"), { timeout: 3000 });
  await page.mouse.move(cx0, cy0, { steps: 4 });
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id0,
    { timeout: 3000 },
  );
  await page.waitForTimeout(FADE_IN_MS + 80);
  expectFocused(await readState(page), id0, "after rapid alternation settled on card 0");

  // Scroll reset: focus then wheel — neutral immediately; no re-focus until pointermove.
  await page.mouse.move(cx0, cy0);
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id0,
    { timeout: 2000 },
  );
  await page.mouse.wheel(0, 120);
  await page.evaluate(() => window.scrollBy(0, 60));
  expectNeutralDom(await readState(page), "after scroll with pointer still over card");

  await page.mouse.move(10, 10, { steps: 2 });
  const b0AfterScroll = await leftCard.boundingBox();
  assert(b0AfterScroll, "left card box after scroll");
  await page.mouse.move(b0AfterScroll.x + b0AfterScroll.width / 2, b0AfterScroll.y + 100, { steps: 8 });
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id0,
    { timeout: 2000 },
  );
  await page.waitForTimeout(FADE_IN_MS + 80);
  expectFocused(await readState(page), id0, "after pointermove following scroll");

  await page.mouse.move(40, 40, { steps: 6 });
  await page.waitForTimeout(EDGE_MS + FADE_OUT_MS + 80);
  expectUndimmed(await readState(page), "left grid");

  console.log("card-focus sweep: all assertions passed");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
