// Clip audit for /dialogue: nothing inside a figure may be cut by a clipping ancestor, at 1440, 390 and 360, light and dark.
// usage: node scripts/audit-dialogue-clip.mjs [base-url]      (npm run audit:dialogue-clip). Exit 1 if anything is clipped.
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright"); } catch { pw = req("@playwright/test"); }
const base = process.argv[2] ?? "http://localhost:3000"; let bad = 0;
const b = await pw.chromium.launch({ executablePath: "/usr/bin/google-chrome" });
for (const theme of ["light","dark"]) for (const w of [1440, 390, 360]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem("theme", t), theme);
  const page = await ctx.newPage();
  await page.goto(`${base}/dialogue`, { waitUntil: "networkidle" });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(800);
  const res = await page.evaluate(() => {
    const out = []; const docW = document.documentElement.scrollWidth;
    document.querySelectorAll("figure.cs-figure").forEach((fig, fi) => {
      fig.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
        if (el.closest("video, svg, picture, [aria-hidden='true']")) return;
        for (let a = el.parentElement; a && a !== fig.parentElement; a = a.parentElement) {
          const cs = getComputedStyle(a); const clip = cs.overflowX !== "visible" || cs.overflowY !== "visible";
          if (!clip) continue; const ar = a.getBoundingClientRect();
          const o = { l: ar.left - r.left, t: ar.top - r.top, r: r.right - ar.right, b: r.bottom - ar.bottom };
          const sc = (cs.overflowY === "auto" || cs.overflowY === "scroll") ;
          if (!sc && (o.l > 1.5 || o.t > 1.5 || o.r > 1.5 || o.b > 1.5)) out.push({ fig: fi, el: (el.className?.toString?.() || el.tagName).slice(0, 60), anc: (a.className?.toString?.() || a.tagName).slice(0, 50), o: Object.values(o).map(Math.round).join("/") });
        }
      });
    });
    const sc=[]; document.querySelectorAll("figure.cs-figure *").forEach(e=>{const cs=getComputedStyle(e); if((cs.overflowY==='auto'||cs.overflowY==='scroll'||cs.overflowY==='hidden') && e.scrollHeight>e.clientHeight+1) sc.push((e.className?.toString?.()||e.tagName).slice(0,60)+" "+e.scrollHeight+">"+e.clientHeight);});
    return { docW, out: out.slice(0, 25).concat(sc.map(x=>({scroll:x}))), n: out.length+sc.length };
  });
  console.log(theme, w, "docW", res.docW, "clipped", res.n); for (const o of res.out) console.log("  ", JSON.stringify(o));
  bad += res.n; await ctx.close();
}
await b.close();
console.log(JSON.stringify({ summary: true, clipped: bad }));
process.exit(bad ? 1 : 0);
