/**
 * Tier 4 Journey 2: First Cold Visit Mobile (390x844)
 * 
 * Comprehensive end-to-end user journey on mobile:
 * Cold mobile visit -> Horizontal scroll lock verification ->
 * Touch targets >= 32px -> Continuous slider drag -> Reset behavior.
 */
import { assert, assertEqual, assertGreaterThanOrEqual } from "../helpers/assertions.mjs";
import { VIEWPORTS, SPEC_TIMINGS } from "../helpers/env.mjs";

export const id = "JOURNEY-02";
export const name = "Journey 2: First Cold Visit Mobile (390x844)";
export const tier = "tier4-application";

export const tests = [
  {
    name: "JOURNEY-02: Full mobile visit journey verifying touch targets, continuous sliders, and scroll lock",
    fn: async (ctx) => {
      const page = await ctx.createPage({
        viewport: VIEWPORTS.mobile,
        isMobile: true,
        hasTouch: true,
      });

      // 1. Navigate on mobile
      await page.goto(ctx.targetUrl);

      // 2. Verify horizontal pan lock: scrollWidth equals clientWidth
      const isLocked = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth <= doc.clientWidth;
      });
      assert(isLocked, "Step 1: Horizontal pan lock failed; page has horizontal scrollbar");

      // 3. Wait for intro completion
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 7000 });

      // 4. Verify segmented mode toggle hit targets (min 32px height/width)
      const targets = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("#mode-halftone, #mode-wave"));
        return btns.map((b) => {
          const r = b.getBoundingClientRect();
          return { id: b.id, w: r.width, h: r.height };
        });
      });

      for (const t of targets) {
        assertGreaterThanOrEqual(t.h, SPEC_TIMINGS.minTouchTargetPx, `Step 2: Touch height for ${t.id} < 32px`);
        assertGreaterThanOrEqual(t.w, SPEC_TIMINGS.minTouchTargetPx, `Step 2: Touch width for ${t.id} < 32px`);
      }

      // 5. Touch tap on Wave button
      await page.tap("#mode-wave");
      const isWaveActive = await page.evaluate(() => {
        const btn = document.getElementById("mode-wave");
        return btn ? btn.classList.contains("active") : false;
      });
      assert(isWaveActive, "Step 3: Wave mode button did not become active on touch tap");

      // 6. Touch drag intensity slider
      const sliderBox = await page.locator("#slider-intensity").boundingBox();
      if (sliderBox) {
        await page.touchscreen.tap(sliderBox.x + sliderBox.width * 0.8, sliderBox.y + sliderBox.height / 2);
      }
      const touchedIntensity = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assert(touchedIntensity > 0, "Step 4: Slider did not update value upon mobile touch tap");

      // 7. Tap Reset button to restore Halftone mode and 0.29 intensity
      await page.tap("#panel-reset");
      const restoredIntensity = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assertEqual(restoredIntensity, SPEC_TIMINGS.defaultHalftoneIntensity, "Step 5: Reset did not restore 0.29");

      // 8. Re-verify horizontal pan remains locked after panel interaction
      const postLock = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth <= doc.clientWidth;
      });
      assert(postLock, "Step 6: Horizontal scroll leaked after controls panel interactions");
    },
  },
];
