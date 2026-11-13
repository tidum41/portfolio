/**
 * Round 5b interaction recording → artifacts/round5/interactions-v2.webm
 * Flow: add to cart → toast, remove with undo, approve with undo, reject with reason.
 * Usage: node scripts/round5-recording.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../artifacts/round5");
const base = process.argv[2] || "http://127.0.0.1:4173";

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

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: {
    dir: outDir,
    size: { width: 1280, height: 800 },
  },
});

const page = await context.newPage();

async function pause(ms = 700) {
  await page.waitForTimeout(ms);
}

// 1) Quick order → add to cart → toast
await page.goto(`${base}/quick-order?${qs("portal", "quick-order")}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await pause(900);
const firstPreset = page.locator(".qo-table__row .qty-presets button").first();
await firstPreset.click();
await pause(500);
await page.getByRole("button", { name: "Add to cart" }).click();
await pause(1200);

// 2) Cart → remove with undo
await page.goto(`${base}/cart?${qs("portal", "cart")}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await pause(900);
const removeBtn = page.getByRole("button", { name: "Remove" }).first();
if (await removeBtn.count()) {
  await removeBtn.click();
  await pause(800);
  const undo = page.getByRole("button", { name: "Undo" }).first();
  if (await undo.count()) {
    await undo.click();
    await pause(900);
  }
}

// 3) Approvals → approve with undo
await page.goto(`${base}/admin/approvals?${qs("admin", "approvals")}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await pause(900);
const approveBtn = page.getByRole("button", { name: "Approve" }).first();
await approveBtn.click();
await pause(500);
const confirmApprove = page.locator(
  '[role="dialog"] button:has-text("Approve"), .modal button:has-text("Approve"), .sheet button:has-text("Approve")',
).first();
if (await confirmApprove.count()) {
  const reason = page.locator(
    '[role="dialog"] textarea, .modal textarea, textarea',
  ).first();
  if (await reason.count()) {
    await reason.fill("Looks good for Net 30.");
  }
  await confirmApprove.click();
  await pause(900);
  const undoApprove = page.getByRole("button", { name: "Undo" }).first();
  if (await undoApprove.count()) {
    await undoApprove.click();
    await pause(900);
  }
}

// 4) Reject with reason
const rejectBtn = page.getByRole("button", { name: /Reject/i }).first();
await rejectBtn.click();
await pause(500);
const reasonReject = page.locator(
  '[role="dialog"] textarea, .modal textarea, textarea',
).first();
if (await reasonReject.count()) {
  await reasonReject.fill("Overdue invoices — hold until remittance.");
}
const confirmReject = page.locator(
  '[role="dialog"] button:has-text("Reject"), .modal button:has-text("Reject")',
).first();
if (await confirmReject.count()) {
  await confirmReject.click();
  await pause(1200);
}

await context.close();
await browser.close();

// Rename the Playwright video to a stable name
import { readdir, rename } from "node:fs/promises";
const files = (await readdir(outDir)).filter((f) => f.endsWith(".webm"));
files.sort();
const newest = files[files.length - 1];
if (newest && newest !== "interactions-v2.webm") {
  const dest = path.join(outDir, "interactions-v2.webm");
  await rename(path.join(outDir, newest), dest);
  const info = await stat(dest);
  const mb = (info.size / (1024 * 1024)).toFixed(2);
  console.log(`wrote ${dest} (${mb} MB)`);
  if (info.size > 10 * 1024 * 1024) {
    console.warn("WARNING: recording exceeds 10MB");
  }
} else {
  console.log("video files:", files);
}
