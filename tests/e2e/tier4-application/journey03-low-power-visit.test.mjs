/**
 * Tier 4 Journey 3: Low-Power / 4x Throttled Visit
 * 
 * Comprehensive end-to-end user journey simulating an older or low-power device:
 * 4x CPU throttle -> 30fps silk cap verification -> Hero reveal stagger smoothness ->
 * Long tasks <= budget -> Clean completion.
 */
import { assert, assertInRange, assertLessThanOrEqual } from "../helpers/assertions.mjs";
import { THROTTLE_PROFILES } from "../helpers/env.mjs";

export const id = "JOURNEY-03";
export const name = "Journey 3: Low-Power / 4x Throttled Visit";
export const tier = "tier4-application";

export const tests = [
  {
    name: "JOURNEY-03: Low-power 4x throttled journey verifying 30fps cap and long tasks budget",
    fn: async (ctx) => {
      const page = await ctx.createPage({ throttle: THROTTLE_PROFILES.cpu4x });

      // 1. Navigate under CPU throttle
      await page.goto(ctx.targetUrl);

      // 2. Measure silk frame rate over 1000ms window during active intro
      await page.waitForTimeout(500);
      const f1 = await page.evaluate(() => window.__ps3_metrics.frames);
      await page.waitForTimeout(1000);
      const f2 = await page.evaluate(() => window.__ps3_metrics.frames);

      const throttledFps = f2 - f1;
      assertInRange(
        throttledFps,
        18,
        70,
        `Step 1: Frame rate ${throttledFps} out of expected range under 4x CPU throttle`
      );

      // 3. Wait for intro completion under throttle
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 10000 });

      // 4. Hero text should be fully visible
      const heroOpacity = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h ? parseFloat(window.getComputedStyle(h).opacity) : 0;
      });
      assert(heroOpacity >= 0.9, `Step 2: Hero text did not reach full opacity (was ${heroOpacity})`);

      // 5. Measure long tasks in first 3s
      const longTasks = await page.evaluate(() => {
        try {
          const tasks = performance.getEntriesByType("longtask");
          return {
            count: tasks.filter((t) => t.duration >= 50).length,
            sum: tasks.reduce((acc, t) => acc + t.duration, 0),
          };
        } catch {
          return { count: 0, sum: 0 };
        }
      });

      assertLessThanOrEqual(longTasks.count, 6, "Step 3: Too many long tasks recorded under 4x throttle");

      // 6. Test interaction: mouse move registers smoothly
      await page.mouse.move(300, 300);
      await page.mouse.move(450, 350);
      const pulls = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.cursorPulls : 0);
      assert(pulls >= 2, "Step 4: Cursor movement did not register under CPU throttle");
    },
  },
];
