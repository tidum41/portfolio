#!/usr/bin/env node
/**
 * Placement rasters: distinct crops from frame-alan, interview-frame, frame-philena.
 * Light privacy blur — identity hidden, hair/skin/background remain visible.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/dialogue/placement");
const sourceDir = path.join(root, "public/dialogue/source");

const FRAMES = {
  alan: path.join(sourceDir, "frame-alan.png"),
  jordan: path.join(sourceDir, "interview-frame.png"),
  philena: path.join(sourceDir, "frame-philena.png"),
};

const dialogueMarkSrc = path.join(root, "public/images/about/logos/dialogue-ai.avif");

fs.mkdirSync(outDir, { recursive: true });

/** Enough to obscure identity, not enough to gray out the frame. */
const AVATAR_BLUR = 2.2;
const CLIP_BLUR = 1.6;

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

async function clipFrom(src, region, outName) {
  const buf = await sharp(src)
    .extract(region)
    .resize(320, 180, { fit: "cover" })
    .blur(CLIP_BLUR)
    .webp({ quality: 90 })
    .toBuffer();
  await sharp(buf).toFile(path.join(outDir, outName));
  console.log("wrote", outName);
}

async function main() {
  for (const p of Object.values(FRAMES)) {
    if (!fs.existsSync(p)) throw new Error(`Missing source frame: ${p}`);
  }

  // Jordan M. — Alan (frame 1) webcam feed
  await avatarFrom(FRAMES.alan, { left: 1410, top: 830, width: 240, height: 175 }, "avatar-jordan.webp");
  // Moderator — Philena (frame 3) webcam feed
  await avatarFrom(FRAMES.philena, { left: 1390, top: 810, width: 250, height: 180 }, "avatar-moderator.webp");

  // Clips: interview UI + PiP inset (one frame each)
  await clipFrom(FRAMES.jordan, { left: 380, top: 120, width: 1480, height: 720 }, "clip-1.webp");
  await clipFrom(FRAMES.alan, { left: 1080, top: 620, width: 780, height: 520 }, "clip-2.webp");
  await clipFrom(FRAMES.philena, { left: 1020, top: 580, width: 860, height: 560 }, "clip-3.webp");

  fs.copyFileSync(path.join(outDir, "avatar-jordan.webp"), path.join(outDir, "avatar-participant.webp"));

  await sharp(dialogueMarkSrc)
    .resize(64, 64, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, "dialogue-mark.png"));
  console.log("wrote dialogue-mark.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
