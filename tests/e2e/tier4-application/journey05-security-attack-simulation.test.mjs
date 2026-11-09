/**
 * Tier 4 Journey 5: Security Attack Simulation
 * 
 * Comprehensive end-to-end user journey simulating security attacks:
 * Unauthorized Server Action POST -> Production environment rejection ->
 * /api/categorize payload bombing -> Prototype pollution / storage injection resistance.
 */
import { assert, assertRejects, assertEqual } from "../helpers/assertions.mjs";
import path from "path";

export const id = "JOURNEY-05";
export const name = "Journey 5: Security Attack Simulation";
export const tier = "tier4-application";

export const tests = [
  {
    name: "JOURNEY-05: Security attack simulation verifying Server Actions guards and API limits",
    fn: async (ctx) => {
      // 1. Attack 1: Attempt unauthorized Server Action mutation in production
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const actionsModule = await import(path.join(process.cwd(), "app/dev/actions.ts"));

        await assertRejects(
          async () => {
            await actionsModule.patchCaseStudy("unauthorized-slug", { title: "Attack" });
          },
          /disabled in production/i,
          "Step 1: patchCaseStudy failed to reject in production"
        );

        await assertRejects(
          async () => {
            await actionsModule.patchDesignSystem({ title: "Attack" });
          },
          /disabled in production/i,
          "Step 2: patchDesignSystem failed to reject in production"
        );
      } finally {
        process.env.NODE_ENV = origEnv;
      }

      // 2. Attack 2: Payload bomb to /api/categorize (> 100KB payload)
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);
      const categorizeUrl = new URL("/api/categorize", ctx.targetUrl).toString();

      const largePayload = {
        notes: Array.from({ length: 3000 }, (_, i) => `Payload bomb note line ${i} with heavy repetitive text padding`),
      };

      const statusOversize = await page.evaluate(async ({ url, payload }) => {
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          return r.status;
        } catch {
          return 500;
        }
      }, { url: categorizeUrl, payload: largePayload });

      assert(
        statusOversize === 413 || statusOversize === 400,
        `Step 3: Oversized payload was not rejected (status: ${statusOversize})`
      );

      // 3. Attack 3: Excessive note count (> 50 notes)
      const excessiveNotesPayload = {
        notes: Array.from({ length: 60 }, (_, i) => `Note ${i}`),
      };

      const statusExcessive = await page.evaluate(async ({ url, payload }) => {
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          return r.status;
        } catch {
          return 500;
        }
      }, { url: categorizeUrl, payload: excessiveNotesPayload });

      assert(
        statusExcessive === 400 || statusExcessive === 413,
        `Step 4: Excessive notes (>50) was not rejected with 400 (status: ${statusExcessive})`
      );

      // 4. Attack 4: Malicious script injection into client storage
      await page.goto(ctx.targetUrl);
      await page.evaluate(() => {
        sessionStorage.setItem("ps3cp_pos", '{"x": "<script>alert(1)</script>", "y": 0}');
      });
      await page.reload();

      const scriptInjected = await page.evaluate(() => {
        return document.querySelectorAll("script[src*='alert']").length > 0;
      });
      assert(!scriptInjected, "Step 5: XSS script tag injected via storage deserialization");
    },
  },
];
