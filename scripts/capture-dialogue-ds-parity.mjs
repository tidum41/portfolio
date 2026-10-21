#!/usr/bin/env node
/**
 * DS parity: reference = Paper static export DOM; live = /dialogue/ds-parity @ 400px (prod only).
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
const PANEL_W = 400;

/** Reference crops from static export HTML (same logical width as live panel). */
const REF_SPECS = {
  "chat-shell": {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: "[data-export-chat-panel]",
    clip: async (buf) => sharp(buf).resize({ width: PANEL_W }).png().toBuffer(),
  },
  "answer-card": {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: "[data-export-chat-panel]",
    clip: async (buf) => sharp(buf).resize({ width: PANEL_W }).png().toBuffer(),
  },
  funnel: {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: '[data-testid="viz-card"]',
    clip: async (buf) => sharp(buf).resize({ width: PANEL_W }).png().toBuffer(),
  },
  "clip-row": {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: '[data-anatomy-region="4"]',
    clip: async (buf) => sharp(buf).resize({ width: PANEL_W }).png().toBuffer(),
  },
  "follow-ups": {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: '[data-anatomy-region="5"]',
    clip: async (buf) => sharp(buf).resize({ width: PANEL_W }).png().toBuffer(),
  },
  "study-chrome": {
    html: "/dev/dialogue-static/export/section-6.html",
    selector: "[data-export-app-shell]",
    clip: async (buf) =>
      sharp(buf)
        .resize({ width: PANEL_W, fit: "inside" })
        .png()
        .toBuffer(),
  },
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

async function captureRef(browser, id, spec) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto(`${BASE}${spec.html}`, { waitUntil: "load" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const el = page.locator(spec.selector).first();
  const raw = await el.screenshot();
  await page.close();
  const clipped = spec.clip ? await spec.clip(raw) : raw;
  const refPath = path.join(OUT, `${id}-ref.png`);
  await sharp(clipped).png().toFile(refPath);
  return refPath;
}

async function overlayDiff(refBuf, liveBuf, w, h) {
  const ref = await sharp(refBuf).resize(w, h, { fit: "fill" }).ensureAlpha().raw().toBuffer();
  const live = await sharp(liveBuf).resize(w, h, { fit: "fill" }).ensureAlpha().raw().toBuffer();
  const blended = Buffer.alloc(ref.length);
  for (let i = 0; i < ref.length; i += 4) {
    blended[i] = Math.round(ref[i] * 0.5 + live[i] * 0.5);
    blended[i + 1] = Math.round(ref[i + 1] * 0.5 + live[i + 1] * 0.5);
    blended[i + 2] = Math.round(ref[i + 2] * 0.5 + live[i + 2] * 0.5);
    blended[i + 3] = 255;
  }
  return sharp(blended, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

fs.mkdirSync(OUT, { recursive: true });

if (!(await portOpen(PORT))) {
  throw new Error(`No server on ${PORT}. Run: npm run build && npm run start -- -p ${PORT}`);
}
await assertProd();

const browser = await chromium.launch();

for (const [id, spec] of Object.entries(REF_SPECS)) {
  await captureRef(browser, id, spec);
}

const page = await browser.newPage({ viewport: { width: 1280, height: 2400 } });
await page.goto(`${BASE}/dialogue/ds-parity`, { waitUntil: "load" });
await page.waitForFunction(() => document.fonts.ready);
await page.waitForTimeout(400);

for (const id of Object.keys(REF_SPECS)) {
  const live = page.locator(`[data-parity-id="${id}"] [data-parity-live]`);
  const livePath = path.join(OUT, `${id}-live.png`);
  await live.screenshot({ path: livePath });

  const refMeta = await sharp(path.join(OUT, `${id}-ref.png`)).metadata();
  const h = refMeta.height ?? 200;
  const refW = refMeta.width ?? PANEL_W;

  const liveBuf = await sharp(livePath)
    .resize({ width: refW, height: h, fit: "contain", background: "#f8f6f3" })
    .png()
    .toBuffer();
  const refBuf = await sharp(path.join(OUT, `${id}-ref.png`))
    .resize({ width: refW, height: h, fit: "fill" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: refW * 2, height: h, channels: 3, background: "#111111" },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: liveBuf, left: refW, top: 0 },
    ])
    .png()
    .toFile(path.join(OUT, `${id}-compare.png`));

  const overlay = await overlayDiff(refBuf, liveBuf, refW, h);
  await sharp(overlay).toFile(path.join(OUT, `${id}-overlay.png`));
}

await browser.close();

const report = `# Dialogue DS parity report

Generated: ${new Date().toISOString()}
Base: ${BASE}
Panel width: ${PANEL_W}px (Paper \`section-3.html\` chat panel)

## Paper / static source of truth

${[
  "/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt",
  "/cursor/stores/bot/dialogue-sources/paper/player-controls-paper-5SR-0.tsx.txt",
  "/cursor/stores/bot/dialogue-sources/paper/player-dialog-paper-597-0.txt",
  "public/dev/dialogue-static/_next/static/css/fde99ba4c3e111ce.css",
  "public/dev/dialogue-static/export/section-3.html",
  "public/dev/dialogue-static/export/section-6.html",
]
  .map((f) => `- \`${f}\``)
  .join("\n")}

## Reference captures (Playwright → static export selectors)

${Object.entries(REF_SPECS)
  .map(([id, s]) => `- **${id}**: \`${s.html}\` → \`${s.selector}\``)
  .join("\n")}

## Outputs

${Object.keys(REF_SPECS)
  .map(
    (id) =>
      `- \`${id}-compare.png\` (left = Paper export, right = live)\n- \`${id}-overlay.png\` (50% blend)`,
  )
  .join("\n")}

## Remaining mismatches (eyeball)

| Area | Notes |
|------|-------|
| **answer-card height** | Reference \`chat-shell\` and \`answer-card\` both screenshot the full export panel; live answer-card adds sources row — taller than ref for that id. |
| **chat-shell** | Header padding and scroll region should match \`p-7\` / \`gap-3\`; minor shadow blur delta vs rasterized export. |
| **funnel** | Per-step bar hex matches export; focal % brand weight may differ ±1px. |
| **clip-row** | Third thumb time in export reuses still-thumb-2; live uses still-thumb-1 for the third slot. |
| **study-chrome** | Live uses scale wrapper to 400px; sidebar wordmark grey vs any PNG review is aligned to \`#78716C\`. |
| **Sources row** | Not in parity ids; full structured answer on case study still shows source pills below clips. |

## Token files

- \`components/dialogue/product/tokens.ts\`
- \`components/dialogue/product/tokens.css\`
- \`design/briefs/dialogue-ds-tokens.md\`
`;

fs.writeFileSync(path.join(OUT, "parity-report.md"), report);
console.log(JSON.stringify({ out: OUT, report: path.join(OUT, "parity-report.md") }, null, 2));
