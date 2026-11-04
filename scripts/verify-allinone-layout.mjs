/**
 * Measure large Allinone popup geometry after the scrollbar-gutter / info fixes.
 * Reports panel x/width/gaps and info sheet height; saves screenshots.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1024", width: 1024, height: 768 },
  { name: "390", width: 390, height: 844 },
];
const THEMES = ["dark", "light"];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function skipIntro(page) {
  await page.evaluate(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-intro") === "playing") {
      html.setAttribute("data-intro", "done");
      window.dispatchEvent(new CustomEvent("intro-done"));
    }
    html.removeAttribute("data-intro");
  });
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }, theme);
}

async function openAllinone(page) {
  const card = page.locator('[data-grid-card="project-todolist"]');
  await card.scrollIntoViewIfNeeded();
  await card.locator('[role="button"]').first().click();
  await page
    .locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]')
    .waitFor({ state: "visible", timeout: 10000 });
}

async function measure(page) {
  return page.evaluate(() => {
    const backdrop = document.querySelector(".project-popup-backdrop--large");
    const panel = document.querySelector(".project-popup-panel--large");
    const infoBtn = document.querySelector(".popup-info-btn");
    const info = document.querySelector(".project-popup-info");
    if (!backdrop || !panel) return null;
    const br = backdrop.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const ib = infoBtn?.getBoundingClientRect() ?? null;
    const ir = info?.getBoundingClientRect() ?? null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      vw,
      vh,
      backdrop: { x: br.x, y: br.y, w: br.width, h: br.height },
      panel: {
        x: pr.x,
        y: pr.y,
        w: pr.width,
        h: pr.height,
        leftGap: pr.x,
        rightGap: vw - (pr.x + pr.width),
      },
      infoBtn: ib ? { x: ib.x, y: ib.y, w: ib.width, h: ib.height, right: ib.right } : null,
      info: ir
        ? {
            x: ir.x,
            y: ir.y,
            w: ir.width,
            h: ir.height,
            right: ir.right,
            topBelowBar: ir.y - (document.querySelector(".project-popup-topbar")?.getBoundingClientRect().bottom ?? ir.y),
          }
        : null,
      scrollbarGutter: getComputedStyle(document.documentElement).scrollbarGutter,
      bodyPadRight: document.body.style.paddingRight,
    };
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(BASE)).ok) break;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 500));
    if (i === 39) throw new Error("server not up");
  }

  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme === "light" ? "light" : "dark",
      });
      const page = await context.newPage();
      await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
      await setTheme(page, theme);
      await skipIntro(page);
      await page.waitForSelector('[data-grid-card="project-todolist"]', { timeout: 20000 });
      await openAllinone(page);
      await page.waitForTimeout(600);

      let m = await measure(page);
      assert(m, "missing measure");

      // Backdrop covers true viewport
      assert(Math.abs(m.backdrop.w - vp.width) <= 1, `${vp.name}/${theme}: backdrop w ${m.backdrop.w} != ${vp.width}`);
      assert(m.backdrop.x <= 0.5, `${vp.name}/${theme}: backdrop x ${m.backdrop.x}`);
      assert(m.backdrop.y <= 0.5, `${vp.name}/${theme}: backdrop y ${m.backdrop.y}`);

      if (vp.width >= 768) {
        const gapDiff = Math.abs(m.panel.leftGap - m.panel.rightGap);
        assert(gapDiff <= 2, `${vp.name}/${theme}: unequal gaps L=${m.panel.leftGap.toFixed(1)} R=${m.panel.rightGap.toFixed(1)}`);
        assert(m.panel.w >= Math.min(1240, vp.width - 96) - 1, `${vp.name}/${theme}: panel too narrow ${m.panel.w}`);
      } else {
        assert(Math.abs(m.panel.w - vp.width) <= 1, `${vp.name}/${theme}: mobile panel w ${m.panel.w} != ${vp.width}`);
        assert(m.panel.x <= 0.5, `${vp.name}/${theme}: mobile panel x ${m.panel.x}`);
      }

      await page.screenshot({ path: join(OUT, `allinone-fix-${vp.name}-${theme}-closed.png`) });

      await page.locator(".popup-info-btn").click();
      await page.locator(".project-popup-info").waitFor({ state: "visible" });
      await page.waitForTimeout(200);
      m = await measure(page);
      assert(m?.info, "info not measured");

      if (vp.width >= 768) {
        assert(m.info.w <= 320 + 1, `${vp.name}/${theme}: info width ${m.info.w} > 320`);
        // 52px iframe MenuBar + ~8px gap under the title tab.
        assert(m.info.topBelowBar >= 56 && m.info.topBelowBar <= 68, `${vp.name}/${theme}: info topBelowBar ${m.info.topBelowBar}`);
        // Right-aligned to info button (within 2px)
        const rightDiff = Math.abs(m.info.right - m.infoBtn.right);
        assert(rightDiff <= 2, `${vp.name}/${theme}: info right ${m.info.right} vs btn ${m.infoBtn.right}`);
      } else {
        assert(m.info.h <= vp.height * 0.5 + 2, `${vp.name}/${theme}: sheet h ${m.info.h} > 50dvh`);
      }

      await page.screenshot({ path: join(OUT, `allinone-fix-${vp.name}-${theme}-info.png`) });

      const row = {
        viewport: `${vp.width}x${vp.height}`,
        theme,
        backdrop: { w: +m.backdrop.w.toFixed(1), h: +m.backdrop.h.toFixed(1) },
        panel: {
          x: +m.panel.x.toFixed(1),
          w: +m.panel.w.toFixed(1),
          leftGap: +m.panel.leftGap.toFixed(1),
          rightGap: +m.panel.rightGap.toFixed(1),
        },
        info: {
          w: +m.info.w.toFixed(1),
          h: +m.info.h.toFixed(1),
          topBelowBar: +m.info.topBelowBar.toFixed(1),
          rightAlignDiff: m.infoBtn ? +(m.info.right - m.infoBtn.right).toFixed(1) : null,
        },
      };
      report.push(row);
      console.log(JSON.stringify(row));
      await context.close();
    }
  }

  writeFileSync(join(OUT, "allinone-layout-report.json"), JSON.stringify(report, null, 2));
  await browser.close();
  console.log("layout verification passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
