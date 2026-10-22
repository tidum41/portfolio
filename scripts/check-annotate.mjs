#!/usr/bin/env node
/**
 * Annotation gate for preview and development builds.
 *   npm run check:annotate -- <preview-url>
 * Protected previews: pass a share link or set VERCEL_AUTOMATION_BYPASS_SECRET.
 *
 * Switches the agentation toolbar on, then for a chart bar, a pill, a lightbox
 * element, a JOOLA hero and a BruinLease figure checks that the real point
 * under the cursor resolves to the exact data-annotate part, annotates it,
 * and prints the markdown that Copy puts on the clipboard.
 * Pass --prod to assert the opposite: no toolbar and no agentation chunk.
 */
import { chromium } from "playwright";

const args = process.argv.slice(2);
const arg = args.find((a) => !a.startsWith("--"));
const expectProd = args.includes("--prod");
if (!arg) {
  console.error("usage: check-annotate.mjs <preview-url> [--prod]");
  process.exit(2);
}
const base = new URL(arg);
const share = base.searchParams.get("_vercel_share");
const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

function withAuth(path) {
  const u = new URL(path, base.origin);
  if (share) u.searchParams.set("_vercel_share", share);
  if (secret) {
    u.searchParams.set("x-vercel-protection-bypass", secret);
    u.searchParams.set("x-vercel-set-bypass-cookie", "true");
  }
  return u.toString();
}

const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});

async function load(path) {
  const page = await ctx.newPage();
  const loaded = [];
  page.on("response", (r) => loaded.push(r.url()));
  await page.goto(withAuth(path), { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  return { page, loaded };
}

const toolbar = (page) => page.locator("agentation-toolbar");
const toggle = (page) => page.getByRole("button", { name: /^(Start feedback mode|Exit)$/ }).first();

async function centerOf(page, selector) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  return box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : null;
}

async function annotate(page, label, selector, expectAttr, note) {
  const pt = await centerOf(page, selector);
  if (!pt) return log(false, `${label}: ${selector} has no box`);
  const hit = await page.evaluate(
    ({ x, y }) => {
      const els = document.elementsFromPoint(x, y);
      const part = els.find((e) => e.hasAttribute("data-annotate"));
      return {
        top: els[0] ? `${els[0].tagName.toLowerCase()}.${String(els[0].className).slice(0, 40)}` : null,
        annotate: part ? part.getAttribute("data-annotate") : null,
      };
    },
    pt,
  );
  const exact = hit.annotate === expectAttr;
  log(exact, `${label}: point resolves to data-annotate="${hit.annotate}" (top element ${hit.top})`);
  await page.mouse.move(pt.x, pt.y);
  await page.mouse.click(pt.x, pt.y);
  const box = page.locator("textarea").last();
  await box.waitFor({ timeout: 4000 });
  await box.fill(note);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
}

// Production check: no toolbar, no agentation chunk.
if (expectProd) {
  const { page, loaded } = await load("/dialogue");
  log((await toolbar(page).count()) === 0, "no annotation toolbar in the page");
  const chunks = loaded.filter((u) => u.includes("/_next/static/") && u.endsWith(".js"));
  let hits = 0;
  for (const u of chunks) {
    const body = await (await ctx.request.get(u)).text();
    if (/agentation|data-feedback-toolbar/.test(body)) hits++;
  }
  log(hits === 0, `no agentation code in ${chunks.length} loaded chunks (matches: ${hits})`);
  await browser.close();
  process.exit(failures.length ? 1 : 0);
}

// Dialogue: bar, pill, then a lightbox element.
{
  const { page } = await load("/dialogue");
  log((await toolbar(page).count()) > 0, "toolbar mounted on /dialogue");
  await toggle(page).click();
  await page.waitForTimeout(300);

  await annotate(
    page,
    "chart bar",
    '[data-annotate="dialogue-chart-groups-chosen/bar-new-customers"], [data-annotate^="dialogue-chart-groups-chosen/bar-"]:not([data-annotate*="bar-row"]):not([data-annotate*="bar-label"]):not([data-annotate*="bar-track"]):not([data-annotate*="bar-value"])',
    await page.evaluate(() =>
      [...document.querySelectorAll('[data-annotate^="dialogue-chart-groups-chosen/bar-"]')]
        .map((e) => e.getAttribute("data-annotate"))
        .find((a) => !/bar-(row|label|track|value)-/.test(a)),
    ),
    "Chart bar sits too close to its value label",
  );
  await annotate(
    page,
    "pill",
    '[data-annotate="dialogue-hero/source-pill-priya-k"]',
    "dialogue-hero/source-pill-priya-k",
    "Selected pill needs more contrast",
  );

  await annotate(
    page,
    "thin-data placeholder",
    '[data-annotate="dialogue-thin-data/chart-slot-note"]',
    "dialogue-thin-data/chart-slot-note",
    "Empty slot should be as tall as the hero chart",
  );

  await toggle(page).click();
  await page.waitForTimeout(300);
  await page.locator('[data-annotate="dialogue-hero/zoom"]').first().scrollIntoViewIfNeeded();
  await page.locator('[data-annotate="dialogue-hero/zoom"]').first().click();
  await page.waitForSelector(".cs-lightbox-backdrop", { timeout: 4000 });
  await page.waitForTimeout(500);
  await toggle(page).click();
  await page.waitForTimeout(300);

  const lbParts = await page.evaluate(
    () => [...document.querySelectorAll('.cs-lightbox-backdrop [data-annotate]')].map((e) => e.getAttribute("data-annotate")),
  );
  log(
    lbParts.includes("dialogue-hero/lightbox-dialog") && lbParts.includes("dialogue-hero/lightbox-close"),
    `lightbox parts present (${lbParts.length}, incl. dialog and close)`,
  );
  await annotate(
    page,
    "lightbox pill",
    '.cs-lightbox-backdrop [data-annotate="dialogue-hero-lightbox/source-pill-priya-k"]',
    "dialogue-hero-lightbox/source-pill-priya-k",
    "Pill in the enlarged view is clipped",
  );

  const tb = await page.getByRole("button", { name: "Copy feedback" }).boundingBox();
  const above = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.tagName.toLowerCase() === "agentation-toolbar",
    { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 },
  );
  log(above, "toolbar is hit-testable above the open lightbox");

  await page.getByRole("button", { name: "Copy feedback" }).click();
  await page.waitForTimeout(500);
  const md = await page.evaluate(() => navigator.clipboard.readText());
  console.log("\n----- copied markdown -----\n" + md + "\n---------------------------\n");
  log(/chart-groups-chosen\/bar-/.test(md), "markdown names the chart bar by data-annotate");
  log(/hero\/source-pill-priya-k/.test(md), "markdown names the pill by data-annotate");
  log(/dialogue-thin-data\/chart-slot/.test(md), "markdown names the thin-data placeholder by data-annotate");
  log(/dialogue-hero-lightbox\/source-pill-priya-k/.test(md), "markdown names the lightbox element by data-annotate");
  await page.close();
}

// JOOLA hero and BruinLease figure containers.
for (const [path, sel, name] of [
  ["/joola", '[data-annotate="joola-hero/media"]', "joola hero container"],
  ["/ucla-sublease", '[data-annotate="bruinlease-problem/root"]', "bruinlease problem figure"],
  ["/ucla-sublease", '[data-annotate="bruinlease-problem/media"]', "bruinlease problem media"],
]) {
  const { page } = await load(path);
  log((await page.locator(sel).count()) > 0, `${name} carries ${sel}`);
  await page.close();
}

// Comment box typing: no site shortcut may swallow a key typed into the toolbar.
// A hostile document keydown handler that preventDefaults letters stands in for
// the Vercel preview toolbar, which binds single letters such as "c".
const TYPED = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 !@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~";
for (const [path, point] of [
  ["/dialogue", null],
  ["/", { x: 720, y: 450 }],
]) {
  const { page } = await load(path);
  await page.evaluate(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) e.preventDefault();
    }, true);
  });
  await toggle(page).click();
  await page.waitForTimeout(300);
  const pt = point ?? (await centerOf(page, '[data-annotate="dialogue-hero/source-pill-priya-k"]'));
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(500);
  const box = page.locator("agentation-toolbar textarea:visible").first();
  const present = (await box.count()) > 0;
  log(present, `comment box opens on ${path}`);
  if (present) {
    await box.fill("");
    await box.focus();
    const urlBefore = page.url();
    await page.keyboard.type(TYPED, { delay: 5 });
    const value = await box.inputValue();
    log(value === TYPED, `comment box keeps every typed key on ${path} (got ${JSON.stringify(value)})`);
    log(page.url() === urlBefore, `typing did not navigate ${path}`);
  }
  await page.close();
}

await browser.close();
if (failures.length) {
  console.log(`\n${failures.length} FAILED`);
  process.exit(1);
}
console.log("\nALL PASSED");
