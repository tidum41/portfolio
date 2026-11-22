// Deterministic one-loop recording of the Dialogue homepage card demo.
//
//   node scripts/record-thumbnail-loop.mjs --variant product --sel cut --name main-card-cut
//
// Loads /dev/dialogue-thumbnail?variant=..&sel=..&t=0 (scrub mode, dev only),
// steps the loop time at 40ms (25fps) through exactly one loop via
// window.__dlgThumbSeek, screenshots the [data-demo-frame] panel at
// deviceScaleFactor 2 on the light page, and encodes h264 yuv420p +faststart.
// Frame 0 is the loop's t=0 state; the last frame is the last 40ms step before
// the loop length, so playback wraps straight into frame 0.
//
// Options (CLI or env): --base / THUMB_BASE (default http://localhost:3117/dev/dialogue-thumbnail),
// --out / THUMB_OUT (default ./.thumb-out), --variant (product), --sel (cut|travel),
// --name (file stem, default <variant>-<sel>), --fps (25), --keep (keep the PNG frames),
// --channel / THUMB_CHANNEL (chrome, or chromium for the bundled headless shell).
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const argv = process.argv.slice(2);
const opt = (name, env, fallback) => {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--")) return argv[i + 1];
  return (env && process.env[env]) || fallback;
};
const BASE = opt("base", "THUMB_BASE", "http://localhost:3117/dev/dialogue-thumbnail");
const OUT = path.resolve(opt("out", "THUMB_OUT", ".thumb-out"));
const VARIANT = opt("variant", null, "product");
const SEL = opt("sel", null, "cut");
const NAME = opt("name", null, `${VARIANT}-${SEL}`);
const FPS = Number(opt("fps", null, "25"));
const STEP = 1000 / FPS;
const KEEP = argv.includes("--keep");
const CHANNEL = opt("channel", "THUMB_CHANNEL", "chrome");
if (!["cut", "travel"].includes(SEL)) throw new Error(`--sel must be cut or travel, got ${SEL}`);

const framesDir = path.join(OUT, `${NAME}-frames`);
await rm(framesDir, { recursive: true, force: true });
await mkdir(framesDir, { recursive: true });

const browser = await chromium.launch({ ...(CHANNEL === "chromium" ? {} : { channel: CHANNEL }), headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 2,
  colorScheme: "light",
  reducedMotion: "no-preference",
});
await page.addInitScript(() => {
  try {
    localStorage.setItem("theme", "light");
  } catch {}
});
const url = `${BASE}?variant=${VARIANT}${SEL === "cut" ? "" : `&sel=${SEL}`}&t=0`;
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => {
  document.documentElement.setAttribute("data-theme", "light");
  document.documentElement.removeAttribute("data-intro");
});
await page.waitForFunction(() => typeof window.__dlgThumbSeek === "function", null, { timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
const frame = page.locator("[data-demo-frame]");
await frame.scrollIntoViewIfNeeded();
const loopMs = Number(await frame.getAttribute("data-loop-ms"));
if (!loopMs) throw new Error("no data-loop-ms on [data-demo-frame]");
// The demo measures its cursor targets after mount (and again at 350ms): settle first.
await page.evaluate(() => window.__dlgThumbSeek(0));
await page.waitForTimeout(800);

const count = Math.ceil(loopMs / STEP);
for (let i = 0; i < count; i++) {
  const t = Math.round(i * STEP * 1000) / 1000;
  await page.evaluate((ms) => window.__dlgThumbSeek(ms), t);
  await frame.screenshot({ path: path.join(framesDir, `f${String(i).padStart(4, "0")}.png`), animations: "disabled" });
}
await browser.close();

const mp4 = path.join(OUT, `${NAME}.mp4`);
await exec("ffmpeg", [
  "-y",
  "-loglevel", "error",
  "-framerate", String(FPS),
  "-i", path.join(framesDir, "f%04d.png"),
  "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
  "-c:v", "libx264",
  "-preset", "slow",
  "-crf", "14",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  mp4,
]);
if (!KEEP) await rm(framesDir, { recursive: true, force: true });
console.log(`${NAME}: ${count} frames at ${STEP}ms over a ${loopMs}ms loop -> ${mp4}`);
