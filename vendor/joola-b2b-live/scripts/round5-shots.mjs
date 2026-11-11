/**
 * Round 5 / 5b screenshots → artifacts/round5/
 * Usage: node scripts/round5-shots.mjs [baseUrl]
 * Writes after-*-v2.png (and skeleton loading shots).
 */
import { chromium } from "playwright";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/round5");
const base = process.argv[2] || "http://127.0.0.1:4173";
const TAG = process.argv.includes("--v5")
  ? "v5"
  : process.argv.includes("--v4")
    ? "v4"
    : process.argv.includes("--v3")
      ? "v3"
      : "v2";
const ONLY_TAG =
  process.argv.includes("--v5") ||
  process.argv.includes("--v4") ||
  process.argv.includes("--v3");

const shots = [
  { name: "portal-quick-order", route: "/quick-order", view: "portal", screen: "quick-order", state: "default", w: 1280 },
  { name: "portal-quick-order", route: "/quick-order", view: "portal", screen: "quick-order", state: "default", w: 1024 },
  { name: "portal-catalog", route: "/catalog", view: "portal", screen: "catalog", state: "default", w: 1280 },
  { name: "portal-cart", route: "/cart", view: "portal", screen: "cart", state: "default", w: 1280 },
  { name: "portal-saved-orders", route: "/saved-orders", view: "portal", screen: "saved-orders", state: "default", w: 1280 },
  { name: "portal-invoices", route: "/invoices", view: "portal", screen: "invoices", state: "default", w: 1280 },
  { name: "portal-messages", route: "/messages", view: "portal", screen: "messages", state: "default", w: 1280 },
  { name: "admin-orders", route: "/admin/orders", view: "admin", screen: "admin-orders", state: "default", w: 1280 },
  { name: "admin-approvals", route: "/admin/approvals", view: "admin", screen: "approvals", state: "default", w: 1280 },
  { name: "admin-approvals", route: "/admin/approvals", view: "admin", screen: "approvals", state: "default", w: 1024 },
  { name: "admin-approvals-stress", route: "/admin/approvals", view: "admin", screen: "approvals", state: "approvals-stress", w: 1280 },
  { name: "states-sheet", route: "/dev/states-sheet", view: "portal", screen: "quick-order", state: "default", w: 1280, bare: true },
  { name: "break-approvals", route: "/dev/break-approvals", view: "portal", screen: "quick-order", state: "default", w: 1280, bare: true },
  // Round 5b skeleton loading shots
  { name: "portal-quick-order-skeleton", route: "/quick-order", view: "portal", screen: "quick-order", state: "loading", w: 1280 },
  { name: "portal-cart-skeleton", route: "/cart", view: "portal", screen: "cart", state: "loading", w: 1280 },
  { name: "admin-approvals-skeleton", route: "/admin/approvals", view: "admin", screen: "approvals", state: "loading", w: 1280 },
];

function qs(view, screen, state, guides = false) {
  const p = new URLSearchParams({
    clean: "1",
    view,
    screen,
    state,
    latency: "0",
    fail: "0",
    account: "dicks",
  });
  if (guides) p.set("guides", "1");
  return p.toString();
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

await mkdir(outDir, { recursive: true });

const taggedOnly = [
  { name: "portal-quick-order", route: "/quick-order", view: "portal", screen: "quick-order", state: "default", w: 1280 },
  { name: "portal-quick-order", route: "/quick-order", view: "portal", screen: "quick-order", state: "default", w: 1024 },
  { name: "states-sheet", route: "/dev/states-sheet", view: "portal", screen: "quick-order", state: "default", w: 1280, bare: true },
  { name: "admin-approvals", route: "/admin/approvals", view: "admin", screen: "approvals", state: "default", w: 1280 },
];

const v5Only = [
  { name: "portal-quick-order", route: "/quick-order", view: "portal", screen: "quick-order", state: "default", w: 1280 },
  { name: "portal-quick-order", route: "/quick-order", view: "portal", screen: "quick-order", state: "default", w: 1024 },
  { name: "portal-catalog", route: "/catalog", view: "portal", screen: "catalog", state: "default", w: 1280 },
  { name: "portal-cart", route: "/cart", view: "portal", screen: "cart", state: "default", w: 1280 },
  { name: "portal-review", route: "/review", view: "portal", screen: "review", state: "default", w: 1280 },
  { name: "portal-saved-orders", route: "/saved-orders", view: "portal", screen: "saved-orders", state: "default", w: 1280 },
  { name: "portal-order-history", route: "/orders", view: "portal", screen: "order-history", state: "default", w: 1280 },
  { name: "portal-invoices", route: "/invoices", view: "portal", screen: "invoices", state: "default", w: 1280 },
  { name: "states-sheet", route: "/dev/states-sheet", view: "portal", screen: "quick-order", state: "default", w: 1280, bare: true },
];

const shotList = process.argv.includes("--v5")
  ? v5Only
  : process.argv.includes("--v4")
    ? taggedOnly.filter((s) => s.name !== "states-sheet")
    : ONLY_TAG
      ? taggedOnly
      : shots;

for (const s of shotList) {
  const guideModes = s.bare || s.state === "loading" ? [false] : [false, true];
  for (const guides of guideModes) {
    const context = await browser.newContext({
      viewport: { width: s.w, height: 900 },
    });
    const page = await context.newPage();
    const url = s.bare
      ? `${base}${s.route}?clean=1`
      : `${base}${s.route}?${qs(s.view, s.screen, s.state, guides)}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(900);
    if (s.state === "loading") {
      await page.waitForSelector(".skel, .skel__row", { timeout: 5000 }).catch(() => undefined);
    }
    if (guides) {
      await page
        .waitForFunction(() => {
          const root = document.querySelector(".guides-root");
          if (!root) return false;
          const docH = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
          );
          return Math.abs(root.getBoundingClientRect().height - docH) <= 2;
        }, { timeout: 4000 })
        .catch(() => undefined);
    }
    const suffix = guides ? "-guides" : "";
    const file = path.join(outDir, `after-${s.name}-${s.w}${suffix}-${TAG}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("wrote", file);
    // Also refresh untagged after-* for convenience (non-guides only)
    if (!guides) {
      const legacy = path.join(outDir, `after-${s.name}-${s.w}.png`);
      await page.screenshot({ path: legacy, fullPage: true });
    }
    await context.close();
  }
}

const pairs = [
  [
    "artifacts/round4/after-admin-approvals-1280-v2.png",
    "artifacts/round5/before-admin-approvals-1280.png",
  ],
  [
    "artifacts/round4/after-portal-quick-order-1280-v2.png",
    "artifacts/round5/before-portal-quick-order-1280.png",
  ],
];
for (const [from, to] of pairs) {
  try {
    await copyFile(path.resolve(__dirname, "../..", from), path.resolve(__dirname, "../..", to));
    console.log("pair", to);
  } catch (e) {
    console.log("skip pair", from, e.message);
  }
}

await browser.close();
