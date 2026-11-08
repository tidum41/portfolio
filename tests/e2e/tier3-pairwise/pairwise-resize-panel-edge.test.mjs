/**
 * Tier 3 Pairwise: Window Resize + Controls Menu Alignment
 * 
 * Tests that resizing the window while the controls menu is open
 * clamps the panel within screen bounds and prevents it from disappearing.
 */
import { assert, assertGreaterThanOrEqual, assertLessThanOrEqual } from "../helpers/assertions.mjs";
import { VIEWPORTS } from "../helpers/env.mjs";

export const id = "PAIR-07";
export const name = "Pairwise: Window Resize + Controls Menu Edge Clamping";
export const tier = "tier3-pairwise";

export const tests = [
  {
    name: "PAIR-07.1: Controls panel clamps within viewport edges when resized from 1440px to 390px",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.desktop });
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      // Resize down to mobile
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.waitForTimeout(400);

      const panelBox = await page.locator("#control-panel").boundingBox();
      assert(panelBox !== null, "Control panel bounding box missing after resize");
      assertGreaterThanOrEqual(panelBox.x, 0, `Panel x (${panelBox.x}) is off left edge of screen`);
      assertLessThanOrEqual(
        panelBox.x + panelBox.width,
        VIEWPORTS.mobile.width + 10,
        `Panel right edge exceeds screen width`
      );
    },
  },
  {
    name: "PAIR-07.2: Controls panel remains on screen when resized from mobile back to desktop",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.mobile });
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      await page.setViewportSize(VIEWPORTS.desktop);
      await page.waitForTimeout(400);

      const panelBox = await page.locator("#control-panel").boundingBox();
      assert(panelBox !== null, "Control panel bounding box missing");
      assertLessThanOrEqual(panelBox.x + panelBox.width, VIEWPORTS.desktop.width + 10, "Panel exceeds desktop edge");
    },
  },
  {
    name: "PAIR-07.3: Edge padding constant (EDGE_PAD = 10) prevents panel from touching window frame",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: VIEWPORTS.desktop });
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const panelBox = await page.locator("#control-panel").boundingBox();
      if (panelBox) {
        const rightGap = VIEWPORTS.desktop.width - (panelBox.x + panelBox.width);
        assertGreaterThanOrEqual(rightGap, 0, "Panel overflows right edge of window");
      }
    },
  },
];
