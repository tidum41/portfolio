#!/usr/bin/env node
/**
 * Round 35 verification: /dialogue in-page product figures (no iframes).
 * Defaults to a dedicated production port (3020) so a stale `next dev` on 3000
 * cannot poison captures. Override with BASE_URL only when it serves `next start`.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const ROUND35_PORT = Number(process.env.ROUND35_PORT || 3020);

async function portOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

async function fetchDialogue(base) {
  const res = await fetch(`${base}/dialogue`, { redirect: "follow" });
  const text = await res.text();
  return { status: res.status, text };
}

function devMarkerFromHtml(html) {
  if (html.includes("<nextjs-portal")) return "nextjs-portal";
  if (html.includes("browser_dev_hmr") || html.includes("[turbopack]_browser_dev_hmr")) {
    return "turbopack-hmr";
  }
  return null;
}

async function ensureProductionBase() {
  if (process.env.BASE_URL) {
    const { status, text } = await fetchDialogue(process.env.BASE_URL);
    if (status !== 200) {
      throw new Error(`BASE_URL ${process.env.BASE_URL}/dialogue returned HTTP ${status}`);
    }
    const dev = devMarkerFromHtml(text);
    if (dev) throw new Error(`BASE_URL is Next dev (${dev}); use next start`);
    return process.env.BASE_URL.replace(/\/$/, "");
  }

  const base = `http://127.0.0.1:${ROUND35_PORT}`;
  if (await portOpen(ROUND35_PORT)) {
    const { status, text } = await fetchDialogue(base);
    if (status === 200 && !devMarkerFromHtml(text)) return base;
  }

  if (process.env.ROUND35_SKIP_SERVER === "1") {
    throw new Error(
      `No production server on port ${ROUND35_PORT}. Run: npm run build && npm run start -- -p ${ROUND35_PORT}`,
    );
  }

  const child = spawn("npm", ["run", "start", "--", "-p", String(ROUND35_PORT)], {
    cwd: ROOT,
    stdio: "ignore",
    detached: true,
    env: { ...process.env, NODE_ENV: "production" },
  });
  child.unref();

  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (!(await portOpen(ROUND35_PORT))) continue;
    const { status, text } = await fetchDialogue(base);
    if (status === 200 && !devMarkerFromHtml(text)) return base;
  }
  throw new Error(`Production server did not become ready on port ${ROUND35_PORT}`);
}

const BASE = await ensureProductionBase();
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
    if (document.querySelector("[data-nextjs-toast]")) return "data-nextjs-toast";
    if (document.querySelector("nextjs-portal")) return "nextjs-portal";
    for (const script of document.scripts) {
      const src = script.src || "";
      if (src.includes("browser_dev_hmr") || src.includes("hmr-client_ts")) return "hmr-script";
    }
    const buttons = [...document.querySelectorAll("button")];
    if (buttons.some((b) => /\d+\s*issue/i.test(b.textContent || ""))) return "issue-pill";
    return null;
  });
  if (devOverlay) report.issues.push(`dev-overlay@${vp.name}:${devOverlay}`);

  if (vp.width <= 420) {
    const gutterHits = await page.evaluate(() => {
      const hits = [];
      const minX = 16;
      document.querySelectorAll(".dialogue-case-study article section[id]").forEach((sec) => {
        sec.querySelectorAll("h2, .cs-prose").forEach((el) => {
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            if (!node.textContent?.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            const rect = range.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) continue;
            if (rect.left < minX) {
              hits.push(`${sec.id}:${el.tagName}:${Math.round(rect.left)}`);
              break;
            }
          }
        });
      });
      return [...new Set(hits)];
    });
    for (const hit of gutterHits) {
      report.issues.push(`section-gutter@${vp.name}:${hit}`);
    }
  }
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

  const funnelAudit = await page.evaluate(() => {
    const hits = [];
    const rowVisible = (el) => {
      let node = el;
      while (node) {
        const s = getComputedStyle(node);
        if (s.display === "none" || s.visibility === "hidden") return false;
        node = node.parentElement;
      }
      const r = el.getBoundingClientRect();
      return r.width >= 120 && r.height >= 8;
    };
    document.querySelectorAll(".dp-funnel__row").forEach((row) => {
      if (!rowVisible(row)) return;
      const label = row.querySelector(".dp-funnel__label");
      const track = row.querySelector(".dp-funnel__track");
      const pct = row.querySelector(".dp-funnel__pct");
      if (!label || !track || !pct) return;
      const rowRect = row.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      if (trackRect.width < 24) return;
      const style = getComputedStyle(label);
      const linePx = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.25;
      const labelH = label.getBoundingClientRect().height;
      if (labelH > linePx * 1.2 || label.scrollHeight > label.clientHeight + 1) {
        hits.push(`funnel-label-wrap:${label.textContent?.trim().slice(0, 12)}`);
      }
      const pctRect = pct.getBoundingClientRect();
      const gap = pctRect.left - trackRect.right;
      if (gap < 6) hits.push(`funnel-pct-gap:${Math.round(gap)}`);
      if (pctRect.right > rowRect.right + 1.5) hits.push("funnel-pct-overflow");
    });
    return [...new Set(hits)];
  });
  for (const hit of funnelAudit) {
    report.issues.push(`funnel-audit@${vp.name}:${hit}`);
  }

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
      ({ sel, vpName }) => {
        const section = document.querySelector(sel);
        if (!section) return [];
        const viewportNarrow = window.innerWidth < 420;
        const viewportWide = window.innerWidth >= 520;
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
              const heroCrop =
                outerClip.classList.contains("dialogue-hero-joola") && window.innerWidth < 420;
              if (!heroCrop) {
                if (rect.bottom > cRect.bottom + tol) return true;
                if (rect.top < cRect.top - tol) return true;
              }
            }
            return false;
          };

          for (const root of scope) {
            if (root.scrollWidth > root.clientWidth + 1) {
              hits.push(`root-scroll-x:${root.scrollWidth}>${root.clientWidth}`);
            }
            const textSelectors =
              "p, span, li, td, th, label, h1, h2, h3, h4, button, .dp-text-body, text";
            const skipTextTrunc =
              window.innerWidth < 420 &&
              (sectionEl.classList.contains("dialogue-hero-joola") ||
                sectionEl.id === "one-structure" ||
                sectionEl.id === "full-answer" ||
                !!sectionEl.querySelector(".dialogue-product-root, .dialogue-rachel-frame"));
            root.querySelectorAll(textSelectors).forEach((el) => {
              const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
              if (text.length < 4) return;
              if (
                sectionEl.id === "placement" &&
                (el.closest(".dp-placement-scene__chat") || el.closest(".dp-placement-scene"))
              ) {
                return;
              }
              if (
                /^\d{1,3}%$/.test(text) ||
                el.classList.contains("dp-funnel__pct") ||
                el.classList.contains("dp-clip-thumbs__time")
              ) {
                return;
              }
              if (!skipTextTrunc && isTextVisuallyClipped(el, root, outerClipEl)) {
                hits.push(`text-trunc:${text.slice(0, 40)}`);
              }
              const px = parseFloat(getComputedStyle(el).fontSize);
              if (
                Number.isFinite(px) &&
                px < 12 &&
                text.length >= 4 &&
                el.tagName !== "text" &&
                !el.closest(".dp-anatomy__rail") &&
                !el.closest(".dp-app-shell") &&
                !el.classList.contains("dp-clip-thumbs__time") &&
                !el.closest(".dp-floating-chat")
              ) {
                hits.push(`font<12:${px}`);
              }
            });

          }

          if (sectionEl.id === "one-structure") {
            const anatomy = sectionEl.querySelector(".dp-anatomy");
            const card = anatomy?.querySelector(".dp-study-chat");
            if (anatomy && card && anatomy.clientWidth > 480) {
              const cardLeft = card.getBoundingClientRect().left;
              const lines = [...anatomy.querySelectorAll(".dp-anatomy__line")];
              if (lines.length < 5) hits.push(`anatomy-lines:${lines.length}`);
              for (const line of lines) {
                const y1 = parseFloat(line.getAttribute("y1") || "0");
                const y2 = parseFloat(line.getAttribute("y2") || "0");
                const x1 = parseFloat(line.getAttribute("x1") || "0");
                const x2 = parseFloat(line.getAttribute("x2") || "0");
                if (Math.abs(y1 - y2) > 0.75) hits.push("anatomy-line-diagonal");
                const lr = line.getBoundingClientRect();
                if (lr.width < 40) hits.push(`anatomy-line-short:${Math.round(lr.width)}`);
                if (x2 - x1 < 40) hits.push(`anatomy-line-len:${Math.round(x2 - x1)}`);
                if (lr.right > cardLeft + 2) hits.push("anatomy-line-into-card");
                const stroke = getComputedStyle(line).stroke.toLowerCase();
                if (!stroke.includes("181, 175, 166") && !stroke.includes("b5afa6")) {
                  hits.push("anatomy-line-stroke");
                }
              }
            }
            if (anatomy && anatomy.clientWidth <= 480) {
              const markers = anatomy.querySelectorAll(".dp-anatomy-part-marker");
              if (markers.length < 5) hits.push(`anatomy-markers:${markers.length}`);
              if (anatomy.querySelector(".dp-anatomy__line")) hits.push("anatomy-lines-on-narrow");
            }
          }

          if (sectionEl.classList.contains("dialogue-hero-joola")) {
            const clips = sectionEl.querySelector(".dp-hero-compose__clips");
            const heroH = sectionEl.getBoundingClientRect().height;
            if (viewportWide && heroH > 300) {
              if (!clips || getComputedStyle(clips).display === "none") {
                hits.push("hero-missing-clips");
              }
            }
            if (viewportNarrow) {
              const texts = sectionEl.querySelectorAll(
                ".dp-study-chat--hero .dp-summary, .dp-study-chat--hero .dp-funnel__label, .dp-study-chat--hero .dp-funnel__pct",
              );
              texts.forEach((el) => {
                const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
                if (text.length < 2) return;
                const px = parseFloat(getComputedStyle(el).fontSize);
                if (Number.isFinite(px) && px < 11) hits.push(`hero-font<11:${px}`);
              });
              const frame = sectionEl.getBoundingClientRect();
              const funnel = sectionEl.querySelector(".dp-funnel__chart");
              if (!funnel) hits.push("hero-missing-funnel");
              else {
                const fr = funnel.getBoundingClientRect();
                const bottomSlack = viewportNarrow ? 16 : 1;
                if (
                  fr.top < frame.top - 1 ||
                  fr.bottom > frame.bottom + bottomSlack
                ) {
                  hits.push("hero-funnel-outside-frame");
                }
                if (fr.height < 40) hits.push("hero-funnel-too-small");
              }
            }
            if (viewportWide && heroH > 300) {
              const composeEl = sectionEl.querySelector(".dp-hero-compose");
              const cluster = sectionEl.querySelector(".dp-hero-compose__cluster");
              if (composeEl && cluster) {
                const frame = composeEl.getBoundingClientRect();
                const cr = cluster.getBoundingClientRect();
                const leftM = cr.left - frame.left;
                const rightM = frame.right - cr.right;
                if (Math.abs(leftM - rightM) > 4) {
                  hits.push(`hero-margin-asym:${Math.round(leftM)}-${Math.round(rightM)}`);
                }
                if (leftM < 44 || rightM < 44) {
                  hits.push(`hero-margin-min:${Math.round(Math.min(leftM, rightM))}`);
                }
                const topM = cr.top - frame.top;
                const bottomM = frame.bottom - cr.bottom;
                if (Math.abs(topM - bottomM) > 4) {
                  hits.push(`hero-v-margin-asym:${Math.round(topM)}-${Math.round(bottomM)}`);
                }
                if (Math.min(topM, bottomM) < 40) {
                  hits.push(`hero-v-margin-min:${Math.round(Math.min(topM, bottomM))}`);
                }
              }
            }
          }

          if (sectionEl.id === "placement") {
            const activeChat = sectionEl.querySelector(
              ".dialogue-placement-compare__figure:not([hidden]) [data-placement-chat] .dp-study-chat",
            );
            if (!activeChat) hits.push("placement-missing-chat");
            const launcher = sectionEl.querySelector(
              ".dialogue-placement-compare__figure:not([hidden]) .dp-placement-scene__launcher",
            );
            const activeBubble = sectionEl.querySelector(
              '.dialogue-placement-compare__figure:not([hidden]) [data-dialogue-asset-id="D-14"]',
            );
            if (activeBubble && !launcher) hits.push("placement-missing-launcher-inset");
            const activeFigure = sectionEl.querySelector(
              ".dialogue-placement-compare__figure:not([hidden])",
            );
            const scene = activeFigure?.querySelector("[data-placement-scene]");
            const shell = scene?.querySelector("[data-export-app-shell]");
            const chatWrap = scene?.querySelector("[data-placement-chat]");
            const chat = chatWrap?.querySelector(".dp-study-chat");
            const question = scene?.querySelector(".dp-user-bubble p");
            if (scene && shell && chatWrap) {
              const shellScale = shell.getBoundingClientRect().width / 1280;
              const chatScale = chatWrap.getBoundingClientRect().width / 392;
              if (Math.abs(shellScale - chatScale) > 0.04) {
                hits.push(
                  `placement-scale-mismatch:${shellScale.toFixed(3)}:${chatScale.toFixed(3)}`,
                );
              }
            }
            if (question) {
              const st = getComputedStyle(question);
              const lh = parseFloat(st.lineHeight);
              if (Number.isFinite(lh) && lh > 0) {
                const lines = question.getBoundingClientRect().height / lh;
                if (lines > 2.15) {
                  hits.push(`placement-question-lines:${lines.toFixed(1)}`);
                }
              }
            }
            const frameEl = activeFigure?.querySelector(".dp-placement-viewport");
            if (window.innerWidth >= 600 && scene?.getAttribute("data-placement-crop") !== "full") {
              hits.push("placement-crop-mode-wide");
            }
            const titleEl = scene?.querySelector(".dp-app-main__title");
            const insightsEl = scene?.querySelector(".dp-app-insights-card__title");
            const visibleInFrame = (el) => {
              if (!el || !frameEl) return false;
              const box = frameEl.getBoundingClientRect();
              const r = el.getBoundingClientRect();
              if (r.width < 2 || r.height < 2) return false;
              const overlapW = Math.min(r.right, box.right) - Math.max(r.left, box.left);
              const overlapH = Math.min(r.bottom, box.bottom) - Math.max(r.top, box.top);
              return overlapW > 8 && overlapH > 4;
            };
            const sidebarNav = scene?.querySelector(".dp-app-sidebar__nav-item");
            const statLabel = scene?.querySelector(".dp-app-stat-card__label");
            if (window.innerWidth >= 600) {
              if (!visibleInFrame(titleEl)) hits.push("placement-backdrop-title");
              if (!visibleInFrame(insightsEl)) hits.push("placement-backdrop-insights");
              if (!visibleInFrame(sidebarNav)) hits.push("placement-backdrop-sidebar");
            } else if (!visibleInFrame(titleEl)) {
              hits.push("placement-backdrop-title-mobile");
            }
            const study = scene;
            const chatEl = chatWrap;
            const cropRight = scene?.getAttribute("data-placement-crop") === "right";
            if (study && chatEl && frameEl) {
              const chatRect = chatEl.getBoundingClientRect();
              const wrapRect = frameEl.getBoundingClientRect();
              const textInside = (rect, box) =>
                rect.left >= box.left - 0.5 &&
                rect.right <= box.right + 0.5 &&
                rect.top >= box.top - 0.5 &&
                rect.bottom <= box.bottom + 0.5;
              const intersects = (a, b) =>
                a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
              study
                .querySelectorAll(
                  "p, .dp-app-sidebar__nav-item, .dp-app-stat-card__label, .dp-app-sidebar__wordmark-img",
                )
                .forEach((el) => {
                  if (getComputedStyle(el).display === "none") return;
                  if (el.tagName === "IMG") return;
                  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
                  let node;
                  while ((node = walker.nextNode())) {
                    if (!node.textContent?.trim()) continue;
                    const range = document.createRange();
                    range.selectNodeContents(node);
                    const tr = range.getBoundingClientRect();
                    if (tr.width <= 0 || tr.height <= 0) continue;
                    const underChat = textInside(tr, chatRect);
                    if (underChat) continue;
                    if (tr.right > wrapRect.right + 1) {
                      hits.push(`placement-wrap-clip:${node.textContent.trim().slice(0, 16)}`);
                      break;
                    }
                    if (!cropRight && tr.left < wrapRect.left - 1) {
                      hits.push(`placement-wrap-clip:${node.textContent.trim().slice(0, 16)}`);
                      break;
                    }
                    if (el.scrollWidth > el.clientWidth + 2) {
                      hits.push(`placement-study-clip:${node.textContent.trim().slice(0, 16)}`);
                      break;
                    }
                  }
                });
            }
          }
          return [...new Set(hits)];
        }
        return auditDomSection(section, outerClip);
      },
      { sel: sec.selector, vpName: vp.name },
    );

    for (const hit of clipHits) {
      report.issues.push(`dom-audit@${vp.name}:${sec.id}:${hit}`);
    }

    if (sec.id === "placement") {
      const layerLoc = page.locator(
        ".dialogue-placement-compare__figure:not([hidden]) .dp-placement-layer--bubble",
      );
      if (await layerLoc.count()) {
        try {
          const shotBuf = await layerLoc.screenshot({ animations: "disabled", timeout: 15000 });
          const meta = await sharp(shotBuf).metadata();
          const { data, info } = await sharp(shotBuf).ensureAlpha().raw().toBuffer({
            resolveWithObject: true,
          });
          const w = info.width;
          const h = info.height;
          let nonBg = 0;
          let samples = 0;
          const bgR = 248;
          const bgG = 246;
          const bgB = 243;
          const xMax = Math.floor(w * 0.62);
          const yMax = Math.floor(h * 0.78);
          for (let y = Math.floor(h * 0.08); y < yMax; y += 2) {
            for (let x = Math.floor(w * 0.02); x < xMax; x += 2) {
              const i = (y * w + x) * info.channels;
              const dr = Math.abs(data[i] - bgR);
              const dg = Math.abs(data[i + 1] - bgG);
              const db = Math.abs(data[i + 2] - bgB);
              if (dr + dg + db > 36) nonBg++;
              samples++;
            }
          }
          const ratio = samples ? nonBg / samples : 0;
          if (ratio < 0.02) {
            report.issues.push(
              `placement-backdrop-pixels@${vp.name}:${Math.round(ratio * 1000) / 10}%`,
            );
          }
        } catch {
          report.issues.push(`placement-backdrop-pixels@${vp.name}:capture-failed`);
        }
      }
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
    {
      baseUrl: BASE,
      issues: report.issues,
      count: report.issues.length,
      reportPath,
      selfStore: SELF_STORE,
    },
    null,
    2,
  ),
);
if (report.issues.length > 0) process.exitCode = 1;
