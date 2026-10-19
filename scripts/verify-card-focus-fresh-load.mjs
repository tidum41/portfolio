/**
 * Fresh-load hover race @ 1440 (Chromium, headless). Waits for NO ready flag.
 * Run: node scripts/verify-card-focus-fresh-load.mjs (dev server on :3000, ffmpeg on PATH)
 *
 * For each throttle profile (none, Slow 4G) and each hover offset after DOMContentLoaded
 * (100, 300, 700, 1500ms): navigate fresh, hover the first card at that offset, keep
 * nudging the pointer until focus applies (the intro gate and hydration can delay it),
 * then require every non-focused grid video to be paused within 200ms of focus applying
 * and to STAY paused for the next 2.5s (covers videos that mount or autoplay late).
 *
 * Instrumentation is installed with addInitScript, before any page script runs.
 * stream.mux.com is routed to a local VP9 HLS fixture so videos genuinely play.
 */
import { chromium, webkit, firefox } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
/** REAL_MUX=1 skips the fixture route and plays real Mux; pair with CHROME=1 for H.264 support. */
const REAL_MUX = process.env.REAL_MUX === "1";
const ENGINE = { webkit, firefox }[process.env.BROWSER] || chromium;
const CHROME_PATH = process.env.CHROME === "1" ? "/usr/local/bin/google-chrome" : undefined;
const OFFSETS_MS = [100, 300, 700, 1500];
const PAUSE_DEADLINE_MS = 200;
const HOLD_AFTER_FOCUS_MS = 2500;
const FIXTURE_DIR = path.join(os.tmpdir(), "card-focus-hls-fixture");

/**
 * `streamDelayMs` holds every stream.mux.com response, like real Mux latency. The default
 * fixture answers instantly and starts videos before the intro gate lets a hover focus,
 * which hides the case where videos mount and autoplay AFTER focus is already set.
 */
const PROFILES = [
  { name: "no throttling", cdp: null, focusTimeoutMs: 30000, streamDelayMs: 0 },
  { name: "no throttling, slow Mux", cdp: null, focusTimeoutMs: 30000, streamDelayMs: 4500, lateStart: true },
  {
    name: "Slow 4G",
    cdp: { offline: false, downloadThroughput: (500 * 1024) / 8, uploadThroughput: (500 * 1024) / 8, latency: 400 },
    focusTimeoutMs: 120000,
    streamDelayMs: 0,
  },
  {
    name: "Slow 4G, slow Mux",
    cdp: { offline: false, downloadThroughput: (500 * 1024) / 8, uploadThroughput: (500 * 1024) / 8, latency: 400 },
    focusTimeoutMs: 120000,
    streamDelayMs: 8000,
    lateStart: true,
  },
];

function ensureFixture() {
  if (fs.existsSync(path.join(FIXTURE_DIR, "index.m3u8")) && fs.existsSync(path.join(FIXTURE_DIR, "seg019.m4s"))) return;
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "lavfi", "-i", "testsrc2=size=640x360:rate=24:duration=120",
      "-c:v", "libvpx-vp9", "-b:v", "250k", "-g", "48", "-keyint_min", "48", "-pix_fmt", "yuv420p",
      "-f", "hls", "-hls_time", "2", "-hls_playlist_type", "vod", "-hls_segment_type", "fmp4",
      "-hls_fmp4_init_filename", "init.mp4",
      "-hls_segment_filename", path.join(FIXTURE_DIR, "seg%03d.m4s"),
      path.join(FIXTURE_DIR, "index.m3u8"),
    ],
    { stdio: "inherit" },
  );
}

async function routeFixture(context, delayMs = 0) {
  await context.route("https://stream.mux.com/**", async (route) => {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    const url = new URL(route.request().url());
    const name = url.pathname.endsWith(".m3u8") ? "index.m3u8" : url.pathname.split("/").pop();
    const file = path.join(FIXTURE_DIR, name);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404 });
    const type = name.endsWith(".m3u8")
      ? "application/vnd.apple.mpegurl"
      : name.endsWith(".mp4") ? "video/mp4" : "video/iso.segment";
    await route.fulfill({
      status: 200,
      body: fs.readFileSync(file),
      headers: { "content-type": type, "access-control-allow-origin": "*" },
    });
  });
}

/** Runs before page scripts. Samples focus state and playing non-focused videos. */
function installProbe() {
  const probe = {
    focusAt: null,
    lastViolationAt: null,
    violations: 0,
    maxPlayingOthers: 0,
    videoCountAtFocus: null,
    playingAtFocus: null,
    focusedPlayingAt: null,
    worstLateMs: 0,
    refAt: null,
    refCard: null,
    worstDetail: null,
  };
  window.__cfProbe = probe;

  probe.transitions = [];
  let lastFocused = false;
  const sample = () => {
    const html = document.documentElement;
    const isFocused = html.hasAttribute("data-card-focus");
    if (isFocused !== lastFocused) {
      lastFocused = isFocused;
      probe.transitions.push([Math.round(performance.now()), isFocused ? "focus" : "neutral"]);
    }
    if (!isFocused) {
      probe.focusAt = null;
      probe.refCard = null;
      return;
    }
    const active = document.querySelector("[data-card-focus-active]");
    if (!active) return;
    const now = performance.now();
    const activeId = active.getAttribute("data-grid-card");
    if (probe.refCard !== activeId) {
      probe.refCard = activeId;
      probe.refAt = now;
    }
    const videos = [...document.querySelectorAll(".portfolio-grid-card video")];
    const others = videos.filter((v) => !active.contains(v));
    const playing = others.filter((v) => !v.paused);
    if (probe.focusAt === null) {
      probe.focusAt = now;
      probe.videoCountAtFocus = videos.length;
      probe.playingAtFocus = playing.length;
    }
    probe.maxPlayingOthers = Math.max(probe.maxPlayingOthers, playing.length);
    // `paused` is false for an autoplay video that has no data yet; real playback needs time moving.
    if (
      probe.focusedPlayingAt === null &&
      [...active.querySelectorAll("video")].some((v) => !v.paused && v.readyState >= 3 && v.currentTime > 0.05)
    ) {
      probe.focusedPlayingAt = now;
    }
    if (playing.length) {
      probe.violations++;
      probe.lastViolationAt = now;
      const late = now - probe.refAt;
      if (late > probe.worstLateMs) {
        probe.worstLateMs = late;
        probe.worstDetail = {
          active: activeId,
          playing: playing.map((v) => ({ card: v.closest(".portfolio-grid-card")?.getAttribute("data-grid-card"), rs: v.readyState, t: +v.currentTime.toFixed(2) })),
        };
      }
    }
  };

  const loop = () => {
    sample();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  setInterval(sample, 8);
  for (const type of ["play", "playing"]) {
    document.addEventListener(type, sample, true);
  }
}

async function runScenario(browser, profile, offsetMs) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (!REAL_MUX) await routeFixture(context, profile.streamDelayMs);
  await context.addInitScript(installProbe);
  const page = await context.newPage();
  if (profile.cdp) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", profile.cdp);
  }

  let dclAt = 0;
  page.once("domcontentloaded", () => {
    dclAt = Date.now();
  });
  await page.goto(BASE_URL + "/" + (process.env.SHARE_QUERY || ""), { waitUntil: "domcontentloaded" });
  if (!dclAt) dclAt = Date.now();

  const wait = offsetMs - (Date.now() - dclAt);
  if (wait > 0) await page.waitForTimeout(wait);

  // Card 0 from layout if present, else the known 1440x900 position.
  const target = await page.evaluate(() => {
    const el = document.querySelector(".portfolio-grid-col .portfolio-grid-card");
    const r = el?.getBoundingClientRect();
    if (r && r.width > 0) return { x: r.left + r.width / 2, y: Math.min(r.top + 100, window.innerHeight - 40) };
    return { x: 360, y: 520 };
  });
  const hoveredAtMs = Date.now() - dclAt;
  await page.mouse.move(target.x, target.y, { steps: 2 });

  const deadline = Date.now() + profile.focusTimeoutMs;
  let nudge = 0;
  let focused = false;
  while (Date.now() < deadline) {
    focused = await page.evaluate(() => document.documentElement.hasAttribute("data-card-focus"));
    if (focused) break;
    nudge ^= 1;
    await page.mouse.move(target.x + nudge * 3, target.y);
    await page.waitForTimeout(40);
  }
  if (!focused) {
    await context.close();
    throw new Error(`[${profile.name} @${offsetMs}ms] focus never applied within ${profile.focusTimeoutMs}ms`);
  }
  const focusLatencyMs = Date.now() - dclAt - hoveredAtMs;

  // Hold long enough for late streams to arrive and start, then another stretch to observe them.
  if (profile.lateStart) {
    const lateDeadline = Date.now() + profile.streamDelayMs * 8 + 60000;
    while (Date.now() < lateDeadline) {
      const started = await page.evaluate(() => window.__cfProbe.focusedPlayingAt !== null);
      if (started) break;
      nudge ^= 1;
      await page.mouse.move(target.x + nudge * 3, target.y);
      await page.waitForTimeout(2000);
    }
  }
  await page.waitForTimeout(PAUSE_DEADLINE_MS + HOLD_AFTER_FOCUS_MS);
  const result = await page.evaluate(() => {
    const p = window.__cfProbe;
    return {
      transitions: p.transitions,
      focusedPlayingAt: p.focusedPlayingAt,
      focusAt: p.focusAt,
      lastViolationAt: p.lastViolationAt,
      violations: p.violations,
      maxPlayingOthers: p.maxPlayingOthers,
      videoCountAtFocus: p.videoCountAtFocus,
      playingAtFocus: p.playingAtFocus,
      stillFocused: document.documentElement.hasAttribute("data-card-focus"),
      videos: [...document.querySelectorAll(".portfolio-grid-card video")].map((v) => ({
        card: v.closest(".portfolio-grid-card")?.getAttribute("data-grid-card"),
        active: Boolean(v.closest("[data-card-focus-active]")),
        paused: v.paused,
      })),
    };
  });
  await context.close();

  const label = `[${profile.name} @${offsetMs}ms]`;
  if (!result.stillFocused) throw new Error(`${label}: focus dropped during hold`);
  if (result.focusAt === null) throw new Error(`${label}: probe never saw focus`);
  if (profile.lateStart && (result.focusedPlayingAt === null || result.focusedPlayingAt <= result.focusAt)) {
    throw new Error(
      `${label}: test did not exercise the late-start path (focused video playing at ${result.focusedPlayingAt}, focus at ${result.focusAt}); focus transitions: ${JSON.stringify(result.transitions)}`,
    );
  }
  const lateViolationMs = result.lastViolationAt === null ? 0 : result.lastViolationAt - result.focusAt;
  const stuck = result.videos.filter((v) => !v.active && !v.paused);
  if (stuck.length || lateViolationMs > PAUSE_DEADLINE_MS) {
    throw new Error(
      `${label}: non-focused videos kept playing (last seen playing ${lateViolationMs.toFixed(0)}ms after focus, ` +
        `${result.violations} samples, ${result.playingAtFocus}/${result.videoCountAtFocus} playing at focus, ` +
        `still playing now: ${JSON.stringify(stuck)})`,
    );
  }
  return { label, focusLatencyMs, lateViolationMs, videos: result.videoCountAtFocus, playingAtFocus: result.playingAtFocus };
}


/**
 * FUZZ=N: N fresh loads, random hover time in [0, 4000]ms after DOMContentLoaded, sparse
 * human-like pointer movement (not a steady nudge), random throttle. Fails if any
 * non-focused video is seen playing more than 200ms into any focus session.
 */
async function runFuzz(browser, n) {
  const throttles = [
    null,
    { offline: false, downloadThroughput: (1600 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 },
  ];
  let bad = 0;
  for (let i = 0; i < n; i++) {
    const offsetMs = Math.floor(Math.random() * 4000);
    const cdpProfile = throttles[i % throttles.length];
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    if (!REAL_MUX) await routeFixture(context, Math.floor(Math.random() * 3000));
    await context.addInitScript(installProbe);
    const page = await context.newPage();
    if (cdpProfile) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", cdpProfile);
    }
    let dclAt = 0;
    page.once("domcontentloaded", () => { dclAt = Date.now(); });
    await page.goto(BASE_URL + "/" + (process.env.SHARE_QUERY || ""), { waitUntil: "domcontentloaded" });
    if (!dclAt) dclAt = Date.now();
    const wait = offsetMs - (Date.now() - dclAt);
    if (wait > 0) await page.waitForTimeout(wait);

    const pts = [
      { x: 360, y: 560 },
      { x: 1060, y: 560 },
      { x: 360, y: 760 },
      { x: 1060, y: 760 },
      { x: 700, y: 200 },
    ];
    let cur = pts[Math.floor(Math.random() * 2)];
    await page.mouse.move(cur.x, cur.y, { steps: 3 });
    const end = Date.now() + 9000;
    while (Date.now() < end) {
      await page.waitForTimeout(120 + Math.random() * 380);
      const r = Math.random();
      cur = r < 0.6
        ? { x: cur.x + (Math.random() * 16 - 8), y: cur.y + (Math.random() * 16 - 8) }
        : pts[Math.floor(Math.random() * pts.length)];
      await page.mouse.move(cur.x, cur.y, { steps: 1 + Math.floor(Math.random() * 4) });
    }
    const res = await page.evaluate(() => ({
      worst: window.__cfProbe.worstLateMs,
      violations: window.__cfProbe.violations,
      transitions: window.__cfProbe.transitions.length,
      detail: window.__cfProbe.worstDetail,
    }));
    await context.close();
    const ok = res.worst <= PAUSE_DEADLINE_MS;
    if (!ok) bad++;
    console.log(
      `${ok ? "ok  " : "FAIL"} fuzz ${String(i + 1).padStart(2)}/${n} hover@${String(offsetMs).padStart(4)}ms ` +
        `${cdpProfile ? "fast3G" : "none  "} focus-sessions=${res.transitions} worst-playing-after-focus=${res.worst.toFixed(0)}ms` +
        (ok ? "" : ` detail=${JSON.stringify(res.detail)}`),
    );
  }
  if (bad) throw new Error(`fuzz: ${bad}/${n} runs saw non-focused video playing >${PAUSE_DEADLINE_MS}ms into focus`);
  console.log(`card-focus fresh-load fuzz: ${n} runs, no late-playing videos`);
}

async function main() {
  if (!REAL_MUX) ensureFixture();
  const browser = await ENGINE.launch({
    headless: true,
    ...(ENGINE === chromium
      ? { executablePath: CHROME_PATH, args: ["--autoplay-policy=no-user-gesture-required", "--no-sandbox"] }
      : {}),
  });
  if (process.env.FUZZ) {
    await runFuzz(browser, Number(process.env.FUZZ));
    await browser.close();
    return;
  }
  const rows = [];
  let failed = 0;
  const only = process.env.PROFILE_FILTER?.toLowerCase();
  for (const profile of PROFILES) {
    if (only && !profile.name.toLowerCase().includes(only)) continue;
    if (REAL_MUX && profile.lateStart) continue;
    for (const offset of OFFSETS_MS) {
      try {
        const r = await runScenario(browser, profile, offset);
        rows.push(r);
        console.log(
          `PASS ${r.label} focus applied ${r.focusLatencyMs}ms after hover; ` +
            `${r.playingAtFocus}/${r.videos} others playing at focus; last playing ${r.lateViolationMs.toFixed(0)}ms after`,
        );
      } catch (e) {
        failed++;
        console.error(`FAIL ${e.message}`);
      }
    }
  }
  await browser.close();
  if (failed) {
    console.error(`card-focus fresh-load: ${failed} scenario(s) failed`);
    process.exit(1);
  }
  console.log("card-focus fresh-load: all scenarios passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
