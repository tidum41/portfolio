/**
 * Round-2 Allinone modal: CD close parity, spec-sheet info, why copy.
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

const WHY =
  "I found myself dumping all my tasks into one Apple Note, so I built a tool (all-in-one) that allows users to define how they want categories grouped, then have a model sort tasks accordingly. I imagined it as a stripped down version of Notes, with an organized list feature and standard notes.";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function boot(page, theme) {
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
    document.documentElement.removeAttribute("data-intro");
    window.dispatchEvent(new CustomEvent("intro-done"));
  }, theme);
  await page.waitForSelector('[data-grid-card="project-todolist"]', { timeout: 20000 });
}

async function measureClose(page, dialogSel) {
  return page.evaluate((sel) => {
    const panel = document.querySelector(sel);
    const btn = panel?.querySelector(".popup-close-btn");
    if (!panel || !btn) return null;
    const pr = panel.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    return {
      w: br.width,
      h: br.height,
      offsetTop: br.top - pr.top,
      offsetRight: pr.right - br.right,
    };
  }, dialogSel);
}

async function measureInfo(page) {
  return page.evaluate(() => {
    const panel = document.querySelector(".project-popup-panel--large");
    const infoBtn = document.querySelector(".popup-info-btn");
    const closeBtn = document.querySelector(".popup-close-btn");
    const info = document.querySelector(".project-popup-info");
    const link = document.querySelector(".project-popup-info-link");
    const value = document.querySelector(".project-popup-spec-value");
    const label = document.querySelector(".project-popup-spec-label");
    const whyLabel = document.querySelector(".project-popup-why-label");
    const whyBody = document.querySelector(".project-popup-why > p");
    const topbar = document.querySelector(".project-popup-topbar--large");
    if (!panel || !info) return null;
    const pr = panel.getBoundingClientRect();
    const ir = info.getBoundingClientRect();
    const ib = infoBtn.getBoundingClientRect();
    const cb = closeBtn.getBoundingClientRect();
    const tb = topbar.getBoundingClientRect();
    const lr = link?.getBoundingClientRect();
    const vr = value?.getBoundingClientRect();
    const rows = [...document.querySelectorAll(".project-popup-spec-label")].map((el) => el.textContent?.trim());
    return {
      info: {
        w: ir.width,
        h: ir.height,
        topBelowBar: ir.top - tb.bottom,
        rightAlignDiff: ir.right - ib.right,
      },
      infoBtn: { offsetTop: ib.top - pr.top, offsetRight: pr.right - ib.right, w: ib.width, h: ib.height },
      close: { offsetTop: cb.top - pr.top, offsetRight: pr.right - cb.right, w: cb.width, h: cb.height },
      link: lr && vr
        ? {
            leftDiff: lr.left - vr.left,
            valueFontSize: getComputedStyle(value).fontSize,
            linkFontSize: getComputedStyle(link).fontSize,
            valueColor: getComputedStyle(value).color,
          }
        : null,
      labelSample: label
        ? {
            font: getComputedStyle(label).fontFamily,
            size: getComputedStyle(label).fontSize,
            color: getComputedStyle(label).color,
            text: label.textContent?.trim(),
          }
        : null,
      whyLabel: whyLabel
        ? {
            font: getComputedStyle(whyLabel).fontFamily,
            size: getComputedStyle(whyLabel).fontSize,
            text: whyLabel.textContent?.trim(),
          }
        : null,
      whyBody: whyBody
        ? {
            font: getComputedStyle(whyBody).fontFamily,
            size: getComputedStyle(whyBody).fontSize,
            color: getComputedStyle(whyBody).color,
            text: whyBody.textContent?.trim(),
          }
        : null,
      rows,
      titleInTopbar: Boolean(topbar?.textContent?.match(/Designing a to-do/)),
    };
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(BASE)).ok) break; } catch { /* */ }
    await new Promise((r) => setTimeout(r, 500));
    if (i === 39) throw new Error("server down");
  }

  const browser = await chromium.launch({ headless: true });

  // CD close reference at 1440 dark
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await boot(page, "dark");
    await page.locator('[data-grid-card="cd"]').click();
    await page.locator('[role="dialog"][aria-label="Drag a CD"]').waitFor({ state: "visible" });
    const cdClose = await measureClose(page, '[role="dialog"][aria-label="Drag a CD"]');
    writeFileSync(join(OUT, "allinone-r2-cd-close.json"), JSON.stringify(cdClose, null, 2));
    console.log("CD close ref", cdClose);
    await ctx.close();

    // Store on global for comparisons below via closure
    globalThis.__cdClose = cdClose;
  }

  const report = [];
  const cdClose = globalThis.__cdClose;

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme === "light" ? "light" : "dark",
      });
      const page = await ctx.newPage();
      await boot(page, theme);

      await page.locator('[data-grid-card="project-todolist"] [role="button"]').click();
      const dialog = page.locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]');
      await dialog.waitFor({ state: "visible" });
      await page.waitForTimeout(500);

      // No title in topbar
      const hasTitle = await page.evaluate(() =>
        Boolean(document.querySelector(".project-popup-topbar--large")?.textContent?.match(/Designing a to-do/)),
      );
      assert(!hasTitle, `${vp.name}/${theme}: title still in topbar`);

      const close = await measureClose(
        page,
        '[role="dialog"][aria-label="Designing a to-do list with AI organization"]',
      );
      assert(close, "no close");
      // Match CD close offset within 1px (at 1440; other widths share same pad)
      if (vp.width === 1440) {
        assert(Math.abs(close.offsetTop - cdClose.offsetTop) <= 1, `close offsetTop ${close.offsetTop} vs CD ${cdClose.offsetTop}`);
        assert(Math.abs(close.offsetRight - cdClose.offsetRight) <= 1, `close offsetRight ${close.offsetRight} vs CD ${cdClose.offsetRight}`);
        assert(Math.abs(close.w - cdClose.w) <= 1 && Math.abs(close.h - cdClose.h) <= 1, `close size ${close.w}x${close.h}`);
      } else {
        // Same padding language: ~17px (16 pad + 1 border)
        assert(Math.abs(close.offsetTop - 17) <= 1.5, `${vp.name}: close offsetTop ${close.offsetTop}`);
        assert(Math.abs(close.offsetRight - 17) <= 1.5, `${vp.name}: close offsetRight ${close.offsetRight}`);
      }

      await page.screenshot({ path: join(OUT, `allinone-r2-${vp.name}-${theme}-closed.png`) });

      await page.locator(".popup-info-btn").click();
      await page.locator(".project-popup-info").waitFor({ state: "visible" });
      await page.waitForTimeout(200);

      let info = await measureInfo(page);
      assert(info, "info measure failed");
      assert(!info.rows.includes("Role") && !info.rows.includes("Hosting"), `banned rows: ${info.rows}`);
      assert(
        JSON.stringify(info.rows) ===
          JSON.stringify(["Timeline", "Built with", "AI", "Data", "Designed with"]),
        `rows ${info.rows}`,
      );

      if (vp.width >= 768) {
        assert(info.info.w <= 321, `info w ${info.info.w}`);
        assert(Math.abs(info.info.topBelowBar - 8) <= 1.5, `topBelowBar ${info.info.topBelowBar}`);
        assert(Math.abs(info.info.rightAlignDiff) <= 1.5, `rightAlignDiff ${info.info.rightAlignDiff}`);
        assert(Math.abs(info.link.leftDiff) <= 1, `link leftDiff ${info.link.leftDiff}`);
      } else {
        assert(info.info.h <= vp.height * 0.5 + 2, `sheet h ${info.info.h}`);
      }

      await page.screenshot({ path: join(OUT, `allinone-r2-${vp.name}-${theme}-info.png`) });

      await page.locator(".project-popup-why > summary").click();
      await page.waitForTimeout(150);
      info = await measureInfo(page);
      assert(info.whyBody?.text === WHY, `why text mismatch: ${info.whyBody?.text?.slice(0, 80)}`);
      assert(/Georgia/i.test(info.whyLabel.font), `why label font ${info.whyLabel.font}`);

      await page.screenshot({ path: join(OUT, `allinone-r2-${vp.name}-${theme}-why.png`) });

      const row = {
        viewport: `${vp.width}x${vp.height}`,
        theme,
        close,
        cdCloseDelta:
          vp.width === 1440
            ? {
                top: +(close.offsetTop - cdClose.offsetTop).toFixed(2),
                right: +(close.offsetRight - cdClose.offsetRight).toFixed(2),
              }
            : null,
        infoBtn: info.infoBtn,
        info: {
          w: +info.info.w.toFixed(1),
          h: +info.info.h.toFixed(1),
          topBelowBar: +info.info.topBelowBar.toFixed(1),
          rightAlignDiff: +info.info.rightAlignDiff.toFixed(1),
        },
        linkLeftDiff: info.link ? +info.link.leftDiff.toFixed(2) : null,
        whyFont: info.whyLabel.font.split(",")[0].replace(/"/g, ""),
        rows: info.rows,
      };
      report.push(row);
      console.log(JSON.stringify(row));
      await ctx.close();
    }
  }

  writeFileSync(join(OUT, "allinone-r2-report.json"), JSON.stringify({ cdClose, report }, null, 2));
  await browser.close();
  console.log("round2 verification passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
