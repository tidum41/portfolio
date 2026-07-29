/**
 * Seed script — pushes the /playground BentoGallery images to Sanity in one shot.
 *
 * Usage:
 *   node scripts/seed-playground-gallery.mjs
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local.
 * Uploads originals from ../cms/playground, then createOrReplace's the
 * singleton "playgroundGallery" document. Captions = exact filenames
 * (no extension). Shape maps natural aspect → bento colSpan hint;
 * BentoGallery sizes tile height from Sanity image metadata.
 */

import { createClient } from "@sanity/client";
import { execFileSync } from "child_process";
import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve, extname, basename, join } from "path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;

if (!TOKEN)   throw new Error("Missing SANITY_API_WRITE_TOKEN in .env.local");
if (!PROJECT_ID) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");

const client = createClient({
  projectId: PROJECT_ID,
  dataset:   DATASET,
  apiVersion: "2026-06-28",
  token:  TOKEN,
  useCdn: false,
});

const ASSET_DIR = resolve(process.cwd(), "../cms/playground");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const KEYBOARD_CAPTION = "geonworks f1-8x";
const KEYBOARD_LINK =
  "https://www.youtube.com/watch?v=DfVodsY4WQk&pp=ygUKc3ZpeiBmMS04eA%3D%3D";

/** Pack order — earlier = more visible in the default viewport. */
const PRIORITY_CAPTIONS = [
  "asap rocky",
  "j. cole",
  "gunna",
  "playboi carti",
  "the marias",
  "geonworks f1-8x",
  "singa unikorn",
];

// Explicit shape overrides (caption → shape). Everything else inferred from
// dimensions when available, else "square".
const SHAPE_BY_CAPTION = {
  "legendaley": "wide",
  "faze mew": "wide",
  "designed keycaps and promotional graphics for the #1 esports org and goat of esports": "square",
  [KEYBOARD_CAPTION]: "tall",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function mimeFor(filePath) {
  const ext = extname(filePath).toLowerCase();
  return {
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
  }[ext] ?? "application/octet-stream";
}

function slugKey(caption) {
  return caption
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "item";
}

/** Best-effort width/height for shape inference before upload. */
function probeAspect(absPath) {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", absPath],
      { encoding: "utf8" }
    ).trim();
    const [w, h] = out.split("x").map(Number);
    if (w > 0 && h > 0) return w / h;
  } catch {
    // fall through
  }
  // AVIF / other: parse ISO BMFF ispe box
  try {
    const buf = readFileSync(absPath);
    const idx = buf.indexOf("ispe");
    if (idx >= 0 && idx + 16 <= buf.length) {
      const w = buf.readUInt32BE(idx + 8);
      const h = buf.readUInt32BE(idx + 12);
      if (w > 0 && h > 0 && w < 100000 && h < 100000) return w / h;
    }
  } catch {
    // ignore
  }
  try {
    const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", absPath], { encoding: "utf8" });
    const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
    const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]);
    if (w > 0 && h > 0) return w / h;
  } catch {
    // ignore
  }
  return undefined;
}

function shapeFor(caption, aspect) {
  if (SHAPE_BY_CAPTION[caption]) return SHAPE_BY_CAPTION[caption];
  if (aspect == null) return "square";
  if (aspect >= 2.2) return "wide";
  if (aspect <= 0.72) return "tall";
  // 4:5 portraits (~0.8) → square cell; natural aspectRatio sizes height.
  return "square";
}

async function uploadImage(absPath, filename) {
  if (!existsSync(absPath)) {
    console.warn(`  ⚠  not found: ${absPath}, skipping`);
    return undefined;
  }
  console.log(`  ↑  Uploading ${filename}…`);
  const buf  = readFileSync(absPath);
  const mime = mimeFor(absPath);
  const asset = await client.assets.upload("image", buf, {
    filename,
    contentType: mime,
  });
  console.log(`  ✓  ${filename} → ${asset._id}`);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSeeding Playground Gallery → Sanity (${PROJECT_ID}/${DATASET})`);
  console.log(`Source: ${ASSET_DIR}\n`);

  if (!existsSync(ASSET_DIR)) {
    throw new Error(`Asset directory not found: ${ASSET_DIR}`);
  }

  const files = readdirSync(ASSET_DIR)
    .filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()) && !f.startsWith("."))
    .sort((a, b) => {
      const ca = basename(a, extname(a)).toLowerCase();
      const cb = basename(b, extname(b)).toLowerCase();
      const ra = PRIORITY_CAPTIONS.findIndex((p) => ca === p || ca.includes(p));
      const rb = PRIORITY_CAPTIONS.findIndex((p) => cb === p || cb.includes(p));
      const na = ra === -1 ? PRIORITY_CAPTIONS.length : ra;
      const nb = rb === -1 ? PRIORITY_CAPTIONS.length : rb;
      return na - nb || ca.localeCompare(cb);
    });

  if (files.length === 0) {
    throw new Error(`No images found in ${ASSET_DIR}`);
  }

  console.log(`Found ${files.length} images\n`);

  const docItems = [];
  for (const filename of files) {
    const abs = join(ASSET_DIR, filename);
    const caption = basename(filename, extname(filename));
    const aspect = probeAspect(abs);
    const shape = shapeFor(caption, aspect);
    const image = await uploadImage(abs, filename);
    if (!image) continue;

    const item = {
      _key: slugKey(caption),
      _type: "object",
      image,
      caption,
      alt: caption,
      shape,
    };
    if (caption === KEYBOARD_CAPTION) {
      item.link = KEYBOARD_LINK;
    }
    docItems.push(item);
    console.log(`     caption="${caption}"  shape=${shape}${aspect != null ? `  ar=${aspect.toFixed(3)}` : ""}${item.link ? "  +link" : ""}`);
  }

  const doc = {
    _id:   "playgroundGallery",
    _type: "playgroundGallery",
    items: docItems,
  };

  console.log(`\nWriting document (${docItems.length} items) to Sanity…`);
  await client.createOrReplace(doc);
  console.log(`\n✓ Done! Playground Gallery reseeded with ${docItems.length} items.\n`);
  console.log(`  Captions:`);
  for (const it of docItems) console.log(`    - ${it.caption}`);
  console.log("");
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err.message);
  process.exit(1);
});
