/**
 * Verify vendored All in One @0dc819d (PriorityBadge urgency cue) in portfolio.
 * - Modal opens with skeleton, then iframe data-ready + skeleton hides
 * - 1440 light: badge hover shows inset ring + chevron
 * - 390 light: touch chevron visible at rest
 * Shots: /opt/cursor/artifacts/aio-urgency-{1440,390}-light.png
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function skipIntro(page) {
  await page.evaluate(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-intro") === "playing") {
      html.setAttribute("data-intro", "done");
      window.dispatchEvent(new CustomEvent("intro-done"));
      html.removeAttribute("data-intro");
    } else {
      html.removeAttribute("data-intro");
    }
  });
  await page
    .waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), {
      timeout: 5000,
    })
    .catch(() => {});
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }, theme);
}

/** Seed sorted tasks with urgencies so PriorityBadge mounts (demo dump has none). */
const SAMPLE_TASKS = [
  {
    id: "pb1",
    text: "read Norman chapter 3 before UX class tomorrow",
    category: "School",
    priority: "Urgent",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "pb2",
    text: "add an about section and PS3 sounds to my portfolio site",
    category: "Product design",
    priority: "Soon",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "pb3",
    text: "look for a standing desk",
    category: "Home",
    priority: "Eventually",
    dateAdded: new Date().toISOString(),
  },
];

async function seedPrioritizedTasks(context) {
  await context.addInitScript((tasks) => {
    try {
      sessionStorage.setItem("demo:v11:tasks", JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  }, SAMPLE_TASKS);
}

async function armSkeletonWatcher(page) {
  await page.evaluate(() => {
    window.__aioSawSkeleton = false;
    const watch = () => {
      const sk = document.querySelector(".aio-demo-skel");
      if (sk && sk.getAttribute("data-hidden") !== "true") {
        window.__aioSawSkeleton = true;
      }
    };
    watch();
    window.__aioSkelMo?.disconnect();
    const mo = new MutationObserver(watch);
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-hidden"],
    });
    window.__aioSkelMo = mo;
  });
}

async function openAllinone(page) {
  await armSkeletonWatcher(page);
  const card = page.locator('[data-grid-card="project-todolist"]');
  await card.scrollIntoViewIfNeeded();
  await card.waitFor({ state: "visible", timeout: 20000 });
  await card.locator('[role="button"]').first().click();
  const dialog = page.locator(
    '[role="dialog"][aria-label="Designing a to-do list with AI organization"]',
  );
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  return dialog;
}

async function waitDemoReady(page) {
  await page.waitForSelector(".aio-demo-skel", { timeout: 10000 });
  await page.waitForSelector(
    'iframe[title="Allinone — AI to-do list"][data-ready="true"]',
    { timeout: 25000 },
  );
  await page.waitForFunction(() => {
    const sk = document.querySelector(".aio-demo-skel");
    return sk?.getAttribute("data-hidden") === "true";
  }, { timeout: 10000 });

  const sawSkeleton = await page.evaluate(() => {
    window.__aioSkelMo?.disconnect();
    return Boolean(window.__aioSawSkeleton);
  });
  assert(sawSkeleton, "expected AllinoneDemoSkeleton visible before ready crossfade");

  const frame = page.frameLocator('iframe[title="Allinone — AI to-do list"]');
  await frame.locator("[data-aio-priority-badge]").first().waitFor({
    state: "visible",
    timeout: 20000,
  });
  return frame;
}

function ringOk(boxShadow) {
  if (!boxShadow || !boxShadow.includes("inset")) return false;
  const srgb = boxShadow.match(
    /color\(srgb\s+[\d.]+\s+[\d.]+\s+[\d.]+\s*\/\s*([\d.]+)\)/,
  );
  if (srgb) {
    const a = parseFloat(srgb[1]);
    return a >= 0.35 && a <= 0.5;
  }
  const m = boxShadow.match(/rgba?\(([^)]+)\)/);
  if (!m) return false;
  const parts = m[1].split(",").map((s) => s.trim());
  if (parts.length < 4) return false;
  const a = parseFloat(parts[3]);
  return a >= 0.35 && a <= 0.5;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {};

  // ── 1440 light: skeleton → ready, badge hover ring+chevron ──
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "light",
      deviceScaleFactor: 1,
    });
    await seedPrioritizedTasks(context);
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
    await setTheme(page, "light");
    await skipIntro(page);
    await openAllinone(page);
    const frame = await waitDemoReady(page);

    const badge = frame.locator("[data-aio-priority-badge]").first();
    await badge.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await badge.hover();
    await page.waitForTimeout(200);
    const hover = await badge.evaluate((el) => {
      const chevron = el.querySelector("[class*='chevron']");
      const cs = getComputedStyle(el);
      const ch = chevron ? getComputedStyle(chevron) : null;
      return {
        cursor: cs.cursor,
        boxShadow: cs.boxShadow,
        chevronOpacity: ch ? parseFloat(ch.opacity) : 0,
        title: el.getAttribute("title"),
      };
    });
    assert(hover.cursor === "pointer", `1440 cursor=${hover.cursor}`);
    assert(ringOk(hover.boxShadow), `1440 ringBad shadow=${hover.boxShadow}`);
    assert(hover.chevronOpacity >= 0.9, `1440 chevron=${hover.chevronOpacity}`);
    report["1440-hover"] = hover;

    const shot1440 = join(OUT, "aio-urgency-1440-light.png");
    await page.screenshot({ path: shot1440, fullPage: false });
    console.log("shot", shot1440, hover);
    await context.close();
  }

  // ── 390 light: touch chevron at rest ──
  {
    const iPhone = devices["iPhone 13"];
    const context = await browser.newContext({
      ...iPhone,
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      colorScheme: "light",
    });
    await seedPrioritizedTasks(context);
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
    await setTheme(page, "light");
    await skipIntro(page);
    await openAllinone(page);
    const frame = await waitDemoReady(page);

    const badge = frame.locator("[data-aio-priority-badge]").first();
    await badge.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const rest = await badge.evaluate((el) => {
      const chevron = el.querySelector("[class*='chevron']");
      const ch = chevron ? getComputedStyle(chevron) : null;
      return {
        chevronOpacity: ch ? parseFloat(ch.opacity) : 0,
        title: el.getAttribute("title"),
        touchMedia: window.matchMedia("(hover: none)").matches,
      };
    });
    assert(rest.touchMedia, "390 hover:none not matched");
    assert(
      rest.chevronOpacity > 0.2 && rest.chevronOpacity < 0.8,
      `390 touchChevron=${rest.chevronOpacity}`,
    );
    report["390-rest"] = rest;

    const shot390 = join(OUT, "aio-urgency-390-light.png");
    await page.screenshot({ path: shot390, fullPage: false });
    console.log("shot", shot390, rest);
    await context.close();
  }

  await browser.close();
  writeFileSync(join(OUT, "aio-urgency-report.json"), JSON.stringify(report, null, 2));
  console.log("allinone urgency badge vendor checks passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
