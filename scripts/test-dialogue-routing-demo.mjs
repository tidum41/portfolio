#!/usr/bin/env node
/**
 * Playwright regression: type a question on /dialogue and assert the routed
 * template paints (product tokens resolve; chart segment is not transparent).
 *
 *   npm run test:dialogue-routing-demo
 *   BASE_URL=https://…vercel.app npm run test:dialogue-routing-demo
 *
 * Requires a Next server on PORT (default 3000) unless BASE_URL is set.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || "3000"}`;
const QUESTION = "How do shoppers read Arrives by Friday?";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

try {
  const res = await page.goto(`${BASE.replace(/\/$/, "")}/dialogue`, {
    waitUntil: "networkidle",
  });
  log(!!res && res.status() < 400, `load /dialogue (${res && res.status()})`);

  const demo = page.locator(".dlg-route-demo");
  await demo.waitFor({ state: "attached", timeout: 15000 });
  await demo.scrollIntoViewIfNeeded();

  const hasTokenRoot = await demo.evaluate((el) =>
    el.classList.contains("dialogue-product-root"),
  );
  log(hasTokenRoot, "RoutingDemo root carries dialogue-product-root");

  const input = demo.locator(".dlg-route-demo__input");
  await input.waitFor({ state: "visible" });
  await input.click({ force: true });
  await page.keyboard.type(QUESTION, { delay: 8 });
  const typed = await input.inputValue();
  log(typed.includes("Arrives by Friday"), `typed question into input (${typed.slice(0, 48)})`);
  // Submit via Enter so we don't depend on the send button's disabled gate alone.
  await input.press("Enter");

  const answer = demo.locator(".dlg-route-answer[data-template]");
  await answer.waitFor({ state: "visible", timeout: 15000 });
  const template = await answer.getAttribute("data-template");
  log(template === "count_split", `routed template is count_split (got ${template})`);

  const paint = await demo.evaluate((root) => {
    const surface = getComputedStyle(root).getPropertyValue("--dp-surface").trim();
    const focal = getComputedStyle(root).getPropertyValue("--dp-chart-focal").trim();
    const seg =
      root.querySelector(".dp-chart-stack__seg[data-focal]") ||
      root.querySelector(".dp-chart-stack__seg");
    const bg = seg ? getComputedStyle(seg).backgroundColor : "";
    const transparent =
      !seg ||
      bg === "rgba(0, 0, 0, 0)" ||
      bg === "transparent" ||
      bg === "rgba(0,0,0,0)";
    const rect = seg?.getBoundingClientRect();
    return {
      surface,
      focal,
      bg,
      transparent,
      segW: rect ? rect.width : 0,
      segH: rect ? rect.height : 0,
    };
  });

  log(!!paint.surface, `--dp-surface resolves (${paint.surface || "empty"})`);
  log(!!paint.focal, `--dp-chart-focal resolves (${paint.focal || "empty"})`);
  log(!paint.transparent, `chart segment paints (${paint.bg})`);
  log(paint.segW > 8 && paint.segH > 4, `chart segment has size ${paint.segW}×${paint.segH}`);
} catch (err) {
  log(false, `uncaught: ${err instanceof Error ? err.message : String(err)}`);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nAll checks passed.");
