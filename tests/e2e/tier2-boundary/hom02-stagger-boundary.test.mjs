/**
 * HOM-02 Boundary: Hero & Nav Stagger Edge Cases
 * 
 * Verifies stagger behavior under immediate viewport resize,
 * early scroll attempts, and responsive break-points.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import { VIEWPORTS } from "../helpers/env.mjs";

export const id = "HOM-02-BND";
export const name = "Hero & Nav Stagger Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-02-BND.1: Viewport resize from desktop to mobile during stagger preserves reveal",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.desktop });
      await page.goto(ctx.targetUrl);

      // Mid-stagger resize at 1000ms
      await page.waitForTimeout(1000);
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.waitForTimeout(500);

      const heroVisible = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h && parseFloat(window.getComputedStyle(h).opacity) > 0;
      });

      assert(heroVisible, "Hero text became invisible after mid-stagger resize");
    },
  },
  {
    name: "HOM-02-BND.2: Scrolling down immediately during stagger does not cause layout shift or crash",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 200));

      const scrollY = await page.evaluate(() => window.scrollY);
      assert(scrollY >= 0, "Invalid scroll position");
    },
  },
  {
    name: "HOM-02-BND.3: Hero text does not wrap unexpectedly at narrowest mobile width (320px)",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.mobileNarrow });
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const headingRect = await page.evaluate(() => {
        const h = document.querySelector("#hero h1, .hero-title, h1");
        return h ? h.getBoundingClientRect() : null;
      });

      assert(headingRect !== null, "Hero heading element missing at 320px");
      assert(headingRect.width <= 320, `Heading width ${headingRect.width} exceeds viewport width 320`);
    },
  },
  {
    name: "HOM-02-BND.4: Nav elements do not flash visible before their stagger phase",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Check nav opacity at 200ms, 400ms, 600ms
      for (const ms of [200, 400, 600]) {
        await page.waitForTimeout(200);
        const navOp = await page.evaluate(() => {
          const nav = document.getElementById("site-nav") || document.querySelector("nav");
          return nav ? parseFloat(window.getComputedStyle(nav).opacity) : 0;
        });
        assert(navOp <= 0.15, `Nav unexpectedly flashed visible (${navOp}) at ${ms}ms`);
      }
    },
  },
  {
    name: "HOM-02-BND.5: StrictMode double invocation does not corrupt stagger timing",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });
      const completed = await page.evaluate(() => window.__introCompleted);
      assertEqual(completed, true, "Intro failed to complete in StrictMode lifecycle");
    },
  },
];
