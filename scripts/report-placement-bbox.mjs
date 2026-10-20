#!/usr/bin/env node
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
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
const PLACEMENT_COMPOSITION_WIDTH = PLACEMENT_LAYOUT_WIDTH * PLACEMENT_COMPOSITION_SCALE;
const PLACEMENT_COMPOSITION_HEIGHT = PLACEMENT_LAYOUT_HEIGHT * PLACEMENT_COMPOSITION_SCALE;
const PLACEMENT_TILE_MARGIN_LEFT = PLACEMENT_TILE_MARGIN_X;
const PLACEMENT_TILE_MARGIN_TOP = PLACEMENT_TILE_MARGIN_Y;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BG = { r: 246, g: 244, b: 241 };
const TOL = 10;

function isBg(r, g, b) {
  return (
    Math.abs(r - BG.r) <= TOL &&
    Math.abs(g - BG.g) <= TOL &&
    Math.abs(b - BG.b) <= TOL
  );
}

async function measure(file) {
  const { data, info } = await sharp(path.join(root, file))
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rowFg = new Array(height).fill(0);
  const colFg = new Array(width).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (!isBg(data[i], data[i + 1], data[i + 2])) {
        rowFg[y]++;
        colFg[x]++;
      }
    }
  }
  const rowThresh = width * 0.02;
  const colThresh = height * 0.02;
  let minY = height;
  let maxY = 0;
  let minX = width;
  let maxX = 0;
  for (let y = 0; y < height; y++) {
    if (rowFg[y] > rowThresh) {
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  for (let x = 0; x < width; x++) {
    if (colFg[x] > colThresh) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }
  const subjectW = maxX - minX + 1;
  const subjectH = maxY - minY + 1;
  return {
    file,
    margins: { L: minX, T: minY, R: width - 1 - maxX, B: height - 1 - maxY },
    subjectW,
    subjectH,
    widthPct: Math.round((subjectW / width) * 1000) / 10,
    heightPct: Math.round((subjectH / height) * 1000) / 10,
  };
}

const codeTarget = {
  margins: {
    L: Math.round(PLACEMENT_TILE_MARGIN_LEFT),
    T: Math.round(PLACEMENT_TILE_MARGIN_TOP),
    R: Math.round(PLACEMENT_TILE_MARGIN_LEFT),
    B: Math.round(PLACEMENT_TILE_MARGIN_TOP),
  },
  subjectW: Math.round(PLACEMENT_COMPOSITION_WIDTH),
  subjectH: Math.round(PLACEMENT_COMPOSITION_HEIGHT),
  widthPct: Math.round((PLACEMENT_COMPOSITION_WIDTH / PLACEMENT_TILE_WIDTH) * 1000) / 10,
  heightPct: Math.round((PLACEMENT_COMPOSITION_HEIGHT / PLACEMENT_TILE_HEIGHT) * 1000) / 10,
};

const measured = [];
for (const file of ["public/dialogue/section-6b.png", "public/dialogue/section-6.png"]) {
  measured.push(await measure(file));
}

console.log(JSON.stringify({ codeTarget, measured }, null, 2));
