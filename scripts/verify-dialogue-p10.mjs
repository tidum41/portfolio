// P10 verification gate: layout, accuracy, motion. Run before every push.
// usage: node scripts/verify-dialogue-p10.mjs [base-url] [frames-dir]
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright"); } catch { pw = req("@playwright/test"); }
const [, , base = "http://localhost:3207"] = process.argv;
let fails = 0;
const log = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); };
const b = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });

// 1. Layout on /dialogue at 1440 and 390, light theme, 1px tolerance.
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript(() => localStorage.setItem("theme", "light"));
  const p = await ctx.newPage();
  await p.goto(`${base}/dialogue`, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const box = (e) => e.getBoundingClientRect();
    const col = box(document.querySelector("article .cs-claim-h2"));
    const figs = [...document.querySelectorAll("article .cs-figure")].map((f) => ({ id: f.closest("section")?.id, l: box(f).left, r: box(f).right }));
    const wells = [...document.querySelectorAll(".dialogue-rachel-frame")].map((f) => { const s = getComputedStyle(f); return { id: f.closest("section,[class*=hero]")?.id || "hero", pad: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].join(" ") }; });
    const labels = [...document.querySelectorAll(".dp-chart-stack__labels")].map((row) => [...row.querySelectorAll(".dp-chart-stack__label")].map((l) => box(l).bottom));
    const overflow = [...document.querySelectorAll("article *")].filter((e) => { const b = box(e); return b.width && (b.right > innerWidth + 1 || b.left < -1) && !e.closest(".dp-scaled-viewport__clip,[aria-hidden=true]"); }).length;
    return { col: { l: col.left, r: col.right }, figs, wells, labels, overflow, scrollW: document.documentElement.scrollWidth };
  });
  for (const f of r.figs) log(Math.abs(f.l - r.col.l) <= 1 && Math.abs(f.r - r.col.r) <= 1, `layout @${w} figure #${f.id} on the column (${f.l.toFixed(1)}-${f.r.toFixed(1)} vs ${r.col.l.toFixed(1)}-${r.col.r.toFixed(1)})`);
  const pads = [...new Set(r.wells.map((x) => x.pad))];
  log(pads.length <= 1, `layout @${w} equal well padding (${pads.join(" | ")})`);
  r.labels.forEach((row, i) => log(row.length < 2 || Math.max(...row) - Math.min(...row) <= 1, `layout @${w} bar labels share a baseline, chart ${i} (${row.map((v) => v.toFixed(1)).join(", ")})`));
  log(r.scrollW <= w + 1, `layout @${w} no horizontal page overflow (scrollWidth ${r.scrollW})`);
  await ctx.close();
}

// 1b. Pixel: padding symmetry, vertical centring, stacked gaps, controls on frame edges.
async function pixelChecks(p, where) {
  const r = await p.evaluate(() => {
    const out = [];
    const px = (v) => parseFloat(v) || 0;
    const vis = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
    // Padding symmetry on notes, rows and buttons.
    for (const sel of [".dp-low-signal", ".dp-next-study", ".dlg-querying", ".dp-clip-quote", ".dp-chart-viz-card", ".dlg-suggest"]) {
      document.querySelectorAll(sel).forEach((e, i) => { if (!vis(e)) return; const c = getComputedStyle(e);
        out.push({ k: "pad", id: `${sel}#${i}`, ok: Math.abs(px(c.paddingLeft) - px(c.paddingRight)) <= 1 && Math.abs(px(c.paddingTop) - px(c.paddingBottom)) <= 1, v: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}` }); });
    }
    // Icon and first text line share a vertical centre.
    for (const [row, icon] of [[".dp-low-signal", ".dp-low-signal__icon"], [".dp-clip-quote__who", "svg"], [".dp-next-study", "svg"]]) {
      document.querySelectorAll(row).forEach((e, i) => { if (!vis(e)) return; const ic = e.querySelector(icon); if (!ic) return;
        const range = document.createRange(); const tn = [...e.querySelectorAll("*"), e].flatMap((n) => [...n.childNodes]).find((n) => n.nodeType === 3 && n.textContent.trim()); if (!tn) return;
        range.selectNodeContents(tn); const line = range.getClientRects()[0]; const ib = ic.getBoundingClientRect();
        const lh = parseFloat(getComputedStyle(tn.parentElement).lineHeight) || line.height; const lineMid = line.top + line.height / 2;
        const d = Math.abs(ib.top + ib.height / 2 - lineMid);
        out.push({ k: "centre", id: `${row}#${i}`, ok: d <= 1.5, v: `${d.toFixed(2)}px off (line ${lh}px)` }); });
    }
    // Stacked cards inside a chat body keep one gap.
    document.querySelectorAll(".dp-study-chat__body, .dp-clip-quotes").forEach((body, i) => { if (!vis(body)) return;
      const kids = [...body.children].filter(vis); const gaps = [];
      for (let j = 1; j < kids.length; j++) gaps.push(Math.round(kids[j].getBoundingClientRect().top - kids[j - 1].getBoundingClientRect().bottom));
      const uniq = [...new Set(gaps.filter((g) => g >= 0))];
      out.push({ k: "gap", id: `${body.className.split(" ")[0]}#${i}`, ok: uniq.length <= 2 && (uniq.length < 2 || Math.abs(uniq[0] - uniq[1]) <= 1 || Math.min(...uniq) >= 8), v: gaps.join(",") }); });
    // Play button 8px from the top right of the figure's background container (.dialogue-rachel-frame).
    // Body demos: clear of the video. Hero (P14 item 14): sits over the recording's well air (top ~52px), not over the panel.
    document.querySelectorAll(".dlg-demo").forEach((d, i) => { const v = d.querySelector("video"), b = d.querySelector(".phone-mockup-play-btn"), f = d.closest(".dialogue-rachel-frame"); if (!v || !b || !vis(v)) return;
      const fb = f ? f.getBoundingClientRect() : null, vb = v.getBoundingClientRect(), bb = b.getBoundingClientRect();
      const corner = !!fb && Math.abs(fb.right - bb.right - 8) <= 1 && Math.abs(bb.top - fb.top - 8) <= 1;
      out.push({ k: "edge", id: `demo#${i}`, ok: corner, v: fb ? `container right ${(fb.right - bb.right).toFixed(1)} top ${(bb.top - fb.top).toFixed(1)}` : "no .dialogue-rachel-frame" });
      const ov = (a, c) => a.left < c.right - 0.5 && c.left < a.right - 0.5 && a.top < c.bottom - 0.5 && c.top < a.bottom - 0.5;
      const hero = !!d.closest(".cs-hero-media-frame");
      const intoVideo = bb.bottom - vb.top;
      const clear = hero ? intoVideo <= 56 : !ov(bb, vb);
      out.push({ k: "clear", id: `demo#${i}`, ok: clear, v: hero ? `hero air ${intoVideo.toFixed(0)}px (≤56)` : `button ${bb.left.toFixed(0)},${bb.top.toFixed(0)}-${bb.right.toFixed(0)},${bb.bottom.toFixed(0)} video ${vb.left.toFixed(0)},${vb.top.toFixed(0)}-${vb.right.toFixed(0)},${vb.bottom.toFixed(0)}` }); });
    return out;
  });
  for (const x of r) log(x.ok, `pixel ${where} ${x.k} ${x.id} (${x.v})`);
}
for (const [w, h] of [[1464, 838], [1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: "no-preference" });
  await ctx.addInitScript(() => localStorage.setItem("theme", "light"));
  const p = await ctx.newPage();
  await p.goto(`${base}/dialogue`, { waitUntil: "networkidle" });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
  await pixelChecks(p, `/dialogue @${w}x${h}`);
  if (w === 1440) {
    await p.goto(`${base}/dialogue/live?v=toggles`, { waitUntil: "networkidle" });
    await p.click('[data-target="ask"]'); await p.waitForSelector('[data-stage="answered"]', { timeout: 20000 });
    await p.click('[data-target="people"]'); await p.waitForTimeout(300);
    await pixelChecks(p, `/dialogue/live @${w}`);
  }
  await ctx.close();
}

// 2. Accuracy: numbers, names and times agree across the page and the live recreation.
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/dialogue`, { waitUntil: "networkidle" });
  const text = await p.evaluate(() => document.body.innerText);
  // Hypotheticals ("could be 160 or 280") are argument, not data; the thin finding is 2 of 300.
  const of300 = [...text.replace(/[^.\n]*could be[^.\n]*/g, "").matchAll(/(\d+) of 300/g)].map((m) => +m[1]);
  log(of300.every((n) => [225, 75, 2].includes(n)), `accuracy: every 'N of 300' is 225, 75 or the thin 2 (${[...new Set(of300)].join(", ")})`);
  log(!/\b(18|6) of 24\b|24 interviews/.test(text), "accuracy: no leftover 24-interview scale");
  await p.goto(`${base}/dialogue/live`, { waitUntil: "networkidle" });
  await p.click('[data-target="ask"]'); await p.waitForSelector('[data-stage="answered"]', { timeout: 20000 });
  await p.click('[data-target="side"]'); await p.waitForTimeout(300);
  const side = await p.evaluate(() => {
    const head = document.querySelector(".dp-side-sample__head").innerText.replace(/\s+/g, " "); // the head is a flex row (count, label, collapse)
    const more = document.querySelector(".dp-side-sample .dp-sources").innerText;
    const rows = [...document.querySelectorAll(".dlg-live__sample .dp-clip-quote")].map((q) => ({ name: q.querySelector(".dp-clip-quote__name").innerText, time: q.querySelector(".dp-clip-quote__time").innerText, wave: !!q.querySelector("svg") }));
    return { head, more, rows };
  });
  const [, total, shown] = side.head.match(/(\d+) unsure, (\d+) shown/) || [];
  log(+total === 75, `accuracy: side total matches the bar (75 vs ${total})`);
  log(+shown === side.rows.length, `accuracy: 'shown' matches rows (${shown} vs ${side.rows.length})`);
  log(side.more.includes(`+${total - shown} more`), `accuracy: '+N more' is total minus shown (${side.more.trim()})`);
  log(side.rows.every((r) => r.wave), "accuracy: every quote row carries the waveform icon");
  for (const r of side.rows) { const [a, z] = r.time.split(/[\u2013-]/); const s = (t) => t.split(":").reduce((x, n) => x * 60 + +n, 0); log(s(a) < s(z), `accuracy: ${r.name} clip range runs forward (${r.time})`); }
  await p.click(".dlg-live__sample .dp-clip-quote"); await p.waitForTimeout(400);
  const cur = await p.$eval('[data-annotate-part="player-time-current"]', (e) => e.innerText);
  const tot = await p.$eval('[data-annotate-part="player-time-total"]', (e) => e.innerText);
  log(side.rows[0].time.startsWith(cur), `accuracy: player starts at the tapped quote (${cur} vs ${side.rows[0].time})`);
  const sec = (t) => t.split(":").reduce((x, n) => x * 60 + +n, 0);
  log(sec(cur) < sec(tot), `accuracy: clip time inside the interview (${cur} of ${tot})`);
  await ctx.close();
}

// 3. Motion: only transform and opacity animate; reduced motion is static; frames are smooth.
{
  const ctx = await b.newContext({ viewport: { width: 560, height: 760 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/dialogue/live`, { waitUntil: "networkidle" });
  await p.evaluate(() => { window.__props = new Set(); window.__trans = new Set();
    const grab = () => { for (const a of document.getAnimations()) { if (!a.effect?.target?.closest?.(".dlg-live")) continue;
      if (a.transitionProperty) window.__trans.add(a.transitionProperty);
      if (!a.transitionProperty) for (const k of a.effect.getKeyframes()) for (const prop of Object.keys(k)) if (!["offset", "easing", "composite", "computedOffset"].includes(prop)) window.__props.add(prop); }
      requestAnimationFrame(grab); }; grab(); });
  await p.click('[data-target="ask"]'); await p.waitForSelector('[data-stage="answered"]', { timeout: 20000 });
  await p.click('[data-target="side"]'); await p.waitForTimeout(300); await p.click(".dlg-live__sample .dp-clip-quote"); await p.waitForTimeout(400);
  const props = await p.evaluate(() => [...window.__props]);
  const trans = await p.evaluate(() => [...window.__trans]);
  // Motion (keyframe animations) may only move transform and opacity; filter is tw-animate's identity blur(0).
  const bad = props.filter((x) => !["transform", "opacity", "filter", "rotate"].includes(x));
  log(bad.length === 0, `motion: keyframed motion is compositor-only (${props.join(", ") || "none"})`);
  // Interaction transitions are Dialogue's transition-colors (150 ms): paint-only, never layout.
  const layout = trans.filter((x) => /^(width|height|top|left|right|bottom|inset|gap|font-size|line-height)$|^(margin|padding)(-|$)|^(min|max)-(width|height)$/.test(x));
  log(layout.length === 0, `motion: hover and press transitions are paint-only (${trans.join(", ") || "none"})`);
  // filter is the identity blur(0) in tw-animate `enter`; it stays because it is Dialogue's real keyframe.
  const wc = await p.evaluate(() => [...document.querySelectorAll(".dlg-live *")].filter((e) => getComputedStyle(e).willChange !== "auto").length);
  log(wc <= 2, `motion: will-change used sparingly (${wc} elements)`);
  await ctx.close();
  const rctx = await b.newContext({ viewport: { width: 560, height: 760 }, reducedMotion: "reduce" });
  const rp = await rctx.newPage(); await rp.goto(`${base}/dialogue/live`, { waitUntil: "networkidle" });
  await rp.click('[data-target="ask"]'); await rp.waitForTimeout(2000);
  const running = await rp.evaluate(() => document.getAnimations().filter((a) => a.effect?.target?.closest?.(".dlg-live")).length);
  log(running === 0, `motion: no animations under prefers-reduced-motion (${running} running)`);
  await rctx.close();
}
// Rendered text in the demo videos: smallest stage font x stage zoom x (video width on the page / 519 css px recorded), at 1440.
{
  const ctx = await b.newContext({ viewport: { width: 640, height: 680 } }); const p = await ctx.newPage();
  const minFont = {};
  for (const d of ["hero", "side", "clip", "before", "every", "picker", "toggles", "thin"]) {
    await p.goto(`${base}/dialogue/motion?demo=${d}`, { waitUntil: "load" });
    // Every demo's full end state: open everything the storyboard opens.
    await p.evaluate(() => { const a = window.__dlg; try { a.answer?.(); a.side?.(true); a.clip?.(true); a.pause?.(); a.deep?.(); } catch {} });
    await p.waitForTimeout(700);
    minFont[d] = await p.evaluate(() => { let m = 99; const z = Number(document.querySelector("[data-zoom]").dataset.zoom);
      document.querySelectorAll("#frame *").forEach((e) => { const r = e.getBoundingClientRect(); if (!r.width || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
        if (e.closest("[aria-hidden='true'], .dp-qplayer__video, video")) return; m = Math.min(m, parseFloat(getComputedStyle(e).fontSize) * z); }); return m; });
  }
  await ctx.close();
  const NAME = { "live-hero-ask": "hero", "live-side": "side", "live-clip": "clip", "variant-before-full": "before", "variant-every-full": "every", "variant-picker-full": "picker", "variant-toggles-full": "toggles", "live-thin": "thin" };
  const c2 = await b.newContext({ viewport: { width: 1440, height: 900 } }); const q = await c2.newPage();
  await q.goto(`${base}/dialogue`, { waitUntil: "networkidle" });
  const shown = await q.evaluate(() => [...document.querySelectorAll(".dlg-demo__video")].map((v) => [v.getAttribute("poster").split("/").pop().replace(".jpg", "").replace(/-dark$/, ""), v.getBoundingClientRect().width]));
  for (const [n, w] of shown) { const px = minFont[NAME[n]] * (w / 519); log(px >= 12, `motion: smallest text in ${n} renders at ${px.toFixed(1)}px on the page at 1440 (at least 12)`); }
  await c2.close();
}
await b.close();

// 4. The shipped demo videos against the motion checklist (design/TASTE.md "Motion"; scripts/check-dialogue-motion.py):
// length 4-9 s, no frame jump over 20, holds of at most 2 s mid-video, a 1-1.9 s final hold, a loop that closes.
{
  const vids = ["live-hero-ask", "live-side", "live-clip", "variant-before-full", "variant-every-full", "variant-picker-full", "variant-toggles-full", "live-thin"].map((n) => `public/dialogue/motion/${n}.mp4`);
  let out = "";
  try { out = execFileSync("python3", ["scripts/check-dialogue-motion.py", ...vids], { stdio: "pipe" }).toString(); }
  catch (e) { out = e.stdout?.toString() || ""; }
  const rows = out.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  log(rows.length === vids.length, `motion: checklist ran on ${rows.length} of ${vids.length} videos`);
  for (const r of rows) {
    const failed = Object.entries(r.checks).filter(([, v]) => !v).map(([k]) => k);
    log(failed.length === 0, `motion: ${r.video} ${r.seconds}s, max jump ${r.max_frame_diff}, mid hold ${r.longest_mid_hold_s}s, final hold ${r.final_hold_s}s, loop diff ${r.first_last_diff}${failed.length ? " FAILS " + failed.join(", ") : ""}`);
  }
}

console.log(fails ? `\n${fails} FAILED` : "\nverify-dialogue-p10 OK");
process.exit(fails ? 1 : 0);
