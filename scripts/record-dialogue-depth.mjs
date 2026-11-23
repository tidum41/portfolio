// Records the depth explorations (app/dev/dialogue-depth) as short mp4 clips and 6-frame sheets.
// Run: node scripts/record-dialogue-depth.mjs <baseUrl> <outDir> <name> <query> <ms> [reduce] [cellSelector]
// Records the whole viewport with Playwright, crops to the first matching cell with ffmpeg, then tiles a frame sheet.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const [base, outDir, name, query, msArg = "5000", reduce = "0", cellSel = ".dlg-lab__cell"] = process.argv.slice(2);
const ms = Number(msArg);
mkdirSync(outDir, { recursive: true });
const tmp = path.join(outDir, `.tmp-${name}`);
rmSync(tmp, { recursive: true, force: true });
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const vw = { width: 1500, height: 720 };
const ctx = await browser.newContext({ viewport: vw, deviceScaleFactor: 1, reducedMotion: reduce === "1" ? "reduce" : "no-preference", recordVideo: { dir: tmp, size: vw } });
const page = await ctx.newPage();
const t0 = Date.now();
await page.goto(`${base}/dev/dialogue-depth?${query}`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  document.documentElement.setAttribute("data-theme", "light");
  document.documentElement.removeAttribute("data-intro");
  document.querySelector("nextjs-portal")?.remove();
  for (const el of document.querySelectorAll("body *")) {
    if (getComputedStyle(el).position === "fixed" && !el.closest(".dlg-lab")) el.style.setProperty("display", "none", "important");
  }
});
const box = await page.locator(cellSel).first().boundingBox();
const start = (Date.now() - t0) / 1000;
await page.waitForTimeout(ms);
await ctx.close();
await browser.close();
const webm = readdirSync(tmp).find((f) => f.endsWith(".webm"));
const pad = 8;
const crop = `crop=${Math.round(box.width + pad * 2) & ~1}:${Math.round(box.height + pad * 2) & ~1}:${Math.max(0, Math.round(box.x - pad))}:${Math.max(0, Math.round(box.y - pad))}`;
const mp4 = path.join(outDir, `${name}.mp4`);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(start), "-i", path.join(tmp, webm), "-vf", crop, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
const fps = 6 / (ms / 1000);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-vf", `fps=${fps},scale=480:-2,tile=3x2:padding=6:color=white`, "-frames:v", "1", path.join(outDir, `${name}-sheet.png`)]);
rmSync(tmp, { recursive: true, force: true });
console.log(`${mp4} (${ms}ms) + sheet`);
