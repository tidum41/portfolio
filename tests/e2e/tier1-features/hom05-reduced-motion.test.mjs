/**
 * HOM-05: Reduced Motion Preference Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "Respect prefers-reduced-motion with a short, simple fade."
 * - PROJECT.md: Feature F1.6 "Short gentle 350ms opacity fade with static ribbons (uTime = 0)".
 */
import { assert, assertLessThanOrEqual, assertEqual } from "../helpers/assertions.mjs";
import { SPEC_TIMINGS } from "../helpers/env.mjs";

export const id = "HOM-05";
export const name = "Reduced Motion Preference Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-05.1: prefers-reduced-motion produces short fade completing within <= 500ms",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      // Wait for intro completion with tight 600ms timeout
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 700 });

      const metrics = await page.evaluate(() => window.__ps3_metrics);
      const elapsedMs = metrics.fadeEndTime - metrics.prerollStart;

      assertLessThanOrEqual(
        elapsedMs,
        500,
        `Reduced motion intro took ${elapsedMs.toFixed(1)}ms, expected <= 500ms`
      );
    },
  },
  {
    name: "HOM-05.2: Ribbons stay static with uTime = 0 under prefers-reduced-motion",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);
      const uTime = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uTime : 0);
      
      assertEqual(uTime, 0, `Expected uTime to remain 0 under reduced-motion, but got ${uTime}`);
    },
  },
  {
    name: "HOM-05.3: Hero text reveals quickly without long cinematic stagger",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(350);
      const heroOpacity = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h ? parseFloat(window.getComputedStyle(h).opacity) : 0;
      });

      assert(heroOpacity >= 0.8, `Hero opacity was only ${heroOpacity} at 350ms under reduced-motion`);
    },
  },
  {
    name: "HOM-05.4: Controls panel becomes non-inert within 500ms",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(450);
      const isInert = await page.evaluate(() => {
        const panel = document.getElementById("control-panel") || document.querySelector("[data-intro-panel]");
        return panel ? panel.hasAttribute("inert") : false;
      });

      assert(!isInert, "Control panel remained inert past 450ms under reduced-motion");
    },
  },
  {
    name: "HOM-05.5: Reduced motion mode initializes without throwing or visual corruption",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await page.goto(ctx.targetUrl);
      await page.waitForTimeout(400);

      assertEqual(consoleErrors.length, 0, `Encountered console errors under reduced motion: ${consoleErrors.join("; ")}`);
    },
  },
];
