/**
 * Align skeleton to loaded All in One demo columns.
 * Asserts 0px delta on checkbox / text / toolbar-right / strip width.
 * Shoots skeleton + loaded with rulers, mid-crossfade; 1440/390 × light/dark.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function near(a, b, tol = 1) {
  return Math.abs(a - b) <= tol;
}

async function skipIntro(page) {
  await page.evaluate(() => {
    document.documentElement.removeAttribute("data-intro");
  });
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }, theme);
}

async function openModal(page) {
  await page.locator('[data-grid-card="project-todolist"] [role="button"]').first().click();
  await page
    .locator('[role="dialog"][aria-label="Designing a to-do list with AI organization"]')
    .waitFor({ state: "visible", timeout: 15000 });
}

async function waitReady(page) {
  await page.waitForFunction(() => {
    const iframe = document.querySelector('iframe[title="Allinone — AI to-do list"]');
    return iframe?.getAttribute("data-ready") === "true";
  }, { timeout: 20000 });
  await page.waitForTimeout(200);
}

async function measureLoaded(page) {
  return page.evaluate(() => {
    const iframe = document.querySelector('iframe[title="Allinone — AI to-do list"]');
    const doc = iframe.contentDocument;
    const ir = iframe.getBoundingClientRect();
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: +r.left.toFixed(1),
        right: +r.right.toFixed(1),
        w: +r.width.toFixed(1),
        pageX: +(ir.left + r.left).toFixed(1),
        pageRight: +(ir.left + r.right).toFixed(1),
      };
    };
    const app = doc.querySelector(".app");
    const check = doc.querySelector("[data-aio-checkbox]");
    const line = check?.closest("[class*='line'], [class*='item']");
    const text = line?.querySelector("[contenteditable]");
    const sort = doc.querySelector("[data-aio-sort]");
    const title = doc.querySelector("[data-aio-title]");
    const strip = doc.querySelector(".toolbarStrip");
    return {
      vw: iframe.contentWindow.innerWidth,
      iframe: { x: +ir.left.toFixed(1), w: +ir.width.toFixed(1) },
      app: box(app),
      check: box(check),
      text: box(text),
      title: box(title),
      sort: box(sort),
      strip: box(strip),
      sortRightGutter: sort && app
        ? +(app.getBoundingClientRect().right - sort.getBoundingClientRect().right).toFixed(1)
        : null,
      checkLeftInset: check && app
        ? +(check.getBoundingClientRect().left - app.getBoundingClientRect().left).toFixed(1)
        : null,
    };
  });
}

async function measureSkel(page) {
  return page.evaluate(() => {
    const host = document.querySelector(".aio-demo-embed");
    const skel = document.querySelector(".aio-demo-skel");
    const hr = host.getBoundingClientRect();
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: +(r.left - hr.left).toFixed(1),
        right: +(r.right - hr.left).toFixed(1),
        w: +r.width.toFixed(1),
        pageX: +r.left.toFixed(1),
        pageRight: +r.right.toFixed(1),
      };
    };
    const col = skel.querySelector("[data-aio-skel-col]");
    const check = skel.querySelector("[data-aio-skel-check]");
    const bar = skel.querySelector("[data-aio-skel-bar]");
    const title = skel.querySelector("[data-aio-skel-title]");
    const sort = skel.querySelector("[data-aio-skel-sort]");
    const strip = skel.querySelector("[data-aio-skel-strip]");
    const toolbarRight = skel.querySelector("[data-aio-skel-toolbar-right]");
    return {
      hostW: +hr.width.toFixed(1),
      col: box(col),
      check: box(check),
      text: box(bar), // bar left == text left
      title: box(title),
      sort: box(sort),
      strip: box(strip),
      toolbarRight: box(toolbarRight),
      sortRightGutter: sort && col
        ? +(col.getBoundingClientRect().right - sort.getBoundingClientRect().right).toFixed(1)
        : null,
      checkLeftInset: check && col
        ? +(check.getBoundingClientRect().left - col.getBoundingClientRect().left).toFixed(1)
        : null,
    };
  });
}

async function drawRulers(page, lines, label) {
  await page.evaluate(({ lines, label }) => {
    document.querySelectorAll("[data-aio-ruler]").forEach((n) => n.remove());
    const root = document.createElement("div");
    root.setAttribute("data-aio-ruler", "1");
    root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483646;";
    for (const L of lines) {
      const el = document.createElement("div");
      if (L.orient === "v") {
        el.style.cssText = `position:absolute;top:0;bottom:0;left:${L.at}px;width:1px;background:${L.color};`;
      } else {
        el.style.cssText = `position:absolute;left:0;right:0;top:${L.at}px;height:1px;background:${L.color};`;
      }
      root.appendChild(el);
    }
    const tag = document.createElement("div");
    tag.textContent = label || "";
    tag.style.cssText =
      "position:absolute;top:8px;left:8px;padding:4px 8px;background:rgba(0,0,0,0.75);color:#fff;font:11px/1.3 monospace;max-width:90vw;white-space:pre-wrap;";
    root.appendChild(tag);
    document.body.appendChild(root);
  }, { lines, label });
}

async function clearRulers(page) {
  await page.evaluate(() => {
    document.querySelectorAll("[data-aio-ruler]").forEach((n) => n.remove());
  });
}

async function forceSkeleton(page) {
  await page.evaluate(() => {
    const skel = document.querySelector(".aio-demo-skel");
    const iframe = document.querySelector('iframe[title="Allinone — AI to-do list"]');
    if (skel) {
      skel.setAttribute("data-hidden", "false");
      skel.style.opacity = "1";
      skel.style.transition = "none";
    }
    if (iframe) {
      iframe.setAttribute("data-ready", "false");
      iframe.style.opacity = "0";
      iframe.style.transition = "none";
    }
  });
}

async function shoot(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("shot", path);
}

async function runViewportTheme(browser, vp, theme, report) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    colorScheme: theme,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const key = `${vp.name}-${theme}`;

  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await setTheme(page, theme);
  await skipIntro(page);
  await openModal(page);
  await waitReady(page);

  const loaded = await measureLoaded(page);
  report[`${key}-loaded`] = loaded;

  // Loaded with rulers (page coords for overlay)
  const iframeX = loaded.iframe.x;
  const linesLoaded = [];
  if (loaded.check) linesLoaded.push({ orient: "v", at: loaded.check.pageX, color: "rgba(255,0,0,0.95)" });
  if (loaded.text) linesLoaded.push({ orient: "v", at: loaded.text.pageX, color: "rgba(0,100,255,0.95)" });
  if (loaded.sort) linesLoaded.push({ orient: "v", at: loaded.sort.pageRight, color: "rgba(0,180,80,0.95)" });
  if (loaded.app) {
    linesLoaded.push({ orient: "v", at: loaded.app.pageX, color: "rgba(180,0,255,0.7)" });
    linesLoaded.push({ orient: "v", at: loaded.app.pageRight, color: "rgba(180,0,255,0.7)" });
  }
  await drawRulers(
    page,
    linesLoaded,
    `${key} LOADED\nred=check L  blue=text L  green=sort R  purple=app\n` +
      `check=${loaded.check?.x} text=${loaded.text?.x} sortR=${loaded.sort?.right} gutter=${loaded.sortRightGutter}`,
  );
  await shoot(page, `aio-align-${key}-loaded-rulers.png`);
  await clearRulers(page);

  // Force skeleton visible for measure + shot
  await forceSkeleton(page);
  await page.waitForTimeout(80);
  const skel = await measureSkel(page);
  report[`${key}-skel`] = skel;

  // Deltas (iframe-local coords)
  const deltas = {
    checkX: +(skel.check.x - loaded.check.x).toFixed(1),
    textX: +(skel.text.x - loaded.text.x).toFixed(1),
    sortRight: +(skel.sort.right - loaded.sort.right).toFixed(1),
    colW: +(skel.col.w - loaded.app.w).toFixed(1),
    colX: +(skel.col.x - loaded.app.x).toFixed(1),
    stripW: +(skel.strip.w - loaded.strip.w).toFixed(1),
    sortGutter: +(skel.sortRightGutter - loaded.sortRightGutter).toFixed(1),
    checkInset: +(skel.checkLeftInset - loaded.checkLeftInset).toFixed(1),
  };
  report[`${key}-deltas`] = deltas;
  console.log(key, "deltas", deltas);

  assert(near(deltas.checkX, 0), `${key}: checkX delta ${deltas.checkX}`);
  assert(near(deltas.textX, 0), `${key}: textX delta ${deltas.textX}`);
  assert(near(deltas.sortRight, 0), `${key}: sortRight delta ${deltas.sortRight}`);
  assert(near(deltas.colW, 0), `${key}: colW delta ${deltas.colW}`);
  assert(near(deltas.colX, 0), `${key}: colX delta ${deltas.colX}`);
  assert(near(deltas.stripW, 0), `${key}: stripW delta ${deltas.stripW}`);
  assert(near(deltas.sortGutter, 0), `${key}: sortGutter delta ${deltas.sortGutter}`);
  assert(skel.sortRightGutter === 16, `${key}: sort gutter ${skel.sortRightGutter} ≠ 16`);
  assert(skel.checkLeftInset === 16, `${key}: check inset ${skel.checkLeftInset} ≠ 16`);

  const linesSkel = [];
  if (skel.check) linesSkel.push({ orient: "v", at: skel.check.pageX, color: "rgba(255,0,0,0.95)" });
  if (skel.text) linesSkel.push({ orient: "v", at: skel.text.pageX, color: "rgba(0,100,255,0.95)" });
  if (skel.sort) linesSkel.push({ orient: "v", at: skel.sort.pageRight, color: "rgba(0,180,80,0.95)" });
  if (skel.col) {
    linesSkel.push({ orient: "v", at: skel.col.pageX, color: "rgba(180,0,255,0.7)" });
    linesSkel.push({ orient: "v", at: skel.col.pageRight, color: "rgba(180,0,255,0.7)" });
  }
  await drawRulers(
    page,
    linesSkel,
    `${key} SKELETON\nred=check L  blue=bar/text L  green=sort R  purple=col\n` +
      `Δ check=${deltas.checkX} text=${deltas.textX} sortR=${deltas.sortRight} colW=${deltas.colW}`,
  );
  await shoot(page, `aio-align-${key}-skel-rulers.png`);
  await clearRulers(page);

  // Clean skeleton (no rulers)
  await shoot(page, `aio-skel-${key}.png`);

  // Mid-crossfade (light only at each width once — shoot for all themes as asked)
  await page.evaluate(() => {
    const skel = document.querySelector(".aio-demo-skel");
    const iframe = document.querySelector('iframe[title="Allinone — AI to-do list"]');
    if (skel) {
      skel.setAttribute("data-hidden", "false");
      skel.style.transition = "none";
      skel.style.opacity = "0.45";
    }
    if (iframe) {
      iframe.setAttribute("data-ready", "true");
      iframe.style.transition = "none";
      iframe.style.opacity = "0.55";
    }
  });
  await page.waitForTimeout(60);
  await shoot(page, `aio-skel-${key}-mid-crossfade.png`);

  await context.close();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {};

  for (const theme of ["light", "dark"]) {
    for (const vp of [
      { name: "1440", width: 1440, height: 900 },
      { name: "390", width: 390, height: 844 },
    ]) {
      await runViewportTheme(browser, vp, theme, report);
    }
  }

  writeFileSync(join(OUT, "aio-skel-align-report.json"), JSON.stringify(report, null, 2));
  console.log("align verification passed");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
