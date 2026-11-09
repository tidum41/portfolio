/**
 * HOM-04: Silk frame rate matches main (60fps).
 *
 * A 30fps cap made the cinematic intro read as laggy for its whole duration.
 * QA restored FRAME_MS = 1000 / 60 so the wave matches main without shortening
 * the intro.
 */
import { assert, assertInRange, assertLessThanOrEqual } from "../helpers/assertions.mjs";
import fs from "fs";
import path from "path";

export const id = "HOM-04";
export const name = "Silk Frame Rate (60fps) Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-04.1: PS3Silk.tsx declares FRAME_MS = 1000 / 60 to match main",
    fn: async () => {
      const silkPath = path.join(process.cwd(), "components/PS3Silk.tsx");
      const src = fs.readFileSync(silkPath, "utf8");

      const match = src.match(/const\s+FRAME_MS\s*=\s*1000\s*\/\s*(\d+)/);
      assert(match, "PS3Silk.tsx must define const FRAME_MS = 1000 / <fps>");
      const targetFps = parseInt(match[1], 10);
      assert(
        targetFps === 60,
        `Expected FRAME_MS to target 60fps (1000 / 60), but found ${targetFps}fps in PS3Silk.tsx`
      );
    },
  },
  {
    name: "HOM-04.2: Runtime frame rate over 1000ms active window stays near 60fps",
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
        45,
        70,
        `Measured FPS was ${measuredFps}, expected silk near 60fps (range [45, 70])`
      );
    },
  },
  {
    name: "HOM-04.3: Silk draws with the 60Hz display instead of a 30fps cap",
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

      const silkFramesAfter = await page.evaluate(() => {
        return window.__ps3_metrics ? window.__ps3_metrics.frames : 0;
      });
      const silkFrames = silkFramesAfter - silkFramesBefore;
      assert(
        silkFrames >= 45 && silkFrames <= 70,
        `Silk drew ${silkFrames} frames in 1s, expected about 60 (range [45, 70])`
      );
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
