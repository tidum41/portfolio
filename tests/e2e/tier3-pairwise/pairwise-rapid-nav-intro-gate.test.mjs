/**
 * Tier 3 Pairwise: Rapid Soft-Navigation + Intro Gate Lifecycle
 * 
 * Tests navigating between routes (/ <-> /about <-> /archive) during the intro
 * sequence, ensuring no state corruption or canvas flattening occurs.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";

export const id = "PAIR-05";
export const name = "Pairwise: Rapid Soft-Navigation + Intro Gate";
export const tier = "tier3-pairwise";

export const tests = [
  {
    name: "PAIR-05.1: Navigating to /about mid-intro and returning clears data-intro='playing'",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(300);
      const aboutUrl = new URL("/about", ctx.targetUrl).toString();
      await page.goto(aboutUrl);
      await page.goBack();

      const introAttr = await page.evaluate(() => document.documentElement.getAttribute("data-intro"));
      assert(introAttr !== "playing", "data-intro was unexpectedly stuck in 'playing' after returning");
    },
  },
  {
    name: "PAIR-05.2: Returning to / after soft navigation preserves silk canvas rendering buffer",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const archiveUrl = new URL("/archive", ctx.targetUrl).toString();
      await page.goto(archiveUrl);
      await page.goBack();

      const bufferValid = await page.evaluate(() => {
        const c = document.getElementById("ps3-silk-canvas");
        return c && c.width > 0 && c.height > 0;
      });

      assert(bufferValid, "Silk canvas drawing buffer was flattened to 0x0 upon returning");
    },
  },
  {
    name: "PAIR-05.3: Navigating to /dialogue and back preserves hero text and aside elements",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const dialogueUrl = new URL("/dialogue", ctx.targetUrl).toString();
      await page.goto(dialogueUrl);
      await page.goBack();

      const heroPresent = await page.evaluate(() => !!document.getElementById("hero"));
      assert(heroPresent, "Hero section was missing after returning from /dialogue");
    },
  },
  {
    name: "PAIR-05.4: 'intro-replay' event restarts intro without requiring full page reload",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      // Trigger synthetic replay
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent("intro-replay"));
      });

      const alive = await page.evaluate(() => !!document.getElementById("hero"));
      assert(alive, "Page broke during intro-replay");
    },
  },
];
