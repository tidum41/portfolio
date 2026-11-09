/**
 * QUAL Boundary: Quality & Architecture Edge Cases
 * 
 * Verifies code hygiene, zero dead module imports, strict null handling,
 * and build artifact cleanliness.
 */
import { assert } from "../helpers/assertions.mjs";
import fs from "fs";
import path from "path";

export const id = "QUAL-BND";
export const name = "Quality & Architecture Boundary Tests";
export const tier = "tier2-boundary";

export const tests = [
  {
    name: "QUAL-BND.1: No references to deleted modules (CdPlayerPoster, cardHover.ts)",
    fn: async () => {
      // Check codebase for dead imports
      const compDir = path.join(process.cwd(), "components");
      const files = fs.readdirSync(compDir);
      for (const f of files) {
        if (!f.endsWith(".tsx") && !f.endsWith(".ts")) continue;
        const content = fs.readFileSync(path.join(compDir, f), "utf8");
        assert(!content.includes("CdPlayerPoster"), `File ${f} imports deleted CdPlayerPoster`);
        assert(!content.includes("cardHover"), `File ${f} imports deleted cardHover`);
      }
    },
  },
  {
    name: "QUAL-BND.2: No dangling playwright tarball in project repository root",
    fn: async () => {
      const rootFiles = fs.readdirSync(process.cwd());
      const tarballs = rootFiles.filter((f) => f.endsWith(".tgz") || f.endsWith(".tar.gz"));
      assert(tarballs.length === 0, `Dangling tarball files found in root: ${tarballs.join(", ")}`);
    },
  },
  {
    name: "QUAL-BND.3: ESLint config specifies explicit ignores for build output (.next)",
    fn: async () => {
      const eslintPath = path.join(process.cwd(), "eslint.config.mjs");
      const src = fs.readFileSync(eslintPath, "utf8");
      assert(
        src.includes(".next") || src.includes("ignores"),
        "eslint.config.mjs must declare ignores for build output"
      );
    },
  },
  {
    name: "QUAL-BND.4: No unhandled window error events during page lifecycle",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      const uncaughtErrors = [];
      page.on("pageerror", (err) => uncaughtErrors.push(err.message));

      await page.goto(ctx.targetUrl);
      await page.waitForTimeout(1000);

      assert(uncaughtErrors.length === 0, `Uncaught page errors: ${uncaughtErrors.join("; ")}`);
    },
  },
  {
    name: "QUAL-BND.5: Responsive viewport changes do not produce horizontal body overflow",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: { width: 390, height: 844 } });
      await page.goto(ctx.targetUrl);

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      assert(!hasOverflow, "Horizontal scrollbar detected on mobile viewport (scrollWidth > clientWidth)");
    },
  },
];
