#!/usr/bin/env node
import { chromium } from "playwright";

const BASE =
  process.env.DIALOGUE_STORY_MAP_URL || "http://localhost:3000/dev/dialogue-canvas-v2";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

async function waitForPageReady(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const maxScroll = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    );
    const step = Math.max(200, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y <= maxScroll; y += step) {
      window.scrollTo(0, y);
      await sleep(80);
    }
    window.scrollTo(0, maxScroll);
    await sleep(300);
    for (const img of document.querySelectorAll("img")) {
      img.scrollIntoView({ block: "center", behavior: "instant" });
      await sleep(60);
    }
    window.scrollTo(0, 0);
    await sleep(300);
  });

  await page.waitForFunction(
    () => {
      const imgs = [...document.querySelectorAll("img")];
      if (imgs.length === 0) return true;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    { timeout: 120000 },
  );

  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const el of document.querySelectorAll(".reveal:not(.visible)")) {
      el.scrollIntoView({ block: "center", behavior: "instant" });
      await sleep(80);
    }
    await sleep(400);
  });

  await page.waitForFunction(
    () => {
      const reveals = [...document.querySelectorAll(".reveal")];
      if (reveals.length === 0) return true;
      return reveals.every((el) => el.classList.contains("visible"));
    },
    { timeout: 120000 },
  );

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
}

async function verifyViewport(page, { name, width, height }) {
  await page.setViewportSize({ width, height });
  const resp = await page.goto(BASE, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector(".dcv2", { timeout: 60000 });
  const status = resp?.status() ?? 0;
  await waitForPageReady(page);

  const metrics = await page.evaluate(() => {
    const iframe = document.querySelector(".dcv2-live__iframe");
    const iframeDoc = iframe?.contentDocument;
    const iframeBodyBg = iframeDoc?.body
      ? getComputedStyle(iframeDoc.body).backgroundColor
      : null;
    const title = document.querySelector(".dcv2__page-title");
    const titleFont = title ? getComputedStyle(title).fontFamily : "";
    const arealLoaded = [...document.fonts].some((f) => /areal/i.test(f.family));
    const helveticaOk = /Helvetica Neue|Helvetica/i.test(titleFont);
    return { iframeBodyBg, titleFont, arealLoaded, helveticaOk };
  });

  const caseStudy = await page.locator("#dcv2-case-study").count();
  const chips = await page.locator(".dc-raster__chip").count();
  const artifacts = await page.locator(".dcv2-artifacts__row").count();
  const iframes = await page.locator(".dcv2-live__iframe").count();

  const out = `/opt/cursor/artifacts/dialogue-canvas-v2-preview-${name}.png`;
  await page.screenshot({ path: out, fullPage: true });

  if (status !== 200 || caseStudy < 1 || chips < 10 || artifacts < 10 || iframes < 10) {
    throw new Error(
      JSON.stringify({ name, status, caseStudy, chips, artifacts, iframes, metrics, out }),
    );
  }
  return { name, status, metrics, out };
}

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];
for (const vp of VIEWPORTS) {
  results.push(await verifyViewport(page, vp));
}
await browser.close();
console.log("verify ok", results);
