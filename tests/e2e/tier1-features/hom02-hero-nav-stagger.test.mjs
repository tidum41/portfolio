/**
 * HOM-02: Hero & Nav Reveal Staggering Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "Stagger hero text and nav reveal after silk is mostly in;
 *   nothing else animates or pops during intro."
 * - PROJECT.md: Feature F1.3.
 */
import { assert, assertEqual, assertGreaterThanOrEqual, assertLessThanOrEqual } from "../helpers/assertions.mjs";

export const id = "HOM-02";
export const name = "Hero & Nav Reveal Staggering Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-02.1: html tag has data-intro='playing' upon initial cold load",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const introAttr = await page.evaluate(() => document.documentElement.getAttribute("data-intro"));
      assertEqual(introAttr, "playing", "Expected data-intro='playing' on root <html>");
    },
  },
  {
    name: "HOM-02.2: Hero text computed opacity is 0 during the initial 200ms of intro",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(100);
      const heroOpacity = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h ? parseFloat(window.getComputedStyle(h).opacity) : 0;
      });

      assertLessThanOrEqual(heroOpacity, 0.05, `Hero opacity was ${heroOpacity}, expected ~0.0 during initial intro`);
    },
  },
  {
    name: "HOM-02.3: Hero text reveal begins only after stagger delay (>= 800ms into intro)",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Check opacity at 500ms (still before stagger threshold 800ms)
      await page.waitForTimeout(500);
      const opacityAt500 = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h ? parseFloat(window.getComputedStyle(h).opacity) : 0;
      });

      assertLessThanOrEqual(opacityAt500, 0.2, `Hero opacity was ${opacityAt500} at 500ms, should still be mostly hidden`);

      // Check opacity at 1800ms (hero reveal in progress)
      await page.waitForTimeout(1300);
      const opacityAt1800 = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h ? parseFloat(window.getComputedStyle(h).opacity) : 0;
      });

      assertGreaterThanOrEqual(opacityAt1800, 0.3, `Hero opacity was ${opacityAt1800} at 1800ms, should be actively revealing`);
    },
  },
  {
    name: "HOM-02.4: Navigation links do not reveal ahead of hero text",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(600);
      const navOpacity = await page.evaluate(() => {
        const nav = document.getElementById("site-nav") || document.querySelector("nav");
        return nav ? parseFloat(window.getComputedStyle(nav).opacity) : 0;
      });

      assertLessThanOrEqual(navOpacity, 0.1, `Nav opacity was ${navOpacity} during early intro, expected 0`);
    },
  },
  {
    name: "HOM-02.5: Upon intro completion, hero text reaches computed opacity 1.0",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const finalHeroOpacity = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h ? parseFloat(window.getComputedStyle(h).opacity) : 0;
      });

      assertEqual(finalHeroOpacity, 1.0, "Hero opacity did not reach 1.0 at intro completion");
    },
  },
];
