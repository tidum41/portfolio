import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.env.DIALOGUE_BASE_URL ?? "http://localhost:3000";
const outDir = path.join(process.cwd(), "tmp/dialogue-screenshots");
fs.mkdirSync(outDir, { recursive: true });

const frames = [
  { id: 1, path: "/dev/dialogue/1", width: 1512, height: 709 },
  { id: 2, path: "/dev/dialogue/2", width: 474, height: 6005 },
  { id: 3, path: "/dev/dialogue/3", width: 1512, height: 709 },
  { id: 4, path: "/dev/dialogue/4", width: 582, height: 1303 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const f of frames) {
  await page.setViewportSize({ width: f.width, height: Math.min(f.height, 1200) });
  await page.goto(`${base}${f.path}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  const root = page.locator("[data-dialogue-frame-root]");
  await root.waitFor({ state: "visible", timeout: 15_000 });
  const box = await root.boundingBox();
  const file = path.join(outDir, `frame-${f.id}.png`);
  if (box) {
    await page.screenshot({ path: file, clip: box });
  } else {
    await page.screenshot({ path: file, fullPage: true });
  }
  console.log(
    JSON.stringify({
      frame: f.id,
      expectedWidth: f.width,
      measuredWidth: box?.width ?? null,
      file,
    }),
  );
}

await browser.close();
