/**
 * Seed script — pushes the /playground BentoGallery images to Sanity in one shot.
 *
 * Usage:
 *   node scripts/seed-playground-gallery.mjs
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (already present).
 * Uploads the 7 local images to Sanity Assets, then creates (or fully
 * replaces) the singleton "playgroundGallery" document with the corrected
 * captions/link/shape. After running, the gallery is editable in Studio —
 * add, remove, reorder, or re-caption images there instead of in code.
 */

import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { resolve, extname } from "path";
import { config } from "dotenv";

// Load .env.local
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function mimeFor(filePath) {
  const ext = extname(filePath).toLowerCase();
  return { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
           ".webp": "image/webp" }[ext] ?? "application/octet-stream";
}

async function uploadImage(relPath, label) {
  const abs = resolve(process.cwd(), relPath);
  if (!existsSync(abs)) { console.warn(`  ⚠  ${label} not found at ${relPath}, skipping`); return undefined; }
  console.log(`  ↑  Uploading ${label}…`);
  const buf  = readFileSync(abs);
  const mime = mimeFor(abs);
  const asset = await client.assets.upload("image", buf, { filename: relPath.split("/").pop(), contentType: mime });
  console.log(`  ✓  ${label} → ${asset._id}`);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSeeding Playground Gallery → Sanity (${PROJECT_ID}/${DATASET})\n`);

  const items = [
    {
      key: "jcole",
      path: "public/playground/jcole.webp",
      label: "J. Cole",
      caption: "j. cole",
      alt: "J. Cole",
      shape: "tall",
    },
    {
      key: "keyboard",
      path: "public/playground/keyboard.webp",
      label: "Keyboard",
      caption: "geonworks f1-8x i built",
      alt: "Geonworks F1-8X mechanical keyboard",
      link: "https://www.youtube.com/watch?v=DfVodsY4WQk&pp=ygUKc3ZpeiBmMS04eA%3D%3D",
      shape: "square",
    },
    {
      key: "gunna",
      path: "public/playground/gunna.webp",
      label: "Gunna",
      caption: "gunna",
      alt: "Gunna",
      shape: "square",
    },
    {
      key: "theMarias",
      path: "public/playground/the-marias.webp",
      label: "The Marías",
      caption: "the marías",
      alt: "The Marías",
      shape: "square",
    },
    {
      key: "omarApollo",
      path: "public/playground/omar-apollo.webp",
      label: "Omar Apollo",
      caption: "omar apollo",
      alt: "Omar Apollo",
      shape: "tall",
    },
    {
      key: "hollis",
      path: "public/playground/2hollis.webp",
      label: "2 Hollis",
      caption: "2hollis",
      alt: "2hollis",
      shape: "square",
    },
    {
      key: "singaUnikorn",
      path: "public/playground/concert.webp",
      label: "Singa Unikorn",
      caption: "singa unikorn",
      alt: "Singa Unikorn",
      shape: "square",
    },
  ];

  const docItems = [];
  for (const it of items) {
    const image = await uploadImage(it.path, it.label);
    if (!image) continue;
    docItems.push({
      _key: it.key,
      _type: "object",
      image,
      caption: it.caption,
      alt: it.alt,
      ...(it.link && { link: it.link }),
      shape: it.shape,
    });
  }

  // Deterministic _id ("playgroundGallery", matching the singleton pattern
  // in sanity.config.ts's structure builder) so re-running this is safe.
  const doc = {
    _id:   "playgroundGallery",
    _type: "playgroundGallery",
    items: docItems,
  };

  console.log("\nWriting document to Sanity…");
  await client.createOrReplace(doc);
  console.log(`\n✓ Done! Playground Gallery is now live in Sanity Studio.\n`);
  console.log(`  Edit at: http://localhost:3005/studio`);
  console.log(`  View at: http://localhost:3005/playground\n`);
}

main().catch((err) => { console.error("\n✗ Seed failed:", err.message); process.exit(1); });
