#!/usr/bin/env node
/**
 * Final + Candidate tiles only (strictly before d38dd14 cutoff). No rejected assets.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/dialogue/review/blobs");
const manifestPath = path.join(root, "lib/caseStudies/dialogueReviewManifest.json");

const CUTOFF_MS = Date.parse("2026-10-19T22:25:35+00:00");
const FCC_SHA = "fcc87a24baf1eebbac6597fb9031ce4379e2c1f9";

const FINAL_SRC = new Set([
  "/dialogue/section-1.png",
  "/dialogue/section-2.png",
  "/dialogue/section-3.png",
  "/dialogue/section-4.png",
  "/dialogue/section-5.png",
  "/dialogue/section-6.png",
  "/dialogue/section-6a.png",
  "/dialogue/section-6b.png",
  "/dialogue/section-7.png",
]);

const EXCLUDE = [
  /frame-alan/i,
  /frame-philena/i,
  /participant/i,
  /\/review\//,
  /\/archive\//,
  /clip-/i,
  /avatar-/i,
  /interview-frame/i,
  /video-still/i,
  /player-blur/i,
  /placement\//i,
  /^public\/dialogue\/[A-Z0-9]{20,}\./i,
  /\.svg$/i,
];

function git(cmd) {
  return execSync(cmd, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function isExcluded(rel) {
  const p = rel.replace(/\\/g, "/");
  if (!p.startsWith("public/dialogue/")) return true;
  return EXCLUDE.some((re) => re.test(p));
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

function srcFromPublic(rel) {
  return "/" + rel.replace(/^public\//, "");
}

function beforeCutoff(dateIso) {
  return Date.parse(dateIso) < CUTOFF_MS;
}

function collectImageEntries() {
  const raw = git(
    'git log --all --before="2026-10-19T22:25:35+00:00" --name-only --pretty=format:"COMMIT %H %cI" -- public/dialogue/',
  );
  const seen = new Map();
  let sha = "";
  let date = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("COMMIT ")) {
      const parts = line.slice(7).split(" ");
      sha = parts[0];
      date = parts.slice(1).join(" ");
      continue;
    }
    const rel = line.trim();
    if (!rel || isExcluded(rel)) continue;
    if (!beforeCutoff(date)) continue;
    const key = `${sha}:${rel}`;
    if (seen.has(key)) continue;
    seen.set(key, { sha, date, rel, src: srcFromPublic(rel) });
  }
  return [...seen.values()];
}

async function writeBlob(sha, rel) {
  const blobName = `${sha.slice(0, 7)}--${path.basename(rel)}`;
  const blobPath = path.join(outDir, blobName);
  if (!fs.existsSync(blobPath)) {
    const buf = execSync(`git show ${sha}:${rel}`, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
    fs.writeFileSync(blobPath, buf);
  }
  let width = 0;
  let height = 0;
  try {
    const meta = await sharp(blobPath).metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;
  } catch {
    /* ignore */
  }
  return {
    blobName,
    width,
    height,
  };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const tiles = [];
  const finalSeeded = new Set();

  for (const src of [...FINAL_SRC].sort()) {
    const rel = `public${src}`;
    try {
      git(`git cat-file -e ${FCC_SHA}:${rel}`);
    } catch {
      continue;
    }
    const date = git(`git log -1 --format=%cI ${FCC_SHA} -- ${rel}`).trim();
    const { blobName, width, height } = await writeBlob(FCC_SHA, rel);
    finalSeeded.add(src);
    tiles.push({
      id: "",
      kind: "image",
      status: "final",
      sha: FCC_SHA,
      shaShort: FCC_SHA.slice(0, 7),
      date,
      datePt: toPacific(date),
      file: path.basename(rel),
      src: `/dialogue/review/blobs/${blobName}`,
      width,
      height,
    });
  }

  for (const e of collectImageEntries()) {
    if (e.sha.startsWith(FCC_SHA.slice(0, 7)) && FINAL_SRC.has(e.src)) continue;
    const status = "candidate";
    try {
      const { blobName, width, height } = await writeBlob(e.sha, e.rel);
      tiles.push({
        id: "",
        kind: "image",
        status,
        sha: e.sha,
        shaShort: e.sha.slice(0, 7),
        date: e.date,
        datePt: toPacific(e.date),
        file: path.basename(e.rel),
        src: `/dialogue/review/blobs/${blobName}`,
        width,
        height,
      });
    } catch {
      /* missing blob */
    }
  }

  const uniq = new Map();
  for (const t of tiles) {
    const k = `${t.status}:${t.src}`;
    if (!uniq.has(k)) uniq.set(k, t);
  }
  const deduped = [...uniq.values()].sort(
    (a, b) =>
      (a.status === "final" ? 0 : 1) - (b.status === "final" ? 0 : 1) ||
      a.file.localeCompare(b.file) ||
      a.date.localeCompare(b.date),
  );

  let n = 0;
  for (const t of deduped) {
    n += 1;
    t.id = `D-${String(n).padStart(2, "0")}`;
  }

  const counts = {
    final: deduped.filter((t) => t.status === "final").length,
    candidate: deduped.filter((t) => t.status === "candidate").length,
  };

  const manifest = {
    builtAt: new Date().toISOString(),
    fccSha: FCC_SHA,
    cutoffBefore: "2026-10-19T22:25:35+00:00",
    counts,
    tiles: deduped,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("Wrote", manifestPath, counts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
