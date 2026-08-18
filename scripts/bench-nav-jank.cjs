/**
 * Sure-proof nav jank benchmark.
 *
 * Measures long-tasks + pointer-event gaps while continuously moving the
 * mouse across soft-nav Work ↔ About ↔ Archive (warm) and cold first paints.
 *
 * Usage:
 *   node scripts/bench-nav-jank.mjs                  # print JSON
 *   node scripts/bench-nav-jank.mjs --out results.json
 *   node scripts/bench-nav-jank.mjs --compare before.json
 *
 * Exit code 1 if --compare regresses past thresholds.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BENCH_BASE || "http://localhost:3000";
const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
const cmpIdx = args.indexOf("--compare");
const comparePath = cmpIdx >= 0 ? args[cmpIdx + 1] : null;

function summarize(gaps, longTasks, windowMs) {
  const bigGaps = gaps.filter((g) => g.gap >= 50);
  const maxGap = gaps.reduce((m, g) => Math.max(m, g.gap), 0);
  const long = longTasks.filter((t) => t.d >= 50);
  const maxLong = long.reduce((m, t) => Math.max(m, t.d), 0);
  const sumLong = long.reduce((s, t) => s + t.d, 0);
  return {
    windowMs,
    maxPointerGapMs: maxGap,
    pointerGapsGe50: bigGaps.length,
    pointerGapsGe80: gaps.filter((g) => g.gap >= 80).length,
    maxLongTaskMs: maxLong,
    longTaskCountGe50: long.length,
    longTaskTotalMs: sumLong,
  };
}

async function armObservers(page) {
  await page.evaluate(() => {
    if (window.__benchArmed) {
      window.__bench.gaps = [];
      window.__bench.longTasks = [];
      window.__bench.marks = [];
      return;
    }
    window.__benchArmed = true;
    window.__bench = {
      longTasks: [],
      gaps: [],
      marks: [],
      muxCount: 0,
    };
    try {
      const obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.duration >= 40) {
            window.__bench.longTasks.push({
              d: Math.round(e.duration),
              s: Math.round(e.startTime),
              path: location.pathname,
            });
          }
        }
      });
      obs.observe({ type: "longtask", buffered: true });
    } catch (_) {}
    let last = performance.now();
    window.addEventListener(
      "pointermove",
      () => {
        const now = performance.now();
        const gap = now - last;
        last = now;
        if (gap >= 30) {
          window.__bench.gaps.push({
            gap: Math.round(gap),
            t: Math.round(now),
            path: location.pathname,
          });
        }
      },
      { passive: true },
    );
  });
}

async function moveMouse(page, ms) {
  const steps = Math.max(8, Math.floor(ms / 16));
  for (let i = 0; i < steps; i++) {
    const x = 180 + (i % 24) * 36;
    const y = 220 + Math.sin(i / 3) * 90 + ((i * 7) % 40);
    await page.mouse.move(x, y, { steps: 1 });
    await page.waitForTimeout(16);
  }
}

async function softNav(page, href) {
  await page.evaluate((h) => {
    sessionStorage.setItem("soft-nav", "1");
    window.dispatchEvent(new CustomEvent("soft-nav-start"));
    window.__bench.marks.push({
      phase: "pre-nav",
      href: h,
      t: Math.round(performance.now()),
      path: location.pathname,
    });
    const a = document.querySelector(`a[href="${h}"]`);
    if (!a) throw new Error(`missing link ${h}`);
    a.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    a.click();
  }, href);
  await page.waitForFunction((h) => location.pathname === h, href, { timeout: 15000 });
  await page.evaluate((h) => {
    window.__bench.marks.push({
      phase: "arrived",
      href: h,
      t: Math.round(performance.now()),
      path: location.pathname,
    });
  }, href);
}

async function sliceAroundArrival(page, arriveT, before = 100, after = 900) {
  return page.evaluate(
    ({ arriveT, before, after }) => {
      const lo = arriveT - before;
      const hi = arriveT + after;
      return {
        gaps: window.__bench.gaps.filter((g) => g.t >= lo && g.t <= hi),
        longTasks: window.__bench.longTasks.filter((t) => t.s >= lo && t.s <= hi),
      };
    },
    { arriveT, before, after },
  );
}

async function clearBenchWindow(page) {
  await page.evaluate(() => {
    window.__bench.gaps = [];
    window.__bench.longTasks = [];
    window.__bench.marks = [];
  });
}

async function runWarmLeg(page, from, to) {
  if (page.url().includes(from) === false && !(from === "/" && /localhost:3000\/?$/.test(page.url()))) {
    await page.goto(BASE + (from === "/" ? "/" : from), { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(from === "/" ? 3500 : 1500);
  }
  await armObservers(page);
  await clearBenchWindow(page);

  // Warm destination RSC/JS if possible
  await page.evaluate((h) => {
    const a = document.querySelector(`a[href="${h}"]`);
    if (a) a.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  }, to);

  const mover = moveMouse(page, 1400);
  await page.waitForTimeout(80);
  await softNav(page, to);
  await mover;
  await page.waitForTimeout(400);

  const marks = await page.evaluate(() => window.__bench.marks);
  const arrived = marks.find((m) => m.phase === "arrived");
  const pre = marks.find((m) => m.phase === "pre-nav");
  const windowed = await sliceAroundArrival(page, arrived.t, 80, 1000);
  const summary = summarize(windowed.gaps, windowed.longTasks, 1080);
  return {
    from,
    to,
    clickToArriveMs: arrived.t - pre.t,
    ...summary,
    sampleGaps: windowed.gaps.filter((g) => g.gap >= 50).slice(0, 12),
    sampleLongTasks: windowed.longTasks.slice(0, 12),
  };
}

/** First soft-nav from a fresh Work session with no hover-prefetch (true first visit). */
async function runColdSoftNav(context, to) {
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__benchArmed = false;
  });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3500);
  await armObservers(page);
  await clearBenchWindow(page);
  // Explicitly do NOT hover-prefetch — measure first-click cost.
  const mover = moveMouse(page, 1400);
  await page.waitForTimeout(50);
  await softNav(page, to);
  await mover;
  await page.waitForTimeout(400);
  const marks = await page.evaluate(() => window.__bench.marks);
  const arrived = marks.find((m) => m.phase === "arrived");
  const pre = marks.find((m) => m.phase === "pre-nav");
  const windowed = await sliceAroundArrival(page, arrived.t, 80, 1000);
  const summary = summarize(windowed.gaps, windowed.longTasks, 1080);
  await page.close();
  return {
    kind: "cold-soft",
    from: "/",
    to,
    clickToArriveMs: arrived.t - pre.t,
    ...summary,
    sampleGaps: windowed.gaps.filter((g) => g.gap >= 50).slice(0, 12),
    sampleLongTasks: windowed.longTasks.slice(0, 12),
  };
}

/** Second soft-nav to same destination after shell should be keep-alive. */
async function runSecondVisit(page, to) {
  // Ensure we're on work first
  if (!/localhost:3000\/?$/.test(page.url()) && !page.url().endsWith("/")) {
    await softNav(page, "/");
    await page.waitForTimeout(400);
  }
  await armObservers(page);
  await clearBenchWindow(page);
  const mover = moveMouse(page, 1200);
  await page.waitForTimeout(50);
  await softNav(page, to);
  await mover;
  await page.waitForTimeout(300);
  const marks = await page.evaluate(() => window.__bench.marks);
  const arrived = marks.find((m) => m.phase === "arrived");
  const pre = marks.find((m) => m.phase === "pre-nav");
  const windowed = await sliceAroundArrival(page, arrived.t, 80, 800);
  const summary = summarize(windowed.gaps, windowed.longTasks, 880);
  return {
    kind: "second-visit",
    from: "/",
    to,
    clickToArriveMs: arrived.t - pre.t,
    ...summary,
    sampleGaps: windowed.gaps.filter((g) => g.gap >= 50).slice(0, 12),
    sampleLongTasks: windowed.longTasks.slice(0, 12),
  };
}

async function runCold(page, route) {
  const context = page.context();
  const cold = await context.newPage();
  await cold.addInitScript(() => {
    window.__bench = { longTasks: [], gaps: [], marks: [], muxCount: 0 };
    try {
      const obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.duration >= 40) {
            window.__bench.longTasks.push({
              d: Math.round(e.duration),
              s: Math.round(e.startTime),
              path: location.pathname,
            });
          }
        }
      });
      obs.observe({ type: "longtask", buffered: true });
    } catch (_) {}
    let last = performance.now();
    window.addEventListener(
      "pointermove",
      () => {
        const now = performance.now();
        const gap = now - last;
        last = now;
        if (gap >= 30) {
          window.__bench.gaps.push({
            gap: Math.round(gap),
            t: Math.round(now),
            path: location.pathname,
          });
        }
      },
      { passive: true },
    );
  });
  const t0 = Date.now();
  const mover = moveMouse(cold, 2000);
  await cold.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  await cold.waitForFunction(() => document.body && document.body.innerText.length > 40, null, { timeout: 15000 });
  await mover;
  await cold.waitForTimeout(300);
  const data = await cold.evaluate(() => ({
    gaps: (window.__bench && window.__bench.gaps) || [],
    longTasks: (window.__bench && window.__bench.longTasks) || [],
  }));
  const navMs = Date.now() - t0;
  await cold.close();
  return {
    route,
    coldNavMs: navMs,
    ...summarize(data.gaps, data.longTasks, navMs),
    sampleGaps: data.gaps.filter((g) => g.gap >= 50).slice(0, 12),
    sampleLongTasks: data.longTasks.slice(0, 12),
  };
}

function score(result) {
  // Lower is better. Weights emphasize cursor freezes users feel.
  let s = 0;
  for (const leg of result.warm || []) {
    s += leg.maxPointerGapMs * 2;
    s += leg.pointerGapsGe80 * 40;
    s += leg.pointerGapsGe50 * 10;
    s += leg.maxLongTaskMs;
    s += leg.longTaskTotalMs * 0.25;
    s += Math.max(0, leg.clickToArriveMs - 100) * 0.2;
  }
  for (const leg of result.coldSoft || []) {
    // First soft-nav from Work — what users report as "first visit lag".
    s += leg.maxPointerGapMs * 2.5;
    s += leg.pointerGapsGe80 * 50;
    s += leg.pointerGapsGe50 * 12;
    s += Math.max(0, leg.clickToArriveMs - 100) * 0.25;
  }
  for (const leg of result.secondVisit || []) {
    // Keep-alive should make these near-instant; weight heavily if not.
    s += leg.maxPointerGapMs * 3;
    s += leg.pointerGapsGe80 * 60;
    s += Math.max(0, leg.clickToArriveMs - 80) * 0.4;
  }
  for (const leg of result.cold || []) {
    s += leg.maxPointerGapMs;
    s += leg.pointerGapsGe80 * 25;
    s += leg.maxLongTaskMs * 0.5;
  }
  return Math.round(s);
}

function compare(before, after) {
  const bs = score(before);
  const as_ = score(after);
  const improved = as_ < bs * 0.85; // ≥15% better overall score
  const regressions = [];
  for (const b of before.warm || []) {
    const a = (after.warm || []).find((x) => x.from === b.from && x.to === b.to);
    if (!a) continue;
    // Allow small maxGap noise (±25ms); flag only when freezes also get more frequent
    // or long-tasks get worse.
    const gapWorse = a.maxPointerGapMs > b.maxPointerGapMs + 25;
    const moreFreezes = a.pointerGapsGe80 > b.pointerGapsGe80;
    const longerTasks = a.maxLongTaskMs > b.maxLongTaskMs + 20;
    if (gapWorse && (moreFreezes || longerTasks)) {
      regressions.push(
        `${b.from}→${b.to} maxGap ${b.maxPointerGapMs}→${a.maxPointerGapMs} g80 ${b.pointerGapsGe80}→${a.pointerGapsGe80}`,
      );
    }
  }
  return {
    beforeScore: bs,
    afterScore: as_,
    improvementPct: Math.round(((bs - as_) / Math.max(bs, 1)) * 100),
    improved,
    regressions,
  };
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-gpu-sandbox", "--use-gl=swiftshader"],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Warm work first so Mux is live for leave tests
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 90000 }).catch(() =>
    page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 }),
  );
  await page.waitForTimeout(4000);
  const muxBefore = await page.evaluate(() => document.querySelectorAll("mux-player").length);

  const warm = [];
  warm.push(await runWarmLeg(page, "/", "/about"));
  warm.push(await runWarmLeg(page, "/about", "/"));
  // Ensure mux remounted a bit
  await page.waitForTimeout(800);
  warm.push(await runWarmLeg(page, "/", "/archive"));
  warm.push(await runWarmLeg(page, "/archive", "/about"));
  warm.push(await runWarmLeg(page, "/about", "/archive"));

  // Second visits — shells should already be keep-alive from warm legs.
  const secondVisit = [];
  await softNav(page, "/");
  await page.waitForTimeout(500);
  secondVisit.push(await runSecondVisit(page, "/about"));
  await softNav(page, "/");
  await page.waitForTimeout(300);
  secondVisit.push(await runSecondVisit(page, "/archive"));

  // Cold soft-nav — fresh context, no hover prefetch (true first-visit feel).
  const coldSoft = [];
  coldSoft.push(await runColdSoftNav(context, "/about"));
  coldSoft.push(await runColdSoftNav(context, "/archive"));

  const cold = [];
  cold.push(await runCold(page, "/about"));
  cold.push(await runCold(page, "/archive"));
  cold.push(await runCold(page, "/"));

  const result = {
    at: new Date().toISOString(),
    base: BASE,
    muxPlayersOnWork: muxBefore,
    warm,
    secondVisit,
    coldSoft,
    cold,
    score: 0,
  };
  result.score = score(result);

  console.log(JSON.stringify(result, null, 2));
  if (outPath) {
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.error(`wrote ${outPath} score=${result.score}`);
  }

  if (comparePath) {
    const before = JSON.parse(fs.readFileSync(comparePath, "utf8"));
    const cmp = compare(before, result);
    console.error(JSON.stringify({ compare: cmp }, null, 2));
    if (!cmp.improved || cmp.regressions.length) {
      await browser.close();
      process.exit(1);
    }
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
