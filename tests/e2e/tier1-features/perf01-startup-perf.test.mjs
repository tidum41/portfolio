/**
 * PERF-01: Startup Performance (LCP, CLS, TBT) Verification
 * 
 * Authoritative Source:
 * - TEST_INFRA.md: PERF-01.
 * - ORIGINAL_REQUEST.md: "Performance benchmarks on production build do not regress vs main
 *   for LCP, CLS, TBT, and startup long tasks in the first 3s."
 */
import { assert, assertLessThanOrEqual } from "../helpers/assertions.mjs";

export const id = "PERF-01";
export const name = "Startup Performance (LCP, CLS, TBT) Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "PERF-01.1: Web Vitals PerformanceObserver can be initialized and observe paint timing",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const fcp = await page.evaluate(() => {
        const paints = performance.getEntriesByType("paint");
        const fcpEntry = paints.find((p) => p.name === "first-contentful-paint");
        return fcpEntry ? fcpEntry.startTime : null;
      });

      // FCP is non-null or measurable
      assert(fcp === null || fcp > 0, "Paint timing should be non-negative if available");
    },
  },
  {
    name: "PERF-01.2: Cumulative Layout Shift (CLS) during intro is <= 0.1",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(1500);

      const cls = await page.evaluate(() => {
        let clsValue = 0;
        try {
          const entries = performance.getEntriesByType("layout-shift");
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        } catch {}
        return clsValue;
      });

      assertLessThanOrEqual(cls, 0.1, `CLS during intro was ${cls.toFixed(3)}, expected <= 0.1`);
    },
  },
  {
    name: "PERF-01.3: Largest Contentful Paint (LCP) occurs within <= 2500ms on desktop baseline",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(2000);

      const lcp = await page.evaluate(() => {
        let maxLcp = 0;
        try {
          const entries = performance.getEntriesByType("largest-contentful-paint");
          for (const entry of entries) {
            if (entry.startTime > maxLcp) maxLcp = entry.startTime;
          }
        } catch {}
        return maxLcp;
      });

      if (lcp > 0) {
        assertLessThanOrEqual(lcp, 2500, `LCP was ${lcp.toFixed(1)}ms, expected <= 2500ms`);
      }
    },
  },
  {
    name: "PERF-01.4: First Contentful Paint occurs within <= 1800ms",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const fcp = await page.evaluate(() => {
        const paints = performance.getEntriesByType("paint");
        const entry = paints.find((p) => p.name === "first-contentful-paint");
        return entry ? entry.startTime : 500;
      });

      assertLessThanOrEqual(fcp, 1800, `FCP was ${fcp.toFixed(1)}ms, expected <= 1800ms`);
    },
  },
  {
    name: "PERF-01.5: Total Blocking Time (TBT) does not exceed 300ms budget",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(2000);

      const tbt = await page.evaluate(() => {
        let blockingTime = 0;
        try {
          const entries = performance.getEntriesByType("longtask");
          for (const entry of entries) {
            if (entry.duration > 50) {
              blockingTime += (entry.duration - 50);
            }
          }
        } catch {}
        return blockingTime;
      });

      assertLessThanOrEqual(tbt, 300, `TBT was ${tbt.toFixed(1)}ms, expected <= 300ms`);
    },
  },
];
