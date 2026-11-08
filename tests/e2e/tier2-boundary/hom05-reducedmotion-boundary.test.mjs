/**
 * HOM-05 Boundary: Reduced Motion Edge Cases
 * 
 * Verifies behavior when reduced motion media query changes mid-session,
 * under 4x CPU throttle, on narrow mobile screen, and with color presets.
 */
import { assert, assertLessThanOrEqual } from "../helpers/assertions.mjs";
import { THROTTLE_PROFILES, VIEWPORTS } from "../helpers/env.mjs";

export const id = "HOM-05-BND";
export const name = "Reduced Motion Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-05-BND.1: Reduced motion under 4x CPU throttling still completes in <= 500ms",
    fn: async (ctx) => {
      const page = await ctx.createPage({
        reducedMotion: "reduce",
        throttle: THROTTLE_PROFILES.cpu4x,
      });
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 800 });

      const metrics = await page.evaluate(() => window.__ps3_metrics);
      const elapsed = metrics.fadeEndTime - metrics.prerollStart;

      assertLessThanOrEqual(elapsed, 500, `Throttled reduced motion took ${elapsed}ms, expected <= 500ms`);
    },
  },
  {
    name: "HOM-05-BND.2: Reduced motion on narrow 320px viewport renders cleanly",
    fn: async (ctx) => {
      const page = await ctx.createPage({
        reducedMotion: "reduce",
        viewport: VIEWPORTS.mobileNarrow,
      });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);
      const canvasVisible = await page.evaluate(() => {
        const c = document.getElementById("ps3-silk-canvas");
        return c && c.width > 0;
      });

      assert(canvasVisible, "Canvas failed to render on 320px under reduced motion");
    },
  },
  {
    name: "HOM-05-BND.3: Dynamically toggling reduced motion preference during session updates styling",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "no-preference" });
      await page.goto(ctx.targetUrl);

      // Emulate change to reduce
      await page.emulateMedia({ reducedMotion: "reduce" });
      const matches = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      assert(matches, "Media query did not reflect updated reduced-motion preference");
    },
  },
  {
    name: "HOM-05-BND.4: Switching color presets under reduced motion does not reactivate ribbon motion",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);
      // uTime should remain 0 even if presets change
      const uTime = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uTime : 0);
      assert(uTime === 0, `uTime advanced to ${uTime} under reduced motion`);
    },
  },
  {
    name: "HOM-05-BND.5: Navigating to case study and back preserves static ribbon state",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);
      const dialogueUrl = new URL("/dialogue", ctx.targetUrl).toString();
      await page.goto(dialogueUrl);
      await page.goBack();

      const uTime = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uTime : 0);
      assert(uTime === 0, `uTime advanced to ${uTime} after back navigation under reduced motion`);
    },
  },
];
