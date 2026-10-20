#!/usr/bin/env node
/**
 * Pixel-check that placement export uses interview-frame v2 (not v1) and that
 * floating + docked players render the same crop.
 *
 * Usage: node scripts/verify-placement-player-still.mjs [--base=http://localhost:3000]
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base =
  process.argv.find((a) => a.startsWith("--base="))?.slice("--base=".length) ??
  "http://localhost:3000";

const STILL = path.join(root, "public/dialogue/source/interview-frame.png");
const V1 = path.join(root, "scripts/fixtures/dialogue-interview-frame-v1.png");

async function simulateContain(framePath, width, height, letterbox = { r: 223, g: 223, b: 218 }) {
  const { width: iw, height: ih } = await sharp(framePath).metadata();
  const scale = Math.min(width / iw, height / ih);
  const dw = Math.round(iw * scale);
  const dh = Math.round(ih * scale);
  const ox = Math.round((width - dw) / 2);
  const oy = Math.round((height - dh) / 2);
  const resized = await sharp(framePath).resize(dw, dh).raw().toBuffer();
  const out = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      if (x >= ox && x < ox + dw && y >= oy && y < oy + dh) {
        const sx = x - ox;
        const sy = y - oy;
        const j = (sy * dw + sx) * 3;
        out[i] = resized[j];
        out[i + 1] = resized[j + 1];
        out[i + 2] = resized[j + 2];
      } else {
        out[i] = letterbox.r;
        out[i + 1] = letterbox.g;
        out[i + 2] = letterbox.b;
      }
    }
  }
  return out;
}

function mse(a, b) {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += (a[i] - b[i]) ** 2;
  return s / n;
}

/** High-frequency energy in the greeting band (lower = more blurred). */
async function greetingSharpness(pngBuf) {
  const meta = await sharp(pngBuf).metadata();
  const { data, info } = await sharp(pngBuf)
    .extract({
      left: Math.round(meta.width * 0.12),
      top: Math.round(meta.height * 0.08),
      width: Math.round(meta.width * 0.55),
      height: Math.round(meta.height * 0.35),
    })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  let grad = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const g = data[i];
      grad +=
        Math.abs(g - data[i + 1]) +
        Math.abs(g - data[i - 1]) +
        Math.abs(g - data[i + w]) +
        Math.abs(g - data[i - w]);
      n++;
    }
  }
  return grad / n;
}

async function capturePlayerVideo(baseUrl, variant) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await page.goto(`${baseUrl}/dev/dialogue-placement-export/${variant}`, {
    waitUntil: "networkidle",
  });
  const src = await page.evaluate(() => {
    const img = document.querySelector('img[data-dialogue-placement-still="true"]');
    return img?.getAttribute("src") ?? null;
  });
  if (!src?.includes("interview-frame")) {
    throw new Error(`${variant}: unexpected still src ${src}`);
  }
  await page.waitForFunction(() => {
    const img = document.querySelector('img[data-dialogue-placement-still="true"]');
    return img instanceof HTMLImageElement && img.complete && img.naturalWidth >= 1900;
  });
  const videoBox = await page.locator('img[data-dialogue-placement-still="true"]').boundingBox();
  if (!videoBox) throw new Error(`${variant}: no video box`);
  const shot = await page
    .locator('img[data-dialogue-placement-still="true"]')
    .locator("xpath=ancestor::div[1]")
    .screenshot({ type: "png" });
  await browser.close();
  const w = Math.round(videoBox.width);
  const h = Math.round(videoBox.height);
  const resized = await sharp(shot).resize(w, h).raw().toBuffer();
  return { variant, w, h, png: shot, raw: resized, src };
}

const PLACEMENT_TILE_WIDTH = 1600;
const PLACEMENT_TILE_HEIGHT = 1200;
const PLACEMENT_TILE_MARGIN_X = 80;
const PLACEMENT_TILE_MARGIN_Y = 60;
const PLACEMENT_SUBJECT_BOX_WIDTH = PLACEMENT_TILE_WIDTH - PLACEMENT_TILE_MARGIN_X * 2;
const PLACEMENT_SUBJECT_BOX_HEIGHT = PLACEMENT_TILE_HEIGHT - PLACEMENT_TILE_MARGIN_Y * 2;
const PLACEMENT_LAYOUT_HEIGHT = 740;
const PLACEMENT_LAYOUT_WIDTH = Math.round(
  (PLACEMENT_SUBJECT_BOX_WIDTH / PLACEMENT_SUBJECT_BOX_HEIGHT) * PLACEMENT_LAYOUT_HEIGHT,
);
const PLACEMENT_COMPOSITION_SCALE = Math.min(
  PLACEMENT_SUBJECT_BOX_WIDTH / PLACEMENT_LAYOUT_WIDTH,
  PLACEMENT_SUBJECT_BOX_HEIGHT / PLACEMENT_LAYOUT_HEIGHT,
);
const PLACEMENT_TILE_MARGIN_LEFT = PLACEMENT_TILE_MARGIN_X;
const PLACEMENT_TILE_MARGIN_TOP = PLACEMENT_TILE_MARGIN_Y;
const STUDY_PLAYER_BLOCK_TOP = 61 + 1 + 12;
const PLAYER_BODY_WIDTH = 687 - 32; // PLACEMENT_STUDY_WIDTH_DOCKED - pad*2
const PLAYER_VIDEO_HEIGHT = 164;

async function cropPlayerFromTile(tilePath) {
  const left = Math.round(PLACEMENT_TILE_MARGIN_LEFT + PLACEMENT_COMPOSITION_SCALE * 16);
  const top = Math.round(PLACEMENT_TILE_MARGIN_TOP + PLACEMENT_COMPOSITION_SCALE * STUDY_PLAYER_BLOCK_TOP);
  const width = Math.round(PLACEMENT_COMPOSITION_SCALE * PLAYER_BODY_WIDTH);
  const height = Math.round(PLACEMENT_COMPOSITION_SCALE * PLAYER_VIDEO_HEIGHT);
  const raw = await sharp(tilePath)
    .extract({ left, top, width, height })
    .resize(width, height)
    .raw()
    .toBuffer();
  const png = await sharp(tilePath).extract({ left, top, width, height }).png().toBuffer();
  return { raw, png, w: width, h: height };
}

async function verifyTilePair(floatPath, dockPath, v1Path) {
  const f = await cropPlayerFromTile(floatPath);
  const d = await cropPlayerFromTile(dockPath);
  if (f.raw.length !== d.raw.length) throw new Error("exported tiles: player crop size mismatch");
  const pairMse = mse(f.raw, d.raw);
  if (pairMse > 4) {
    throw new Error(`exported section-6 vs 6b player MSE ${pairMse.toFixed(2)}`);
  }
  const v1Tile = await simulateContain(v1Path, f.w, f.h);
  const v2Tile = await simulateContain(STILL, f.w, f.h);
  const v1TileMse = mse(f.raw, v1Tile);
  const v2TileMse = mse(f.raw, v2Tile);
  if (v1TileMse <= v2TileMse * 1.05) {
    throw new Error(`exported tile closer to v1 than v2`);
  }
  const sharpCrop = await greetingSharpness(f.png);
  const sharpV1 = await greetingSharpness(
    await sharp(v1Path).resize(f.w, f.h, { fit: "contain", background: "#dfdfda" }).png().toBuffer()
  );
  if (sharpCrop >= sharpV1 * 0.85) {
    throw new Error(`exported tile greeting too sharp (${sharpCrop.toFixed(2)})`);
  }
  console.log(
    `  exported tiles player ${f.w}x${f.h} MSE float≡dock ${pairMse.toFixed(2)} (v1 ${v1TileMse.toFixed(0)} / v2 ${v2TileMse.toFixed(0)})`
  );
}

async function main() {
  if (!fs.existsSync(STILL)) {
    console.error("Missing", STILL);
    process.exit(1);
  }
  const v1Path = V1;
  if (!fs.existsSync(v1Path)) {
    const { execSync } = await import("child_process");
    fs.mkdirSync(path.dirname(v1Path), { recursive: true });
    execSync(`git show 200c3ae:public/dialogue/source/interview-frame.png > "${v1Path}"`, {
      cwd: root,
      stdio: "ignore",
    });
  }

  const floating = await capturePlayerVideo(base, "floating");
  const docked = await capturePlayerVideo(base, "docked");

  if (floating.raw.length !== docked.raw.length) {
    throw new Error("floating/docked player video dimensions differ");
  }
  const dockMse = mse(floating.raw, docked.raw);
  if (dockMse > 2) {
    throw new Error(`floating vs docked player MSE ${dockMse.toFixed(2)} (expected ~0)`);
  }

  const v1Expected = await simulateContain(v1Path, floating.w, floating.h);
  const v1Mse = mse(floating.raw, v1Expected);
  const v2Expected = await simulateContain(STILL, floating.w, floating.h);
  const v2Mse = mse(floating.raw, v2Expected);
  if (v1Mse <= v2Mse * 1.05) {
    throw new Error(
      `player closer to v1 than v2 (MSE v1=${v1Mse.toFixed(1)} v2=${v2Mse.toFixed(1)})`
    );
  }

  const sharpV2 = await greetingSharpness(floating.png);
  const sharpV1 = await greetingSharpness(
    await sharp(v1Path).resize(floating.w, floating.h).png().toBuffer()
  );
  if (sharpV2 >= sharpV1 * 0.85) {
    throw new Error(
      `greeting band too sharp (${sharpV2.toFixed(2)} vs v1 ${sharpV1.toFixed(2)}); text may be readable`
    );
  }

  console.log("OK placement still pixel check");
  console.log(`  src: ${floating.src}`);
  console.log(`  video: ${floating.w}x${floating.h}`);
  console.log(`  floating≡docked MSE: ${dockMse.toFixed(3)}`);
  console.log(`  vs v2 contain MSE: ${v2Mse.toFixed(2)}`);
  console.log(`  vs v1 contain MSE: ${v1Mse.toFixed(2)}`);
  console.log(`  greeting sharpness v2 crop: ${sharpV2.toFixed(2)} (v1 ref ${sharpV1.toFixed(2)})`);

  const floatTile = path.join(root, "public/dialogue/section-6.png");
  const dockTile = path.join(root, "public/dialogue/section-6b.png");
  if (fs.existsSync(floatTile) && fs.existsSync(dockTile)) {
    await verifyTilePair(floatTile, dockTile, v1Path);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
