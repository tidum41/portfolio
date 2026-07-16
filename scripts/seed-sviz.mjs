/**
 * Seed script — pushes the SViz case study to Sanity in one shot.
 *
 * Usage:
 *   node scripts/seed-sviz.mjs
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (already present).
 * Uploads all three local media assets to Sanity Assets, then creates
 * (or fully replaces) the "sviz" Case Study document.
 * After running, the document is live in Studio and editable like any other.
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
           ".webp": "image/webp", ".webm": "video/webm", ".mp4": "video/mp4" }[ext] ?? "application/octet-stream";
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

async function uploadFile(relPath, label) {
  const abs = resolve(process.cwd(), relPath);
  if (!existsSync(abs)) { console.warn(`  ⚠  ${label} not found at ${relPath}, skipping`); return undefined; }
  console.log(`  ↑  Uploading ${label}…`);
  const buf  = readFileSync(abs);
  const mime = mimeFor(abs);
  const asset = await client.assets.upload("file", buf, { filename: relPath.split("/").pop(), contentType: mime });
  console.log(`  ✓  ${label} → ${asset._id}`);
  return { _type: "file", asset: { _type: "reference", _ref: asset._id } };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSeeding SViz case study → Sanity (${PROJECT_ID}/${DATASET})\n`);

  // Upload media
  const heroImage    = await uploadImage("public/images/sviz/hero-channel-screenshot.png", "Hero screenshot");
  const processImage = await uploadImage("public/images/sviz/process-camera.jpeg",         "Process camera photo");
  const solutionVideo = await uploadFile("public/images/sviz/solution-video.webm",         "Solution video");

  // Build document — _id is deterministic so re-running this script is safe (idempotent)
  const doc = {
    _id:   "case-study-sviz",
    _type: "caseStudy",

    // ── TOC / Meta ────────────────────────────────────────────────────────────
    title: "Personal YouTube, 1M+ views",
    slug:  "sviz",
    pageType: "youtube-channel",
    tocItems: [
      { _key: "t1", id: "problem",  label: "Problem"  },
      { _key: "t2", id: "solution", label: "Solution" },
      { _key: "t3", id: "process",  label: "Process"  },
      { _key: "t4", id: "impact",   label: "Impact"   },
    ],

    // ── Hero ─────────────────────────────────────────────────────────────────
    heroTagline: "YouTube · Personal · 2021",
    heroTitle:   "Personal YouTube, 1M+ views",
    ...(heroImage && { heroImage }),
    metadata: [
      { _key: "m1", label: "Role",          values: ["Self-ran"] },
      { _key: "m2", label: "Timeline",      values: ["2021"] },
      { _key: "m3", label: "Tools",         values: ["DaVinci Resolve", "Photoshop", "Fujifilm XS10", "Tamron 17-70 f/2.8"] },
      { _key: "m4", label: "Collaborators", values: ["SteelSeries", "DROP", "Glorious", "KBDfans"] },
    ],

    // ── Problem ───────────────────────────────────────────────────────────────
    problemLabel:   "The Problem",
    problemHeading: "Custom Keyboards were hard to learn about",
    problemBody:
`During the pandemic, I learned about the custom mechanical keyboard hobby. I had a cheap gaming keyboard and wanted to modify it to sound and feel better. Diving down the rabbit hole, I learned that info on how to build and modify keyboards was already on YouTube. But reviews on keyboard cases, keycaps, switches, and various other parts were deeply rooted in other communities and added friction for beginners like myself. Reddit, Discord, and Geekhack, were primary sources for learning but hard to use.

There was no single voice producing digestible, well-structured content for people just getting into the hobby. The barrier wasn't the keyboards—it was the information architecture around them.`,

    // ── Research — stats used by the Solution section ─────────────────────────
    stats: [
      { _key: "s1", value: "1M+",   label: "total views across the channel" },
      { _key: "s2", value: "500K+", label: "views on the first upload, organic" },
    ],

    // ── Solution ──────────────────────────────────────────────────────────────
    solutionLabel:   "Solution",
    solutionHeading: "Engaging and Structured YouTube videos, with 1M+ Views",
    solutionBody:
`One of my goals was to build a custom keyboard that was affordable and didn't compromise on certain features. Part of this process heavily relied on the "switches," the actual mechanism registering keystrokes. With my Sony A6100 I was new to using at the time, 16 year-old me produced a full review for some budget switches. My first keyboard video amassed over 500K views.

I immersed myself in discord and reddit communities, learning from others and understanding pain points. I covered anything keyboard related in a digestible captivating format for the sake of not only sharing my subjective thoughts, but sharing others' takes as well. I became a reliable creator and established myself within the hobby, such that beginners and enthusiasts alike had the resources to guide their own purchases (and listen to some crispy asmr).`,
    ...(solutionVideo && { solutionVideo }),

    // ── Process ───────────────────────────────────────────────────────────────
    processLabel:   "Production Process",
    processHeading: "Digestible, engaging, and structured YouTube videos",
    processBody:
`I started off with a Sony A6100, with no knowledge on how to film besides using the auto setting. I learned how to edit in Premiere Pro, and used my Photoshop skillset to make thumbnails. As I got more serious, I switched to a Fujifilm XS-10 and Tamron 17-70 f/2.8, with 2 small softboxes. This did the trick for me in combination with editing in DaVinci Resolve. I honed in on my craft to intentionally color grade, set up scenes, and story tell through my reviews.

The constraint I held myself to: every video had to be watchable at 1.5× speed. If it wasn't, the pacing was wrong.`,
    ...(processImage && { processImage }),

    // ── Impact ────────────────────────────────────────────────────────────────
    impactLabel:   "Impact Online and In-Person",
    impactHeading: "Becoming an established creator with hobbyist roots",
    impactBody:
`My online persona was well-received, allowing me to collaborate with KBDFans, one of the original and biggest custom keyboard marketplaces. I also did collaboration videos with bigger names like SteelSeries, Glorious, DROP, and some more creative collaborators like Field Notes and Grovemade.

My heavy online presence ultimately led me to create the NorCal Keyboard Group, an online and in-person community with 700+ members. I helped organize and promote in-person meetups, for enthusiasts of all experiences to come together and nerd out over this mutual love for the game.`,
  };

  console.log("\nWriting document to Sanity…");
  await client.createOrReplace(doc);
  console.log(`\n✓ Done! SViz case study is now live in Sanity Studio.\n`);
  console.log(`  Edit at: http://localhost:3000/studio/desk`);
  console.log(`  View at: http://localhost:3000/sviz\n`);
}

main().catch((err) => { console.error("\n✗ Seed failed:", err.message); process.exit(1); });
