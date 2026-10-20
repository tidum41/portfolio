#!/usr/bin/env node
/**
 * Raster assets for placement UI (blurred faces from interview-frame v2 only).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/dialogue/placement");
const source = path.join(root, "public/dialogue/source/interview-frame.png");
const dialogueMarkSrc = path.join(root, "public/images/about/logos/dialogue-ai.avif");

fs.mkdirSync(outDir, { recursive: true });

const EXTRA_BLUR = 6;

async function blurFace(buffer) {
  return sharp(buffer).blur(EXTRA_BLUR).webp({ quality: 88 }).toBuffer();
}

async function writeWebp(name, buffer) {
  const dest = path.join(outDir, name);
  await sharp(buffer).webp({ quality: 88 }).toFile(dest);
  console.log("wrote", path.relative(root, dest));
}

const WEBCAM_CROPS = {
  participant: { left: 1510, top: 505, width: 300, height: 215 },
  participantAlt: { left: 1495, top: 518, width: 280, height: 200 },
  clip1: { left: 1520, top: 512, width: 270, height: 190 },
  clip2: { left: 1505, top: 498, width: 290, height: 205 },
  clip3: { left: 1535, top: 528, width: 260, height: 185 },
};

async function main() {
  for (const [key, region] of Object.entries(WEBCAM_CROPS)) {
    const raw = await sharp(source).extract(region).resize(160, 120, { fit: "cover" }).toBuffer();
    const blurred = await blurFace(raw);
    const file =
      key === "participant"
        ? "avatar-participant.webp"
        : key === "participantAlt"
          ? "avatar-moderator.webp"
          : `clip-${key.replace("clip", "")}.webp`;
    await writeWebp(file, blurred);
  }

  await sharp(dialogueMarkSrc)
    .resize(64, 64, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, "dialogue-mark.png"));
  console.log("wrote public/dialogue/placement/dialogue-mark.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
