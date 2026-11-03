// Dialogue UI audit for the live stage (/dialogue/motion). Needs the dev server.
// usage: node scripts/audit-dialogue-ui.mjs [base-url] [demo ...]      (npm run audit:dialogue-ui)
// Three checks, each run on desktop and on the phone stage, in the states a take actually passes through:
//   layout-shift  selecting a bar segment must not move one pixel of the answer card (every element inside the card is
//                 measured at rest, with the 225 open and with the 75 open; the card's own height must match too).
//   hover         with the real mouse over a clickable, before any press, the pixels around it must change.
//   press         with the button held down, the pixels must change again (the press state differs from hover).
// Exit code 1 on any failure. Prints one JSON line per failure and a summary.
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright"); } catch { pw = req("@playwright/test"); }
const sharp = req("sharp");
const [, , base = "http://localhost:3000", ...only] = process.argv;
const DEMOS = only.length ? only.filter((d) => d !== "answer") : ["hero", "side", "clip", "every", "toggles", "thin", "picker"];

/** What each demo exposes, in order: a setup that reveals the clickables, then their selectors. */
const SCENES = {
  hero: [{ setup: "d.send(); d.answer();", wait: 2200, targets: ['[data-target="side-friday"]', '[data-target="side"]'] }, { setup: "d.ana();", wait: 1200, targets: ['[data-target="quote-ana"]'] }],
  side: [
    { setup: "", targets: ['[data-target="side-friday"]', '[data-target="side"]', '[data-target="quote-ana"]'] },
    { setup: "d.side('unsure');", wait: 900, targets: ['[data-target="side-collapse"]', '[data-target="quote-mei"]', '[data-target="side-friday"]'] },
  ],
  clip: [{ setup: "", targets: ['[data-target="quote-ana"]', '[data-target="side-collapse"]'] }, { setup: "d.clip(true);", wait: 900, targets: [".dp-qplayer__btn"] }],
  every: [{ setup: "d.side('unsure');", wait: 900, targets: ['[data-target="side"]', '[data-target="quote-mei"]', '[data-target="side-collapse"]'] }],
  toggles: [{ setup: "d.level(2);", wait: 1100, targets: ['[data-target="level-0"]', '[data-target="level-1"]', '[data-target="level-2"]', '[data-target="quote-ana"]', ".dlg-dur[data-play]"] }],
  thin: [{ setup: "d.thin();", wait: 1500, targets: ['[data-target="chip-0"]', '[data-target="chip-1"]'] }],
  picker: [{ setup: "d.type(80);", wait: 1200, targets: ['[data-target="depth-0"]', '[data-target="depth-1"]', '[data-target="depth-2"]', '[data-target="send"]'] }],
};
/** Demos whose answer card carries the two-segment bar (layout-shift is measured on it). */
const BAR_DEMOS = { hero: "d.send(); d.answer();", side: "", every: "", toggles: "d.level(2);", picker: "d.pick(1); d.send(); d.answer();" };

const MIN_DIFF = 0.35; // mean absolute channel difference over the target's box (0 to 255)
const fails = []; let checks = 0;
const fail = (o) => { fails.push(o); console.log(JSON.stringify({ fail: true, ...o })); };

const browser = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });
async function open(demo, mobile, theme = "light") {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => localStorage.setItem("theme", t), theme);
  const page = await ctx.newPage();
  for (let attempt = 0; ; attempt++) {
    await page.goto(`${base}/dialogue/motion?demo=${demo}${mobile ? "&m=1" : ""}`, { waitUntil: "networkidle" });
    try { await page.waitForFunction(() => window.__dlg && document.getElementById("frame"), null, { timeout: 20000 }); break; } catch (e) { if (attempt >= 3) throw e; }
  }
  await page.addStyleTag({ content: "*{caret-color:transparent !important} #dlg-cursor{display:none !important}" });
  await page.waitForTimeout(500);
  return { ctx, page };
}
const run = (page, js) => page.evaluate(`(() => { const d = window.__dlg; ${js} })()`);

async function geometry(page) {
  return page.evaluate(() => {
    const card = document.querySelector(".dp-chart-viz-card");
    if (!card) return null;
    const c = card.getBoundingClientRect(); const out = { card: [c.width, c.height, ""] };
    card.querySelectorAll("*").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      // Anything that draws a gap without changing a box: inset shadows (the old seam), borders, outlines' offsets.
      const draw = [cs.boxShadow.replace(/rgba?\([^)]*\)|#[0-9a-f]+|color\([^)]*\)/gi, "").trim(), cs.borderLeftWidth, cs.borderTopWidth, cs.marginLeft, cs.marginTop, cs.gap].join("|");
      out[`${i}:${(el.className?.baseVal ?? el.className ?? el.tagName).toString().slice(0, 48)}`] = [r.left - c.left, r.top - c.top, r.width, r.height].map((v) => Math.round(v * 100) / 100).concat([draw]);
    });
    return out;
  });
}

async function layoutShift(demo, mobile) {
  const { ctx, page } = await open(demo, mobile);
  await run(page, BAR_DEMOS[demo] || "");
  await page.waitForTimeout(2200);
  const rest = await geometry(page);
  if (!rest) { await ctx.close(); return; }
  for (const state of demo === "hero" ? ["d.ana()"] : ["d.side('friday')", "d.side('unsure')", "d.side(false)"]) {
    await run(page, `${state};`);
    await page.waitForTimeout(1200);
    const g = await geometry(page); checks++;
    const bad = [];
    for (const k of Object.keys(rest)) {
      const a = rest[k], b = g[k];
      if (!b || a.some((v, i) => (typeof v === "string" ? v !== b[i] : Math.abs(v - b[i]) > 0.01))) bad.push({ el: k, rest: a, now: b });
    }
    if (bad.length) fail({ check: "layout-shift", demo, mobile, state, moved: bad.slice(0, 4) });
  }
  await ctx.close();
}

async function shot(page, box) {
  const buf = await page.screenshot({ clip: box });
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  return { data, info };
}
function meanDiff(a, b) {
  if (a.data.length !== b.data.length) return 99;
  let s = 0; for (let i = 0; i < a.data.length; i++) s += Math.abs(a.data[i] - b.data[i]);
  return s / a.data.length;
}

async function hoverPress(demo, mobile) {
  const { ctx, page } = await open(demo, mobile);
  for (const scene of SCENES[demo]) {
    if (scene.setup) { await run(page, scene.setup); await page.waitForTimeout(scene.wait ?? 800); }
    for (const sel of scene.targets) {
      const els = await page.$$(sel);
      if (!els.length) { fail({ check: "target-missing", demo, mobile, sel }); continue; }
      const el = els[0]; await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(150);
      const bb = await el.boundingBox(); if (!bb || bb.width < 2) { fail({ check: "target-hidden", demo, mobile, sel }); continue; }
      const pad = 10;
      const box = { x: Math.max(0, bb.x - pad), y: Math.max(0, bb.y - pad), width: bb.width + 2 * pad, height: bb.height + 2 * pad };
      await page.mouse.move(2, 2); await page.waitForTimeout(450);
      const rest = await shot(page, box);
      await page.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height * 0.5, { steps: 6 }); await page.waitForTimeout(420);
      const hover = await shot(page, box);
      await page.mouse.down(); await page.waitForTimeout(260);
      const press = await shot(page, box);
      await page.mouse.move(2, 2); await page.mouse.up(); await page.waitForTimeout(450);
      checks += 2;
      const dh = meanDiff(rest, hover), dp = meanDiff(hover, press);
      // A selected tab keeps its fill on hover (TASTE P14), so only its press is checked.
      const selected = await el.evaluate((n) => n.getAttribute("aria-pressed") === "true" || n.getAttribute("aria-checked") === "true");
      if (!selected && dh < MIN_DIFF) fail({ check: "hover", demo, mobile, sel, diff: Math.round(dh * 1000) / 1000 });
      if (dp < MIN_DIFF) fail({ check: "press", demo, mobile, sel, diff: Math.round(dp * 1000) / 1000 });
    }
  }
  await ctx.close();
}


/** Round 17: the answer card picks bar or rows per answer. On the stress page the real card (third column) must pick the
 *  expected template for each case, a bar's legend labels must stay on one line at desktop width, and a rows layout must not clip its text. */
const EXPECT = { base: "bar", "long-query": "bar", "long-sentence": "bar", tiny: "bar", huge: "bar", "long-labels": "rows", groups: "rows" };
async function layoutPick(mobile) {
  const ctx = await browser.newContext({ viewport: { width: mobile ? 390 : 1500, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/dialogue/answer-stress${mobile ? "?w=phone" : ""}`, { waitUntil: "networkidle", timeout: 90000 });
  for (const [id, want] of Object.entries(EXPECT)) {
    checks++;
    const got = await page.evaluate((id) => {
      const card = document.querySelectorAll(`#case-${id} .dlg-stress__col`)[2]?.querySelector("[data-layout]");
      if (!card) return { layout: null };
      const lanes = [...card.querySelectorAll(".dp-chart-stack__lane-label")].map((n) => Math.round(n.getBoundingClientRect().height));
      const clipped = [...card.querySelectorAll(".dp-chart-bars__label, .dp-chart-bars__row > span:last-child")].filter((n) => n.scrollWidth > n.clientWidth + 1).length;
      return { layout: card.getAttribute("data-layout"), lanes, clipped };
    }, id);
    if (got.layout !== want) fail({ check: "layout-pick", mobile, case: id, want, got: got.layout });
    else if (want === "bar" && !mobile && got.lanes.some((h) => h > 20)) fail({ check: "layout-pick-wrap", case: id, lanes: got.lanes });
    else if (want === "rows" && got.clipped) fail({ check: "layout-pick-clip", mobile, case: id, clipped: got.clipped });
  }
  await ctx.close();
}

for (const demo of DEMOS) for (const mobile of [false, true]) {
  if (BAR_DEMOS[demo] !== undefined) await layoutShift(demo, mobile);
  await hoverPress(demo, mobile);
}
if (!only.length || only.includes("answer")) for (const mobile of [false, true]) await layoutPick(mobile);
await browser.close();
console.log(JSON.stringify({ summary: true, checks, failures: fails.length }));
process.exit(fails.length ? 1 : 0);
