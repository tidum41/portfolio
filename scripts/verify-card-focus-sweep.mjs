/**
 * Card focus driver verification @ 1440 (Chromium).
 * Run: node scripts/verify-card-focus-sweep.mjs (dev server on :3000)
 */
import { chromium } from "playwright";

const RECEDE_DARK = "0.35";
const RECEDE_LIGHT = "0.45";
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

function hitCardId(page, x, y) {
  return page.evaluate(
    ([px, py]) =>
      document.elementFromPoint(px, py)?.closest?.(".portfolio-grid-card")?.getAttribute("data-grid-card") ?? null,
    [x, y],
  );
}

function expectNeutralDom(state, label) {
  assert(!state.focused, `${label}: no data-card-focus`);
  assert(state.activeId === null, `${label}: no active card`);
  for (const c of state.cards) assert(!c.active, `${label}: ${c.id} not active`);
}

function expectUndimmed(state, label) {
  assert(state.heroOpacity === "1", `${label}: hero opacity 1`);
  expectNeutralDom(state, label);
  for (const c of state.cards) {
    assert(nearOpacity(c.childOpacity, "1"), `${label}: ${c.id} opacity 1, got ${c.childOpacity}`);
  }
}

function expectFocused(state, activeId, label) {
  const recede = state.theme === "light" ? RECEDE_LIGHT : RECEDE_DARK;
  assert(state.heroOpacity === "1", `${label}: hero opacity 1`);
  assert(state.focused, `${label}: data-card-focus set`);
  assert(state.activeId === activeId, `${label}: active ${state.activeId} expected ${activeId}`);
  for (const c of state.cards) {
    if (c.id === activeId) {
      assert(c.active, `${label}: ${c.id} active`);
      assert(c.childOpacity === "1", `${label}: active card full opacity`);
    } else {
      assert(!c.active, `${label}: ${c.id} not active`);
      assert(nearOpacity(c.childOpacity, recede), `${label}: ${c.id} ~${recede}, got ${c.childOpacity}`);
    }
  }
}

async function scrollUntilHit(page, x, y, predicate, maxSteps = 30) {
  for (let i = 0; i < maxSteps; i++) {
    const hit = await hitCardId(page, x, y);
    if (predicate(hit)) return;
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(28);
  }
  throw new Error(`scrollUntilHit: condition not met at (${x}, ${y})`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".portfolio-grid-card");
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), { timeout: 15000 });
  await page.waitForTimeout(400);

  const leftCard = page.locator(".portfolio-grid-col").first().locator(".portfolio-grid-card").first();
  const rightCard = page.locator(".portfolio-grid-col").nth(1).locator(".portfolio-grid-card").first();
  const leftSecond = page.locator(".portfolio-grid-col").first().locator(".portfolio-grid-card").nth(1);
  const b0 = await leftCard.boundingBox();
  const b1 = await rightCard.boundingBox();
  assert(b0 && b1, "need both columns");
  const id0 = await leftCard.getAttribute("data-grid-card");
  const id1 = await rightCard.getAttribute("data-grid-card");
  const id0b = await leftSecond.getAttribute("data-grid-card");
  const cx0 = b0.x + b0.width / 2;
  const cy0 = b0.y + 100;
  const gutterX = b0.x + b0.width + 4;
  const gutterY = b0.y + 80;

  expectUndimmed(await readState(page), "initial");

  await page.mouse.move(8, 8);
  await page.evaluate(() => {
    window.__focusAt = 0;
    new MutationObserver(() => {
      if (document.documentElement.hasAttribute("data-card-focus") && !window.__focusAt) {
        window.__focusAt = performance.now();
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-card-focus"] });
    window.__moveAt = performance.now();
  });
  await page.mouse.move(cx0, cy0, { steps: 1 });
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-card-focus"), { timeout: 50 });
  const frameBudget = await page.evaluate(() => window.__focusAt - window.__moveAt);
  assert(frameBudget >= 0 && frameBudget < 50, `focus within ~one frame, saw ${frameBudget}ms`);

  await page.waitForTimeout(FADE_IN_MS + 60);
  expectFocused(await readState(page), id0, "on card 0");

  await page.mouse.move(gutterX, gutterY, { steps: 4 });
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-card-focus"), { timeout: 2000 });
  await page.waitForTimeout(FADE_OUT_MS + 60);
  expectUndimmed(await readState(page), "gutter");

  await page.mouse.move(b1.x + b1.width / 2, b1.y + 100, { steps: 4 });
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id1,
    { timeout: 2000 },
  );
  await page.waitForTimeout(FADE_IN_MS + 60);
  expectFocused(await readState(page), id1, "card 1 after gap");

  for (let i = 0; i < 10; i++) {
    const box = i % 2 === 0 ? b0 : b1;
    await page.mouse.move(box.x + box.width / 2, box.y + 100, { steps: 1 });
    await page.waitForTimeout(40);
  }
  await page.mouse.move(gutterX, gutterY, { steps: 2 });
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-card-focus"), { timeout: 2000 });
  await page.mouse.move(cx0, cy0, { steps: 6 });
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id0,
    { timeout: 2000 },
  );
  await page.waitForTimeout(FADE_IN_MS + 60);
  expectFocused(await readState(page), id0, "after rapid alternation");

  // Scroll re-hit-test (fixed cursor):
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  await page.mouse.move(cx0, cy0);
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id0,
    { timeout: 2000 },
  );

  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(32);
  expectFocused(await readState(page), id0, "scroll: same card under cursor stays focused");

  await page.mouse.move(gutterX, gutterY, { steps: 2 });
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-card-focus"), { timeout: 2000 });
  assert(await hitCardId(page, gutterX, gutterY) === null, "gutter should not hit a card");
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(32);
  expectNeutralDom(await readState(page), "scroll: gap under cursor stays cleared");

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
  const switchY = 550;
  await page.mouse.move(cx0, switchY, { steps: 4 });
  await page.waitForFunction(
    (id) => document.querySelector(`[data-card-focus-active][data-grid-card="${id}"]`),
    id0,
    { timeout: 2000 },
  );
  await scrollUntilHit(page, cx0, switchY, (hit) => hit === id0b);
  await page.waitForTimeout(FADE_IN_MS + 60);
  expectFocused(await readState(page), id0b, "scroll: switches to next card under cursor");

  await page.mouse.move(20, 20, { steps: 4 });
  await page.waitForTimeout(FADE_OUT_MS + 80);
  expectUndimmed(await readState(page), "left page");

  console.log("card-focus sweep: all assertions passed");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
