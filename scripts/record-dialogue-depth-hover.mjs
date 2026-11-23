// Round 3: the exploration 2 hover take, PostHog-simple. The pointer glides to one bar, its value swaps, holds, glides
// to the other bar, swaps, holds, leaves; the loop closes on the rest frame.
// Reuses the take recorder's pointer (scripts/record-dialogue-motion.mjs: the same SVG, the 600ms EASE_IO glide with a
// 0.08 bow, rests beside text). Run: node scripts/record-dialogue-depth-hover.mjs <baseUrl> <outDir> <a|b> [reduce]
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const [base, outDir, opt = "a", reduce = "0"] = process.argv.slice(2);
const name = `ex2-hover-${opt}${reduce === "1" ? "-reduced-motion" : ""}`;
const ZOOM = 2.5; // the card's 14px type renders at 35px in the take, about 1200px wide
const CUR = 36;
const EASE_IO = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
mkdirSync(outDir, { recursive: true });
const tmp = path.join(outDir, `.tmp-${name}`);
rmSync(tmp, { recursive: true, force: true });
const vw = { width: 1500, height: 1000 };
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const ctx = await browser.newContext({ viewport: vw, reducedMotion: reduce === "1" ? "reduce" : "no-preference", recordVideo: { dir: tmp, size: vw } });
const page = await ctx.newPage();
const t0 = Date.now();
await page.goto(`${base}/dev/dialogue-depth?ex=hover&opt=${opt}`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: `#frame { zoom: ${ZOOM}; } #dlg-cursor { width: ${CUR}px; height: ${CUR}px; } body > *:not(main):not(#dlg-cursor), header, footer, nav, nextjs-portal { visibility: hidden !important; } .dlg-lab { padding: 40px; }` });
await page.evaluate(() => {
  document.documentElement.setAttribute("data-theme", "light");
  const c = document.createElement("div"); c.id = "dlg-cursor"; c.style.opacity = "0";
  c.innerHTML = '<svg viewBox="0 0 18 18"><path d="M2 1.5v13l3.6-3.4 2.4 5.4 2.2-1-2.4-5.3h5z" fill="#1c1917" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  document.body.appendChild(c);
  addEventListener("mousemove", (e) => { c.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 2}px)`; });
});
await page.mouse.move(2, 2);
await page.waitForTimeout(300);
const box = await page.locator("#frame .dialogue-rachel-frame").boundingBox();
const start = (Date.now() - t0) / 1000;
const hold = (ms) => page.waitForTimeout(ms);
const cursor = (o) => page.evaluate((v) => { document.getElementById("dlg-cursor").style.opacity = v; }, o);
let pos = { x: 0, y: 0 };
async function glide(to, ms = 600) {
  const n = Math.round(ms / 16.7), from = { ...pos };
  for (let i = 1; i <= n; i++) {
    const dx = to.x - from.x, dy = to.y - from.y, e = EASE_IO(i / n), b = Math.sin(Math.PI * e) * 0.08;
    await page.mouse.move(from.x + dx * e - dy * b, from.y + dy * e + dx * b); await hold(14);
  }
  pos = to;
}
/* Rest on the empty end of a row's track: inside the hovered row, off its fill and clear of every word. */
async function trackRest(i) {
  const bb = await page.locator(".dlg-dx-denom__track").nth(i).boundingBox();
  return { x: bb.x + bb.width * 0.9, y: bb.y + bb.height * 0.5 };
}
await hold(400);
const r1 = await trackRest(0);
pos = { x: r1.x + 40, y: r1.y + 150 }; await page.mouse.move(pos.x, pos.y); await cursor(1);
await glide(r1);            // first hover lands near 1s
await hold(2000);           // payoff: the first row's value has swapped
await glide(await trackRest(1));
await hold(2000);
await glide({ x: r1.x + 40, y: r1.y + 150 }); // leave to the empty well under the card, where it came from
await page.evaluate(() => { document.getElementById("dlg-cursor").style.transition = "opacity 300ms ease"; });
await cursor(0); await hold(500);
const dur = (Date.now() - t0) / 1000 - start;
await ctx.close(); await browser.close();
const webm = readdirSync(tmp).find((f) => f.endsWith(".webm"));
const pad = 0;
const crop = `crop=${Math.round(box.width + pad * 2) & ~1}:${Math.round(box.height + pad * 2) & ~1}:${Math.round(box.x - pad)}:${Math.round(box.y - pad)}`;
const mp4 = path.join(outDir, `${name}.mp4`);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(start), "-t", String(dur), "-i", path.join(tmp, webm), "-vf", crop, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
// Poster: the first payoff, value swapped, pointer resting beside it (about 2s in).
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "2.0", "-i", mp4, "-frames:v", "1", path.join(outDir, `${name}-poster.png`)]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-vf", `fps=${6 / dur},scale=600:-2,tile=3x2:padding=8:color=white`, "-frames:v", "1", path.join(outDir, `${name}-sheet.png`)]);
rmSync(tmp, { recursive: true, force: true });
console.log(`${mp4} ${dur.toFixed(2)}s crop ${Math.round(box.width)}x${Math.round(box.height)}`);
