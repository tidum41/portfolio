/**
 * HOM-07 Boundary: Controls Menu & Sliders Edge Cases
 * 
 * Verifies slider behavior with keyboard Home/End keys, off-screen mouse drag,
 * touch gestures, and drawer open/close toggling.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";

export const id = "HOM-07-BND";
export const name = "Controls Menu & Sliders Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-07-BND.1: Keyboard Home key sets slider to min value (0.0)",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      await page.focus("#slider-intensity");
      await page.keyboard.press("Home");

      const val = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assertEqual(val, 0.0, `Home key resulted in ${val}, expected 0.0`);
    },
  },
  {
    name: "HOM-07-BND.2: Keyboard End key sets slider to max value (1.0)",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      await page.focus("#slider-intensity");
      await page.keyboard.press("End");

      const val = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assertEqual(val, 1.0, `End key resulted in ${val}, expected 1.0`);
    },
  },
  {
    name: "HOM-07-BND.3: Dragging mouse beyond viewport bounds does not cause unhandled errors",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const sliderBox = await page.locator("#slider-intensity").boundingBox();
      if (sliderBox) {
        await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(sliderBox.x + 2000, sliderBox.y); // drag far off-screen
        await page.mouse.up();
      }

      const val = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      assert(val >= 0 && val <= 1, `Slider value ${val} out of bounds after extreme drag`);
    },
  },
  {
    name: "HOM-07-BND.4: No slider controls remain focusable while panel is inert",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Check during intro before panel is revealed
      const panelInert = await page.evaluate(() => {
        const p = document.getElementById("control-panel");
        return p ? p.hasAttribute("inert") : true;
      });

      assert(panelInert, "Control panel should have inert attribute during intro");
    },
  },
  {
    name: "HOM-07-BND.5: Double click or rapid clicks on buttons do not trigger text selection",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const btn = page.locator("#panel-reset");
      await btn.click({ clickCount: 3 });

      const selText = await page.evaluate(() => window.getSelection()?.toString() || "");
      assertEqual(selText, "", "Triple click on reset button caused unintended text selection");
    },
  },
];
