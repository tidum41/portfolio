/**
 * At 390px viewport: list figure text nodes with effective font-size < 11px,
 * and text clipped outside the figure pad's visible bounds.
 * Exit 1 if either list is non-empty.
 */
import { chromium } from "playwright";

const PORT = Number(process.env.PORT || 3020);
const BASE = `http://127.0.0.1:${PORT}`;

function auditPage(page) {
  return page.evaluate(() => {
    const pads = [...document.querySelectorAll(".dialogue-case-study .dialogue-rachel-frame__pad")];

    const tooSmall = [];
    const clipped = [];

    const figureScale = (root) => {
      let scale = 1;
      const vp = root.querySelector(".dp-scaled-viewport");
      const ds = vp?.getAttribute("data-scale");
      if (ds) scale *= parseFloat(ds) || 1;
      const scene = root.querySelector(".dp-placement-scene");
      if (scene) {
        const tr = getComputedStyle(scene).transform;
        if (tr && tr !== "none") {
          const m = new DOMMatrix(tr);
          scale *= m.a;
        }
      }
      return scale;
    };

    for (const pad of pads) {
      const root =
        pad.querySelector(".dialogue-product-block, .dp-placement-layer, .dialogue-live-figure-shell") ||
        pad;
      const frameEl =
        pad.querySelector(".dp-scaled-viewport__clip, .dp-placement-viewport, .dp-scaled-viewport") ||
        pad;
      const frameRect = frameEl.getBoundingClientRect();
      const scale = figureScale(pad);

      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = tw.nextNode())) {
        const text = node.textContent.replace(/\s+/g, " ").trim();
        if (!text) continue;
        const el = node.parentElement;
        if (!el) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) {
          continue;
        }
        const fs = parseFloat(cs.fontSize);
        const effective = fs * scale;
        if (Number.isFinite(effective) && effective < 11) {
          tooSmall.push({
            px: Math.round(effective * 10) / 10,
            cssPx: Math.round(fs * 10) / 10,
            scale: Math.round(scale * 1000) / 1000,
            text: text.slice(0, 80),
            asset: root.closest("[data-dialogue-asset-id]")?.getAttribute("data-dialogue-asset-id"),
          });
        }

        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
        for (const r of rects) {
          const intersects =
            r.right > frameRect.left &&
            r.left < frameRect.right &&
            r.bottom > frameRect.top &&
            r.top < frameRect.bottom;
          if (!intersects) continue;
          const contained =
            r.left >= frameRect.left - 0.5 &&
            r.right <= frameRect.right + 0.5 &&
            r.top >= frameRect.top - 0.5 &&
            r.bottom <= frameRect.bottom + 0.5;
          if (!contained) {
            clipped.push({
              text: text.slice(0, 60),
              asset: root.closest("[data-dialogue-asset-id]")?.getAttribute("data-dialogue-asset-id"),
              delta: {
                left: Math.round(r.left - frameRect.left),
                right: Math.round(frameRect.right - r.right),
                top: Math.round(r.top - frameRect.top),
                bottom: Math.round(frameRect.bottom - r.bottom),
              },
            });
            break;
          }
        }
      }
    }

    return { tooSmall, clipped, padCount: pads.length };
  });
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/dialogue`, { waitUntil: "load", timeout: 180000 });
await page.waitForFunction(
  () =>
    document.querySelector(".dialogue-case-study") &&
    document.querySelectorAll(".dialogue-case-study .dialogue-rachel-frame__pad").length > 0,
  { timeout: 120000 },
);
await page.evaluate(async () => {
  await document.fonts.ready;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const step = Math.max(280, Math.floor(window.innerHeight * 0.45));
  const max = document.documentElement.scrollHeight;
  for (let y = 0; y <= max; y += step) {
    window.scrollTo({ top: y, behavior: "instant" });
    await sleep(120);
  }
  window.scrollTo({ top: 0, behavior: "instant" });
  await sleep(200);
});
const result = await auditPage(page);

const leak = await page.evaluate(() => {
  const primaryShells = document.querySelectorAll("[data-primary-shell]");
  const bodyText = document.body?.innerText ?? "";
  const stray = [];
  if (bodyText.includes("I'm Mudit, a product designer")) {
    stray.push("home-hero-headline");
  }
  if (bodyText.includes("drag my favorite CDs!")) {
    stray.push("about-cd-heading");
  }
  return {
    primaryShellCount: primaryShells.length,
    stray,
  };
});

await browser.close();

const report = { ...result, leak };
console.log(JSON.stringify(report, null, 2));

if (
  result.tooSmall.length > 0 ||
  result.clipped.length > 0 ||
  leak.stray.length > 0 ||
  leak.primaryShellCount > 0
) {
  process.exit(1);
}
