/**
 * HOM-06: Halftone Mode Default with Intensity 0.29 Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "Default mode Halftone with intensity 0.29 on first load, reset,
 *   and initial slider position across all constants, presets, and storage/URL restore."
 * - PROJECT.md: Feature F1.7.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import { SPEC_TIMINGS } from "../helpers/env.mjs";
import fs from "fs";
import path from "path";

export const id = "HOM-06";
export const name = "Halftone Mode Default with Intensity 0.29 Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-06.1: Active mode is Halftone (mode 1) on initial cold load",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Check mode toggle active state
      const isHalftoneActive = await page.evaluate(() => {
        const btn = document.getElementById("mode-halftone") || document.querySelector("[data-mode='1']");
        return btn ? btn.classList.contains("active") : false;
      });

      assert(isHalftoneActive, "Expected Halftone button to be active by default");
    },
  },
  {
    name: "HOM-06.2: Intensity slider value defaults to 0.29 on first load",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const sliderVal = await page.evaluate(() => {
        const slider = document.getElementById("slider-intensity") || document.querySelector("input[name='intensity']");
        return slider ? parseFloat(slider.value) : null;
      });

      assertEqual(
        sliderVal,
        SPEC_TIMINGS.defaultHalftoneIntensity,
        `Expected default intensity slider value to be 0.29, got ${sliderVal}`
      );
    },
  },
  {
    name: "HOM-06.3: Panel Reset button restores intensity to 0.29",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Wait for panel to become interactive
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      // Change intensity slider value
      await page.evaluate(() => {
        const slider = document.getElementById("slider-intensity");
        if (slider) {
          slider.value = "0.75";
          slider.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });

      // Click reset
      await page.click("#panel-reset");

      const resetVal = await page.evaluate(() => {
        const slider = document.getElementById("slider-intensity");
        return slider ? parseFloat(slider.value) : null;
      });

      assertEqual(
        resetVal,
        SPEC_TIMINGS.defaultHalftoneIntensity,
        `Expected reset to restore intensity to 0.29, got ${resetVal}`
      );
    },
  },
  {
    name: "HOM-06.4: PS3ControlPanel.tsx defines DEFAULT_INTENSITY_HT = 0.29 constant",
    fn: async () => {
      const panelPath = path.join(process.cwd(), "components/PS3ControlPanel.tsx");
      const src = fs.readFileSync(panelPath, "utf8");

      const match = src.match(/DEFAULT_INTENSITY_HT\s*=\s*([\d.]+)/);
      assert(match, "PS3ControlPanel.tsx must declare DEFAULT_INTENSITY_HT constant");
      const val = parseFloat(match[1]);
      assertEqual(val, 0.29, `Expected DEFAULT_INTENSITY_HT to be 0.29, but found ${val}`);
    },
  },
  {
    name: "HOM-06.5: Clearing sessionStorage preserves 0.29 Halftone default on reload",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });

      await page.reload();

      const sliderVal = await page.evaluate(() => {
        const slider = document.getElementById("slider-intensity");
        return slider ? parseFloat(slider.value) : null;
      });

      assertEqual(
        sliderVal,
        SPEC_TIMINGS.defaultHalftoneIntensity,
        `Expected fresh load to default to 0.29, got ${sliderVal}`
      );
    },
  },
];
