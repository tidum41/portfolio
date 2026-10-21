#!/usr/bin/env node
/**
 * DS parity: reference = Paper static export DOM (1×, transforms stripped); live = /dialogue/ds-parity.
 * Study chrome: live shell at Paper frame 922×540 (section-6), compare via PNG downscale to 400px width.
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
const STUDY_COMPARE_W = 400;
const MIN_STAT_CARD_W = 120;
const MAX_LABEL_LINES = 2;

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
    downscaleRefTo: STUDY_COMPARE_W,
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
  await page.waitForTimeout(400);
}

async function assertStudyChromeLayout(page) {
  const result = await page.evaluate(
    ({ minCardW, maxLines }) => {
      const shell = document.querySelector(
        '[data-parity-id="study-chrome"] [data-export-app-shell]',
      );
      if (!shell) return { ok: false, hits: ["missing-study-shell"] };
      const hits = [];
      const shellRect = shell.getBoundingClientRect();
      if (shellRect.width < 900 || shellRect.width > 940) {
        hits.push(`shell-width:${Math.round(shellRect.width)}`);
      }
      const cardMin = shellRect.width < 1000 ? 64 : minCardW;
      shell.querySelectorAll(".dp-app-stat-card").forEach((card) => {
        const w = card.getBoundingClientRect().width;
        if (w < cardMin) hits.push(`stat-card-narrow:${Math.round(w)}`);
      });
      const checkLines = (el, max) => {
        const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
        if (text.length < 2) return;
        const st = getComputedStyle(el);
        const lh = parseFloat(st.lineHeight);
        if (!Number.isFinite(lh) || lh <= 0) return;
        const lines = el.getBoundingClientRect().height / lh;
        if (lines > max + 0.35) {
          hits.push(`text-wrap:${text.slice(0, 24)}:${lines.toFixed(1)}lines`);
        }
      };
      shell
        .querySelectorAll(
          ".dp-app-stat-card__label, .dp-app-sidebar__nav-item, .dp-app-main__title, .dp-app-tab",
        )
        .forEach((el) => checkLines(el, maxLines));
      return { ok: hits.length === 0, hits, shellW: Math.round(shellRect.width) };
    },
    { minCardW: MIN_STAT_CARD_W, maxLines: MAX_LABEL_LINES },
  );
  if (!result.ok) {
    throw new Error(`study-chrome layout: ${result.hits.join(", ")}`);
  }
  return result;
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
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto(`${BASE}${spec.html}`, { waitUntil: "load" });
  await page.waitForFunction(() => document.fonts.ready);
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

async function downscaleToWidth(pngPath, width) {
  const meta = await sharp(pngPath).metadata();
  if (!meta.width || meta.width <= width) return pngPath;
  const out = pngPath.replace(/\.png$/, "-scaled.png");
  await sharp(pngPath).resize({ width, withoutEnlargement: true }).png().toFile(out);
  return out;
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

const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });
await page.goto(`${BASE}/dialogue/ds-parity`, { waitUntil: "load" });
await waitForDmSans(page);
await page.waitForTimeout(300);

const fontAudit = await page.evaluate(() => {
  const bubble = document.querySelector('[data-parity-id="chat-shell"] .dp-user-bubble p');
  const panel = document.querySelector('[data-parity-id="chat-shell"] .dp-study-chat');
  const st = bubble ? getComputedStyle(bubble) : null;
  const panelSt = panel ? getComputedStyle(panel) : null;
  const head = document.querySelector('[data-parity-id="chat-shell"] .dp-study-chat__head');
  const headSt = head ? getComputedStyle(head) : null;
  return {
    bubbleFontSize: st?.fontSize,
    bubbleFontFamily: st?.fontFamily,
    headPaddingTop: headSt?.paddingTop,
    bodyPadInline: panel
      ? getComputedStyle(document.querySelector('[data-parity-id="chat-shell"] .dp-study-chat__body'))
          ?.paddingLeft
      : null,
    dmSansLoaded:
      document.fonts.check('400 16px "DM Sans"') || document.fonts.check('16px "DM Sans"'),
    fontsReady: document.fonts.status === "loaded",
  };
});

const strictFont = process.env.DS_PARITY_STRICT_FONT === "1";
if (strictFont) {
  if (!fontAudit.dmSansLoaded) {
    throw new Error(`DM Sans not loaded before live capture: ${JSON.stringify(fontAudit)}`);
  }
  if (fontAudit.bubbleFontSize !== "16px") {
    throw new Error(`Chat bubble not 16px before capture: ${JSON.stringify(fontAudit)}`);
  }
  if (fontAudit.headPaddingTop !== "28px" || fontAudit.bodyPadInline !== "28px") {
    throw new Error(`Chat panel padding expected 28px (p-7): ${JSON.stringify(fontAudit)}`);
  }
} else if (!fontAudit.dmSansLoaded) {
  console.warn(`[ds-parity] font audit (non-fatal): ${JSON.stringify(fontAudit)}`);
}

const studyLayout = await assertStudyChromeLayout(page);

for (const id of Object.keys(REF_SPECS)) {
  const live =
    id === "study-chrome"
      ? page.locator('[data-parity-id="study-chrome"] [data-export-app-shell]')
      : page.locator(`[data-parity-id="${id}"] [data-parity-live]`);

  const livePath = path.join(OUT, `${id}-live.png`);
  await live.screenshot({ path: livePath, animations: "disabled" });

  let refPath = path.join(OUT, `${id}-ref.png`);
  let liveComparePath = livePath;

  if (id === "study-chrome") {
    liveComparePath = await downscaleToWidth(livePath, STUDY_COMPARE_W);
    refPath = path.join(OUT, `${id}-ref.png`);
  }

  const refMeta = await sharp(refPath).metadata();
  const compareW = id === "study-chrome" ? STUDY_COMPARE_W : (refMeta.width ?? PANEL_W);
  const h = refMeta.height ?? 200;

  const liveBuf = await sharp(liveComparePath)
    .resize({ width: compareW, height: h, fit: "contain", background: "#f8f6f3" })
    .png()
    .toBuffer();
  const refBuf = await sharp(refPath)
    .resize({ width: compareW, height: h, fit: "fill" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: compareW * 2, height: h, channels: 3, background: "#111111" },
  })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: liveBuf, left: compareW, top: 0 },
    ])
    .png()
    .toFile(path.join(OUT, `${id}-compare.png`));

  const overlay = await overlayDiff(refBuf, liveBuf, compareW, h);
  await sharp(overlay).toFile(path.join(OUT, `${id}-overlay.png`));
}

await browser.close();

const report = `# Dialogue DS parity report

Generated: ${new Date().toISOString()}
Base: ${BASE}

## Font / layout gates

\`\`\`json
${JSON.stringify({ fontAudit, studyLayout }, null, 2)}
\`\`\`

Study chrome: full shell rendered at CSS size, compare PNGs downscaled to ${STUDY_COMPARE_W}px width.

## Token files

- \`components/dialogue/product/tokens.ts\`
- \`components/dialogue/product/tokens.css\`
`;

fs.writeFileSync(path.join(OUT, "parity-report.md"), report);
console.log(
  JSON.stringify({ out: OUT, fontAudit, studyLayout, report: path.join(OUT, "parity-report.md") }, null, 2),
);
