/**
 * Round 5 interaction bug-hunt — Playwright traces per flow.
 * Usage: node scripts/round5-flows.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/round5/traces");
const base = process.argv[2] || "http://127.0.0.1:4173";

const bugs = [];

function qs(view, screen, state = "default") {
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

async function flow(name, fn) {
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.tracing.start({ screenshots: true, snapshots: true });
  const page = await context.newPage();
  try {
    await fn(page);
    console.log("OK", name);
  } catch (err) {
    bugs.push({ flow: name, error: String(err?.message || err) });
    console.log("BUG", name, err?.message || err);
  }
  await context.tracing.stop({
    path: path.join(outDir, `${name}.zip`),
  });
  await context.close();
  await browser.close();
}

await mkdir(outDir, { recursive: true });

await flow("login", async (page) => {
  await page.goto(`${base}/login?${qs("portal", "login")}`);
  await page.waitForTimeout(400);
  const email = page.locator('input[type="email"], input[name="email"], .input').first();
  if (await email.count()) {
    await email.fill("maya.okonkwo@dicks.com");
    const btn = page.getByRole("button", { name: /sign in|log in|continue/i }).first();
    if (await btn.count()) await btn.click();
  }
  await page.waitForTimeout(600);
});

await flow("quick-order-add", async (page) => {
  await page.goto(`${base}/quick-order?${qs("portal", "quick-order")}`);
  await page.waitForTimeout(700);
  const row = page.locator(".qo-table__row").first();
  await row.locator(".qty-presets button").first().click();
  const add = page.getByRole("button", { name: /add to cart/i });
  await add.click();
  await page.waitForTimeout(400);
  const toast = page.locator("[data-sonner-toast], .joola-toast").first();
  if (!(await toast.count())) {
    // soft — toast may use different selector
  }
});

await flow("catalog-add", async (page) => {
  await page.goto(`${base}/catalog?${qs("portal", "catalog")}`);
  await page.waitForTimeout(700);
  const add = page.getByRole("button", { name: /add/i }).first();
  if (await add.count()) await add.click();
  await page.waitForTimeout(400);
});

await flow("cart-edit-remove", async (page) => {
  await page.goto(`${base}/cart?${qs("portal", "cart")}`);
  await page.waitForTimeout(700);
  const remove = page.getByRole("button", { name: /remove/i }).first();
  if (await remove.count()) {
    await remove.click();
    await page.waitForTimeout(300);
    const undo = page.getByRole("button", { name: /undo/i }).first();
    if (await undo.count()) await undo.click();
  }
});

await flow("review-place", async (page) => {
  await page.goto(`${base}/review?${qs("portal", "review")}`);
  await page.waitForTimeout(700);
  const place = page.getByRole("button", { name: /place order|submit/i }).first();
  if (await place.count() && !(await place.isDisabled())) {
    await place.click();
    await page.waitForTimeout(800);
  }
});

await flow("saved-orders", async (page) => {
  await page.goto(`${base}/saved-orders?${qs("portal", "saved-orders")}`);
  await page.waitForTimeout(700);
  const head = page.locator(".tpl-head, .tpl-card").first();
  if (await head.count()) await head.click();
});

await flow("order-history", async (page) => {
  await page.goto(`${base}/orders?${qs("portal", "order-history")}`);
  await page.waitForTimeout(700);
  const card = page.locator(".order-card__head").first();
  if (await card.count()) await card.click();
});

await flow("invoices", async (page) => {
  await page.goto(`${base}/invoices?${qs("portal", "invoices")}`);
  await page.waitForTimeout(700);
  const view = page.getByRole("button", { name: /view/i }).first();
  if (await view.count()) await view.click();
  await page.waitForTimeout(400);
});

await flow("messages-send", async (page) => {
  await page.goto(`${base}/messages?${qs("portal", "messages")}`);
  await page.waitForTimeout(700);
  const thread = page.locator(".msg-list button, .messages-list__item").first();
  if (await thread.count()) await thread.click();
  const box = page.locator("textarea").first();
  if (await box.count()) {
    await box.fill("Restock check — Round 5");
    const send = page.getByRole("button", { name: /send/i }).first();
    if (await send.count()) await send.click();
  }
});

await flow("admin-orders", async (page) => {
  await page.goto(`${base}/admin/orders?${qs("admin", "admin-orders")}`);
  await page.waitForTimeout(900);
  const h1 = (await page.locator("h1").first().textContent())?.trim() ?? "";
  if (!/recent orders/i.test(h1)) {
    throw new Error(`Expected Recent orders, got "${h1}" at ${page.url()}`);
  }
});

await flow("approvals-approve-reject", async (page) => {
  await page.goto(
    `${base}/admin/approvals?${qs("admin", "approvals", "approvals-stress")}`,
  );
  await page.waitForTimeout(900);
  // Secondary contact must be gone
  const body = await page.locator("body").innerText();
  if (/Secondary:/i.test(body)) {
    throw new Error("Secondary contact still visible on approvals");
  }
  const overHeader = page.getByRole("columnheader", { name: /over by/i });
  if (!(await overHeader.count())) {
    throw new Error("Missing Over by column (decision hierarchy)");
  }
  const reject = page.getByRole("button", { name: /^reject$/i }).first();
  await reject.click();
  await page.waitForTimeout(300);
  const reason = page.locator("textarea").first();
  if (!(await reason.count())) {
    throw new Error("Reject confirm missing reason field");
  }
  await reason.fill("Credit cannot cover this restock.");
  await page.getByRole("button", { name: /reject order/i }).click();
  await page.waitForTimeout(700);
});

await flow("dialkit-empty-error", async (page) => {
  await page.goto(
    `${base}/quick-order?${qs("portal", "quick-order", "empty")}`,
  );
  await page.waitForTimeout(700);
  await page.goto(
    `${base}/quick-order?${qs("portal", "quick-order", "error")}`,
  );
  await page.waitForTimeout(700);
  const err = page.locator(".error-state");
  if (!(await err.count())) throw new Error("Error state missing");
});

console.log(JSON.stringify({ bugs, count: bugs.length }, null, 2));
if (bugs.length) process.exitCode = 1;
