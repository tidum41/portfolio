#!/usr/bin/env node
/**
 * In-page screenshots for Dialogue round 35 sections @ 1440 and 390.
 */
import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const STORE = "/opt/cursor/artifacts/dialogue-round35-sections";
fs.mkdirSync(STORE, { recursive: true });

const SECTIONS = [
  { id: "hero", selector: ".dialogue-hero-media" },
  { id: "problem", selector: "#problem" },
  { id: "one-structure", selector: "#one-structure" },
  { id: "fitted-charts", selector: "#fitted-charts" },
  { id: "clips", selector: "#clips" },
  { id: "placement", selector: "#placement" },
  { id: "full-answer", selector: "#full-answer" },
];

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

const report = { shots: [], issues: [] };

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector(".dialogue-case-study", { timeout: 60000 });

  for (const sec of SECTIONS) {
    const el = page.locator(sec.selector).first();
    const visible = await el.isVisible().catch(() => false);
    if (!visible) {
      report.issues.push(`${sec.id}@${vp.name}: not visible`);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const file = `${STORE}/${sec.id}-${vp.name}.png`;
    await el.screenshot({ path: file });
    report.shots.push(file);
  }

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (overflow.scrollWidth > overflow.clientWidth + 1) {
    report.issues.push(`horizontal-overflow@${vp.name}`);
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
