/**
 * Full-page home shots: 1440 + 390 × light + dark.
 * Asserts CD gone, habit present, desktop column balance, and that
 * lazy Mux posters (e.g. SVIZ) have painted before capture.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";
const MAX_COL_BOTTOM_DELTA = 120;

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

/** Scroll every grid card into view so IntersectionObserver lazy media arms. */
async function warmLazyMedia(page) {
  const cards = page.locator("[data-grid-card]");
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    await cards.nth(i).scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(
    () => {
      const imgs = [...document.querySelectorAll("[data-grid-card] img")];
      if (imgs.length === 0) return false;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    { timeout: 20000 },
  );
  // SVIZ is Mux — require its poster (or video) painted, not just placeholder.
  await page.waitForFunction(
    () => {
      const card = document.querySelector('[data-grid-card="project-sviz"]');
      if (!card) return false;
      const media = card.querySelector("img, video");
      if (!media) return false;
      if (media instanceof HTMLImageElement) {
        return media.complete && media.naturalWidth > 0;
      }
      if (media instanceof HTMLVideoElement) {
        return media.readyState >= 2 || (media.poster && media.videoWidth > 0);
      }
      return false;
    },
    { timeout: 20000 },
  );
  await page.waitForTimeout(200);
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
      await warmLazyMedia(page);

      const ids = await page.$$eval("[data-grid-card]", (els) =>
        els.map((el) => el.getAttribute("data-grid-card")),
      );
      assert(!ids.includes("cd"), `CD card still present: ${ids.join(",")}`);
      assert(ids.includes("habit"), `habit card missing: ${ids.join(",")}`);
      assert(ids.length >= 2, `expected a reflowed grid, got ${ids.length} cards`);

      if (vp.width >= 768) {
        const bal = await page.evaluate(() => {
          const cols = [...document.querySelectorAll(".portfolio-grid-col")];
          const bottoms = cols.map((col) => col.getBoundingClientRect().bottom);
          const habit = document.querySelector('[data-grid-card="habit"]');
          const trail = habit?.classList.contains("portfolio-grid-card--trail");
          return {
            delta: Math.abs(bottoms[0] - bottoms[1]),
            trail: Boolean(trail),
            habitCol: habit?.closest(".portfolio-grid-col") ? "in-col" : "span",
          };
        });
        assert(bal.trail, "habit missing portfolio-grid-card--trail");
        assert(bal.habitCol === "span", `habit should span under columns, got ${bal.habitCol}`);
        assert(
          bal.delta <= MAX_COL_BOTTOM_DELTA,
          `column bottoms delta ${bal.delta}px > ${MAX_COL_BOTTOM_DELTA}px`,
        );
        console.log("balance", vp.name, theme, "delta", bal.delta);
      }

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
