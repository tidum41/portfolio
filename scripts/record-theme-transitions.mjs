/**
 * Records short theme-transition demos to /opt/cursor/artifacts/
 * Usage: node scripts/record-theme-transitions.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = "/opt/cursor/artifacts/theme-transition-demos";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function recordTransition(browser, transition, filename) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/dev/theme-transition-lab?transition=${transition}`, {
    waitUntil: "networkidle",
  });
  const label =
    transition === "dither"
      ? page.getByLabel(/A — Bayer dither/)
      : page.getByLabel(/B — Halftone dots/);
  await label.click();
  await page.waitForTimeout(300);
  const toggle = page.getByTestId("lab-theme-toggle").getByRole("button");
  await toggle.click({ force: true });
  await page.waitForTimeout(800);
  await toggle.click({ force: true });
  await page.waitForTimeout(800);
  const video = page.video();
  await context.close();
  if (video) {
    const dest = path.join(OUT, filename);
    await video.saveAs(dest);
    console.log("saved", dest);
  }
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  await recordTransition(browser, "dither", "dither-both-directions.webm");
  await recordTransition(browser, "halftone", "halftone-both-directions.webm");
} finally {
  await browser.close();
}
