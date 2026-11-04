/**
 * Round 3: mobile chrome bar vs sort pill; sheet grows with Why; sans Why label.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1024", width: 1024, height: 768 },
  { name: "390", width: 390, height: 844 },
];
const THEMES = ["dark", "light"];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function overlap(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

async function boot(page, theme) {
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
    document.documentElement.removeAttribute("data-intro");
    window.dispatchEvent(new CustomEvent("intro-done"));
  }, theme);
  await page.waitForSelector('[data-grid-card="project-todolist"]', { timeout: 20000 });
}

async function openModal(page) {
  await page.locator('[data-grid-card="project-todolist"] [role="button"]').click();
  await page
    .locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]')
    .waitFor({ state: "visible" });
  await page.waitForTimeout(800);
}

async function boxes390(page) {
  const host = await page.evaluate(() => {
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: +r.left.toFixed(1),
        top: +r.top.toFixed(1),
        right: +r.right.toFixed(1),
        bottom: +r.bottom.toFixed(1),
        width: +r.width.toFixed(1),
        height: +r.height.toFixed(1),
      };
    };
    return {
      bar: box(document.querySelector(".project-popup-topbar--large")),
      info: box(document.querySelector(".popup-info-btn")),
      close: box(document.querySelector(".popup-close-btn")),
      iframe: box(document.querySelector('iframe[title="Allinone — AI to-do list"]')),
    };
  });
  const sortLoc = page
    .frameLocator('iframe[title="Allinone — AI to-do list"]')
    .getByRole("button", { name: /sort/i });
  await sortLoc.waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  const sortBox = (await sortLoc.count()) ? await sortLoc.boundingBox() : null;
  const sort = sortBox
    ? {
        left: +sortBox.x.toFixed(1),
        top: +sortBox.y.toFixed(1),
        right: +(sortBox.x + sortBox.width).toFixed(1),
        bottom: +(sortBox.y + sortBox.height).toFixed(1),
        width: +sortBox.width.toFixed(1),
        height: +sortBox.height.toFixed(1),
      }
    : null;
  return { ...host, sort };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(BASE)).ok) break;
    } catch { /* */ }
    await new Promise((r) => setTimeout(r, 500));
    if (i === 39) throw new Error("server down");
  }

  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme === "light" ? "light" : "dark",
      });
      const page = await ctx.newPage();
      await boot(page, theme);
      await openModal(page);

      const prefix = `allinone-r3-${vp.name}-${theme}`;
      await page.screenshot({ path: join(OUT, `${prefix}-closed.png`) });

      let mobileBoxes = null;
      if (vp.width === 390) {
        // Wait for the cross-origin app chrome before measuring sort.
        await page
          .frameLocator('iframe[title="Allinone — AI to-do list"]')
          .getByRole("button", { name: /sort/i })
          .waitFor({ state: "visible", timeout: 15000 });
        mobileBoxes = await boxes390(page);
        assert(mobileBoxes.bar && mobileBoxes.bar.height >= 44 && mobileBoxes.bar.height <= 46, `bar h ${mobileBoxes.bar?.height}`);
        assert(mobileBoxes.bar.width <= vp.width + 1, `bar wider than viewport ${mobileBoxes.bar.width}`);
        assert(mobileBoxes.info?.width === 44 && mobileBoxes.info?.height === 44, `info btn ${JSON.stringify(mobileBoxes.info)}`);
        assert(mobileBoxes.close?.width === 44 && mobileBoxes.close?.height === 44, `close btn ${JSON.stringify(mobileBoxes.close)}`);
        // Buttons must sit in the bar, above the iframe
        assert(mobileBoxes.info.bottom <= mobileBoxes.iframe.top + 1, "info overlaps iframe");
        assert(mobileBoxes.close.bottom <= mobileBoxes.iframe.top + 1, "close overlaps iframe");
        assert(mobileBoxes.sort, "sort pill not found in iframe");
        assert(!overlap(mobileBoxes.info, mobileBoxes.sort), `info overlaps sort: ${JSON.stringify(mobileBoxes)}`);
        assert(!overlap(mobileBoxes.close, mobileBoxes.sort), `close overlaps sort: ${JSON.stringify(mobileBoxes)}`);
      } else {
        // Desktop still floating
        const pos = await page.evaluate(() => {
          const bar = document.querySelector(".project-popup-topbar--large");
          return bar ? getComputedStyle(bar).position : null;
        });
        assert(pos === "absolute", `${vp.name}: topbar not floating (${pos})`);
      }

      await page.locator(".popup-info-btn").click();
      await page.locator(".project-popup-info").waitFor({ state: "visible" });
      await page.waitForTimeout(250);

      const whyFont = await page.evaluate(() => {
        const el = document.querySelector(".project-popup-why-label");
        return el ? getComputedStyle(el).fontFamily : null;
      });
      assert(whyFont && !/Georgia/i.test(whyFont), `Why label still Georgia: ${whyFont}`);

      const sheetClosedWhy = await page.evaluate(() => {
        const el = document.querySelector(".project-popup-info");
        const r = el.getBoundingClientRect();
        return { h: r.height, max: getComputedStyle(el).maxHeight };
      });

      await page.screenshot({ path: join(OUT, `${prefix}-info.png`) });

      await page.locator(".project-popup-why > summary").click();
      await page.waitForTimeout(250);

      const sheetOpenWhy = await page.evaluate(() => {
        const el = document.querySelector(".project-popup-info");
        const why = document.querySelector(".project-popup-why > p");
        const r = el.getBoundingClientRect();
        const wr = why.getBoundingClientRect();
        const visible =
          wr.top >= r.top - 1 && wr.bottom <= r.bottom + 1;
        return {
          h: r.height,
          whyVisible: visible,
          whyTop: wr.top,
          whyBottom: wr.bottom,
          sheetTop: r.top,
          sheetBottom: r.bottom,
        };
      });

      if (vp.width === 390) {
        assert(sheetOpenWhy.h <= 844 * 0.85 + 2, `sheet h ${sheetOpenWhy.h} > 85dvh`);
        assert(sheetOpenWhy.h > sheetClosedWhy.h - 1, `sheet did not grow: ${sheetClosedWhy.h} → ${sheetOpenWhy.h}`);
        assert(sheetOpenWhy.whyVisible, `Why text not fully visible in sheet: ${JSON.stringify(sheetOpenWhy)}`);
      }

      await page.screenshot({ path: join(OUT, `${prefix}-why.png`) });

      const row = {
        viewport: `${vp.width}x${vp.height}`,
        theme,
        mobileBoxes,
        sheetClosedWhyH: +sheetClosedWhy.h.toFixed(1),
        sheetOpenWhyH: +sheetOpenWhy.h.toFixed(1),
        whyVisible: sheetOpenWhy.whyVisible,
        whyFont: whyFont.split(",")[0].replace(/"/g, ""),
      };
      report.push(row);
      console.log(JSON.stringify(row));
      await ctx.close();
    }
  }

  writeFileSync(join(OUT, "allinone-r3-report.json"), JSON.stringify(report, null, 2));
  await browser.close();
  console.log("round3 verification passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
