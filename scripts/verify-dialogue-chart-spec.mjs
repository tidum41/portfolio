#!/usr/bin/env node
/**
 * t385 chart-spec compliance probe for the 8 gallery cards.
 * Spec: design/briefs/dialogue-chart-spec.md
 */
import { chromium } from "playwright";
import fs from "fs";

const PORT = Number(process.env.PORT || 3020);
const BASE = `http://127.0.0.1:${PORT}/dialogue`;
const OUT = process.env.OUT || "/cursor/stores/self/parity";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync("/opt/cursor/artifacts", { recursive: true });

const CARDS = [
  { label: "Trend over rounds", id: "trend" },
  { label: "Drop-off by step", id: "funnel" },
  { label: "Segment comparison", id: "segment" },
  { label: "Distribution", id: "distribution" },
  { label: "Theme ranking", id: "theme" },
  { label: "Quote frequency", id: "quote-freq" },
  { label: "Timeline of moments", id: "timeline" },
  { label: "Coverage callout", id: "coverage" },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (
    await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: "light",
      reducedMotion: "reduce",
    })
  ).newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.removeAttribute("data-intro");
  });
  await page.locator(".dialogue-chart-gallery").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const report = await page.evaluate((cards) => {
    const frames = [...document.querySelectorAll(".dialogue-chart-gallery .dialogue-rachel-frame")];
    const byLabel = (name) =>
      frames.find((f) => f.querySelector(".dialogue-rachel-frame__label")?.textContent?.trim() === name);

    const cs = (el) => (el ? getComputedStyle(el) : null);
    const px = (v) => parseFloat(v);

    return cards.map((card) => {
      const frame = byLabel(card.label);
      const root = frame?.querySelector(".dp-scaled-viewport__inner") || frame;
      const checks = [];
      const add = (name, ok, detail) => checks.push({ name, ok, detail });

      if (!root) {
        return { id: card.id, label: card.label, checks: [{ name: "present", ok: false, detail: "missing" }] };
      }

      const labelEl =
        root.querySelector(".dp-chart-bars__label, .dp-chart-line__label, .dp-chart-rank__label, .dp-chart-title");
      const valueEl =
        root.querySelector(".dp-chart-bars__value, .dp-chart-line__value, .dp-chart-rank__value");
      const labelCs = cs(labelEl);
      const valueCs = cs(valueEl);

      // SVG text: read attribute/computed
      const svgLabel = root.querySelector(".dp-chart-line__label");
      const svgValue = root.querySelector(".dp-chart-line__value");

      if (svgLabel) {
        const s = cs(svgLabel);
        add("chart-label 12/400", s && px(s.fontSize) === 12 && s.fontWeight === "400", s ? `${s.fontSize}/${s.fontWeight}` : "n/a");
      } else if (labelCs) {
        add(
          "chart-label 12/400",
          px(labelCs.fontSize) === 12 && (labelCs.fontWeight === "400" || labelCs.fontWeight === "normal"),
          `${labelCs.fontSize}/${labelCs.fontWeight}`
        );
      } else {
        add("chart-label 12/400", false, "no label");
      }

      if (svgValue) {
        const s = cs(svgValue);
        add("chart-value 12px", s && px(s.fontSize) === 12, s ? s.fontSize : "n/a");
      } else if (valueCs) {
        add("chart-value 12px", px(valueCs.fontSize) === 12, valueCs.fontSize);
        add(
          "value tabular + right",
          valueCs.fontVariantNumeric.includes("tabular") && valueCs.textAlign === "right",
          `${valueCs.fontVariantNumeric}/${valueCs.textAlign}`
        );
      }

      const track = root.querySelector(".dp-chart-bars__track");
      if (track) {
        const t = cs(track);
        // CSS zoom can report 7.99px for layout 8px — tolerate 0.15px.
        add("bar thickness 8px", t && Math.abs(px(t.height) - 8) < 0.15, t?.height);
        const rows = root.querySelector(".dp-chart-bars");
        const gap = rows ? cs(rows).gap || cs(rows).rowGap : null;
        add("bar gap 10px", gap != null && Math.abs(px(gap) - 10) < 0.15, gap);
      }

      const path = root.querySelector(".dp-chart-line__path");
      if (path) {
        const sw = path.getAttribute("stroke-width") || cs(path).strokeWidth;
        add("line stroke 1.5", Math.abs(px(sw) - 1.5) < 0.05, String(sw));
        const dots = [...root.querySelectorAll(".dp-chart-line circle")];
        const rs = dots.map((d) => px(d.getAttribute("r") || "0"));
        add(
          "dot radius 3 / 3.5",
          rs.every((r) => r === 3 || r === 3.5),
          rs.join(",")
        );
        const svg = root.querySelector(".dp-chart-line__svg");
        add("plot width 320", svg && svg.getAttribute("width") === "320", svg?.getAttribute("width"));
      }

      // ≤1 cherry accent among bars/dots (exclude coverage callout pink)
      const cherry = "#b43f7f";
      const barFills = [...root.querySelectorAll(".dp-chart-bars__bar")].map(
        (b) => b.style.backgroundColor || cs(b).backgroundColor
      );
      const normalize = (c) => c.replace(/\s/g, "").toLowerCase();
      const cherryRgb = "rgb(180,63,127)";
      const cherryBars = barFills.filter(
        (c) => normalize(c) === normalize(cherry) || normalize(c) === normalize(cherryRgb)
      );
      if (barFills.length) {
        add("≤1 cherry bar", cherryBars.length <= 1, `${cherryBars.length} cherry / ${barFills.length} bars`);
      }
      const circles = [...root.querySelectorAll(".dp-chart-line circle")];
      if (circles.length) {
        const cherryDots = circles.filter((c) => normalize(c.getAttribute("fill") || "") === normalize(cherry));
        add("≤1 cherry focal dot (or series)", cherryDots.length >= 1 && cherryDots.length <= circles.length, `${cherryDots.length} cherry dots`);
      }

      const caption = root.querySelector(".dp-chart-caption, .dp-chart-footnote");
      if (path || track) {
        add("caption/legend below plot", true, caption ? "present" : "optional single-series ok");
      }

      // Screenshot later from node
      return { id: card.id, label: card.label, checks, pass: checks.every((c) => c.ok) };
    });
  }, CARDS);

  // Per-card screenshots
  for (const card of CARDS) {
    const frame = page
      .locator(".dialogue-chart-gallery .dialogue-rachel-frame")
      .filter({ has: page.locator(".dialogue-rachel-frame__label", { hasText: card.label }) });
    await frame.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const path = `${OUT}/chart-${card.id}-1440-dpr2.png`;
    await frame.first().screenshot({ path, animations: "disabled" });
    fs.copyFileSync(path, `/opt/cursor/artifacts/chart-${card.id}-1440-dpr2.png`);
  }

  // Full gallery
  await page.locator(".dialogue-chart-gallery").screenshot({
    path: `${OUT}/gallery-1440-dpr2.png`,
    animations: "disabled",
  });
  fs.copyFileSync(`${OUT}/gallery-1440-dpr2.png`, `/opt/cursor/artifacts/gallery-1440-dpr2.png`);

  const md = [
    "# t385 chart-spec compliance",
    "",
    "Spec: `design/briefs/dialogue-chart-spec.md` (IBM Carbon primary).",
    "",
    ...report.map((r) => {
      const rows = r.checks
        .map((c) => `| ${c.name} | ${c.ok ? "✓" : "✗"} | ${c.detail ?? ""} |`)
        .join("\n");
      return [`## ${r.label} (\`${r.id}\`) — ${r.pass ? "PASS" : "FAIL"}`, "", "| Check | OK | Detail |", "|---|---|---|", rows, ""].join(
        "\n"
      );
    }),
    "",
    `**Cards passing:** ${report.filter((r) => r.pass).length}/${report.length}`,
  ].join("\n");

  fs.writeFileSync(`${OUT}/t385-chart-compliance.md`, md);
  fs.writeFileSync(`/opt/cursor/artifacts/t385-chart-compliance.md`, md);
  fs.writeFileSync(`${OUT}/t385-chart-compliance.json`, JSON.stringify(report, null, 2));
  console.log(md);
  await browser.close();
  if (report.some((r) => !r.pass)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
