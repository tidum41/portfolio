// P10 verification gate: layout, accuracy, motion. Run before every push.
// usage: node scripts/verify-dialogue-p10.mjs [base-url] [frames-dir]
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright"); } catch { pw = req("@playwright/test"); }
const [, , base = "http://localhost:3207", framesDir = "/tmp/dlg-live-frames"] = process.argv;
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
    const head = document.querySelector(".dp-side-sample__head").innerText;
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
      for (const k of a.effect.getKeyframes()) for (const prop of Object.keys(k)) if (!["offset", "easing", "composite", "computedOffset"].includes(prop)) window.__props.add(prop); }
      requestAnimationFrame(grab); }; grab(); });
  await p.click('[data-target="ask"]'); await p.waitForSelector('[data-stage="answered"]', { timeout: 20000 });
  await p.click('[data-target="side"]'); await p.waitForTimeout(300); await p.click(".dlg-live__sample .dp-clip-quote"); await p.waitForTimeout(400);
  const props = await p.evaluate(() => [...window.__props, ...window.__trans]);
  const bad = props.filter((x) => !["transform", "opacity", "filter", "rotate"].includes(x));
  log(bad.length === 0, `motion: animated properties are compositor-only (${props.join(", ") || "none"})`);
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
await b.close();

// Frame analysis of the latest recording (record-dialogue-live.mjs): cadence, flashes, layout jumps.
if (existsSync(`${framesDir}/list.txt`)) {
  const out = execFileSync("python3", ["-c", `
import re,sys,numpy as np
from PIL import Image
L=open('${framesDir}/list.txt').read()
fs=re.findall(r"file '([^']+)'\\nduration ([\\d.]+)",L)
d=np.array([float(x) for _,x in fs])*1000
im=lambda p: np.asarray(Image.open(p).convert('L').resize((140,175)),dtype=np.float32)
A=[im(p) for p,_ in fs]
diff=[float(np.abs(A[i+1]-A[i]).mean()) for i in range(len(A)-1)]
flash=[i for i in range(1,len(A)-1) if np.abs(A[i-1]-A[i+1]).mean()<0.3 and diff[i-1]>2 and diff[i]>2]
# stutter: while something moves, frame gaps should stay near 16.7 ms
moving=[i for i in range(len(diff)) if 0.05<diff[i]<6]
gaps=[d[i] for i in moving]
p95=float(np.percentile(gaps,95)) if gaps else 0
print(f"{len(A)} {p95:.1f} {len(flash)} {','.join(map(str,flash[:8]))}")
`]).toString().trim().split(" ");
  const [n, p95, flashes, where] = out;
  log(+p95 <= 34, `motion: frame gap while moving, p95 ${p95} ms over ${n} frames (60 fps target, at most one dropped frame)`);
  log(+flashes === 0, `motion: no single-frame flashes (${flashes}${where ? " at " + where : ""})`);
} else log(false, `motion: no recording at ${framesDir}; run record-dialogue-live.mjs first`);

console.log(fails ? `\n${fails} FAILED` : "\nverify-dialogue-p10 OK");
process.exit(fails ? 1 : 0);
