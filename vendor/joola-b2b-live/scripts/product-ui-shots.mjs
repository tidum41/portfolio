/**
 * Product UI round screenshots → artifacts/product-ui-round/
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/product-ui-round");
const base = process.argv[2] || "http://127.0.0.1:4173";

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

const shots = [
  {
    name: "buyer-quick-order",
    route: "/quick-order",
    view: "portal",
    screen: "quick-order",
    crop: null,
  },
  {
    name: "buyer-cart",
    route: "/cart",
    view: "portal",
    screen: "cart",
    crop: null,
  },
  {
    name: "buyer-sidebar",
    route: "/quick-order",
    view: "portal",
    screen: "quick-order",
    clip: { x: 0, y: 0, width: 220, height: 520 },
  },
  {
    name: "admin-approvals",
    route: "/admin/approvals",
    view: "admin",
    screen: "approvals",
    crop: null,
  },
  {
    name: "admin-sidebar",
    route: "/admin/approvals",
    view: "admin",
    screen: "approvals",
    clip: { x: 0, y: 0, width: 220, height: 400 },
  },
  {
    name: "cart-pill-header",
    route: "/quick-order",
    view: "portal",
    screen: "quick-order",
    clip: { x: 780, y: 0, width: 500, height: 56 },
  },
];

const widths = [1280, 1440];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

await mkdir(outDir, { recursive: true });

for (const w of widths) {
  for (const s of shots) {
    const context = await browser.newContext({
      viewport: { width: w, height: 900 },
    });
    const page = await context.newPage();
    const state = s.view === "admin" ? "default" : "default";
    await page.goto(`${base}${s.route}?${qs(s.view, s.screen, state)}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(800);
    const file = path.join(outDir, `${s.name}-${w}.png`);
  if (s.clip) {
      await page.screenshot({ path: file, clip: s.clip });
    } else {
      await page.screenshot({ path: file, fullPage: true });
    }
    console.log("wrote", file);
    await context.close();
  }
}

await browser.close();
