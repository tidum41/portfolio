#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = process.env.DIALOGUE_ARCHIVE_BASE_URL || "http://127.0.0.1:3001/dev/dialogue-archive";
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "lib/caseStudies/dialogueArchiveManifest.json"), "utf8"),
);

const CONTENT_PAD = 64;

function computeFitCamera(viewportW, viewportH, bounds, pad) {
  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;
  const availW = Math.max(1, viewportW - pad * 2);
  const availH = Math.max(1, viewportH - pad * 2);
  const z = Math.min(availW / bw, availH / bh);
  const clampedZ = Math.min(2, Math.max(0.05, z));
  const x = (viewportW - bw * clampedZ) / 2 - bounds.minX * clampedZ;
  const y = (viewportH - bh * clampedZ) / 2 - bounds.minY * clampedZ;
  return { x, y, z: clampedZ };
}

async function assertFitAll(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => {
    localStorage.removeItem("dialogue-archive-camera-v2");
    localStorage.removeItem("dialogue-archive-camera-v1");
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector('[data-archive-ready="true"]', { state: "attached", timeout: 30_000 });
  await page.waitForFunction(() => {
    const zoom = Number(document.querySelector("[data-archive-zoom-pct]")?.getAttribute("data-archive-zoom-pct"));
    return zoom > 0 && zoom < 15;
  });

  const viewport = page.locator("[data-archive-viewport]");
  const toolbar = page.locator("[data-archive-toolbar]");
  const vpBox = await viewport.boundingBox();
  const tbBox = await toolbar.boundingBox();
  if (!vpBox || !tbBox) throw new Error("Missing viewport or toolbar");

  const zoomPct = Number(await page.getAttribute("[data-archive-zoom-pct]", "data-archive-zoom-pct"));
  const bounds = await page.evaluate(() => {
    const el = document.querySelector("[data-archive-world]");
    if (!el) return null;
    return {
      minX: Number(el.getAttribute("data-bounds-min-x")),
      minY: Number(el.getAttribute("data-bounds-min-y")),
      maxX: Number(el.getAttribute("data-bounds-max-x")),
      maxY: Number(el.getAttribute("data-bounds-max-y")),
    };
  });
  if (!bounds) throw new Error("Missing layout bounds on world element");

  const expected = computeFitCamera(vpBox.width, vpBox.height, bounds, CONTENT_PAD);
  const expectedPct = Math.round(expected.z * 100);
  if (Math.abs(zoomPct - expectedPct) > 2) {
    throw new Error(`Zoom mismatch: UI ${zoomPct}% vs expected ${expectedPct}% (z=${expected.z})`);
  }
  if (zoomPct < 2 || zoomPct > 12) {
    throw new Error(`Zoom ${zoomPct}% outside sanity band 2–12% for full-board fit`);
  }

  const pad = CONTENT_PAD;
  const minX = vpBox.x + pad - 2;
  const minY = vpBox.y + pad - 2;
  const maxX = vpBox.x + vpBox.width - pad + 2;
  const maxY = vpBox.y + vpBox.height - pad + 2;

  const nodes = page.locator("[data-archive-bounds]");
  const count = await nodes.count();
  const failures = [];
  for (let i = 0; i < count; i++) {
    const el = nodes.nth(i);
    const id = await el.getAttribute("data-archive-bounds");
    const box = await el.boundingBox();
    if (!box) continue;
    if (box.x < minX || box.y < minY || box.x + box.width > maxX || box.y + box.height > maxY) {
      failures.push({
        id,
        box,
        limits: { minX, minY, maxX, maxY },
      });
    }
  }
  if (failures.length > 0) {
    console.error(JSON.stringify(failures.slice(0, 5), null, 2));
    throw new Error(`${failures.length} tiles/labels outside padded viewport`);
  }

  const outFit = path.join(root, "public/dialogue/archive/fit-all-1440.png");
  await page.screenshot({ path: outFit });
  fs.copyFileSync(outFit, "/opt/cursor/artifacts/dialogue-archive-fit-all-1440.png");
  console.log("fit-all ok", { zoomPct, expectedPct, tilesChecked: count });
  return { zoomPct, vpBox };
}

async function screenshotChatIcons100(page, vpBox) {
  const tile = page.locator('[data-chat-icon-sha="68d8212"]').first();
  await tile.waitFor({ state: "visible" });
  const worldCenter = await tile.evaluate((el) => {
    const x = Number(el.getAttribute("data-world-x"));
    const y = Number(el.getAttribute("data-world-y"));
    const w = Number(el.getAttribute("data-world-w"));
    const h = Number(el.getAttribute("data-world-h"));
    return { cx: x + w / 2, cy: y + h / 2 };
  });

  await page.evaluate(
    ({ cx, cy, vw, vh }) => {
      const z = 1;
      const x = vw / 2 - cx * z;
      const y = vh / 2 - cy * z;
      const world = document.querySelector("[data-archive-world]");
      if (world instanceof HTMLElement) {
        world.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
      }
      const root = document.querySelector("[data-archive-zoom-pct]");
      if (root) root.setAttribute("data-archive-zoom-pct", "100");
      const label = document.querySelector("[data-archive-zoom-label]");
      if (label) label.textContent = "100%";
    },
    { cx: worldCenter.cx, cy: worldCenter.cy, vw: vpBox.width, vh: vpBox.height },
  );

  await page.waitForTimeout(400);
  const out = path.join(root, "public/dialogue/archive/chat-icon-history-100-1440.png");
  await page.screenshot({ path: out });
  fs.copyFileSync(out, "/opt/cursor/artifacts/dialogue-archive-chat-icon-100-1440.png");
  console.log("chat icon 100% screenshot ok");
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const { vpBox } = await assertFitAll(page);
  await screenshotChatIcons100(page, vpBox);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
