/**
 * HOM-01: PS3 Silk Start & Uniform Swell Verification
 *
 * Authoritative Source (updated Nov 18, 2026, "Fast cinematic" intro; see design/RULES.md):
 * - Supersedes the Oct spec (180ms black pre-roll, 2.4s smoothstep fade).
 * - No black hold: the first drawn silk frame is already at the 0.4 uOpacity floor,
 *   then an ease-out cubic reaches 1.0 over ~0.9s. Fade is still driven from the first
 *   actually drawn frame via the shader uniform; silk stays at 30fps.
 * - lib/introTimings.ts + tests/e2e/helpers/env.mjs SPEC_TIMINGS hold the numbers.
 */
import { assert, assertGreaterThanOrEqual, assertLessThanOrEqual, assertInRange } from "../helpers/assertions.mjs";
import { SPEC_TIMINGS } from "../helpers/env.mjs";
import fs from "fs";
import path from "path";

export const id = "HOM-01";
export const name = "PS3 Silk Pre-roll & Fade-in Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-01.1: No black pre-roll hold: first silk draw happens within 50ms of start",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Measure time from navigation start to first silk draw timestamp
      await page.waitForFunction(() => window.__ps3_metrics && window.__ps3_metrics.firstDrawTime !== null, {
        timeout: 5000,
      });

      const metrics = await page.evaluate(() => window.__ps3_metrics);
      const measuredPreroll = metrics.firstDrawTime - metrics.prerollStart;
      
      // Allow one 30fps frame (~33ms) of scheduling jitter on top of the budget.
      assertLessThanOrEqual(
        measuredPreroll,
        SPEC_TIMINGS.maxPrerollMs + 34,
        `Time to first silk draw was ${measuredPreroll.toFixed(1)}ms, expected <= ${SPEC_TIMINGS.maxPrerollMs}ms (+1 frame)`
      );
    },
  },
  {
    name: "HOM-01.2: Total silk swell duration is ~0.9s (0.7s to 1.2s, fast cinematic pacing)",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Wait for completion event
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const metrics = await page.evaluate(() => window.__ps3_metrics);
      const fadeDurationSec = (metrics.fadeEndTime - metrics.fadeStartTime) / 1000;

      assertInRange(
        fadeDurationSec,
        SPEC_TIMINGS.minSilkFadeSec - 0.1,
        SPEC_TIMINGS.maxSilkFadeSec + 0.3,
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
    name: "HOM-01.6: PS3Silk has no black pre-roll hold and starts at INTRO_SILK_FLOOR (code contract)",
    fn: async () => {
      const src = fs.readFileSync(path.join(process.cwd(), "components/PS3Silk.tsx"), "utf8");
      const timings = fs.readFileSync(path.join(process.cwd(), "lib/introTimings.ts"), "utf8");
      assert(!src.includes("preRollMs") && !src.includes("fadeNotBefore"), "PS3Silk.tsx must not hold black before the fade (pre-roll removed)");
      assert(src.includes("INTRO_SILK_FLOOR"), "PS3Silk.tsx must start the intro at INTRO_SILK_FLOOR");
      assert(src.includes("KHR_parallel_shader_compile"), "PS3Silk.tsx must use KHR_parallel_shader_compile when available");
      assert(/INTRO_SILK_FLOOR\s*=\s*0\.4/.test(timings), "INTRO_SILK_FLOOR must be 0.4");
      assert(/patternDuration:\s*0\.9/.test(timings), "patternDuration must be 0.9s");
    },
  },
  {
    name: "HOM-01.5: Opacity starts at or below the 0.4 floor, is bright by ~300ms, and increases monotonically",
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
      // The first drawn frame sits at the floor (never black); a sample taken
      // before the first draw may still read 0.
      assertLessThanOrEqual(
        samples[0],
        SPEC_TIMINGS.silkFloor + 0.05,
        `Initial opacity must not exceed the ${SPEC_TIMINGS.silkFloor} floor, got ${samples[0]}`
      );
      // Samples are ~50ms apart: index 7 is roughly 350ms in. Ease-out cubic
      // should already be well above the floor (~0.8+).
      assertGreaterThanOrEqual(samples[7], 0.7, `Silk should be bright by ~350ms, was ${samples[7]}`);

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
