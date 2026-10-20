#!/usr/bin/env node
/**
 * Captures PNGs of DialogueChatLauncher + DialogueAssistantMark at each historical commit.
 * Requires dev server at BASE_URL (default http://127.0.0.1:3000).
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/dialogue/archive/chat-icons");
const BASE_URL = process.env.DIALOGUE_ARCHIVE_BASE_URL || "http://127.0.0.1:3000";
const AGREED_SHA_PREFIX = "68d8212";

const TRACKED = [
  "components/dialogue/graphics/DialogueChatLauncher.tsx",
  "components/dialogue/graphics/DialogueIcons.tsx",
  "lib/caseStudies/dialogueGraphicsTheme.ts",
  "lib/caseStudies/dialoguePlacementAssets.ts",
];

const SECONDARY_PATH = path.join(
  root,
  "app/dev/dialogue-archive/chat-icon-capture/ChatIconSecondary.tsx",
);

function git(cmd) {
  return execSync(cmd, { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
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

function collectCommits() {
  const raw = git(
    'git log --all --format="%H %cI" -- components/dialogue/graphics/DialogueChatLauncher.tsx components/dialogue/graphics/DialogueIcons.tsx',
  );
  const bySha = new Map();
  for (const line of raw.split("\n").filter(Boolean)) {
    const sha = line.slice(0, 40);
    const date = line.slice(41).trim();
    bySha.set(sha, date);
  }
  const agreedFull = git(`git rev-parse ${AGREED_SHA_PREFIX}^{commit}`).trim();
  if (!bySha.has(agreedFull)) {
    const date = git(`git log -1 --format=%cI ${agreedFull}`).trim();
    bySha.set(agreedFull, date);
  }
  return [...bySha.entries()]
    .map(([sha, date]) => ({ sha, date, datePt: toPacific(date) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

const ICONS_STUB = `import { DIALOGUE_GRAPHICS_COLORS } from "@/lib/caseStudies/dialogueGraphicsTheme";
export function DialogueAssistantMark() { return null; }
export function DialogueSparkleIcon() { return null; }
`;

function fileExistsAt(sha, file) {
  try {
    execSync(`git cat-file -e ${sha}:${file}`, { cwd: root, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function writeSecondaryPreview(sha) {
  const iconsPath = "components/dialogue/graphics/DialogueIcons.tsx";
  if (!fileExistsAt(sha, iconsPath)) {
    fs.writeFileSync(
      SECONDARY_PATH,
      `export function SecondaryIcon() { return null; }\n`,
    );
    return;
  }
  const src = execSync(`git show ${sha}:${iconsPath}`, { cwd: root, encoding: "utf8" });
  let importLine = "";
  let jsx = "return null;";
  if (/export function DialogueAssistantMark/.test(src)) {
    importLine =
      'import { DialogueAssistantMark } from "@/components/dialogue/graphics/DialogueIcons";';
    jsx = "return <DialogueAssistantMark size={22} />;";
  } else if (/export function DialogueSparkleIcon/.test(src)) {
    importLine =
      'import { DialogueSparkleIcon } from "@/components/dialogue/graphics/DialogueIcons";';
    jsx = "return <DialogueSparkleIcon size={22} />;";
  }
  const body = `${importLine}
export function SecondaryIcon() {
  ${jsx}
}
`;
  fs.writeFileSync(SECONDARY_PATH, body);
}

function checkoutFilesAt(sha) {
  restoreTracked();
  for (const file of TRACKED) {
    const dest = path.join(root, file);
    if (!fileExistsAt(sha, file)) {
      if (file.endsWith("DialogueIcons.tsx")) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, ICONS_STUB);
      } else if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      continue;
    }
    const blob = execSync(`git show ${sha}:${file}`, { cwd: root, maxBuffer: 4 * 1024 * 1024 });
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, blob);
  }
  writeSecondaryPreview(sha);
}

function restoreTracked() {
  execSync(`git checkout HEAD -- ${TRACKED.join(" ")}`, { cwd: root });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const commits = collectCommits();
  const agreedFull = git(`git rev-parse ${AGREED_SHA_PREFIX}^{commit}`).trim();
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  const history = [];
  for (const entry of commits) {
    checkoutFilesAt(entry.sha);
    await page.goto(
      `${BASE_URL}/dev/dialogue-archive/chat-icon-capture?v=${entry.sha.slice(0, 7)}`,
      {
        waitUntil: "networkidle",
        timeout: 120_000,
      },
    );
    await page.waitForSelector('[data-capture="launcher"]', { timeout: 60_000 });
    await page.waitForTimeout(800);
    const el = page.locator('[data-capture="launcher"]');
    const fileName = `${entry.sha.slice(0, 7)}.png`;
    const dest = path.join(outDir, fileName);
    await el.screenshot({ path: dest, type: "png" });
    let width = 0;
    let height = 0;
    try {
      const box = await el.boundingBox();
      width = Math.round(box?.width ?? 0);
      height = Math.round(box?.height ?? 0);
    } catch {
      /* ignore */
    }
    history.push({
      sha: entry.sha,
      shaShort: entry.sha.slice(0, 7),
      date: entry.date,
      datePt: entry.datePt,
      src: `/dialogue/archive/chat-icons/${fileName}`,
      width,
      height,
      agreed: entry.sha === agreedFull || entry.sha.startsWith(AGREED_SHA_PREFIX),
    });
    console.log(`Captured ${entry.sha.slice(0, 7)}`);
  }

  restoreTracked();
  await browser.close();

  const manifestPath = path.join(root, "lib/caseStudies/dialogueArchiveManifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.chatIconHistory = history;
  const json = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(manifestPath, json);
  fs.writeFileSync(path.join(root, "public/dialogue/archive/manifest.json"), json);
  console.log(`Wrote ${history.length} chat icon captures`);
}

main().catch((e) => {
  console.error(e);
  try {
    restoreTracked();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
