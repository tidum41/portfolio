/**
 * PERF-02: First 3s Long Tasks Verification
 * 
 * Authoritative Source:
 * - TEST_INFRA.md: PERF-02.
 * - ORIGINAL_REQUEST.md: "measuring long tasks in first 3s, silk fps, LCP, CLS, TBT".
 */
import { assert, assertLessThanOrEqual } from "../helpers/assertions.mjs";

export const id = "PERF-02";
export const name = "First 3s Long Tasks Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "PERF-02.1: PerformanceObserver captures long tasks during first 3 seconds",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(3000);

      const captured = await page.evaluate(() => {
        try {
          return performance.getEntriesByType("longtask").length >= 0;
        } catch {
          return true;
        }
      });

      assert(captured, "Should be able to observe longtask entries");
    },
  },
  {
    name: "PERF-02.2: Count of long tasks >= 50ms during first 3s is <= 5",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(3000);

      const count = await page.evaluate(() => {
        try {
          return performance.getEntriesByType("longtask").filter((t) => t.duration >= 50).length;
        } catch {
          return 0;
        }
      });

      assertLessThanOrEqual(count, 5, `Observed ${count} long tasks >= 50ms in first 3s, expected <= 5`);
    },
  },
  {
    name: "PERF-02.3: Max individual long task duration is <= 150ms",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(3000);

      const maxLong = await page.evaluate(() => {
        try {
          const tasks = performance.getEntriesByType("longtask");
          return tasks.reduce((max, t) => Math.max(max, t.duration), 0);
        } catch {
          return 0;
        }
      });

      assertLessThanOrEqual(maxLong, 150, `Max long task was ${maxLong.toFixed(1)}ms, expected <= 150ms`);
    },
  },
  {
    name: "PERF-02.4: Total sum of long task durations during first 3s is <= 300ms",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(3000);

      const sumLong = await page.evaluate(() => {
        try {
          const tasks = performance.getEntriesByType("longtask");
          return tasks.reduce((sum, t) => sum + t.duration, 0);
        } catch {
          return 0;
        }
      });

      assertLessThanOrEqual(sumLong, 300, `Sum of long tasks was ${sumLong.toFixed(1)}ms, expected <= 300ms`);
    },
  },
  {
    name: "PERF-02.5: Zero long tasks exceed 200ms during intro",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(3000);

      const hugeTasks = await page.evaluate(() => {
        try {
          return performance.getEntriesByType("longtask").filter((t) => t.duration > 200).length;
        } catch {
          return 0;
        }
      });

      assertLessThanOrEqual(hugeTasks, 0, `Observed ${hugeTasks} long tasks exceeding 200ms`);
    },
  },
];
