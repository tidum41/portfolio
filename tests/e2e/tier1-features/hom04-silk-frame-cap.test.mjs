/**
 * HOM-04: Silk Frame Rate Cap (30fps Target) Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "Reset silk frame cap to 30fps (PS3Silk.tsx:10) unless 60fps measures
 *   equal or better on startup long tasks and smoothness."
 * - PROJECT.md: Feature F1.5 "Reset silk frame rate cap to 30fps (FRAME_MS = 1000/30)".
 */
import { assert, assertInRange, assertLessThanOrEqual } from "../helpers/assertions.mjs";
import fs from "fs";
import path from "path";

export const id = "HOM-04";
export const name = "Silk Frame Rate Cap (30fps) Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-04.1: PS3Silk.tsx declares FRAME_MS = 1000 / 30 for 30fps cap",
    fn: async () => {
      const silkPath = path.join(process.cwd(), "components/PS3Silk.tsx");
      const src = fs.readFileSync(silkPath, "utf8");

      // Check whether FRAME_MS is set to 1000 / 30
      const match = src.match(/const\s+FRAME_MS\s*=\s*1000\s*\/\s*(\d+)/);
      assert(match, "PS3Silk.tsx must define const FRAME_MS = 1000 / <fps>");
      const targetFps = parseInt(match[1], 10);
      assert(
        targetFps === 30,
        `Expected FRAME_MS to target 30fps (1000 / 30), but found ${targetFps}fps in PS3Silk.tsx:10`
      );
    },
  },
  {
    name: "HOM-04.2: Runtime frame rate over 1000ms active window is capped <= 35fps",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Measure frames rendered over 1 second
      await page.waitForTimeout(300); // let pre-roll settle
      const frameCountBefore = await page.evaluate(() => window.__ps3_metrics.frames);
      await page.waitForTimeout(1000);
      const frameCountAfter = await page.evaluate(() => window.__ps3_metrics.frames);

      const measuredFps = frameCountAfter - frameCountBefore;
      assertInRange(
        measuredFps,
        25,
        35,
        `Measured FPS was ${measuredFps}, expected silk to be capped at ~30fps (range [25, 35])`
      );
    },
  },
  {
    name: "HOM-04.3: Simulation does not spin unconstrained at 60fps on normal display",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(500);
      const silkFramesBefore = await page.evaluate(() => {
        return window.__ps3_metrics ? window.__ps3_metrics.frames : 0;
      });
      const frames = await page.evaluate(() => {
        return new Promise((resolve) => {
          let count = 0;
          const start = performance.now();
          const check = () => {
            count++;
            if (performance.now() - start < 1000) {
              requestAnimationFrame(check);
            } else {
              resolve(count);
            }
          };
          requestAnimationFrame(check);
        });
      });

      // Silk frames recorded internally should not exceed 35 even if rAF ticks 60 times
      const silkFramesAfter = await page.evaluate(() => {
        return window.__ps3_metrics ? window.__ps3_metrics.frames : 0;
      });
      const silkFrames = silkFramesAfter - silkFramesBefore;
      assert(silkFrames <= 35, `Silk drew ${silkFrames} frames in 1s, exceeding 30fps cap`);
    },
  },
  {
    name: "HOM-04.4: Frame rate remains stable without dropping below 24fps",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(400);
      const f1 = await page.evaluate(() => window.__ps3_metrics.frames);
      await page.waitForTimeout(800);
      const f2 = await page.evaluate(() => window.__ps3_metrics.frames);

      const fps = ((f2 - f1) / 0.8);
      assert(fps >= 23, `Frame rate dropped to ${fps.toFixed(1)}fps, below smoothness floor of 24fps`);
    },
  },
  {
    name: "HOM-04.5: PS3Silk.tsx defines FRAME_TOLERANCE_MS jitter tolerance",
    fn: async () => {
      const silkPath = path.join(process.cwd(), "components/PS3Silk.tsx");
      const src = fs.readFileSync(silkPath, "utf8");

      assert(
        src.includes("FRAME_TOLERANCE_MS"),
        "PS3Silk.tsx should define FRAME_TOLERANCE_MS to handle timer jitter cleanly"
      );
    },
  },
];
