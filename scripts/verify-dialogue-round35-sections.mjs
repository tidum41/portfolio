#!/usr/bin/env node
/**
 * Round 35 verification: /dialogue in-page product figures (no iframes).
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

function auditDomSection(sectionEl) {
  const hits = [];
  const roots = sectionEl.querySelectorAll(".dialogue-product-root, .dialogue-product-figure");
  const scope = roots.length ? [...roots] : [sectionEl];

  for (const root of scope) {
    if (root.scrollWidth > root.clientWidth + 1) {
      hits.push(`root-scroll-x:${root.scrollWidth}>${root.clientWidth}`);
    }
    root.querySelectorAll("*").forEach((el) => {
      const st = getComputedStyle(el);
      const ox = st.overflowX;
      const oy = st.overflowY;
      if (
        (ox === "hidden" || ox === "clip") &&
        el.scrollWidth > el.clientWidth + 1
      ) {
        hits.push(`el-scroll-x:${el.tagName}`);
      }
      if (
        (oy === "hidden" || oy === "clip") &&
        el.scrollHeight > el.clientHeight + 1
      ) {
        hits.push(`el-scroll-y:${el.tagName}`);
      }
    });

    root.querySelectorAll("p, span, li, td, th, label, h1, h2, h3, button, .dp-text-body").forEach((el) => {
      const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
      if (text.length < 4) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2) return;
      let clipper = el.parentElement;
      while (clipper && clipper !== root && clipper !== document.body) {
        const st = getComputedStyle(clipper);
        if (st.overflowX === "hidden" || st.overflowX === "clip" || st.overflow === "hidden") {
          const cRect = clipper.getBoundingClientRect();
          if (rect.right > cRect.right + 1.5) {
            hits.push(`text-clip:${text.slice(0, 36)}`);
          }
          break;
        }
        clipper = clipper.parentElement;
      }
    });

    const bodies = [...root.querySelectorAll(".dp-text-body, .dp-text-prose-sm, .dp-study-chat__body p")];
    for (const node of bodies) {
      const text = node.textContent?.trim() ?? "";
      if (text.length < 4) continue;
      const px = parseFloat(getComputedStyle(node).fontSize);
      if (Number.isFinite(px) && px < 12) {
        hits.push(`font<12:${px}`);
      }
    }
  }

  if (sectionEl.id === "placement") {
    const docked = sectionEl.querySelector('[hidden] .dp-docked-chat, .dp-docked-chat');
    const bubble = sectionEl.querySelector(".dp-floating-chat, .dp-bubble-launcher");
    const visibleDock = sectionEl.querySelector(".dialogue-placement-compare__figure:not([hidden]) .dp-docked-chat");
    const visibleBubble =
      sectionEl.querySelector(".dialogue-placement-compare__figure:not([hidden]) .dp-floating-chat") ||
      sectionEl.querySelector(".dialogue-placement-compare__figure:not([hidden]) .dp-bubble-launcher");
    if (!visibleDock && !visibleBubble && !docked && !bubble) {
      hits.push("placement-missing-ui");
    }
    const activeChat = sectionEl.querySelector(
      ".dialogue-placement-compare__figure:not([hidden]) .dp-study-chat",
    );
    if (!activeChat) {
      hits.push("placement-missing-chat");
    }
  }

  return [...new Set(hits)];
}

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

const report = { shots: [], critique: [], issues: [], viewports: [] };

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const resp = await page.goto(`${BASE}/dialogue`, { waitUntil: "load", timeout: 120000 });
  if ((resp?.status() ?? 0) !== 200) {
    report.issues.push(`http-${vp.name}:${resp?.status()}`);
    continue;
  }
  await waitForPageReady(page);

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
        function auditDomSection(sectionEl) {
          const hits = [];
          const roots = sectionEl.querySelectorAll(".dialogue-product-root, .dialogue-product-figure");
          const scope = roots.length ? [...roots] : [sectionEl];
          for (const root of scope) {
            if (root.scrollWidth > root.clientWidth + 1) {
              hits.push(`root-scroll-x:${root.scrollWidth}>${root.clientWidth}`);
            }
            root.querySelectorAll("p, span, .dp-text-body, .dp-text-prose-sm").forEach((el) => {
              const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
              if (text.length < 4) return;
              const rect = el.getBoundingClientRect();
              let clipper = el.parentElement;
              while (clipper && clipper !== root) {
                const st = getComputedStyle(clipper);
                if (st.overflowX === "hidden" || st.overflow === "hidden") {
                  const cRect = clipper.getBoundingClientRect();
                  if (rect.right > cRect.right + 1.5) {
                    hits.push(`text-clip:${text.slice(0, 36)}`);
                  }
                  break;
                }
                clipper = clipper.parentElement;
              }
              const px = parseFloat(getComputedStyle(el).fontSize);
              if (Number.isFinite(px) && px < 12 && text.length >= 4) {
                hits.push(`font<12:${px}`);
              }
            });
          }
          if (sectionEl.id === "placement") {
            const activeChat = sectionEl.querySelector(
              ".dialogue-placement-compare__figure:not([hidden]) .dp-study-chat",
            );
            if (!activeChat) hits.push("placement-missing-chat");
            const bubbleUi =
              sectionEl.querySelector(
                ".dialogue-placement-compare__figure:not([hidden]) .dp-floating-chat",
              ) ||
              sectionEl.querySelector(
                ".dialogue-placement-compare__figure:not([hidden]) .dp-docked-chat",
              );
            if (!bubbleUi) hits.push("placement-missing-pattern");
          }
          return [...new Set(hits)];
        }
        return auditDomSection(section);
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
