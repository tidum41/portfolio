import { webkit, devices } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const iphone = devices["iPhone 13"];

const sample = (page) => page.evaluate(() => {
  const card = document.querySelector('[data-grid-card="project-joola-b2b"]');
  const slot = card?.querySelector(".mux-media-slot");
  const video = card?.querySelector("video");
  const cs = video ? getComputedStyle(video) : null;
  const opacity = cs ? Number(cs.opacity) : null;
  return {
    dataHls: slot?.getAttribute("data-hls") ?? null,
    dataFrame: slot?.getAttribute("data-frame") ?? null,
    paused: video?.paused ?? null,
    controls: video?.controls ?? null,
    webkitPlaysinline: video?.hasAttribute("webkit-playsinline") ?? false,
    currentTime: video?.currentTime ?? null,
    opacity,
    visiblePaused: !!(video && video.paused && opacity != null && opacity > 0.05),
    playingOk: !!(video && !video.paused && opacity != null && opacity > 0.5),
    safeHidden: opacity == null || opacity < 0.05,
    blockProbe: window.__playBlockCount ?? null,
    allowProbe: window.__playAllow ?? null,
  };
});

const browser = await webkit.launch({ headless: true });
let failed = false;
const log = (label, ok, extra) => {
  if (!ok) failed = true;
  console.log(ok ? "OK" : "FAIL", label, JSON.stringify(extra));
};

try {
  // Cold cache runs
  for (let i = 0; i < 4; i++) {
    const context = await browser.newContext({ ...iphone });
    const page = await context.newPage();
    await page.goto(`${BASE}/?cold=${i}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector('[data-grid-card="project-joola-b2b"] video', { timeout: 30000 });
    await page.waitForTimeout(3500);
    const s = await sample(page);
    log(`cold-${i}`, !s.visiblePaused && s.playingOk && s.controls === false && s.webkitPlaysinline, s);
    await context.close();
  }

  // Reveal race: after load, freeze play via prototype, pause, seek, emit events.
  {
    const context = await browser.newContext({ ...iphone });
    const page = await context.newPage();
    await page.goto(`${BASE}/?seek=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector('[data-grid-card="project-joola-b2b"] video', { timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.evaluate(() => {
      const orig = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        // Resolve without starting — keeps element paused for the reveal check.
        this.pause();
        return Promise.resolve();
      };
      const video = document.querySelector('[data-grid-card="project-joola-b2b"] video');
      const slot = document.querySelector('[data-grid-card="project-joola-b2b"] .mux-media-slot');
      video.pause();
      slot.removeAttribute("data-frame");
      try { video.currentTime = 1; } catch { /* ignore */ }
      video.dispatchEvent(new Event("seeked"));
      video.dispatchEvent(new Event("timeupdate"));
      // Keep a handle so engines don't GC oddly
      window.__origPlay = orig;
    });
    await page.waitForTimeout(300);
    const s = await sample(page);
    log("seek-while-paused-stays-hidden", s.safeHidden && s.dataFrame !== "shown" && !s.visiblePaused && s.paused === true, s);
    await context.close();
  }

  // NotAllowed until first gesture — install before navigation.
  {
    const context = await browser.newContext({ ...iphone });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__playBlockCount = 0;
      window.__playAllow = false;
      const orig = HTMLMediaElement.prototype.play;
      window.addEventListener("pointerdown", () => { window.__playAllow = true; }, true);
      window.addEventListener("touchstart", () => { window.__playAllow = true; }, true);
      HTMLMediaElement.prototype.play = function (...args) {
        window.__playBlockCount = (window.__playBlockCount || 0) + 1;
        if (!window.__playAllow) {
          try { this.pause(); } catch {}
          return Promise.reject(new DOMException("blocked", "NotAllowedError"));
        }
        return orig.apply(this, args);
      };
      // autoPlay attribute can start media without going through play().
      const strip = (v) => { try { v.removeAttribute("autoplay"); v.autoplay = false; } catch {} };
      const mo = new MutationObserver((muts) => {
        for (const m of muts) for (const n of m.addedNodes) {
          if (n && n.nodeName === "VIDEO") strip(n);
          if (n && n.querySelectorAll) n.querySelectorAll("video").forEach(strip);
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    });
    await page.goto(`${BASE}/?block=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector('[data-grid-card="project-joola-b2b"]', { timeout: 30000 });
    await page.waitForTimeout(4000);
    const blocked = await sample(page);
    log(
      "blocked-stays-hidden",
      blocked.safeHidden && !blocked.visiblePaused && blocked.dataFrame !== "shown" && (blocked.blockProbe ?? 0) > 0,
      blocked,
    );
    await page.touchscreen.tap(180, 420);
    await page.waitForTimeout(2000);
    const after = await sample(page);
    log("gesture-recovers", after.playingOk && !after.visiblePaused && after.allowProbe === true, after);
    await context.close();
  }

  // Throttled
  {
    const context = await browser.newContext({ ...iphone });
    const page = await context.newPage();
    await page.route("**/*", async (route) => {
      const url = route.request().url();
      await new Promise((r) => setTimeout(r, /mux\.com|edgemv|fastly|chunk-/.test(url) ? 220 : 40));
      return route.continue();
    });
    await page.goto(`${BASE}/?thr=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector('[data-grid-card="project-joola-b2b"] video', { timeout: 30000 });
    await page.waitForTimeout(6500);
    const s = await sample(page);
    log("throttled", !s.visiblePaused && (s.playingOk || s.safeHidden), s);
    await context.close();
  }
} finally {
  await browser.close();
}

process.exit(failed ? 1 : 0);
