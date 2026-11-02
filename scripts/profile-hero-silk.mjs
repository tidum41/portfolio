/**
 * Home hero perf profile: PS3 silk + hero scrim, under 4x CPU throttle.
 *
 * Segments per viewport: load (intro), idle, hero hover sweep (desktop),
 * scroll through the hero and back, card hover (desktop). For each segment:
 * rAF frame intervals, long tasks, long animation frames, renderer and GPU
 * process CPU time (SwiftShader renders WebGL on the CPU here, so GPU process
 * CPU is a direct proxy for shader + compositing cost).
 *
 * Usage: BASE_URL=http://localhost:3000 LABEL=after RUNS=2 node scripts/profile-hero-silk.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts/perf";
const LABEL = process.env.LABEL || "run";
const RUNS = Number(process.env.RUNS || 2);
const CHROME = process.env.CHROME || "/usr/local/bin/google-chrome";
// "nosilk" blocks WebGL contexts so the silk never renders (control run).
const VARIANT = process.env.VARIANT || "full";

const VIEWPORTS = [
  { name: "1440", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
  { name: "390", viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

async function processCpu(browserCdp) {
  const { processInfo } = await browserCdp.send("SystemInfo.getProcessInfo");
  const out = { renderer: 0, gpu: 0, browser: 0 };
  for (const p of processInfo) {
    if (p.type === "renderer") out.renderer += p.cpuTime;
    else if (p.type === "GPU") out.gpu += p.cpuTime;
    else if (p.type === "browser") out.browser += p.cpuTime;
  }
  return out;
}

function initScript() {
  const perf = (window.__heroPerf = { frames: [], longTasks: [], loaf: [] });
  let last = 0;
  const tick = (t) => {
    if (last) perf.frames.push([t, t - last]);
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) perf.longTasks.push([e.startTime, e.duration]);
    }).observe({ type: "longtask", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const top = [...(e.scripts || [])].sort((a, b) => b.duration - a.duration)[0];
        perf.loaf.push([e.startTime, e.duration, e.blockingDuration || 0,
          top ? `${Math.round(top.duration)}ms ${top.invoker || ""} ${top.sourceFunctionName || ""} ${(top.sourceURL || "").split("/").pop()}:${top.sourceCharPosition}` : ""]);
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
  if (window.__heroPerfVariant === "nosilk") {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (type === "webgl" || type === "webgl2") return null;
      return orig.call(this, type, ...rest);
    };
  }
}

async function mainThread(cdp) {
  const { metrics } = await cdp.send("Performance.getMetrics");
  const m = Object.fromEntries(metrics.map((x) => [x.name, x.value]));
  return { task: m.TaskDuration || 0, script: m.ScriptDuration || 0 };
}

async function segment(page, browserCdp, name, fn, cdp) {
  const t0 = await page.evaluate(() => performance.now());
  const m0 = await mainThread(cdp);
  const c0 = await processCpu(browserCdp);
  const w0 = Date.now();
  await fn();
  const wall = Date.now() - w0;
  const c1 = await processCpu(browserCdp);
  const m1 = await mainThread(cdp);
  const t1 = await page.evaluate(() => performance.now());
  const data = await page.evaluate(([a, b]) => {
    const p = window.__heroPerf;
    return {
      frames: p.frames.filter(([t]) => t >= a && t <= b).map(([, d]) => d),
      longTasks: p.longTasks.filter(([t]) => t >= a && t <= b).map(([, d]) => d),
      loaf: p.loaf.filter(([t]) => t >= a && t <= b).map(([, d, bd, s]) => [d, bd, s]),
    };
  }, [t0, t1]);
  const sec = wall / 1000;
  const f = data.frames;
  return {
    name,
    seconds: +sec.toFixed(2),
    fps: +(f.length / ((t1 - t0) / 1000)).toFixed(1),
    frameP50: +pct(f, 50).toFixed(1),
    frameP95: +pct(f, 95).toFixed(1),
    frameMax: +Math.max(0, ...f).toFixed(1),
    jank: f.filter((d) => d > 25).length,
    longTasks: data.longTasks.length,
    longTaskMs: Math.round(data.longTasks.reduce((s, d) => s + d, 0)),
    longTaskMax: Math.round(Math.max(0, ...data.longTasks)),
    loaf: data.loaf.length,
    loafBlockingMs: Math.round(data.loaf.reduce((s, [, bd]) => s + bd, 0)),
    mainTaskMsPerS: Math.round(((m1.task - m0.task) * 1000) / sec),
    mainScriptMsPerS: Math.round(((m1.script - m0.script) * 1000) / sec),
    rendererCpuMsPerS: Math.round(((c1.renderer - c0.renderer) * 1000) / sec),
    gpuCpuMsPerS: Math.round(((c1.gpu - c0.gpu) * 1000) / sec),
    topLoaf: data.loaf.filter(([d]) => d > 100).map(([d, , s]) => `${Math.round(d)}ms <- ${s}`),
  };
}

async function runOnce(vp, run) {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--enable-unsafe-swiftshader", "--disable-renderer-backgrounding", "--disable-background-timer-throttling"],
  });
  const browserCdp = await browser.newBrowserCDPSession();
  const context = await browser.newContext({
    viewport: vp.viewport,
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    colorScheme: "dark",
  });
  await context.addInitScript(`window.__heroPerfVariant = ${JSON.stringify(VARIANT)};`);
  await context.addInitScript(initScript);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Performance.enable");
  const seg = (name, fn) => segment(page, browserCdp, name, fn, cdp);

  const segs = [];
  segs.push(await seg("load+intro", async () => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    await sleep(6000);
  }));
  segs.push(await seg("idle", () => sleep(5000)));

  const hero = await page.evaluate(() => {
    const r = document.querySelector("[data-work-hero]").getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  if (!vp.isMobile) {
    segs.push(await seg("hero-hover", async () => {
      const t0 = Date.now();
      let i = 0;
      while (Date.now() - t0 < 5000) {
        const u = (Math.sin(i / 18) + 1) / 2, v = (Math.cos(i / 11) + 1) / 2;
        await page.mouse.move(hero.x + 40 + u * (hero.w - 80), hero.y + 30 + v * (hero.h - 60));
        await sleep(16);
        i++;
      }
    }));
  }
  segs.push(await seg("scroll", async () => {
    const x = vp.viewport.width / 2, y = vp.viewport.height / 2;
    const src = vp.isMobile ? "touch" : "mouse";
    await cdp.send("Input.synthesizeScrollGesture", { x, y, yDistance: -700, speed: 700, gestureSourceType: src });
    await cdp.send("Input.synthesizeScrollGesture", { x, y, yDistance: 700, speed: 700, gestureSourceType: src });
    await sleep(500);
  }));
  if (!vp.isMobile) {
    const cards = await page.evaluate(() =>
      [...document.querySelectorAll(".portfolio-grid-card")].slice(0, 4).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: Math.min(r.top + 60, innerHeight - 20) };
      }));
    segs.push(await seg("card-hover", async () => {
      for (let k = 0; k < 2; k++) {
        for (const c of cards) {
          await page.mouse.move(c.x, c.y, { steps: 20 });
          await sleep(350);
        }
      }
    }));
  }
  await browser.close();
  return { viewport: vp.name, run, segs, errors };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const all = [];
  for (const vp of VIEWPORTS) {
    for (let run = 0; run < RUNS; run++) {
      const r = await runOnce(vp, run);
      all.push(r);
      console.log(`\n[${LABEL}] ${vp.name}px run ${run}${r.errors.length ? `  console errors: ${r.errors.length}` : ""}`);
      console.table(r.segs.map(({ topLoaf, ...s }) => s));
      for (const s of r.segs) for (const l of s.topLoaf) console.log(`  long frame in ${s.name}: ${l}`);
      for (const e of r.errors.slice(0, 5)) console.log("  error:", e.slice(0, 200));
    }
  }
  writeFileSync(join(OUT, `hero-silk-${LABEL}-${VARIANT}.json`), JSON.stringify(all, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
