/**
 * Before/after verification for perf-fixes-1020 (local prod build).
 */
import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.BENCH_BASE || "http://127.0.0.1:3000";
const OUT = process.env.PERF_OUT || "/tmp/perf-verify-after.json";
const LABEL = process.env.PERF_LABEL || "after";

async function measureRoute(browser, route, { persistStorage } = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (persistStorage) {
    await context.addInitScript(() => {
      localStorage.setItem("site-ambient-muted", "false");
      localStorage.setItem("site-audio-volume", "0.7");
    });
  }
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 180)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 180));
  });

  const jsUrls = new Set();
  page.on("response", (res) => {
    const u = res.url();
    if (u.includes(".js") || u.includes("hls-light")) jsUrls.add(u.split("?")[0]);
  });

  await page.addInitScript(() => {
    window.__lcp = null;
    window.__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.entryType === "largest-contentful-paint") window.__lcp = e.startTime;
          if (e.entryType === "layout-shift" && !e.hadRecentInput) window.__cls += e.value;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) window.__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
  });
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 90000 }).catch(async () => {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
  });
  // Nudge paint so LCP can finalize in headless.
  await page.evaluate(() => window.scrollBy(0, 1));
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollBy(0, -1));
  await page.waitForTimeout(500);

  const vitals = await page.evaluate(() => {
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const lcp = window.__lcp ?? (lcpEntries.length ? lcpEntries[lcpEntries.length - 1].startTime : null);
    const paint = Object.fromEntries(
      performance.getEntriesByType("paint").map((e) => [e.name, e.startTime]),
    );
    let cls = window.__cls || 0;
    for (const e of performance.getEntriesByType("layout-shift")) {
      if (!e.hadRecentInput) cls += e.value;
    }
    const scripts = performance.getEntriesByType("resource")
      .filter((r) => r.initiatorType === "script" || r.name.includes(".js") || r.name.includes("hls-light"))
      .map((r) => ({
        name: r.name.replace(/^https?:\/\/[^/]+/, "").slice(0, 100),
        transfer: r.transferSize || 0,
        encoded: r.encodedBodySize || 0,
      }));
    const fonts = performance.getEntriesByType("resource")
      .filter((r) => /\.(woff2?|ttf|otf)(\?|$)/i.test(r.name) || /font/i.test(r.name))
      .map((r) => ({
        name: r.name.replace(/^https?:\/\/[^/]+/, "").slice(0, 120),
        transfer: r.transferSize || 0,
      }));
    const totalJs = scripts.reduce((s, x) => s + (x.transfer || x.encoded), 0);
    const hls = scripts.filter((s) => s.name.includes("hls-light"));
    const geistFontNet = fonts.some((f) => /geist/i.test(f.name));
    const geist = Array.from(document.fonts || []).some((f) => /geist/i.test(f.family));
    const areal = Array.from(document.fonts || []).some((f) => /areal/i.test(f.family));
    const audio = performance.getEntriesByType("resource")
      .filter((r) => /ps3-xmb-menu|audio\//i.test(r.name))
      .map((r) => ({
        name: r.name.replace(/^https?:\/\/[^/]+/, "").slice(0, 80),
        transfer: r.transferSize || 0,
        encoded: r.encodedBodySize || 0,
      }));
    return {
      lcp,
      fcp: paint["first-contentful-paint"] ?? null,
      cls,
      totalJs,
      scriptCount: scripts.length,
      hlsBytes: hls.reduce((s, x) => s + (x.transfer || x.encoded), 0),
      hlsLoaded: hls.length > 0,
      geistInDocumentFonts: geist,
      geistFontNetwork: geistFontNet,
      arealInDocumentFonts: areal,
      audioResources: audio,
      topScripts: scripts.sort((a, b) => (b.transfer || b.encoded) - (a.transfer || a.encoded)).slice(0, 6),
    };
  });

  await context.close();
  return { route, ...vitals, pageerrors: errors, jsUrlCount: jsUrls.size };
}

async function measureNav(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-intro", "done");
  });

  // Keep the tab "visible" so rAF isn't throttled in headless.
  const client = await context.newCDPSession(page);
  await client.send("Emulation.setFocusEmulationEnabled", { enabled: true });

  const hop = async (toHref) => {
    // Soft-nav keeps the document; rAF survives. Arm counters then click.
    await page.evaluate(() => {
      if (window.__navPerf?.raf) cancelAnimationFrame(window.__navPerf.raf);
      window.__navPerf = { frames: 0, drops: 0, last: performance.now(), t0: 0, done: false };
      const tick = (t) => {
        const s = window.__navPerf;
        if (!s || s.done) return;
        const dt = t - s.last;
        s.last = t;
        s.frames++;
        if (dt > 22) s.drops++;
        s.raf = requestAnimationFrame(tick);
      };
      window.__navPerf.raf = requestAnimationFrame(tick);
    });
    // Let the sampler spin a few frames before click.
    await page.waitForTimeout(50);
    const t0 = Date.now();
    await page.evaluate((toHref) => {
      window.__navPerf.t0 = performance.now();
      const link = [...document.querySelectorAll("a.nav-link")].find((a) => {
        const t = (a.getAttribute("href") || "").replace(/\/$/, "") || "/";
        const target = toHref.replace(/\/$/, "") || "/";
        return t === target;
      });
      if (!link) throw new Error("missing " + toHref);
      link.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", button: 0, clientX: 2, clientY: 2 }));
      link.click();
    }, toHref);
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      const path = new URL(page.url()).pathname;
      if (path === toHref || (toHref === "/" && path === "/")) break;
      await page.waitForTimeout(16);
    }
    // Sample frames for a bit after paint
    await page.waitForTimeout(500);
    const stats = await page.evaluate(() => {
      const s = window.__navPerf || { frames: 0, drops: 0, t0: 0 };
      s.done = true;
      if (s.raf) cancelAnimationFrame(s.raf);
      const elapsed = Math.max(1, performance.now() - (s.t0 || 0));
      return {
        frames: s.frames,
        dropsOver22ms: s.drops,
        clickToPaintMs: Math.round(elapsed),
        fps: s.frames > 1 ? Math.round((s.frames / elapsed) * 1000) : 0,
        path: location.pathname,
      };
    });
    return { toHref, wallMs: Date.now() - t0, ...stats };
  };

  const navs = [];
  navs.push(await hop("/about"));
  navs.push(await hop("/archive"));
  navs.push(await hop("/"));
  await context.close();
  return navs;
}

async function endIntro(page) {
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-intro", "done");
    document.documentElement.removeAttribute("data-intro");
  });
}

async function stressMorph(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1200);
  await endIntro(page);

  const result = await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const links = [...document.querySelectorAll("a.nav-link")].filter((a) =>
      ["/", "/about", "/archive"].includes(a.getAttribute("href") || ""),
    );
    const about = links.find((a) => a.getAttribute("href") === "/about");
    const work = links.find((a) => a.getAttribute("href") === "/");
    const archive = links.find((a) => a.getAttribute("href") === "/archive");
    const issues = [];
    if (!about || !work || !archive) return { error: "links missing" };

    // Rapid hover
    for (let i = 0; i < 10; i++) {
      about.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await sleep(25);
      about.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      await sleep(15);
    }

    // Click during morph — only fire events; outer runner waits for path.
    about.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await sleep(60);
    about.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", button: 0, clientX: 3, clientY: 3 }));
    about.click();
    return { phase: "clicked-about", issues };
  });
  await page.waitForTimeout(700);
  if (!result || result.error) {
    await context.close();
    return result || { error: "stress failed" };
  }
  result.issues = result.issues || [];
  const afterAbout = await page.evaluate(() => ({
    activeCount: document.querySelectorAll("a.nav-link[aria-current='page']").length,
    path: location.pathname,
  }));
  if (afterAbout.activeCount !== 1) result.issues.push("aria-current count after about click");

  // Focus handlers (no pointer — avoids intro/cursor overlay intercepts)
  await page.evaluate(() => {
    document.querySelector('a.nav-link[href="/about"]')?.focus();
  });
  await page.waitForTimeout(80);
  await page.evaluate(() => {
    document.querySelector('a.nav-link[href="/archive"]')?.focus();
  });
  await page.waitForTimeout(80);

  // Rapid nav via programmatic click (soft-nav)
  for (const href of ["/", "/about", "/archive", "/"]) {
    await page.evaluate((href) => {
      const link = document.querySelector(`a.nav-link[href="${href}"]`);
      if (!link) throw new Error("missing " + href);
      link.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", button: 0, clientX: 4, clientY: 4 }));
      link.click();
    }, href);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);
  await page.goBack();
  await page.waitForTimeout(300);
  await page.goForward();
  await page.waitForTimeout(300);

  const tail = await page.evaluate(() => ({
    activeCount: document.querySelectorAll("a.nav-link[aria-current='page']").length,
    path: location.pathname,
    morphSvgs: document.querySelectorAll("a.nav-link svg").length,
  }));
  Object.assign(result, afterAbout, tail);

  // Keyboard Tab focus-visible check via real key events
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  // Skip to content + nav — Tab until a nav-link is focused
  let focusedNav = null;
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press("Tab");
    focusedNav = await page.evaluate(() => {
      const el = document.activeElement?.closest?.("a.nav-link");
      if (!el) return null;
      return {
        href: el.getAttribute("href"),
        focusVisible: el.matches(":focus-visible"),
      };
    });
    if (focusedNav) break;
  }

  await context.close();
  return { ...result, focusedNav };
}

async function hydrationCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem("site-ambient-muted", "false");
    localStorage.setItem("site-audio-volume", "0.85");
    localStorage.setItem("theme", "light");
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 240)}`);
  });
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const hydration = errors.filter((e) => /418|hydrat|did not match|server rendered/i.test(e));
  await context.close();
  return { hydrationErrors: hydration, allPageErrors: errors.slice(0, 8) };
}

const browser = await chromium.launch({
  headless: true,
  args: [
    "--disable-dev-shm-usage",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
  ],
});
const report = {
  label: LABEL,
  base: BASE,
  routes: {},
  navs: [],
  morph: null,
  hydration: null,
};

for (const route of ["/", "/about", "/archive"]) {
  report.routes[route] = await measureRoute(browser, route);
}
report.navs = await measureNav(browser);
report.morph = await stressMorph(browser);
report.hydration = await hydrationCheck(browser);

await browser.close();
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
