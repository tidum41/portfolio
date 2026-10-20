#!/usr/bin/env node
/**
 * Placement rasters from gitignored raw frames → public/dialogue/placement only.
 * Never commit unblurred sources under public/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/dialogue/placement");
const rawDir = path.join(root, "private/dialogue-placement-raw");
const blurredStill = path.join(root, "public/dialogue/source/interview-frame.png");

const FRAMES = {
  alan: path.join(rawDir, "frame-alan.png"),
  philena: path.join(rawDir, "frame-philena.png"),
  jordan: blurredStill,
};

fs.mkdirSync(outDir, { recursive: true });

const AVATAR_BLUR = 2.2;
const CLIP_BLUR = 2.2;

async function avatarFrom(src, region, outName) {
  const buf = await sharp(src)
    .extract(region)
    .resize(96, 96, { fit: "cover" })
    .blur(AVATAR_BLUR)
    .webp({ quality: 90 })
    .toBuffer();
  await sharp(buf).toFile(path.join(outDir, outName));
  console.log("wrote", outName);
}

async function clipFrom(src, region, outName, extraBlur = 0) {
  let pipeline = sharp(src).extract(region).resize(320, 180, { fit: "cover" }).blur(CLIP_BLUR);
  if (extraBlur > 0) pipeline = pipeline.blur(extraBlur);
  const buf = await pipeline.webp({ quality: 90 }).toBuffer();
  await sharp(buf).toFile(path.join(outDir, outName));
  console.log("wrote", outName);
}

async function main() {
  for (const [key, p] of Object.entries(FRAMES)) {
    if (!fs.existsSync(p)) {
      throw new Error(
        `Missing ${key} frame at ${p}. Copy raw PNGs to private/dialogue-placement-raw/ (gitignored).`,
      );
    }
  }

  await avatarFrom(FRAMES.alan, { left: 1410, top: 830, width: 240, height: 175 }, "avatar-jordan.webp");
  await avatarFrom(FRAMES.philena, { left: 1390, top: 810, width: 250, height: 180 }, "avatar-moderator.webp");

  await clipFrom(FRAMES.jordan, { left: 380, top: 120, width: 1480, height: 720 }, "clip-1.webp");
  await clipFrom(FRAMES.alan, { left: 1080, top: 620, width: 780, height: 520 }, "clip-2.webp");
  await clipFrom(
    FRAMES.philena,
    { left: 1020, top: 580, width: 860, height: 560 },
    "clip-3.webp",
    1.2,
  );

  fs.copyFileSync(path.join(outDir, "avatar-jordan.webp"), path.join(outDir, "avatar-participant.webp"));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
