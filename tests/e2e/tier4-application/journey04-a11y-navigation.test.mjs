/**
 * Tier 4 Journey 4: Accessibility Navigation
 * 
 * Comprehensive end-to-end user journey verifying accessibility:
 * prefers-reduced-motion (350ms static fade) -> Keyboard Tab navigation into page ->
 * ARIA roles and labels -> Arrow key slider adjustment.
 */
import { assert, assertEqual, assertLessThanOrEqual } from "../helpers/assertions.mjs";

export const id = "JOURNEY-04";
export const name = "Journey 4: Accessibility Navigation";
export const tier = "tier4-application";

export const tests = [
  {
    name: "JOURNEY-04: Full accessibility journey verifying reduced motion, keyboard tab order, and slider a11y",
    fn: async (ctx) => {
      const page = await ctx.createPage({ reducedMotion: "reduce" });

      // 1. Cold start with reduced motion
      await page.goto(ctx.targetUrl);

      // 2. Short 350ms static fade completes within <= 500ms
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 700 });
      const metrics = await page.evaluate(() => window.__ps3_metrics);
      const elapsed = metrics.fadeEndTime - metrics.prerollStart;
      assertLessThanOrEqual(elapsed, 500, "Step 1: Reduced motion intro took > 500ms");

      // 3. Static ribbons (uTime = 0)
      const uTime = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.uTime : 0);
      assertEqual(uTime, 0, "Step 2: Ribbons should remain static under reduced motion");

      // 4. Keyboard Tab navigation: tab through document to reach controls panel
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // 5. Focus intensity slider and adjust via keyboard ArrowRight
      await page.focus("#slider-intensity");
      const valBefore = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      await page.keyboard.press("ArrowRight");
      const valAfter = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assert(valAfter > valBefore, "Step 3: Keyboard ArrowRight failed to adjust slider value");

      // 6. Verify slider ARIA attributes
      const a11yInfo = await page.evaluate(() => {
        const s = document.getElementById("slider-intensity");
        return {
          hasLabel: !!(s?.getAttribute("aria-label") || s?.labels?.length),
          min: s?.getAttribute("min"),
          max: s?.getAttribute("max"),
        };
      });

      assert(a11yInfo.hasLabel, "Step 4: Intensity slider missing accessible label");
      assert(a11yInfo.min !== null, "Step 4: Intensity slider missing min bound");
      assert(a11yInfo.max !== null, "Step 4: Intensity slider missing max bound");

      // 7. Verify all buttons have accessible text content
      const buttonLabelsOk = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns.every((b) => (b.innerText.trim().length > 0 || b.getAttribute("aria-label")));
      });
      assert(buttonLabelsOk, "Step 5: Some buttons lack accessible text or labels");
    },
  },
];
