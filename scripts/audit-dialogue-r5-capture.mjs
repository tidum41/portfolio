/**
 * R5 verification: slow scroll, section screenshots, measurements.
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const PORT = Number(process.env.PORT || 3918);
const BASE = `http://127.0.0.1:${PORT}/dialogue`;
const OUT = process.env.OUT || "/workspace/dialogue-r5/shots";

async function slowScroll(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = 300;
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await sleep(220);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await sleep(300);
  });
}

async function shot(page, name, selector) {
  const loc = selector ? page.locator(selector).first() : page;
  await loc.screenshot({ path: path.join(OUT, name) });
}

async function run(browser, width, tag) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: width <= 480 ? 844 : 900 });
  await page.goto(BASE, { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction(
    () =>
      document.querySelector(".dialogue-case-study") &&
      document.querySelectorAll(".dialogue-rachel-frame__pad").length > 0,
    { timeout: 120000 },
  );
  await slowScroll(page);

  const m = await page.evaluate(() => {
    const dots = (document.body.innerText.match(/·/g) || []).length;
    const chosenBar = document.querySelector(
      ".dialogue-lead-answer__panel--selected .dp-chart-bars__bar",
    );
    const chosenTrack = document.querySelector(
      ".dialogue-lead-answer__panel--selected .dp-chart-bars__track",
    );
    const well = document.querySelector(".dialogue-lead-answer__well");
    const panels = [...document.querySelectorAll(".dialogue-lead-answer__option-card")].map((el) => {
      const r = el.getBoundingClientRect();
      return Math.round(r.height);
    });
    const iterMini = document.querySelector(".dialogue-chart-research__iteration-mini");
    const iterBar = document.querySelector(".dialogue-chart-research__iteration-mini .dp-chart-bars__bar");
    const mappingCells = [...document.querySelectorAll(".dialogue-chart-mapping__thumb .dialogue-rachel-frame")].map(
      (el) => Math.round(el.getBoundingClientRect().height),
    );
    const heroCharts = [...document.querySelectorAll(".dp-hero-collage__chart")].map((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    const frame = document.querySelector(".dialogue-hero-joola")?.getBoundingClientRect();
    const webcam = document.querySelector(".dp-player__webcam-tile-img");
    const cs = webcam ? getComputedStyle(webcam) : null;
    return {
      dotCount: dots,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      chosenBarW: chosenBar ? Math.round(chosenBar.getBoundingClientRect().width) : 0,
      chosenTrackW: chosenTrack ? Math.round(chosenTrack.getBoundingClientRect().width) : 0,
      wellBg: well ? getComputedStyle(well).backgroundColor : null,
      panelHeights: panels,
      iterMiniW: iterMini ? Math.round(iterMini.getBoundingClientRect().width) : 0,
      iterBarW: iterBar ? Math.round(iterBar.getBoundingClientRect().width) : 0,
      mappingThumbHeights: mappingCells,
      heroCharts,
      heroFrameW: frame ? Math.round(frame.width) : 0,
      webcamBlurPx: cs?.filter?.match(/blur\(([\d.]+)px\)/)?.[1] ?? null,
    };
  });

  await shot(page, `full-${tag}.png`);
  await shot(page, `p00-${tag}.png`, ".dialogue-hero-joola");
  await shot(page, `zoom-solutions-${tag}.png`, ".dialogue-lead-answer__well");
  await shot(page, `p05-${tag}.png`, "#chart-research");
  await shot(page, `zoom-quote-${tag}.png`, "#clips .dialogue-rachel-frame");
  await shot(page, `p06-${tag}.png`, "#fitted-charts");
  if (tag === "390") {
    await shot(page, `zoom-390-chartfit-${tag}.png`, ".dialogue-chart-research__iterations");
  }

  await page.close();
  return m;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const at1440 = await run(browser, 1440, "1440");
  const at390 = await run(browser, 390, "390");
  await browser.close();
  console.log(JSON.stringify({ at1440, at390, out: OUT }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
