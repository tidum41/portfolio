#!/usr/bin/env node
/**
 * Routing demo round 2 interaction check.
 * Hovers bars (pill follows the cursor), clicks, and runs all five templates.
 * Writes shots/routing-demo-r2/.
 */
import { chromium } from "playwright";
import { mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../shots/routing-demo-r2");
const BASE = (process.env.BASE_URL || `http://localhost:${process.env.PORT || "3001"}`).replace(/\/$/, "");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

const QUESTIONS = [
  ["How do shoppers read 'Arrives by Friday'?", "count_split"],
  ["Compare address friction on mobile vs desktop", "segment_comparison"],
  ["What did shoppers say about returns?", "quote_list"],
  ["Play clips about damaged packaging", "clip_list"],
  ["How many shoppers mentioned damaged packaging?", "thin_data"],
];

try {
  const res = await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle", timeout: 60000 });
  log(!!res && res.status() < 400, `load /dialogue (${res && res.status()})`);
  const demo = page.locator(".dlg-route-demo");
  await demo.waitFor({ state: "visible", timeout: 20000 });
  await demo.scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(OUT, "before-idle.png"), clip: await clipOf(demo) });

  // Hover pill on the idle count split, both segments.
  for (const sel of [".dlg-live__side--friday", ".dlg-live__side--unsure"]) {
    const side = demo.locator(sel);
    const box = await side.boundingBox();
    log(!!box, `bar hit ${sel} has a box`);
    if (!box) continue;
    const left = { x: box.x + 24, y: box.y + box.height / 2 };
    const right = { x: box.x + box.width - 16, y: box.y + box.height / 2 };
    await page.mouse.move(left.x, left.y);
    const pill = demo.locator("[data-chart-pill]");
    await pill.waitFor({ state: "visible", timeout: 2000 });
    const a = await pill.boundingBox();
    const textA = (await pill.innerText()).trim();
    await page.mouse.move(right.x, right.y);
    await page.waitForTimeout(40);
    const b = await pill.boundingBox();
    const textB = (await pill.innerText()).trim();
    log(/\d+%/.test(textA) && textA === textB, `${sel} pill shows a percent (${textA})`);
    log(!!a && !!b && Math.abs(a.x - b.x) > 6, `${sel} pill follows the cursor (Δx=${a && b ? Math.round(b.x - a.x) : "n/a"})`);
    if (sel.endsWith("friday")) {
      await page.screenshot({ path: join(OUT, "hover-pill.png"), clip: await clipOf(demo) });
    }
  }

  // Instant press / selected state on the bar, and the See the N chip.
  const friday = demo.locator(".dlg-live__side--friday");
  await friday.click();
  const sideOpen = await demo.locator(".dlg-live__bar").getAttribute("data-side");
  log(sideOpen === "friday", `bar click selects friday immediately (data-side=${sideOpen})`);
  const see = demo.getByRole("button", { name: /See the \d+/ });
  log(!(await see.isDisabled()), "See the N chip is enabled");
  await see.click();
  log((await demo.locator(".dp-side-sample").count()) > 0, "See the N opens the people");
  const play = demo.getByRole("button", { name: /Play .+ clip/ });
  log(!(await play.isDisabled()), "Play clip chip is enabled");
  await play.click();
  await demo.locator(".dp-qplayer").waitFor({ state: "visible", timeout: 2000 });
  const still = await demo.locator(".dp-qplayer__placeholder").evaluate((el) => getComputedStyle(el).backgroundImage);
  log(still.includes("clip-still"), `clip player uses the recording still (${still.slice(0, 80)})`);
  await page.screenshot({ path: join(OUT, "after-clip-open.png"), clip: await clipOf(demo) });

  // Composer clears and does not clip the glyphs.
  const input = demo.locator(".dlg-route-demo__input");
  await input.click();
  await page.keyboard.type("How many shoppers mentioned damaged packaging?");
  const metrics = await input.evaluate((el) => ({
    scroll: el.scrollHeight,
    client: el.clientHeight,
    value: el.value,
  }));
  log(metrics.scroll <= metrics.client + 1, `input text is not clipped (scroll ${metrics.scroll} client ${metrics.client})`);

  for (const [question, template] of QUESTIONS) {
    const chip = demo.getByRole("button", { name: question, exact: true });
    const route = page.waitForResponse(
      (r) => r.url().includes("/api/dialogue/route") && r.request().method() === "POST",
      { timeout: 8000 },
    );
    if (await chip.count()) {
      await chip.click();
    } else {
      await input.fill(question);
      await demo.locator(".dlg-route-demo__send").click();
    }
    await route;
    const answer = demo.locator(`[data-template="${template}"]`);
    await answer.waitFor({ state: "visible", timeout: 8000 });
    const cleared = await input.inputValue();
    log(cleared === "", `composer cleared after "${question.slice(0, 32)}"`);
    log(true, `question routes to ${template}`);
    if (template === "segment_comparison") {
      const rows = demo.locator(".dp-chart-bars__row");
      const box = await rows.first().boundingBox();
      await page.mouse.move(box.x + 40, box.y + box.height / 2);
      const pill = demo.locator("[data-chart-pill]");
      await pill.waitFor({ state: "visible", timeout: 2000 });
      const p1 = await pill.boundingBox();
      await page.mouse.move(box.x + Math.min(box.width - 12, 180), box.y + box.height / 2);
      await page.waitForTimeout(40);
      const p2 = await pill.boundingBox();
      log(!!p1 && !!p2 && Math.abs(p1.x - p2.x) > 6, "comparison pill follows the cursor");
      await rows.nth(1).click();
      log((await demo.locator(".dp-side-sample").count()) > 0, "comparison bar click opens people");
      const values = await rows.evaluateAll((els) =>
        els.map((el) => Number(el.querySelector(".dp-chart-bars__v-count")?.textContent?.trim())),
      );
      const sum = values.reduce((a, n) => a + n, 0);
      const finding = await demo.locator(".dp-chart-title").innerText();
      log(finding.includes(String(sum)), `comparison count ${sum} is named in the finding`);
      await page.screenshot({ path: join(OUT, "comparison-hover.png"), clip: await clipOf(demo) });
    }
    if (template === "quote_list") {
      const quotes = await demo.locator(".dp-clip-quote__text").allInnerTexts();
      log(quotes.length > 0 && quotes.every((q) => /return/i.test(q)), `returns quotes are about returns (${quotes.join(" | ")})`);
    }
    if (template === "count_split") {
      const title = await demo.locator(".dp-chart-title").innerText();
      log(title.includes("225 of 300"), `Friday answer uses the case study base (${title.slice(0, 48)})`);
    }
  }

  await page.screenshot({ path: join(OUT, "after-five-questions.png"), clip: await clipOf(demo) });
} catch (err) {
  log(false, err instanceof Error ? err.message : String(err));
} finally {
  await browser.close();
}

const recording = "/tmp/dialogue-motion-frames/live-hero-ask/f-012.png";
try {
  copyFileSync(recording, join(OUT, "recording-bar-hover.png"));
  const hover = join(OUT, "hover-pill.png");
  const left = await sharp(hover).resize({ height: 420 }).png().toBuffer();
  const right = await sharp(recording).resize({ height: 420 }).png().toBuffer();
  const lm = await sharp(left).metadata();
  const rm = await sharp(right).metadata();
  await sharp({
    create: {
      width: (lm.width || 0) + (rm.width || 0) + 24,
      height: 420,
      channels: 3,
      background: "#eceae4",
    },
  })
    .composite([
      { input: left, left: 0, top: 0 },
      { input: right, left: (lm.width || 0) + 24, top: 0 },
    ])
    .png()
    .toFile(join(OUT, "hover-pill-beside-recording.png"));
} catch (err) {
  log(false, `composite: ${err instanceof Error ? err.message : String(err)}`);
}

const report = [
  "# Routing demo round 2",
  "",
  `Base: ${BASE}`,
  "",
  failures.length ? `Failures:\n${failures.map((f) => `- ${f}`).join("\n")}` : "All interaction checks passed.",
  "",
  "Shots: before-idle.png, hover-pill.png, hover-pill-beside-recording.png, after-clip-open.png, comparison-hover.png, after-five-questions.png, recording-bar-hover.png.",
  "",
].join("\n");
writeFileSync(join(OUT, "REPORT.md"), report);

if (failures.length) {
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nAll interaction checks passed.");

async function clipOf(locator) {
  const box = await locator.boundingBox();
  if (!box) return undefined;
  return {
    x: Math.max(0, Math.round(box.x) - 8),
    y: Math.max(0, Math.round(box.y) - 8),
    width: Math.round(box.width) + 16,
    height: Math.min(1400, Math.round(box.height) + 16),
  };
}
