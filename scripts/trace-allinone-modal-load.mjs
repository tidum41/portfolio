/**
 * Performance diagnosis for All in One modal open + hover during iframe load.
 * CPU 4x throttle. Writes Chrome DevTools trace + metrics JSON.
 *
 * Usage: BASE_URL=http://localhost:3000 LABEL=before node scripts/trace-allinone-modal-load.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";
const LABEL = process.env.LABEL || "run";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function skipIntro(page) {
  await page.evaluate(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-intro") === "playing") {
      html.setAttribute("data-intro", "done");
      window.dispatchEvent(new CustomEvent("intro-done"));
      html.removeAttribute("data-intro");
    } else {
      html.removeAttribute("data-intro");
    }
  });
  await page
    .waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), {
      timeout: 5000,
    })
    .catch(() => {});
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Performance.enable");

  // Long-task + INP observer installed before navigation
  await page.addInitScript(() => {
    window.__aioPerf = {
      longTasks: [],
      inpCandidates: [],
      marks: {},
    };
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__aioPerf.longTasks.push({
            start: e.startTime,
            duration: e.duration,
            name: e.name,
          });
        }
      }).observe({ type: "longtask", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.name === "event" || e.entryType === "event") {
            window.__aioPerf.inpCandidates.push({
              name: e.name,
              start: e.startTime,
              duration: e.duration,
              processingStart: e.processingStart,
              processingEnd: e.processingEnd,
              interactionId: e.interactionId,
              target: e.target?.tagName || null,
            });
          }
        }
      }).observe({ type: "event", buffered: true, durationThreshold: 16 });
    } catch {}
  });

  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  });
  await skipIntro(page);
  await page.waitForSelector('[data-grid-card="project-todolist"]', { timeout: 20000 });
  // Settle
  await page.waitForTimeout(800);

  // Start tracing just before open
  await cdp.send("Tracing.start", {
    categories: [
      "devtools.timeline",
      "disabled-by-default-devtools.timeline",
      "disabled-by-default-devtools.timeline.frame",
      "blink.user_timing",
      "loading",
      "v8.execute",
      "disabled-by-default-v8.cpu_profiler",
    ].join(","),
    options: "sampling-frequency=10000",
  });

  const traceChunks = [];
  cdp.on("Tracing.dataCollected", (params) => {
    if (params.value) traceChunks.push(...params.value);
  });
  const tracingComplete = new Promise((resolve) => {
    cdp.on("Tracing.tracingComplete", resolve);
  });

  await page.evaluate(() => {
    performance.mark("aio-open-click");
    window.__aioPerf.marks.openClick = performance.now();
  });

  const card = page.locator('[data-grid-card="project-todolist"]');
  await card.scrollIntoViewIfNeeded();
  await card.locator('[role="button"]').first().click();

  const dialog = page.locator(
    '[role="dialog"][aria-label="Designing a to-do list with AI organization"]',
  );
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  await page.evaluate(() => {
    window.__aioPerf.marks.dialogVisible = performance.now();
  });

  const closeBtn = page.locator(".popup-close-btn").first();
  const infoBtn = page.locator(".popup-info-btn").first();
  await closeBtn.waitFor({ state: "visible" });

  // Hover spam during load window (~2.5s) to stress INP / style
  const hoverStart = Date.now();
  while (Date.now() - hoverStart < 2500) {
    await closeBtn.hover({ force: true });
    await page.mouse.move(20, 20);
    await infoBtn.hover({ force: true });
    await page.mouse.move(40, 40);
    // Also dispatch pointerenter via evaluate for INP event timing
    await page.evaluate(() => {
      const btn = document.querySelector(".popup-close-btn");
      if (!btn) return;
      const t0 = performance.now();
      btn.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      btn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      btn.classList.add("__hover_probe");
      // Force style recalc similar to :hover
      void getComputedStyle(btn).color;
      btn.classList.remove("__hover_probe");
      const t1 = performance.now();
      window.__aioPerf.inpCandidates.push({
        name: "hover-probe-close",
        start: t0,
        duration: t1 - t0,
        processingStart: t0,
        processingEnd: t1,
      });
    });
    await page.waitForTimeout(40);
  }

  // Wait until iframe ready (new skel) or legacy skel hidden
  await page
    .waitForFunction(() => {
      const skel =
        document.querySelector(".aio-demo-skel") ||
        document.querySelector(".project-popup-iframe-skel");
      const iframe = document.querySelector('iframe[title="Allinone — AI to-do list"]');
      return (
        skel?.getAttribute("data-hidden") === "true" ||
        iframe?.getAttribute("data-ready") === "true"
      );
    }, { timeout: 15000 })
    .catch(() => {});

  await page.evaluate(() => {
    window.__aioPerf.marks.loadDone = performance.now();
  });

  // One more deliberate hover after load for comparison
  await closeBtn.hover({ force: true });
  await page.waitForTimeout(200);

  await cdp.send("Tracing.end");
  await tracingComplete;

  const perf = await page.evaluate(() => {
    const longTasks = window.__aioPerf.longTasks || [];
    const duringLoad = longTasks.filter((t) => {
      const open = window.__aioPerf.marks.openClick || 0;
      const done = window.__aioPerf.marks.loadDone || performance.now();
      return t.start >= open - 50 && t.start <= done + 50;
    });
    const durations = duringLoad.map((t) => t.duration);
    const longest = durations.length ? Math.max(...durations) : 0;
    // Total Blocking Time: sum of (duration - 50) for tasks > 50ms
    const tbt = duringLoad.reduce((sum, t) => sum + Math.max(0, t.duration - 50), 0);

    const hoverProbes = (window.__aioPerf.inpCandidates || []).filter(
      (e) => e.name === "hover-probe-close" || e.name === "pointerenter" || e.name === "mouseover",
    );
    const hoverDurations = hoverProbes.map((e) => e.duration).filter((d) => d != null);
    const maxHover = hoverDurations.length ? Math.max(...hoverDurations) : null;
    const p75Hover = (() => {
      if (!hoverDurations.length) return null;
      const s = [...hoverDurations].sort((a, b) => a - b);
      return s[Math.floor(s.length * 0.75)] ?? s[s.length - 1];
    })();

    // Layout thrash hints: count RecalculateStyle / Layout from performance entries if any
    const paint = performance.getEntriesByType("paint").map((e) => ({
      name: e.name,
      start: e.startTime,
    }));

    return {
      marks: window.__aioPerf.marks,
      longTaskCount: duringLoad.length,
      longestTaskMs: Math.round(longest * 10) / 10,
      totalBlockingTimeMs: Math.round(tbt * 10) / 10,
      longTasks: duringLoad
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 12)
        .map((t) => ({ start: Math.round(t.start), duration: Math.round(t.duration * 10) / 10 })),
      hoverProbeCount: hoverProbes.length,
      hoverInpP75Ms: p75Hover != null ? Math.round(p75Hover * 10) / 10 : null,
      hoverInpMaxMs: maxHover != null ? Math.round(maxHover * 10) / 10 : null,
      paint,
      hasBackdropFilter: !!document.querySelector(
        ".project-popup-backdrop--large, [style*='backdrop-filter'], [style*='blur(']",
      ),
      iframeSrcDeferred: (() => {
        const iframe = document.querySelector('iframe[title="Allinone — AI to-do list"]');
        return iframe ? { src: iframe.getAttribute("src"), loading: iframe.getAttribute("loading") } : null;
      })(),
      skelHidden: (
        document.querySelector(".aio-demo-skel") ||
        document.querySelector(".project-popup-iframe-skel")
      )?.getAttribute("data-hidden"),
      iframeReady: document
        .querySelector('iframe[title="Allinone — AI to-do list"]')
        ?.getAttribute("data-ready"),
      blurSibling: !!document.querySelector(".project-popup-backdrop-blur"),
      backdropHasFilter: (() => {
        const el = document.querySelector(".project-popup-backdrop--large");
        if (!el) return null;
        const s = getComputedStyle(el);
        return Boolean(s.backdropFilter && s.backdropFilter !== "none");
      })(),
    };
  });

  // Also parse trace for long tasks / layout / paint
  const layoutEvents = [];
  const updateLayerEvents = [];
  let frameCount = 0;
  for (const ev of traceChunks) {
    const name = ev.name;
    if (name === "Layout" || name === "UpdateLayoutTree" || name === "RecalculateStyles") {
      layoutEvents.push({ name, ts: ev.ts, dur: ev.dur });
    }
    if (name === "UpdateLayer" || name === "Paint" || name === "CompositeLayers") {
      updateLayerEvents.push({ name, ts: ev.ts, dur: ev.dur });
    }
    if (name === "DrawFrame" || name === "BeginFrame") frameCount++;
  }
  const topLayouts = layoutEvents
    .filter((e) => e.dur)
    .sort((a, b) => (b.dur || 0) - (a.dur || 0))
    .slice(0, 10)
    .map((e) => ({ name: e.name, durMs: Math.round((e.dur || 0) / 100) / 10 }));

  const report = {
    label: LABEL,
    cpuThrottle: 4,
    ...perf,
    traceEventCounts: {
      layoutish: layoutEvents.length,
      paintComposite: updateLayerEvents.length,
      frames: frameCount,
    },
    topLayoutEvents: topLayouts,
  };

  const metricsPath = join(OUT, `aio-modal-load-${LABEL}-metrics.json`);
  const tracePath = join(OUT, `aio-modal-load-${LABEL}-trace.json`);
  writeFileSync(metricsPath, JSON.stringify(report, null, 2));
  // Trace can be huge — write a slim version with just events array for DevTools
  writeFileSync(tracePath, JSON.stringify({ traceEvents: traceChunks }));
  console.log(JSON.stringify(report, null, 2));
  console.log("wrote", metricsPath);
  console.log("wrote", tracePath);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
