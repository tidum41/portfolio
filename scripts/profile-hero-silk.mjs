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
 * (GPU_COMPOSITING=1: see LAUNCH_ARGS)
 *
 * MODE=startup instead profiles only the first 3s after the silk's first
 * on-screen draw: page rAF intervals, silk draw intervals (its 30fps
 * cadence), dropped frames, long tasks in that window, and how long the
 * blocking WebGL calls (context, compile, link, uniform lookup, first draws)
 * held the main thread.
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
const MODE = process.env.MODE || "segments";
// GPU_COMPOSITING=1 composites on the (SwiftShader) GPU process like a real
// machine; the default software compositor reads every WebGL frame back on
// the main thread, which inflates silk cost and frame drops.
const LAUNCH_ARGS = ["--enable-unsafe-swiftshader", "--disable-renderer-backgrounding", "--disable-background-timer-throttling",
  ...(process.env.GPU_COMPOSITING === "1" ? ["--ignore-gpu-blocklist", "--enable-gpu-compositing", "--use-gl=angle", "--use-angle=swiftshader"] : [])];
const STARTUP_MS = 3000;

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
  // Silk draw log: [t, ms in call, kind]. Composite draws (default
  // framebuffer) are the frames the visitor sees.
  const gl = (perf.gl = { draws: [], calls: [] });
  perf.events = [];
  for (const ev of ["intro-done", "DOMContentLoaded", "load"]) {
    window.addEventListener(ev, () => perf.events.push([performance.now(), ev]));
  }
  document.fonts?.addEventListener?.("loadingdone", () => perf.events.push([performance.now(), "fonts"]));
  const P = window.WebGLRenderingContext && WebGLRenderingContext.prototype;
  if (P) {
    let fbBound = false, vpW = 0;
    const viewport = P.viewport;
    P.viewport = function (x, y, w, h) { vpW = w; return viewport.call(this, x, y, w, h); };
    const timed = (name) => {
      const orig = P[name];
      P[name] = function (...a) {
        const t = performance.now();
        const r = orig.apply(this, a);
        gl.calls.push([t, performance.now() - t, name, name === "texImage2D" && a.length === 9 ? `${a[3]}x${a[4]}` : ""]);
        return r;
      };
    };
    ["compileShader", "linkProgram", "getUniformLocation", "getProgramParameter", "getShaderParameter", "texImage2D", "useProgram"].forEach(timed);
    const bind = P.bindFramebuffer;
    P.bindFramebuffer = function (target, fb) { fbBound = !!fb; return bind.call(this, target, fb); };
    const draw = P.drawArrays;
    P.drawArrays = function (...a) {
      const t = performance.now();
      const r = draw.apply(this, a);
      // Width is the viewport's, so 1x1 warm-up draws don't count as frames.
      gl.draws.push([t, performance.now() - t, fbBound ? "luma" : "comp", vpW]);
      return r;
    };
    const getCtx = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const t = performance.now();
      const r = getCtx.call(this, type, ...rest);
      if (type === "webgl") gl.calls.push([t, performance.now() - t, "getContext"]);
      return r;
    };
  }
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
    args: LAUNCH_ARGS,
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

// Interval stats. `slot` is the ideal interval; an interval of n slots
// means n-1 dropped frames.
function cadence(times, slot) {
  const d = [];
  for (let i = 1; i < times.length; i++) d.push(times[i] - times[i - 1]);
  return {
    frames: times.length,
    dropped: d.reduce((s, x) => s + Math.max(0, Math.round(x / slot) - 1), 0),
    uneven: d.filter((x) => Math.abs(x - slot) > slot * 0.25).length,
    p50: +pct(d, 50).toFixed(1),
    p95: +pct(d, 95).toFixed(1),
    max: +Math.max(0, ...d).toFixed(1),
  };
}

// "+ms since silk start:interval" for every interval over `over`.
function gaps(times, over, t0) {
  const out = [];
  for (let i = 1; i < times.length; i++) {
    const d = times[i] - times[i - 1];
    if (d > over) out.push(`+${Math.round(times[i - 1] - t0)}:${Math.round(d)}`);
  }
  return out.join(" ");
}

async function startupOnce(vp, run) {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: LAUNCH_ARGS,
  });
  const context = await browser.newContext({
    viewport: vp.viewport, deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile, hasTouch: vp.hasTouch, colorScheme: "dark",
  });
  await context.addInitScript(`window.__heroPerfVariant = ${JSON.stringify(VARIANT)};`);
  await context.addInitScript(initScript);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(BASE + "/", { waitUntil: "load" });
  if (VARIANT !== "nosilk") {
    await page.waitForFunction(() => window.__heroPerf.gl.draws.some((d) => d[2] === "comp" && d[3] > 200), null, { timeout: 15000 });
  }
  await sleep(STARTUP_MS + 1500);
  const raw = await page.evaluate(() => window.__heroPerf);
  await browser.close();

  const comp = raw.gl.draws.filter((d) => d[2] === "comp" && d[3] > 200);
  // Control runs have no silk; anchor where it would start (~650ms after load).
  const loadAt = raw.events.find(([, n]) => n === "load")?.[0] ?? 0;
  const t0 = comp.length ? comp[0][0] : loadAt + 650, t1 = t0 + STARTUP_MS;
  const inWin = (t) => t >= t0 && t <= t1;
  const pageTimes = raw.frames.map(([t]) => t).filter(inWin);
  const silkTimes = comp.map(([t]) => t).filter(inWin);
  const loaf = raw.loaf.filter(([t, d]) => t + d >= t0 && t <= t1);
  const lt = raw.longTasks.filter(([t, d]) => t + d >= t0 && t <= t1);
  const glSetup = raw.gl.calls.filter(([t]) => t < t0 + 50);
  const sum = (names) => +glSetup.filter(([, , n]) => names.includes(n)).reduce((s, [, d]) => s + d, 0).toFixed(1);
  const glInWin = raw.gl.calls.filter(([t]) => inWin(t));
  return {
    viewport: vp.name, run, errors,
    silkFirstDrawAt: Math.round(t0),
    page: cadence(pageTimes, 1000 / 60),
    silk: cadence(silkTimes, 1000 / 30),
    longTasks: lt.length,
    longTaskMax: Math.round(Math.max(0, ...lt.map(([, d]) => d))),
    loafBlockingMs: Math.round(loaf.reduce((s, [, , bd]) => s + bd, 0)),
    topLoaf: loaf.filter(([, d]) => d > 50).map(([t, d, , s]) => `+${Math.round(t - t0)}ms ${Math.round(d)}ms <- ${s}`),
    glSetupMs: {
      getContext: sum(["getContext"]),
      compileLink: sum(["compileShader", "linkProgram", "getShaderParameter", "getProgramParameter"]),
      uniforms: sum(["getUniformLocation"]),
      firstDraws: +comp.slice(0, 2).reduce((s, [, d]) => s + d, 0).toFixed(1),
    },
    glInWindowMaxCall: glInWin.length ? glInWin.reduce((m, c) => (c[1] > m[1] ? c : m)).map((x) => (typeof x === "number" ? Math.round(x * 10) / 10 : x)) : null,
    texUploadsInWindow: glInWin.filter(([, , n]) => n === "texImage2D").length,
    events: [...raw.events, ...glInWin.filter(([, , n]) => n === "texImage2D").map(([t, , , wh]) => [t, `tex${wh}`])]
      .sort((a, b) => a[0] - b[0]).map(([t, n]) => `${n}@${Math.round(t - t0)}`).join(" "),
    pageGaps: gaps(pageTimes, 25, t0),
    silkGaps: gaps(silkTimes, 42, t0),
  };
}

async function startupMain() {
  mkdirSync(OUT, { recursive: true });
  const all = [];
  for (const vp of VIEWPORTS) {
    for (let run = 0; run < RUNS; run++) {
      const r = await startupOnce(vp, run);
      all.push(r);
      console.log(`\n[${LABEL}] startup ${vp.name}px run ${run}  silk first draw @${r.silkFirstDrawAt}ms${r.errors.length ? `  console errors: ${r.errors.length}` : ""}`);
      console.table({ page: r.page, silk: r.silk });
      console.log("  long tasks", r.longTasks, "max", r.longTaskMax, "ms; LoAF blocking", r.loafBlockingMs, "ms; gl setup", JSON.stringify(r.glSetupMs), "; tex uploads in window", r.texUploadsInWindow, "; slowest gl call", JSON.stringify(r.glInWindowMaxCall));
      for (const l of r.topLoaf) console.log("  long frame", l);
      console.log("  events", r.events);
      console.log("  page gaps", r.pageGaps);
      console.log("  silk gaps", r.silkGaps);
      for (const e of r.errors.slice(0, 5)) console.log("  error:", e.slice(0, 200));
    }
  }
  writeFileSync(join(OUT, `hero-silk-startup-${LABEL}.json`), JSON.stringify(all, null, 2));
}

async function main() {
  if (MODE === "startup") return startupMain();
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
