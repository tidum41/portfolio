/**
 * Capture DialKit screen × state into artifacts/round2/ with ?clean=1.
 * Usage: node scripts/round2-screenshots.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/round2");
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

async function shot(browser, view, screen, route, state) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const url = `${base}${route}?${qs(view, screen, state)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  const wantAdmin = view === "admin";
  const deadline = Date.now() + 7000;
  while (Date.now() < deadline) {
    const info = await page.evaluate(() => ({
      path: location.pathname,
      clean: new URLSearchParams(location.search).get("clean"),
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      bodyLen: (document.body?.innerText || "").trim().length,
    }));
    const pathOk = wantAdmin
      ? info.path.startsWith("/admin")
      : screen === "login"
        ? info.path.startsWith("/login")
        : !info.path.startsWith("/login") && !info.path.startsWith("/admin");
    if (pathOk && info.clean === "1" && info.bodyLen > 40 && info.h1) break;
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(200);
  const file = path.join(outDir, `${view}__${screen}__${state}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await context.close();
  return file;
}

async function extras(browser) {
  // After pairs for known fixes + narrow + expanded baseline lines
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(
    `${base}/admin/approvals?${qs("admin", "approvals", "default")}`,
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, "after-approvals-default.png"),
    fullPage: true,
  });
  // Expand Baseline row (2nd data row)
  const rows = page.locator("tbody tr").filter({ hasText: "Baseline" });
  if (await rows.count()) {
    await rows.first().click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(outDir, "after-approvals-baseline-expanded.png"),
      fullPage: true,
    });
  }
  await context.close();

  const narrow = await browser.newContext({
    viewport: { width: 1024, height: 900 },
  });
  const np = await narrow.newPage();
  await np.goto(
    `${base}/admin/approvals?${qs("admin", "approvals", "default")}`,
    { waitUntil: "domcontentloaded" },
  );
  await np.waitForTimeout(800);
  await np.screenshot({
    path: path.join(outDir, "after-approvals-narrow-1024.png"),
    fullPage: true,
  });
  await narrow.close();

  const qo = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const qp = await qo.newPage();
  await qp.goto(
    `${base}/quick-order?${qs("portal", "quick-order", "default")}`,
    { waitUntil: "domcontentloaded" },
  );
  await qp.waitForTimeout(800);
  await qp.screenshot({
    path: path.join(outDir, "after-quick-order-default.png"),
    fullPage: true,
  });
  await qo.close();

  const br = await browser.newContext({
    viewport: { width: 900, height: 1200 },
  });
  const bp = await br.newPage();
  await bp.goto(`${base}/dev/break-qty?clean=1`, {
    waitUntil: "domcontentloaded",
  });
  await bp.waitForTimeout(500);
  await bp.screenshot({
    path: path.join(outDir, "break-qty-harness.png"),
    fullPage: true,
  });
  await br.close();
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
  await extras(browser);
  console.log("extras written");
  await browser.close();
  console.log(`Wrote screenshots to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
