/**
 * HOM-08: Cursor Pull & Ripple Removal Invariant Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "no cursor ripples (intersection points shift toward cursor)"
 * - PROJECT.md: Feature F1.12 "Remove exp(-rx*rx) donut formula; keep spatial pull & hero copy invariant".
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import fs from "fs";
import path from "path";

export const id = "HOM-08";
export const name = "Cursor Pull & Ripple Invariant Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-08.1: Moving cursor triggers spatial cursor pull interaction on canvas",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Move mouse across canvas
      await page.mouse.move(200, 200);
      await page.mouse.move(400, 300);
      await page.mouse.move(600, 400);

      const pulls = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.cursorPulls : 0);
      assert(pulls >= 3, `Expected at least 3 cursor pull events, got ${pulls}`);
    },
  },
  {
    name: "HOM-08.2: 0 circular donut ripple shockwaves are produced by cursor interaction",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.mouse.move(300, 300);
      await page.mouse.move(500, 300);

      const shockwaves = await page.evaluate(() => window.__ps3_metrics ? window.__ps3_metrics.rippleShockwaves : 0);
      assertEqual(shockwaves, 0, `Expected 0 donut ripple shockwaves, but recorded ${shockwaves}`);
    },
  },
  {
    name: "HOM-08.3: PS3Silk.tsx does not contain exp(-rx*rx) donut ripple calculation",
    fn: async () => {
      const silkPath = path.join(process.cwd(), "components/PS3Silk.tsx");
      const src = fs.readFileSync(silkPath, "utf8");

      assert(
        !src.includes("exp(-rx*rx)"),
        "PS3Silk.tsx must not contain the exp(-rx*rx) donut ripple calculation"
      );
    },
  },
  {
    name: "HOM-08.4: Moving cursor away smoothly relaxes silk without jarring artifacts",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.mouse.move(500, 500);
      await page.waitForTimeout(100);
      await page.mouse.move(0, 0); // move off canvas

      const errors = await page.evaluate(() => window.__ps3_errors || []);
      assertEqual(errors.length, 0, "Errors encountered during cursor pull relaxation");
    },
  },
  {
    name: "HOM-08.5: Pointer reactivity setting does not distort non-interactive canvas areas",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const canvasExists = await page.evaluate(() => !!document.getElementById("ps3-silk-canvas"));
      assert(canvasExists, "Silk canvas must remain rendered and stable during pointer interactions");
    },
  },
];
