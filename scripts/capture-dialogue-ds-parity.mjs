#!/usr/bin/env node
/**
 * DS parity: reference = Paper static export DOM (1×, transforms stripped); live = /dialogue/ds-parity @ 400px.
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

/** Reference crops from static export HTML at native CSS width (no upscaling). */
const REF_SPECS = {
  "chat-shell": {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: "[data-export-chat-panel]",
  },
  "answer-card": {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: "[data-export-chat-panel]",
  },
  funnel: {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: '[data-testid="viz-card"]',
  },
  "clip-row": {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: '[data-anatomy-region="4"]',
  },
  "follow-ups": {
    html: "/dev/dialogue-static/export/section-3.html",
    selector: '[data-anatomy-region="5"]',
  },
  "study-chrome": {
    html: "/dev/dialogue-static/export/section-6.html",
    selector: "[data-export-app-shell]",
    downscaleRefTo: PANEL_W,
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

async function waitForDmSans(page) {
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      document.fonts.check('400 16px "DM Sans"') ||
      document.fonts.check('16px "DM Sans"') ||
      document.fonts.check('14px "DM Sans"'),
    undefined,
    { timeout: 15000 },
  );
}

/** Reset ancestor transforms so element screenshots use layout CSS width (not export canvas scale). */
async function prepareExportRoot(page, selector) {
  await page.evaluate((sel) => {
    const target = document.querySelector(sel);
    if (!target) return;
    document.body.style.margin = "0";
    document.body.style.padding = "16px";
    document.body.style.background = "#f8f6f3";
    let p = target;
    while (p) {
      p.style.transform = "none";
      p.style.filter = "none";
      p = p.parentElement;
    }
  }, selector);
}

async function captureRef(browser, id, spec) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
  await page.goto(`${BASE}${spec.html}`, { waitUntil: "load" });
  await waitForDmSans(page);
  await prepareExportRoot(page, spec.selector);
  await page.waitForTimeout(200);
  const el = page.locator(spec.selector).first();
  await el.waitFor({ state: "visible", timeout: 15000 });
  const raw = await el.screenshot({ animations: "disabled" });
  await page.close();

  let buf = raw;
  const meta = await sharp(buf).metadata();
  if (spec.downscaleRefTo && meta.width && meta.width > spec.downscaleRefTo) {
    buf = await sharp(buf)
      .resize({ width: spec.downscaleRefTo, withoutEnlargement: true })
      .png()
      .toBuffer();
  }

  const refPath = path.join(OUT, `${id}-ref.png`);
  await sharp(buf).png().toFile(refPath);
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
await waitForDmSans(page);
await page.waitForTimeout(300);

const fontAudit = await page.evaluate(() => {
  const bubble = document.querySelector('[data-parity-id="chat-shell"] .dp-user-bubble p');
  const st = bubble ? getComputedStyle(bubble) : null;
  return {
    bubbleFontSize: st?.fontSize,
    bubbleFontFamily: st?.fontFamily,
    dmSansLoaded:
      document.fonts.check('400 16px "DM Sans"') || document.fonts.check('16px "DM Sans"'),
    fontsReady: document.fonts.status === "loaded",
  };
});

if (!fontAudit.dmSansLoaded) {
  throw new Error(`DM Sans not loaded before live capture: ${JSON.stringify(fontAudit)}`);
}
if (fontAudit.bubbleFontSize !== "16px") {
  throw new Error(`Chat bubble not 16px before capture: ${JSON.stringify(fontAudit)}`);
}

for (const id of Object.keys(REF_SPECS)) {
  const live = page.locator(`[data-parity-id="${id}"] [data-parity-live]`);
  const livePath = path.join(OUT, `${id}-live.png`);
  await live.screenshot({ path: livePath });

  const refMeta = await sharp(path.join(OUT, `${id}-ref.png`)).metadata();
  const refW = refMeta.width ?? PANEL_W;
  const h = refMeta.height ?? 200;

  const liveMeta = await sharp(livePath).metadata();
  if (liveMeta.width !== refW) {
    console.warn(
      JSON.stringify({
        warn: "width-mismatch",
        id,
        refW,
        liveW: liveMeta.width,
      }),
    );
  }

  const compareW = refW;
  const compareH = h;

  const liveBuf = await sharp(livePath)
    .resize({ width: compareW, height: compareH, fit: "contain", background: "#f8f6f3" })
    .png()
    .toBuffer();
  const refBuf = await sharp(path.join(OUT, `${id}-ref.png`))
    .resize({ width: compareW, height: compareH, fit: "fill" })
    .png()
    .toBuffer();

  if (liveMeta.width && Math.abs(liveMeta.width - compareW) > 2) {
    console.warn(
      JSON.stringify({ warn: "live-width-drift", id, expected: compareW, liveW: liveMeta.width }),
    );
  }

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
Panel width: ${PANEL_W}px

## Font gate (live capture)

\`\`\`json
${JSON.stringify(fontAudit, null, 2)}
\`\`\`

## Remaining mismatches (eyeball)

| Area | Notes |
|------|-------|
| **answer-card height** | Live includes sources row below clips; ref panel crop is full export panel only. |
| **study-chrome** | Ref downscaled from 922px export shell to ${PANEL_W}px; live uses native \`dp-app-shell--parity-400\` (no transform). |
| **clip-row** | Third thumb matches export (\`still-thumb-2\` @ 16:02). |

## Token files

- \`components/dialogue/product/tokens.ts\`
- \`components/dialogue/product/tokens.css\`
`;

fs.writeFileSync(path.join(OUT, "parity-report.md"), report);
console.log(JSON.stringify({ out: OUT, fontAudit, report: path.join(OUT, "parity-report.md") }, null, 2));
