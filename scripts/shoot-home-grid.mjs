/**
 * Full-page home shots: 1440 + 390 × light + dark.
 * Also asserts the CD card is gone and habit remains.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
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
  await page.waitForFunction(
    () => !document.documentElement.hasAttribute("data-intro"),
    { timeout: 10000 },
  );
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }, theme);
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
      await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
      await setTheme(page, theme);
      await skipIntro(page);
      await page.waitForSelector("[data-grid-card]", { timeout: 20000 });
      await page.waitForFunction(
        () => {
          const cards = [...document.querySelectorAll("[data-grid-card]")];
          return (
            cards.length >= 2 &&
            cards.every((el) => getComputedStyle(el).opacity === "1")
          );
        },
        { timeout: 15000 },
      );
      await page.waitForTimeout(400);

      const ids = await page.$$eval("[data-grid-card]", (els) =>
        els.map((el) => el.getAttribute("data-grid-card")),
      );
      assert(!ids.includes("cd"), `CD card still present: ${ids.join(",")}`);
      assert(ids.includes("habit"), `habit card missing: ${ids.join(",")}`);
      assert(ids.length >= 2, `expected a reflowed grid, got ${ids.length} cards`);

      const path = join(OUT, `home-no-cd-${vp.name}-${theme}.png`);
      await page.screenshot({ path, fullPage: true });
      console.log("shot", path, "cards", ids.join(","));
      await context.close();
    }
  }

  await browser.close();
  console.log("home shots done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
