import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const OUT = "/opt/cursor/artifacts/card-lab-crops";
await mkdir(OUT, { recursive: true });

const concepts = [
  "expanding-chip","pill-row","outcome-metric","status-line","brand-lockup",
  "dual-cta","numbered-index","cursor-label","stagger-reveal","gated-nda",
  "row-wash","attribution-fade","chevron-reveal","grayscale-color","expand-caption",
];

const browser = await chromium.launch({ headless: true });
for (const { width, height, tag } of [
  { width: 1440, height: 900, tag: "1440" },
  { width: 390, height: 844, tag: "390" },
]) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/dev/card-lab?theme=light&hover=all`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  for (const id of concepts) {
    const section = page.locator(`section[data-cl-concept="${id}"]`);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    const path = `${OUT}/${id}-${tag}.png`;
    await section.screenshot({ path });
    console.log("wrote", path);
  }
  await ctx.close();
}
await browser.close();
console.log("done");
