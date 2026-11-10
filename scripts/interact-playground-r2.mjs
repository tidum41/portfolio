#!/usr/bin/env node
/**
 * Playground r2: page scroll and document height must not move when sending presets.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const PLAYGROUND_PRESETS = [
  "How do shoppers read 'Arrives by Friday'?",
  "Do new and repeat shoppers read it the same way?",
  "What did shoppers ask for after checkout?",
  "Which delivery badge most changed confidence to add to cart?",
  "Did anyone miss a delivery over 'Arrives by Friday'?",
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../shots/playground-r2");
const BASE = (process.env.BASE_URL || `http://localhost:${process.env.PORT || "3002"}`).replace(/\/$/, "");
const TOL = 2;
mkdirSync(OUT, { recursive: true });

const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

function within(a, b, tol = TOL) {
  return Math.abs(a - b) <= tol;
}

async function pageMetrics(page) {
  return page.evaluate(() => ({
    y: window.scrollY,
    sh: document.documentElement.scrollHeight,
  }));
}

async function runViewport(page, name, width) {
  await page.setViewportSize({ width, height: 1200 });
  const res = await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle", timeout: 90000 });
  log(!!res && res.status() < 400, `${name}: load /dialogue (${res && res.status()})`);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const root = page.locator(".dlg-route-playground");
  await root.waitFor({ state: "attached", timeout: 60000 });
  const well = root.locator(".dlg-route-playground__well");
  await well.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);

  const baseline = await pageMetrics(page);
  log(true, `${name}: baseline scrollY=${baseline.y} scrollHeight=${baseline.sh}`);

  const assertStable = async (label) => {
    const now = await pageMetrics(page);
    const okY = within(now.y, baseline.y);
    const okSh = within(now.sh, baseline.sh);
    log(okY && okSh, `${name}: ${label} scrollY ${baseline.y}→${now.y}, scrollHeight ${baseline.sh}→${now.sh}`);
    return okY && okSh;
  };

  const clickPreset = async (question) => {
    const route = page.waitForResponse(
      (r) => r.url().includes("/api/dialogue/route") && r.request().method() === "POST",
      { timeout: 20000 },
    );
  await page.evaluate((q) => {
    const buttons = [...document.querySelectorAll(".dlg-route-playground__preset")];
    const btn = buttons.find((b) => b.textContent?.includes(q));
    if (!btn) throw new Error(`Preset not found: ${q}`);
    btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    btn.click();
  }, question);
    await route;
    await page.waitForTimeout(200);
    await assertStable(`after preset "${question.slice(0, 36)}"`);
  };

  for (const question of PLAYGROUND_PRESETS) {
    await clickPreset(question);
  }

  await page.evaluate(() => {
    const btn = document.querySelector(".dlg-route-playground__reset");
    btn?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    btn?.click();
  });
  await page.waitForTimeout(200);
  await assertStable("after reset");

  const chips = await root.locator(".dlg-route-playground__preset").count();
  const bubbles = await root.locator(".dp-user-bubble").count();
  log(chips === PLAYGROUND_PRESETS.length, `${name}: five preset chips after reset`);
  log(bubbles === 0, `${name}: thread cleared after reset`);

  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
}

const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newPage();
  await runViewport(desktop, "desktop-1280", 1280);
  await desktop.close();

  const phone = await browser.newPage();
  await runViewport(phone, "phone-390", 390);
  await phone.close();
} catch (err) {
  log(false, err instanceof Error ? err.message : String(err));
} finally {
  await browser.close();
}

const report = [
  "# Playground r2 scroll guard",
  "",
  `Base: ${BASE}`,
  `Tolerance: ±${TOL}px on scrollY and scrollHeight`,
  "",
  failures.length ? `Failures:\n${failures.map((f) => `- ${f}`).join("\n")}` : "All checks passed.",
  "",
].join("\n");
writeFileSync(join(OUT, "REPORT.md"), report);

if (failures.length) {
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nAll playground r2 checks passed.");
