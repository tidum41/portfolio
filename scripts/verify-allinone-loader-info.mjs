/**
 * All in One: halftone loader + staggered entrance + info panel fit.
 * Shots (light+dark × 1440/390): loader, mid-entrance, loaded, info open.
 * Reports info panel scrollHeight vs clientHeight.
 */
import { chromium, devices } from "playwright";
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
    }
    html.removeAttribute("data-intro");
  });
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }, theme);
}

async function openModal(page) {
  const card = page.locator('[data-grid-card="project-todolist"]');
  await card.scrollIntoViewIfNeeded();
  await card.locator('[role="button"]').first().click();
  await page
    .locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]')
    .waitFor({ state: "visible", timeout: 15000 });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { panels: [], checks: [] };

  for (const theme of ["light", "dark"]) {
    for (const vp of [
      { name: "1440", width: 1440, height: 900, mobile: false },
      { name: "390", width: 390, height: 844, mobile: true },
    ]) {
      const prefix = `aio-loader-${vp.name}-${theme}`;

      // ── Loader frame (hold demo JS so loader stays ≥150ms) ──
      {
        const context = await browser.newContext({
          ...(vp.mobile ? { ...devices["iPhone 13"], hasTouch: true, isMobile: true } : {}),
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        await page.route("**/allinone-demo/assets/*.js", async (route) => {
          await new Promise((r) => setTimeout(r, 900));
          return route.continue();
        });
        await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
        await setTheme(page, theme);
        await skipIntro(page);
        await openModal(page);
        await page.waitForSelector('.aio-ht-loader[data-visible="true"]', { timeout: 5000 });
        assert(
          (await page.locator(".aio-demo-skel").count()) === 0,
          "skeleton should be gone",
        );
        await page.screenshot({ path: join(OUT, `${prefix}-loader.png`), fullPage: false });
        console.log("shot", `${prefix}-loader.png`);
        report.checks.push({ shot: `${prefix}-loader`, loader: true });
        await context.close();
      }

      // ── Mid-entrance + loaded + info ──
      {
        const context = await browser.newContext({
          ...(vp.mobile ? { ...devices["iPhone 13"], hasTouch: true, isMobile: true } : {}),
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
        await setTheme(page, theme);
        await skipIntro(page);
        await openModal(page);

        // Wait until iframe is ready, then catch mid-entrance if possible.
        await page.waitForSelector(
          'iframe[title="Allinone — AI to-do list"][data-ready="true"]',
          { timeout: 25000 },
        );

        // Mid-entrance: while data-aio-entrance=running inside iframe
        const mid = await page.evaluate(async () => {
          const iframe = document.querySelector('iframe[title="Allinone — AI to-do list"]');
          const doc = iframe?.contentDocument;
          if (!doc) return null;
          const start = performance.now();
          while (performance.now() - start < 800) {
            const state = doc.documentElement.getAttribute("data-aio-entrance");
            if (state === "running") return state;
            if (state === "done") return "done-fast";
            await new Promise((r) => setTimeout(r, 16));
          }
          return doc.documentElement.getAttribute("data-aio-entrance");
        });
        await page.screenshot({ path: join(OUT, `${prefix}-mid.png`), fullPage: false });
        console.log("shot", `${prefix}-mid.png`, "entrance", mid);

        // Loaded (entrance done)
        await page.waitForFunction(() => {
          const iframe = document.querySelector('iframe[title="Allinone — AI to-do list"]');
          const state = iframe?.contentDocument?.documentElement.getAttribute("data-aio-entrance");
          return state === "done" || state === null;
        }, { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(200);
        await page.screenshot({ path: join(OUT, `${prefix}-loaded.png`), fullPage: false });
        console.log("shot", `${prefix}-loaded.png`);

        // Info panel
        await page.locator(".popup-info-btn").click();
        await page.waitForSelector(".project-popup-info", { timeout: 8000 });
        await page.waitForTimeout(280);
        const metrics = await page.evaluate(() => {
          const panel = document.querySelector(".project-popup-info");
          if (!panel) return null;
          return {
            scrollHeight: panel.scrollHeight,
            clientHeight: panel.clientHeight,
            overflowY: getComputedStyle(panel).overflowY,
            width: Math.round(panel.getBoundingClientRect().width),
          };
        });
        assert(metrics, "info panel missing");
        const delta = metrics.scrollHeight - metrics.clientHeight;
        report.panels.push({
          vp: vp.name,
          theme,
          ...metrics,
          scrollDelta: delta,
          fits: delta <= 2,
        });
        assert(delta <= 2, `${prefix} info scrolls by ${delta}px`);
        await page.screenshot({ path: join(OUT, `${prefix}-info.png`), fullPage: false });
        console.log("shot", `${prefix}-info.png`, metrics);
        await context.close();
      }
    }
  }

  await browser.close();
  writeFileSync(join(OUT, "aio-loader-info-report.json"), JSON.stringify(report, null, 2));
  console.log("report", JSON.stringify(report.panels, null, 2));
  console.log("allinone loader+info checks passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
