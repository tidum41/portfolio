/**
 * Verifies copy-pass-v2 After strings are in the rendered DOM,
 * and that banned phrases have zero hits.
 * Usage: node scripts/copy-pass-check.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] || "http://127.0.0.1:4173";
const shotDir = "/opt/cursor/artifacts/copy-pass";

const required = [
  "Demo names and figures. Client accounts and wholesale numbers stay confidential.",
  "Saved orders belong to the account, so anyone on the team can reorder.",
  "Save this cart",
  "Save this order",
  "Saved order name",
  "Delete saved order?",
  "This removes the saved order for everyone on the account.",
  "Saved by Riley Brooks, updated Sep 30",
  "PO 118, placed by Maya Okonkwo",
  "Saved order renamed",
  "Saved order deleted",
  "Saved order restored",
  "Could not delete. Saved order restored.",
  "Add lines to the cart before saving an order.",
  "New saved order",
  "Saved order created from cart",
  "Could not save the order.",
  "Saved order added to cart",
  "Saved order created from past order",
  "Lines updated",
  "Could not update lines.",
  "Edit lines",
  "Save lines",
  "Wholesale ordering for your distributor account.",
  "Could not sign in.",
  "Check your connection, then try again. Unsaved cart lines stay on this device.",
  "The page did not load.",
  "Catalog did not load.",
  "Messages did not load.",
  "Invoices did not load.",
  "Saved orders did not load.",
  "Orders over remaining credit stay on pending approval until a JOOLA rep approves them.",
  "Your JOOLA rep needs to approve it before a ship date can be confirmed.",
  "Pending approval",
  "Pending confirmation",
  "Collin Johns needs to approve this order before a ship date can be confirmed.",
  "Collin Johns will confirm your ship date.",
  "No saved orders yet. Save a Quick order to create one.",
  "Low stock",
  "Ships in 3-5 days",
  "Saved for reorder",
  "Past purchase orders",
];

const banned = [
  { id: "ca-warehouse", re: /CA warehouse/ },
  { id: "tx-warehouse", re: /TX warehouse/ },
  { id: "template", re: /template/i },
  { id: "middot", re: /·/ },
  { id: "Templates", re: /\bTemplates\b/ },
  { id: "sign-in-failed", re: /Sign-in failed/ },
  { id: "then-retry", re: /then retry/ },
  { id: "held-for-sales", re: /held for sales approval/ },
];

function buyer(screen, state = "default") {
  return `${base}/${screen === "order-history" ? "orders" : screen}?clean=1&view=portal&screen=${screen}&state=${state}&account=dicks&latency=0&fail=0`;
}

const seen = new Set();
const bannedHits = [];
let blob = "";

function absorb(label, text) {
  blob += `\n\n/* ${label} */\n${text}`;
  for (const s of required) {
    if (text.includes(s)) seen.add(s);
  }
  for (const b of banned) {
    if (b.re.test(text)) {
      const sample = text.match(new RegExp(`.{0,48}${b.re.source}.{0,48}`, "i"))?.[0] ?? "";
      bannedHits.push({ label, id: b.id, sample: sample.replace(/\s+/g, " ").trim() });
    }
  }
}

async function clickEnabled(locator) {
  if ((await locator.count()) === 0) return false;
  const target = locator.first();
  if (!(await target.isEnabled())) return false;
  await target.click();
  return true;
}

async function grab(page, label) {
  const text = await page.evaluate(() => {
    const parts = [document.body.innerText];
    for (const el of document.querySelectorAll("[aria-label], [placeholder], title, [data-sonner-toast]")) {
      const aria = el.getAttribute("aria-label");
      const ph = el.getAttribute("placeholder");
      if (aria) parts.push(aria);
      if (ph) parts.push(ph);
      if (el.hasAttribute("data-sonner-toast")) parts.push(el.textContent || "");
    }
    return parts.join("\n");
  });
  absorb(label, text);
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

await mkdir(shotDir, { recursive: true });

const shot = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const shots = [
  [buyer("quick-order"), "quick-order"],
  [buyer("saved-orders"), "saved-orders"],
  [buyer("cart"), "cart"],
  [buyer("invoices"), "invoices"],
  [
    `${base}/prototypes/quick-order-row?clean=1&view=portal&screen=quick-order&state=default&account=dicks&v=3`,
    "stock-variant",
  ],
];
for (const [url, name] of shots) {
  await shot.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await shot.waitForTimeout(700);
  await shot.screenshot({ path: `${shotDir}/${name}-1440.png`, fullPage: true });
  await grab(shot, `shot:${name}`);
}
await shot.close();

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const staticRoutes = [
  [buyer("quick-order"), "quick-order"],
  [buyer("catalog"), "catalog"],
  [buyer("cart"), "cart"],
  [buyer("saved-orders"), "saved-orders"],
  [buyer("invoices"), "invoices"],
  [buyer("messages"), "messages"],
  [buyer("quick-order", "error"), "qo-error"],
  [buyer("quick-order", "offline"), "qo-offline"],
  [buyer("catalog", "error"), "catalog-error"],
  [buyer("messages", "error"), "messages-error"],
  [buyer("invoices", "error"), "invoices-error"],
  [buyer("saved-orders", "error"), "saved-error"],
  [buyer("saved-orders", "empty"), "saved-empty"],
];

for (const [url, label] of staticRoutes) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(500);
  if (label === "invoices") {
    const terms = page.getByRole("button", { name: "View Net 30 terms" });
    if (await terms.count()) {
      await terms.click();
      await page.waitForTimeout(300);
    }
  }
  await grab(page, label);
}

async function clientGo(path, screen) {
  await page.evaluate(({ path, screen }) => {
    const search = `clean=1&view=portal&screen=${screen}&state=default&account=dicks&latency=0&fail=0`;
    history.pushState({}, "", `${path}?${search}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, { path, screen });
  await page.waitForTimeout(450);
}

async function setFail(value) {
  await page.evaluate((v) => {
    const url = new URL(location.href);
    url.searchParams.set("fail", v);
    history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, value);
  await page.waitForTimeout(250);
}

await page.goto(buyer("saved-orders"), { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(500);
const firstHead = page.locator(".saved-list").first().locator(".tpl-head").first();
if (await firstHead.count()) await firstHead.click();
await page.waitForTimeout(200);
const del = page.getByRole("button", { name: "Delete" }).first();
if (await del.count()) {
  await del.click();
  await page.waitForTimeout(200);
  await grab(page, "delete-dialog");
  const confirm = page.getByRole("button", { name: "Delete" }).last();
  if (await confirm.count()) {
    await confirm.click();
    await page.waitForTimeout(400);
    await grab(page, "deleted-toast");
    const undo = page.getByRole("button", { name: "Undo" });
    if (await undo.count()) {
      await undo.click();
      await page.waitForTimeout(400);
      await grab(page, "restored-toast");
    }
  }
}
if ((await page.getByRole("button", { name: "Rename" }).count()) === 0) {
  await page.locator(".tpl-head").first().click();
  await page.waitForTimeout(200);
}
if (await clickEnabled(page.getByRole("button", { name: "Rename" }))) {
  await page.waitForTimeout(200);
  await grab(page, "rename-open");
  const input = page.getByLabel("Saved order name");
  if (await input.count()) {
    await input.fill("Court week");
    await input.press("Enter");
    await page.waitForTimeout(400);
    await grab(page, "renamed");
  }
}
await page.goto(buyer("saved-orders"), { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(400);
const head = page.locator(".saved-list").first().locator(".tpl-head").first();
if (await head.count()) await head.click();
if (await clickEnabled(page.getByRole("button", { name: "Edit lines" }))) {
  await page.waitForTimeout(200);
  await grab(page, "edit-open");
  if (await clickEnabled(page.getByRole("button", { name: "Save lines" }))) {
    await page.waitForTimeout(500);
  }
  await grab(page, "lines-updated");
}
if (await clickEnabled(page.getByRole("button", { name: "Add to cart" }))) {
  await page.waitForTimeout(300);
  await grab(page, "added-saved");
}
if (await clickEnabled(page.getByRole("button", { name: "Save this cart" }))) {
  await page.waitForTimeout(500);
  await grab(page, "saved-from-cart");
}
const past = page.locator("h2", { hasText: "Past purchase orders" });
if (await past.count()) {
  const pastHead = past.locator("xpath=following::button[contains(@class,'tpl-head')]").first();
  if (await pastHead.count()) await pastHead.click();
  if (await clickEnabled(page.getByRole("button", { name: "Save this order" }))) {
    await page.waitForTimeout(500);
    await grab(page, "saved-from-past");
  }
}

await page.goto(buyer("saved-orders"), { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(400);
await setFail("1");
try {
  await page.locator(".tpl-head").first().click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Edit lines" }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Save lines" }).click();
  await page.waitForTimeout(500);
  await grab(page, "lines-failed");
} catch (err) {
  absorb("fail-actions-error", String(err));
}
if (await clickEnabled(page.getByRole("button", { name: "Save this cart" }))) {
  await page.waitForTimeout(400);
  await grab(page, "save-failed");
}
await page.goto(buyer("saved-orders"), { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(400);
await setFail("1");
try {
  await page.locator(".tpl-head").first().click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Delete" }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Delete" }).last().click();
  await page.waitForTimeout(500);
  await grab(page, "delete-failed");
} catch (err) {
  absorb("delete-fail-error", String(err));
}
await setFail("0");

await page.goto(buyer("review"), { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(500);
if (await clickEnabled(page.getByRole("button", { name: "Place order" }))) {
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    history.pushState({}, "", "/order-placed?clean=1&view=portal&screen=order-placed&state=default&account=dicks&latency=0&fail=0");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await page.waitForTimeout(400);
  await grab(page, "placed-full-cart");
}

await clientGo("/saved-orders", "saved-orders");
if (await clickEnabled(page.getByRole("button", { name: "Save this cart" }))) {
  await page.waitForTimeout(300);
  await grab(page, "save-empty-cart");
}

await clientGo("/quick-order", "quick-order");
await page.waitForTimeout(400);
const steppers = page.locator(".qo-table__row").first().locator("button[aria-label='Increase quantity']");
for (let i = 0; i < 12; i += 1) {
  if (!(await clickEnabled(steppers))) break;
}
if (await clickEnabled(page.getByRole("button", { name: "Add to cart" }))) {
  await page.waitForTimeout(300);
}
await clientGo("/review", "review");
if (await clickEnabled(page.getByRole("button", { name: "Place order" }))) {
  await page.waitForTimeout(700);
  await clientGo("/order-placed", "order-placed");
  await grab(page, "placed-small");
}

await clientGo("/quick-order", "quick-order");
const qty = page.locator(".qo-table__row input.qty").first();
if (await qty.count()) {
  await qty.fill("200");
  await qty.blur();
  await page.waitForTimeout(200);
}
if (await clickEnabled(page.getByRole("button", { name: "Add to cart" }))) {
  await page.waitForTimeout(300);
}
await clientGo("/review", "review");
if (await clickEnabled(page.getByRole("button", { name: "Place order" }))) {
  await page.waitForTimeout(800);
  await clientGo("/order-placed", "order-placed");
  await grab(page, "placed-over");
}

await page.goto(buyer("quick-order"), { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(300);
await grab(page, "qo-final");

const login = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await login.goto(base, { waitUntil: "domcontentloaded" });
await login.evaluate(() => sessionStorage.clear());
await login.goto(
  `${base}/login?clean=1&view=portal&screen=login&state=default&account=dicks&latency=0&fail=0`,
  { waitUntil: "domcontentloaded" },
);
await login.waitForTimeout(400);
await grab(login, "login");
await login.goto(
  `${base}/login?clean=1&view=portal&screen=login&state=error&account=dicks&latency=0&fail=0`,
  { waitUntil: "domcontentloaded" },
);
await login.waitForTimeout(300);
if (await login.locator("#login-email").count()) {
  await login.locator("#login-password").fill("x");
  await login.getByRole("button", { name: "Sign in" }).click();
  await login.waitForTimeout(500);
}
await grab(login, "login-error");
await login.close();

await page.goto(
  `${base}/admin/orders?clean=1&view=admin&screen=admin-orders&state=default&account=dicks&latency=0&fail=0`,
  { waitUntil: "domcontentloaded", timeout: 30000 },
);
await page.waitForTimeout(700);
await grab(page, "admin-orders");
await page.goto(
  `${base}/prototypes/approval-queue?clean=1&view=admin&screen=approvals&state=default&account=dicks&v=1`,
  { waitUntil: "domcontentloaded", timeout: 30000 },
);
await page.waitForTimeout(600);
await grab(page, "aq-prototype");

await browser.close();

const missing = required.filter((s) => !seen.has(s));
const report = {
  required: required.length,
  found: seen.size,
  missing,
  bannedHits: bannedHits.length,
  banned: bannedHits,
};
console.log(JSON.stringify(report, null, 2));
process.exit(missing.length || bannedHits.length ? 1 : 0);
