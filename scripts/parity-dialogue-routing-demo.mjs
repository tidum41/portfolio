#!/usr/bin/env node
/**
 * Live vs routing-demo parity gate.
 *   npm run parity:dialogue-routing-demo
 *   BASE_URL=https://…vercel.app npm run parity:dialogue-routing-demo
 *
 * Writes shots + a markdown report under shots/routing-parity/.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../shots/routing-parity");
const BASE = (process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || "3001"}`).replace(/\/$/, "");
/** Screenshot the shared subtree, not the demo-only chrome (follow-ups, finding line, player slot). */
const PAIRS = [
  ["live-count-closed", "demo-count-closed", "count_bar_closed", ".dp-chart-viz-card, .dp-chart-root"],
  ["live-count-open", "demo-count-open", "count_side_open", ".dp-side-sample"],
  ["live-quotes", "demo-quotes", "quote_list", ".dp-clip-quotes"],
  ["live-clips", "demo-clips", "clip_list", ".dp-clip-quotes"],
];

const STYLE_KEYS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopLeftRadius",
  "color",
  "backgroundColor",
  "borderTopColor",
  "boxShadow",
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  forks: [],
  pixelDiffs: [],
  styleMismatches: [],
  interaction: {},
};

report.forks = [
  {
    template: "count_split",
    uses: ["FridayBar/AnswerCard", "SideSample", "QuoteListFigure", "SourcePill", "DialogueInterviewPlayer"],
    fork: "Player stays in a reserved dlg-route-player-slot instead of nesting inside the quote (LiveSideSample nests and shifts). Demo-only follow-up chips sit under the answer.",
  },
  {
    template: "quote_list",
    uses: ["QuoteListFigure"],
    fork: "None — QuoteListFigure only, with routed quotes.",
  },
  {
    template: "clip_list",
    uses: ["ClipQuotes", "DialogueInterviewPlayer"],
    fork: "ClipQuotes gains optional onSelect so a row can open the shared player; player stays in the reserved slot for zero layout shift.",
  },
  {
    template: "segment_comparison",
    uses: ["ChartVizCard", "ChartBarList"],
    fork: "None — same chart primitives as the live library. No FridayBar/QuoteListFigure/ClipQuotes in this template.",
  },
  {
    template: "thin_data",
    uses: ["dp-low-signal / dp-next-study chrome (same classes as ThinDataFigure)"],
    fork: "Action copies a follow-up prompt for the example study instead of downloading ThinDataFigure's Markdown plan file — different product affordance on example data.",
  },
];

try {
  const res = await page.goto(`${BASE}/dialogue/routing-parity`, { waitUntil: "load", timeout: 60000 });
  log(!!res && res.status() < 400, `load /dialogue/routing-parity (${res && res.status()})`);

  /**
   * Screenshot via integer page-clip so fractional getBoundingClientRect
   * Y values (e.g. 4037.578 vs 4509.375) don't 1px-skew the pair.
   */
  async function integerClipShot(locator, path) {
    const handle = await locator.elementHandle();
    const box = await handle.boundingBox();
    if (!box) throw new Error("no bounding box for screenshot");
    const clip = {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
    await page.screenshot({ path, type: "png", clip });
  }

  for (const [liveId, demoId, name, sel] of PAIRS) {
    const live = page.locator(`#${liveId} .dlg-route-shot__panel`).locator(sel).first();
    const demo = page.locator(`#${demoId} .dlg-route-shot__panel`).locator(sel).first();
    await live.waitFor({ state: "visible" });
    await demo.waitFor({ state: "visible" });
    // Bring each target into view before clipping so y is on-screen.
    await live.scrollIntoViewIfNeeded();
    const livePath = join(OUT, `${name}-live.png`);
    const demoPath = join(OUT, `${name}-demo.png`);
    await integerClipShot(live, livePath);
    await demo.scrollIntoViewIfNeeded();
    await integerClipShot(demo, demoPath);

    const liveImg = sharp(livePath);
    const demoImg = sharp(demoPath);
    const liveMeta = await liveImg.metadata();
    const demoMeta = await demoImg.metadata();
    const w = Math.min(liveMeta.width, demoMeta.width);
    const h = Math.min(liveMeta.height, demoMeta.height);
    const liveRaw = await liveImg.ensureAlpha().extract({ left: 0, top: 0, width: w, height: h }).raw().toBuffer();
    const demoRaw = await demoImg.ensureAlpha().extract({ left: 0, top: 0, width: w, height: h }).raw().toBuffer();

    // Prefer a ±1px alignment if subpixel crop still sneaks through.
    const thr = 8;
    const score = (dx, dy) => {
      let c = 0;
      let tot = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const sx = x + dx;
          const sy = y + dy;
          if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
          tot += 1;
          const o = (y * w + x) * 4;
          const p = (sy * w + sx) * 4;
          if (
            Math.abs(liveRaw[o] - demoRaw[p]) > thr ||
            Math.abs(liveRaw[o + 1] - demoRaw[p + 1]) > thr ||
            Math.abs(liveRaw[o + 2] - demoRaw[p + 2]) > thr
          ) {
            c += 1;
          }
        }
      }
      return { c, tot, pct: (c / tot) * 100 };
    };
    let best = { dx: 0, dy: 0, ...score(0, 0) };
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const s = score(dx, dy);
        if (s.pct < best.pct) best = { dx, dy, ...s };
      }
    }

    const { dx, dy, c: diffPx, tot: total, pct } = best;
    const diffBuf = Buffer.alloc(total > 0 ? w * h * 4 : 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        const sx = x + dx;
        const sy = y + dy;
        let changed = true;
        if (sx >= 0 && sy >= 0 && sx < w && sy < h) {
          const p = (sy * w + sx) * 4;
          changed =
            Math.abs(liveRaw[o] - demoRaw[p]) > thr ||
            Math.abs(liveRaw[o + 1] - demoRaw[p + 1]) > thr ||
            Math.abs(liveRaw[o + 2] - demoRaw[p + 2]) > thr;
          if (!changed) {
            diffBuf[o] = liveRaw[o];
            diffBuf[o + 1] = liveRaw[o + 1];
            diffBuf[o + 2] = liveRaw[o + 2];
            diffBuf[o + 3] = 60;
            continue;
          }
        }
        diffBuf[o] = 255;
        diffBuf[o + 1] = 0;
        diffBuf[o + 2] = 0;
        diffBuf[o + 3] = 255;
      }
    }
    const diffPath = join(OUT, `${name}-diff.png`);
    await sharp(diffBuf, { raw: { width: w, height: h, channels: 4 } }).png().toFile(diffPath);
    // Heat map: absolute channel delta for diagnosis
    const heatBuf = Buffer.alloc(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      const sx = (i % w) + dx;
      const sy = Math.floor(i / w) + dy;
      let d = 255;
      if (sx >= 0 && sy >= 0 && sx < w && sy < h) {
        const p = (sy * w + sx) * 4;
        d = Math.min(
          255,
          Math.abs(liveRaw[o] - demoRaw[p]) +
            Math.abs(liveRaw[o + 1] - demoRaw[p + 1]) +
            Math.abs(liveRaw[o + 2] - demoRaw[p + 2]),
        );
      }
      heatBuf[o] = d;
      heatBuf[o + 1] = 0;
      heatBuf[o + 2] = 0;
      heatBuf[o + 3] = d > thr ? 255 : 0;
    }
    const heatPath = join(OUT, `${name}-heat.png`);
    await sharp(heatBuf, { raw: { width: w, height: h, channels: 4 } }).png().toFile(heatPath);

    report.pixelDiffs.push({
      pair: name,
      live: liveId,
      demo: demoId,
      width: w,
      height: h,
      diffPx,
      diffPct: Number(pct.toFixed(3)),
      align: { dx, dy },
      files: { live: livePath, demo: demoPath, diff: diffPath, heat: heatPath },
    });
    // Shared subtree gate: under 5% is "matches"; report all either way.
    log(pct < 5, `pixel-diff ${name}: ${pct.toFixed(3)}% (${diffPx}/${total}) align=${dx},${dy}`);
  }

  // Computed styles on the closed count pair
  const styleCompare = await page.evaluate((keys) => {
    const pick = (root, sel) => {
      const el = root.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const out = {};
      for (const k of keys) out[k] = cs[k];
      const r = el.getBoundingClientRect();
      out._box = { w: Math.round(r.width), h: Math.round(r.height) };
      return out;
    };
    const live = document.querySelector("#live-count-closed .dlg-route-shot__panel");
    const demo = document.querySelector("#demo-count-closed .dlg-route-shot__panel");
    const targets = {
      bar: ".dlg-live__bar, .dp-chart-stack",
      legend: ".dp-chart-stack__lanes, .dp-chart-stack__lane",
      chip: ".dp-source-pill",
      quote: ".dp-clip-quote",
    };
    // Open live/demo friday sides for chip/quote by clicking if needed — use open panels instead
    const liveOpen = document.querySelector("#live-count-open .dlg-route-shot__panel");
    const demoOpen = document.querySelector("#demo-count-open .dlg-route-shot__panel");
    const liveClips = document.querySelector("#live-clips .dlg-route-shot__panel");
    const demoClips = document.querySelector("#demo-clips .dlg-route-shot__panel");
    const result = {};
    for (const [name, sel] of Object.entries(targets)) {
      const liveRoot = name === "chip" || name === "quote" ? liveOpen : live;
      const demoRoot = name === "chip" || name === "quote" ? demoOpen : demo;
      result[name] = { live: pick(liveRoot, sel), demo: pick(demoRoot, sel) };
    }
    // Also compare the clip_list quote well (selected row).
    result.clip_quote = {
      live: pick(liveClips, ".dp-clip-quote--selected, .dp-clip-quote"),
      demo: pick(demoClips, ".dp-clip-quote--selected, .dp-clip-quote"),
    };
    return result;
  }, STYLE_KEYS);

  for (const [part, { live, demo }] of Object.entries(styleCompare)) {
    if (!live || !demo) {
      report.styleMismatches.push({ part, note: `missing ${!live ? "live" : "demo"} node` });
      log(false, `styles ${part}: missing node`);
      continue;
    }
    const mismatches = [];
    for (const k of STYLE_KEYS) {
      if (live[k] !== demo[k]) mismatches.push({ key: k, live: live[k], demo: demo[k] });
    }
    report.styleMismatches.push({ part, mismatches, liveBox: live._box, demoBox: demo._box });
    log(mismatches.length === 0, `styles ${part}: ${mismatches.length} mismatch(es)`);
    for (const m of mismatches.slice(0, 8)) {
      console.log(`  · ${m.key}: live=${m.live} demo=${m.demo}`);
    }
  }

  // Hover / press via real pointer; layout-shift on quote + clip selection
  const sideLoc = page.locator("#demo-count-closed .dlg-live__side--friday").first();
  const quoteLoc = page.locator("#demo-count-open .dp-clip-quote").first();

  const readStyles = async (loc) =>
    loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        transition: cs.transitionProperty,
        cursor: cs.cursor,
        bg: cs.backgroundColor,
        border: cs.borderTopColor,
      };
    });

  const sideRest = await readStyles(sideLoc);
  await sideLoc.hover();
  await page.waitForTimeout(40);
  const sideHover = await readStyles(sideLoc);
  await sideLoc.dispatchEvent("mousedown");
  await page.waitForTimeout(40);
  const sidePress = await readStyles(sideLoc);
  await sideLoc.dispatchEvent("mouseup");

  const quoteRest = await readStyles(quoteLoc);
  await quoteLoc.hover();
  await page.waitForTimeout(40);
  const quoteHover = await readStyles(quoteLoc);
  await quoteLoc.dispatchEvent("mousedown");
  await page.waitForTimeout(40);
  const quotePress = await readStyles(quoteLoc);
  await quoteLoc.dispatchEvent("mouseup");

  const layoutShift = await page.evaluate(async () => {
    const quotePanel = document.querySelector("#demo-count-open .dlg-route-shot__panel");
    const quote =
      quotePanel?.querySelector(".dp-clip-quote:not(.dp-clip-quote--selected)") ||
      quotePanel?.querySelectorAll(".dp-clip-quote")[1];
    const clipPanel = document.querySelector("#demo-clips .dlg-route-shot__panel");
    const clip = clipPanel?.querySelectorAll(".dp-clip-quote")[1];
    const out = {};
    if (quotePanel && quote) {
      const before = quotePanel.getBoundingClientRect();
      const beforeQuote = quote.getBoundingClientRect();
      quote.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 60));
      const after = quotePanel.getBoundingClientRect();
      const afterQuote = quote.getBoundingClientRect();
      out.count = {
        panelDeltaH: Math.abs(after.height - before.height),
        quoteDeltaY: Math.abs(afterQuote.y - beforeQuote.y),
        beforeH: before.height,
        afterH: after.height,
      };
    }
    if (clipPanel && clip) {
      const list = clipPanel.querySelector(".dp-clip-quotes");
      const before = {
        panel: clipPanel.getBoundingClientRect(),
        list: list.getBoundingClientRect(),
        row: clip.getBoundingClientRect(),
      };
      clip.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 60));
      const after = {
        panel: clipPanel.getBoundingClientRect(),
        list: list.getBoundingClientRect(),
        row: clip.getBoundingClientRect(),
      };
      out.clip = {
        listDeltaH: Math.abs(after.list.height - before.list.height),
        listDeltaY: Math.abs(after.list.y - before.list.y),
        rowDeltaY: Math.abs(after.row.y - before.row.y),
        panelDeltaH: Math.abs(after.panel.height - before.panel.height),
      };
    }
    return out;
  });

  const interaction = {
    hover: {
      side: {
        rest: sideRest,
        hover: sideHover,
        changed: sideRest.border !== sideHover.border || sideRest.bg !== sideHover.bg,
      },
      quote: {
        rest: quoteRest,
        hover: quoteHover,
        changed: quoteRest.border !== quoteHover.border || quoteRest.bg !== quoteHover.bg,
      },
    },
    press: {
      side: {
        rest: sideRest,
        press: sidePress,
        changed: sideRest.bg !== sidePress.bg || sideRest.border !== sidePress.border,
      },
      quote: {
        rest: quoteRest,
        press: quotePress,
        changed: quoteRest.bg !== quotePress.bg || quoteRest.border !== quotePress.border,
      },
      hasSideTransition: /color|background|border/.test(sideRest.transition),
      hasQuoteTransition: /color|background|border/.test(quoteRest.transition),
    },
    layoutShift,
  };
  report.interaction = interaction;
  log(interaction.hover.side.changed || sideRest.cursor === "pointer", "hover affordance present on bar side");
  log(interaction.hover.quote.changed || quoteRest.cursor === "pointer", "hover affordance present on quote");
  log(interaction.press.hasQuoteTransition, "quote has color/border transition (press language)");
  const shift = layoutShift.count?.quoteDeltaY ?? 999;
  const clipShift = layoutShift.clip?.listDeltaY ?? 999;
  log(shift < 2, `count selection layout shift quote Δy=${shift}px`);
  log(clipShift < 2, `clip selection layout shift list Δy=${clipShift}px`);
} catch (err) {
  log(false, `uncaught: ${err instanceof Error ? err.message : String(err)}`);
} finally {
  await browser.close();
}

const md = [];
md.push("# Routing demo ↔ live Counts parity");
md.push("");
md.push(`Generated: ${report.generatedAt}`);
md.push(`Base: ${report.base}`);
md.push("");
md.push("## 1. Shared live imports vs forks");
md.push("");
for (const f of report.forks) {
  md.push(`### \`${f.template}\``);
  md.push(`- Uses: ${f.uses.join(", ")}`);
  md.push(`- Fork / why: ${f.fork}`);
  md.push("");
}
md.push("## 2. Pixel diffs (448px panels)");
md.push("");
md.push("| Pair | Diff % | Diff px | Align | Live | Demo | Diff |");
md.push("| --- | ---: | ---: | --- | --- | --- | --- |");
for (const p of report.pixelDiffs) {
  const rel = (abs) => abs.replace(/.*shots\//, "shots/");
  const align = p.align ? `${p.align.dx},${p.align.dy}` : "0,0";
  md.push(`| ${p.pair} | ${p.diffPct.toFixed(3)}% | ${p.diffPx} | ${align} | ${rel(p.files.live)} | ${rel(p.files.demo)} | ${rel(p.files.diff)} |`);
}
md.push("");
md.push("Screenshots use integer page-clips (not element.screenshot) so fractional layout Y cannot 1px-skew a pair. Diff % also picks the best ±1px alignment if a residual crop remains (Align column).");
md.push("");
md.push("## 3. Computed style mismatches");
md.push("");
for (const s of report.styleMismatches) {
  md.push(`### ${s.part}`);
  if (s.note) {
    md.push(s.note);
  } else if (!s.mismatches?.length) {
    md.push("No mismatches.");
  } else {
    md.push("| Property | Live | Demo |");
    md.push("| --- | --- | --- |");
    for (const m of s.mismatches) md.push(`| ${m.key} | ${m.live} | ${m.demo} |`);
  }
  md.push("");
}
md.push("## 4. Hover / press / layout shift");
md.push("");
md.push("```json");
md.push(JSON.stringify(report.interaction, null, 2));
md.push("```");
md.push("");

const reportPath = join(OUT, "REPORT.md");
writeFileSync(reportPath, md.join("\n"));
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(`\nWrote ${reportPath}`);

if (failures.length) {
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nAll parity checks passed.");
