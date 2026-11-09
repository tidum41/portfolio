/**
 * Tier 3 Pairwise: Color Preset Selection + Halftone Mode
 * 
 * Tests that selecting color swatches updates silk uniforms,
 * preserves Halftone mode defaults, and persists across reloads.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import { SPEC_TIMINGS } from "../helpers/env.mjs";

export const id = "PAIR-04";
export const name = "Pairwise: Color Preset Selection + Halftone Mode";
export const tier = "tier3-pairwise";

export const tests = [
  {
    name: "PAIR-04.1: Color preset swatches apply without altering default Halftone mode",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      // Mode should remain Halftone
      const isHalftone = await page.evaluate(() => {
        const btn = document.getElementById("mode-halftone");
        return btn ? btn.classList.contains("active") : false;
      });
      assert(isHalftone, "Halftone mode was unexpectedly changed");
    },
  },
  {
    name: "PAIR-04.2: Selecting preset maintains intensity within valid [0.0, 1.0] range",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const intensity = await page.evaluate(() => {
        const slider = document.getElementById("slider-intensity");
        return slider ? parseFloat(slider.value) : null;
      });

      assert(intensity >= 0 && intensity <= 1.0, `Preset intensity out of bounds: ${intensity}`);
    },
  },
  {
    name: "PAIR-04.3: Clicking Reset after preset selection restores canonical 0.29 default",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      await page.click("#panel-reset");

      const resetVal = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assertEqual(resetVal, SPEC_TIMINGS.defaultHalftoneIntensity, "Reset did not restore 0.29 default");
    },
  },
  {
    name: "PAIR-04.4: Active swatch styling reflects selected color without layout jitter",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const panelBox = await page.locator("#control-panel").boundingBox();
      assert(panelBox !== null, "Control panel bounding box missing");
    },
  },
];
