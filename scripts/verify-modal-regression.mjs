/**
 * Smoke: home cards render; CD / habit / allinone modals open & close.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function skipIntro(page) {
  await page.evaluate(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-intro") === "playing") {
      html.setAttribute("data-intro", "done");
      window.dispatchEvent(new CustomEvent("intro-done"));
      html.removeAttribute("data-intro");
    } else {
      html.removeAttribute("data-intro");
    }
  });
  await page
    .waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), {
      timeout: 5000,
    })
    .catch(() => {});
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await skipIntro(page);

  const cards = page.locator("[data-grid-card]");
  const n = await cards.count();
  assert(n >= 3, `expected ≥3 home cards, got ${n}`);
  console.log("home cards", n);

  // Allinone
  await page.locator('[data-grid-card="project-todolist"] [role="button"]').first().click();
  await page
    .locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]')
    .waitFor({ state: "visible", timeout: 10000 });
  assert(await page.locator(".aio-demo-skel").count() === 1, "missing allinone skeleton");
  await page.locator(".popup-close-btn").first().click();
  await page
    .locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]')
    .waitFor({ state: "hidden", timeout: 10000 });
  console.log("allinone ok");

  // CD / habit cards are themselves role=button
  await page.locator('[data-grid-card="cd"]').click({ position: { x: 24, y: 24 }, force: true });
  await page.locator('[role="dialog"][aria-label="Drag a CD"]').waitFor({
    state: "visible",
    timeout: 10000,
  });
  await page.locator(".popup-close-btn").first().click();
  await page.locator('[role="dialog"][aria-label="Drag a CD"]').waitFor({
    state: "hidden",
    timeout: 10000,
  });
  console.log("cd ok");

  await page.locator('[data-grid-card="habit"]').click({ position: { x: 24, y: 24 }, force: true });
  await page.locator('[role="dialog"][aria-label="Dumb Habit Tracker"]').waitFor({
    state: "visible",
    timeout: 10000,
  });
  await page.locator(".popup-close-btn").first().click();
  await page.locator('[role="dialog"][aria-label="Dumb Habit Tracker"]').waitFor({
    state: "hidden",
    timeout: 10000,
  });
  console.log("habit ok");

  await browser.close();
  console.log("regression smoke passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
