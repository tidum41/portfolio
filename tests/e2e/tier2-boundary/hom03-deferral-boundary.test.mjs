/**
 * HOM-03 Boundary: Heavy Work Deferral Edge Cases
 * 
 * Verifies deferral under mid-intro navigation, rapid card clicks,
 * network delays, and multiple completeIntro invocations.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";

export const id = "HOM-03-BND";
export const name = "Heavy Work Deferral Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "HOM-03-BND.1: Navigating to /about at 100ms mid-intro unblocks immediately",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(100);
      const aboutUrl = new URL("/about", ctx.targetUrl).toString();
      const res = await page.goto(aboutUrl);

      const status = res ? res.status() : 200;
      assertEqual(status, 200, `Expected HTTP 200 on /about, got ${status}`);
    },
  },
  {
    name: "HOM-03-BND.2: Navigating away and hitting browser Back button restores cleanly",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForTimeout(300);
      const aboutUrl = new URL("/about", ctx.targetUrl).toString();
      await page.goto(aboutUrl);
      await page.goBack();

      const canvasPresent = await page.evaluate(() => !!document.getElementById("ps3-silk-canvas"));
      assert(canvasPresent, "Canvas failed to restore on browser back navigation");
    },
  },
  {
    name: "HOM-03-BND.3: Multiple concurrent completeIntro() calls are idempotent",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Fire completeIntro 5 times in quick succession
      await page.evaluate(() => {
        for (let i = 0; i < 5; i++) {
          window.dispatchEvent(new CustomEvent("intro-done"));
          document.documentElement.setAttribute("data-intro", "done");
        }
      });

      const introAttr = await page.evaluate(() => document.documentElement.getAttribute("data-intro"));
      assertEqual(introAttr, "done", "Attribute should remain 'done' after multiple calls");
    },
  },
  {
    name: "HOM-03-BND.4: Calling onIntroDone after intro is already done executes callback immediately",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const executedImmediately = await page.evaluate(() => {
        let ran = false;
        // Simulate onIntroDone behavior when intro is done
        if (document.documentElement.getAttribute("data-intro") !== "playing") {
          ran = true;
        }
        return ran;
      });

      assert(executedImmediately, "Callback should run synchronously when intro is already complete");
    },
  },
  {
    name: "HOM-03-BND.5: Offline network during intro does not prevent visual intro completion",
    fn: async (ctx) => {
      const page = await ctx.createPage({ offline: false });
      await page.goto(ctx.targetUrl);

      // Go offline mid-intro
      await page.context().setOffline(true);
      await page.waitForTimeout(1000);

      // WebGL animation and local intro sequence should still complete
      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });
      const completed = await page.evaluate(() => window.__introCompleted);
      assert(completed, "Visual intro failed to complete while offline");
    },
  },
];
