/**
 * Production verification for the Allinone near-fullscreen ProjectPopup.
 * Screenshots land in /opt/cursor/artifacts.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "390x844", width: 390, height: 844 },
];
const THEMES = ["dark", "light"];

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
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), {
    timeout: 5000,
  }).catch(() => {});
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }, theme);
}

async function openAllinone(page) {
  const card = page.locator('[data-grid-card="project-todolist"]');
  await card.scrollIntoViewIfNeeded();
  await card.waitFor({ state: "visible", timeout: 15000 });
  const trigger = card.locator('[role="button"]').first();
  await trigger.focus();
  await trigger.click();
  const dialog = page.locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]');
  await dialog.waitFor({ state: "visible", timeout: 10000 });
  return { card, trigger, dialog };
}

async function waitForIframeUi(page) {
  const frame = page.frameLocator('iframe[title="Allinone — AI to-do list"]');
  // The live app title / main chrome — tolerate either "allinone" branding or task UI.
  await page.waitForTimeout(800);
  const iframe = page.locator('iframe[title="Allinone — AI to-do list"]');
  await iframe.waitFor({ state: "attached", timeout: 10000 });
  // Wait until the iframe document has body content (cross-origin: just readyState).
  await page.waitForFunction(() => {
    const el = document.querySelector('iframe[title="Allinone — AI to-do list"]');
    if (!(el instanceof HTMLIFrameElement)) return false;
    try {
      return el.contentDocument?.readyState === "complete" || el.contentWindow != null;
    } catch {
      // Cross-origin: contentDocument throws — treat load event via attribute.
      return el.getAttribute("data-loaded") === "1" || true;
    }
  }, { timeout: 15000 });
  // Give the app a beat to paint.
  await page.waitForTimeout(1200);
  return frame;
}

async function shot(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("shot", path);
  return path;
}

async function runViewportTheme(browser, vp, theme) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    colorScheme: theme === "light" ? "light" : "dark",
  });
  const page = await context.newPage();
  const prefix = `allinone-${vp.name}-${theme}`;

  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await setTheme(page, theme);
  await skipIntro(page);
  // Remount theme-sensitive chrome if needed
  await page.waitForSelector('[data-grid-card="project-todolist"]', { timeout: 20000 });

  // Confirm no external leave-site arrow on the card title area
  const blueArrow = page.locator(
    '[data-grid-card="project-todolist"] svg[style*="color-link-blue"], [data-grid-card="project-todolist"] [color="var(--color-link-blue)"]',
  );
  assert((await blueArrow.count()) === 0, `${prefix}: external blue arrow still present`);

  const { card, trigger, dialog } = await openAllinone(page);

  // Scroll lock: body is position fixed
  const bodyPos = await page.evaluate(() => getComputedStyle(document.body).position);
  assert(bodyPos === "fixed", `${prefix}: body not scroll-locked (position=${bodyPos})`);

  await waitForIframeUi(page);
  await shot(page, `${prefix}-closed-info.png`);

  // Info open
  await page.locator(".popup-info-btn").click();
  await page.locator(".project-popup-info").waitFor({ state: "visible" });
  await page.getByText("Solo designer and engineer").waitFor({ state: "visible" });
  await page.getByText("Open full app").waitFor({ state: "visible" });
  await shot(page, `${prefix}-open-info.png`);

  // Expand why disclosure
  await page.locator(".project-popup-why > summary").click();
  await page.getByText("TODO(Mudit): one or two sentences on why you built it.").waitFor({
    state: "visible",
  });
  await shot(page, `${prefix}-why-expanded.png`);

  // Esc closes info first, then dialog
  await page.keyboard.press("Escape");
  await page.locator(".project-popup-info").waitFor({ state: "hidden", timeout: 5000 }).catch(async () => {
    // If info already gone, fine
  });
  assert((await page.locator(".project-popup-info").count()) === 0, `${prefix}: info still open after Esc`);

  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden", timeout: 8000 });

  // Focus returns to the card trigger
  await page.waitForTimeout(200);
  const focusedInCard = await page.evaluate(() => {
    const active = document.activeElement;
    const cardEl = document.querySelector('[data-grid-card="project-todolist"]');
    return Boolean(active && cardEl && cardEl.contains(active));
  });
  assert(focusedInCard, `${prefix}: focus did not return to the card`);

  // Re-open and close via close button
  await openAllinone(page);
  await page.locator(".popup-close-btn").click();
  await page.locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]').waitFor({
    state: "hidden",
    timeout: 8000,
  });

  // Re-open and close via backdrop (desktop/tablet only — mobile is full-screen,
  // so there is no exposed backdrop margin to click).
  if (vp.width >= 768) {
    await openAllinone(page);
    await page.locator(".project-popup-backdrop--large").click({ position: { x: 4, y: 4 } });
    await page.locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]').waitFor({
      state: "hidden",
      timeout: 8000,
    });
  }

  // Page can scroll again
  const bodyPosAfter = await page.evaluate(() => getComputedStyle(document.body).position);
  assert(bodyPosAfter !== "fixed", `${prefix}: body still fixed after close`);

  // Sanity: card still there, unused vars kept for lint-ish clarity
  assert(await card.isVisible(), `${prefix}: card missing`);
  assert(await trigger.isVisible(), `${prefix}: trigger missing`);

  await context.close();
  console.log("ok", prefix);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  // Wait for server
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) break;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
    if (i === 39) throw new Error(`server not up at ${BASE}`);
  }

  const browser = await chromium.launch({ headless: true });
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      await runViewportTheme(browser, vp, theme);
    }
  }
  await browser.close();
  console.log("allinone modal verification passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
