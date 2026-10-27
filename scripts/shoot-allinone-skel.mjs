/**
 * Screenshots: All in One skeleton (1440/390 × light/dark), mid-crossfade.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";

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

async function openModal(page) {
  const card = page.locator('[data-grid-card="project-todolist"]');
  await card.scrollIntoViewIfNeeded();
  await card.locator('[role="button"]').first().click();
  await page
    .locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]')
    .waitFor({ state: "visible", timeout: 15000 });
}

async function shoot(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("shot", path);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const theme of ["light", "dark"]) {
    for (const vp of [
      { name: "1440", width: 1440, height: 900 },
      { name: "390", width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      // Block the demo bundle so the skeleton stays visible.
      await page.route("**/allinone-demo/**", (route) => {
        if (route.request().resourceType() === "document") {
          return route.fulfill({
            status: 200,
            contentType: "text/html",
            body: "<!doctype html><html><body style='background:#fafaf8'></body></html>",
          });
        }
        return route.abort();
      });

      await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
      await setTheme(page, theme);
      await skipIntro(page);
      await page.waitForSelector('[data-grid-card="project-todolist"]', {
        timeout: 20000,
      });
      await openModal(page);
      await page.waitForSelector(".aio-demo-skel", { timeout: 10000 });
      // Wait until src would have been armed (panel enter ~260ms + idle)
      await page.waitForTimeout(700);
      // Keep skeleton visible (iframe "loads" empty stub; force not-ready)
      await page.evaluate(() => {
        const skel = document.querySelector(".aio-demo-skel");
        skel?.setAttribute("data-hidden", "false");
        const iframe = document.querySelector(
          'iframe[title="Allinone — AI to-do list"]',
        );
        iframe?.setAttribute("data-ready", "false");
      });
      await page.waitForTimeout(80);
      await shoot(page, `aio-skel-${vp.name}-${theme}.png`);
      await context.close();
    }
  }

  // Mid-crossfade at 1440 light: allow real demo, freeze mid-opacity
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "light",
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
    await setTheme(page, "light");
    await skipIntro(page);
    await openModal(page);

    // Wait for iframe ready, then force mid-crossfade opacities
    await page
      .waitForFunction(() => {
        const iframe = document.querySelector(
          'iframe[title="Allinone — AI to-do list"]',
        );
        return iframe?.getAttribute("data-ready") === "true";
      }, { timeout: 20000 })
      .catch(() => {});

    await page.evaluate(() => {
      const skel = document.querySelector(".aio-demo-skel");
      const iframe = document.querySelector(
        'iframe[title="Allinone — AI to-do list"]',
      );
      if (skel) {
        skel.setAttribute("data-hidden", "false");
        skel.style.transition = "none";
        skel.style.opacity = "0.45";
      }
      if (iframe) {
        iframe.setAttribute("data-ready", "true");
        iframe.style.transition = "none";
        iframe.style.opacity = "0.55";
      }
    });
    await page.waitForTimeout(60);
    await shoot(page, "aio-skel-1440-light-mid-crossfade.png");
    await context.close();
  }

  await browser.close();
  console.log("skel shots done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
