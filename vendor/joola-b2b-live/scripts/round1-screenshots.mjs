/**
 * Capture every DialKit screen × state into artifacts/round1/ with ?clean=1.
 * Usage: node scripts/round1-screenshots.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/round1");
const base = process.argv[2] || "http://127.0.0.1:4173";

const PORTAL = [
  ["login", "/login"],
  ["quick-order", "/quick-order"],
  ["catalog", "/catalog"],
  ["saved-orders", "/saved-orders"],
  ["order-history", "/orders"],
  ["cart", "/cart"],
  ["review", "/review"],
  ["order-placed", "/order-placed"],
  ["invoices", "/invoices"],
  ["messages", "/messages"],
];

const ADMIN = [["approvals", "/admin/approvals"]];

const STATES = [
  "default",
  "loading",
  "empty",
  "error",
  "syncing",
  "success",
  "offline",
  "break-long-names",
  "break-huge-amounts",
  "break-100-lines",
  "break-0-items",
];

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

async function freshPage(browser) {
  // Fresh context per shot so sessionStorage cannot leak across roles/screens.
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  return { context, page };
}

async function shot(browser, view, screen, route, state) {
  const { context, page } = await freshPage(browser);
  const url = `${base}${route}?${qs(view, screen, state)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  const wantAdmin = view === "admin";
  const deadline = Date.now() + 8000;
  let ready = false;
  while (Date.now() < deadline) {
    const info = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return {
        path: location.pathname,
        search: location.search,
        h1: (h1?.textContent || "").trim(),
        bodyLen: (document.body?.innerText || "").trim().length,
        clean: new URLSearchParams(location.search).get("clean"),
      };
    });
    const pathOk = wantAdmin
      ? info.path.startsWith("/admin")
      : screen === "login"
        ? info.path.startsWith("/login")
        : !info.path.startsWith("/login") && !info.path.startsWith("/admin");
    if (pathOk && info.clean === "1" && info.bodyLen > 40 && info.h1) {
      ready = true;
      break;
    }
    await page.waitForTimeout(120);
  }
  if (!ready) {
    console.warn(`warn: slow settle ${view}/${screen}/${state} @ ${page.url()}`);
  }

  await page.waitForTimeout(200);
  await page.addStyleTag({
    content:
      "[data-dialkit-root], .dialkit, #dialkit-root { display: none !important; }",
  });

  const file = path.join(outDir, `${view}__${screen}__${state}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await context.close();
  return file;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const jobs = [
    ...PORTAL.map(([screen, route]) => ({
      view: "portal",
      screen,
      route,
    })),
    ...ADMIN.map(([screen, route]) => ({
      view: "admin",
      screen,
      route,
    })),
  ];

  let n = 0;
  for (const job of jobs) {
    for (const state of STATES) {
      const file = await shot(
        browser,
        job.view,
        job.screen,
        job.route,
        state,
      );
      n += 1;
      console.log(`[${n}] ${path.basename(file)}`);
    }
  }

  await browser.close();
  console.log(`Wrote ${n} screenshots to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
