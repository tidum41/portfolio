/**
 * Font/weight audit + capture helper for the type-system branch.
 * Expects Helvetica Neue (no Areal), weights ≤500.
 */
import { chromium } from "playwright";

const LOCAL = process.env.BASE_URL || "http://localhost:3000";

async function waitReady(page, { home = false } = {}) {
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  if (home) {
    await page.waitForFunction(() => {
      const intro = document.documentElement.getAttribute("data-intro");
      const sub = document.querySelector("[data-hero-sub], .hero-sub");
      const subOk = sub && parseFloat(getComputedStyle(sub).opacity) > 0.9;
      return intro !== "playing" && subOk;
    }, { timeout: 20000 });
  } else {
    await page.evaluate(() => {
      const html = document.documentElement;
      if (html.getAttribute("data-intro") === "playing") {
        html.setAttribute("data-intro", "done");
        window.dispatchEvent(new CustomEvent("intro-done"));
      }
    });
    await page.waitForTimeout(600);
  }
}

async function audit(page, route) {
  await page.goto(LOCAL + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitReady(page, { home: route === "/" });
  return page.evaluate(() => {
    const body = getComputedStyle(document.body);
    let badWeight = 0;
    let arealRefs = 0;
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = walk.nextNode())) {
      if (!(n instanceof HTMLElement) || !n.getClientRects().length) continue;
      const cs = getComputedStyle(n);
      if (/areal/i.test(cs.fontFamily)) arealRefs++;
      const w = parseInt(cs.fontWeight, 10);
      if (Number.isFinite(w) && w > 500) badWeight++;
    }
    const first = (body.fontFamily || "").split(",")[0].replace(/["']/g, "").trim();
    return {
      bodyFamily: body.fontFamily,
      firstFamily: first,
      bodyWeight: body.fontWeight,
      bodyLh: body.lineHeight,
      bodyLs: body.letterSpacing,
      arealRefs,
      badWeight,
      styleHasAreal: [...document.querySelectorAll("style")].some((s) =>
        /ABC Areal|AREAL/i.test(s.textContent || ""),
      ),
    };
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const reports = {};
for (const r of ["/", "/about", "/ucla-sublease", "/archive"]) {
  reports[r] = await audit(page, r);
}
console.log(JSON.stringify(reports, null, 2));
const fail = Object.values(reports).some(
  (r) => r.arealRefs > 0 || r.badWeight > 0 || r.styleHasAreal || r.firstFamily !== "Helvetica Neue",
);
await browser.close();
process.exit(fail ? 1 : 0);
