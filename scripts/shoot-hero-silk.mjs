/**
 * Deterministic hero screenshots for the PS3 silk + legibility scrim.
 *
 * A fake clock (Playwright page.clock) pins the silk's time uniform, so two
 * builds render the same ribbon phase and can be compared frame-for-frame.
 *
 *   hero-<vp>-<theme>.png        hero at the device's DPR
 *   scrim-<vp>-<theme>.png       crop around the hero text, 3x nearest-neighbour
 *   scrim-<vp>-<theme>-levels.png same crop with levels stretched 12x around the
 *                                background, so any 1-level banding shows up
 *   drift-*.png                  speed-independent drift check: same frozen
 *                                time with and without 1s/2s of pointer play
 *   intro-mid-*-levels.png       mid intro fade-in, levels stretched
 *   wave-*.png                   wave mode (click-toggled), plus levels
 *   sweep-*.png                  frames during and after one cursor sweep,
 *                                each with a diff against no input, and a
 *                                contact sheet of both
 *
 * Usage: BASE_URL=http://localhost:3000 LABEL=after node scripts/shoot-hero-silk.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const LABEL = process.env.LABEL || "run";
const OUT = join(process.env.ARTIFACT_DIR || "/opt/cursor/artifacts/screens", LABEL);
const CHROME = process.env.CHROME || "/usr/local/bin/google-chrome";
const ONLY = process.env.ONLY || "all"; // all | hero | drift | sweep | banding
const T0 = new Date("2026-11-02T12:00:00Z");

const VIEWPORTS = [
  { name: "1440", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  { name: "1440@1x", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: "390", viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
];

// Now and then a load misses the fake-clock fast-forward (hero text still at
// 0, silk at an earlier phase); retry those so pairs stay comparable.
async function open(browser, vp, theme) {
  for (let attempt = 0; ; attempt++) {
    const o = await openOnce(browser, vp, theme);
    const ok = await o.page.evaluate(() => {
      let a = 1;
      for (let n = document.querySelector(".hero-heading"); n; n = n.parentElement) a *= parseFloat(getComputedStyle(n).opacity);
      return a > 0.99 && !!document.querySelector(".hero-heading");
    });
    if (ok || attempt >= 3) return o;
    await o.context.close();
  }
}

async function openOnce(browser, vp, theme) {
  const context = await browser.newContext({
    viewport: vp.viewport,
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: !!vp.isMobile,
    hasTouch: !!vp.hasTouch,
    colorScheme: theme,
  });
  await context.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch {} }, theme);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.clock.install({ time: T0 });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.clock.pauseAt(new Date(T0.getTime() + 6000));
  await page.clock.runFor(4000);
  // CSS transitions and WAAPI run on real time; let them settle while the
  // fake clock (and so the silk) is paused.
  await page.waitForTimeout(2500);
  return { context, page, errors };
}

async function settle(page) {
  await page.waitForTimeout(1200);
}

async function heroBox(page) {
  return page.evaluate(() => {
    const hero = document.querySelector("[data-work-hero]").getBoundingClientRect();
    const h1 = document.querySelector(".hero-heading").getBoundingClientRect();
    const sub = document.querySelector("[data-hero-sub]").getBoundingClientRect();
    return {
      hero: { x: 0, y: 0, width: innerWidth, height: Math.min(innerHeight, hero.bottom + 40) },
      text: {
        x: Math.max(0, Math.min(h1.left, sub.left) - 120),
        y: Math.max(0, h1.top - 70),
        width: Math.min(innerWidth, Math.max(h1.right, sub.right) + 240) - Math.max(0, Math.min(h1.left, sub.left) - 120),
        height: Math.min(sub.bottom + 70, hero.bottom) - Math.max(0, h1.top - 70),
      },
    };
  });
}

// Upscale (nearest) and optionally stretch levels around the background so a
// single 8-bit step reads as a visible band.
async function postProcess(browser, png, scale, stretch) {
  const page = await browser.newPage();
  const out = await page.evaluate(async ([b64, scale, stretch]) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width * scale; c.height = img.height * scale;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    if (stretch > 1) {
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const p = d.data;
      // background = most common colour in the top-left corner block
      const bg = [p[0], p[1], p[2]];
      for (let i = 0; i < p.length; i += 4) {
        for (let k = 0; k < 3; k++) p[i + k] = Math.max(0, Math.min(255, 128 + (p[i + k] - bg[k]) * stretch));
      }
      ctx.putImageData(d, 0, 0);
    }
    return c.toDataURL("image/png").split(",")[1];
  }, [png.toString("base64"), scale, stretch]);
  await page.close();
  return Buffer.from(out, "base64");
}

async function diffStats(browser, a, b) {
  const page = await browser.newPage();
  const res = await page.evaluate(async ([a64, b64]) => {
    const load = async (s) => { const i = new Image(); i.src = "data:image/png;base64," + s; await i.decode(); return i; };
    const [ia, ib] = await Promise.all([load(a64), load(b64)]);
    const c = document.createElement("canvas");
    c.width = ia.width; c.height = ia.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(ia, 0, 0); const da = ctx.getImageData(0, 0, c.width, c.height).data;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(ib, 0, 0); const db = ctx.getImageData(0, 0, c.width, c.height);
    let changed = 0, sum = 0;
    const p = db.data;
    for (let i = 0; i < p.length; i += 4) {
      const d = Math.abs(p[i] - da[i]) + Math.abs(p[i + 1] - da[i + 1]) + Math.abs(p[i + 2] - da[i + 2]);
      sum += d;
      if (d > 12) changed++;
      const v = Math.min(255, d * 4);
      p[i] = v; p[i + 1] = v * 0.6; p[i + 2] = 0; p[i + 3] = 255;
    }
    ctx.putImageData(db, 0, 0);
    return { changedPct: +((100 * changed) / (p.length / 4)).toFixed(2), meanAbs: +(sum / (p.length / 4)).toFixed(2), png: c.toDataURL("image/png").split(",")[1] };
  }, [a.toString("base64"), b.toString("base64")]);
  await page.close();
  return { changedPct: res.changedPct, meanAbs: res.meanAbs, png: Buffer.from(res.png, "base64") };
}

async function shootHero(browser) {
  const report = [];
  for (const vp of VIEWPORTS) {
    for (const theme of ["dark", "light"]) {
      const { context, page, errors } = await open(browser, vp, theme);
      const box = await heroBox(page);
      const tag = `${vp.name}-${theme}`;
      writeFileSync(join(OUT, `hero-${tag}.png`), await page.screenshot({ clip: box.hero }));
      const crop = await page.screenshot({ clip: box.text });
      writeFileSync(join(OUT, `scrim-${tag}.png`), await postProcess(browser, crop, vp.deviceScaleFactor >= 2 ? 2 : 3, 1));
      writeFileSync(join(OUT, `scrim-${tag}-levels.png`), await postProcess(browser, crop, vp.deviceScaleFactor >= 2 ? 2 : 3, 12));
      report.push({ tag, errors });
      await context.close();
    }
  }
  return report;
}

// Frozen-time drift check: identical clock, one run without input and one
// with 1s of pointer play near the right of the hero, then 1s more of rest.
async function shootDrift(browser) {
  const vp = VIEWPORTS[1];
  const shots = {};
  for (const play of [false, true]) {
    const { context, page } = await open(browser, vp, "dark");
    // Hide the custom cursor + its trail so the diff only shows the silk.
    await page.addStyleTag({ content: `body > div[style*="position: fixed"][style*="pointer-events: none"] { visibility: hidden !important; }` });
    const box = await heroBox(page);
    const hb = await page.evaluate(() => {
      const r = document.querySelector("[data-work-hero]").getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    const steps = 60; // 1s at 60Hz
    for (let i = 0; i < steps; i++) {
      if (play) {
        const a = (i / steps) * Math.PI * 4;
        await page.mouse.move(hb.x + hb.w * (0.78 + 0.1 * Math.cos(a)), hb.y + hb.h * (0.35 + 0.18 * Math.sin(a)));
      }
      await page.clock.runFor(16.667);
    }
    await settle(page);
    shots[`${play}-1s`] = await page.screenshot({ clip: box.hero });
    for (let i = 0; i < steps; i++) await page.clock.runFor(16.667);
    await settle(page);
    shots[`${play}-2s`] = await page.screenshot({ clip: box.hero });
    await context.close();
  }
  const out = {};
  for (const t of ["1s", "2s"]) {
    writeFileSync(join(OUT, `drift-rest-${t}.png`), shots[`false-${t}`]);
    writeFileSync(join(OUT, `drift-play-${t}.png`), shots[`true-${t}`]);
    const d = await diffStats(browser, shots[`false-${t}`], shots[`true-${t}`]);
    writeFileSync(join(OUT, `drift-diff-${t}.png`), d.png);
    out[t] = { changedPct: d.changedPct, meanAbs: d.meanAbs };
  }
  return out;
}

// Cursor sweep: one left-to-right pass through the ribbons at ~1200px/s,
// then the pointer rests. Frames at fixed fake-clock times during and after
// it, plus the same times with no input, so the diff is only the cursor.
const SWEEP_AT = [150, 300, 450, 600, 900, 1300, 2000, 4000];
async function shootSweep(browser) {
  const vp = VIEWPORTS[1];
  const out = {};
  for (const theme of ["dark", "light"]) {
    const shots = {};
    for (const play of [false, true]) {
      const { context, page } = await open(browser, vp, theme);
      await page.addStyleTag({ content: `body > div[style*="position: fixed"][style*="pointer-events: none"] { visibility: hidden !important; }` });
      const box = await heroBox(page);
      const hb = await page.evaluate(() => {
        const r = document.querySelector("[data-work-hero]").getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      });
      const sweepMs = 600, y = hb.y + hb.h * 0.5;
      let t = 0;
      for (const at of SWEEP_AT) {
        for (; t < at; t += 16.667) {
          if (play && t <= sweepMs) await page.mouse.move(hb.x + hb.w * (0.45 + 0.5 * (t / sweepMs)), y);
          await page.clock.runFor(16.667);
        }
        await page.waitForTimeout(100);
        shots[`${play}-${at}`] = await page.screenshot({ clip: box.hero });
      }
      await context.close();
    }
    const rows = [];
    for (const at of SWEEP_AT) {
      const play = shots[`true-${at}`], rest = shots[`false-${at}`];
      writeFileSync(join(OUT, `sweep-${theme}-${at}ms.png`), play);
      const d = await diffStats(browser, rest, play);
      writeFileSync(join(OUT, `sweep-${theme}-${at}ms-diff.png`), d.png);
      out[`${theme}-${at}`] = { changedPct: d.changedPct, meanAbs: d.meanAbs };
      rows.push({ label: `${at} ms${at <= 600 ? " (sweeping)" : ""}`, play, diff: d.png });
    }
    writeFileSync(join(OUT, `sweep-${theme}-sheet.png`), await contactSheet(browser, rows));
  }
  return out;
}

// Frames stacked top to bottom: the frame on the left, its diff against no
// input on the right.
async function contactSheet(browser, rows) {
  const page = await browser.newPage();
  const b64 = await page.evaluate(async (rows) => {
    const load = async (s) => { const i = new Image(); i.src = "data:image/png;base64," + s; await i.decode(); return i; };
    const imgs = await Promise.all(rows.map(async (r) => [await load(r.play), await load(r.diff)]));
    const s = 0.5, w = imgs[0][0].width * s, h = imgs[0][0].height * s, pad = 28;
    const c = document.createElement("canvas");
    c.width = w * 2 + 8; c.height = rows.length * (h + pad);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = "16px sans-serif"; ctx.fillStyle = "#fff";
    rows.forEach((r, k) => {
      const y = k * (h + pad);
      ctx.fillText(r.label, 6, y + 19);
      ctx.drawImage(imgs[k][0], 0, y + pad, w, h);
      ctx.drawImage(imgs[k][1], w + 8, y + pad, w, h);
    });
    return c.toDataURL("image/png").split(",")[1];
  }, rows.map((r) => ({ label: r.label, play: r.play.toString("base64"), diff: r.diff.toString("base64") })));
  await page.close();
  return Buffer.from(b64, "base64");
}

// Banding checks: mid intro fade (silk + scrim fading in) and wave mode
// (smooth low-alpha gradients), both with levels stretched.
async function shootBanding(browser) {
  const vp = VIEWPORTS[0];
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({ viewport: vp.viewport, deviceScaleFactor: vp.deviceScaleFactor, colorScheme: theme });
    await context.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch {} }, theme);
    const page = await context.newPage();
    await page.clock.install({ time: T0 });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.clock.pauseAt(new Date(T0.getTime() + 1500));
    await page.waitForTimeout(800);
    const box = await heroBox(page);
    const mid = await page.screenshot({ clip: box.hero });
    writeFileSync(join(OUT, `intro-mid-1440-${theme}-levels.png`), await postProcess(browser, mid, 1, 12));
    await page.clock.runFor(6000);
    const hb = await page.evaluate(() => {
      const r = document.querySelector("[data-work-hero]").getBoundingClientRect();
      return { x: r.left + r.width * 0.85, y: r.top + r.height * 0.85 };
    });
    await page.mouse.click(hb.x, hb.y);
    await page.clock.runFor(1500);
    await page.mouse.move(2, vp.viewport.height - 2);
    await page.waitForTimeout(1500);
    const wave = await page.screenshot({ clip: box.hero });
    writeFileSync(join(OUT, `wave-1440-${theme}.png`), wave);
    writeFileSync(join(OUT, `wave-1440-${theme}-levels.png`), await postProcess(browser, wave, 1, 12));
    await context.close();
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--enable-unsafe-swiftshader"] });
  const result = {};
  if (ONLY === "all" || ONLY === "hero") result.hero = await shootHero(browser);
  if (ONLY === "all" || ONLY === "drift") result.drift = await shootDrift(browser);
  if (ONLY === "all" || ONLY === "sweep") result.sweep = await shootSweep(browser);
  if (ONLY === "all" || ONLY === "banding") await shootBanding(browser);
  await browser.close();
  writeFileSync(join(OUT, "report.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
