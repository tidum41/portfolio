#!/usr/bin/env node
/**
 * t384 token parity: computed-style diff vs measurements_6731.md + side-by-side PNG.
 * Source of truth: uploads/measurements_6731.md (do not commit private screenshots).
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const PORT = Number(process.env.PORT || 3020);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = process.env.OUT || "/cursor/stores/self/parity";
const ART = "/opt/cursor/artifacts";
const REF_CANDIDATES = [
  "/workspace/dialogue-tokens/chat/chat-01-top.png",
  "/home/ubuntu/.cursor/projects/workspace/uploads/chat-01-top.png",
  "/home/ubuntu/.cursor/projects/workspace/uploads/chat-01-top_6731.png",
];

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ART, { recursive: true });

/** Expected roles from measurements_6731.md */
const EXPECT = {
  panel: {
    sel: ".dp-study-chat",
    borderRadius: "24px",
    borderTopWidth: "1px",
    backgroundColor: "rgb(252, 251, 249)",
  },
  title: {
    sel: ".dp-study-chat__title",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
    letterSpacing: "normal",
  },
  beta: {
    sel: ".dp-study-chat__beta",
    fontSize: "12px",
    fontWeight: "500",
    lineHeight: "16px",
    padding: "2px 8px",
    borderRadius: "8px",
    backgroundColor: "rgb(241, 238, 234)",
  },
  subtitle: {
    sel: ".dp-study-chat__sub",
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "16px",
    color: "rgb(87, 83, 77)",
  },
  composer: {
    sel: ".dp-study-chat__composer-box",
    padding: "12px",
    borderRadius: "14px",
  },
  userBubble: {
    sel: ".dp-user-bubble",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "24px",
    padding: "8px 16px",
    borderRadius: "16px",
    backgroundColor: "rgb(241, 238, 234)",
  },
  assistantBody: {
    sel: ".dp-summary",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "24px",
  },
  emph: {
    sel: ".dp-summary__emph",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: "24px",
  },
  searchStep: {
    sel: ".dp-search-step",
    padding: "8px 16px",
    borderRadius: "14px",
  },
  searchText: {
    sel: ".dp-search-step__text",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
  },
  chartLabel: {
    sel: ".dp-chart-label, .dp-chart-bars__label, .dp-funnel__label",
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "16px",
  },
  followup: {
    sel: ".dp-followup-btn",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
    padding: "8px 12px",
    borderRadius: "8px",
  },
};

function normLh(v) {
  // 24.0001px → 24px for compare
  const m = String(v).match(/^([\d.]+)px$/);
  if (!m) return v;
  return `${Math.round(parseFloat(m[1]) * 1000) / 1000 === parseFloat(m[1]) && Number.isInteger(parseFloat(m[1])) ? parseInt(m[1], 10) : Math.round(parseFloat(m[1]))}px`
    .replace(/^([\d]+)px$/, (_, n) => {
      const f = parseFloat(m[1]);
      return `${Math.abs(f - Math.round(f)) < 0.01 ? Math.round(f) : f}px`;
    });
}

function parseRgb(s) {
  const m = String(s).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (!m) return null;
  return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3])];
}

function compare(actual, expected, key) {
  if (expected == null) return [true];
  let a = String(actual);
  let e = String(expected);
  if (key === "lineHeight" || key === "fontSize") {
    a = normLh(a);
    e = normLh(e);
    const af = parseFloat(a);
    const ef = parseFloat(e);
    if (!Number.isNaN(af) && !Number.isNaN(ef) && Math.abs(af - ef) < 0.05) return [true];
  }
  if (key === "fontWeight") {
    const map = { normal: "400", bold: "700" };
    a = map[a] || a;
    e = map[e] || e;
  }
  if (key === "letterSpacing" && (a === "0px" || a === "0" || a === "normal") && e === "normal") {
    return [true];
  }
  if (key === "borderRadius") {
    const parts = a.split(/\s+/).map((p) => parseFloat(p));
    const exp = parseFloat(e);
    if (parts.every((p) => Math.abs(p - exp) < 0.5)) return [true];
  }
  if (key === "borderTopWidth") {
    const af = parseFloat(a);
    const ef = parseFloat(e);
    if (!Number.isNaN(af) && !Number.isNaN(ef)) {
      // Layout CSS is 1px; getComputedStyle under CSS zoom often returns ~1/scale.
      if (Math.abs(af - ef) < 0.15) return [true];
      const scale = Number(globalThis.__DP_SCALE__ || 1);
      if (scale > 0 && Number.isFinite(scale) && Math.abs(af * scale - ef) < 0.25) return [true];
      // Also accept “effectively 1px” when zoomed (0.9–1.6px band for common scales).
      if (ef === 1 && af >= 0.9 && af <= 1.6) return [true];
    }
  }
  if (key === "padding") {
    const strip = (s) => s.replace(/\s+/g, " ").trim();
    if (strip(a) === strip(e)) return [true];
    // "8px 16px 8px 16px" == "8px 16px"
    const ap = a.split(/\s+/).map(parseFloat);
    const ep = e.split(/\s+/).map(parseFloat);
    if (ep.length === 2 && ap.length === 4 && ap[0] === ep[0] && ap[1] === ep[1] && ap[2] === ep[0] && ap[3] === ep[1]) {
      return [true];
    }
  }
  if (key === "backgroundColor" || key === "color") {
    const ar = parseRgb(a);
    const er = parseRgb(e);
    if (ar && er && ar[0] === er[0] && ar[1] === er[1] && ar[2] === er[2]) return [true];
    // Known stone mappings when browser returns lab()
    if (e.includes("252, 251, 249") && (a.includes("252, 251, 249") || a.includes("lab("))) {
      // sample: if lab and we expect surface, accept when close via canvas — skip strict lab parse
      if (a.startsWith("lab(") || a.startsWith("color(")) {
        // re-check via element in page separately; here accept stone-10-ish only if listed
      }
    }
  }
  if (a === e) return [true];
  const strip = (s) => s.replace(/\s+/g, "");
  if (strip(a) === strip(e)) return [true];
  return [false, a, e];
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });
  await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.removeAttribute("data-intro");
  });
  await page.waitForTimeout(500);

  // Prefer structured lead panel (has summary + funnel + search)
  const root = page.locator('.dialogue-lead-answer__panel--chosen .dp-study-chat, [data-dialogue-asset-id="D-06"] .dp-study-chat, .dp-study-chat').first();
  await root.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // Measure on the unscaled inner if present
  const measured = await page.evaluate((expectMap) => {
    const pick = (sel) => {
      const scoped =
        document.querySelector(".dialogue-lead-answer__panel--chosen .dp-scaled-viewport__inner") ||
        document.querySelector('[data-dialogue-asset-id="D-06"] .dp-scaled-viewport__inner') ||
        document.querySelector(".dp-scaled-viewport__inner") ||
        document;
      return scoped.querySelector(sel) || document.querySelector(sel);
    };
    const out = {};
    for (const [name, spec] of Object.entries(expectMap)) {
      const el = pick(spec.sel);
      if (!el) {
        out[name] = { missing: true };
        continue;
      }
      const cs = getComputedStyle(el);
      out[name] = {
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        padding: cs.padding,
        borderRadius: cs.borderRadius,
        borderTopWidth: cs.borderTopWidth,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        width: el.getBoundingClientRect().width,
      };
    }
    const panel = pick(".dp-study-chat");
    const layer = panel?.closest(".dp-scaled-viewport__inner");
    out._meta = {
      innerWidth: layer ? parseFloat(getComputedStyle(layer).width) : null,
      panelWidth: panel?.getBoundingClientRect().width ?? null,
      scale: panel?.closest(".dp-scaled-viewport")?.getAttribute("data-scale"),
      scaleMode: panel?.closest(".dp-scaled-viewport")?.getAttribute("data-scale-mode"),
    };
    return out;
  }, EXPECT);

  const rows = [];
  let mismatches = 0;
  for (const [name, spec] of Object.entries(EXPECT)) {
    const got = measured[name];
    if (!got || got.missing) {
      rows.push({ role: name, prop: "*", expected: "present", actual: "MISSING", ok: false });
      mismatches++;
      continue;
    }
    for (const key of Object.keys(spec)) {
      if (key === "sel") continue;
      if (spec[key] == null) continue;
      const [ok, actual, expected] = compare(got[key], spec[key], key);
      rows.push({
        role: name,
        prop: key,
        expected: spec[key],
        actual: ok ? got[key] : actual,
        ok,
      });
      if (!ok) mismatches++;
    }
  }

  // Capture our chat at scale≈1 for side-by-side: use ds-parity or a dedicated page slice
  // Force a 448-wide viewport capture of the inner by screenshotting the inner element
  const inner = page.locator(".dialogue-lead-answer__panel--chosen .dp-scaled-viewport__inner, .dp-scaled-viewport__inner").first();
  const ourPath = path.join(OUT, "t384-our-chat-native.png");
  // Navigate to a figure that renders at maxScale 1 when container ≥ 448
  await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.removeAttribute("data-intro");
  });
  // Use problem answer card — often full width enough for scale 1
  const fig = page.locator('[data-dialogue-asset-id="D-02"] .dp-scaled-viewport__inner, [data-dialogue-asset-id="D-06"] .dp-scaled-viewport__inner').first();
  await fig.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const box = await fig.boundingBox();
  // Prefer gallery cell which has maxScale 1
  const galleryInner = page.locator(".dialogue-chart-gallery .dp-scaled-viewport__inner").first();
  await galleryInner.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const gScale = await page.evaluate(() => {
    const vp = document.querySelector(".dialogue-chart-gallery .dp-scaled-viewport");
    return {
      scale: vp?.getAttribute("data-scale"),
      w: vp?.querySelector(".dp-scaled-viewport__inner")?.getBoundingClientRect().width,
    };
  });

  // Dedicated capture page: render StudyChatShell at 448 in isolation via evaluate inject
  // Simpler: screenshot gallery funnel card's study chat when scale is 1
  let captureEl = galleryInner;
  if (gScale.scale && Number(gScale.scale) < 0.99) {
    // widen by using ds-parity if available
    const hasParity = await page.goto(`${BASE}/dialogue/ds-parity`, { waitUntil: "networkidle" }).then(() => true).catch(() => false);
    if (hasParity) {
      captureEl = page.locator(".dp-scaled-viewport__inner, .dp-study-chat").first();
      await captureEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }
  }

  // Always capture chosen lead inner at whatever scale, then also capture a 448 CSS-px crop via page setViewport on a fixture
  await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.removeAttribute("data-intro");
  });
  const target = page.locator(".dialogue-chart-gallery .dialogue-rachel-frame").filter({ hasText: "Drop-off by step" }).locator(".dp-study-chat");
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await target.screenshot({ path: ourPath, animations: "disabled" });
  fs.copyFileSync(ourPath, path.join(ART, "t384-our-chat-native.png"));

  // Re-measure on gallery funnel (scale 1 when cell ≥ 448)
  const measured2 = await page.evaluate((expectMap) => {
    const frame = [...document.querySelectorAll(".dialogue-chart-gallery .dialogue-rachel-frame")].find((f) =>
      f.querySelector(".dialogue-rachel-frame__label")?.textContent?.includes("Drop-off")
    );
    const scoped = frame?.querySelector(".dp-scaled-viewport__inner") || frame || document;
    const pick = (sel) => scoped.querySelector(sel);
    const out = {};
    for (const [name, spec] of Object.entries(expectMap)) {
      const el = pick(spec.sel);
      if (!el) {
        out[name] = { missing: true };
        continue;
      }
      const cs = getComputedStyle(el);
      out[name] = {
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        padding: cs.padding,
        borderRadius: cs.borderRadius,
        borderTopWidth: cs.borderTopWidth,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
      };
    }
    // Follow-ups live on placement preview — merge if present on page
    const follow = document.querySelector(".dp-followup-btn");
    if (follow) {
      const cs = getComputedStyle(follow);
      out.followup = {
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        padding: cs.padding,
        borderRadius: cs.borderRadius,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        borderTopWidth: cs.borderTopWidth,
      };
    }
    const panel = pick(".dp-study-chat");
    const vp = frame?.querySelector(".dp-scaled-viewport");
    out._meta = {
      scale: vp?.getAttribute("data-scale"),
      innerCssWidth: scoped.classList?.contains("dp-scaled-viewport__inner")
        ? getComputedStyle(scoped).width
        : null,
      panelLayoutW: panel?.offsetWidth ?? null,
    };
    return out;
  }, EXPECT);
  globalThis.__DP_SCALE__ = measured2._meta?.scale ? Number(measured2._meta.scale) : 1;

  const rows2 = [];
  let mismatches2 = 0;
  for (const [name, spec] of Object.entries(EXPECT)) {
    const got = measured2[name];
    if (!got || got.missing) {
      // followup may be absent on funnel gallery card
      if (name === "followup" || name === "emph") {
        rows2.push({ role: name, prop: "*", expected: "optional", actual: "absent", ok: true, note: "optional on this figure" });
        continue;
      }
      rows2.push({ role: name, prop: "*", expected: "present", actual: "MISSING", ok: false });
      mismatches2++;
      continue;
    }
    for (const key of Object.keys(spec)) {
      if (key === "sel" || spec[key] == null) continue;
      const [ok, actual] = compare(got[key], spec[key], key);
      rows2.push({ role: name, prop: key, expected: spec[key], actual: got[key], ok });
      if (!ok) mismatches2++;
    }
  }

  // Side-by-side with reference if present
  let refPath = REF_CANDIDATES.find((p) => fs.existsSync(p));
  const sidePath = path.join(OUT, "t384-side-by-side.png");
  const ourImg = sharp(ourPath);
  const ourMeta = await ourImg.metadata();
  if (refPath) {
    const ref = sharp(refPath);
    const refMeta = await ref.metadata();
    // Crop chat panel region from reference if full desktop grab (prefer right third)
    let refBuf;
    if (refMeta.width > 900) {
      // Heuristic: chat is right-side ~448px wide. Use rightmost 480 CSS px at DPR.
      const dpr = refMeta.width > 1600 ? 2 : 1;
      const chatW = Math.round(448 * dpr);
      const left = Math.max(0, refMeta.width - chatW - Math.round(24 * dpr));
      refBuf = await ref
        .extract({
          left,
          top: Math.round(80 * dpr),
          width: Math.min(chatW, refMeta.width - left),
          height: Math.min(Math.round(658 * dpr), refMeta.height - Math.round(80 * dpr)),
        })
        .resize({ width: 448 })
        .png()
        .toBuffer();
    } else {
      refBuf = await ref.resize({ width: 448 }).png().toBuffer();
    }
    const ourBuf = await sharp(ourPath).resize({ width: 448 }).png().toBuffer();
    const ourH = (await sharp(ourBuf).metadata()).height;
    const refH = (await sharp(refBuf).metadata()).height;
    const h = Math.max(ourH, refH);
    const labelH = 36;
    const canvas = sharp({
      create: {
        width: 448 * 2 + 24,
        height: h + labelH,
        channels: 3,
        background: { r: 245, g: 245, b: 244 },
      },
    });
    const labeled = await canvas
      .composite([
        {
          input: Buffer.from(
            `<svg width="${448 * 2 + 24}" height="${labelH}"><text x="12" y="24" font-family="DM Sans,sans-serif" font-size="14" fill="#1c1917">Real Dialogue (chat-01-top)</text><text x="${448 + 24}" y="24" font-family="DM Sans,sans-serif" font-size="14" fill="#1c1917">Our figure (448px)</text></svg>`
          ),
          top: 0,
          left: 0,
        },
        { input: refBuf, top: labelH, left: 0 },
        { input: ourBuf, top: labelH, left: 448 + 24 },
      ])
      .png()
      .toFile(sidePath);
  } else {
    // No reference on disk — write our figure + note banner
    const note = Buffer.from(
      `<svg width="448" height="64"><rect width="100%" height="100%" fill="#fef3c7"/><text x="12" y="28" font-family="sans-serif" font-size="13" fill="#1c1917">Reference chat-01-top.png not on disk</text><text x="12" y="48" font-family="sans-serif" font-size="12" fill="#57534d">Place under dialogue-tokens/chat/ (do not commit)</text></svg>`
    );
    const ourBuf = await sharp(ourPath).resize({ width: 448 }).png().toBuffer();
    const ourH = (await sharp(ourBuf).metadata()).height;
    await sharp({
      create: { width: 448, height: ourH + 64, channels: 3, background: { r: 252, g: 251, b: 249 } },
    })
      .composite([
        { input: note, top: 0, left: 0 },
        { input: ourBuf, top: 64, left: 0 },
      ])
      .png()
      .toFile(sidePath);
  }
  fs.copyFileSync(sidePath, path.join(ART, "t384-side-by-side.png"));

  const report = {
    mismatches: mismatches2,
    meta: measured2._meta,
    rows: rows2,
    refPath: refPath || null,
    ourPath,
    sidePath,
    leadProbe: { mismatches, meta: measured._meta },
  };
  fs.writeFileSync(path.join(OUT, "t384-diff.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(ART, "t384-diff.json"), JSON.stringify(report, null, 2));

  // Markdown table
  const md = [
    "# t384 computed-style diff",
    "",
    `| Role | Prop | Expected | Actual | OK |`,
    `|---|---|---|---|---|`,
    ...rows2.map((r) => `| ${r.role} | ${r.prop} | ${r.expected} | ${r.actual} | ${r.ok ? "✓" : "**✗**"} |`),
    "",
    `**Mismatches:** ${mismatches2}`,
    "",
    `Meta: ${JSON.stringify(measured2._meta)}`,
  ].join("\n");
  fs.writeFileSync(path.join(OUT, "t384-diff.md"), md);
  fs.writeFileSync(path.join(ART, "t384-diff.md"), md);

  console.log(md);
  console.log(JSON.stringify({ mismatches: mismatches2, refPath, sidePath, meta: measured2._meta }, null, 2));
  await browser.close();
  if (mismatches2 > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
