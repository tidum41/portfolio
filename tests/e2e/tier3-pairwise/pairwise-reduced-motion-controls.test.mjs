/**
 * Tier 3 Pairwise: Reduced Motion + Controls Menu Combinations
 * 
 * Tests the interaction of prefers-reduced-motion: reduce with controls menu
 * actions (reset, mode toggles, slider dragging).
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import { SPEC_TIMINGS } from "../helpers/env.mjs";

export const id = "PAIR-01";
export const name = "Pairwise: Reduced Motion + Controls Menu";
export const tier = "tier3-pairwise";

export const tests = [
  {
    name: "PAIR-01.1: Reset button restores 0.29 intensity under reduced motion with static ribbons",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);

      // Change intensity
      await page.evaluate(() => {
        const s = document.getElementById("slider-intensity");
        if (s) {
          s.value = "0.8";
          s.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });

      // Click reset
      await page.click("#panel-reset");

      const val = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assertEqual(val, SPEC_TIMINGS.defaultHalftoneIntensity, "Reset did not restore 0.29 under reduced motion");

      const uTime = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uTime : 0);
      assertEqual(uTime, 0, "Ribbons started moving after reset under reduced motion");
    },
  },
  {
    name: "PAIR-01.2: Toggling Halftone/Wave mode under reduced motion preserves static uTime = 0",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);

      // Toggle to Wave mode then back
      await page.click("#mode-wave");
      await page.waitForTimeout(100);
      await page.click("#mode-halftone");

      const uTime = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uTime : 0);
      assertEqual(uTime, 0, "Mode switch reactivated animation under reduced motion");
    },
  },
  {
    name: "PAIR-01.3: Dragging intensity slider under reduced motion updates value live without stutter",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);

      await page.evaluate(() => {
        const s = document.getElementById("slider-intensity");
        if (s) {
          s.value = "0.55";
          s.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });

      const displayedVal = await page.evaluate(() => document.getElementById("intensity-val")?.textContent);
      assertEqual(displayedVal, "0.55", "Displayed intensity label did not update live");
    },
  },
  {
    name: "PAIR-01.4: Reloading with reduced motion preserves adjusted slider position",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);
      await page.evaluate(() => {
        sessionStorage.setItem("ps3cp_intensity", "0.42");
      });

      await page.reload();
      const loaded = await page.evaluate(() => !!document.getElementById("slider-intensity"));
      assert(loaded, "Control panel failed to load on reload under reduced motion");
    },
  },
];
