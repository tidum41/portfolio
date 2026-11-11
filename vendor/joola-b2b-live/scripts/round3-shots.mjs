/**
 * Capture before/after Round 3 screenshots into artifacts/round3/
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/round3");
const base = process.argv[2] || "http://127.0.0.1:4173";
const tag = process.argv[3] || "after";

const only = process.argv[4]; // optional filter e.g. "approvals,quick-order"

const allShots = [
  { name: "quick-order", route: "/quick-order", view: "portal", screen: "quick-order", state: "default", w: 1280 },
  { name: "quick-order-error", route: "/quick-order", view: "portal", screen: "quick-order", state: "error", w: 1280 },
  { name: "approvals", route: "/admin/approvals", view: "admin", screen: "approvals", state: "default", w: 1280 },
  { name: "approvals", route: "/admin/approvals", view: "admin", screen: "approvals", state: "default", w: 1024 },
  { name: "catalog", route: "/catalog", view: "portal", screen: "catalog", state: "default", w: 1280 },
  { name: "saved-orders", route: "/saved-orders", view: "portal", screen: "saved-orders", state: "default", w: 1280 },
  { name: "cart", route: "/cart", view: "portal", screen: "cart", state: "default", w: 1280 },
];

const filter = only ? new Set(only.split(",").map((s) => s.trim())) : null;
const shots = filter
  ? allShots.filter((s) => filter.has(s.name) || filter.has(`${s.name}-${s.w}`))
  : allShots;

function qs(view, screen, state) {
  return new URLSearchParams({
    clean: "1",
    view,
    screen,
    state,
    latency: "0",
    fail: "0",
    account: "dicks",
  }).toString();
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

await mkdir(outDir, { recursive: true });

for (const s of shots) {
  const context = await browser.newContext({ viewport: { width: s.w, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}${s.route}?${qs(s.view, s.screen, s.state)}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(700);
  const file = path.join(outDir, `${tag}-${s.name}-${s.w}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("wrote", file);
  await context.close();
}

await browser.close();
