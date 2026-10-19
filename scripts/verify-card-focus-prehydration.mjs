/**
 * Pre-hydration guard @ 1440 (Chromium, headless).
 * Run: node scripts/verify-card-focus-prehydration.mjs (dev server on :3000, ffmpeg on PATH)
 *
 * Every Next JS bundle is aborted, so React never hydrates and no module (controller,
 * cardFocusVideo) ever runs. Only the inline boot script in the SSR HTML exists. With the
 * page in the dimmed state (html[data-card-focus] + one [data-card-focus-active] card),
 * videos are inserted late and play() is forced on all of them. The inline guard alone must:
 *   - pause every video in a dimmed card within 200ms and keep it paused,
 *   - leave the focused card's video playing (currentTime advancing),
 *   - leave everything alone once the state returns to neutral.
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CLIP = path.join(os.tmpdir(), "card-focus-guard-clip.webm");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function ensureClip() {
  if (fs.existsSync(CLIP)) return;
  execFileSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=24:duration=30", "-c:v", "libvpx-vp9", "-b:v", "120k", CLIP],
    { stdio: "inherit" },
  );
}

async function main() {
  ensureClip();
  const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.route("**/_next/static/**/*.js", (r) => r.abort());
  await context.route("**/__guard-clip.webm", (r) =>
    r.fulfill({ status: 200, body: fs.readFileSync(CLIP), headers: { "content-type": "video/webm", "access-control-allow-origin": "*" } }),
  );
  const page = await context.newPage();
  await page.goto(BASE_URL + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".portfolio-grid-card");

  const boot = await page.evaluate(() => ({
    guard: window.__cfGuard,
    hasPausedSet: window.__cfPaused instanceof Set,
    bootScript: Boolean(document.getElementById("card-focus-guard-boot")),
    hydrated: Boolean(window.__cardFocusReady),
  }));
  assert(boot.bootScript, "inline card-focus-guard-boot script is in the SSR HTML");
  assert(boot.guard === 1 && boot.hasPausedSet, `inline guard installed before hydration: ${JSON.stringify(boot)}`);
  assert(!boot.hydrated, "page must not have hydrated (JS bundles blocked)");

  // Build the dimmed state by hand: this is what the controller writes, and what the dim CSS reads.
  const cardIds = await page.evaluate(() =>
    [...document.querySelectorAll(".portfolio-grid-card")].slice(0, 3).map((c) => c.getAttribute("data-grid-card")),
  );
  assert(cardIds.length >= 3, "need 3 grid cards in SSR HTML");
  const [activeId, ...dimmedIds] = cardIds;

  await page.evaluate(
    ({ activeId }) => {
      document.documentElement.setAttribute("data-card-focus", "");
      document.querySelector(`[data-grid-card="${activeId}"]`).setAttribute("data-card-focus-active", "");
    },
    { activeId },
  );

  // Late-mounted videos, like Mux attaching after focus is already set. Insert after a delay,
  // then force play() the way every autoplay path does.
  await page.evaluate(
    async ({ cardIds }) => {
      await new Promise((r) => setTimeout(r, 300));
      for (const id of cardIds) {
        const card = document.querySelector(`[data-grid-card="${id}"]`);
        const v = document.createElement("video");
        v.className = "guard-test";
        v.muted = true;
        v.loop = true;
        v.autoplay = true;
        v.playsInline = true;
        v.src = "/__guard-clip.webm";
        card.appendChild(v);
        v.play().catch(() => {});
      }
    },
    { cardIds },
  );

  const sample = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("video.guard-test")].map((v) => ({
        card: v.closest(".portfolio-grid-card").getAttribute("data-grid-card"),
        paused: v.paused,
        t: v.currentTime,
        rs: v.readyState,
      })),
    );

  // Dimmed videos: paused within 200ms of the forced play, and stay paused.
  const started = Date.now();
  let settled = false;
  while (Date.now() - started < 200) {
    const s = await sample();
    if (s.length === 3 && s.filter((v) => v.card !== activeId).every((v) => v.paused)) {
      settled = true;
      break;
    }
    await page.waitForTimeout(10);
  }
  assert(settled, `dimmed videos paused within 200ms: ${JSON.stringify(await sample())}`);

  // Hostile re-starts while dimmed: forced play() again, repeatedly.
  for (let i = 0; i < 6; i++) {
    await page.evaluate((ids) => {
      for (const id of ids) document.querySelector(`[data-grid-card="${id}"] video.guard-test`).play().catch(() => {});
    }, dimmedIds);
    await page.waitForTimeout(250);
    const s = await sample();
    for (const v of s.filter((x) => x.card !== activeId)) {
      assert(v.paused, `dimmed ${v.card} stayed paused after forced play #${i + 1}`);
    }
  }

  // Focused card's video plays and advances.
  const a0 = (await sample()).find((v) => v.card === activeId);
  await page.waitForTimeout(600);
  const a1 = (await sample()).find((v) => v.card === activeId);
  assert(!a1.paused && a1.t > a0.t + 0.2, `focused video advancing: ${JSON.stringify({ a0, a1 })}`);

  // Neutral: the guard must stand down.
  await page.evaluate(() => {
    document.documentElement.removeAttribute("data-card-focus");
    document.querySelector("[data-card-focus-active]")?.removeAttribute("data-card-focus-active");
    for (const v of document.querySelectorAll("video.guard-test")) v.play().catch(() => {});
  });
  await page.waitForTimeout(700);
  const neutral = await sample();
  assert(neutral.every((v) => !v.paused && v.t > 0.1), `all videos play in neutral: ${JSON.stringify(neutral)}`);

  console.log("card-focus pre-hydration: inline guard alone paused dimmed videos and stood down on neutral");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
