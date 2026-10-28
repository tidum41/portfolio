// P11 demo recorder: one storyboard per video, to build/p11-motion-spec.md (design/TASTE.md "Motion").
// usage: node scripts/record-dialogue-motion.mjs <base-url> <out-dir> [demo ...]
// Records /dialogue/motion?demo=X with a CDP screencast, crops to #frame, encodes 30 fps H.264 (CRF 20, bt709),
// adds a 400 ms crossfade back to the first frame where the end state differs from the start, then picks posters
// (scripts/pick-dialogue-posters.py: the held frame with the most content, for first paint and reduced motion).
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright"); } catch { pw = req("@playwright/test"); }
const [, , base = "http://localhost:3207", out = "/workspace/dialogue-agent/shots/p11/motion", ...only] = process.argv;
mkdirSync(out, { recursive: true });
const NAMES = { hero: "live-hero-ask", side: "live-side", clip: "live-clip", before: "variant-before-full", every: "variant-every-full", picker: "variant-picker-full", toggles: "variant-toggles-full" };
const CROSSFADE = new Set(["hero", "before", "every", "picker"]);
const THEME = process.env.DLG_THEME === "dark" ? "dark" : "light"; const SUFFIX = THEME === "dark" ? "-dark" : "";
const EASE_IO = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

async function record(demo) {
  const tmp = `/tmp/dlg-motion-${demo}`; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
  const b = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  // The screencast delivers CSS-pixel frames, so the frame renders at zoom 2 in a 1280 px viewport (crisp 2x pixels, no upscale).
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1700 }, deviceScaleFactor: 1 });
  // DLG_THEME=dark records the dark well (files end in -dark) so videos match the figure background in either theme.
  await ctx.addInitScript((t) => localStorage.setItem("theme", t), THEME);
  const page = await ctx.newPage();
  await page.goto(`${base}/dialogue/motion?demo=${demo}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const c = document.createElement("div"); c.id = "dlg-cursor"; c.style.opacity = "0";
    c.innerHTML = '<svg viewBox="0 0 18 18"><path d="M2 1.5v13l3.6-3.4 2.4 5.4 2.2-1-2.4-5.3h5z" fill="#1c1917" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c);
    addEventListener("mousemove", (e) => { c.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 2}px)`; });
    addEventListener("mousedown", () => c.classList.add("down")); addEventListener("mouseup", () => c.classList.remove("down"));
  });
  // Hide the site's fixed chrome (nav, TOC button) so nothing but the stage can reach the crop.
  await page.addStyleTag({ content: "#frame { zoom: 2; overflow: visible !important; } #dlg-cursor { width: 46px; height: 46px; } body > *:not(main):not(#dlg-cursor), header, footer, nav, [class*='toc'], [class*='Toc'] { visibility: hidden !important; }" });
  // Decode every image up front: a lazy image entering view mid-scroll stalls the screencast for ~270 ms.
  await page.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = "eager"; i.decoding = "sync"; return i.decode().catch(() => {}); })));
  await page.waitForTimeout(400);
  const fb = await (await page.$("#frame")).boundingBox();
  const cdp = await ctx.newCDPSession(page); const frames = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => { frames.push({ t: metadata.timestamp, data }); cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {}); });
  let pos = { x: fb.x + fb.width + 40, y: fb.y + fb.height * 0.7 };
  await page.mouse.move(pos.x, pos.y);
  const hold = (ms) => page.waitForTimeout(ms);
  const api = (js) => page.evaluate(`window.__dlg.${js}`);
  const cursor = (o) => page.evaluate((v) => { document.getElementById("dlg-cursor").style.opacity = v; }, o);
  // Fade in near the target, then a 600 ms ease-in-out glide; never a teleport.
  async function cursorTo(sel, { ms = 600, fx = 0.5, fy = 0.5 } = {}) {
    const bb = await (await page.$(sel)).boundingBox();
    const to = { x: bb.x + bb.width * fx, y: bb.y + bb.height * fy };
    if ((await page.evaluate(() => getComputedStyle(document.getElementById("dlg-cursor")).opacity)) === "0") {
      pos = { x: to.x + 70, y: to.y + 60 }; await page.mouse.move(pos.x, pos.y); await cursor(1); await hold(200);
    }
    const n = Math.round(ms / 16.7), from = { ...pos };
    for (let i = 1; i <= n; i++) { const e = EASE_IO(i / n); await page.mouse.move(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e); await hold(14); }
    pos = to;
  }
  async function press() { await hold(150); await page.mouse.down(); await hold(120); await page.mouse.up(); }
  async function cursorOut() { await page.evaluate(() => { document.getElementById("dlg-cursor").style.transition = "opacity 300ms ease"; }); await cursor(0); await hold(320); await page.mouse.move(2, 2); }
  // A compositor-driven transform transition (ease-in-out), so a main-thread stall cannot drop scroll frames.
  async function scrollPanel(ms) {
    await page.evaluate((dur) => {
      const panel = document.querySelector(".dlg-motion-frame__panel"); const frame = document.getElementById("frame");
      const z = Number(panel.dataset.zoom) || 1;
      const over = Math.max(0, panel.getBoundingClientRect().height - (frame.getBoundingClientRect().height - 96));
      panel.style.willChange = "transform";
      panel.style.transition = `transform ${dur}ms cubic-bezier(0.45, 0, 0.55, 1)`;
      panel.style.transform = `translateY(${-over / (z * 2)}px)`;
    }, ms);
    await hold(ms);
  }
  const t0 = Date.now() / 1000;
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, everyNthFrame: 1, maxWidth: 1280, maxHeight: 1700 });
  await hold(800); // pre-roll
  const S = {
    async hero() { await api("type(18)"); await hold(250); await api("send()"); await api("analyze(true)"); await hold(800); await api("answer()"); await hold(800 + 1100); },
    async side() { await cursorTo('[data-target="side"]', { fx: 0.5, fy: 0.3 }); await press(); await hold(400); await cursorOut(); await hold(1300); await api("side(false)"); await hold(400 + 900); },
    async clip() { await cursorTo('[data-target="quote-mei"]', { fx: 0.35, fy: 0.5 }); await press(); await hold(400); await cursorOut(); await hold(1200); await cursorTo('[data-target="close"]'); await press(); await hold(700); await cursorOut(); await hold(800); },
    async before() { for (let i = 0; i < 5; i++) { await api("line()"); await hold(450); } await hold(300); await api("mark()"); await hold(300 + 1100); },
    async every() { await api("answer()"); await hold(550); await api("side(true)"); await hold(550); await api("clip(true)"); await api("pause()"); await hold(800); await scrollPanel(3400); await hold(800); },
    async picker() { await cursorTo('[data-target="depth-3"]'); await press(); await hold(400); await cursorTo('[data-target="send"]', { ms: 500 }); await press(); await api("send()"); await hold(450); await api("answer()"); await api("deep()"); await hold(400); await cursorOut(); await hold(1100); },
    async toggles() { await cursorTo('[data-target="level-2"]'); await press(); await hold(400 + 900); await cursorTo('[data-target="level-3"]', { ms: 500 }); await press(); await hold(400 + 600); await cursorTo('[data-target="level-0"]', { ms: 600 }); await press(); await hold(500); await cursorOut(); await hold(650); },
  };
  await S[demo]();
  const tStop = Date.now() / 1000; await cdp.send("Page.stopScreencast"); await hold(150); await b.close();
  // Constant 30 fps from screencast timestamps, cropped to the frame.
  const list = [];
  frames.forEach((f, i) => { const p = `${tmp}/${String(i).padStart(5, "0")}.jpg`; writeFileSync(p, Buffer.from(f.data, "base64"));
    const next = frames[i + 1]?.t ?? Math.max(f.t + 1 / 30, tStop); list.push(`file '${p}'\nduration ${(next - f.t).toFixed(4)}`); });
  list.push(`file '${tmp}/${String(frames.length - 1).padStart(5, "0")}.jpg'`);
  writeFileSync(`${tmp}/list.txt`, list.join("\n"));
  const k = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width", "-of", "csv=p=0", `${tmp}/00000.jpg`]).toString().trim()) / 1280;
  const W = 1038; // 519 css px at 2x
  const crop = `crop=${Math.round(fb.width * k)}:${Math.round(fb.height * k)}:${Math.round(fb.x * k)}:${Math.round(fb.y * k)}`;
  const enc = ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-r", "30", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-movflags", "+faststart"];
  const vf = `${crop},fps=30,scale=${W}:-2:flags=lanczos:out_color_matrix=bt709:out_range=tv`;
  const name = NAMES[demo]; const raw = `${tmp}/raw.mp4`; const mp4 = `${out}/${name}${SUFFIX}.mp4`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", `${tmp}/list.txt`, "-vf", vf, ...enc, raw]);
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw]).toString());
  if (CROSSFADE.has(demo)) {
    // Loop: the last frame crossfades over 400 ms into the first frame.
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", raw, "-frames:v", "1", `${tmp}/first.png`]);
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", raw, "-loop", "1", "-framerate", "30", "-t", "0.5", "-i", `${tmp}/first.png`, "-filter_complex",
      `[1:v]format=yuv420p,setsar=1,settb=1/30[first];[0:v]setsar=1,settb=1/30[main];[main][first]xfade=transition=fade:duration=0.4:offset=${(dur - 0.4).toFixed(3)}[v]`,
      "-map", "[v]", ...enc, mp4]);
  } else execFileSync("cp", [raw, mp4]);
  console.log(JSON.stringify({ demo, out: mp4, seconds: Number(dur.toFixed(2)), frames: frames.length }));
}
// The screencast occasionally drops frames under load (a skipped stretch reads as a jump), so each take is checked
// against the motion checklist and re-recorded, up to 4 takes; the last take's checklist line is printed either way.
const CHECK = new URL("./check-dialogue-motion.py", import.meta.url).pathname;
for (const d of only.length ? only : Object.keys(NAMES)) {
  for (let take = 1; take <= 4; take++) {
    await record(d);
    try { execFileSync("python3", [CHECK, `${out}/${NAMES[d]}${SUFFIX}.mp4`], { stdio: "pipe" }); console.log(JSON.stringify({ demo: d, take, checklist: "pass" })); break; }
    catch (e) { console.log(JSON.stringify({ demo: d, take, checklist: "fail", detail: e.stdout?.toString().trim() })); }
  }
}
execFileSync("python3", [new URL("./pick-dialogue-posters.py", import.meta.url).pathname, out], { stdio: "inherit" });
