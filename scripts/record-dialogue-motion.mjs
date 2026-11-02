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
const NAMES = { hero: "live-hero-ask", side: "live-side", clip: "live-clip", every: "variant-every-full", toggles: "variant-toggles-full", thin: "live-thin" };
// P16: the picker is a still (its verdict lives in the caption); `still` renders it to variant-picker-full.jpg.
const STILLS = { picker: "variant-picker-full", before: "variant-before-full" };
/* P16 round 4 (Mudit): the picker still shows one depth picked (Chart), with the answer that depth returns. The problem
   frame is a still: the full prose answer with "Many found" underlined and its note in the gutter (none on phones). */
const SETUP = {
  picker: () => { const d = window.__dlg; d.pick(1); setTimeout(() => { d.send(); d.answer(); }, 100); },
  before: () => { const d = window.__dlg; d.send(); for (let i = 0; i < 5; i++) d.line(); d.mark(); setTimeout(() => d.note("Unstated count", ".dlg-mark"), 400); },
};
// Picker ends on its start state, so they need no crossfade. Others still blend end→start.
// P15: every and toggles now fold back to their start, so only hero, before and thin blend end to start.
const CROSSFADE = new Set(); // P16: no take crossfades; add-only takes scroll their chat up and out (clear) instead.
/** P15 item 9: subtle motion blur on the clip take (a 3-frame weighted blend; still frames are unchanged). */
const BLUR = { has: () => false }; // P16 round 2 (Mudit): no motion blur on any take; it read as choppy
const THEME = process.env.DLG_THEME === "dark" ? "dark" : "light";
// P16 round 3: DLG_MOBILE=1 records the phone takes, cropped to a 320px card with no gutter (files end in -m).
const AUDIT = process.env.DLG_AUDIT === "1";
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

const DEMO_PREROLL = { hero: 300, before: 300, thin: 300, toggles: 200 }; // add-only takes: the empty chat already closes the loop
async function still(demo) {
  const b = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => localStorage.setItem("theme", t), THEME);
  const page = await ctx.newPage();
  await page.goto(`${base}/dialogue/motion?demo=${demo}${Q}`, { waitUntil: "networkidle" });
  await page.waitForSelector("#frame", { timeout: 60000 });
  // A PNG still keeps the true well (#1b1e21); REC_WELL only offsets the H.264 encode.
  await page.addStyleTag({ content: "body > *:not(main), header, footer, nav, [class*='toc'], [class*='Toc'] { visibility: hidden !important; } *, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; }" });
  await page.waitForFunction(() => window.__dlg);
  // P16 round 4: each still holds one meaningful state, rendered with no motion.
  await page.evaluate(SETUP[demo]);
  await page.waitForTimeout(900);
  await page.evaluate(() => { document.querySelector(".dlg-stage__body").scrollTop = 0; });
  await page.waitForTimeout(150);
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
  await page.waitForSelector("#frame", { timeout: 60000 });
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
  // Slow-motion capture: the page runs at 1/K speed (CDP playback rate for CSS, window.__K for the stage's timers) so the
  // ~25 fps screencast samples every motion densely; the encode retimes by K. Without it every 6th frame duplicated mid-motion.
  const K = Number(process.env.DLG_SLOW ?? 2);
  await cdp.send("Animation.enable"); await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / K });
  await page.evaluate((k) => { window.__K = k; }, K);
  const hold = (ms) => page.waitForTimeout(ms * K);
  // Scroll speed multiplier (1: phone takes keep the desktop timings; the checker normalises their frame diff).
  const SLOW = 1;
  // Pointer rests: never on text. The two bar segments hold no text, tabs rest on their padding, and a chip's pointer
  // lands in the blank after its last word (the same rule as the quote taps beside their text).
  const SEG = { friday: ".dp-chart-stack__seg[data-focal]", unsure: ".dp-chart-stack__seg:not([data-focal])" };
  const TAB_FX = 0.92;
  const api = (js) => page.evaluate(`window.__dlg.${js.replace(/^(follow|up|clear|chase)\((\d+)\)$/, (_, f, n) => f === "chase" ? `chase(${Math.round(n * SLOW)}, 0.07)` : `${f}(${Math.round(n * SLOW)})`)}`);
  const cursor = (o) => page.evaluate((v) => { document.getElementById("dlg-cursor").style.opacity = v; }, o);
  // Fade in near the target, then a 600 ms ease-in-out glide; never a teleport.
  // Where the pointer should rest on a target right now. A target can be moving (a tab slides down as the chart grows
  // above it), so tracked moves ask again every step and the pointer rides the target instead of being left behind.
  async function aim(sel, { fx = 0.5, fy = 0.5, off = 0, afterText = false } = {}) {
    if (afterText) {
      // The blank right after the element's last word: the tip sits level with that line's top, past its end.
      return page.$eval(sel, (el, gap) => { const r = document.createRange(); r.selectNodeContents(el); const q = [...r.getClientRects()].pop(); return { x: q.right + gap, y: q.top + 2 }; }, 20);
    }
    const bb = await (await page.$(sel)).boundingBox();
    return { x: bb.x + bb.width * fx, y: bb.y + bb.height * fy + off };
  }
  async function cursorTo(sel, { ms = 600, track = true, ...o } = {}) {
    let to = await aim(sel, o);
    if ((await page.evaluate(() => getComputedStyle(document.getElementById("dlg-cursor")).opacity)) === "0") {
      pos = { x: to.x + 70, y: to.y }; await page.mouse.move(pos.x, pos.y); await cursor(1); await hold(200);
    }
    const n = Math.round(ms / 16.7), from = { ...pos };
    for (let i = 1; i <= n; i++) {
      if (track) to = await aim(sel, o);
      // A hand's path bows slightly; never a ruler-straight line.
      const dx = to.x - from.x, dy = to.y - from.y, bow = 0.08, e = EASE_IO(i / n), b = Math.sin(Math.PI * e) * bow;
      await page.mouse.move(from.x + dx * e - dy * b, from.y + dy * e + dx * b); await hold(14);
    }
    pos = to;
  }
  // After a tap the page moves under the pointer (tabs slide, a scroll follows). The pointer keeps its spot on the thing it
  // tapped (same offset from its corner) for the length of the hold, so no text slides under it and it never rests on a word.
  async function grab(sel) {
    const h = await page.$(sel), bb0 = await h.boundingBox(), dx = pos.x - bb0.x, dy = pos.y - bb0.y;
    return { ride: async (ms) => { const end = Date.now() + ms * K; while (Date.now() < end) { const bb = await h.boundingBox(); if (bb) { pos = { x: bb.x + dx, y: bb.y + dy }; await page.mouse.move(pos.x, pos.y); } await page.waitForTimeout(8); } } };
  }
  async function press() { await hold(150); await page.mouse.down(); await hold(120); await page.mouse.up(); }
  async function cursorOut() { await page.evaluate(() => { document.getElementById("dlg-cursor").style.transition = "opacity 300ms ease"; }); await cursor(0); await hold(320); await page.mouse.move(2, 2); }
  if (demo === "toggles") { const bb = await (await page.$('[data-target="level-0"]')).boundingBox(); pos = { x: bb.x + bb.width * TAB_FX, y: bb.y + bb.height * 0.5 }; await page.mouse.move(pos.x, pos.y); await cursor(1); }
  if (demo === "side") { const bb = await (await page.$(SEG.friday)).boundingBox(); pos = { x: bb.x + bb.width * 0.5, y: bb.y + bb.height * 0.1 }; await page.mouse.move(pos.x, pos.y); await cursor(1); }
  // P16 round 4: the first try starts closed (the answered count), like counts.
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
      await cursorTo(SEG.friday, { fx: 0.5, fy: 0.1, ms: 500 }); const g1 = await grab(SEG.friday); await press(); await api("ana()"); await g1.ride(450); await cursorOut(); await api('top(".dlg-fill", 12, 500)'); await hold(550);
      await hold(1200); await api("clear(700)"); await hold(Math.round(650 * SLOW));
    },
    // Counts (Mudit, P15 round 2): 225 open with the cursor resting on it; tap 75, linger; tap 225, linger. Last frame is the first.
    async side() {
      await cursorTo(SEG.unsure, { fx: 0.5, fy: 0.1 }); await press(); await api('side("unsure")'); await hold(1900);
      await cursorTo(SEG.friday, { fx: 0.5, fy: 0.1 }); await press(); await api('side("friday")'); await hold(1800);
    },
    // P16: opens from the counts end state (225 open, Ana first). Tap Ana, her clip plays; tap again, it folds.
    async clip() {
      // P16 round 3: the player opens, then the chat eases to its end so nothing sits across the card's bottom edge.
      await cursorTo('[data-target="quote-ana"]', { fx: 0.93, fy: 0.55 }); const g2 = await grab('[data-target="quote-ana"]'); await press(); await api("clip(true)"); await api(MOBILE ? 'stickEnd(560, ".dp-clip-quote--selected", 8)' : 'stick(560, ".dp-side-sample__head", 12)'); await g2.ride(2000);
      // On phone the answer sentence stays at the top with Ana's open clip fully below it; Dev's row waits just under the fold.
      // The fold clamps the chat's scroll by itself, in step with the height, so nothing else moves.
      await cursorTo('[data-target="quote-ana"]', { fx: 0.93, fy: 0.17 }); const g3 = await grab('[data-target="quote-ana"]'); await press(); await api("clip(false)"); await g3.ride(900); await cursorOut(); await hold(1250);
    },
    async before() { await api("send()"); await hold(500); for (let i = 0; i < 5; i++) { await api("line()"); await hold(380); } await api("mark()"); await hold(800); await api('note("Unstated count", ".dlg-mark")'); await hold(MOBILE ? 1100 : 1400); await api("clear(700)"); await hold(Math.round(650 * SLOW)); },
    // P16 first try: one tap on the 75 opens every level at once (people and a playing clip), then it holds and folds back.
    // P16 round 3: the first try starts overloaded (people open, Mei's player up, the count pushed out of view), folds
    // back on the chevron, and one tap on the 75 overloads it again, every level at once.
    // P16 round 4 (Mudit): every tap causes exactly what appears. The 75 opens its people; Mei opens her clip; the player
    // pushes the count out of view, which is the cost the first try proves. The chevron folds it back to the start.
    async every() {
      await cursorTo(SEG.unsure, { fx: 0.5, fy: 0.1, ms: 550 }); const g4 = await grab(SEG.unsure); await press(); await api('side("unsure")'); await g4.ride(MOBILE ? 1300 : 800);
      await cursorTo('[data-target="quote-mei"]', { fx: 0.93, fy: 0.55, ms: 550 }); const g5 = await grab('[data-target="quote-mei"]'); await press(); await api("clip(true)"); await api('stick(560, ".dp-side-sample__head", 12)'); await g5.ride(1700);
      await cursorTo('[data-target="side-collapse"]', { ms: 550 }); const g6 = await grab('[data-target="side-collapse"]'); await press(); await api("side(false)"); await api("clip(false)"); await g6.ride(500); await cursorOut(); await hold(1250);
    },
    // P16 kept, on the same stage: Chart, then Source (people and Mei's clip on the 75), then back to Insight.
    // P16 round 3: Chart, People, Source, then Mei. Each tap shows one thing; Source marks rows playable, Mei plays.
    // P16 round 4 (Mudit): the cursor starts and ends resting on Insight, so the loop seam is the same frame. People opens
    // the 225 the bar already emphasises; Source turns rows into play chips; Ana plays; Insight folds it all back.
    async toggles() {
      await cursorTo('[data-target="level-1"]', { fx: TAB_FX, ms: 400, track: true }); const g7 = await grab('[data-target="level-1"]'); await press(); await api("level(1)"); await g7.ride(120);
      await cursorTo('[data-target="level-2"]', { fx: TAB_FX, ms: 400, track: true }); const g8 = await grab('[data-target="level-2"]'); await press(); await api("level(2)"); await g8.ride(120);
      await cursorTo('[data-target="level-3"]', { fx: TAB_FX, ms: 400, track: true }); const g9 = await grab('[data-target="level-3"]'); await press(); await api("level(3)"); await g9.ride(120);
      await cursorTo('[data-target="quote-ana"]', { fx: 0.93, fy: 0.72, ms: 400 }); const g10 = await grab('[data-target="quote-ana"]'); await press(); await api("clip(true)");
      await api('stick(560, ".dlg-depth", 8)'); await g10.ride(800);
      // Ana's row folds the player away (the chat settles by itself), then Insight folds everything back.
      await cursorTo('[data-target="quote-ana"]', { fx: 0.93, fy: 0.17, ms: 400 }); const g11 = await grab('[data-target="quote-ana"]'); await press(); await api("clip(false)"); await g11.ride(560);
      await cursorTo('[data-target="level-0"]', { fx: TAB_FX, ms: 450, track: true }); const g12 = await grab('[data-target="level-0"]'); await press(); await api("level(0)"); await g12.ride(2300);
    },
    // P16: the thin answer arrives, the flag is named, a chip is tapped and counted, then the chat scrolls up and out.
    async thin() {
      // P16 round 4: no gutter note; the flag's surface and the labelled follow-ups explain themselves.
      await api("thin()"); await hold(1600);
      await cursorTo('[data-target="chip-0"] .dlg-thin__chip-q', { afterText: true }); await press(); await api("ask()"); await hold(100); await cursorOut(); await api("follow(500)"); await hold(450);
      await api("reply()"); await hold(100); await api("follow(600)"); await hold(2000); await api("clear(700)"); await hold(Math.round(650 * SLOW));
    },
  };
  if (AUDIT) await page.evaluate(() => {
    // Pointer-on-text audit: every frame, the pointer glyph's box against the visible text boxes of the stage.
    const cur = document.getElementById("dlg-cursor"), frame = document.getElementById("frame"), segs = []; let open = null;
    let last = { x: 0, y: 0 }, since = performance.now();
    const tick = () => {
      const c = cur.getBoundingClientRect(), vis = getComputedStyle(cur).opacity > 0.5;
      if (Math.abs(c.left - last.x) > 0.6 || Math.abs(c.top - last.y) > 0.6) { last = { x: c.left, y: c.top }; since = performance.now(); }
      const still = performance.now() - since > 120;
      const g = { l: c.left + c.width * 0.11, t: c.top + c.height * 0.08, r: c.left + c.width * 0.83, b: c.top + c.height * 0.86 };
      let hit = null;
      if (vis && still) {
        const w = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n && !hit; n = w.nextNode()) {
          if (!n.textContent.trim()) continue;
          const el = n.parentElement, cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none") continue;
          let o = 1; for (let a = el; a && a !== document.body; a = a.parentElement) o *= Number(getComputedStyle(a).opacity);
          if (o < 0.3) continue;
          const r = document.createRange(); r.selectNodeContents(n);
          for (const q of r.getClientRects()) if (q.width > 1 && g.l < q.right && g.r > q.left && g.t < q.bottom && g.b > q.top) { hit = n.textContent.trim().slice(0, 40); window.__dbg = [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom), Math.round(g.l), Math.round(g.t), Math.round(g.r), Math.round(g.b), n.parentElement.className, Math.round(c.left), Math.round(c.top), JSON.stringify([...document.querySelectorAll('.dp-chart-stack__seg')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; }))]; break; }
        }
      }
      if (hit && (!open || open.text !== hit)) { if (open) segs.push(open); open = { text: hit, t0: performance.now(), t1: 0, dbg: window.__dbg }; }
      if (open) { if (hit === open.text) open.t1 = performance.now(); else { segs.push(open); open = null; } }
      requestAnimationFrame(tick);
    };
    window.__audit = () => (open ? [...segs, open] : segs).map((s) => ({ text: s.text, ms: Math.round(s.t1 - s.t0), dbg: s.dbg })).filter((s) => s.ms >= 60);
    requestAnimationFrame(tick);
  });
  await S[demo]();
  if (AUDIT) { console.log(JSON.stringify({ demo, mobile: MOBILE, touches: await page.evaluate(() => window.__audit()) })); await b.close(); return; }
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
  const vf = `${crop},fps=${30 * K},setpts=PTS/${K},${BLUR.has(demo) ? "tmix=frames=3:weights=1 2 1," : ""}scale=${W}:-2:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`;
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
    if (AUDIT) break;
    try { execFileSync("python3", [CHECK, `${out}/${NAMES[d]}${SUFFIX}.mp4`], { stdio: "pipe" }); console.log(JSON.stringify({ demo: d, take, checklist: "pass" })); break; }
    catch (e) { console.log(JSON.stringify({ demo: d, take, checklist: "fail", detail: e.stdout?.toString().trim() })); }
  }
}
if (!AUDIT) execFileSync("python3", [new URL("./pick-dialogue-posters.py", import.meta.url).pathname, out], { stdio: "inherit" });
