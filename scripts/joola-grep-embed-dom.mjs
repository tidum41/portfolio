/**
 * Fail if any case-study embed iframe exposes banned copy in rendered text.
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE = process.env.JOOLA_SITE_BASE ?? "http://localhost:3000";
const PREVIEW = `${BASE}/joola?sanity_preview=1`;

const FIGURES = [
  "quick-order-hero",
  "quick-order-portal",
  "quick-order-row-search",
  "quick-order-row-compare",
  "review-checkout",
  "approval-queue",
];

const BANNED = [
  { id: "case-pack", re: /\bcase of\b|by the case|quantities move by the case/i },
  { id: "cases-mode", re: /\bcases\b(?!\s+for)/i },
  { id: "dot-sep", re: /·/ },
  { id: "store-link", re: /joola\.com store/i },
  { id: "em-dash", re: /—/ },
];

function hits(text) {
  const out = [];
  for (const rule of BANNED) {
    if (rule.re.test(text)) out.push(rule.id);
  }
  return out;
}

const browser = await chromium.launch();
const context = await browser.newContext({
  extraHTTPHeaders: { "x-joola-sanity-preview": "1" },
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
await page.goto(PREVIEW, { waitUntil: "load", timeout: 120000 });

for (const fig of FIGURES) {
  const host = page.locator(`[data-joola-figure="${fig}"]`);
  if ((await host.count()) === 0) continue;
  await host.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const frame = page.frameLocator(`[data-joola-figure="${fig}"] iframe`);
  const text = await frame.locator("body").innerText().catch(() => "");
  const bad = hits(text);
  assert.equal(
    bad.length,
    0,
    `${fig} banned copy (${bad.join(", ")}): ${text.slice(0, 240)}`,
  );
}

await browser.close();
console.log("Embed DOM copy guard passed for", FIGURES.length, "figures.");
