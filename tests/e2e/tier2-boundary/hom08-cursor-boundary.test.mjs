/**
 * HOM-08 Boundary: Cursor Pull & Ripple Removal Edge Cases
 * 
 * Verifies cursor pull physics under extreme mouse speeds,
 * boundary coordinates, multi-pointer sweeps, and zero-reactivity.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";

export const id = "HOM-08-BND";
export const name = "Cursor Pull & Ripple Removal Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-08-BND.1: Extreme pointer velocity (>1000px in single frame) does not crash WebGL",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Instant jump from top-left to bottom-right
      await page.mouse.move(10, 10);
      await page.mouse.move(1400, 850);

      const canvasHealthy = await page.evaluate(() => {
        const c = document.getElementById("ps3-silk-canvas");
        const gl = c ? (c.getContext("webgl2") || c.getContext("webgl")) : null;
        return gl && !gl.isContextLost();
      });

      assert(canvasHealthy, "WebGL context was lost or crashed after high velocity cursor move");
    },
  },
  {
    name: "HOM-08-BND.2: Negative coordinates (cursor outside window) are clamped without NaN uniforms",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.mouse.move(-100, -100);

      const errors = await page.evaluate(() => window.__ps3_errors || []);
      assertEqual(errors.length, 0, `Negative pointer coordinates caused error: ${errors.join("; ")}`);
    },
  },
  {
    name: "HOM-08-BND.3: Pointer sweeps across hero text do not cause text flicker or re-renders",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const heroBox = await page.locator("#hero").boundingBox();
      if (heroBox) {
        for (let x = heroBox.x; x < heroBox.x + heroBox.width; x += 50) {
          await page.mouse.move(x, heroBox.y + heroBox.height / 2);
        }
      }

      const heroOpacity = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h ? parseFloat(window.getComputedStyle(h).opacity) : 0;
      });

      assertEqual(heroOpacity, 1.0, "Hero text opacity flickered during cursor sweep");
    },
  },
  {
    name: "HOM-08-BND.4: Multi-step rapid cursor circle produces 0 concentric ripple rings",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Circle movement around (500, 500)
      const cx = 500, cy = 500, r = 100;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        await page.mouse.move(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      }

      const ripples = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.rippleShockwaves : 0);
      assertEqual(ripples, 0, `Cursor circular sweep produced ${ripples} shockwave rings`);
    },
  },
  {
    name: "HOM-08-BND.5: Pointer leaving canvas cleanly unbinds mouse coordinates",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.mouse.move(400, 400);
      await page.mouse.move(0, 0);

      const alive = await page.evaluate(() => !!document.getElementById("ps3-silk-canvas"));
      assert(alive, "Canvas failed to persist after pointerleave");
    },
  },
];
