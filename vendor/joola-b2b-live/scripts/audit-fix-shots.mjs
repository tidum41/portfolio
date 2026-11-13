/**
 * Audit fix verification shots → artifacts/audit-fix/
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/audit-fix");
const base = process.argv[2] || "http://127.0.0.1:4173";

function qs(view, screen) {
  return new URLSearchParams({
    clean: "1",
    view,
    screen,
    state: "default",
    latency: "0",
    fail: "0",
    account: "dicks",
  }).toString();
}

const shots = [
  { name: "quick-order", route: "/quick-order", view: "portal", screen: "quick-order" },
  { name: "cart", route: "/cart", view: "portal", screen: "cart" },
  { name: "saved-orders", route: "/saved-orders", view: "portal", screen: "saved-orders" },
  { name: "order-history", route: "/orders", view: "portal", screen: "order-history" },
  { name: "admin-orders", route: "/admin/orders", view: "admin", screen: "admin-orders" },
  { name: "admin-approvals", route: "/admin/approvals", view: "admin", screen: "approvals" },
];

const widths = [1440, 1024];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

await mkdir(outDir, { recursive: true });

for (const w of widths) {
  for (const s of shots) {
    const context = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}${s.route}?${qs(s.view, s.screen)}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(800);
    const file = path.join(outDir, `${s.name}-${w}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("wrote", file);
    await context.close();
  }
}

await browser.close();
