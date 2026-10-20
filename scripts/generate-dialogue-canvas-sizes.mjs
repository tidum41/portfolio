#!/usr/bin/env node
/**
 * Writes lib/caseStudies/dialogueCanvasSizes.json from public/dialogue PNGs.
 * Re-run when dialogue case study images change.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Keep in sync with lib/caseStudies/dialogueCanvas.ts image srcs */
const SRCS = [
  "/dialogue/hero.png",
  "/dialogue/section-1-before.png",
  "/dialogue/section-1-after.png",
  "/dialogue/alt-a.png",
  "/dialogue/alt-b.png",
  "/dialogue/alt-c.png",
  "/dialogue/section-4.png",
  "/dialogue/section-3.png",
  "/dialogue/section-2.png",
  "/dialogue/section-5.png",
  "/dialogue/section-imperfect.png",
  "/dialogue/section-share.png",
  "/dialogue/section-6b.png",
  "/dialogue/section-6.png",
  "/dialogue/section-7.png",
];

const evidenceDir = path.join(root, "public/dialogue/evidence-lab");
if (fs.existsSync(evidenceDir)) {
  for (const f of fs.readdirSync(evidenceDir).sort()) {
    if (/\.(png|jpe?g|webp|avif)$/i.test(f)) {
      SRCS.push(`/dialogue/evidence-lab/${f}`);
    }
  }
}

const out = {};
for (const src of SRCS) {
  const filePath = path.join(root, "public", src.replace(/^\//, ""));
  const meta = await sharp(filePath).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Missing dimensions for ${src}`);
  }
  out[src] = { width: meta.width, height: meta.height };
}

const dest = path.join(root, "lib/caseStudies/dialogueCanvasSizes.json");
fs.writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${Object.keys(out).length} sizes to ${path.relative(root, dest)}`);
