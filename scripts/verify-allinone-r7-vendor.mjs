/**
 * Verify vendored All in One r7 embed inside the portfolio ProjectPopup.
 * - Modal opens, iframe loads
 * - Categories rail at 1440 / sheet at 390
 * - Sort posts to /api/categorize (route reachable)
 * Screenshots: /opt/cursor/artifacts (1440 + 390, light)
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";

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
  await card.waitFor({ state: "visible", timeout: 20000 });
  await card.locator('[role="button"]').first().click();
  const dialog = page.locator(
    '[role="dialog"][aria-label="Designing a to-do list with AI organization"]',
  );
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  return dialog;
}

async function demoFrame(page) {
  const iframe = page.locator('iframe[title="Allinone — AI to-do list"]');
  await iframe.waitFor({ state: "attached", timeout: 15000 });
  await page.waitForFunction(() => {
    const el = document.querySelector('iframe[title="Allinone — AI to-do list"]');
    if (!(el instanceof HTMLIFrameElement)) return false;
    try {
      return el.contentDocument?.readyState === "complete";
    } catch {
      return true;
    }
  }, { timeout: 20000 });
  const frame = page.frameLocator('iframe[title="Allinone — AI to-do list"]');
  await frame.locator("[data-aio-categories]").waitFor({ state: "visible", timeout: 20000 });
  return frame;
}

async function runViewport(browser, vp) {
  const theme = "light";
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    colorScheme: "light",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const prefix = `aio-r7-vendor-${vp.name}-${theme}`;
  const categorizeHits = [];

  page.on("request", (req) => {
    if (req.url().includes("/api/categorize") && req.method() === "POST") {
      categorizeHits.push(req.url());
    }
  });

  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await setTheme(page, theme);
  await skipIntro(page);
  await page.waitForSelector('[data-grid-card="project-todolist"]', { timeout: 20000 });

  await openAllinone(page);
  const frame = await demoFrame(page);
  await page.waitForTimeout(500);

  // Closed state (demo loaded)
  await page.screenshot({
    path: join(OUT, `${prefix}-closed.png`),
    fullPage: false,
  });
  console.log("shot", join(OUT, `${prefix}-closed.png`));

  // Open Categories
  await frame.locator("[data-aio-categories]").click();
  const catDialog = frame.locator('[role="dialog"][aria-label="Categories"]');
  await catDialog.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(300);

  const layout = await catDialog.getAttribute("data-aio-cat-layout");
  // Fallback: measure layout from data attribute on panel or inferred
  const layoutInfo = await frame.locator("body").evaluate(() => {
    const panel = document.querySelector('[role="dialog"][aria-label="Categories"]');
    const layoutAttr =
      panel?.getAttribute("data-aio-cat-layout") ||
      document.querySelector("[data-aio-cat-layout]")?.getAttribute("data-aio-cat-layout");
    const rect = panel?.getBoundingClientRect();
    return {
      layout: layoutAttr,
      panel: rect
        ? { x: rect.x, y: rect.y, w: rect.width, h: rect.height, bottom: rect.bottom }
        : null,
      vw: window.innerWidth,
      vh: window.innerHeight,
    };
  });

  console.log(prefix, "categories layout:", layoutInfo);

  if (vp.width >= 1100) {
    assert(
      layoutInfo.layout === "push" || layoutInfo.layout === "rail" || layoutInfo.layout === "overlay",
      `${prefix}: expected desktop rail/push layout, got ${layoutInfo.layout}`,
    );
    // Push rail sits on the right (~360px)
    assert(layoutInfo.panel, `${prefix}: missing categories panel`);
    assert(
      layoutInfo.panel.w >= 300 && layoutInfo.panel.w <= 420,
      `${prefix}: rail width unexpected ${layoutInfo.panel.w}`,
    );
    assert(
      layoutInfo.panel.x > layoutInfo.vw * 0.5,
      `${prefix}: rail not on the right (x=${layoutInfo.panel.x})`,
    );
  } else if (vp.width <= 430) {
    assert(
      layoutInfo.layout === "sheet" || layoutInfo.layout === "bottom",
      `${prefix}: expected mobile sheet layout, got ${layoutInfo.layout}`,
    );
    assert(layoutInfo.panel, `${prefix}: missing categories sheet`);
    // Sheet sits near the bottom
    assert(
      layoutInfo.panel.bottom >= layoutInfo.vh - 8,
      `${prefix}: sheet not anchored to bottom (bottom=${layoutInfo.panel.bottom}, vh=${layoutInfo.vh})`,
    );
  }

  await page.screenshot({
    path: join(OUT, `${prefix}-categories-open.png`),
    fullPage: false,
  });
  console.log("shot", join(OUT, `${prefix}-categories-open.png`));

  // Close categories (Esc or pill toggle) then exercise Sort
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  // If still open, toggle pill
  if (await catDialog.isVisible().catch(() => false)) {
    await frame.locator("[data-aio-categories]").click();
    await page.waitForTimeout(250);
  }

  // Ensure there's text to sort — demo dump should already have content;
  // click Sort and assert /api/categorize is hit (or button is present & clickable).
  const sortBtn = frame.locator("[data-aio-sort]");
  await sortBtn.waitFor({ state: "visible", timeout: 10000 });

  // Probe route independently too
  const probe = await page.request.post(BASE + "/api/categorize", {
    data: { text: "buy milk\nfinish wireframes" },
    headers: { "content-type": "application/json" },
  });
  assert(
    probe.status() === 200 || probe.status() === 429 || probe.status() === 502,
    `${prefix}: /api/categorize not reachable (status=${probe.status()})`,
  );
  console.log(prefix, "categorize probe status", probe.status());

  // Click Sort — may succeed via proxy or show an error; route must be attempted.
  await sortBtn.click();
  // Wait briefly for network
  await page.waitForTimeout(2500);
  assert(
    categorizeHits.length >= 1,
    `${prefix}: Sort did not POST to /api/categorize`,
  );
  console.log(prefix, "categorize hits", categorizeHits.length);

  await page.screenshot({
    path: join(OUT, `${prefix}-after-sort.png`),
    fullPage: false,
  });
  console.log("shot", join(OUT, `${prefix}-after-sort.png`));

  await context.close();
  return {
    viewport: vp.name,
    layout: layoutInfo.layout,
    panel: layoutInfo.panel,
    categorizeHits: categorizeHits.length,
    categorizeProbe: probe.status(),
  };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {};

  report["1440"] = await runViewport(browser, { name: "1440", width: 1440, height: 900 });
  report["390"] = await runViewport(browser, { name: "390", width: 390, height: 844 });

  writeFileSync(join(OUT, "aio-r7-vendor-report.json"), JSON.stringify(report, null, 2));
  console.log("report", JSON.stringify(report, null, 2));
  await browser.close();
  console.log("aio-r7 vendor verification passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
