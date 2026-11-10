// Round 18: frame-by-frame geometry audit of a motion take. Drives window.__dlg like the recorder and samples every animation
// frame: layout jumps (an element moving more than a scroll step without the body scrolling), overlapping rows, rows or
// text cut by the card edge on a held frame, odd gaps on a held frame, and fills that are not on the ramp.
// usage: node scripts/audit-dialogue-geom.mjs <base-url> <demo> [--json]
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright"); } catch { pw = req("@playwright/test"); }
const [, , base = "http://localhost:3000", demo = "every"] = process.argv;

const STEPS = {
  every: [["side('unsure')", 600], ["clip(true)", 0], ["stick(560, '.dp-side-sample__head', 12)", 2400], ["clip(false)", 0], ["up(500)", 2200]],
  toggles: [["level(1)", 1500], ["level(2)", 1800], ["level(0)", 2400]],
  side: [["side('unsure')", 2000], ["side('friday')", 2000]],
  hero: [["send()", 300], ["answer()", 900], ["ana()", 1800]],
  thin: [["thin()", 1800], ["ask()", 400], ["reply()", 2200]],
};

const b = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const page = await (await b.newContext({ viewport: { width: 1400, height: 1400 }, deviceScaleFactor: 1 })).newPage();
await page.goto(`${base}/dialogue/motion?demo=${demo}`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__dlg);
await page.addStyleTag({ content: "body > *:not(main), header, footer, nav { visibility: hidden !important; }" });
if (demo === "every") await page.evaluate(() => window.__dlg.side("unsure"));
await page.waitForTimeout(900);

await page.evaluate(() => {
  const body = document.querySelector(".dlg-stage__body"), card = document.querySelector(".dlg-stage");
  const log = []; let prev = null, idleSince = performance.now(), lastScroll = body.scrollTop, lastH = body.scrollHeight;
  const sel = [".dp-summary, .dlg-live .dp-text-body", ".dp-chart-stack__bar", ".dp-side-sample__head", ".dp-clip-quote", ".dlg-live__clip"];
  const snap = () => {
    const bt = body.getBoundingClientRect(), out = { t: performance.now(), st: body.scrollTop, sh: body.scrollHeight, els: [] };
    for (const s of sel) document.querySelectorAll(s).forEach((el, i) => {
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      out.els.push({ k: s + "#" + i, top: r.top - bt.top, bottom: r.bottom - bt.top, text: (el.textContent || "").trim().slice(0, 18), el });
    });
    out.bh = bt.height; return out;
  };
  const tick = () => {
    const s = snap();
    const moving = Math.abs(s.st - lastScroll) > 0.4 || Math.abs(s.sh - lastH) > 0.4; if (moving) idleSince = s.t;
    lastScroll = s.st; lastH = s.sh;
    const held = s.t - idleSince > 250;
    const f = { t: Math.round(s.t), held, st: Math.round(s.st), sh: Math.round(s.sh), jumps: [], overlaps: [], cut: [], gaps: [], fills: [] };
    if (prev) for (const e of s.els) { const p = prev.els.find((x) => x.k === e.k && x.text === e.text); if (!p) continue;
      const d = (e.top - p.top) + (s.st - prev.st); // movement not explained by the body's own scroll
      if (Math.abs(d) > 6) f.jumps.push(`${e.k} ${e.text} ${d.toFixed(0)}px`); }
    const rows = s.els.filter((e) => e.k.startsWith(".dp-clip-quote"));
    for (let i = 0; i + 1 < rows.length; i++) { const o = rows[i].bottom - rows[i + 1].top; if (o > 1) f.overlaps.push(`${rows[i].text} over ${rows[i + 1].text} by ${o.toFixed(0)}px`); if (held) f.gaps.push(Math.round(rows[i + 1].top - rows[i].bottom)); }
    if (held) for (const e of s.els) { if (e.k.startsWith(".dlg-live__clip")) continue; if (e.top < -1 && e.bottom > 1) f.cut.push(`${e.k} ${e.text} cut at top by ${(-e.top).toFixed(0)}px`); if (e.bottom > s.bh + 1 && e.top < s.bh - 1) f.cut.push(`${e.k} ${e.text} cut at bottom by ${(e.bottom - s.bh).toFixed(0)}px`); }
    const head = s.els.find((e) => e.k.startsWith(".dp-side-sample__head")); if (held && head) f.gaps.push(`headTop ${Math.round(head.top)}`);
    log.push(f); prev = s; requestAnimationFrame(tick);
  };
  window.__geom = log; requestAnimationFrame(tick);
});

const play = async (js, wait) => { await page.evaluate(`window.__dlg.${js}`); await page.waitForTimeout(wait); };
for (const [js, w] of STEPS[demo]) await play(js, w);
await page.waitForTimeout(400);
const log = await page.evaluate(() => window.__geom);
const fills = await page.evaluate(() => [...document.querySelectorAll(".dp-chart-stack__seg")].map((e) => getComputedStyle(e).backgroundColor));
await b.close();

const uniq = (a) => [...new Set(a)];
const jumps = uniq(log.flatMap((f) => f.jumps)), overlaps = uniq(log.flatMap((f) => f.overlaps)), cuts = uniq(log.filter((f) => f.held).flatMap((f) => f.cut));
const gaps = uniq(log.filter((f) => f.held).flatMap((f) => f.gaps.map(String)));
console.log(JSON.stringify({ demo, frames: log.length, jumps: jumps.slice(0, 20), overlaps: overlaps.slice(0, 10), heldCuts: cuts, heldGaps: gaps, segFills: fills }, null, 1));
