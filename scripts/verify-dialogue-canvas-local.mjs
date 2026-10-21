#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const STORE = "/cursor/stores/bot/dialogue-canvas-verify";
fs.mkdirSync(STORE, { recursive: true });

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

function contentRootSelector(path) {
  if (path.includes("dialogue-canvas")) return ".dcv2";
  return ".dialogue-case-study";
}

async function waitForPageReady(page, path = "") {
  const rootSel = contentRootSelector(path);
  await page.evaluate(async (sel) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const maxScroll = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    );
    const step = Math.max(180, Math.floor(window.innerHeight * 0.7));
    for (let y = 0; y <= maxScroll; y += step) {
      window.scrollTo(0, y);
      await sleep(120);
    }
    window.scrollTo(0, maxScroll);
    await sleep(300);
    const root = document.querySelector(sel) ?? document.body;
    for (const img of root.querySelectorAll("img")) {
      img.scrollIntoView({ block: "center", behavior: "instant" });
      await sleep(60);
    }
    window.scrollTo(0, 0);
    await sleep(300);
  }, rootSel);

  await page.waitForFunction(
    (sel) => {
      const root = document.querySelector(sel) ?? document.body;
      const imgs = [...root.querySelectorAll("img")];
      if (imgs.length === 0) return true;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    rootSel,
    { timeout: 120000 },
  );

  await page.evaluate(async (sel) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const root = document.querySelector(sel) ?? document.body;
    for (const el of root.querySelectorAll(".reveal:not(.visible)")) {
      el.scrollIntoView({ block: "center", behavior: "instant" });
      await sleep(80);
    }
    await sleep(400);
  }, rootSel);

  await page.waitForFunction(
    (sel) => {
      const root = document.querySelector(sel) ?? document.body;
      const reveals = [...root.querySelectorAll(".reveal")];
      if (reveals.length === 0) return true;
      return reveals.every((el) => el.classList.contains("visible"));
    },
    rootSel,
    { timeout: 120000 },
  );

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
}

async function checkDialogueTypography(page) {
  const fonts = await page.evaluate(() => {
    const stack = '"Helvetica Neue", Helvetica, Arial, sans-serif';
    const title = document.querySelector(".dcv2__page-title");
    const canvas = document.querySelector(".dcv2");
    const titleFont = title ? getComputedStyle(title).fontFamily : "";
    const canvasFont = canvas ? getComputedStyle(canvas).fontFamily : "";
    const titleWeight = title ? getComputedStyle(title).fontWeight : "";
    const usesHelvetica = (family) => /Helvetica Neue|Helvetica/i.test(family);
    const arealLoaded = [...document.fonts].some((f) => /areal/i.test(f.family));
    return {
      titleFont,
      canvasFont,
      titleWeight,
      helveticaOk: usesHelvetica(titleFont) && usesHelvetica(canvasFont),
      weightOk: Number(titleWeight) <= 500,
      arealLoaded,
      stack,
    };
  });
  if (!fonts.helveticaOk) throw new Error(`expected Helvetica stack, got ${JSON.stringify(fonts)}`);
  if (!fonts.weightOk) throw new Error(`expected font-weight <= 500, got ${fonts.titleWeight}`);
  if (fonts.arealLoaded) throw new Error("ABC Areal should not load on dialogue canvas");
  return fonts;
}

async function checkIframes(page) {
  const count = await page.locator(".dcv2-live__iframe").count();
  if (count < 10) throw new Error(`expected live iframes, got ${count}`);
  const frame = page.frameLocator(".dcv2-live__iframe").first();
  await frame.locator("[data-export-canvas], [data-testid]").first().waitFor({
    timeout: 15000,
  });
  const snippet = await frame.locator("body").innerText();
  if (!snippet.includes("Research") && !snippet.includes("checkout")) {
    throw new Error("iframe body missing expected styled export copy");
  }
  const bg = await frame.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
  return { iframeCount: count, bodyBg: bg };
}

async function verifyPath(page, path, name) {
  const resp = await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector(".dcv2, .dialogue-case-study", { timeout: 60000 }).catch(() => {});
  if ((resp?.status() ?? 0) !== 200) throw new Error(`${path} HTTP ${resp?.status()}`);
  await waitForPageReady(page, path);
  const out = `${STORE}/${name}.png`;
  await page.screenshot({ path: out, fullPage: true });
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(120000);
const consoleIssues = [];
page.on("console", (msg) => {
  if (msg.type() === "error" && !msg.text().includes("404")) {
    consoleIssues.push(msg.text());
  }
});
page.on("pageerror", (e) => consoleIssues.push(e.message));

const report = { viewports: [], typography: null, iframes: null, shots: {} };

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  report.shots.canvas = report.shots.canvas || {};
  report.shots.dialogue = report.shots.dialogue || {};
  report.shots.canvas[vp.name] = await verifyPath(
    page,
    "/dev/dialogue-canvas-v2",
    `canvas-${vp.name}`,
  );
  report.shots.dialogue[vp.name] = await verifyPath(page, "/dialogue", `dialogue-${vp.name}`);
  report.viewports.push(vp.name);
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/dev/dialogue-canvas-v2`, { waitUntil: "load" });
await page.waitForSelector(".dcv2-live__iframe", { timeout: 60000 });
await waitForPageReady(page, "/dev/dialogue-canvas-v2");
report.typography = await checkDialogueTypography(page);
report.iframes = await checkIframes(page);

if (consoleIssues.length) {
  throw new Error(`console issues:\n${consoleIssues.join("\n")}`);
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
