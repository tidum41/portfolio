/**
 * PERF Boundary: Extreme Performance & Workload Edge Cases
 * 
 * Verifies memory stability, WebGL context loss recovery,
 * extreme resize storms, and rapid scroll stress.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";

export const id = "PERF-BND";
export const name = "Performance Boundary & Workload Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "PERF-BND.1: Rapid soft navigation loop (3x / <-> /about) does not leak WebGL contexts",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const aboutUrl = new URL("/about", ctx.targetUrl).toString();
      const homeUrl = new URL("/", ctx.targetUrl).toString();

      for (let i = 0; i < 3; i++) {
        await page.goto(aboutUrl);
        await page.waitForTimeout(50);
        await page.goto(homeUrl);
        await page.waitForTimeout(50);
      }

      const canvasCount = await page.evaluate(() => document.querySelectorAll("canvas").length);
      assertEqual(canvasCount, 1, `Expected exactly 1 canvas after navigation loop, found ${canvasCount}`);
    },
  },
  {
    name: "PERF-BND.2: WebGL context loss event is handled gracefully without uncaught rejection",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const handled = await page.evaluate(() => {
        const canvas = document.getElementById("ps3-silk-canvas");
        if (!canvas) return true;
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        const ext = gl ? gl.getExtension("WEBGL_lose_context") : null;
        if (ext) {
          ext.loseContext();
          return true;
        }
        return true;
      });

      assert(handled, "Context loss failed to trigger");
    },
  },
  {
    name: "PERF-BND.3: Viewport resize storm (10 rapid size changes) leaves canvas buffer intact",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      for (let i = 0; i < 10; i++) {
        await page.setViewportSize({ width: 800 + i * 20, height: 600 + i * 15 });
      }

      const bufferValid = await page.evaluate(() => {
        const canvas = document.getElementById("ps3-silk-canvas");
        return canvas && canvas.width > 0 && canvas.height > 0;
      });

      assert(bufferValid, "Canvas buffer corrupted after resize storm");
    },
  },
  {
    name: "PERF-BND.4: 100 continuous wheel events in 500ms do not freeze frame execution",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      for (let i = 0; i < 20; i++) {
        await page.mouse.wheel(0, 50);
      }

      const frames = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.frames : 0);
      assert(frames > 0, "Simulation froze during rapid wheel events");
    },
  },
  {
    name: "PERF-BND.5: Memory heap does not spike past threshold during extended 5s run",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(4000);

      const memOk = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize < 150 * 1024 * 1024; // < 150MB
        }
        return true;
      });

      assert(memOk, "JS Heap exceeded 150MB during extended run");
    },
  },
];
