#!/usr/bin/env node
/**
 * Extracts every historical public/dialogue asset from git (all branches) and writes
 * public/dialogue/archive/manifest.json plus blob files under public/dialogue/archive/blobs/.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/dialogue/archive/blobs");
const manifestPath = path.join(root, "lib/caseStudies/dialogueArchiveManifest.json");
const manifestPublic = path.join(root, "public/dialogue/archive/manifest.json");

const EXCLUDE = [
  /frame-alan/i,
  /frame-philena/i,
  /participant-clip-s3-native/i,
  /participant-e157-native/i,
  /\/source\/participant/i,
  /_debug-participant/i,
  /_preview-participant/i,
  /_face-\d/i,
  /\/archive\//,
];

function isExcluded(rel) {
  const p = rel.replace(/\\/g, "/");
  if (!p.startsWith("public/dialogue/")) return true;
  return EXCLUDE.some((re) => re.test(p));
}

function groupFor(rel) {
  const base = path.basename(rel);
  if (base === "hero.png") return "hero";
  if (base.includes("dialogue-mark")) return "chat-icon";
  if (/^section-6/.test(base) || base.includes("placement") || /^clip-/.test(base) || base.includes("avatar-"))
    return "placement";
  if (base.includes("player") || base.includes("video-still") || base.includes("interview-frame"))
    return "player";
  if (base.includes("imperfect") || base.includes("share") || /^alt-/.test(base)) return "evidence-card";
  if (/^section-1/.test(base)) return "section-1";
  if (/^section-2/.test(base)) return "section-2";
  if (/^section-3/.test(base)) return "section-3";
  if (/^section-4/.test(base)) return "section-4";
  if (/^section-5/.test(base)) return "section-5";
  if (/^section-7/.test(base)) return "section-7";
  if (/^[A-Z0-9]{20,}\.(jpg|png|avif|svg)$/i.test(base)) return "legacy-sanity";
  return "other";
}

function toPacific(iso) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function git(cmd) {
  return execSync(cmd, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function collectEntries() {
  const raw = git('git log --all --name-only --pretty=format:"COMMIT %H %cI" -- public/dialogue/');
  const entries = [];
  let sha = "";
  let date = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("COMMIT ")) {
      const parts = line.split(" ");
      sha = parts[1];
      date = parts[2];
      continue;
    }
    const file = line.trim();
    if (!file || isExcluded(file)) continue;
    entries.push({ sha, date, file });
  }
  return entries;
}

function chatIconCommits() {
  const marks = [];
  const raw = git(
    'git log --all --pretty=format:"%H %cI %s" -- public/dialogue/placement/dialogue-mark.png public/dialogue/**/dialogue-mark.png components/dialogue/graphics/DialogueIcons.tsx components/dialogue/graphics/DialogueChatLauncher.tsx',
  );
  for (const line of raw.split("\n").filter(Boolean)) {
    const sha = line.slice(0, 40);
    const rest = line.slice(41);
    const dateEnd = rest.indexOf(" ");
    const date = rest.slice(0, dateEnd);
    const subject = rest.slice(dateEnd + 1);
    marks.push({ sha, date, subject });
  }
  return marks;
}

function exportRoutes() {
  return [
    { path: "/dev/dialogue-placement-export/docked", note: "Placement tile export (docked)" },
    { path: "/dev/dialogue-placement-export/floating", note: "Placement tile export (floating)" },
    { path: "/dev/canvas", note: "Case-study image canvas (current shipped sections)" },
    { path: "/dev/dialogue-archive", note: "This archive canvas" },
  ];
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const entries = collectEntries();
  const seen = new Set();
  const items = [];

  for (const { sha, date, file } of entries) {
    const key = `${sha}:${file}`;
    if (seen.has(key)) continue;
    seen.add(key);
    let blob;
    try {
      blob = execSync(`git show ${sha}:${file}`, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
    } catch {
      continue;
    }
    const safeName = `${sha.slice(0, 8)}--${file.replace(/^public\/dialogue\//, "").replace(/\//g, "__")}`;
    const dest = path.join(outDir, safeName);
    fs.writeFileSync(dest, blob);
    let width = 0;
    let height = 0;
    try {
      const meta = await sharp(dest).metadata();
      width = meta.width ?? 0;
      height = meta.height ?? 0;
    } catch {
      /* svg etc. */
    }
    items.push({
      id: safeName,
      group: groupFor(file),
      sha,
      shaShort: sha.slice(0, 7),
      date,
      datePt: toPacific(date),
      file: file.replace(/^public\/dialogue\//, ""),
      src: `/dialogue/archive/blobs/${safeName}`,
      width,
      height,
    });
  }

  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groupOrder = [
    "hero",
    "section-1",
    "section-2",
    "section-3",
    "section-4",
    "section-5",
    "section-7",
    "evidence-card",
    "placement",
    "player",
    "chat-icon",
    "legacy-sanity",
    "other",
  ];

  const manifest = {
    generatedAt: new Date().toISOString(),
    itemCount: items.length,
    liveComponentCount: 16,
    groups: groupOrder.map((id) => ({
      id,
      label: id.replace(/-/g, " "),
      count: items.filter((i) => i.group === id).length,
    })),
    items,
    chatIconCommits: chatIconCommits(),
    exportRoutes: exportRoutes(),
  };

  const json = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(manifestPath, json);
  fs.mkdirSync(path.dirname(manifestPublic), { recursive: true });
  fs.writeFileSync(manifestPublic, json);
  console.log(`Wrote ${items.length} assets to ${path.relative(root, manifestPath)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
