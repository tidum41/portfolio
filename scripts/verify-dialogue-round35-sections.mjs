#!/usr/bin/env node
/**
 * Round 35 verification: /dialogue in-page product figures (no iframes).
 * Run against production: `npm run build && npm run start` then this script.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ARTIFACT_ROOT = process.env.ROUND35_STORE || "/opt/cursor/artifacts/dialogue-round35-sections";
const SELF_STORE = "/cursor/stores/self/round35";
const fontConfig = process.env.FONTCONFIG_FILE || "/tmp/dialogue-fonts/fonts.conf";

fs.mkdirSync(ARTIFACT_ROOT, { recursive: true });
fs.mkdirSync(SELF_STORE, { recursive: true });

const SECTIONS = [
  { id: "hero", selector: ".dialogue-hero-joola" },
  { id: "problem", selector: "#problem" },
  { id: "why-it-matters", selector: "#why-it-matters" },
  { id: "one-structure", selector: "#one-structure" },
  { id: "fitted-charts", selector: "#fitted-charts" },
  { id: "clips", selector: "#clips" },
  { id: "placement", selector: "#placement" },
  { id: "full-answer", selector: "#full-answer" },
];

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

async function waitForPageReady(page) {
  await page.waitForSelector(".dialogue-case-study", { timeout: 60000 });
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const maxScroll = document.documentElement.scrollHeight;
    for (let y = 0; y <= maxScroll; y += 400) {
      window.scrollTo(0, y);
      await sleep(80);
    }
    window.scrollTo(0, 0);
    await sleep(300);
  });
  await page.waitForFunction(
    () => {
      const reveals = [...document.querySelectorAll(".dialogue-case-study .reveal")];
      return reveals.length === 0 || reveals.every((el) => el.classList.contains("visible"));
    },
    { timeout: 120000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
}

const browser = await chromium.launch({
  env: { ...process.env, FONTCONFIG_FILE: fontConfig },
});
const page = await browser.newPage();
page.setDefaultTimeout(120000);
const pageErrors = [];
page.on("pageerror", (err) => pageErrors.push(String(err.message || err)));

const report = { shots: [], critique: [], issues: [], viewports: [] };

for (const vp of VIEWPORTS) {
  pageErrors.length = 0;
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const resp = await page.goto(`${BASE}/dialogue`, { waitUntil: "load", timeout: 120000 });
  if ((resp?.status() ?? 0) !== 200) {
    report.issues.push(`http-${vp.name}:${resp?.status()}`);
    continue;
  }
  await waitForPageReady(page);

  const devOverlay = await page.evaluate(() => {
    if (document.querySelector("[data-nextjs-dev-tools-button]")) return "dev-tools-button";
    const buttons = [...document.querySelectorAll("button")];
    if (buttons.some((b) => /\d+\s*issue/i.test(b.textContent || ""))) return "issue-pill";
    return null;
  });
  if (devOverlay) report.issues.push(`dev-overlay@${vp.name}:${devOverlay}`);
  for (const err of pageErrors) {
    if (err.includes("hydrat")) report.issues.push(`pageerror@${vp.name}:hydration`);
    else report.issues.push(`pageerror@${vp.name}:${err.slice(0, 80)}`);
  }

  const fullFile = `${ARTIFACT_ROOT}/full-page-${vp.name}.png`;
  await page.screenshot({ path: fullFile, fullPage: true });
  report.shots.push(fullFile);

  const overflowX = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  if (overflowX) report.issues.push(`overflow-x@${vp.name}:page`);

  for (const sec of SECTIONS) {
    const el = page.locator(sec.selector).first();
    if ((await el.count()) === 0) {
      report.issues.push(`${sec.id}@${vp.name}:selector missing`);
      continue;
    }

    if (sec.id === "placement") {
      await page.locator('.dialogue-placement-compare__option:has-text("Floating bubble")').click();
      await page.waitForTimeout(200);
    }

    await page.evaluate((sel) => {
      if (sel.includes("hero")) {
        window.scrollTo(0, 0);
        return;
      }
      document.querySelector(sel)?.scrollIntoView({ block: "start", behavior: "instant" });
    }, sec.selector);
    await page.waitForTimeout(500);

    const file = `${ARTIFACT_ROOT}/${sec.id}-${vp.name}.png`;
    const contentBox = await page.locator(".dialogue-case-study .cs-content").boundingBox();
    const sectionBox = await el.boundingBox();
    const vpSize = page.viewportSize();
    if (contentBox && sectionBox && sectionBox.height > 8 && vpSize) {
      const maxH = Math.min(sectionBox.height, 2200, vpSize.height - sectionBox.y - 4);
      try {
        await page.screenshot({
          path: file,
          clip: {
            x: contentBox.x,
            y: Math.max(0, sectionBox.y),
            width: contentBox.width,
            height: Math.max(40, maxH),
          },
          animations: "disabled",
          timeout: 15000,
        });
        report.shots.push(file);
      } catch {
        try {
          await el.screenshot({ path: file, animations: "disabled", timeout: 15000 });
          report.shots.push(file);
        } catch {
          report.issues.push(`screenshot@${vp.name}:${sec.id}`);
        }
      }
    }

    const metrics = await page.evaluate(
      (sel) => {
        const section = document.querySelector(sel);
        if (!section) return { ok: false };
        const contentCol = document.querySelector(".dialogue-case-study .cs-content");
        const colWidth = contentCol?.clientWidth ?? 0;
        const frames = [...section.querySelectorAll(".dialogue-rachel-frame")].map((f) =>
          Math.round(f.getBoundingClientRect().width),
        );
        return {
          ok: true,
          colWidth: Math.round(colWidth),
          figureWidths: frames,
          widthMatch:
            frames.length === 0 ||
            frames.every((w) => Math.abs(w - colWidth) <= 28 || w <= colWidth),
        };
      },
      sec.selector,
    );

    const clipHits = await page.evaluate(
      (sel) => {
        const section = document.querySelector(sel);
        if (!section) return [];
        const outerClip = section.classList.contains("dialogue-hero-joola") ? section : null;
        function auditDomSection(sectionEl, outerClipEl) {
          const hits = [];
          const roots = sectionEl.querySelectorAll(".dialogue-product-root, .dialogue-product-figure");
          const scope = roots.length ? [...roots] : [sectionEl];

          const isTextVisuallyClipped = (el, root, outerClip) => {
            const rect = el.getBoundingClientRect();
            const tol = 1.5;
            if (rect.width < 2 || rect.height < 2) return false;

            let clipper = el.parentElement;
            while (clipper && clipper !== root && clipper !== document.body) {
              const st = getComputedStyle(clipper);
              const clipX =
                st.overflowX === "hidden" || st.overflowX === "clip" || st.overflow === "hidden";
              const clipY =
                st.overflowY === "hidden" || st.overflowY === "clip" || st.overflow === "hidden";
              if (clipX || clipY) {
                const cRect = clipper.getBoundingClientRect();
                if (clipX && rect.right > cRect.right + tol) return true;
                if (clipX && rect.left < cRect.left - tol) return true;
                if (clipY && rect.bottom > cRect.bottom + tol) return true;
                if (clipY && rect.top < cRect.top - tol) return true;
              }
              clipper = clipper.parentElement;
            }

            if (outerClip) {
              const cRect = outerClip.getBoundingClientRect();
              if (rect.right > cRect.right + tol) return true;
              if (rect.left < cRect.left - tol) return true;
              if (rect.bottom > cRect.bottom + tol) return true;
              if (rect.top < cRect.top - tol) return true;
            }
            return false;
          };

          for (const root of scope) {
            if (root.scrollWidth > root.clientWidth + 1) {
              hits.push(`root-scroll-x:${root.scrollWidth}>${root.clientWidth}`);
            }
            const textSelectors =
              "p, span, li, td, th, label, h1, h2, h3, h4, button, .dp-text-body, text";
            root.querySelectorAll(textSelectors).forEach((el) => {
              const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
              if (text.length < 4) return;
              if (isTextVisuallyClipped(el, root, outerClipEl)) {
                hits.push(`text-trunc:${text.slice(0, 40)}`);
              }
              const px = parseFloat(getComputedStyle(el).fontSize);
              if (
                Number.isFinite(px) &&
                px < 12 &&
                text.length >= 4 &&
                el.tagName !== "text" &&
                !el.closest(".dp-anatomy__rail")
              ) {
                hits.push(`font<12:${px}`);
              }
            });

            root.querySelectorAll(".dp-funnel__row").forEach((row) => {
              const track = row.querySelector(".dp-funnel__track");
              const pct = row.querySelector(".dp-funnel__pct");
              if (!track || !pct) return;
              const rowRect = row.getBoundingClientRect();
              const trackRect = track.getBoundingClientRect();
              const pctRect = pct.getBoundingClientRect();
              if (pctRect.right > rowRect.right + 1.5) hits.push("funnel-pct-overflow");
              if (pctRect.left < trackRect.right - 2) hits.push("funnel-pct-overlap");
            });
          }

          if (sectionEl.id === "one-structure") {
            const lines = sectionEl.querySelectorAll(".dp-anatomy__line");
            if (lines.length < 5) hits.push(`anatomy-lines:${lines.length}`);
            const chips = sectionEl.querySelectorAll(".dp-anatomy__marker");
            if (chips.length > 0) hits.push("anatomy-tab-chips");
          }

          if (sectionEl.id === "hero") {
            if (!sectionEl.querySelector(".dp-hero-compose__clips")) {
              hits.push("hero-missing-clips");
            }
          }

          if (sectionEl.id === "placement") {
            const activeChat = sectionEl.querySelector(
              ".dialogue-placement-compare__figure:not([hidden]) .dp-study-chat",
            );
            if (!activeChat) hits.push("placement-missing-chat");
            const launcher = sectionEl.querySelector(
              ".dialogue-placement-compare__figure:not([hidden]) .dp-bubble-launcher-inset",
            );
            const activeBubble = sectionEl.querySelector(
              '.dialogue-placement-compare__figure:not([hidden]) [data-dialogue-asset-id="D-14"]',
            );
            if (activeBubble && !launcher) hits.push("placement-missing-launcher-inset");
            const study = sectionEl.querySelector(
              ".dialogue-placement-compare__figure:not([hidden]) .dp-placement-study-wrap",
            );
            if (study) {
              study.querySelectorAll("h4, p, .dp-study-nav__item, .dp-mini-stat").forEach((el) => {
                if (el.scrollWidth > el.clientWidth + 2) {
                  const t = el.textContent?.replace(/\s+/g, " ").trim().slice(0, 32) ?? "";
                  hits.push(`placement-study-clip:${t}`);
                }
              });
            }
          }
          return [...new Set(hits)];
        }
        return auditDomSection(section, outerClip);
      },
      sec.selector,
    );

    for (const hit of clipHits) {
      report.issues.push(`dom-audit@${vp.name}:${sec.id}:${hit}`);
    }
    if (sec.id !== "hero" && metrics.ok && metrics.figureWidths?.length && !metrics.widthMatch) {
      report.issues.push(`width-mismatch@${vp.name}:${sec.id}`);
    }

    report.critique.push({ section: sec.id, viewport: vp.name, ...metrics, clipHits });
  }
  report.viewports.push(vp.name);
}

for (const shot of report.shots) {
  fs.copyFileSync(shot, path.join(SELF_STORE, path.basename(shot)));
}
const reportPath = path.join(SELF_STORE, "verify-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
fs.copyFileSync(reportPath, path.join(ARTIFACT_ROOT, "verify-report.json"));

await browser.close();

console.log(
  JSON.stringify(
    { issues: report.issues, count: report.issues.length, reportPath, selfStore: SELF_STORE },
    null,
    2,
  ),
);
if (report.issues.length > 0) process.exitCode = 1;
