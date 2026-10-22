/** R6 verification: slow scroll, screenshots, measurements. */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const PORT = Number(process.env.PORT || 3918);
const BASE = `http://127.0.0.1:${PORT}/dialogue`;
const OUT = process.env.OUT || "/workspace/dialogue-r6/shots";

async function slowScroll(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += 300) {
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
  await page.waitForSelector(".dp-hero-collage__stage", { timeout: 120000 });
  await slowScroll(page);

  const m = await page.evaluate(() => {
    const r = (el) => el.getBoundingClientRect();
    const frame = document.querySelector(".dialogue-hero-joola");
    const fr = r(frame);
    const tiles = [...document.querySelectorAll(".dp-hero-collage__tile")]
      .filter((el) => el.offsetParent !== null)
      .map((el) => {
        const b = r(el);
        const t = el.querySelector(".dp-chart-title");
        return {
          id: el.className.match(/tile--(\w+)/)?.[1],
          w: Math.round(b.width),
          h: Math.round(b.height),
          inside:
            b.left >= fr.left - 0.5 &&
            b.right <= fr.right + 0.5 &&
            b.top >= fr.top - 0.5 &&
            b.bottom <= fr.bottom + 0.5,
          titleOneLine: t ? { h: Math.round(r(t).height), sw: t.scrollWidth, cw: t.clientWidth } : null,
        };
      });
    const chat = document.querySelector(".dp-hero-collage__chat");
    const cb = r(chat);
    const overlap = tiles.filter(() => true).length;
    const chatOverlaps = [...document.querySelectorAll(".dp-hero-collage__tile")]
      .filter((el) => el.offsetParent !== null)
      .filter((el) => {
        const b = r(el);
        return b.left < cb.right && b.right > cb.left && b.top < cb.bottom && b.bottom > cb.top;
      }).length;
    const panels = [...document.querySelectorAll(".dialogue-lead-answer__option-card")].map((el) => Math.round(r(el).height));
    const structured = document.querySelector(".dp-lead-answer-card--structured");
    let clipGap = null;
    if (structured) {
      const pills = structured.querySelector(".dp-lead-answer-card__sources");
      const clips = structured.querySelector(".dp-clip-thumbs");
      clipGap = Math.round(r(clips).top - r(pills).bottom);
    }
    const cardContentFill = [...document.querySelectorAll(".dialogue-lead-answer__option-card")].map((c) => {
      const inner = c.querySelector(".dp-lead-answer-card");
      return Math.round(r(c).height - r(inner).height);
    });
    const ruled = [...document.querySelectorAll(".dialogue-chart-research__card--ruled")].map((c) => ({
      pills: c.querySelectorAll(".dialogue-chart-research__ruled-tag").length,
      overlay: c.querySelectorAll(".dialogue-chart-research__ruled-overlay-label").length,
      thumbFilter: getComputedStyle(c.querySelector(".dialogue-chart-research__thumb > *")).filter,
      thumbOpacity: getComputedStyle(c.querySelector(".dialogue-chart-research__thumb > *")).opacity,
    }));
    const col = document.querySelector(".dialogue-chart-research");
    const iterThumbs = [...document.querySelectorAll(".dialogue-chart-research__iteration-thumbs")].map((el) => Math.round(r(el).width));
    const radar = document.querySelector(".dp-alt-radar__svg");
    const radarTexts = radar ? [...radar.querySelectorAll("text")].map((t) => t.textContent) : [];
    const mapping = [...document.querySelectorAll(".dialogue-chart-mapping__thumb .dialogue-rachel-frame")].map((el) => Math.round(r(el).height));
    const mapPadBg = getComputedStyle(document.querySelector(".dialogue-chart-mapping__thumb .dialogue-rachel-frame__pad")).backgroundColor;
    const player = document.querySelector(".dp-player--casestudy");
    return {
      dotCount: (document.body.innerText.match(/·/g) || []).length,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      heroFrame: { w: Math.round(fr.width), h: Math.round(fr.height) },
      tiles,
      chatOverlaps,
      panels,
      clipGap,
      cardSlack: cardContentFill,
      ruled,
      colW: col ? Math.round(r(col).width) : 0,
      iterThumbs,
      radar: radar ? { w: Math.round(r(radar).width), h: Math.round(r(radar).height), labels: radarTexts } : null,
      mapping,
      mapPadBg,
      playerBrandBadges: player ? player.querySelectorAll(".dp-player__brand").length : null,
      _ignore: overlap,
    };
  });
  delete m._ignore;

  await shot(page, `p00-${tag}.png`, ".dialogue-hero-joola");
  await shot(page, `sol-${tag}.png`, ".dialogue-lead-answer__well");
  await shot(page, `quote-${tag}.png`, "#clips .dialogue-rachel-frame");
  await shot(page, `p05-${tag}.png`, "#chart-research");
  await shot(page, `p06-${tag}.png`, "#fitted-charts");
  await page.close();
  return m;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const at1440 = await run(browser, 1440, "1440");
const at390 = await run(browser, 390, "390");
await browser.close();
console.log(JSON.stringify({ at1440, at390 }, null, 1));
