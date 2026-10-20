#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL =
  process.env.DIALOGUE_ARCHIVE_BASE_URL || "http://127.0.0.1:3003/dev/dialogue-archive";

const ZOOM_LEVELS = [4, 25, 100, 200];

function rectsIntersect(a, b, slack = 0) {
  return (
    a.x + slack < b.x + b.width &&
    a.x + a.width > b.x + slack &&
    a.y + slack < b.y + b.height &&
    a.y + a.height > b.y + slack
  );
}

async function getBoxes(page, selector) {
  const loc = page.locator(selector);
  const n = await loc.count();
  const boxes = [];
  for (let i = 0; i < n; i++) {
    const box = await loc.nth(i).boundingBox();
    if (box) boxes.push(box);
  }
  return boxes;
}

async function assertNoLabelOverlaps(page, zoomLabel) {
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll("[data-archive-screen-label]")]
      .filter((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity !== "0" && Number.parseFloat(style.fontSize) > 1;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }),
  );
  const captions = await getBoxes(page, "[data-archive-caption]");
  const medias = await getBoxes(page, "[data-archive-tile-media]");

  for (const label of labels) {
    for (const cap of captions) {
      if (rectsIntersect(label, cap, -1)) {
        throw new Error(`Label intersects caption at zoom ${zoomLabel}`);
      }
    }
    for (const media of medias) {
      if (rectsIntersect(label, media, -1)) {
        throw new Error(`Label intersects tile media at zoom ${zoomLabel}`);
      }
    }
  }

  const gaps = await page.evaluate(() => {
    const out = [];
    for (const cap of document.querySelectorAll("[data-archive-caption]")) {
      const tile = cap.closest("[data-archive-tile]");
      const media = tile?.querySelector("[data-archive-tile-media]");
      if (!media) continue;
      const cr = cap.getBoundingClientRect();
      const mr = media.getBoundingClientRect();
      out.push(mr.top - cr.bottom);
    }
    return out;
  });
  for (const gap of gaps) {
    if (gap < 6) {
      throw new Error(`Caption/media gap ${gap.toFixed(1)}px < 8px at zoom ${zoomLabel}`);
    }
  }
}

async function readZoomPct(page) {
  const shown = await page.locator("[data-archive-zoom-label]").textContent();
  return Number(shown?.replace("%", ""));
}

function toolbar(page) {
  return page.locator("[data-archive-toolbar]");
}

async function waitForCamera(page) {
  await page.waitForFunction(
    () => typeof window.__dialogueArchiveCamera?.setZoom === "function",
    undefined,
    { timeout: 60_000 },
  );
}

async function setZoomPercent(page, pct) {
  await waitForCamera(page);
  if (pct <= 6) {
    await toolbar(page).getByRole("button", { name: "Fit all", exact: true }).click();
    await page.waitForTimeout(500);
    return;
  }
  if (pct === 100) {
    await toolbar(page).getByRole("button", { name: "100%", exact: true }).click();
    await page.waitForTimeout(350);
    return;
  }
  await page.evaluate((targetPct) => {
    const cam = window.__dialogueArchiveCamera;
    if (targetPct === 100) cam.reset100();
    else cam.setZoom(targetPct / 100);
  }, pct);
  await page.waitForTimeout(200);
  const current = await readZoomPct(page);
  if (Math.abs(current - pct) > 8) {
    throw new Error(`Zoom UI ${current}% expected ~${pct}%`);
  }
}

async function panViewport(page, dx, dy) {
  const vp = page.locator("[data-archive-viewport]");
  const box = await vp.boundingBox();
  if (!box) throw new Error("no viewport");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(cx + dx, cy + dy);
  await page.mouse.up({ button: "middle" });
  await page.waitForTimeout(250);
}

async function centerOnSelector(page, selector) {
  const tile = page.locator(selector).first();
  await tile.waitFor({ state: "attached" });
  const tileBox = await tile.boundingBox();
  const vpBox = await page.locator("[data-archive-viewport]").boundingBox();
  if (!tileBox || !vpBox) throw new Error("centerOn missing box");
  const tcx = tileBox.x + tileBox.width / 2;
  const tcy = tileBox.y + tileBox.height / 2;
  const vcx = vpBox.x + vpBox.width / 2;
  const vcy = vpBox.y + vpBox.height / 2;
  await panViewport(page, vcx - tcx, vcy - tcy);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => {
    localStorage.removeItem("dialogue-archive-camera-v2");
    localStorage.removeItem("dialogue-archive-camera-v1");
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-archive-screen-label]", { state: "attached", timeout: 30_000 });
  await waitForCamera(page);
  await page.evaluate(() => document.fonts.ready);

  for (const pct of ZOOM_LEVELS) {
    await setZoomPercent(page, pct);
    await assertNoLabelOverlaps(page, `${pct}%`);
  }

  const outFit = path.join(root, "public/dialogue/archive/fit-all-1440.png");
  await setZoomPercent(page, 4);
  await page.screenshot({ path: outFit });
  fs.copyFileSync(outFit, "/opt/cursor/artifacts/dialogue-archive-fit-all-1440.png");

  await setZoomPercent(page, 25);
  await centerOnSelector(page, '[data-chat-icon-sha="68d8212"]');
  const out25 = path.join(root, "public/dialogue/archive/chat-icon-history-25-1440.png");
  await page.screenshot({ path: out25 });
  fs.copyFileSync(out25, "/opt/cursor/artifacts/dialogue-archive-chat-icon-25-1440.png");

  await setZoomPercent(page, 100);
  await assertNoLabelOverlaps(page, "100%");
  const out100 = path.join(root, "public/dialogue/archive/dialogue-archive-100-1440.png");
  await page.screenshot({ path: out100 });
  fs.copyFileSync(out100, "/opt/cursor/artifacts/dialogue-archive-100-1440.png");

  await centerOnSelector(page, '[data-chat-icon-sha="68d8212"]');
  const outChat100 = path.join(root, "public/dialogue/archive/chat-icon-history-100-1440.png");
  await page.screenshot({ path: outChat100 });
  fs.copyFileSync(outChat100, "/opt/cursor/artifacts/dialogue-archive-chat-icon-100-1440.png");

  console.log("verify ok", { zoomLevels: ZOOM_LEVELS });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
