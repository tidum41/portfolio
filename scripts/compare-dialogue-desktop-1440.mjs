/**
 * Compare /dialogue desktop metrics at 1440 against expected 708f3bd baselines.
 */
import { chromium } from "playwright";

const PORT = Number(process.env.PORT || 3020);
const BASE = `http://127.0.0.1:${PORT}`;
/** Post fixes 1–5 spacing (12px gap, 16/16 viz padding, chart label align). Was 10494 / 993 @ 49234fd. */
const EXPECT = { pageScrollHeight: 10483, d08ViewportHeight: 981 };

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForSelector(".dialogue-case-study");
await page.evaluate(() => document.fonts.ready);

const metrics = await page.evaluate(() => {
  const d08 = document.querySelector('[data-dialogue-asset-id="D-08"] .dp-scaled-viewport');
  return {
    pageScrollHeight: document.documentElement.scrollHeight,
    d08ViewportHeight: d08 ? Math.round(d08.getBoundingClientRect().height) : null,
    composerVisible: !!document.querySelector(
      '[data-dialogue-asset-id="D-08"] .dp-study-chat__composer',
    ),
  };
});

await browser.close();

const report = {
  metrics,
  expect: EXPECT,
  match:
    metrics.pageScrollHeight === EXPECT.pageScrollHeight &&
    metrics.d08ViewportHeight === EXPECT.d08ViewportHeight &&
    metrics.composerVisible,
};
console.log(JSON.stringify(report, null, 2));
if (!report.match) process.exit(1);
