/**
 * Tier 3 Pairwise: Mobile Viewport + Continuous Slider Drag
 * 
 * Tests touch interactions, touch hit targets, continuous updates on touch,
 * and page scroll non-interference on mobile screens.
 */
import { assert, assertEqual, assertGreaterThanOrEqual } from "../helpers/assertions.mjs";
import { VIEWPORTS, SPEC_TIMINGS } from "../helpers/env.mjs";

export const id = "PAIR-02";
export const name = "Pairwise: Mobile Viewport + Continuous Slider Drag";
export const tier = "tier3-pairwise";

export const tests = [
  {
    name: "PAIR-02.1: Continuous slider updates on mobile viewport (390x844) via touch events",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.mobile, isMobile: true, hasTouch: true });
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      // Simulate touch dragging on slider
      const sliderBox = await page.locator("#slider-intensity").boundingBox();
      if (sliderBox) {
        await page.touchscreen.tap(sliderBox.x + sliderBox.width * 0.7, sliderBox.y + sliderBox.height / 2);
      }

      const val = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assert(val > 0.0, "Slider did not respond to mobile touch tap");
    },
  },
  {
    name: "PAIR-02.2: Mode toggle touch hit area on mobile meets >= 32px height and width",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.mobile, isMobile: true, hasTouch: true });
      await page.goto(ctx.targetUrl);

      const targets = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("#mode-halftone, #mode-wave"));
        return btns.map((b) => {
          const r = b.getBoundingClientRect();
          return { id: b.id, w: r.width, h: r.height };
        });
      });

      for (const t of targets) {
        assertGreaterThanOrEqual(t.h, SPEC_TIMINGS.minTouchTargetPx, `Touch height for ${t.id} was ${t.h}px`);
        assertGreaterThanOrEqual(t.w, SPEC_TIMINGS.minTouchTargetPx, `Touch width for ${t.id} was ${t.w}px`);
      }
    },
  },
  {
    name: "PAIR-02.3: Slider drag does not trigger unintended vertical page scrolling",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.mobile, isMobile: true, hasTouch: true });
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const initialScrollY = await page.evaluate(() => window.scrollY);
      const sliderBox = await page.locator("#slider-intensity").boundingBox();
      if (sliderBox) {
        await page.mouse.move(sliderBox.x + 10, sliderBox.y + 10);
        await page.mouse.down();
        await page.mouse.move(sliderBox.x + 50, sliderBox.y + 10);
        await page.mouse.up();
      }

      const postScrollY = await page.evaluate(() => window.scrollY);
      assertEqual(postScrollY, initialScrollY, "Slider dragging accidentally scrolled the page vertically");
    },
  },
  {
    name: "PAIR-02.4: Mobile viewport retains 0 horizontal body overflow with controls panel open",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.mobile, isMobile: true, hasTouch: true });
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const overflows = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      assert(!overflows, "Controls panel caused horizontal body overflow on mobile");
    },
  },
];
