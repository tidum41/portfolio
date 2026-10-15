/**
 * Theme-transition latency bench.
 *
 * Measures input → first visual change, frame gaps, and whether a second
 * click mid-transition reverses progress.
 *
 * Usage:
 *   node scripts/bench-theme-transition.mjs
 *   node scripts/bench-theme-transition.mjs --browser webkit
 *   node scripts/bench-theme-transition.mjs --url http://localhost:3000/
 */
import { chromium, webkit } from "playwright";
import sharp from "/Users/m/Documents/claude code/portfolio/node_modules/sharp/lib/index.js";
import fs from "node:fs";

const args = process.argv.slice(2);
const browserName = args.includes("--browser")
  ? args[args.indexOf("--browser") + 1]
  : "chromium";
const base = process.env.BENCH_BASE || "http://localhost:3000";
const pathArg = args.includes("--path") ? args[args.indexOf("--path") + 1] : "/";
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

const VIEW = { width: 1280, height: 800 };

function summarizeFrames(frames) {
  if (frames.length < 2) return { count: frames.length, p50: null, p95: null, max: null, over20: 0, over32: 0 };
  const dts = [];
  for (let i = 1; i < frames.length; i++) dts.push(frames[i] - frames[i - 1]);
  dts.sort((a, b) => a - b);
  const pick = (q) => dts[Math.min(dts.length - 1, Math.floor(q * (dts.length - 1)))];
  return {
    count: dts.length,
    p50: round(pick(0.5)),
    p95: round(pick(0.95)),
    max: round(dts[dts.length - 1]),
    over20: dts.filter((d) => d > 20).length,
    over32: dts.filter((d) => d > 32).length,
    mean: round(dts.reduce((s, d) => s + d, 0) / dts.length),
  };
}

function round(n) {
  return Math.round(n * 10) / 10;
}

async function rawFromPng(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function diffRatio(a, b, threshold = 24) {
  const n = Math.min(a.length, b.length);
  let changed = 0;
  const pixels = n / 4;
  for (let i = 0; i < n; i += 4) {
    const d =
      Math.abs(a[i] - b[i]) +
      Math.abs(a[i + 1] - b[i + 1]) +
      Math.abs(a[i + 2] - b[i + 2]);
    if (d > threshold) changed++;
  }
  return changed / pixels;
}

async function arm(page) {
  await page.evaluate(() => {
    const w = window;
    w.__tt = {
      clickAt: [],
      themeAt: null,
      maskAt: null,
      frames: [],
      longTasks: [],
      events: [],
      themeBefore: document.documentElement.getAttribute("data-theme"),
    };
    document.addEventListener(
      "click",
      () => {
        w.__tt.clickAt.push(performance.now());
      },
      true,
    );
    const mo = new MutationObserver(() => {
      const now = performance.now();
      const theme = document.documentElement.getAttribute("data-theme");
      if (theme !== w.__tt.themeBefore && w.__tt.themeAt == null) w.__tt.themeAt = now;
      const style = document.getElementById("theme-transition-vt-style");
      if (style && style.textContent.includes("mask-image") && w.__tt.maskAt == null) {
        w.__tt.maskAt = now;
      }
      const overlay = document.getElementById("theme-transition-overlay");
      if (overlay && w.__tt.maskAt == null) w.__tt.maskAt = now;
    });
    mo.observe(document.documentElement, { attributes: true, subtree: true, childList: true, characterData: true });
    try {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.entryType === "longtask") {
            w.__tt.longTasks.push({ start: e.startTime, dur: e.duration });
          } else if (e.entryType === "event") {
            w.__tt.events.push({
              name: e.name,
              start: e.startTime,
              dur: e.duration,
              processing: e.processingEnd - e.processingStart,
            });
          }
        }
      });
      po.observe({ type: "longtask", buffered: true });
      try {
        po.observe({ type: "event", durationThreshold: 16, buffered: true });
      } catch {
        /* safari */
      }
    } catch {
      /* ignore */
    }
    let last = performance.now();
    const loop = (t) => {
      w.__tt.frames.push(t);
      last = t;
      w.__tt._raf = requestAnimationFrame(loop);
      void last;
    };
    w.__tt._raf = requestAnimationFrame(loop);
  });
}

async function readProbe(page) {
  return page.evaluate(() => {
    const tt = window.__tt;
    const clicks = tt.clickAt;
    const t0 = clicks[0];
    const framesAfter = tt.frames.filter((t) => t >= t0 && t <= t0 + 700);
    const longAfter = tt.longTasks
      .filter((t) => t.start + t.dur >= t0 && t.start <= t0 + 800)
      .map((t) => ({ startOffset: Math.round(t.start - t0), dur: Math.round(t.dur) }));
    const events = tt.events
      .filter((e) => e.name === "click" || e.name === "pointerdown" || e.name === "pointerup")
      .slice(-6);
    return {
      themeBefore: tt.themeBefore,
      themeAfter: document.documentElement.getAttribute("data-theme"),
      inputToThemeAttrMs: tt.themeAt == null ? null : tt.themeAt - t0,
      inputToMaskOrOverlayMs: tt.maskAt == null ? null : tt.maskAt - t0,
      framesAfter,
      longAfter,
      events,
      clicks,
      overlay: !!document.getElementById("theme-transition-overlay"),
      vt: !!document.getElementById("theme-transition-vt-style")?.textContent,
    };
  });
}

async function pixelDelay(page, toggle) {
  const box = await toggle.boundingBox();
  if (!box) throw new Error("toggle has no box");
  // Sample the page just below the toggle — first Bayer cells land here,
  // and a wide strip so a radiating wave is visible even if the origin cell
  // sits under the button.
  const clip = {
    x: Math.max(0, Math.floor(box.x - 180)),
    y: Math.max(0, Math.floor(box.y + box.height + 4)),
    width: 220,
    height: 140,
  };
  const beforeShot = await page.screenshot({ clip, type: "png" });
  const before = await rawFromPng(beforeShot);

  const samples = [];
  const started = await page.evaluate(() => performance.now());
  // Fire click without awaiting the navigation-style wait; measure in parallel.
  const clickPromise = toggle.click({ delay: 0, timeout: 5000 });

  const deadline = Date.now() + 1200;
  let first = null;
  while (Date.now() < deadline) {
    const shot = await page.screenshot({ clip, type: "png" });
    const now = await page.evaluate(() => performance.now());
    const raw = await rawFromPng(shot);
    const ratio = diffRatio(before.data, raw.data);
    samples.push({ t: round(now - started), ratio: round(ratio * 1000) / 1000 });
    if (ratio > 0.01 && first == null) {
      first = { tFromLoopStart: round(now - started), ratio };
      break;
    }
  }
  await clickPromise.catch(() => {});
  return { clip, first, samples: samples.slice(0, 8), loopStartedAt: started };
}

async function reverseProbe(page) {
  return page.evaluate(async () => {
    const overlay = document.getElementById("theme-transition-overlay");
    const canvas = overlay instanceof HTMLCanvasElement ? overlay : null;
    function revealedFraction() {
      if (!(canvas instanceof HTMLCanvasElement)) return null;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clear = 0;
      const n = width * height;
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] < 16) clear++;
      }
      const sampled = Math.ceil(n / 4);
      return clear / sampled;
    }
    const before = revealedFraction();
    const t0 = performance.now();
    const samples = [];
    await new Promise((resolve) => {
      const step = () => {
        const t = performance.now() - t0;
        samples.push({ t: Math.round(t), revealed: revealedFraction() });
        if (t > 280) resolve(null);
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    return { before, samples, theme: document.documentElement.getAttribute("data-theme") };
  });
}

async function main() {
  const launcher = browserName === "webkit" ? webkit : chromium;
  const browser = await launcher.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 1 });
  const url = base.replace(/\/$/, "") + pathArg;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    document.documentElement.removeAttribute("data-intro");
  });
  const toggle = page.getByRole("button", { name: /switch to (light|dark) mode/i }).first();
  await toggle.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(400);

  const styleCost = await page.evaluate(() => {
    const html = document.documentElement;
    const prev = html.getAttribute("data-theme");
    const next = prev === "light" ? "dark" : "light";
    const t0 = performance.now();
    html.classList.add("theme-switching");
    html.setAttribute("data-theme", next);
    const tSet = performance.now();
    void html.offsetWidth;
    const tFlush = performance.now();
    html.setAttribute("data-theme", prev);
    void getComputedStyle(html).backgroundColor;
    const tPaintRead = performance.now();
    html.classList.remove("theme-switching");
    return {
      prev,
      setAttrMs: tSet - t0,
      forcedStyleMs: tFlush - t0,
      withComputedMs: tPaintRead - t0,
    };
  });

  await arm(page);
  const clickWall = Date.now();
  const clickPerf = await page.evaluate(() => performance.now());
  await toggle.click({ delay: 0, timeout: 8000 });
  await page.waitForTimeout(750);
  const probe = await readProbe(page);
  const frameStats = summarizeFrames(probe.framesAfter || []);

  // Second run: pixel screenshots + reverse, on a fresh load so the first
  // click isn't already mid-theme from the probe run. The probe run already
  // changed theme; go back only after recording, then measure pixels on a
  // new navigation so snapshot cost includes a cold-ish page.
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => document.documentElement.removeAttribute("data-intro"));
  await toggle.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(300);

  let pixels = null;
  let reverse = null;
  try {
    pixels = await pixelDelay(page, toggle);
    await page.waitForTimeout(80);
    const midClickAt = await page.evaluate(() => performance.now());
    await toggle.click({ delay: 0, timeout: 5000 });
    reverse = await reverseProbe(page);
    reverse.midClickAt = midClickAt;
    reverse.themeAfterReverseWait = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
  } catch (err) {
    pixels = { error: String(err) };
  }

  const result = {
    browser: browserName,
    url,
    viewport: VIEW,
    clickWall,
    clickPerf,
    styleCost,
    inputToThemeAttrMs: probe.inputToThemeAttrMs == null ? null : round(probe.inputToThemeAttrMs),
    inputToMaskOrOverlayMs:
      probe.inputToMaskOrOverlayMs == null ? null : round(probe.inputToMaskOrOverlayMs),
    themeBefore: probe.themeBefore,
    themeAfter: probe.themeAfter,
    frameStats,
    longTasks: probe.longAfter,
    events: probe.events,
    overlay: probe.overlay,
    vtStyle: probe.vt,
    pixels,
    reverse,
  };

  console.log(JSON.stringify(result, null, 2));
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
