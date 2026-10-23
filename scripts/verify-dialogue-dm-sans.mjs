#!/usr/bin/env node
/**
 * Assert DM Sans is loaded + painted in Dialogue figures.
 * - document.fonts.check('14px "DM Sans"')
 * - Pixel-diff sample word vs Arial (must differ) and vs explicit DM Sans (must match)
 * - Real-pixel side-by-side vs chat-01-top crop at scale 1
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const PORT = Number(process.env.PORT || 3020);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = process.env.OUT || "/cursor/stores/self/parity";
const ART = "/opt/cursor/artifacts";
const REF_FULL =
  process.env.REF_CHAT ||
  "/home/ubuntu/.cursor/projects/workspace/uploads/chat-01-top_1be0.png";
const PANEL = { left: 1434, top: 518, width: 448, height: 658 };
const SAMPLE = "Shipping address";

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ART, { recursive: true });

async function pixelDiffPct(aPath, bPath) {
  const metaA = await sharp(aPath).metadata();
  const metaB = await sharp(bPath).metadata();
  const w = Math.max(metaA.width, metaB.width);
  const h = Math.max(metaA.height, metaB.height);
  const pad = async (p) =>
    sharp(p)
      .ensureAlpha()
      .extend({
        top: 0,
        left: 0,
        right: w - (await sharp(p).metadata()).width,
        bottom: h - (await sharp(p).metadata()).height,
        background: { r: 252, g: 251, b: 249, alpha: 1 },
      })
      .raw()
      .toBuffer({ resolveWithObject: true });
  const A = await pad(aPath);
  const B = await pad(bPath);
  let n = 0;
  const total = w * h;
  for (let i = 0; i < A.data.length; i += 4) {
    const d =
      Math.abs(A.data[i] - B.data[i]) +
      Math.abs(A.data[i + 1] - B.data[i + 1]) +
      Math.abs(A.data[i + 2] - B.data[i + 2]);
    if (d > 40) n++;
  }
  return (n / total) * 100;
}

async function main() {
  if (!fs.existsSync(REF_FULL)) {
    throw new Error(`Missing ref chat screenshot: ${REF_FULL}`);
  }

  const refPanel = path.join(OUT, "t384-ref-chat-panel.png");
  await sharp(REF_FULL).extract(PANEL).png().toFile(refPanel);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle", timeout: 120000 });
  await page.evaluate(async () => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.removeAttribute("data-intro");
    await document.fonts.ready;
    await Promise.all([
      document.fonts.load('400 14px "DM Sans"'),
      document.fonts.load('500 14px "DM Sans"'),
      document.fonts.load('600 14px "DM Sans"'),
    ]);
  });

  const fontReport = await page.evaluate(async () => {
    await document.fonts.ready;
    const checks = {
      dm14: document.fonts.check('14px "DM Sans"'),
      dm400: document.fonts.check('400 14px "DM Sans"'),
      dm600: document.fonts.check('600 14px "DM Sans"'),
    };
    const loaded = [...document.fonts]
      .filter((f) => f.family === "DM Sans" && f.status === "loaded")
      .map((f) => f.weight);
    const frames = [...document.querySelectorAll(".dialogue-chart-gallery .dialogue-rachel-frame")];
    const funnel = frames.find((f) =>
      f.querySelector(".dialogue-rachel-frame__label")?.textContent?.includes("Drop-off")
    );
    const chat = funnel?.querySelector(".dp-study-chat");
    const summary = chat?.querySelector(".dp-summary");
    const cs = summary ? getComputedStyle(summary) : null;
    const title = chat?.querySelector(".dp-study-chat__title")?.textContent?.trim();
    const beta = chat?.querySelector(".dp-study-chat__beta")?.textContent?.trim();
    const rule = !!chat?.querySelector(".dp-study-chat__rule");
    const minimize = !!chat?.querySelector(".dp-study-chat__minimize");
    const composer = chat?.querySelector(".dp-study-chat__composer-placeholder")?.textContent?.trim();
    return {
      checks,
      loaded,
      summaryFont: cs?.fontFamily ?? null,
      chrome: { title, beta, rule, minimize, composer },
      hasVarOnChat: !!getComputedStyle(chat || document.body)
        .getPropertyValue("--font-dialogue-dm-sans")
        .trim(),
    };
  });

  // Glyph strip: identical box styles; only font-family differs.
  // "ours" uses the computed stack from a live .dp-summary inside the figure.
  const figureStack = await page.evaluate(() => {
    const el =
      document.querySelector(".dialogue-chart-gallery .dp-summary") ||
      document.querySelector(".dp-summary") ||
      document.querySelector(".dp-study-chat");
    return el ? getComputedStyle(el).fontFamily : '"DM Sans", sans-serif';
  });
  await page.evaluate(
    ({ sample, figureStack }) => {
      const root = document.querySelector(".dialogue-case-study-root");
      const host = document.createElement("div");
      host.id = "dm-glyph-host";
      host.className = root?.className || "";
      host.style.cssText =
        "position:fixed;left:0;top:0;z-index:999999;background:#fcfbf9;padding:12px 16px;";
      const mk = (id, ff, last = false) => {
        const p = document.createElement("p");
        p.id = id;
        p.textContent = sample;
        p.style.margin = last ? "0" : "0 0 10px";
        p.style.padding = "0";
        p.style.border = "0";
        p.style.background = "#fcfbf9";
        p.style.fontSize = "28px";
        p.style.lineHeight = "34px";
        p.style.height = "34px";
        p.style.overflow = "hidden";
        p.style.fontWeight = "400";
        p.style.color = "#1c1917";
        p.style.letterSpacing = "normal";
        p.style.webkitFontSmoothing = "antialiased";
        p.style.textRendering = "geometricPrecision";
        p.style.fontFamily = ff;
        return p;
      };
      host.appendChild(mk("g-ours", figureStack));
      host.appendChild(mk("g-dm", '"DM Sans"'));
      host.appendChild(mk("g-ar", "Arial", true));
      document.body.appendChild(host);
    },
    { sample: SAMPLE, figureStack }
  );

  const gOurs = path.join(OUT, "t384-glyph-ours.png");
  const gDm = path.join(OUT, "t384-glyph-dm.png");
  const gAr = path.join(OUT, "t384-glyph-arial.png");
  await page.locator("#g-ours").screenshot({ path: gOurs });
  await page.locator("#g-dm").screenshot({ path: gDm });
  await page.locator("#g-ar").screenshot({ path: gAr });

  const vsDm = await pixelDiffPct(gOurs, gDm);
  const vsAr = await pixelDiffPct(gOurs, gAr);
  const dmVsAr = await pixelDiffPct(gDm, gAr);

  // Native 448 capture of funnel chat (inside layout + font class)
  const ourPath = path.join(OUT, "t384-our-chat-native.png");
  await page.evaluate(() => {
    document.getElementById("dm-glyph-host")?.remove();
    const frames = [...document.querySelectorAll(".dialogue-chart-gallery .dialogue-rachel-frame")];
    const funnel = frames.find((f) =>
      f.querySelector(".dialogue-rachel-frame__label")?.textContent?.includes("Drop-off")
    );
    const chat = funnel?.querySelector(".dp-study-chat");
    if (!chat) throw new Error("no funnel chat");
    const host = document.createElement("div");
    host.id = "pixel-parity-host";
    // Keep inside layout root for variable scope; also rely on className on chat
    const layout = document.querySelector(".dialogue-case-study-root") || document.body;
    host.style.cssText =
      "position:fixed;left:16px;top:16px;width:448px;height:658px;z-index:999999;background:#e7e5e4;overflow:hidden;";
    const wrap = document.createElement("div");
    wrap.className = "dialogue-product-root dp-chat-panel-typography";
    wrap.style.cssText = "width:448px;height:658px;";
    const clone = chat.cloneNode(true);
    clone.style.width = "448px";
    clone.style.height = "658px";
    clone.style.maxHeight = "658px";
    wrap.appendChild(clone);
    host.appendChild(wrap);
    layout.appendChild(host);
  });
  await page.waitForTimeout(200);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load('400 14px "DM Sans"');
  });
  await page.locator("#pixel-parity-host .dp-study-chat").screenshot({
    path: ourPath,
    animations: "disabled",
  });

  // Side-by-side full panels
  const labelH = 36;
  const pad = 24;
  const gap = 20;
  const captionH = 80;
  const colW = 448;
  const colH = 658;
  const totalW = pad * 2 + colW * 2 + gap;
  const totalH = pad + labelH + colH + pad + captionH;
  const svg = `
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f4"/>
      <text x="${pad}" y="${pad + 22}" font-family="DM Sans, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#1c1917">Reference — chat-01-top @ scale 1 (448×658)</text>
      <text x="${pad + colW + gap}" y="${pad + 22}" font-family="DM Sans, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#1c1917">Ours — Study chat @ 448 (DM Sans + chrome)</text>
      <text x="${pad}" y="${pad + labelH + colH + 28}" font-family="DM Sans, Helvetica, sans-serif" font-size="12" fill="#57534d">fonts.check DM Sans: ${fontReport.checks.dm14}; glyph ours↔DM ${vsDm.toFixed(1)}% · ours↔Arial ${vsAr.toFixed(1)}% · DM↔Arial ${dmVsAr.toFixed(1)}%</text>
      <text x="${pad}" y="${pad + labelH + colH + 48}" font-family="DM Sans, Helvetica, sans-serif" font-size="12" fill="#57534d">Chrome: title “${fontReport.chrome.title}” · Beta · minimize · hairline · composer. Body keeps chart answer content.</text>
    </svg>`;
  const sbsPath = path.join(OUT, "t384-pixel-side-by-side.png");
  await sharp(Buffer.from(svg))
    .composite([
      { input: refPanel, left: pad, top: pad + labelH },
      { input: ourPath, left: pad + colW + gap, top: pad + labelH },
    ])
    .png()
    .toFile(sbsPath);

  // Align crop: ref assistant block vs our bubble+assistant
  const alignPath = path.join(OUT, "t384-pixel-side-by-side-align.png");
  const refAlign = await sharp(refPanel)
    .extract({ left: 0, top: 70, width: 448, height: 280 })
    .png()
    .toBuffer();
  const ourAlign = await sharp(ourPath)
    .extract({ left: 0, top: 70, width: 448, height: 280 })
    .png()
    .toBuffer();
  const alignH = 36 + 280 + 24;
  const alignSvg = `
    <svg width="${totalW}" height="${alignH + pad}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f4"/>
      <text x="${pad}" y="${pad + 22}" font-family="DM Sans, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#1c1917">Ref — assistant content band</text>
      <text x="${pad + colW + gap}" y="${pad + 22}" font-family="DM Sans, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#1c1917">Ours — bubble + assistant + chart</text>
    </svg>`;
  await sharp(Buffer.from(alignSvg))
    .composite([
      { input: refAlign, left: pad, top: pad + 36 },
      { input: ourAlign, left: pad + colW + gap, top: pad + 36 },
    ])
    .png()
    .toFile(alignPath);

  await browser.close();

  const okFonts = fontReport.checks.dm14 && fontReport.checks.dm400 && fontReport.checks.dm600;
  // Ours must track explicit DM Sans and clearly diverge from Arial.
  const okGlyph = vsDm < 8 && vsAr > 20 && vsDm * 2 < vsAr;
  const okChrome =
    fontReport.chrome.title === "Study chat" &&
    fontReport.chrome.beta === "Beta" &&
    fontReport.chrome.rule &&
    fontReport.chrome.minimize &&
    /Ask about your study/.test(fontReport.chrome.composer || "");

  const report = {
    ok: okFonts && okGlyph && okChrome,
    okFonts,
    okGlyph,
    okChrome,
    fontReport,
    glyph: { vsDm, vsAr, dmVsAr, threshold: { vsDmMax: 8, vsArMin: 20 } },
    panelCrop: PANEL,
    artifacts: { refPanel, ourPath, sbsPath, alignPath, gOurs, gDm, gAr },
  };

  const md = [
    "# DM Sans + chrome pixel verify",
    "",
    `**Pass:** ${report.ok ? "YES" : "NO"}`,
    "",
    `| Check | Result |`,
    `|---|---|`,
    `| \`document.fonts.check('14px \"DM Sans\"')\` | ${fontReport.checks.dm14} |`,
    `| Glyph ours↔DM Sans | ${vsDm.toFixed(2)}% (want <8) |`,
    `| Glyph ours↔Arial | ${vsAr.toFixed(2)}% (want >20 and ≫ DM) |`,
    `| Chrome Study chat + Beta + minimize + rule + composer | ${okChrome} |`,
    `| Computed font-family | \`${fontReport.summaryFont}\` |`,
    "",
    `Artifacts: \`${sbsPath}\`, \`${alignPath}\``,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(OUT, "t384-dm-sans-verify.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT, "t384-dm-sans-verify.md"), md);
  for (const f of [sbsPath, alignPath, ourPath, refPanel, gOurs, gDm, gAr, path.join(OUT, "t384-dm-sans-verify.md")]) {
    fs.copyFileSync(f, path.join(ART, path.basename(f)));
  }
  console.log(md);
  if (!report.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
