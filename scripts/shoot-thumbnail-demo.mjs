import { chromium } from "playwright";
import { mkdir, readdir, rename, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const exec = promisify(execFile);
const OUT = "/Users/m/portfolio-review/.paper-tmp/thumbnail-demo";
const BASE = "http://localhost:3107/dev/dialogue-thumbnail";
const IDS = ["product", "story", "tight"];
const PAPER = "/Users/m/portfolio-review/.paper-tmp/exports/card3/option-3@2x.png";
const SIDE_MP4 = "/Users/m/portfolio-review/public/dialogue/motion/live-side.mp4";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

async function decorate(page, theme = "light") {
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.removeAttribute("data-intro");
    for (const el of document.querySelectorAll("body *")) {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (s.position === "fixed" && r.width >= 220 && r.height >= 200 && (r.left > 900 || r.right < 80)) {
        el.style.setProperty("display", "none", "important");
      }
    }
  }, theme);
}

async function open(url, theme = "light", viewport = { width: 1440, height: 1100 }) {
  const page = await browser.newPage({
    viewport,
    reducedMotion: "no-preference",
    colorScheme: theme,
  });
  await page.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch {} }, theme);
  await page.goto(url, { waitUntil: "networkidle" });
  await decorate(page, theme);
  await page.waitForSelector("[data-demo-frame] .dlg-thumb, .dlg-thumb, #frame", { timeout: 60000 });
  return page;
}

async function captureBeats(page, id, wanted) {
  const frame = page.locator("[data-demo-frame]");
  const seen = new Set();
  const t0 = Date.now();
  while (seen.size < wanted.length && Date.now() - t0 < 20000) {
    const beat = await page.evaluate(() => {
      const t = document.querySelector("[data-demo-frame] .dlg-thumb");
      return t ? `${t.getAttribute("data-beat")}|${t.getAttribute("data-side")}` : "";
    });
    const [b] = beat.split("|");
    if (wanted.includes(b) && !seen.has(b)) {
      if (b === "unsure" || b === "hover-unsure" || b === "hover-friday") await page.waitForTimeout(80);
      await frame.screenshot({ path: path.join(OUT, `${id}-${b}-v2.png`) });
      seen.add(b);
    }
    await page.waitForTimeout(40);
  }
  console.log(id, [...seen].join(","));
  if (seen.size < wanted.length) throw new Error(`${id} missed ${wanted.filter((w) => !seen.has(w)).join(",")}`);
}

const poster = await open(`${BASE}?poster=1`);
await poster.locator("[data-demo-frame]").screenshot({ path: path.join(OUT, "poster-light-v2.png") });
await poster.locator("[data-card-frame]").screenshot({ path: path.join(OUT, "poster-card-chrome-light-v2.png") });

const metrics = await poster.evaluate(() => {
  const q = (s) => document.querySelector("[data-demo-frame] " + s);
  const cs = (el, p) => (el ? getComputedStyle(el)[p] : null);
  const card = q(".dp-chart-viz-card");
  const title = q(".dp-chart-title");
  const bar = q(".dp-chart-stack__bar");
  const lanes = q(".dp-chart-stack__lanes");
  const sources = q(".dp-sources");
  const quote = q(".dp-clip-quote");
  const pill = q(".dp-source-pill");
  const recede = q(".dp-chart-stack__seg:not([data-focal])");
  const r = (a, b) => (a && b ? +(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom).toFixed(2) : null);
  return {
    cardBg: cs(card, "backgroundColor"),
    cardRadius: cs(card, "borderRadius"),
    cardPad: cs(card, "padding"),
    cardShadow: cs(card, "boxShadow"),
    titleFs: cs(title, "fontSize"),
    titleLh: cs(title, "lineHeight"),
    barH: cs(bar, "height"),
    barGap: cs(bar, "gap"),
    lanesDir: cs(lanes, "flexDirection"),
    pillH: cs(pill, "height"),
    pillRadius: cs(pill, "borderRadius"),
    quotePad: cs(quote, "padding"),
    quoteRadius: cs(quote, "borderRadius"),
    recedeBg: cs(recede, "backgroundColor"),
    recedeShadow: cs(recede, "boxShadow"),
    gaps: {
      titleToBar: r(title, bar),
      barToLanes: r(bar, lanes),
      lanesToSources: r(lanes, sources),
      sourcesToQuote: r(sources, quote),
    },
    quote: q(".dp-clip-quote__text")?.textContent,
    title: title?.textContent,
  };
});
await writeFile(path.join(OUT, "metrics-v2.json"), JSON.stringify(metrics, null, 2));
console.log("metrics", metrics);
await poster.close();

const posterBare = await open(`${BASE}?poster=1`);
await posterBare.evaluate(() => {
  const p = document.querySelector("[data-demo-frame] .dlg-thumb__preview");
  if (p) p.style.display = "none";
});
await posterBare.locator("[data-demo-frame]").screenshot({ path: path.join(OUT, "poster-nopreview-v2.png") });
await posterBare.close();

for (const id of IDS) {
  const page = await open(`${BASE}?variant=${id}`);
  await captureBeats(page, id, ["hover-unsure", "unsure", "hover-friday", "poster"]);
  await page.close();
}

for (const id of IDS) {
  const recDir = path.join(OUT, `rec-${id}-v2`);
  await mkdir(recDir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 760, height: 620 },
    recordVideo: { dir: recDir, size: { width: 760, height: 620 } },
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch {} });
  await p.goto(`${BASE}?variant=${id}`, { waitUntil: "networkidle" });
  await decorate(p, "light");
  await p.locator("[data-demo-frame]").scrollIntoViewIfNeeded();
  const timing = { product: 6500, story: 7500, tight: 4200 }[id];
  await p.waitForTimeout(timing * 2 + 1000);
  await ctx.close();
  const files = (await readdir(recDir)).filter((f) => f.endsWith(".webm"));
  if (files[0]) await rename(path.join(recDir, files[0]), path.join(OUT, `${id}-loop-v2.webm`));
}

const home = await browser.newPage({
  viewport: { width: 1440, height: 1600 },
  reducedMotion: "no-preference",
  colorScheme: "light",
});
await home.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch {} });
await home.goto("http://localhost:3107/", { waitUntil: "networkidle" });
await home.waitForTimeout(5500);
await decorate(home, "light");
const card = home.locator('[data-grid-card="project-dialogue"]');
if (await card.count()) {
  await card.scrollIntoViewIfNeeded();
  await home.waitForTimeout(800);
  await card.screenshot({ path: path.join(OUT, "homepage-dialogue-card-v2.png") });
  await home.screenshot({ path: path.join(OUT, "homepage-1440-light-v2.png") });
} else {
  await home.screenshot({ path: path.join(OUT, "homepage-1440-light-missing-card-v2.png") });
  console.log("missing homepage card");
}
await home.close();

// Cursor crop: render the exact case-study #dlg-cursor at 28px, and crop the thumbnail cursor.
const curPage = await browser.newPage({
  viewport: { width: 400, height: 200 },
  colorScheme: "light",
  reducedMotion: "no-preference",
});
await curPage.setContent(`<!doctype html><html><body style="margin:0;background:#f1eeea;display:flex;align-items:center;justify-content:center;height:100vh">
  <div id="dlg-cursor" style="width:28px;height:28px">
    <svg viewBox="0 0 18 18" width="28" height="28"><path d="M2 1.5v13l3.6-3.4 2.4 5.4 2.2-1-2.4-5.3h5z" fill="#1c1917" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>
  </div>
</body></html>`);
await curPage.locator("#dlg-cursor").screenshot({ path: path.join(OUT, "cursor-casestudy-asset-v2.png") });
await curPage.close();

const hoverPath = path.join(OUT, "product-hover-unsure-v2.png");
async function cropCursor(pngPath, outPath) {
  const img = sharp(pngPath);
  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // ink tip + white stroke of the 28px cursor
      const ink = r < 40 && g < 40 && b < 40;
      const white = r > 245 && g > 245 && b > 245;
      if (ink || (white && r < 40 === false && Math.abs(r - g) < 8 && r > 250)) {
        // only count near-black ink pixels to avoid quote cards
        if (ink) {
          found = true;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
  }
  if (!found) throw new Error(`no cursor ink in ${pngPath}`);
  const pad = 16;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const width = Math.min(w - left, maxX - minX + 1 + pad * 2);
  const height = Math.min(h - top, maxY - minY + 1 + pad * 2);
  await sharp(pngPath).extract({ left, top, width, height }).png().toFile(outPath);
  return { left, top, width, height };
}

await cropCursor(hoverPath, path.join(OUT, "cursor-thumbnail-crop-v2.png"));

// Case-study cursor from the live-side take (a mid frame where the pointer is on the bar).
const sideFrame = path.join(OUT, "live-side-frame-v2.png");
await exec("ffmpeg", ["-y", "-ss", "1.2", "-i", SIDE_MP4, "-frames:v", "1", sideFrame]);
try {
  await cropCursor(sideFrame, path.join(OUT, "cursor-casestudy-crop-v2.png"));
} catch (err) {
  // Try a few more timestamps if the first miss lands on a still without the pointer.
  let ok = false;
  for (const t of ["0.8", "1.6", "2.2", "0.4", "2.8"]) {
    await exec("ffmpeg", ["-y", "-ss", t, "-i", SIDE_MP4, "-frames:v", "1", sideFrame]);
    try {
      await cropCursor(sideFrame, path.join(OUT, "cursor-casestudy-crop-v2.png"));
      ok = true;
      console.log("cursor frame at", t);
      break;
    } catch {}
  }
  if (!ok) {
    console.warn(String(err));
    await copyFile(path.join(OUT, "cursor-casestudy-asset-v2.png"), path.join(OUT, "cursor-casestudy-crop-v2.png"));
  }
}

async function labelSheet(images, labels, outPath, cell = 200) {
  const pads = 24;
  const caption = 36;
  const resized = [];
  for (const pth of images) {
    const buf = await sharp(pth)
      .resize({ width: cell, height: cell, fit: "contain", background: { r: 241, g: 238, b: 234, alpha: 1 } })
      .png()
      .toBuffer();
    resized.push(buf);
  }
  const width = pads * 3 + cell * 2;
  const height = pads * 2 + caption + cell;
  const svg = Buffer.from(`<svg width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#f8f6f3"/>
    <text x="${pads}" y="28" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" fill="#1c1917">${labels[0]}</text>
    <text x="${pads * 2 + cell}" y="28" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" fill="#1c1917">${labels[1]}</text>
  </svg>`);
  await sharp(svg)
    .composite([
      { input: resized[0], left: pads, top: caption },
      { input: resized[1], left: pads * 2 + cell, top: caption },
    ])
    .png()
    .toFile(outPath);
}

await labelSheet(
  [path.join(OUT, "cursor-casestudy-crop-v2.png"), path.join(OUT, "cursor-thumbnail-crop-v2.png")],
  ["Case-study demo cursor", "Thumbnail demo cursor"],
  path.join(OUT, "cursor-compare-v2.png"),
  180,
);

// Paper vs code side-by-side of the panel field.
const paper = sharp(PAPER);
const paperMeta = await paper.metadata();
const codePanel = sharp(path.join(OUT, "poster-nopreview-v2.png"));
const codeMeta = await codePanel.metadata();
const targetH = 640;
const paperBuf = await sharp(PAPER)
  .resize({ height: targetH, fit: "inside" })
  .png()
  .toBuffer();
const codeBuf = await sharp(path.join(OUT, "poster-nopreview-v2.png"))
  .resize({ height: targetH, fit: "inside" })
  .png()
  .toBuffer();
const pInfo = await sharp(paperBuf).metadata();
const cInfo = await sharp(codeBuf).metadata();
const gap = 32;
const labelH = 48;
const width = pInfo.width + cInfo.width + gap * 3;
const height = Math.max(pInfo.height, cInfo.height) + labelH + gap * 2;
const header = Buffer.from(`<svg width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#f8f6f3"/>
  <text x="${gap}" y="36" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" fill="#1c1917">Paper option 3</text>
  <text x="${gap * 2 + pInfo.width}" y="36" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" fill="#1c1917">Code (v2 poster, no Preview)</text>
</svg>`);
await sharp(header)
  .composite([
    { input: paperBuf, left: gap, top: labelH },
    { input: codeBuf, left: gap * 2 + pInfo.width, top: labelH },
  ])
  .png()
  .toFile(path.join(OUT, "paper-vs-code-v2.png"));

console.log("composed paper-vs-code and cursor-compare");
await browser.close();
console.log("shot ok", "paper", paperMeta.width, paperMeta.height, "code", codeMeta.width, codeMeta.height);
