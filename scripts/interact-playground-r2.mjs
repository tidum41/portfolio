#!/usr/bin/env node
/**
 * Playground r2 option A checks: scroll stability, reset, three presets, screenshots.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../shots/playground-r2");
const BASE = (process.env.BASE_URL || `http://localhost:${process.env.PORT || "3001"}`).replace(/\/$/, "");
mkdirSync(OUT, { recursive: true });

const PRESETS = [
  "How do shoppers read 'Arrives by Friday'?",
  "Do new and repeat shoppers read it the same way?",
  "Which delivery badge most changed confidence to add to cart?",
];

const browser = await chromium.launch({ headless: true });
const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

async function runViewport(page, name, width) {
  await page.setViewportSize({ width, height: 1200 });
  const res = await page.goto(`${BASE}/dialogue`, { waitUntil: "networkidle", timeout: 60000 });
  log(!!res && res.status() < 400, `${name}: load /dialogue (${res && res.status()})`);
  const demo = page.locator(".dlg-route-playground");
  await demo.waitFor({ state: "visible", timeout: 20000 });
  await demo.scrollIntoViewIfNeeded();
  const baselineY = await page.evaluate(() => window.scrollY);

  for (const question of PRESETS) {
    const before = baselineY;
    const route = page.waitForResponse(
      (r) => r.url().includes("/api/dialogue/route") && r.request().method() === "POST",
      { timeout: 15000 },
    );
    await demo.getByRole("button", { name: new RegExp(question.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).click();
    await route;
    await page.waitForTimeout(120);
    const scrollY = await page.evaluate(() => window.scrollY);
    log(before === scrollY, `${name}: window.scrollY stable after "${question.slice(0, 40)}" (${before} → ${scrollY})`);
  }

  await demo.getByRole("button", { name: "Reset chat" }).click();
  const turns = await demo.locator(".dp-user-bubble").count();
  const routing = await demo.locator(".dlg-route-playground__routing").count();
  const input = demo.locator(".dlg-route-playground__input");
  log(turns === 0, `${name}: reset cleared thread`);
  log(routing === 0, `${name}: reset cleared routing line`);
  log((await input.inputValue()) === "", `${name}: reset cleared composer`);

  const chips = await demo.locator(".dlg-route-playground__preset").count();
  log(chips === 5, `${name}: five preset chips after reset`);

  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
}

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
  "# Playground r2 interaction",
  "",
  `Base: ${BASE}`,
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
