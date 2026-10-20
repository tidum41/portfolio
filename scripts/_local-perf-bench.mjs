/**
 * Local-only interaction + About LCP + nav-hover bench against next start.
 * BENCH_BASE=http://127.0.0.1:3000 node scripts/_local-perf-bench.mjs
 */
import { chromium } from "playwright";
import fs from "fs";

const BASE = (process.env.BENCH_BASE || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.OUT || "/opt/cursor/artifacts/local-perf-bench.json";
const LABEL = process.env.LABEL || "local";

function median(vals) {
  const s = [...vals].filter((x) => x != null && !Number.isNaN(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function aboutLcp(browser, runs = 3) {
  const results = [];
  for (let i = 0; i < runs; i++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__lcp = null;
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.entryType === "largest-contentful-paint") {
              window.__lcp = { t: e.startTime, url: e.url || "", size: e.size };
            }
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
      } catch {}
    });
    await page.goto(BASE + "/about", { waitUntil: "networkidle", timeout: 90000 });
    await page.evaluate(() => window.scrollBy(0, 1));
    await page.waitForTimeout(2500);
    const vitals = await page.evaluate(() => {
      const entries = performance.getEntriesByType("largest-contentful-paint");
      const last = entries[entries.length - 1];
      return {
        lcp: window.__lcp?.t ?? last?.startTime ?? null,
        url: window.__lcp?.url || last?.url || "",
        size: window.__lcp?.size || last?.size || 0,
        paint: Object.fromEntries(
          performance.getEntriesByType("paint").map((e) => [e.name, e.startTime]),
        ),
      };
    });
    results.push(vitals);
    await context.close();
  }
  return {
    runs: results,
    median: median(results.map((r) => r.lcp)),
    urls: results.map((r) => r.url?.slice(0, 80)),
  };
}

async function navHoverLag(browser, { idleMs, samples = 3 } = {}) {
  const values = [];
  for (let i = 0; i < samples; i++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(idleMs);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("intro-done"));
      document.documentElement.removeAttribute("data-intro");
    });
    await page.waitForTimeout(200);

    const ms = await page.evaluate(async () => {
      const links = [...document.querySelectorAll("nav.site-nav a.nav-link")];
      const el = links.find((a) => a.getAttribute("href") === "/archive");
      if (!el) throw new Error("archive nav missing");
      // Wait until morph SVG may exist (armed) or proceed cold
      const stamp = performance.now();
      el.dispatchEvent(
        new MouseEvent("mouseenter", { bubbles: true, cancelable: true, view: window }),
      );
      // Poll for first SVG path `d` mutation under the link
      return await new Promise((resolve) => {
        const start = performance.now();
        const svg = () => el.querySelector("svg path, svg");
        let lastD = el.querySelector("svg path")?.getAttribute("d") || "";
        const obs = new MutationObserver(() => {
          const path = el.querySelector("svg path");
          const d = path?.getAttribute("d") || "";
          if (d && d !== lastD) {
            obs.disconnect();
            resolve(performance.now() - start);
          }
        });
        obs.observe(el, { subtree: true, attributes: true, childList: true, attributeFilter: ["d"] });
        // Also poll — some morphs update via rAF without attr mutation batching
        const tick = () => {
          const path = el.querySelector("svg path");
          const d = path?.getAttribute("d") || "";
          if (d && d !== lastD && performance.now() - start > 0.05) {
            obs.disconnect();
            resolve(performance.now() - start);
            return;
          }
          if (performance.now() - start > 2000) {
            obs.disconnect();
            resolve(performance.now() - start);
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        // Kick: if Morph already mounted, force a style read
        void el.getBoundingClientRect();
        void stamp;
      });
    });
    values.push(ms);
    await context.close();
  }
  return { idleMs, values, median: median(values) };
}

async function clickNav(page, label, { hoverFirst = true } = {}) {
  if (hoverFirst) {
    await page.evaluate((lab) => {
      const href = ({ Work: "/", Archive: "/archive", About: "/about" })[lab];
      const el = [...document.querySelectorAll("nav.site-nav a.nav-link")].find(
        (a) => a.getAttribute("href") === href,
      );
      el?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true, view: window }));
    }, label);
    await page.waitForTimeout(280);
  }
  await page.evaluate((lab) => {
    window.__bench = window.__bench || {};
    window.__bench.clickMs = performance.now();
    window.__bench.shellMs = null;
    window.__bench.pathMs = null;
    const href = ({ Work: "/", Archive: "/archive", About: "/about" })[lab];
    const el = [...document.querySelectorAll("nav.site-nav a.nav-link")].find(
      (a) => a.getAttribute("href") === href,
    );
    if (!el) throw new Error("missing " + lab);
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, view: window, button: 0 }),
    );
  }, label);
}

async function waitShell(page, tab, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hit = await page.evaluate((t) => {
      const el = document.querySelector(`[data-primary-shell="${t}"]`);
      if (!el || getComputedStyle(el).display === "none") return false;
      if (window.__bench?.shellMs == null && window.__bench?.clickMs != null) {
        window.__bench.shellMs = performance.now() - window.__bench.clickMs;
      }
      return true;
    }, tab);
    if (hit) return true;
    await page.waitForTimeout(8);
  }
  return false;
}

async function waitPath(page, path, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hit = await page.evaluate((p) => {
      if (location.pathname !== p) return false;
      if (window.__bench?.pathMs == null && window.__bench?.clickMs != null) {
        window.__bench.pathMs = performance.now() - window.__bench.clickMs;
      }
      return true;
    }, path);
    if (hit) return true;
    await page.waitForTimeout(8);
  }
  return false;
}

async function interactionSuite(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 160));
  });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("intro-done"));
    document.documentElement.removeAttribute("data-intro");
  });
  await page.waitForTimeout(500);

  const hops = [];
  // Cold no-hover first Archive
  await clickNav(page, "Archive", { hoverFirst: false });
  await waitShell(page, "archive");
  await waitPath(page, "/archive");
  hops.push({
    kind: "cold-no-hover-archive",
    ...(await page.evaluate(() => ({
      shellMs: window.__bench.shellMs,
      pathMs: window.__bench.pathMs,
    }))),
  });
  await page.waitForTimeout(800);
  await clickNav(page, "Work");
  await waitPath(page, "/");
  await page.waitForTimeout(600);

  for (const [label, tab, path] of [
    ["Archive", "archive", "/archive"],
    ["About", "about", "/about"],
    ["Work", "work", "/"],
    ["About", "about", "/about"],
    ["Archive", "archive", "/archive"],
    ["Work", "work", "/"],
  ]) {
    await clickNav(page, label, { hoverFirst: true });
    await waitShell(page, tab);
    await waitPath(page, path);
    hops.push({
      kind: `hover-${label}-${path}`,
      ...(await page.evaluate(() => ({
        shellMs: window.__bench.shellMs,
        pathMs: window.__bench.pathMs,
      }))),
    });
    await page.waitForTimeout(500);
  }

  // Card first + warm
  if ((await page.evaluate(() => location.pathname)) !== "/") {
    await clickNav(page, "Work");
    await waitPath(page, "/");
  }
  await page.waitForTimeout(1500);
  const cards = [];
  const href = await page.evaluate(() => {
    const a =
      document.querySelector('a[href="/joola"]') ||
      document.querySelector('a[href="/ucla-sublease"]');
    a?.scrollIntoView({ block: "center" });
    return a?.getAttribute("href") || null;
  });
  if (href) {
    await page.evaluate((h) => {
      window.__bench.clickMs = performance.now();
      window.__bench.pathMs = null;
      document.querySelector(`a[href="${h}"]`)?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, view: window, button: 0 }),
      );
    }, href);
    await waitPath(page, href);
    cards.push({
      kind: "card-first",
      href,
      pathMs: await page.evaluate(() => window.__bench.pathMs),
    });
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      window.__bench.clickMs = performance.now();
      window.__bench.pathMs = null;
      const back = [...document.querySelectorAll("a")].find((a) =>
        /^back$/i.test((a.textContent || "").trim()),
      );
      if (back) {
        back.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true, view: window, button: 0 }),
        );
      } else {
        history.back();
      }
    });
    await waitPath(page, "/");
    await page.waitForTimeout(800);
    await page.evaluate((h) => {
      window.__bench.clickMs = performance.now();
      window.__bench.pathMs = null;
      document.querySelector(`a[href="${h}"]`)?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, view: window, button: 0 }),
      );
    }, href);
    await waitPath(page, href);
    cards.push({
      kind: "card-warm",
      href,
      pathMs: await page.evaluate(() => window.__bench.pathMs),
    });
  }

  const shellVals = hops.map((h) => h.shellMs).filter((x) => x != null);
  await context.close();
  return {
    hops,
    cards,
    shellMedian: median(shellVals),
    errors: errors.slice(0, 8),
  };
}

async function main() {
  fs.mkdirSync("/opt/cursor/artifacts", { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { label: LABEL, base: BASE, at: new Date().toISOString() };

  console.log("About LCP ×3…");
  report.aboutLcp = await aboutLcp(browser, 3);
  console.log("  median", report.aboutLcp.median, report.aboutLcp.urls);

  console.log("Nav hover cold (120ms idle)…");
  report.hoverCold = await navHoverLag(browser, { idleMs: 120, samples: 3 });
  console.log("  median", report.hoverCold.median, report.hoverCold.values);

  console.log("Nav hover warm (3500ms idle)…");
  report.hoverWarm = await navHoverLag(browser, { idleMs: 3500, samples: 3 });
  console.log("  median", report.hoverWarm.median, report.hoverWarm.values);

  console.log("Interaction suite…");
  report.interaction = await interactionSuite(browser);
  console.log(
    "  shellMedian",
    report.interaction.shellMedian,
    "cards",
    report.interaction.cards,
    "errors",
    report.interaction.errors.length,
  );

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log("Wrote", OUT);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
