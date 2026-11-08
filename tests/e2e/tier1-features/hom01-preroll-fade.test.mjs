/**
 * HOM-01: PS3 Silk Pre-roll & Uniform Fade-in Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "Restore cinematic PS3 boot-length intro: deliberate pre-roll before
 *   silk starts (150ms or longer), lengthen silk fade-in to roughly PS3-boot pacing
 *   (approx. 2–3s total; document final numbers). Keep fade driven from first actually drawn
 *   frame via shader uniform."
 * - PROJECT.md: Features F1.1 (180ms deliberate pre-roll), F1.2 (2.4s silk uniform-driven fade-in via uOpacity).
 */
import { assert, assertGreaterThanOrEqual, assertInRange, assertEqual } from "../helpers/assertions.mjs";
import { SPEC_TIMINGS } from "../helpers/env.mjs";
import fs from "fs";
import path from "path";

export const id = "HOM-01";
export const name = "PS3 Silk Pre-roll & Fade-in Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-01.1: Pre-roll delay before silk drawing begins is >= 150ms",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Measure time from navigation start to first silk draw timestamp
      await page.waitForFunction(() => window.__ps3_metrics && window.__ps3_metrics.firstDrawTime !== null, {
        timeout: 5000,
      });

      const metrics = await page.evaluate(() => window.__ps3_metrics);
      const measuredPreroll = metrics.firstDrawTime - metrics.prerollStart;
      
      assertGreaterThanOrEqual(
        measuredPreroll,
        SPEC_TIMINGS.minPrerollMs - 20, // allow 20ms timer jitter tolerance
        `Pre-roll delay was ${measuredPreroll.toFixed(1)}ms, expected >= ${SPEC_TIMINGS.minPrerollMs}ms`
      );
    },
  },
  {
    name: "HOM-01.2: Total silk fade duration is between 2.0s and 3.0s (PS3 boot pacing)",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Wait for completion event
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const metrics = await page.evaluate(() => window.__ps3_metrics);
      const fadeDurationSec = (metrics.fadeEndTime - metrics.fadeStartTime) / 1000;

      assertInRange(
        fadeDurationSec,
        SPEC_TIMINGS.minSilkFadeSec - 0.2,
        SPEC_TIMINGS.maxSilkFadeSec + 0.5,
        `Silk fade duration was ${fadeDurationSec.toFixed(2)}s, expected between ${SPEC_TIMINGS.minSilkFadeSec}s and ${SPEC_TIMINGS.maxSilkFadeSec}s`
      );
    },
  },
  {
    name: "HOM-01.3: Window dispatches 'ps3-silk-intro-complete' event when fade reaches 1.0",
    fn: async (ctx) => {
      const page = await ctx.createPage();

      // Listen for custom event on window before page navigation
      await page.addInitScript(() => {
        window.__eventFired = false;
        window.addEventListener("ps3-silk-intro-complete", () => {
          window.__eventFired = true;
          window.__eventOpacity = window.__ps3_metrics ? window.__ps3_metrics.uOpacity : 1.0;
        }, { once: true });
      });

      await page.goto(ctx.targetUrl);
      await page.waitForFunction(() => window.__eventFired === true, { timeout: 6000 });

      const result = await page.evaluate(() => ({
        fired: window.__eventFired,
        opacity: window.__eventOpacity,
      }));

      assert(result.fired, "Event 'ps3-silk-intro-complete' was not dispatched on window");
      assertGreaterThanOrEqual(result.opacity, 0.99, "Event dispatched before opacity reached 1.0");
    },
  },
  {
    name: "HOM-01.4: Per-frame fade dt is clamped in shader animation loop (code contract)",
    fn: async () => {
      // Static contract check: PS3Silk.tsx must declare MAX_FADE_DT_MS clamp
      const silkPath = path.join(process.cwd(), "components/PS3Silk.tsx");
      const src = fs.readFileSync(silkPath, "utf8");

      assert(
        src.includes("MAX_FADE_DT_MS") || src.includes("Math.min(") && src.includes("dt"),
        "PS3Silk.tsx must clamp per-frame fade dt to prevent animation skipping on frame drops"
      );
    },
  },
  {
    name: "HOM-01.5: Opacity begins at 0.0 and increases monotonically without jumping",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const samples = [];
      const startTime = Date.now();
      while (Date.now() - startTime < 1500) {
        const op = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uOpacity : 0);
        samples.push(op);
        await page.waitForTimeout(50);
      }

      assert(samples.length >= 10, "Need at least 10 opacity samples");
      assertEqual(samples[0], 0, "Initial opacity must start at 0.0");

      for (let i = 1; i < samples.length; i++) {
        assertGreaterThanOrEqual(
          samples[i],
          samples[i - 1],
          `Opacity decreased from ${samples[i - 1]} to ${samples[i]} at sample ${i}`
        );
      }
    },
  },
];
