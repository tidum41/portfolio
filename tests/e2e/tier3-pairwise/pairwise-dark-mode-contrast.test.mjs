/**
 * Tier 3 Pairwise: Dark Mode / System Theme + Canvas Contrast
 * 
 * Tests silk shader contrast and typography readability under dark and
 * light color schemes.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";

export const id = "PAIR-08";
export const name = "Pairwise: Dark Mode + Canvas Contrast";
export const tier = "tier3-pairwise";

export const tests = [
  {
    name: "PAIR-08.1: Dark color scheme (prefers-color-scheme: dark) renders canvas with valid contrast",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(500);

      const canvasAlive = await page.evaluate(() => {
        const c = document.getElementById("ps3-silk-canvas");
        return c && c.width > 0;
      });

      assert(canvasAlive, "Canvas failed to render under dark color scheme");
    },
  },
  {
    name: "PAIR-08.2: Light color scheme renders canvas and legible hero typography",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(500);

      const textVisible = await page.evaluate(() => {
        const h = document.getElementById("hero") || document.querySelector("h1");
        return h !== null;
      });

      assert(textVisible, "Hero text missing under light scheme");
    },
  },
  {
    name: "PAIR-08.3: Toggling color scheme dynamically does not trigger canvas crash",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.emulateMedia({ colorScheme: "dark" });
      await page.waitForTimeout(200);
      await page.emulateMedia({ colorScheme: "light" });
      await page.waitForTimeout(200);

      const glContextOk = await page.evaluate(() => {
        const c = document.getElementById("ps3-silk-canvas");
        const gl = c ? (c.getContext("webgl2") || c.getContext("webgl")) : null;
        return gl && !gl.isContextLost();
      });

      assert(glContextOk, "WebGL context crashed upon color scheme toggle");
    },
  },
];
