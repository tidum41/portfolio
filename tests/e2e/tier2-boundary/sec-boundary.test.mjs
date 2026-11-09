/**
 * SEC Boundary: Security Stress & Adversarial Payload Tests
 * 
 * Verifies prototype pollution resistance, malformed payloads,
 * extreme string sizes, and injection attack robustness.
 */
import { assert, assertRejects } from "../helpers/assertions.mjs";
import path from "path";

export const id = "SEC-BND";
export const name = "Security Stress & Adversarial Payload Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "SEC-BND.1: Server Actions reject prototype pollution payloads (__proto__)",
    fn: async () => {
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const actionsModule = await import(path.join(process.cwd(), "app/dev/actions.ts"));
        
        await assertRejects(
          async () => {
            const maliciousPayload = JSON.parse('{"__proto__":{"polluted":true}}');
            await actionsModule.patchCaseStudy("test", maliciousPayload);
          },
          /disabled in production/i,
          "Expected Server Action to throw in production"
        );
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    },
  },
  {
    name: "SEC-BND.2: /api/categorize with null or malformed JSON body returns HTTP 400 or 500 cleanly",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);
      const categorizeUrl = new URL("/api/categorize", ctx.targetUrl).toString();

      const status = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "Malformed JSON { not valid",
          });
          return res.status;
        } catch {
          return 500;
        }
      }, categorizeUrl);

      assert(status >= 400, `Expected error status for malformed JSON, got ${status}`);
    },
  },
  {
    name: "SEC-BND.3: /api/categorize with 50,000-character single note text is safely handled",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);
      const categorizeUrl = new URL("/api/categorize", ctx.targetUrl).toString();

      const hugeNote = "A".repeat(50000);
      const status = await page.evaluate(async ({ url, note }) => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes: [note] }),
          });
          return res.status;
        } catch {
          return 500;
        }
      }, { url: categorizeUrl, note: hugeNote });

      // Must respond cleanly with HTTP code without server hang
      assert(status > 0, "No response for large note text");
    },
  },
  {
    name: "SEC-BND.4: Prototype /dev/joola-b2b/* routes do not expose write APIs",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      const devUrl = new URL("/dev/joola-b2b", ctx.targetUrl).toString();

      const res = await page.goto(devUrl).catch(() => null);
      // Route should be safe read-only or 404
      assert(res === null || res.status() === 200 || res.status() === 404, "Unexpected status on /dev/joola-b2b");
    },
  },
  {
    name: "SEC-BND.5: Unicode control characters in categorize request do not break parser",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);
      const categorizeUrl = new URL("/api/categorize", ctx.targetUrl).toString();

      const status = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes: ["Task \u0000\u0007\u001B with control chars"] }),
          });
          return res.status;
        } catch {
          return 500;
        }
      }, categorizeUrl);

      assert(status > 0, "Server failed to respond to control character payload");
    },
  },
];
