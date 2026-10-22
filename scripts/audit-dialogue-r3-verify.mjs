/**
 * Round 3 audit verification: slow scroll, screenshots, key measurements.
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const PORT = Number(process.env.PORT || 3917);
const BASE = `http://127.0.0.1:${PORT}/dialogue`;
const OUT = process.env.OUT || "/workspace/dialogue-r3/shots";

async function slowScroll(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(280, Math.floor(window.innerHeight * 0.45));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await sleep(220);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await sleep(300);
  });
}

async function capture(page, name, selector) {
  const el = selector ? page.locator(selector).first() : page;
  await el.screenshot({ path: path.join(OUT, name) });
}

async function runViewport(page, width, tag) {
  await page.setViewportSize({ width, height: width <= 480 ? 844 : 900 });
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(
    () =>
      document.querySelector(".dialogue-case-study") &&
      document.querySelectorAll(".dialogue-rachel-frame__pad").length > 0,
    { timeout: 120000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await slowScroll(page);

  const m = await page.evaluate(() => {
    const rgb = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return s.backgroundColor;
    };
    const leadPanels = [...document.querySelectorAll(".dialogue-lead-answer__panel")];
    const leadFrames = leadPanels.map((p) => {
      const frame = p.querySelector(".dialogue-rachel-frame");
      const inner = p.querySelector(".dialogue-lead-answer__answer, .dialogue-lead-answer__answer--structured");
      const fr = frame?.getBoundingClientRect();
      const ir = inner?.getBoundingClientRect();
      const badge = p.querySelector(".dialogue-lead-answer__chosen-badge");
      const cap = p.querySelector(".dialogue-caption");
      const badgeRect = badge?.getBoundingClientRect();
      const capRect = cap?.getBoundingClientRect();
      return {
        chosen: p.classList.contains("dialogue-lead-answer__panel--selected"),
        frameH: fr ? Math.round(fr.height) : null,
        innerH: ir ? Math.round(ir.height) : null,
        gapBelowInner: fr && ir ? Math.round(fr.bottom - ir.bottom) : null,
        badgeOverlapsCaption:
          badgeRect && capRect
            ? badgeRect.bottom > capRect.top - 2 && badgeRect.top < capRect.bottom
            : false,
        frameBg: rgb(frame),
      };
    });

    const researchCards = [...document.querySelectorAll(".dialogue-chart-research__card")];
    const research = {
      count: researchCards.length,
      hasChatShell: !!document.querySelector(".dialogue-chart-research .dp-study-chat"),
      hasChartViz: !!document.querySelector(".dialogue-chart-research .dp-chart-viz-card, .dialogue-chart-research .dp-funnel"),
      questionColors: researchCards.slice(0, 2).map((c) => {
        const q = c.querySelector(".dialogue-chart-research__question");
        const s = q ? getComputedStyle(q) : null;
        return s ? { color: s.color, fontSize: s.fontSize } : null;
      }),
      ruledTags: document.querySelectorAll(".dialogue-chart-research__ruled-tag").length,
      iterations: document.querySelectorAll(".dialogue-chart-research__iterations-list li").length,
    };

    const mapping = document.querySelector("#fitted-charts, [id*='chart']");
    const mappingSection = document.querySelector("#fitted-charts") || document.getElementById("fitted-charts");
    const mappingEl =
      document.querySelector(".dialogue-chart-mapping")?.closest("section") ||
      document.querySelector(".dialogue-chart-mapping")?.parentElement;
    const mappingRect = mappingEl?.getBoundingClientRect();
    const mappingQuestions = [...document.querySelectorAll(".dialogue-chart-mapping__question")].map((q) => ({
      fontSize: getComputedStyle(q).fontSize,
    }));

    const player = document.querySelector(".dp-player--casestudy");
    const faceMask = document.querySelector(".dp-player__face-mask-img");
    const greyDisc = document.querySelector(".dp-player__face-blur");

    const fullAnswer = document.querySelector('[data-dialogue-asset-id="D-15"] .dialogue-rachel-frame__pad');
    const drawer = document.querySelector(".dp-full-answer__drawer");
    const faRect = fullAnswer?.getBoundingClientRect();
    const drRect = drawer?.getBoundingClientRect();
    const drawerClip =
      faRect && drRect ? drRect.right > faRect.right + 1 : null;

    const outcome = document.querySelector(".dialogue-full-answer-outcome");
    const outcomeCap = document.querySelector('[data-dialogue-asset-id="D-15"]')?.closest(".dialogue-framed")?.querySelector(".dialogue-caption");
    const outcomeGap =
      outcomeCap && outcome
        ? Math.round(outcome.getBoundingClientRect().top - outcomeCap.getBoundingClientRect().bottom)
        : null;

    const hero = document.querySelector(".dp-hero-compose--collage");
    const heroMinis = document.querySelectorAll(".dp-hero-compose__mini").length;

    const frames = [...document.querySelectorAll(".dialogue-rachel-frame")].map((f) => rgb(f));
    const uniqueFrameBgs = [...new Set(frames.filter(Boolean))];

    const whoBlock = document.querySelector(".dialogue-evidence-pull");

    const rowTrio = document.querySelector(".dialogue-lead-answer__row--trio");
    const rowStyle = rowTrio ? getComputedStyle(rowTrio) : null;

    return {
      pageScrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      leadFrames,
      research,
      mappingSectionHeight: mappingRect ? Math.round(mappingRect.height) : null,
      mappingQuestions,
      playerUsesRoomStill: player?.querySelector(".dp-player__still")?.currentSrc?.includes("still-player-room"),
      hasFaceMaskBlur: faceMask && getComputedStyle(faceMask).filter.includes("blur"),
      hasGreyDisc: !!greyDisc,
      drawerClip,
      outcomeGap,
      heroMinis,
      uniqueFrameBgCount: uniqueFrameBgs.length,
      uniqueFrameBgs,
      whoBlockGone: !whoBlock,
      leadRowFlexDirection: rowStyle?.flexDirection || rowStyle?.display,
      at390: window.innerWidth <= 390,
    };
  });

  await capture(page, `full-${tag}.png`);
  await capture(page, `hero-${tag}.png`, ".dialogue-hero-joola, .cs-hero-media-frame.dialogue-hero-joola");
  await capture(page, `s02-${tag}.png`, "#why-it-matters");
  await capture(page, `s04-${tag}.png`, "#chart-research");
  await capture(page, `s05-${tag}.png`, "#fitted-charts");
  await capture(page, `quote-${tag}.png`, "#clips");
  await capture(page, `closing-${tag}.png`, "#full-answer");

  return m;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ colorScheme: "light", reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });

  const at1440 = await runViewport(page, 1440, "1440");
  const at390 = await runViewport(page, 390, "390");

  await browser.close();
  console.log(JSON.stringify({ at1440, at390, out: OUT }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
