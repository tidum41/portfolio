/**
 * Card focus resume reliability @ 1440 (Chromium, headless).
 * Run: node scripts/verify-card-focus-resume.mjs (dev server on :3000, ffmpeg on PATH)
 *
 * Real Mux streams do not decode in headless Chromium, so stream.mux.com is routed to a
 * local VP9 fMP4 HLS fixture. The app still plays it through its own hls.js path, so
 * `.paused` and `currentTime` are real media state.
 *
 * Asserts: after neutral, every in-view grid video has `.paused === false` and an
 * advancing `currentTime` within 500ms. Covers 20 rapid hover on/off cycles, slow cycles,
 * card-to-card switches, and blur-driven neutral.
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const RESUME_DEADLINE_MS = 500;
const PAUSE_DEADLINE_MS = 200;
const ADVANCE_EPSILON_S = 0.04;
const FIXTURE_DIR = path.join(os.tmpdir(), "card-focus-hls-fixture");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

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

async function routeFixture(context) {
  await context.route("https://stream.mux.com/**", async (route) => {
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

/** Per-video snapshot. `inView` = any pixel inside the viewport. */
function snapshot(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    return [...document.querySelectorAll(".portfolio-grid-card video")].map((v, i) => {
      const r = v.getBoundingClientRect();
      return {
        i,
        card: v.closest(".portfolio-grid-card")?.getAttribute("data-grid-card"),
        inView: r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw && r.width > 0 && r.height > 0,
        paused: v.paused,
        t: v.currentTime,
        rs: v.readyState,
      };
    });
  });
}

/** Resolves when every in-view video is un-paused and currentTime moved past its baseline. */
async function assertResumed(page, baseline, label, deadline = RESUME_DEADLINE_MS) {
  const start = Date.now();
  let last = [];
  while (Date.now() - start <= deadline) {
    last = await snapshot(page);
    const inView = last.filter((v) => v.inView);
    assert(inView.length >= 2, `${label}: need >=2 in-view videos, saw ${inView.length}`);
    const ok = inView.every((v) => {
      const base = baseline.find((b) => b.i === v.i);
      return !v.paused && v.t > (base?.t ?? 0) + ADVANCE_EPSILON_S;
    });
    if (ok) return Date.now() - start;
    await page.waitForTimeout(20);
  }
  const bad = last.filter((v) => v.inView).map((v) => {
    const base = baseline.find((b) => b.i === v.i);
    return `${v.card}: paused=${v.paused} t=${v.t.toFixed(2)} base=${(base?.t ?? 0).toFixed(2)}`;
  });
  throw new Error(`${label}: in-view videos not resumed within ${deadline}ms -> ${bad.join(" | ")}`);
}

async function assertOthersPaused(page, activeCard, label, deadline = PAUSE_DEADLINE_MS) {
  const start = Date.now();
  let last = [];
  while (Date.now() - start <= deadline) {
    last = await snapshot(page);
    const active = await page.evaluate(
      () => document.querySelector("[data-card-focus-active]")?.getAttribute("data-grid-card") ?? null,
    );
    if (active === activeCard && last.filter((v) => v.card !== activeCard).every((v) => v.paused)) return;
    await page.waitForTimeout(10);
  }
  throw new Error(`${label}: others not paused within ${deadline}ms -> ${JSON.stringify(last)}`);
}

async function main() {
  ensureFixture();
  const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await routeFixture(context);
  const page = await context.newPage();

  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".portfolio-grid-card video", { timeout: 30000 });
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), { timeout: 20000 });
  await page.waitForFunction(() => window.__cardFocusReady === true, { timeout: 20000 });
  await page.waitForFunction(
    () => {
      const vs = [...document.querySelectorAll(".portfolio-grid-card video")];
      return vs.length >= 3 && vs.every((v) => !v.paused && v.currentTime > 1);
    },
    { timeout: 30000 },
  );

  const leftBox = await page.locator(".portfolio-grid-col").first().locator(".portfolio-grid-card").first().boundingBox();
  const rightBox = await page.locator(".portfolio-grid-col").nth(1).locator(".portfolio-grid-card").first().boundingBox();
  const leftId = await page.locator(".portfolio-grid-col").first().locator(".portfolio-grid-card").first().getAttribute("data-grid-card");
  const rightId = await page.locator(".portfolio-grid-col").nth(1).locator(".portfolio-grid-card").first().getAttribute("data-grid-card");
  assert(leftBox && rightBox, "need both columns");
  const cards = [
    { id: leftId, x: leftBox.x + leftBox.width / 2, y: leftBox.y + 100 },
    { id: rightId, x: rightBox.x + rightBox.width / 2, y: rightBox.y + 100 },
  ];
  const NEUTRAL = { x: 8, y: 8 };

  const hover = (c) => page.mouse.move(c.x, c.y, { steps: 2 });
  const goNeutral = async () => {
    const baseline = await snapshot(page);
    await page.mouse.move(NEUTRAL.x, NEUTRAL.y, { steps: 2 });
    return baseline;
  };
  const pause = (min, max) => page.waitForTimeout(min + Math.random() * (max - min));

  const inViewCount = (await snapshot(page)).filter((v) => v.inView).length;
  assert(inViewCount >= 2, `need >=2 in-view videos, saw ${inViewCount}`);

  // 1) 20 rapid hover on/off cycles, alternating cards, jittered dwell times.
  let worstRapid = 0;
  for (let i = 0; i < 20; i++) {
    await hover(cards[i % 2]);
    await pause(15, 90);
    const baseline = await goNeutral();
    if (i % 4 === 3) {
      worstRapid = Math.max(worstRapid, await assertResumed(page, baseline, `rapid cycle ${i + 1} neutral`));
    } else {
      await pause(15, 90);
    }
  }
  const afterRapidBaseline = await snapshot(page);
  worstRapid = Math.max(worstRapid, await assertResumed(page, afterRapidBaseline, "after 20 rapid cycles"));

  // 2) Slow cycles: dwell long enough for pause to land, then neutral.
  let worstSlow = 0;
  for (let i = 0; i < 6; i++) {
    const c = cards[i % 2];
    await hover(c);
    await assertOthersPaused(page, c.id, `slow cycle ${i + 1} focus`);
    await pause(250, 450);
    const baseline = await goNeutral();
    worstSlow = Math.max(worstSlow, await assertResumed(page, baseline, `slow cycle ${i + 1} neutral`));
    await pause(100, 250);
  }

  // 3) Card-to-card switch (no neutral between), then neutral.
  for (let i = 0; i < 5; i++) {
    await hover(cards[0]);
    await pause(30, 120);
    await hover(cards[1]);
    await assertOthersPaused(page, cards[1].id, `switch ${i + 1}`);
    const baseline = await goNeutral();
    await assertResumed(page, baseline, `switch ${i + 1} neutral`);
  }

  // 4) Hover then leave the grid by hovering the hero area, repeated with no dwell.
  for (let i = 0; i < 10; i++) {
    await hover(cards[i % 2]);
    await page.mouse.move(NEUTRAL.x, NEUTRAL.y, { steps: 1 });
  }
  await assertResumed(page, await snapshot(page), "burst enter/leave");

  // 5) Window blur while a card is focused must resume (blur previously paused everything).
  await hover(cards[0]);
  await assertOthersPaused(page, cards[0].id, "blur focus");
  const blurBaseline = await snapshot(page);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await assertResumed(page, blurBaseline, "after window blur");

  // 6) Pointer leaves the document.
  await hover(cards[1]);
  await assertOthersPaused(page, cards[1].id, "leave focus");
  const leaveBaseline = await snapshot(page);
  await page.evaluate(() =>
    document.documentElement.dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: null })),
  );
  await assertResumed(page, leaveBaseline, "after document pointerleave");

  // 7) A video that is offscreen when neutral returns stays paused (not resumed blindly)
  //    and starts as soon as it scrolls into view.
  await hover(cards[0]);
  await assertOthersPaused(page, cards[0].id, "offscreen focus");
  await goNeutral();
  await page.waitForTimeout(400);
  const settled = await snapshot(page);
  const offscreen = settled.filter((v) => !v.inView);
  assert(offscreen.length >= 1, "need at least one offscreen video for the IntersectionObserver case");
  for (const v of offscreen) assert(v.paused, `offscreen ${v.card} must not be resumed while out of view`);
  for (const v of settled.filter((s) => s.inView)) assert(!v.paused, `in-view ${v.card} must be playing`);

  const target = offscreen[0];
  for (let i = 0; i < 40; i++) {
    const now = (await snapshot(page)).find((v) => v.i === target.i);
    if (now?.inView) break;
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(40);
  }
  const intoView = await snapshot(page);
  assert(intoView.find((v) => v.i === target.i)?.inView, "scrolled offscreen video into view");
  await assertResumed(
    page,
    intoView.map((v) => ({ ...v, t: v.i === target.i ? v.t : 0 })),
    "offscreen video after scrolling into view",
    1500,
  );

  console.log(
    `card-focus resume: all assertions passed (worst resume: rapid ${worstRapid}ms, slow ${worstSlow}ms; budget ${RESUME_DEADLINE_MS}ms)`,
  );
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
