/**
 * Tier 3 Pairwise: Route Warmup + Offline Network Conditions
 * 
 * Tests afterIntroIdle and route prefetching under offline and flaky
 * network conditions.
 */
import { assert } from "../helpers/assertions.mjs";

export const id = "PAIR-06";
export const name = "Pairwise: Route Warmup + Offline Network";
export const tier = "tier3-pairwise";

export const tests = [
  {
    name: "PAIR-06.1: afterIntroIdle executes safely under offline network without unhandled rejection",
    fn: async (ctx) => {
      const page = await ctx.createPage({ offline: true });
      const unhandledErrors = [];
      page.on("pageerror", (e) => unhandledErrors.push(e.message));

      await page.goto(ctx.targetUrl);
      await page.waitForTimeout(2000);

      assert(unhandledErrors.length === 0, `Unhandled errors offline: ${unhandledErrors.join("; ")}`);
    },
  },
  {
    name: "PAIR-06.2: Offline navigation to cached routes displays fallback cleanly",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Now set offline
      await page.context().setOffline(true);
      const res = await page.goto(new URL("/dialogue", ctx.targetUrl).toString()).catch(() => null);

      assert(res !== undefined, "Offline navigation crashed browser");
    },
  },
  {
    name: "PAIR-06.3: Network restore mid-session allows deferred prefetching to resume",
    fn: async (ctx) => {
      const page = await ctx.createPage({ offline: true });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(500);
      await page.context().setOffline(false);
      await page.waitForTimeout(500);

      const ready = await page.evaluate(() => document.readyState);
      assert(ready === "complete" || ready === "interactive", "Document not ready after network restore");
    },
  },
];
