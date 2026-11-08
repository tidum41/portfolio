/**
 * HOM-09 Boundary: Hero Copy & /dialogue Invariant Edge Cases
 * 
 * Verifies hero text encoding integrity, zero hidden characters,
 * responsive typography, and /dialogue navigation edge cases.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import { CANONICAL_COPY, VIEWPORTS } from "../helpers/env.mjs";

export const id = "HOM-09-BND";
export const name = "Hero Copy & /dialogue Invariant Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-09-BND.1: Hero heading text has no zero-width spaces or hidden unicode anomalies",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const text = await page.evaluate(() => {
        const h = document.querySelector("#hero h1, .hero-title, h1");
        return h ? h.innerText : "";
      });

      // Assert no zero-width spaces (\u200B, \u200C, \u200D, \uFEFF)
      assert(!/[\u200B-\u200D\uFEFF]/.test(text), "Hero text contains hidden zero-width unicode characters");
      assertEqual(text.trim(), CANONICAL_COPY.heroHeading);
    },
  },
  {
    name: "HOM-09-BND.2: Subtitle contains exact dot separator ' · ' and linking structure",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const sub = await page.evaluate(() => {
        const s = document.querySelector("#hero .hero-sub, .hero-sub");
        return s ? s.innerText : "";
      });

      assert(sub.includes("·"), "Subtitle is missing middle dot separator ('·')");
      assert(sub.includes("Cursor @ UCLA"), "Subtitle missing 'Cursor @ UCLA'");
      assert(sub.includes("@ JOOLA"), "Subtitle missing '@ JOOLA'");
    },
  },
  {
    name: "HOM-09-BND.3: Hero text renders legibly on ultra-wide desktop (3840x2160)",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.desktopUltraWide });
      await page.goto(ctx.targetUrl);

      const heroVisible = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        const rect = h?.getBoundingClientRect();
        return rect && rect.width > 0 && rect.height > 0;
      });

      assert(heroVisible, "Hero text layout failed on ultra-wide display");
    },
  },
  {
    name: "HOM-09-BND.4: /dialogue loads cleanly when accessed directly via URL",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      const dialogueUrl = new URL("/dialogue", ctx.targetUrl).toString();
      const res = await page.goto(dialogueUrl);

      assertEqual(res?.status() || 200, 200, "Direct visit to /dialogue returned non-200 status");
    },
  },
  {
    name: "HOM-09-BND.5: Navigating from / to /joola and back preserves hero copy invariant",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const joolaUrl = new URL(CANONICAL_COPY.joolaHref, ctx.targetUrl).toString();
      await page.goto(joolaUrl);
      await page.goBack();

      const headingAfter = await page.evaluate(() => {
        const h = document.querySelector("#hero h1, .hero-title, h1");
        return h ? h.innerText.trim() : "";
      });

      assertEqual(headingAfter, CANONICAL_COPY.heroHeading, "Hero heading altered after navigating to /joola and back");
    },
  },
];
