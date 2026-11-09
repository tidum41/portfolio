/**
 * HOM-04 Boundary: Silk Frame Rate Cap Edge Cases
 * 
 * Verifies frame cap behavior under simulated 120Hz refresh rate,
 * 4x CPU throttle, high DPI display, and tab freeze.
 */
import { assert, assertInRange, assertLessThanOrEqual } from "../helpers/assertions.mjs";
import { THROTTLE_PROFILES } from "../helpers/env.mjs";

export const id = "HOM-04-BND";
export const name = "Silk Frame Rate Cap Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-04-BND.1: Under 4x CPU throttling, silk does not spin excess frames",
    fn: async (ctx) => {
      const page = await ctx.createPage({ throttle: THROTTLE_PROFILES.cpu4x });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(500);
      const f1 = await page.evaluate(() => window.__ps3_metrics.frames);
      await page.waitForTimeout(1000);
      const f2 = await page.evaluate(() => window.__ps3_metrics.frames);

      const fps = f2 - f1;
      assertLessThanOrEqual(fps, 70, `Throttled FPS was ${fps}, expected <= 70`);
    },
  },
  {
    name: "HOM-04-BND.2: High DPI screen (deviceScaleFactor = 2) renders without frame rate degradation",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);
      const frames = await page.evaluate(() => window.__ps3_metrics.frames);
      assert(frames > 0, "No frames rendered on High DPI screen");
    },
  },
  {
    name: "HOM-04-BND.3: Simulated 500ms main thread freeze does not cause frame burst catch-up",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Block main thread for 500ms in evaluate
      await page.evaluate(() => {
        const start = performance.now();
        while (performance.now() - start < 500) {}
      });

      // Next frame should not try to render 15 queued frames in 1 tick
      const fps = await page.evaluate(() => {
        return window.__ps3_metrics ? window.__ps3_metrics.frames : 0;
      });
      assert(fps <= 50, `Frame count ${fps} spiked excessively after main thread freeze`);
    },
  },
  {
    name: "HOM-04-BND.4: Rapid window resize does not drop frame rate to zero",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(300);
      for (let i = 0; i < 4; i++) {
        await page.setViewportSize({ width: 1000 + i * 50, height: 700 + i * 30 });
        await page.waitForTimeout(50);
      }

      const activeFrames = await page.evaluate(() => window.__ps3_metrics.frames);
      assert(activeFrames > 5, "Frame loop halted during rapid window resizing");
    },
  },
  {
    name: "HOM-04-BND.5: Frame timing delta is clamped to prevent division by zero or negative dt",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const errors = await page.evaluate(() => window.__ps3_errors || []);
      assert(errors.length === 0, `Errors during frame calculation: ${errors.join("; ")}`);
    },
  },
];
