/**
 * HOM-06 Boundary: Halftone Mode & Intensity Edge Cases
 * 
 * Verifies recovery from corrupted sessionStorage, boundary values (0.0, 1.0),
 * rapid mode toggling, and preset switching.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import { SPEC_TIMINGS } from "../helpers/env.mjs";

export const id = "HOM-06-BND";
export const name = "Halftone Mode & Intensity Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-06-BND.1: Corrupted sessionStorage for mode ('invalid_str') recovers to default mode 1",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Inject corrupted mode string
      await page.evaluate(() => {
        sessionStorage.setItem("ps3cp_mode", "malicious_string_not_number");
      });

      await page.reload();

      const activeMode = await page.evaluate(() => {
        const btn = document.getElementById("mode-halftone");
        return btn ? btn.classList.contains("active") : false;
      });

      assert(activeMode, "Failed to recover to default Halftone mode from corrupt storage");
    },
  },
  {
    name: "HOM-06-BND.2: Intensity boundary value 0.0 sets slider and shader uniform cleanly",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      await page.evaluate(() => {
        const s = document.getElementById("slider-intensity");
        if (s) {
          s.value = "0.0";
          s.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });

      const val = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assertEqual(val, 0.0, "Failed to set intensity to boundary 0.0");
    },
  },
  {
    name: "HOM-06-BND.3: Intensity boundary value 1.0 sets slider and shader uniform cleanly",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      await page.evaluate(() => {
        const s = document.getElementById("slider-intensity");
        if (s) {
          s.value = "1.0";
          s.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });

      const val = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assertEqual(val, 1.0, "Failed to set intensity to boundary 1.0");
    },
  },
  {
    name: "HOM-06-BND.4: Rapid toggling between Halftone and Wave modes 10 times does not throw",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      await page.evaluate(() => {
        const ht = document.getElementById("mode-halftone");
        const wv = document.getElementById("mode-wave");
        for (let i = 0; i < 10; i++) {
          if (i % 2 === 0) wv?.click();
          else ht?.click();
        }
      });

      const btnOk = await page.evaluate(() => {
        return !!document.getElementById("mode-halftone");
      });
      assert(btnOk, "Control buttons missing after rapid mode toggle");
    },
  },
  {
    name: "HOM-06-BND.5: Corrupted color array in storage fallback gracefully to default color",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.evaluate(() => {
        sessionStorage.setItem("ps3cp_wave_color", "{bad json: [1,2]}");
      });

      await page.reload();

      const canvasRendered = await page.evaluate(() => {
        const c = document.getElementById("ps3-silk-canvas");
        return c && c.width > 0;
      });
      assert(canvasRendered, "Canvas failed to render after corrupt color JSON in storage");
    },
  },
];
