/**
 * Audit /dialogue figures at 1440 and 390 — measure + screenshot sections.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const PORT = Number(process.env.PORT || 3020);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = process.env.OUT || "/cursor/stores/self/parity";
fs.mkdirSync(OUT, { recursive: true });

const SECTIONS = [
  { id: "lead", sel: ".dialogue-lead-answer" },
  { id: "anatomy", sel: '[data-dialogue-asset-id="D-08"]' },
  { id: "gallery", sel: ".dialogue-chart-gallery" },
  { id: "clip-player", sel: '[data-dialogue-asset-id="D-10"], #clips .dialogue-live-block' },
  { id: "placement", sel: "#placement" },
  { id: "problem", sel: '[data-dialogue-asset-id="D-02"]' },
  { id: "hero", sel: ".dialogue-hero-media" },
  { id: "full-answer", sel: "#full-answer" },
];

const browser = await chromium.launch();
const report = { viewports: {} };

for (const vp of [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
]) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(`${BASE}/dialogue`, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector(".dialogue-case-study", { timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const metrics = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const qa = (s) => [...document.querySelectorAll(s)];
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        x: Math.round(r.x),
      };
    };
    const pe = (el) => (el ? getComputedStyle(el).pointerEvents : null);
    const us = (el) => (el ? getComputedStyle(el).userSelect : null);

    const panels = qa(".dialogue-lead-answer__panel .dp-scaled-viewport");
    const inners = qa(".dialogue-lead-answer__panel .dp-scaled-viewport__inner");
    const chats = qa(".dp-study-chat");
    const staticBlocks = qa(".dialogue-product-block--static");
    const labels = qa(".dialogue-rachel-frame__label");
    const launcher = q(".dp-bubble-launcher");
    const launcherIcon = q(".dp-bubble-launcher__icon");
    const pills = qa(".dp-source-pill");
    const selectedPills = qa(".dp-source-pill--selected");
    const thumbs = qa(".dp-clip-thumbs__img");
    const transcriptRows = qa(".dp-synced-transcript__row");
    const anatomyNums = qa(".dp-anatomy__num");
    const anatomyScene = q(".dp-anatomy-scene") || q(".dp-anatomy");

    const chatWidths = chats.slice(0, 12).map((el) => {
      const r = el.getBoundingClientRect();
      const parent = el.closest(".dp-scaled-viewport__inner");
      const scale = parent
        ? parseFloat(
            (parent.style.transform || "").match(/scale\(([^)]+)\)/)?.[1] || "1",
          )
        : 1;
      return {
        renderedW: Math.round(r.width),
        layoutW: Math.round(r.width / (scale || 1)),
        scale: Number(scale.toFixed(3)),
      };
    });

    const leadInner = inners.map((el) => ({
      styleW: el.style.width,
      transform: el.style.transform,
      h: Math.round(el.getBoundingClientRect().height),
      panelH: Math.round(
        el.closest(".dp-scaled-viewport")?.getBoundingClientRect().height || 0,
      ),
    }));

    const rowMeta = transcriptRows.map((row) => {
      const r = row.getBoundingClientRect();
      const text = row.querySelector(".dp-synced-transcript__text");
      const meta = row.querySelector(".dp-synced-transcript__meta");
      const tr = text?.getBoundingClientRect();
      const mr = meta?.getBoundingClientRect();
      return {
        active: row.classList.contains("dp-synced-transcript__row--active"),
        speaker: row.querySelector(".dp-synced-transcript__speaker")?.textContent || "",
        time: row.querySelector(".dp-synced-transcript__time")?.textContent || "",
        textLeft: tr ? Math.round(tr.left) : null,
        metaLeft: mr ? Math.round(mr.left) : null,
        rowLeft: Math.round(r.left),
        rowW: Math.round(r.width),
        html: row.textContent?.slice(0, 80),
      };
    });

    return {
      staticCount: staticBlocks.length,
      staticPE: staticBlocks.map(pe),
      staticUS: staticBlocks.map(us),
      leadPanelHeights: panels.map((el) => Math.round(el.getBoundingClientRect().height)),
      leadInner,
      chatWidths,
      labelStyles: labels.slice(0, 4).map((el) => {
        const cs = getComputedStyle(el);
        return {
          text: el.textContent,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          color: cs.color,
          marginBottom: cs.marginBottom,
        };
      }),
      launcher: launcher
        ? {
            text: launcher.textContent?.trim(),
            hasSvg: !!launcherIcon,
            r: rect(launcher),
          }
        : null,
      pills: pills.map((p) => p.textContent),
      selectedPills: selectedPills.map((p) => p.textContent),
      thumbCount: thumbs.length,
      thumbSrcs: thumbs.slice(0, 6).map((t) => t.getAttribute("src")),
      thumbFilter: thumbs[0] ? getComputedStyle(thumbs[0]).filter : null,
      transcriptRows: rowMeta,
      anatomyNums: anatomyNums.length,
      anatomyNumBg: anatomyNums[0]
        ? getComputedStyle(anatomyNums[0]).backgroundColor
        : null,
      anatomyInScaled: !!anatomyScene?.closest(".dp-scaled-viewport__inner"),
      focusableInStatic: staticBlocks.flatMap((b) =>
        [...b.querySelectorAll("a,button,input,[tabindex]")].map(
          (el) => el.tagName + (el.getAttribute("tabindex") || ""),
        ),
      ),
    };
  });

  report.viewports[vp.name] = metrics;

  for (const section of SECTIONS) {
    const loc = page.locator(section.sel).first();
    if ((await loc.count()) === 0) continue;
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const file = path.join(OUT, `${section.id}-${vp.name}.png`);
    await loc.screenshot({ path: file, animations: "disabled" });
  }

  await page.close();
}

fs.writeFileSync(path.join(OUT, "audit.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
