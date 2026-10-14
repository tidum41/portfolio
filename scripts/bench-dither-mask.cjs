/**
 * Profile one theme-transition mask frame (draw + toDataURL + style inject).
 *
 * Usage (dev server running):
 *   node scripts/bench-dither-mask.cjs
 *   node scripts/bench-dither-mask.cjs --out before.json
 */
const { chromium } = require("playwright");
const fs = require("fs");

const VIEW_W = Number(process.env.BENCH_VIEW_W || 1440);
const VIEW_H = Number(process.env.BENCH_VIEW_H || 900);
const outIdx = process.argv.indexOf("--out");
const outPath = outIdx >= 0 ? process.argv[outIdx + 1] : null;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: VIEW_W, height: VIEW_H });
  await page.goto("about:blank");

  const mode = process.argv.includes("--optimized") ? "optimized" : "legacy";

  const result = await page.evaluate((benchMode) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const origin = { x: w - 48, y: 48 };
    const progress = 0.45;
    const samples = 12;
    const drawMs = [];
    const encodeMs = [];
    const totalMs = [];

    const BAYER_8 = [
      [0, 32, 8, 40, 2, 34, 10, 42],
      [48, 16, 56, 24, 50, 18, 58, 26],
      [12, 44, 4, 36, 14, 46, 6, 38],
      [60, 28, 52, 20, 62, 30, 54, 22],
      [3, 35, 11, 43, 1, 33, 9, 41],
      [51, 19, 59, 27, 49, 17, 57, 25],
      [15, 47, 7, 39, 13, 45, 5, 37],
      [63, 31, 55, 23, 61, 29, 53, 21],
    ];
    const bayerThreshold = (tx, ty) => BAYER_8[ty & 7][tx & 7] / 64;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.imageSmoothingEnabled = false;
    const cell = w <= 480 ? 5 : 6;
    const tilesX = Math.ceil(w / cell);
    const tilesY = Math.ceil(h / cell);
    const maxDist = Math.hypot(w, h);

    let thresholdMap = null;
    let smallCanvas = null;
    let smallCtx = null;
    let smallImage = null;
    if (benchMode === "optimized") {
      thresholdMap = new Uint8Array(tilesX * tilesY);
      for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
          let threshold = bayerThreshold(tx, ty);
          const cx = (tx + 0.5) * cell;
          const cy = (ty + 0.5) * cell;
          const dist = Math.hypot(cx - origin.x, cy - origin.y) / maxDist;
          threshold = threshold * 0.62 + dist * 0.38;
          thresholdMap[ty * tilesX + tx] = Math.min(255, Math.floor(threshold * 256));
        }
      }
      smallCanvas = document.createElement("canvas");
      smallCanvas.width = tilesX;
      smallCanvas.height = tilesY;
      smallCtx = smallCanvas.getContext("2d", { alpha: true });
      smallImage = smallCtx.createImageData(tilesX, tilesY);
    }

    for (let s = 0; s < samples; s++) {
      const t0 = performance.now();
      if (benchMode === "legacy") {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#fff";
        for (let ty = 0; ty < tilesY; ty++) {
          for (let tx = 0; tx < tilesX; tx++) {
            let threshold = bayerThreshold(tx, ty);
            const cx = (tx + 0.5) * cell;
            const cy = (ty + 0.5) * cell;
            const dist = Math.hypot(cx - origin.x, cy - origin.y) / maxDist;
            threshold = threshold * 0.62 + dist * 0.38;
            if (threshold < progress) {
              ctx.fillRect(tx * cell, ty * cell, cell, cell);
            }
          }
        }
      } else {
        const cutoff = Math.min(255, Math.floor(progress * 256));
        const data = smallImage.data;
        for (let i = 0; i < thresholdMap.length; i++) {
          const on = thresholdMap[i] < cutoff;
          const v = on ? 255 : 0;
          const o = i * 4;
          data[o] = v;
          data[o + 1] = v;
          data[o + 2] = v;
          data[o + 3] = 255;
        }
        smallCtx.putImageData(smallImage, 0, 0);
      }
      const t1 = performance.now();
      const url =
        benchMode === "legacy"
          ? canvas.toDataURL("image/png")
          : smallCanvas.toDataURL("image/png");
      const t2 = performance.now();
      const style = document.createElement("style");
      style.textContent = `::view-transition-new(root){mask-image:url("${url}");}`;
      document.head.appendChild(style);
      void style.sheet;
      style.remove();
      const t3 = performance.now();
      drawMs.push(t1 - t0);
      encodeMs.push(t2 - t1);
      totalMs.push(t3 - t0);
    }

    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const max = (a) => a.reduce((x, y) => Math.max(x, y), 0);
    return {
      mode: benchMode,
      viewport: { w, h },
      cell,
      tiles: { x: tilesX, y: tilesY },
      maskPixels: benchMode === "legacy" ? w * h : tilesX * tilesY,
      samples,
      avgDrawMs: avg(drawMs),
      avgEncodeMs: avg(encodeMs),
      avgTotalMs: avg(totalMs),
      maxTotalMs: max(totalMs),
      estFpsCap: 1000 / avg(totalMs),
    };
  }, mode);

  await browser.close();
  console.log(JSON.stringify(result, null, 2));
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
