/** R7 verification: image blur scan, caption baseline, coverage pair, quote crop. */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const BASE = `http://127.0.0.1:${process.env.PORT || 3918}/dialogue`;
const OUT = process.env.OUT || "/workspace/dialogue-r7/shots";

async function slowScroll(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += 300) {
      window.scrollTo({ top: y, behavior: "instant" });
      await sleep(200);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await sleep(300);
  });
}

async function run(browser, width, tag) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: width <= 480 ? 844 : 900 });
  await page.goto(BASE, { waitUntil: "load", timeout: 180000 });
  await page.waitForSelector(".dp-hero-collage__stage", { timeout: 120000 });
  await slowScroll(page);
  const m = await page.evaluate(() => {
    const r = (el) => el.getBoundingClientRect();
    const imgs = [...document.querySelectorAll("img")]
      .filter((i) => /clip-photos/.test(i.src))
      .map((i) => {
        const f = getComputedStyle(i).filter;
        const blur = parseFloat(f.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0");
        let el = i;
        let tileBlur = 0;
        while (el && el !== document.body) {
          const bf = getComputedStyle(el).backdropFilter;
          el = el.parentElement;
        }
        return { src: i.src.split("/").pop(), blurPx: blur, w: Math.round(r(i).width) };
      });
    const caps = [...document.querySelectorAll(".dialogue-lead-answer__panel .dialogue-caption")].map((c) => Math.round(r(c).top + window.scrollY));
    const cards = [...document.querySelectorAll(".dialogue-lead-answer__option-card")].map((c) => Math.round(r(c).height));
    const pair = [...document.querySelectorAll(".dialogue-chart-research__iteration-pair")][3];
    const minis = [...pair.querySelectorAll(".dialogue-chart-research__iteration-mini")].map((mini) => {
      const card = mini.querySelector(".dp-chart-viz-card");
      const cap = mini.querySelector(".dialogue-chart-research__iteration-cap");
      return {
        miniH: Math.round(r(mini).height),
        cardBottomToCapTop: Math.round(r(cap).top - r(card).bottom),
        capBottomInsideMini: Math.round(r(mini).bottom - r(cap).bottom),
        cardInsideMini: r(card).bottom <= r(mini).bottom,
      };
    });
    const still = document.querySelector(".dp-player__still");
    const player = document.querySelector(".dp-player--casestudy");
    return {
      imgs,
      captionTops: caps,
      cardHeights: cards,
      coverageMinis: minis,
      stillTopOffsetPct: still ? Math.round(((r(player).top - r(still).top) / r(player).height) * 1000) / 10 : null,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  await mkdir(OUT, { recursive: true });
  await page.locator(".dp-hero-collage__tile--clip, .dp-hero-collage__stage").first().screenshot({ path: path.join(OUT, `hero-${tag}.png`) });
  const clip = page.locator(".dp-hero-collage__tile--clip");
  if (await clip.count()) {
    if (await clip.first().isVisible()) {
      const b = await clip.first().boundingBox();
      await page.screenshot({ path: path.join(OUT, `hero-clip-zoom-${tag}.png`), clip: { x: b.x - 10, y: b.y - 10, width: b.width + 20, height: b.height + 20 } });
    }
  }
  await page.locator(".dp-hero-collage__stage").screenshot({ path: path.join(OUT, `hero-${tag}.png`) });
  await page.locator(".dialogue-lead-answer__well").screenshot({ path: path.join(OUT, `sol-${tag}.png`) });
  await page.locator(".dialogue-chart-research__iteration-pair").nth(3).screenshot({ path: path.join(OUT, `coverage-pair-${tag}.png`) });
  await page.locator("#clips .dialogue-rachel-frame").first().screenshot({ path: path.join(OUT, `quote-${tag}.png`) });
  await page.close();
  return m;
}
const browser = await chromium.launch({ headless: true });
const out = { at1440: await run(browser, 1440, "1440"), at390: await run(browser, 390, "390") };
await browser.close();
console.log(JSON.stringify(out, null, 1));
