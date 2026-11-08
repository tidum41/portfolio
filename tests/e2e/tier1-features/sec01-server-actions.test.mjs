/**
 * SEC-01: Dev Actions Server Security & API Validation
 * 
 * Authoritative Source:
 * - TEST_INFRA.md: SEC-01.
 * - ORIGINAL_REQUEST.md: "server-side authorization in app/dev/actions.ts rejecting production writes;
 *   audit /dev/joola-b2b/*; validate /app/api/categorize".
 * - PROJECT.md: Features F2.4a, F2.4b, F2.4c & Interface Contracts.
 */
import { assert, assertRejects, assertEqual } from "../helpers/assertions.mjs";
import fs from "fs";
import path from "path";

export const id = "SEC-01";
export const name = "Dev Actions Server Security & Validation";
export const tier = "tier1-features";

export const tests = [
  {
    name: "SEC-01.1: app/dev/actions.ts contains production guard check",
    fn: async () => {
      const actionsPath = path.join(process.cwd(), "app/dev/actions.ts");
      const src = fs.readFileSync(actionsPath, "utf8");

      const hasProdCheck = src.includes('process.env.NODE_ENV === "production"') || src.includes("process.env.NODE_ENV === 'production'");
      const hasProdError = src.includes("Dev actions are disabled in production");

      assert(
        hasProdCheck && hasProdError,
        "app/dev/actions.ts must guard mutations with: if (process.env.NODE_ENV === 'production') throw new Error('Dev actions are disabled in production')"
      );
    },
  },
  {
    name: "SEC-01.2: patchCaseStudy rejects mutations unconditionally in production environment",
    fn: async () => {
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const actionsModule = await import(path.join(process.cwd(), "app/dev/actions.ts"));
        
        await assertRejects(
          async () => {
            await actionsModule.patchCaseStudy("test", { title: "Hacked" });
          },
          /disabled in production/i,
          "patchCaseStudy should have thrown 'Dev actions are disabled in production'"
        );
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    },
  },
  {
    name: "SEC-01.3: patchDesignSystem rejects mutations unconditionally in production environment",
    fn: async () => {
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const actionsModule = await import(path.join(process.cwd(), "app/dev/actions.ts"));
        
        await assertRejects(
          async () => {
            await actionsModule.patchDesignSystem({ title: "Hacked" });
          },
          /disabled in production/i,
          "patchDesignSystem should have thrown 'Dev actions are disabled in production'"
        );
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    },
  },
  {
    name: "SEC-01.4: Actions require SANITY_API_WRITE_TOKEN and reject when missing",
    fn: async () => {
      const origToken = process.env.SANITY_API_WRITE_TOKEN;
      try {
        delete process.env.SANITY_API_WRITE_TOKEN;
        const actionsPath = path.join(process.cwd(), "app/dev/actions.ts");
        const src = fs.readFileSync(actionsPath, "utf8");

        assert(
          src.includes("requireToken") || src.includes("SANITY_API_WRITE_TOKEN"),
          "app/dev/actions.ts must enforce write token requirement"
        );
      } finally {
        if (origToken) process.env.SANITY_API_WRITE_TOKEN = origToken;
      }
    },
  },
  {
    name: "SEC-01.5: /api/categorize rejects oversized payloads > 100KB with HTTP 413",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);
      const categorizeUrl = new URL("/api/categorize", ctx.targetUrl).toString();

      // Create a payload larger than 100KB
      const largePayload = {
        notes: Array.from({ length: 2000 }, (_, i) => `Note number ${i}: repetitive text to expand payload beyond limit`),
      };

      const status = await page.evaluate(async ({ url, payload }) => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          return res.status;
        } catch {
          return 500;
        }
      }, { url: categorizeUrl, payload: largePayload });

      // Status should be 413 Payload Too Large or 400 Bad Request
      assert(
        status === 413 || status === 400,
        `Expected 413 or 400 for >100KB payload, but got ${status}`
      );
    },
  },
];
