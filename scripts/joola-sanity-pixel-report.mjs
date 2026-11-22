/**
 * Portfolio-side figure captures for review (prototype repo was not accessible
 * in this environment, so no cross-repo pixelmatch baseline).
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("artifacts/joola-sanity/figures");
const BASE = process.env.JOOLA_CAPTURE_BASE ?? "http://localhost:3000";

const FIGURES = [
  { sel: "#solution .joola-stage", name: "quick-order-hero", w: 750, h: 520 },
  { sel: "#decision-1 .joola-stage", name: "decision-1-line", w: 750, h: 280 },
  { sel: "#decision-2 .joola-stage", name: "decision-2-compare", w: 750, h: 320 },
  { sel: "#decision-3 .joola-stage", name: "decision-3-credit", w: 750, h: 280 },
  { sel: "#decision-4 .joola-stage", name: "decision-4-approvals", w: 750, h: 400 },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/joola`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const rows = [];
  for (const fig of FIGURES) {
    const loc = page.locator(fig.sel).first();
    await loc.waitFor({ state: "visible", timeout: 15000 });
    const box = await loc.boundingBox();
    const file = path.join(OUT, `${fig.name}-portfolio.png`);
    await loc.screenshot({ path: file });
    rows.push({
      figure: fig.name,
      portfolio: file,
      prototype: "n/a (repo tidum41/joola-b2b-casestudy not available)",
      diffPct: "n/a",
      note: `viewport ${fig.w}x${fig.h} target; captured element box ${Math.round(box?.width ?? 0)}x${Math.round(box?.height ?? 0)}`,
    });
  }

  await browser.close();
  await writeFile(path.join(OUT, "diff-table.json"), JSON.stringify(rows, null, 2));
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
