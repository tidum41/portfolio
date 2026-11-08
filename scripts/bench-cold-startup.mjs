#!/usr/bin/env node
/**
 * Benchmark Cold Startup Performance Harness
 *
 * Measures cold startup metrics on production build:
 * - First 3s long tasks count, total duration, max duration
 * - TBT (Total Blocking Time in first 3s)
 * - Silk WebGL FPS (frames drawn in first 3s and active FPS)
 * - LCP (Largest Contentful Paint)
 * - CLS (Cumulative Layout Shift in first 3s)
 * - FCP (First Contentful Paint)
 *
 * Matrix:
 * 1. Desktop (1440x900) @ 1x normal CPU
 * 2. Desktop (1440x900) @ 4x CPU throttle
 * 3. Mobile (390x844, isMobile, touch) @ 1x normal CPU
 * 4. Mobile (390x844, isMobile, touch) @ 4x CPU throttle
 *
 * Usage:
 *   node scripts/bench-cold-startup.mjs [--url http://localhost:3000] [--runs 3] [--out baseline.json] [--json]
 */
import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const args = process.argv.slice(2);

function getArg(name, defaultValue) {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  if (match) return match.split("=")[1];
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && idx + 1 < args.length && !args[idx + 1].startsWith("--")) {
    return args[idx + 1];
  }
  return defaultValue;
}

const targetUrl = getArg("url", `http://localhost:${getArg("port", "3000")}`);
const runsCount = parseInt(getArg("runs", "3"), 10);
const outPath = getArg("out", null);
const jsonOnly = args.includes("--json");

const PROFILES = [
  {
    id: "desktop-1x",
    name: "Desktop 1440x900 @ 1x CPU",
    viewport: { width: 1440, height: 900 },
    isMobile: false,
    hasTouch: false,
    cpuThrottle: 1,
    userAgent: undefined,
  },
  {
    id: "desktop-4x",
    name: "Desktop 1440x900 @ 4x CPU Throttle",
    viewport: { width: 1440, height: 900 },
    isMobile: false,
    hasTouch: false,
    cpuThrottle: 4,
    userAgent: undefined,
  },
  {
    id: "mobile-1x",
    name: "Mobile 390x844 @ 1x CPU",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    cpuThrottle: 1,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  {
    id: "mobile-4x",
    name: "Mobile 390x844 @ 4x CPU Throttle",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    cpuThrottle: 4,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
];

const INIT_SCRIPT = `
(function() {
  window.__benchData = {
    silkFrames: [],
    longTasks: [],
    layoutShifts: [],
    lcp: 0,
    fcp: 0,
    domLoaded: 0,
    loadEvent: 0
  };

  // 1. Hook WebGL drawArrays for silk frame tracking
  function hookGL(proto) {
    if (!proto || !proto.drawArrays) return;
    const origDrawArrays = proto.drawArrays;
    proto.drawArrays = function(...args) {
      window.__benchData.silkFrames.push(performance.now());
      return origDrawArrays.apply(this, args);
    };
  }
  if (typeof WebGLRenderingContext !== "undefined") hookGL(WebGLRenderingContext.prototype);
  if (typeof WebGL2RenderingContext !== "undefined") hookGL(WebGL2RenderingContext.prototype);

  // 2. Long Tasks Observer
  try {
    const ltObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.startTime < 3000) {
          window.__benchData.longTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
            name: entry.name
          });
        }
      }
    });
    ltObs.observe({ type: "longtask", buffered: true });
  } catch (e) {}

  // 3. LCP Observer
  try {
    const lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length) {
        window.__benchData.lcp = entries[entries.length - 1].startTime;
      }
    });
    lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {}

  // 4. CLS Observer
  try {
    const clsObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput && entry.startTime < 3000) {
          window.__benchData.layoutShifts.push({
            startTime: entry.startTime,
            value: entry.value
          });
        }
      }
    });
    clsObs.observe({ type: "layout-shift", buffered: true });
  } catch (e) {}

  // 5. Paint Observer (FCP)
  try {
    const paintObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          window.__benchData.fcp = entry.startTime;
        }
      }
    });
    paintObs.observe({ type: "paint", buffered: true });
  } catch (e) {}

  window.addEventListener("DOMContentLoaded", () => {
    window.__benchData.domLoaded = performance.now();
  });
  window.addEventListener("load", () => {
    window.__benchData.loadEvent = performance.now();
  });
})();
`;

function computeMedian(numbers) {
  if (!numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeMean(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function round(num, decimals = 1) {
  const f = Math.pow(10, decimals);
  return Math.round(num * f) / f;
}

async function measureRun(browser, profile) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    userAgent: profile.userAgent,
  });

  await context.addInitScript(INIT_SCRIPT);
  const page = await context.newPage();

  if (profile.cpuThrottle > 1) {
    const client = await context.newCDPSession(page);
    await client.send("Emulation.setCPUThrottlingRate", { rate: profile.cpuThrottle });
  }

  // Navigate to target URL
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait for 3.5s of performance.now() elapsed time
  await page.waitForFunction(() => performance.now() >= 3500, { timeout: 20000 });

  // Fetch benchmark data
  const rawData = await page.evaluate(() => {
    return {
      ...window.__benchData,
      now: performance.now(),
    };
  });

  await context.close();

  // Process Long Tasks in first 3s
  const longTasks3s = (rawData.longTasks || []).filter((t) => t.startTime < 3000);
  const longTaskCount = longTasks3s.length;
  const longTaskTotalMs = longTasks3s.reduce((sum, t) => sum + t.duration, 0);
  const maxLongTaskMs = longTasks3s.reduce((max, t) => Math.max(max, t.duration), 0);

  // TBT: sum of (duration - 50) for long tasks with startTime < 3000
  const tbtMs = longTasks3s.reduce((sum, t) => sum + Math.max(0, t.duration - 50), 0);

  // Silk FPS
  const silkFrames3s = (rawData.silkFrames || []).filter((t) => t <= 3000);
  const silkFrameCount = silkFrames3s.length;
  let silkFps = 0;
  if (silkFrames3s.length >= 2) {
    const activeDurationSec = (silkFrames3s[silkFrames3s.length - 1] - silkFrames3s[0]) / 1000;
    if (activeDurationSec > 0) {
      silkFps = (silkFrames3s.length - 1) / activeDurationSec;
    }
  }

  // CLS
  const clsTotal = (rawData.layoutShifts || []).reduce((sum, s) => sum + s.value, 0);

  return {
    longTaskCount,
    longTaskTotalMs: round(longTaskTotalMs, 1),
    maxLongTaskMs: round(maxLongTaskMs, 1),
    tbtMs: round(tbtMs, 1),
    silkFrameCount,
    silkFps: round(silkFps, 1),
    lcpMs: round(rawData.lcp, 1),
    cls: round(clsTotal, 4),
    fcpMs: round(rawData.fcp, 1),
    domLoadedMs: round(rawData.domLoaded, 1),
  };
}

async function runBenchmark() {
  if (!jsonOnly) {
    console.log("===============================================================================");
    console.log(`Cold Startup Benchmark Harness: ${targetUrl}`);
    console.log(`Iterations per profile: ${runsCount}`);
    console.log("===============================================================================\n");
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const profileResults = [];

  for (const profile of PROFILES) {
    if (!jsonOnly) {
      console.log(`Benchmarking Profile: [${profile.name}]`);
    }

    const runs = [];
    for (let i = 0; i < runsCount; i++) {
      try {
        const result = await measureRun(browser, profile);
        runs.push(result);
        if (!jsonOnly) {
          console.log(
            `  Run ${i + 1}/${runsCount}: LongTasks=${result.longTaskCount} (Tot=${result.longTaskTotalMs}ms, Max=${result.maxLongTaskMs}ms), TBT=${result.tbtMs}ms, SilkFPS=${result.silkFps} (${result.silkFrameCount} frames), LCP=${result.lcpMs}ms, CLS=${result.cls}`
          );
        }
      } catch (err) {
        if (!jsonOnly) {
          console.error(`  Run ${i + 1}/${runsCount} failed: ${err.message}`);
        }
      }
    }

    const aggregated = {
      profileId: profile.id,
      profileName: profile.name,
      viewport: `${profile.viewport.width}x${profile.viewport.height}`,
      cpuThrottle: `${profile.cpuThrottle}x`,
      runsCount: runs.length,
      metrics: {
        longTasksCount: round(computeMedian(runs.map((r) => r.longTaskCount)), 0),
        longTasksTotalMs: round(computeMedian(runs.map((r) => r.longTaskTotalMs)), 1),
        maxLongTaskMs: round(computeMedian(runs.map((r) => r.maxLongTaskMs)), 1),
        tbtMs: round(computeMedian(runs.map((r) => r.tbtMs)), 1),
        silkFrameCount: round(computeMedian(runs.map((r) => r.silkFrameCount)), 0),
        silkFps: round(computeMedian(runs.map((r) => r.silkFps)), 1),
        lcpMs: round(computeMedian(runs.map((r) => r.lcpMs)), 1),
        cls: round(computeMedian(runs.map((r) => r.cls)), 4),
        fcpMs: round(computeMedian(runs.map((r) => r.fcpMs)), 1),
      },
      runs,
    };

    profileResults.push(aggregated);
  }

  await browser.close();

  const report = {
    timestamp: new Date().toISOString(),
    targetUrl,
    runsPerProfile: runsCount,
    profiles: profileResults,
  };

  if (outPath) {
    const fullOutPath = path.resolve(process.cwd(), outPath);
    fs.mkdirSync(path.dirname(fullOutPath), { recursive: true });
    fs.writeFileSync(fullOutPath, JSON.stringify(report, null, 2), "utf8");
    if (!jsonOnly) {
      console.log(`\nResults written to: ${fullOutPath}`);
    }
  }

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("\n===============================================================================");
    console.log("SUMMARY METRICS TABLE (MEDIAN ACROSS RUNS)");
    console.log("===============================================================================");
    console.log(
      "Profile".padEnd(35) +
        "LongTasks (1st 3s)".padEnd(20) +
        "TBT".padEnd(10) +
        "Silk FPS".padEnd(12) +
        "LCP".padEnd(10) +
        "CLS"
    );
    console.log("-".repeat(95));
    for (const p of profileResults) {
      const m = p.metrics;
      const ltStr = `${m.longTasksCount} (${m.longTasksTotalMs}ms)`;
      console.log(
        p.profileName.padEnd(35) +
          ltStr.padEnd(20) +
          `${m.tbtMs}ms`.padEnd(10) +
          `${m.silkFps} fps`.padEnd(12) +
          `${m.lcpMs}ms`.padEnd(10) +
          `${m.cls}`
      );
    }
    console.log("===============================================================================\n");
  }

  return report;
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
