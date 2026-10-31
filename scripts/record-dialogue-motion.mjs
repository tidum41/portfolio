// P11 demo recorder: one storyboard per video, to build/p11-motion-spec.md (design/TASTE.md "Motion").
// usage: node scripts/record-dialogue-motion.mjs <base-url> <out-dir> [demo ...]
// Records /dialogue/motion?demo=X with a CDP screencast, crops to #frame, encodes 30 fps H.264 (CRF 20, bt709),
// adds a 400 ms crossfade back to the first frame where the end state differs from the start, then picks posters
// (scripts/pick-dialogue-posters.py: the held frame with the most content, for first paint and reduced motion).
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright"); } catch { pw = req("@playwright/test"); }
const [, , base = "http://localhost:3207", out = "/workspace/dialogue-agent/shots/p11/motion", ...only] = process.argv;
mkdirSync(out, { recursive: true });
const NAMES = { hero: "live-hero-ask", side: "live-side", clip: "live-clip", before: "variant-before-full", every: "variant-every-full", toggles: "variant-toggles-full", thin: "live-thin" };
// P16: the picker is a still (its verdict lives in the caption); `still` renders it to variant-picker-full.jpg.
const STILLS = { picker: "variant-picker-full" };
// Picker ends on its start state, so they need no crossfade. Others still blend end→start.
// P15: every and toggles now fold back to their start, so only hero, before and thin blend end to start.
const CROSSFADE = new Set(); // P16: no take crossfades; add-only takes scroll their chat up and out (clear) instead.
/** P15 item 9: subtle motion blur on the clip take (a 3-frame weighted blend; still frames are unchanged). */
const BLUR = { has: () => false }; // P16 round 2 (Mudit): no motion blur on any take; it read as choppy
const THEME = process.env.DLG_THEME === "dark" ? "dark" : "light";
// P16 round 3: DLG_MOBILE=1 records the phone takes, cropped to a 320px card with no gutter (files end in -m).
const MOBILE = process.env.DLG_MOBILE === "1"; const Q = MOBILE ? "&m=1" : "";
const SUFFIX = (MOBILE ? "-m" : "") + (THEME === "dark" ? "-dark" : "");
const SHOWN_W = MOBILE ? 358 : 640; // css px the take is shown at (phone figure width at 390, desktop column)
const EASE_IO = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/** Figure well tokens (globals.css --figure-well-dialogue). Corner pixel of each take must land within ±2. */
const WELL = THEME === "dark" ? { r: 27, g: 30, b: 33, hex: "#1b1e21" } : { r: 236, g: 234, b: 228, hex: "#eceae4" };
/* Dark well: swscale encodes the CSS well #1b1e21 to YUV (41,129,127), which Chrome shows as (26,30,31), 2 units off.
   Recording the dark stage on #1b1e23 encodes to (42,130,126), which Chrome shows as (26,30,33), within 1 unit of the CSS
   well. Only the recording page changes; the site token stays #1b1e21. */
const REC_WELL = THEME === "dark" ? 'html[data-theme="dark"] { --figure-well-dialogue: #1b1e23; }' : "";

const DEMO_PREROLL = { hero: 300, before: 300, thin: 300, toggles: 300 }; // add-only takes: the empty chat already closes the loop
async function still(demo) {
  const b = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => localStorage.setItem("theme", t), THEME);
  const page = await ctx.newPage();
  await page.goto(`${base}/dialogue/motion?demo=${demo}${Q}`, { waitUntil: "networkidle" });
  // A PNG still keeps the true well (#1b1e21); REC_WELL only offsets the H.264 encode.
  await page.addStyleTag({ content: "body > *:not(main), header, footer, nav, [class*='toc'], [class*='Toc'] { visibility: hidden !important; } *, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; }" });
  await page.waitForFunction(() => window.__dlg);
  // The held state: Source picked, the question sent, the answer open at that depth.
  await page.evaluate(() => { window.__dlg.pick(3); });
  await page.waitForTimeout(100);
  await page.evaluate(() => { window.__dlg.send(); window.__dlg.answer(); });
  await page.waitForTimeout(100);
  // The question and count stay in view; Mei's clip (the 75) opens below them, already pushing the composer down.
  await page.evaluate(() => { window.__dlg.side("unsure"); window.__dlg.clip(true); window.__dlg.pause(); });
  await page.waitForTimeout(900);
  await page.evaluate(() => { document.querySelector(".dlg-stage__body").scrollTop = 0; });
  await page.waitForTimeout(100);
  const png = `/tmp/dlg-still-${demo}${SUFFIX}.png`; const jpg = `${out}/${STILLS[demo]}${SUFFIX}.jpg`;
  await (await page.$("#frame")).screenshot({ path: png });
  await b.close();
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", png, "-q:v", "2", jpg]);
  console.log(JSON.stringify({ demo, still: jpg }));
}
async function record(demo) {
  const tmp = `/tmp/dlg-motion-${demo}`; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
  const b = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  // The screencast delivers CSS-pixel frames, so the frame renders at zoom 2 in a 1280 px viewport (crisp 2x pixels, no upscale).
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1900 }, deviceScaleFactor: 1 });
  // DLG_THEME=dark records the dark well (files end in -dark) so videos match the figure background in either theme.
  await ctx.addInitScript((t) => localStorage.setItem("theme", t), THEME);
  const page = await ctx.newPage();
  await page.goto(`${base}/dialogue/motion?demo=${demo}${Q}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const c = document.createElement("div"); c.id = "dlg-cursor"; c.style.opacity = "0";
    c.innerHTML = '<svg viewBox="0 0 18 18"><path d="M2 1.5v13l3.6-3.4 2.4 5.4 2.2-1-2.4-5.3h5z" fill="#1c1917" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c);
    addEventListener("mousemove", (e) => { c.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 2}px)`; });
    addEventListener("mousedown", () => c.classList.add("down")); addEventListener("mouseup", () => c.classList.remove("down"));
  });
  // Hide the site's fixed chrome (nav, TOC button) so nothing but the stage can reach the crop.
  const fw = await page.evaluate(() => document.getElementById("frame").offsetWidth);
  const CUR = Math.round((28 * 2 * fw) / SHOWN_W); // P16: 28px on the page, where the 2x take shows SHOWN_W px wide
  // P16: no hover in any take (TASTE: hover states on figures are rejected). State changes come from window.__dlg, so the stage takes no pointer events.
  await page.addStyleTag({ content: REC_WELL + "#frame { zoom: 2; } " + `#dlg-cursor { width: ${CUR}px; height: ${CUR}px; }` + " .dlg-motion-frame, .dlg-motion-frame * { pointer-events: none !important; } body > *:not(main):not(#dlg-cursor), header, footer, nav, [class*='toc'], [class*='Toc'] { visibility: hidden !important; }" });
  // Decode every image up front: a lazy image entering view mid-scroll stalls the screencast for ~270 ms.
  await page.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = "eager"; i.decoding = "sync"; return i.decode().catch(() => {}); })));
  await page.waitForTimeout(400);
  const fb = await (await page.$("#frame")).boundingBox();
  const cdp = await ctx.newCDPSession(page); const frames = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => { frames.push({ t: metadata.timestamp, data }); cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {}); });
  let pos = { x: fb.x + fb.width + 40, y: fb.y + fb.height * 0.7 };
  await page.mouse.move(pos.x, pos.y);
  const hold = (ms) => page.waitForTimeout(ms);
  // Scroll speed multiplier (1: phone takes keep the desktop timings; the checker normalises their frame diff).
  const SLOW = 1;
  const api = (js) => page.evaluate(`window.__dlg.${js.replace(/^(follow|up|clear|chase)\((\d+)\)$/, (_, f, n) => f === "chase" ? `chase(${Math.round(n * SLOW)}, 0.07)` : `${f}(${Math.round(n * SLOW)})`)}`);
  const cursor = (o) => page.evaluate((v) => { document.getElementById("dlg-cursor").style.opacity = v; }, o);
  // Fade in near the target, then a 600 ms ease-in-out glide; never a teleport.
  async function cursorTo(sel, { ms = 600, fx = 0.5, fy = 0.5 } = {}) {
    const bb = await (await page.$(sel)).boundingBox();
    const to = { x: bb.x + bb.width * fx, y: bb.y + bb.height * fy };
    if ((await page.evaluate(() => getComputedStyle(document.getElementById("dlg-cursor")).opacity)) === "0") {
      pos = { x: to.x + 70, y: to.y + 60 }; await page.mouse.move(pos.x, pos.y); await cursor(1); await hold(200);
    }
    const n = Math.round(ms / 16.7), from = { ...pos };
    // A hand's path bows slightly; never a ruler-straight line.
    const dx = to.x - from.x, dy = to.y - from.y, bow = 0.08;
    for (let i = 1; i <= n; i++) { const e = EASE_IO(i / n), b = Math.sin(Math.PI * e) * bow; await page.mouse.move(from.x + dx * e - dy * b, from.y + dy * e + dx * b); await hold(14); }
    pos = to;
  }
  async function press() { await hold(150); await page.mouse.down(); await hold(120); await page.mouse.up(); }
  async function cursorOut() { await page.evaluate(() => { document.getElementById("dlg-cursor").style.transition = "opacity 300ms ease"; }); await cursor(0); await hold(320); await page.mouse.move(2, 2); }
  if (demo === "side") { const bb = await (await page.$('[data-target="side-friday"]')).boundingBox(); pos = { x: bb.x + bb.width * 0.5, y: bb.y + bb.height * 0.3 }; await page.mouse.move(pos.x, pos.y); await cursor(1); }
  if (demo === "every") { await api('side("unsure")'); await api("clip(true)"); await api("pause()"); await hold(900); await page.evaluate(() => { const b = document.querySelector(".dlg-stage__body"); b.scrollTop = b.scrollHeight; }); await hold(200); }
  const t0 = Date.now() / 1000;
  // PNG screencast: JPEG chroma loss shifted the flat well ~3 units greener/darker (P14 colour audit).
  await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1, maxWidth: 1400, maxHeight: 1900 });
  await hold(DEMO_PREROLL[demo] ?? 600); // pre-roll
  const S = {
    // P16: the question is typed and sent, the count arrives and Ana's row lands under it; the chat then scrolls up and
    // out (clear), so the loop returns to the empty chat with the UI on the card the whole time.
    // P16 round 3: typed at about 40 characters a second, a 400 ms analyzing beat, then a tap on the 225 brings Ana's
    // row (the rule counts teaches). The end holds about 1.2 s, then the chat scrolls up and out.
    async hero() {
      await api("type(40)"); await hold(150); await api("send()"); await api("analyze(true)"); await hold(400); await api("answer()"); await hold(800);
      await cursorTo('[data-target="side-friday"]', { fx: 0.5, fy: 0.3, ms: 500 }); await press(); await api("ana()"); await hold(450); await api("follow(500)"); await hold(550);
      await cursorOut(); await hold(1200); await api("clear(700)"); await hold(Math.round(650 * SLOW));
    },
    // Counts (Mudit, P15 round 2): 225 open with the cursor resting on it; tap 75, linger; tap 225, linger. Last frame is the first.
    async side() {
      await cursorTo('[data-target="side"]', { fx: 0.5, fy: 0.3 }); await press(); await api('side("unsure")'); await hold(1500);
      await cursorTo('[data-target="side-friday"]', { fx: 0.5, fy: 0.3 }); await press(); await api('side("friday")'); await hold(950);
    },
    // P16: opens from the counts end state (225 open, Ana first). Tap Ana, her clip plays; tap again, it folds.
    async clip() {
      // P16 round 3: the player opens, then the chat eases to its end so nothing sits across the card's bottom edge.
      await cursorTo('[data-target="quote-ana"]', { fx: 0.35, fy: 0.4 }); await press(); await api("clip(true)"); await api("chase(1400)"); await hold(1900);
      await cursorTo('[data-target="quote-ana"]', { fx: 0.35, fy: 0.85 }); await press(); await api("clip(false)"); await hold(450); await api("up(500)"); await hold(300); await cursorOut(); await hold(700);
    },
    async before() { await api("send()"); await hold(500); for (let i = 0; i < 5; i++) { await api("line()"); await hold(380); } await api("mark()"); await hold(800); await api('note("Unstated count", ".dlg-mark")'); await hold(MOBILE ? 1100 : 1400); await api("clear(700)"); await hold(Math.round(650 * SLOW)); },
    // P16 first try: one tap on the 75 opens every level at once (people and a playing clip), then it holds and folds back.
    // P16 round 3: the first try starts overloaded (people open, Mei's player up, the count pushed out of view), folds
    // back on the chevron, and one tap on the 75 overloads it again, every level at once.
    async every() {
      await hold(900);
      await cursorTo('[data-target="side-collapse"]', { ms: 500 }); await press(); await api("side(false)"); await api("clip(false)"); await hold(1100);
      await cursorTo('[data-target="side"]', { fx: 0.5, fy: 0.3, ms: 500 }); await press(); await api('side("unsure")'); await api("clip(true)"); await api("pause()"); await api("chase(1300)"); await hold(1300);
      await cursorOut(); await hold(700);
    },
    // P16 kept, on the same stage: Chart, then Source (people and Mei's clip on the 75), then back to Insight.
    // P16 round 3: Chart, People, Source, then Mei. Each tap shows one thing; Source marks rows playable, Mei plays.
    async toggles() {
      await cursorTo('[data-target="level-1"]', { ms: 500 }); await press(); await api("level(1)"); await hold(350);
      await cursorTo('[data-target="level-2"]', { ms: 500 }); await press(); await api("level(2)"); await hold(350);
      await cursorTo('[data-target="level-3"]', { ms: 500 }); await press(); await api("level(3)"); await hold(350);
      // Mei plays; the chat eases so the chips sit at the top, so Insight is one tap away with no scroll back.
      await cursorTo('[data-target="quote-mei"]', { fx: 0.35, fy: 0.4, ms: 500 }); await press(); await api("clip(true)");
      await api('top(".dlg-depth", 8, 800)'); await hold(1000);
      await cursorTo('[data-target="level-0"]', { ms: 500 }); await press(); await api("level(0)"); await hold(150);
      await cursorOut(); await hold(550);
    },
    // P16: the thin answer arrives, the flag is named, a chip is tapped and counted, then the chat scrolls up and out.
    async thin() {
      await api("thin()"); await hold(900); await api('note("Flag instead of a chart", "[data-target=thin-flag]")'); await hold(1000);
      await cursorTo('[data-target="chip-0"]', { fx: 0.3 }); await press(); await api("ask()"); await hold(200); await api("follow(500)"); await hold(450);
      await cursorOut(); await api("reply()"); await hold(100); await api("follow(600)"); await hold(2000); await api("clear(700)"); await hold(Math.round(650 * SLOW));
    },
  };
  await S[demo]();
  const tStop = Date.now() / 1000; await cdp.send("Page.stopScreencast"); await hold(150); await b.close();
  // Constant 30 fps from screencast timestamps, cropped to the frame.
  const list = [];
  frames.forEach((f, i) => { const p = `${tmp}/${String(i).padStart(5, "0")}.png`; writeFileSync(p, Buffer.from(f.data, "base64"));
    const next = frames[i + 1]?.t ?? Math.max(f.t + 1 / 30, tStop); list.push(`file '${p}'\nduration ${(next - f.t).toFixed(4)}`); });
  list.push(`file '${tmp}/${String(frames.length - 1).padStart(5, "0")}.png'`);
  writeFileSync(`${tmp}/list.txt`, list.join("\n"));
  const k = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width", "-of", "csv=p=0", `${tmp}/00000.png`]).toString().trim()) / 1400;
  const W = Math.round(fb.width * k) % 2 ? Math.round(fb.width * k) + 1 : Math.round(fb.width * k); // the frame at 2x (stages.ts STAGE_W)
  const crop = `crop=${Math.round(fb.width * k)}:${Math.round(fb.height * k)}:${Math.round(fb.x * k)}:${Math.round(fb.y * k)}`;
  // -g 600: one keyframe per take; x264's default keyframe at frame 250 flashed a visible re-quantize mid-hold (P15).
  const enc = ["-c:v", "libx264", "-g", "600", "-pix_fmt", "yuv420p", "-crf", "20", "-r", "30", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-movflags", "+faststart"];
  const vf = `${crop},fps=30,${BLUR.has(demo) ? "tmix=frames=3:weights=1 2 1," : ""}scale=${W}:-2:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`;
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
  // Well colour gate: decode frame 5 with the same bt709/tv matrix Chrome uses, assert corner ±2 of the well token.
  const sample = `${tmp}/well-sample.png`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", mp4, "-vf", "select=eq(n\\,5),scale=in_color_matrix=bt709:in_range=tv", "-frames:v", "1", sample]);
  const probe = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "frame=width,height", "-of", "csv=p=0", sample]).toString().trim();
  const [sw, sh] = probe.split(",").map(Number);
  // Read the top-left corner via ffmpeg signalstats on a 1x1 crop (no sharp dependency).
  const cornerLog = execFileSync("ffmpeg", ["-loglevel", "info", "-i", sample, "-vf", `crop=1:1:4:4,format=rgb24,signalstats`, "-f", "null", "-"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  // Prefer reading the PNG with node via a tiny decode through ffmpeg rawvideo.
  const rawRgb = `${tmp}/corner.rgb`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", sample, "-vf", "crop=1:1:4:4", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", rawRgb]);
  const rgb = readFileSync(rawRgb);
  const [cr, cg, cb] = [rgb[0], rgb[1], rgb[2]];
  const dr = Math.abs(cr - WELL.r), dg = Math.abs(cg - WELL.g), db = Math.abs(cb - WELL.b);
  if (dr > 2 || dg > 2 || db > 2) {
    throw new Error(`well colour fail ${THEME}: got (${cr},${cg},${cb}) want ${WELL.hex} ±2 (frame ${sw}x${sh}; ${cornerLog.split("\n").slice(-2).join(" ")})`);
  }
  console.log(JSON.stringify({ demo, out: mp4, seconds: Number(dur.toFixed(2)), frames: frames.length, well: [cr, cg, cb] }));
}
// The screencast occasionally drops frames under load (a skipped stretch reads as a jump), so each take is checked
// against the motion checklist and re-recorded, up to 4 takes; the last take's checklist line is printed either way.
const CHECK = new URL("./check-dialogue-motion.py", import.meta.url).pathname;
for (const d of only.length ? only : [...Object.keys(NAMES), ...Object.keys(STILLS)]) {
  if (STILLS[d]) { await still(d); continue; }
  for (let take = 1; take <= 4; take++) {
    await record(d);
    try { execFileSync("python3", [CHECK, `${out}/${NAMES[d]}${SUFFIX}.mp4`], { stdio: "pipe" }); console.log(JSON.stringify({ demo: d, take, checklist: "pass" })); break; }
    catch (e) { console.log(JSON.stringify({ demo: d, take, checklist: "fail", detail: e.stdout?.toString().trim() })); }
  }
}
execFileSync("python3", [new URL("./pick-dialogue-posters.py", import.meta.url).pathname, out], { stdio: "inherit" });
