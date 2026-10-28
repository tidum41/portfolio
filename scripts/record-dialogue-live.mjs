// Records the P10 live recreation like a product demo: scripted Playwright clicks with a
// visible cursor, captured with CDP screencast and rebuilt to constant 60 fps.
// usage: node scripts/record-dialogue-live.mjs <base-url> <out-dir>
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright"); } catch { pw = req("@playwright/test"); }
const [, , base = "http://localhost:3207", out = "/workspace/dialogue-agent/shots/p10/motion", variant = "base", h = "600", tag = ""] = process.argv;
const prefix = (variant === "base" ? "live" : `variant-${variant}`) + tag;
// Each step: [selector to click, mark name, hold after click in ms]
const STEPS = {
  base: [['[data-target="ask"]', "ask", 0], ['[data-target="side"]', "side", 1800], [".dlg-live__sample .dp-clip-quote", "clip", 2600]],
  toggles: [['[data-target="ask"]', "ask", 0], ['[data-target="chart"]', "chart", 1500], ['[data-target="side"]', "side", 1800], [".dlg-live__sample .dp-clip-quote", "clip", 2600]],
  picker: [['[data-target="depth-1"]', "pick", 600], ['[data-target="ask"]', "ask", 0], ['[data-target="more-people"]', "people", 1800], ['[data-target="more-source"]', "source", 2600]],
}[variant];
const tmp = "/tmp/dlg-live-frames"; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true }); mkdirSync(out, { recursive: true });

const b = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await b.newContext({ viewport: { width: 1120, height: 1520 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`${base}/dialogue/live?v=${variant}&h=${h}`, { waitUntil: "networkidle" });
// Case-study cursor (annotation, not product UI). It follows real mouse events.
await page.addStyleTag({ content: `#dlg-cursor{position:fixed;left:0;top:0;width:18px;height:18px;z-index:99;pointer-events:none;will-change:transform}
#dlg-cursor svg{display:block}header,nav,.cs-toc-fab,[class*=toc],[class*=Toc],.site-header{display:none!important}#stage{margin:40px auto!important;zoom:2}#dlg-cursor{zoom:2}#dlg-cursor.down svg{transform:scale(.88);transform-origin:2px 2px}` });
await page.evaluate(() => {
  const c = document.createElement("div"); c.id = "dlg-cursor";
  c.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 1.5v13l3.6-3.4 2.4 5.4 2.2-1-2.4-5.3h5z" fill="#1c1917" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  document.body.appendChild(c);
  addEventListener("mousemove", (e) => { c.style.transform = `translate(${(e.clientX - 4) / 2}px,${(e.clientY - 4) / 2}px)`; });
  addEventListener("mousedown", () => c.classList.add("down")); addEventListener("mouseup", () => c.classList.remove("down"));
});
await page.waitForTimeout(200);
const stage = await page.$("#stage .dlg-live"); const sb = await stage.boundingBox();
const marks = {};
const cdp = await ctx.newCDPSession(page);
const frames = [];
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  frames.push({ t: metadata.timestamp, data, w: metadata.deviceWidth * (metadata.pageScaleFactor || 1) && 1120 }); cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});
let pos = { x: sb.x + sb.width - 40, y: sb.y + sb.height - 40 };
await page.mouse.move(pos.x, pos.y);
const t0 = Date.now() / 1000;
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, everyNthFrame: 1, maxWidth: 1120, maxHeight: 1520 });
const mark = (k) => (marks[k] = Date.now() / 1000 - t0);
// Ease-in-out glide over `ms`, 60 steps a second.
async function glide(sel, ms = 700) {
  const bb = await (await page.$(sel)).boundingBox();
  const to = sel.includes("side") || sel.includes("depth") ? { x: bb.x + bb.width * 0.5, y: bb.y + bb.height * 0.35 } : { x: bb.x + 24, y: bb.y + bb.height / 2 };
  const n = Math.round(ms / 16.67), from = { ...pos };
  for (let i = 1; i <= n; i++) { const p = i / n, e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    await page.mouse.move(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e); await page.waitForTimeout(16); }
  pos = to;
}
async function click() { await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up(); }
await page.waitForTimeout(700);
for (const [sel, name, hold] of STEPS) {
  mark(`${name}-start`); await glide(sel); mark(`${name}-click`); await click();
  if (name === "ask") { await page.waitForSelector('[data-stage="answered"]', { timeout: 20000 }); await page.waitForTimeout(1600); }
  else await page.waitForTimeout(hold);
  mark(`${name}-end`);
}
const tStop = Date.now() / 1000; await cdp.send("Page.stopScreencast"); await page.waitForTimeout(200);
await b.close();

// Rebuild constant 60 fps from the screencast timestamps.
const T0 = frames[0].t; const list = [];
frames.forEach((f, i) => { const p = `${tmp}/${String(i).padStart(5, "0")}.jpg`; writeFileSync(p, Buffer.from(f.data, "base64"));
  const next = frames[i + 1]?.t ?? Math.max(f.t + 1 / 60, tStop); list.push(`file '${p}'\nduration ${(next - f.t).toFixed(4)}`); });
list.push(`file '${tmp}/${String(frames.length - 1).padStart(5, "0")}.jpg'`);
writeFileSync(`${tmp}/list.txt`, list.join("\n"));
const off = T0 - t0; // screencast start relative to marks
const k = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width", "-of", "csv=p=0", `${tmp}/00000.jpg`]).toString().trim()) / 1120; // screencast scale
const crop = `crop=${Math.round(sb.width * k)}:${Math.round(sb.height * k)}:${Math.round(sb.x * k)}:${Math.round(sb.y * k)}`;
const full = `${out}/${prefix}-full.mp4`;
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", `${tmp}/list.txt`, "-vf", `${crop},fps=60,scale=942:-2:flags=lanczos`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", full]);
const cut = (name, a, z) => {
  const mp4 = `${out}/${prefix}-${name}.mp4`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(Math.max(0, marks[a] - off - 0.3)), "-to", String(marks[z] - off), "-i", full, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-r", "60", mp4]);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", mp4, "-vf", "fps=30,scale=471:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=none", `${out}/${prefix}-${name}.gif`]);
};
for (const [, name] of STEPS) if (name !== "pick") cut(name, `${name}-start`, `${name}-end`);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", full, "-vf", "fps=30,scale=471:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=none", `${out}/${prefix}-full.gif`]);
writeFileSync(`${out}/${prefix}-marks.json`, JSON.stringify({ marks, screencastOffset: off, frames: frames.length,
  medianGapMs: (() => { const g = frames.slice(1).map((f, i) => (f.t - frames[i].t) * 1000).sort((a, b) => a - b); return g[g.length >> 1]; })() }, null, 1));
console.log(JSON.stringify({ frames: frames.length, marks }));
