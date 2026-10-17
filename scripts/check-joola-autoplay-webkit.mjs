/**
 * Cold-cache WebKit (iPhone) runs: JOOLA card must never show a native
 * play overlay, and should either be playing muted or stay on the poster
 * (opacity 0 video / no data-frame) — never a visible paused video.
 */
import { webkit, devices } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const RUNS = Number(process.env.RUNS || 4);
const THROTTLE = process.env.THROTTLE === "1";

const iphone = devices["iPhone 13"];

async function oneRun(browser, run, { throttle }) {
  const context = await browser.newContext({
    ...iphone,
    // Fresh storage each run = cold HTTP cache as far as the page is concerned.
    // Service workers / CDN still apply; we also disable cache via CDP-ish flags
    // aren't available on WebKit, so we use a cache-busting query + no storage.
  });
  const page = await context.newPage();

  if (throttle) {
    // WebKit has no CDP network emulation; approximate with route delay.
    await page.route("**/*", async (route) => {
      const url = route.request().url();
      const delay = /mux\.com|edgemv|fastly/.test(url) ? 180 : 40;
      await new Promise((r) => setTimeout(r, delay));
      return route.continue();
    });
  }

  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  const url = `${BASE}/?cold=${run}-${Date.now()}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector('[data-grid-card="project-joola-b2b"]', { timeout: 30000 });
  // Intro ~1.9s + Mux mount ~120ms + HLS attach
  await page.waitForTimeout(4500);

  const snap = await page.evaluate(() => {
    const card = document.querySelector('[data-grid-card="project-joola-b2b"]');
    const slot = card?.querySelector(".mux-media-slot");
    const video = card?.querySelector("video");
    const poster = card?.querySelector(".project-img-wrap > img");
    const cs = video ? getComputedStyle(video) : null;
    // Probe for WebKit start-playback button (pseudo elements aren't in DOM;
    // we check video visibility + paused as the failure mode).
    return {
      hasSlot: !!slot,
      dataFrame: slot?.getAttribute("data-frame") ?? null,
      dataHls: slot?.getAttribute("data-hls") ?? null,
      hasVideo: !!video,
      paused: video?.paused ?? null,
      muted: video?.muted ?? null,
      controls: video?.controls ?? null,
      playsInline: video?.playsInline ?? null,
      webkitPlaysinline: video?.hasAttribute("webkit-playsinline") ?? null,
      readyState: video?.readyState ?? null,
      currentTime: video?.currentTime ?? null,
      opacity: cs ? Number(cs.opacity) : null,
      pointerEvents: cs?.pointerEvents ?? null,
      posterVisible: poster ? getComputedStyle(poster).opacity !== "0" : null,
      // Failure: visible paused video (what surfaces the iOS play glyph)
      visiblePaused: !!(video && !video.paused === false && Number(cs?.opacity) > 0.05 && video.paused),
    };
  });

  // Also sample again after a short beat (race window)
  await page.waitForTimeout(1500);
  const snap2 = await page.evaluate(() => {
    const card = document.querySelector('[data-grid-card="project-joola-b2b"]');
    const slot = card?.querySelector(".mux-media-slot");
    const video = card?.querySelector("video");
    const cs = video ? getComputedStyle(video) : null;
    return {
      dataFrame: slot?.getAttribute("data-frame") ?? null,
      paused: video?.paused ?? null,
      opacity: cs ? Number(cs.opacity) : null,
      currentTime: video?.currentTime ?? null,
      visiblePaused: !!(video && video.paused && Number(cs?.opacity) > 0.05),
      playingOk: !!(video && !video.paused && Number(cs?.opacity) > 0.5),
      posterOnly: !!(video && video.paused && Number(cs?.opacity) < 0.05),
    };
  });

  // Compare a sibling Mux card (BruinLease) for parity
  const bruin = await page.evaluate(() => {
    const card = document.querySelector('[data-grid-card="project-bruinlease"]');
    const video = card?.querySelector("video");
    const cs = video ? getComputedStyle(video) : null;
    return {
      present: !!card,
      paused: video?.paused ?? null,
      opacity: cs ? Number(cs.opacity) : null,
      visiblePaused: !!(video && video.paused && Number(cs?.opacity) > 0.05),
    };
  });

  await context.close();
  return { run, throttle, snap, snap2, bruin, consoleErrors: consoleErrors.filter((e) => !/hydrat/i.test(e)).slice(0, 3) };
}

const browser = await webkit.launch({ headless: true });
const results = [];
let failed = false;
try {
  for (let i = 0; i < RUNS; i++) {
    const r = await oneRun(browser, i, { throttle: THROTTLE });
    results.push(r);
    const bad =
      r.snap.visiblePaused ||
      r.snap2.visiblePaused ||
      r.snap.controls === true ||
      (r.snap2.playingOk !== true && r.snap2.posterOnly !== true);
    if (bad) {
      failed = true;
      console.error("FAIL run", i, JSON.stringify(r, null, 2));
    } else {
      console.log(
        "OK run",
        i,
        "playing=",
        r.snap2.playingOk,
        "posterOnly=",
        r.snap2.posterOnly,
        "hls=",
        r.snap.dataHls,
        "t=",
        r.snap2.currentTime?.toFixed?.(2),
      );
    }
  }
  if (THROTTLE) {
    // already throttled above via THROTTLE env on all runs
  } else {
    // Extra throttled pass
    for (let i = 0; i < 2; i++) {
      const r = await oneRun(browser, `T${i}`, { throttle: true });
      results.push(r);
      const bad = r.snap.visiblePaused || r.snap2.visiblePaused || (r.snap2.playingOk !== true && r.snap2.posterOnly !== true);
      if (bad) {
        failed = true;
        console.error("FAIL throttled", i, JSON.stringify(r, null, 2));
      } else {
        console.log("OK throttled", i, "playing=", r.snap2.playingOk, "posterOnly=", r.snap2.posterOnly);
      }
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ failed, summary: results.map((r) => ({
  run: r.run,
  frame: r.snap2.dataFrame,
  playingOk: r.snap2.playingOk,
  posterOnly: r.snap2.posterOnly,
  visiblePaused: r.snap2.visiblePaused,
  hls: r.snap.dataHls,
  bruinVisiblePaused: r.bruin.visiblePaused,
})) }, null, 2));
process.exit(failed ? 1 : 0);
