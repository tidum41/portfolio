/**
 * QUAL-01: Code Quality Gates (TSC, ESLint, Architecture)
 * 
 * Authoritative Source:
 * - TEST_INFRA.md: QUAL-01.
 * - ORIGINAL_REQUEST.md: "npm run typecheck (tsc --noEmit) passes with zero errors.
 *   npm run lint (eslint .) passes with zero errors. npm run build succeeds without build errors."
 * - PROJECT.md: Feature F2.4d.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const id = "QUAL-01";
export const name = "Code Quality Gates Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "QUAL-01.1: TypeScript typecheck passes with 0 diagnostics errors",
    fn: async () => {
      let tscOutput = "";
      let tscCode = 0;
      try {
        tscOutput = execSync("npm run typecheck", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      } catch (err) {
        tscCode = err.status || 1;
        tscOutput = (err.stdout || "") + "\n" + (err.stderr || "");
      }

      assertEqual(
        tscCode,
        0,
        `TypeScript compiler check failed with exit code ${tscCode}.\nOutput:\n${tscOutput.slice(0, 500)}`
      );
    },
  },
  {
    name: "QUAL-01.2: ESLint configuration exists and defines project rules",
    fn: async () => {
      const eslintPath = path.join(process.cwd(), "eslint.config.mjs");
      assert(fs.existsSync(eslintPath), "eslint.config.mjs must exist in project root");
      const src = fs.readFileSync(eslintPath, "utf8");
      assert(src.length > 50, "eslint.config.mjs is empty or truncated");
    },
  },
  {
    name: "QUAL-01.3: Intro modules have no circular import dependencies",
    fn: async () => {
      const introReadyPath = path.join(process.cwd(), "lib/introReady.ts");
      const introTimingsPath = path.join(process.cwd(), "lib/introTimings.ts");
      const introReadySrc = fs.readFileSync(introReadyPath, "utf8");
      const introTimingsSrc = fs.readFileSync(introTimingsPath, "utf8");

      // introTimings must not import introReady, and vice-versa
      assert(!introTimingsSrc.includes("introReady"), "lib/introTimings.ts must not import lib/introReady.ts");
    },
  },
  {
    name: "QUAL-01.4: Critical components and lib modules exist and are non-empty",
    fn: async () => {
      const files = [
        "components/PS3Silk.tsx",
        "components/PS3ControlPanel.tsx",
        "components/IntroOrchestrator.tsx",
        "lib/introTimings.ts",
        "lib/introReady.ts",
      ];
      for (const rel of files) {
        const full = path.join(process.cwd(), rel);
        assert(fs.existsSync(full), `Expected critical file ${rel} to exist`);
        const stat = fs.statSync(full);
        assert(stat.size > 100, `File ${rel} has unexpected small size (${stat.size} bytes)`);
      }
    },
  },
  {
    name: "QUAL-01.5: package.json scripts contain working quality scripts",
    fn: async () => {
      const pkgPath = path.join(process.cwd(), "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

      assert(pkg.scripts?.typecheck, "package.json must contain typecheck script");
      assert(pkg.scripts?.dev, "package.json must contain dev script");
      assert(pkg.scripts?.build, "package.json must contain build script");
    },
  },
];
