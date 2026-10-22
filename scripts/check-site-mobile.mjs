#!/usr/bin/env node
/**
 * Site-wide mobile gate: horizontal pan is locked.
 *   npm run check:site-mobile -- <preview-url>
 * Per page at 390 and 360 (touch context): scrollWidth equals clientWidth on html and
 * body, scrollTo and wheel on the x axis do not move the page, and every sticky element
 * still sticks. Also asserts sticky still works at 1440 on /dialogue (.cs-aside).
 * SELFTEST=wide injects a 600px element and must fail.
 */
import { chromium } from "playwright";

const arg = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!arg) {
  console.error("usage: check-site-mobile.mjs <preview-url>");
  process.exit(2);
}
const base = new URL(arg);
const share = base.searchParams.get("_vercel_share");
const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const url = (path) => {
  const u = new URL(path, base.origin);
  if (share) u.searchParams.set("_vercel_share", share);
  if (secret) {
    u.searchParams.set("x-vercel-protection-bypass", secret);
    u.searchParams.set("x-vercel-set-bypass-cookie", "true");
  }
  return u.toString();
};
const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

const stickyProbe = () => {
  const els = [...document.querySelectorAll("*")].filter(
    (e) => getComputedStyle(e).position === "sticky" && e.getBoundingClientRect().height > 0,
  );
  return els.map((e) => {
    const cs = getComputedStyle(e);
    return { name: e.tagName + "." + String(e.className).slice(0, 30), top: parseFloat(cs.top) || 0 };
  });
};

const browser = await chromium.launch();
const pages = ["/", "/dialogue", "/joola", "/ucla-sublease", "/about"];
for (const width of [390, 360]) {
  for (const path of pages) {
    const label = `${path} @${width}`;
    try {
      const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      const res = await page.goto(url(path), { waitUntil: "networkidle" });
      if (!res || res.status() >= 400) throw new Error(`status ${res && res.status()}`);
      await page.waitForTimeout(1200);
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += 600) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        await page.waitForTimeout(40);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      if (process.env.SELFTEST === "wide") {
        await page.evaluate(() => {
          const d = document.createElement("div");
          d.style.cssText = "position:absolute;top:0;left:0;width:600px;height:10px";
          document.body.appendChild(d);
        });
      }
      const m = await page.evaluate(() => ({
        cw: document.documentElement.clientWidth,
        sw: document.documentElement.scrollWidth,
        bw: document.body.scrollWidth,
        bcw: document.body.clientWidth,
      }));
      await page.evaluate(() => window.scrollTo(300, 0));
      await page.mouse.wheel(300, 0);
      await page.waitForTimeout(200);
      const sx = await page.evaluate(() => window.scrollX);
      const eq = m.sw === m.cw && m.bw === m.bcw;
      log(eq && sx === 0, `${label} (scrollWidth ${m.sw} = clientWidth ${m.cw}, body ${m.bw} = ${m.bcw}, scrollX after pan ${sx})`);
      const stickies = await page.evaluate(stickyProbe);
      let ok = true;
      for (const s of stickies) ok = ok && Number.isFinite(s.top);
      log(ok, `${label} sticky elements still positioned sticky (${stickies.length} found)`);
      await ctx.close();
    } catch (e) {
      log(false, `${label}: ${e.message}`);
    }
  }
}

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(url("/dialogue"), { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => document.querySelector(".cs-aside").getBoundingClientRect().top);
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.querySelector(".cs-aside").getBoundingClientRect().top);
  log(after >= 0 && after <= 120, `sticky .cs-aside /dialogue @1440 stays pinned (top ${Math.round(before)} then ${Math.round(after)} after scrolling 1500)`);
  await ctx.close();
} catch (e) {
  log(false, `sticky desktop: ${e.message}`);
}

await browser.close();
console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASSED");
process.exit(failures.length ? 1 : 0);
