#!/usr/bin/env node
/** Measures non-background bbox margins on placement PNGs (expects #F6F4F1). */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const BG = { r: 246, g: 244, b: 241 };
const TOLERANCE = 10;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function isBg(r, g, b) {
  return (
    Math.abs(r - BG.r) <= TOLERANCE &&
    Math.abs(g - BG.g) <= TOLERANCE &&
    Math.abs(b - BG.b) <= TOLERANCE
  );
}

async function measure(file) {
  const { data, info } = await sharp(path.join(root, file))
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (!isBg(r, g, b)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const margins = {
    L: minX,
    T: minY,
    R: width - 1 - maxX,
    B: height - 1 - maxY,
  };
  const subjectW = maxX - minX + 1;
  const subjectH = maxY - minY + 1;
  return {
    file,
    width,
    height,
    margins,
    subjectW,
    subjectH,
    widthPct: Math.round((subjectW / width) * 1000) / 10,
    heightPct: Math.round((subjectH / height) * 1000) / 10,
  };
}

const results = [];
for (const file of ["public/dialogue/section-6b.png", "public/dialogue/section-6.png"]) {
  results.push(await measure(file));
}
console.log(JSON.stringify(results, null, 2));
