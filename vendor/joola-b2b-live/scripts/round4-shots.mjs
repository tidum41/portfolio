/**
 * Round 4 screenshots → artifacts/round4/
 * Usage: node scripts/round4-shots.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/round4");
const base = process.argv[2] || "http://127.0.0.1:4173";

const shots = [
  { name: "portal-quick-order", route: "/quick-order", view: "portal", screen: "quick-order", state: "default", w: 1280 },
  { name: "portal-catalog", route: "/catalog", view: "portal", screen: "catalog", state: "default", w: 1280 },
  { name: "portal-cart", route: "/cart", view: "portal", screen: "cart", state: "default", w: 1280 },
  { name: "portal-invoices", route: "/invoices", view: "portal", screen: "invoices", state: "default", w: 1280 },
  { name: "admin-orders", route: "/admin/orders", view: "admin", screen: "admin-orders", state: "default", w: 1280 },
  { name: "admin-approvals", route: "/admin/approvals", view: "admin", screen: "approvals", state: "default", w: 1280 },
  { name: "admin-approvals-empty", route: "/admin/approvals", view: "admin", screen: "approvals", state: "empty", w: 1280 },
  { name: "admin-approvals-stress", route: "/admin/approvals", view: "admin", screen: "approvals", state: "approvals-stress", w: 1280 },
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

for (const s of shots) {
  for (const guides of [false, true]) {
    const context = await browser.newContext({ viewport: { width: s.w, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}${s.route}?${qs(s.view, s.screen, s.state, guides)}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(800);
    if (guides) {
      // Wait until guides overlay matches document height (not just viewport).
      await page
        .waitForFunction(() => {
          const root = document.querySelector(".guides-root");
          if (!root) return false;
          const docH = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
          );
          return Math.abs(root.getBoundingClientRect().height - docH) <= 2;
        }, { timeout: 5000 })
        .catch(() => undefined);
      await page.waitForTimeout(200);
    }
    const suffix = guides ? "-guides" : "";
    const file = path.join(outDir, `after-${s.name}-${s.w}${suffix}-v2.png`);
    await page.screenshot({ path: file, fullPage: true });
    // Assert admin-orders landed on Orders, not Approvals
    if (s.name === "admin-orders" && !guides) {
      const h1 = (await page.locator("h1").first().textContent())?.trim() ?? "";
      const pathNow = new URL(page.url()).pathname;
      if (pathNow !== "/admin/orders" || /approval/i.test(h1)) {
        throw new Error(
          `admin-orders shot wrong screen: path=${pathNow} h1="${h1}"`,
        );
      }
    }
    console.log("wrote", file);
    await context.close();
  }
}

await browser.close();
