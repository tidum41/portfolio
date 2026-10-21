#!/usr/bin/env node
/**
 * Side-by-side DS parity captures: reference PNG crop | live component (prod only).
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createConnection } from "node:net";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = process.env.DS_PARITY_STORE || "/cursor/stores/self/ds-parity";
const PORT = Number(process.env.ROUND35_PORT || 3020);
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

const CROPS = {
  "chat-shell": { file: "section-3.png", left: 700, top: 40, width: 850, height: 940 },
  "answer-card": { file: "section-3.png", left: 700, top: 40, width: 850, height: 940 },
  funnel: { file: "section-3.png", left: 750, top: 340, width: 800, height: 400 },
  "clip-card": { file: "section-5.png", left: 20, top: 380, width: 800, height: 500 },
  "study-chrome": { file: "section-6.png", left: 8, top: 8, width: 720, height: 720 },
};

async function portOpen(port) {
  return new Promise((resolve) => {
    const s = createConnection({ port, host: "127.0.0.1" }, () => {
      s.end();
      resolve(true);
    });
    s.on("error", () => resolve(false));
  });
}

async function assertProd() {
  const res = await fetch(`${BASE}/dialogue/ds-parity`);
  const text = await res.text();
  if (res.status !== 200) throw new Error(`ds-parity HTTP ${res.status}`);
  if (text.includes("<nextjs-portal") || text.includes("browser_dev_hmr")) {
    throw new Error("ds-parity served from Next dev — use next start");
  }
}

fs.mkdirSync(OUT, { recursive: true });

if (!(await portOpen(PORT))) {
  throw new Error(`No server on ${PORT}. Run: npm run build && npm run start -- -p ${PORT}`);
}
await assertProd();

for (const [id, crop] of Object.entries(CROPS)) {
  const src = path.join(ROOT, "public/dialogue", crop.file);
  const refOut = path.join(OUT, `${id}-ref.png`);
  await sharp(src).extract(crop).png().toFile(refOut);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 2000 } });
await page.goto(`${BASE}/dialogue/ds-parity`, { waitUntil: "load" });
await page.waitForFunction(() => document.fonts.ready);
await page.waitForTimeout(400);

for (const id of Object.keys(CROPS)) {
  const live = page.locator(`[data-parity-id="${id}"] [data-parity-live]`);
  const livePath = path.join(OUT, `${id}-live.png`);
  await live.screenshot({ path: livePath });

  const refMeta = await sharp(path.join(OUT, `${id}-ref.png`)).metadata();
  const liveBuf = await sharp(livePath).resize({ height: refMeta.height, fit: "contain", background: "#f8f6f3" }).png().toBuffer();
  const refBuf = await sharp(path.join(OUT, `${id}-ref.png`)).resize({ height: refMeta.height }).png().toBuffer();

  const refW = (await sharp(refBuf).metadata()).width;
  const liveW = (await sharp(liveBuf).metadata()).width;
  const totalW = refW + liveW;
  const h = refMeta.height;

  await sharp({
    create: { width: totalW, height: h, channels: 3, background: "#111111" },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: liveBuf, left: refW, top: 0 },
    ])
    .png()
    .toFile(path.join(OUT, `${id}-compare.png`));
}

await browser.close();

const report = `# Dialogue DS parity report

Generated: ${new Date().toISOString()}
Base: ${BASE}

## Reference sources

${Object.entries(CROPS)
  .map(([id, c]) => `- **${id}**: \`public/dialogue/${c.file}\` crop ${c.width}×${c.height} @ (${c.left},${c.top})`)
  .join("\n")}

## Side-by-side outputs

${Object.keys(CROPS)
  .map((id) => `- \`${id}-compare.png\` (left = reference, right = live @ 560px)`)
  .join("\n")}

## Remaining mismatches (visual / scope)

| Area | Gap |
|------|-----|
| **Font** | Live uses DM Sans (Google). Reference PNGs are rasterized product UI; subpixel weight may differ slightly from Helvetica-era portfolio shell. |
| **Icons** | Reference uses Dialogue logo star, chevrons, clip thumbnails; live figures use text/unicode placeholders (no invented SVG icons per brief). |
| **Clip card** | Reference \`section-5\` is full video + transcript shell; live parity row is text clip row from structured answer (section-3 clip style). |
| **Funnel** | Bar corner radius and track height approximate; focal pink now \`#BE185D\` (was \`#c0267a\`). |
| **Study chrome** | Reference includes placeholder skeleton lines in stat cards; live uses label-only tiles (layout unchanged). |
| **Shadows** | Dual shadow token matched; blur radii may differ ±1px at export scale. |
| **Anatomy** | Numbered callouts / leader lines are composition (unchanged this pass). |

## Token files

- \`components/dialogue/product/tokens.ts\`
- \`components/dialogue/product/tokens.css\`
- \`design/briefs/dialogue-ds-tokens.md\`
`;

fs.writeFileSync(path.join(OUT, "parity-report.md"), report);
console.log(JSON.stringify({ out: OUT, report: path.join(OUT, "parity-report.md") }, null, 2));
