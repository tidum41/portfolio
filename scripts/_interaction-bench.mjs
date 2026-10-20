/**
 * Interaction latency + console/hydration bench for primary nav + project cards.
 * Measures click → visible shell / pathname change; records longtasks + rAF gaps
 * during transitions; Playwright trace optional via TRACE=1.
 *
 * Usage:
 *   BENCH_BASE=https://... BENCH_SHARE=...?_vercel_share=... \
 *   LABEL=before OUT=/opt/cursor/artifacts/interaction-before.json \
 *   node scripts/_interaction-bench.mjs
 */
import { chromium } from "playwright";
import fs from "fs";

const BASE = (process.env.BENCH_BASE || "http://127.0.0.1:3000").replace(/\/$/, "");
const SHARE = process.env.BENCH_SHARE || "";
const OUT = process.env.OUT || "/opt/cursor/artifacts/interaction-bench.json";
const LABEL = process.env.LABEL || "bench";
const TRACE = process.env.TRACE === "1";
const TRACE_DIR = process.env.TRACE_DIR || `/opt/cursor/artifacts/traces-${LABEL}`;

function median(vals) {
  if (!vals.length) return null;
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function authContext(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  if (SHARE) {
    // Prefer curl JWT injection — Playwright following _vercel_share can land
    // on vercel.com/login when the share handshake needs a hard cookie set.
    const host = new URL(BASE).host;
    try {
      const { execSync } = await import("child_process");
      const jar = `/tmp/vercel-jwt-${host.replace(/[^a-z0-9]/gi, "_")}.txt`;
      execSync(`curl -sI -c "${jar}" -L ${JSON.stringify(SHARE)}`, {
        stdio: ["ignore", "pipe", "pipe"],
      });
      const jarText = fs.readFileSync(jar, "utf8");
      const jwt = jarText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
        .map((l) => l.split(/\t+/))
        .find((cols) => cols[5] === "_vercel_jwt" || cols.includes("_vercel_jwt"));
      const token = jwt ? jwt[jwt.length - 1] : null;
      if (token) {
        await context.addCookies([
          {
            name: "_vercel_jwt",
            value: token,
            domain: host,
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
          },
        ]);
      }
    } catch {
      /* fall through to share navigation */
    }
    const page = await context.newPage();
    await page.goto(SHARE, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1200);
    const title = await page.title();
    if (/login/i.test(title) || /vercel\.com\/login/.test(page.url())) {
      await page.close();
      throw new Error("Vercel auth failed — share link landed on login (" + SHARE + ")");
    }
    await page.close();
  }
  return context;
}

async function installProbes(page) {
  await page.addInitScript(() => {
    window.__bench = {
      errors: [],
      hydration: [],
      longtasks: [],
      rafGaps: [],
      clickMs: null,
      shellMs: null,
      pathMs: null,
    };
    const origError = console.error.bind(console);
    console.error = (...args) => {
      const t = args.map(String).join(" ").slice(0, 240);
      window.__bench.errors.push(t);
      if (/hydrat|did not match|Text content does not match/i.test(t)) {
        window.__bench.hydration.push(t);
      }
      origError(...args);
    };
    window.addEventListener("error", (e) => {
      window.__bench.errors.push(String(e.message || e).slice(0, 240));
    });
    window.addEventListener("unhandledrejection", (e) => {
      window.__bench.errors.push(String(e.reason || e).slice(0, 240));
    });
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__bench.longtasks.push({
            start: e.startTime,
            dur: e.duration,
          });
        }
      }).observe({ type: "longtask", buffered: true });
    } catch {}
  });
  page.on("pageerror", (e) => {
    // also captured in-page
  });
  page.on("console", (m) => {
    if (m.type() === "error") {
      // in-page hook also records
    }
  });
}

async function markClickStart(page) {
  await page.evaluate(() => {
    window.__bench.clickMs = performance.now();
    window.__bench.shellMs = null;
    window.__bench.pathMs = null;
    window.__bench.rafGaps = [];
    window.__bench.longtasks = window.__bench.longtasks.filter(
      (t) => t.start > performance.now() - 1,
    );
    let last = performance.now();
    let frames = 0;
    const tick = (now) => {
      const gap = now - last;
      if (gap > 24) window.__bench.rafGaps.push(Math.round(gap));
      last = now;
      frames += 1;
      if (frames < 90) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function waitShell(page, tab, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hit = await page.evaluate((t) => {
      const el = document.querySelector(`[data-primary-shell="${t}"]`);
      if (!el) return false;
      const style = getComputedStyle(el);
      if (style.display === "none") return false;
      const now = performance.now();
      if (window.__bench.shellMs == null && window.__bench.clickMs != null) {
        window.__bench.shellMs = now - window.__bench.clickMs;
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
      if (window.__bench.pathMs == null && window.__bench.clickMs != null) {
        window.__bench.pathMs = performance.now() - window.__bench.clickMs;
      }
      return true;
    }, path);
    if (hit) return true;
    await page.waitForTimeout(8);
  }
  return false;
}

async function readTiming(page) {
  return page.evaluate(() => ({
    shellMs: window.__bench.shellMs,
    pathMs: window.__bench.pathMs,
    longtasks: window.__bench.longtasks.slice(-20),
    rafGaps: window.__bench.rafGaps.slice(-30),
    droppedFrames: window.__bench.rafGaps.filter((g) => g > 24).length,
    maxRafGap: window.__bench.rafGaps.length
      ? Math.max(...window.__bench.rafGaps)
      : 0,
    errors: window.__bench.errors.slice(-20),
    hydration: window.__bench.hydration.slice(-10),
  }));
}

const NAV_HREF = {
  Work: "/",
  Archive: "/archive",
  About: "/about",
};

function navElScript() {
  return `(lab) => {
    const href = ({ Work: "/", Archive: "/archive", About: "/about" })[lab];
    const links = [...document.querySelectorAll("nav.site-nav a.nav-link, nav a.nav-link, header a[href]")];
    let el = href ? links.find((a) => a.getAttribute("href") === href) : null;
    if (!el) {
      el = links.find((a) => (a.textContent || "").toLowerCase().includes(String(lab).toLowerCase()));
    }
    if (!el) {
      throw new Error(
        "nav link missing: " +
          lab +
          " path=" +
          location.pathname +
          " hrefs=" +
          links.map((a) => a.getAttribute("href")).join(","),
      );
    }
    return el;
  }`;
}

async function hoverNav(page, label) {
  await page.evaluate((lab) => {
    const href = ({ Work: "/", Archive: "/archive", About: "/about" })[lab];
    const links = [...document.querySelectorAll("nav.site-nav a.nav-link, nav a.nav-link, header a[href]")];
    let el = href ? links.find((a) => a.getAttribute("href") === href) : null;
    if (!el) {
      el = links.find((a) => (a.textContent || "").toLowerCase().includes(String(lab).toLowerCase()));
    }
    if (!el) throw new Error("nav link missing: " + lab);
    el.dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true, cancelable: true, view: window }),
    );
  }, label);
}

async function clickNav(page, label, { hoverFirst = true, hoverSettleMs = 280 } = {}) {
  if (hoverFirst) {
    await hoverNav(page, label);
    await page.waitForTimeout(hoverSettleMs);
  }
  // Stamp + dispatch in one evaluate so latency excludes Playwright click chrome.
  await page.evaluate((lab) => {
    window.__bench.clickMs = performance.now();
    window.__bench.shellMs = null;
    window.__bench.pathMs = null;
    window.__bench.rafGaps = [];
    let last = performance.now();
    let frames = 0;
    const tick = (now) => {
      const gap = now - last;
      if (gap > 24) window.__bench.rafGaps.push(Math.round(gap));
      last = now;
      frames += 1;
      if (frames < 90) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const href = ({ Work: "/", Archive: "/archive", About: "/about" })[lab];
    const links = [...document.querySelectorAll("nav.site-nav a.nav-link, nav a.nav-link, header a[href]")];
    let el = href ? links.find((a) => a.getAttribute("href") === href) : null;
    if (!el) {
      el = links.find((a) => (a.textContent || "").toLowerCase().includes(String(lab).toLowerCase()));
    }
    if (!el) {
      throw new Error(
        "nav link missing: " +
          lab +
          " path=" +
          location.pathname +
          " hrefs=" +
          links.map((a) => a.getAttribute("href")).join(","),
      );
    }
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, view: window, button: 0 }),
    );
  }, label);
}

async function settle(page, ms = 900) {
  await page.waitForTimeout(ms);
}

async function runNavSuite(page, { coldWaitMs }) {
  const hops = [];
  const sequence = [
    { label: "Archive", tab: "archive", path: "/archive" },
    { label: "About", tab: "about", path: "/about" },
    { label: "Work", tab: "work", path: "/" },
    { label: "About", tab: "about", path: "/about" },
    { label: "Archive", tab: "archive", path: "/archive" },
    { label: "Work", tab: "work", path: "/" },
  ];

  // Cold: first hop after controlled idle (or none).
  if (coldWaitMs > 0) await page.waitForTimeout(coldWaitMs);

  // True cold first click — no hover premount.
  {
    const step = sequence[0];
    await clickNav(page, step.label, { hoverFirst: false });
    await waitShell(page, step.tab);
    await waitPath(page, step.path);
    const t = await readTiming(page);
    hops.push({
      i: "cold-no-hover",
      to: step.path,
      cold: true,
      shellMs: t.shellMs,
      pathMs: t.pathMs,
      droppedFrames: t.droppedFrames,
      maxRafGap: t.maxRafGap,
      longtaskMax: t.longtasks.reduce((m, x) => Math.max(m, x.dur), 0),
    });
    await settle(page, 1200);
    // Return to Work for the hover-intent sequence.
    await clickNav(page, "Work", { hoverFirst: true, hoverSettleMs: 120 });
    await waitPath(page, "/");
    await settle(page, 700);
  }

  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    await clickNav(page, step.label, { hoverFirst: true });
    await waitShell(page, step.tab);
    await waitPath(page, step.path);
    const t = await readTiming(page);
    hops.push({
      i,
      to: step.path,
      cold: i === 0,
      hoverIntent: true,
      shellMs: t.shellMs,
      pathMs: t.pathMs,
      droppedFrames: t.droppedFrames,
      maxRafGap: t.maxRafGap,
      longtaskMax: t.longtasks.reduce((m, x) => Math.max(m, x.dur), 0),
    });
    await settle(page, i === 0 ? 1200 : 700);
  }

  // Mid-transition: hammer About while Work→About is in flight from Archive.
  await clickNav(page, "Archive");
  await waitPath(page, "/archive");
  await settle(page, 400);
  // Stamp once, then hammer — measures first response under rapid re-entry.
  await page.evaluate(() => {
    window.__bench.clickMs = performance.now();
    window.__bench.shellMs = null;
    window.__bench.pathMs = null;
    window.__bench.rafGaps = [];
  });
  await page.evaluate(() => {
    const links = [...document.querySelectorAll("nav.site-nav a.nav-link")];
    const el = links.find((a) => (a.textContent || "").toLowerCase().includes("about"));
    if (!el) throw new Error("about missing");
    for (let i = 0; i < 3; i++) {
      el.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, view: window, button: 0 }),
      );
    }
  });
  await waitShell(page, "about");
  await waitPath(page, "/about");
  const mid = await readTiming(page);
  hops.push({
    i: "mid-rapid-about",
    to: "/about",
    shellMs: mid.shellMs,
    pathMs: mid.pathMs,
    droppedFrames: mid.droppedFrames,
    maxRafGap: mid.maxRafGap,
    longtaskMax: mid.longtasks.reduce((m, x) => Math.max(m, x.dur), 0),
  });
  await settle(page, 800);

  // Back / forward
  await markClickStart(page);
  await page.goBack();
  await page.waitForTimeout(50);
  const bfBackPath = await page.evaluate(() => location.pathname);
  const bfBack = await readTiming(page);
  hops.push({
    i: "bf-back",
    to: bfBackPath,
    pathMs: bfBack.pathMs,
    droppedFrames: bfBack.droppedFrames,
    maxRafGap: bfBack.maxRafGap,
  });
  await settle(page, 600);
  await markClickStart(page);
  await page.goForward();
  await page.waitForTimeout(50);
  const bfFwdPath = await page.evaluate(() => location.pathname);
  const bfFwd = await readTiming(page);
  hops.push({
    i: "bf-forward",
    to: bfFwdPath,
    pathMs: bfFwd.pathMs,
    droppedFrames: bfFwd.droppedFrames,
    maxRafGap: bfFwd.maxRafGap,
  });

  return hops;
}

async function clickCard(page, href) {
  await page.evaluate((h) => {
    window.__bench.clickMs = performance.now();
    window.__bench.shellMs = null;
    window.__bench.pathMs = null;
    window.__bench.rafGaps = [];
    let last = performance.now();
    let frames = 0;
    const tick = (now) => {
      const gap = now - last;
      if (gap > 24) window.__bench.rafGaps.push(Math.round(gap));
      last = now;
      frames += 1;
      if (frames < 90) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const a = document.querySelector(`a[href="${h}"]`);
    if (!a) throw new Error("card missing " + h);
    a.scrollIntoView({ block: "center", inline: "nearest" });
    a.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
      }),
    );
  }, href);
}

async function runCardSuite(page, { idleBeforeFirstMs }) {
  // Ensure on Work
  if ((await page.evaluate(() => location.pathname)) !== "/") {
    await clickNav(page, "Work");
    await waitPath(page, "/");
    await settle(page, 1000);
  }
  // Release intro-hide / wait for grid cards to paint
  await page.evaluate(() => {
    window.dispatchEvent(new Event("intro-done"));
    document.documentElement.removeAttribute("data-intro");
    document.querySelectorAll(".intro-hide").forEach((el) => {
      el.classList.add("intro-hide--done");
    });
  });
  if (idleBeforeFirstMs > 0) await page.waitForTimeout(idleBeforeFirstMs);

  const href = await page.evaluate(() => {
    const a =
      document.querySelector('a[href="/joola"]') ||
      document.querySelector('a[href="/ucla-sublease"]');
    return a?.getAttribute("href") || null;
  });
  if (!href) throw new Error("no case-study card found on Work");
  const results = [];

  await clickCard(page, href);
  await waitPath(page, href);
  const first = await readTiming(page);
  results.push({
    kind: "card-first",
    href,
    pathMs: first.pathMs,
    droppedFrames: first.droppedFrames,
    maxRafGap: first.maxRafGap,
    longtaskMax: first.longtasks.reduce((m, x) => Math.max(m, x.dur), 0),
  });
  await settle(page, 1500);

  // Back to work
  const back = page.locator("a.cs-back-mobile, a.cs-back, a[href='/']").filter({ hasText: /back/i }).first();
  const backAlt = page.locator("a").filter({ hasText: /^Back$/i }).first();
  await markClickStart(page);
  if (await back.count()) await back.click({ force: true });
  else if (await backAlt.count()) await backAlt.click({ force: true });
  else await page.goBack();
  await waitPath(page, "/");
  await settle(page, 1000);

  // Warm re-click
  await clickCard(page, href);
  await waitPath(page, href);
  const warm = await readTiming(page);
  results.push({
    kind: "card-warm",
    href,
    pathMs: warm.pathMs,
    droppedFrames: warm.droppedFrames,
    maxRafGap: warm.maxRafGap,
    longtaskMax: warm.longtasks.reduce((m, x) => Math.max(m, x.dur), 0),
  });
  await settle(page, 800);

  // Mid-transition rapid card clicks
  await markClickStart(page);
  if (await back.count()) await back.click({ force: true });
  else await page.goBack();
  await waitPath(page, "/");
  await settle(page, 600);
  await clickCard(page, href);
  await clickCard(page, href);
  await clickCard(page, href);
  await waitPath(page, href);
  const rapid = await readTiming(page);
  results.push({
    kind: "card-rapid",
    href,
    pathMs: rapid.pathMs,
    droppedFrames: rapid.droppedFrames,
    maxRafGap: rapid.maxRafGap,
  });

  return results;
}

async function main() {
  fs.mkdirSync("/opt/cursor/artifacts", { recursive: true });
  if (TRACE) fs.mkdirSync(TRACE_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const report = {
    label: LABEL,
    base: BASE,
    share: SHARE ? "set" : "",
    startedAt: new Date().toISOString(),
    runs: [],
  };

  // Run A: cold-ish (short idle so shells may not premount yet)
  // Run B: warm idle (4s — premount / prefetch should have fired)
  for (const [name, coldWait, cardIdle] of [
    ["cold-1200ms", 1200, 1200],
    ["warm-4000ms", 4000, 4000],
  ]) {
    const context = await authContext(browser);
    const page = await context.newPage();
    await installProbes(page);
    if (TRACE) {
      await context.tracing.start({ screenshots: true, snapshots: true });
    }

    await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
    // Wait past intro
    await page.waitForTimeout(3500);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("intro-done"));
      document.documentElement.removeAttribute("data-intro");
    });
    await page.waitForTimeout(400);

    const nav = await runNavSuite(page, { coldWaitMs: coldWait });
    // Return home for cards
    if ((await page.evaluate(() => location.pathname)) !== "/") {
      await clickNav(page, "Work");
      await waitPath(page, "/");
      await settle(page, 800);
    }
    const cards = await runCardSuite(page, { idleBeforeFirstMs: cardIdle });
    const consoleState = await page.evaluate(() => ({
      errors: window.__bench.errors,
      hydration: window.__bench.hydration,
    }));

    if (TRACE) {
      await context.tracing.stop({
        path: `${TRACE_DIR}/${name}.zip`,
      });
    }

    report.runs.push({
      name,
      nav,
      cards,
      console: consoleState,
      navShellMedian: median(nav.map((h) => h.shellMs).filter((x) => x != null)),
      navPathMedian: median(nav.map((h) => h.pathMs).filter((x) => x != null)),
      cardFirstPath: cards.find((c) => c.kind === "card-first")?.pathMs ?? null,
      cardWarmPath: cards.find((c) => c.kind === "card-warm")?.pathMs ?? null,
    });

    await context.close();
  }

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    label: LABEL,
    out: OUT,
    summary: report.runs.map((r) => ({
      name: r.name,
      navShellMedian: r.navShellMedian,
      navPathMedian: r.navPathMedian,
      cardFirstPath: r.cardFirstPath,
      cardWarmPath: r.cardWarmPath,
      errors: r.console.errors.length,
      hydration: r.console.hydration.length,
    })),
  }, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
