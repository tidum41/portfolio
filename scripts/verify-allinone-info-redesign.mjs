/**
 * All in One info panel redesign: clusters, CTA, hairline, no-scroll fit.
 * Shots: 1440 + 390 × light/dark, info open.
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
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
  // Keep reference shots discoverable next to open-state evidence.
  try {
    mkdirSync(join(OUT, "info-refs"), { recursive: true });
  } catch {
    /* */
  }

  const browser = await chromium.launch({ headless: true });
  const report = { panels: [], structure: null };

  for (const theme of ["light", "dark"]) {
    for (const vp of [
      { name: "1440", width: 1440, height: 900, mobile: false },
      { name: "390", width: 390, height: 844, mobile: true },
    ]) {
      const prefix = `aio-info-${vp.name}-${theme}`;
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

      await page
        .waitForSelector('iframe[title="Allinone — AI to-do list"][data-ready="true"]', {
          timeout: 25000,
        })
        .catch(() => {});
      await page.waitForTimeout(400);

      await page.locator(".popup-info-btn").click();
      await page.waitForSelector(".project-popup-info", { timeout: 8000 });
      await page.waitForTimeout(280);

      const metrics = await page.evaluate(() => {
        const panel = document.querySelector(".project-popup-info");
        const inner = document.querySelector(".project-popup-info-inner");
        if (!panel || !inner) return null;
        const labels = [...document.querySelectorAll(".project-popup-cluster-label")].map((el) =>
          el.textContent?.trim(),
        );
        const chips = [...document.querySelectorAll(".project-popup-chip")].map((el) =>
          el.textContent?.trim(),
        );
        const numeral = document.querySelector(".project-popup-timeline-numeral")?.textContent?.trim();
        const unit = document.querySelector(".project-popup-timeline-unit")?.textContent?.trim();
        const why = document.querySelector(".project-popup-why-body");
        const cta = document.querySelector(".project-popup-info-cta");
        const whyCs = why ? getComputedStyle(why) : null;
        const hair = why ? getComputedStyle(why).borderTopColor : null;
        const labelEl = document.querySelector(".project-popup-cluster-label");
        const labelCs = labelEl ? getComputedStyle(labelEl) : null;
        return {
          scrollHeight: panel.scrollHeight,
          clientHeight: panel.clientHeight,
          width: Math.round(panel.getBoundingClientRect().width),
          height: Math.round(panel.getBoundingClientRect().height),
          labels,
          chips,
          numeral,
          unit,
          hasCta: Boolean(cta),
          ctaText: cta?.textContent?.replace(/\s+/g, " ").trim(),
          whyFont: whyCs?.fontFamily ?? null,
          whyMaxCh: whyCs?.maxWidth ?? null,
          whySize: whyCs?.fontSize ?? null,
          hairline: hair,
          labelSize: labelCs?.fontSize ?? null,
          labelTransform: labelCs?.textTransform ?? null,
          oldTable: document.querySelectorAll(".project-popup-spec-row").length,
          oldLink: document.querySelectorAll(".project-popup-info-link").length,
        };
      });

      assert(metrics, `${prefix}: info panel missing`);
      assert(metrics.oldTable === 0, `${prefix}: old spec table still present`);
      assert(metrics.oldLink === 0, `${prefix}: old bare link still present`);
      assert(metrics.hasCta, `${prefix}: CTA missing`);
      assert(/Open full app/i.test(metrics.ctaText || ""), `${prefix}: CTA text ${metrics.ctaText}`);
      assert(
        JSON.stringify(metrics.labels) ===
          JSON.stringify(["Stack", "AI", "Data", "Made with", "Timeline"]),
        `${prefix}: labels ${metrics.labels}`,
      );
      assert(
        ["React", "Vite", "PWA", "Groq", "Google Sheets API", "Supabase", "Paper", "Claude Code"].every(
          (c) => metrics.chips.includes(c),
        ),
        `${prefix}: chips ${metrics.chips}`,
      );
      assert(!metrics.chips.some((c) => /mono/i.test(c)), `${prefix}: unexpected chip`);
      const monoChip = await page.evaluate(
        () => document.querySelectorAll(".project-popup-chip--mono").length,
      );
      assert(monoChip === 0, `${prefix}: mono chip class still present`);
      const chipFont = await page.evaluate(() => {
        const el = document.querySelector(".project-popup-chip");
        return el ? getComputedStyle(el).fontFamily : "";
      });
      assert(/Helvetica|Arial|sans-serif/i.test(chipFont), `${prefix}: chip font ${chipFont}`);
      assert(!/mono|Geist Mono|Menlo/i.test(chipFont), `${prefix}: chip must not be mono`);
      assert(metrics.numeral === "2", `${prefix}: timeline numeral ${metrics.numeral}`);
      assert(/week/i.test(metrics.unit || ""), `${prefix}: timeline unit ${metrics.unit}`);
      assert(/Georgia/i.test(metrics.whyFont || ""), `${prefix}: why font ${metrics.whyFont}`);
      assert(metrics.labelSize === "12px", `${prefix}: label size ${metrics.labelSize}`);
      assert(metrics.labelTransform === "uppercase", `${prefix}: label transform`);

      const delta = metrics.scrollHeight - metrics.clientHeight;
      report.panels.push({
        vp: vp.name,
        theme,
        scrollDelta: delta,
        fits: delta <= 2,
        width: metrics.width,
        height: metrics.height,
        labels: metrics.labels,
        numeral: metrics.numeral,
        unit: metrics.unit,
        whyFont: metrics.whyFont?.split(",")[0],
        hairline: metrics.hairline,
      });
      assert(delta <= 2, `${prefix} info scrolls by ${delta}px`);

      if (!report.structure) {
        report.structure = {
          labels: metrics.labels,
          chips: metrics.chips,
          numeral: metrics.numeral,
          unit: metrics.unit,
          ctaText: metrics.ctaText,
          whyMaxCh: metrics.whyMaxCh,
        };
      }

      const shot = join(OUT, `${prefix}-open.png`);
      await page.screenshot({ path: shot, fullPage: false });
      console.log("shot", `${prefix}-open.png`, { delta, h: metrics.height, w: metrics.width });
      await context.close();
    }
  }

  await browser.close();
  writeFileSync(join(OUT, "aio-info-redesign-report.json"), JSON.stringify(report, null, 2));
  console.log("report", JSON.stringify(report, null, 2));
  console.log("allinone info redesign checks passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
