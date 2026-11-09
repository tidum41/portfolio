/**
 * Tier 3 Pairwise: 4x CPU Throttling + Cinematic Intro Fade
 * 
 * Verifies that under heavy CPU load, the 30fps silk frame rate cap prevents
 * main-thread starvation and allows hero text animation to proceed smoothly.
 */
import { assert, assertInRange } from "../helpers/assertions.mjs";
import { THROTTLE_PROFILES } from "../helpers/env.mjs";

export const id = "PAIR-03";
export const name = "Pairwise: 4x CPU Throttle + Cinematic Intro Fade";
export const tier = "tier3-pairwise";

export const tests = [
  {
    name: "PAIR-03.1: Silk frame rate stays within [18, 70] fps under 4x CPU throttling",
    fn: async (ctx) => {
      const page = await ctx.createPage({ throttle: THROTTLE_PROFILES.cpu4x });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);
      const f1 = await page.evaluate(() => window.__ps3_metrics.frames);
      await page.waitForTimeout(1000);
      const f2 = await page.evaluate(() => window.__ps3_metrics.frames);

      const fps = f2 - f1;
      assertInRange(fps, 18, 70, `Under 4x CPU throttle, FPS was ${fps}`);
    },
  },
  {
    name: "PAIR-03.2: Hero text reveal does not freeze under 4x CPU throttling",
    fn: async (ctx) => {
      const page = await ctx.createPage({ throttle: THROTTLE_PROFILES.cpu4x });
      await page.goto(ctx.targetUrl);

      // Wait for completion (allow slightly more wall-clock time under throttle)
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 9000 });

      const finalOpacity = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h ? parseFloat(window.getComputedStyle(h).opacity) : 0;
      });

      assert(finalOpacity >= 0.95, `Hero opacity was ${finalOpacity} under CPU throttle, expected ~1.0`);
    },
  },
  {
    name: "PAIR-03.3: Pre-roll delay completes without dropped frames causing instant opacity jump",
    fn: async (ctx) => {
      const page = await ctx.createPage({ throttle: THROTTLE_PROFILES.cpu4x });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(300);
      const initialOpacity = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uOpacity : 0);
      assert(initialOpacity <= 0.25, `Opacity jumped to ${initialOpacity} during pre-roll under 4x throttle`);
    },
  },
  {
    name: "PAIR-03.4: Mouse cursor pull responds smoothly under 4x CPU throttling",
    fn: async (ctx) => {
      const page = await ctx.createPage({ throttle: THROTTLE_PROFILES.cpu4x });
      await page.goto(ctx.targetUrl);

      await page.mouse.move(300, 300);
      await page.mouse.move(500, 400);

      const pulls = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.cursorPulls : 0);
      assert(pulls >= 2, "Cursor pulls did not register under CPU throttling");
    },
  },
];
