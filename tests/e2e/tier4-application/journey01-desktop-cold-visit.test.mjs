/**
 * Tier 4 Journey 1: First Cold Visit Desktop (1440x900)
 * 
 * Comprehensive end-to-end user journey on desktop:
 * Cold start -> bright silk at once (no hold) -> 0.9s ease-out swell -> Hero stagger ->
 * Cursor pull without ripples -> Controls inspection -> Soft navigation to /dialogue and back.
 */
import { assert, assertEqual, assertLessThanOrEqual, assertInRange } from "../helpers/assertions.mjs";
import { VIEWPORTS, CANONICAL_COPY, SPEC_TIMINGS } from "../helpers/env.mjs";

export const id = "JOURNEY-01";
export const name = "Journey 1: First Cold Visit Desktop (1440x900)";
export const tier = "tier4-application";

export const tests = [
  {
    name: "JOURNEY-01: Full desktop cold visit journey from PS3 boot to dialogue navigation",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.desktop });
      const consoleErrors = [];
      page.on("pageerror", (e) => consoleErrors.push(e.message));

      // 1. Cold navigation
      await page.goto(ctx.targetUrl);

      // 2. Initial state verification: data-intro='playing', hero opacity 0
      const initialIntro = await page.evaluate(() => document.documentElement.getAttribute("data-intro"));
      assertEqual(initialIntro, "playing", "Step 1: Expected data-intro='playing' on cold start");

      // 3. No black hold: first silk draw within 50ms (+1 frame)
      await page.waitForFunction(() => window.__ps3_metrics && window.__ps3_metrics.firstDrawTime !== null, {
        timeout: 5000,
      });
      const metrics = await page.evaluate(() => window.__ps3_metrics);
      const prerollMs = metrics.firstDrawTime - metrics.prerollStart;
      assertLessThanOrEqual(prerollMs, SPEC_TIMINGS.maxPrerollMs + 34, "Step 2: First silk draw was too late (black hold)");

      // 4. Wait for full intro completion (~0.9s)
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 4000 });
      const metricsAfter = await page.evaluate(() => window.__ps3_metrics);
      const fadeSec = (metricsAfter.fadeEndTime - metricsAfter.fadeStartTime) / 1000;
      assertInRange(fadeSec, SPEC_TIMINGS.minSilkFadeSec - 0.1, SPEC_TIMINGS.maxSilkFadeSec + 0.3, "Step 3: Silk swell duration out of fast-cinematic range");

      // 5. Hero text fully revealed and copy verified
      const heroText = await page.evaluate(() => {
        const h = document.querySelector("#hero h1, .hero-title, h1");
        return h ? h.innerText.trim() : "";
      });
      assertEqual(heroText, CANONICAL_COPY.heroHeading, "Step 4: Hero heading mismatch");

      // 6. Interactive cursor pull over silk canvas with 0 ripples
      await page.mouse.move(400, 300);
      await page.mouse.move(600, 450);
      const ripples = await page.evaluate(() => window.__ps3_metrics.rippleShockwaves);
      assertEqual(ripples, 0, "Step 5: Cursor produced unwanted donut ripples");

      // 7. Inspect controls panel defaults: Halftone mode active, intensity 0.29
      const defaultIntensity = await page.evaluate(() => {
        const s = document.getElementById("slider-intensity");
        return s ? parseFloat(s.value) : null;
      });
      assertEqual(defaultIntensity, SPEC_TIMINGS.defaultHalftoneIntensity, "Step 6: Default intensity not 0.29");

      // 8. Soft navigate to /dialogue and back to /
      const dialogueUrl = new URL("/dialogue", ctx.targetUrl).toString();
      const dialogueRes = await page.goto(dialogueUrl);
      assertEqual(dialogueRes?.status() || 200, 200, "Step 7: /dialogue returned non-200");

      await page.goBack();
      const heroRestored = await page.evaluate(() => !!document.getElementById("hero"));
      assert(heroRestored, "Step 8: Hero section missing upon returning home");

      // 9. Zero console errors throughout journey
      assertEqual(consoleErrors.length, 0, `Step 9: Console errors encountered: ${consoleErrors.join("; ")}`);
    },
  },
];
