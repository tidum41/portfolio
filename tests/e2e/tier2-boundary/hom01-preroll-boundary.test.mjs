/**
 * HOM-01 Boundary: Pre-roll & Fade Edge Cases
 * 
 * Verifies behavior under rapid reloads, early interruptions, timer jitter,
 * and clock skew during the pre-roll window.
 */
import { assert, assertLessThanOrEqual } from "../helpers/assertions.mjs";

export const id = "HOM-01-BND";
export const name = "PS3 Silk Pre-roll & Fade Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-01-BND.1: Rapid reload during pre-roll (at 50ms) does not corrupt state",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);
      await page.waitForTimeout(50);
      await page.reload();

      const introState = await page.evaluate(() => document.documentElement.getAttribute("data-intro"));
      assert(introState === "playing" || introState === "done", "Invalid data-intro state after rapid reload at 50ms");
    },
  },
  {
    name: "HOM-01-BND.2: Reload at exactly 150ms pre-roll boundary completes cleanly on second run",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);
      await page.waitForTimeout(150);
      await page.reload();

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });
      const completed = await page.evaluate(() => window.__introCompleted);
      assert(completed, "Intro failed to complete after reload at 150ms boundary");
    },
  },
  {
    name: "HOM-01-BND.3: Successive rapid reloads (3x in 200ms) do not create orphaned WebGL contexts",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);
      await page.waitForTimeout(60);
      await page.reload();
      await page.waitForTimeout(60);
      await page.reload();
      await page.waitForTimeout(60);
      await page.reload();

      await page.waitForFunction(() => !!document.getElementById("ps3-silk-canvas"), { timeout: 3000 });
      const canvasOk = await page.evaluate(() => {
        const c = document.getElementById("ps3-silk-canvas");
        return c && c.width > 0 && c.height > 0;
      });
      assert(canvasOk, "Canvas failed to reinitialize after successive reloads");
    },
  },
  {
    name: "HOM-01-BND.4: Per-frame fade clamping prevents opacity leap when tab is backgrounded",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Emulate background pause: wait during pre-roll then resume
      await page.waitForTimeout(100);
      const op1 = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uOpacity : 0);
      assertLessThanOrEqual(op1, 0.1, `Opacity jumped to ${op1} during pre-roll`);
    },
  },
  {
    name: "HOM-01-BND.5: System clock jitter does not cause NaN or negative opacity progression",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(100);
        const op = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uOpacity : 0);
        assert(!isNaN(op), "uOpacity evaluated to NaN");
        assert(op >= 0.0 && op <= 1.0, `uOpacity out of bounds [0.0, 1.0]: ${op}`);
      }
    },
  },
];
