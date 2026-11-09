#!/usr/bin/env node
/**
 * muditm.com E2E Test Suite Runner
 * 
 * Executes 4-tier opaque-box E2E test suites using Playwright Chromium:
 * - Tier 1: Core Feature Verification (HOM-01..09, PERF-01..04, SEC-01, QUAL-01)
 * - Tier 2: Boundary Value Analysis & Edge Cases
 * - Tier 3: Pairwise Combinatorial Cross-Feature Tests
 * - Tier 4: Real-World Application User Journeys
 * 
 * Usage:
 *   node scripts/run-e2e-suite.mjs [url] [options]
 * 
 * Options:
 *   --tier=<1|2|3|4|all>      Run tests from specific tier (default: all)
 *   --filter=<pattern>        Run tests matching regex pattern
 *   --json                    Output structured JSON report to stdout
 *   --out=<file>              Save structured JSON report to file
 *   --bail                    Stop on first test failure
 *   --headed                  Run Chromium in headed mode
 *   --help                    Show this help message
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createSuiteContext } from "../tests/e2e/helpers/harness.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

// CLI Argument Parsing
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
muditm.com E2E Test Suite Runner

Usage:
  node scripts/run-e2e-suite.mjs [url] [options]

Options:
  --tier=<1|2|3|4|all>      Run tests from specific tier (default: all)
  --filter=<pattern>        Run tests matching regex pattern (e.g. HOM-01)
  --json                    Output structured JSON report to stdout
  --out=<filepath>          Write structured JSON report to file
  --bail                    Exit immediately on first test failure
  --headed                  Launch browser in headed mode (default: headless)
  --help                    Show help message
`);
  process.exit(0);
}

const targetUrlArg = args.find((a) => !a.startsWith("--"));
const targetUrl = targetUrlArg || process.env.TEST_URL || "http://localhost:3000";

const tierArg = (args.find((a) => a.startsWith("--tier=")) || "").split("=")[1] || "all";
const filterArg = (args.find((a) => a.startsWith("--filter=")) || "").split("=")[1] || "";
const jsonOutput = args.includes("--json");
const outArg = (args.find((a) => a.startsWith("--out=")) || "").split("=")[1] || "";
const bail = args.includes("--bail");
const headless = !args.includes("--headed");

// Map tier shortcuts
const TIER_DIRS = {
  "1": "tier1-features",
  "tier1": "tier1-features",
  "tier1-features": "tier1-features",
  "2": "tier2-boundary",
  "tier2": "tier2-boundary",
  "tier2-boundary": "tier2-boundary",
  "3": "tier3-pairwise",
  "tier3": "tier3-pairwise",
  "tier3-pairwise": "tier3-pairwise",
  "4": "tier4-application",
  "tier4": "tier4-application",
  "tier4-application": "tier4-application",
};

const activeTiers = tierArg === "all"
  ? ["tier1-features", "tier2-boundary", "tier3-pairwise", "tier4-application"]
  : [TIER_DIRS[tierArg] || tierArg];

// ANSI Colors for console output
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

async function discoverTestModules() {
  const modules = [];
  const testsDir = path.join(REPO_ROOT, "tests/e2e");

  for (const tierDirName of activeTiers) {
    const fullTierPath = path.join(testsDir, tierDirName);
    if (!fs.existsSync(fullTierPath)) continue;

    const files = fs.readdirSync(fullTierPath).filter((f) => f.endsWith(".test.mjs") || f.endsWith(".test.js"));
    files.sort();

    for (const f of files) {
      const fullPath = path.join(fullTierPath, f);
      modules.push({
        tier: tierDirName,
        file: f,
        fullPath,
      });
    }
  }

  return modules;
}

async function main() {
  const startTime = Date.now();
  if (!jsonOutput) {
    console.log(`${c.bold}${c.cyan}================================================================${c.reset}`);
    console.log(`${c.bold}  muditm.com E2E Test Suite Runner${c.reset}`);
    console.log(`${c.dim}  Target URL: ${targetUrl} | Tiers: ${activeTiers.join(", ")}${c.reset}`);
    console.log(`${c.bold}${c.cyan}================================================================${c.reset}\n`);
  }

  // Create Playwright context
  const suiteContext = await createSuiteContext({
    targetUrl,
    headless,
  });

  const report = {
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0,
      timestamp: new Date().toISOString(),
      targetUrl,
      liveServerReachable: suiteContext.liveServerReachable,
    },
    tiers: {},
    failures: [],
  };

  for (const tierName of activeTiers) {
    report.tiers[tierName] = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: [],
    };
  }

  const testModules = await discoverTestModules();
  const filterRegex = filterArg ? new RegExp(filterArg, "i") : null;

  try {
    for (const mod of testModules) {
      let imported;
      try {
        imported = await import(mod.fullPath);
      } catch (err) {
        console.error(`${c.red}Failed to import test file ${mod.file}:${c.reset}`, err);
        continue;
      }

      const suiteId = imported.id || mod.file;
      const suiteName = imported.name || mod.file;
      const suiteTier = imported.tier || mod.tier;
      const tests = imported.tests || [];

      if (!jsonOutput) {
        console.log(`${c.bold}${c.cyan}[${suiteId}]${c.reset} ${suiteName} ${c.dim}(${mod.file})${c.reset}`);
      }

      for (const t of tests) {
        if (filterRegex && !filterRegex.test(t.name) && !filterRegex.test(suiteId)) {
          report.summary.skipped++;
          if (report.tiers[suiteTier]) report.tiers[suiteTier].skipped++;
          continue;
        }

        report.summary.total++;
        if (report.tiers[suiteTier]) report.tiers[suiteTier].total++;

        const testStartTime = Date.now();
        let pass = false;
        let testError = null;

        try {
          await t.fn(suiteContext);
          pass = true;
          report.summary.passed++;
          if (report.tiers[suiteTier]) report.tiers[suiteTier].passed++;
          if (!jsonOutput) {
            const ms = Date.now() - testStartTime;
            console.log(`  ${c.green}✓ PASS${c.reset} ${t.name} ${c.dim}(${ms}ms)${c.reset}`);
          }
        } catch (err) {
          pass = false;
          testError = err;
          report.summary.failed++;
          if (report.tiers[suiteTier]) report.tiers[suiteTier].failed++;

          const failureRecord = {
            suiteId,
            suiteName,
            tier: suiteTier,
            testName: t.name,
            file: mod.file,
            message: err.message || String(err),
            expected: err.expected !== undefined ? err.expected : null,
            actual: err.actual !== undefined ? err.actual : null,
            stack: err.stack || "",
          };
          report.failures.push(failureRecord);

          if (!jsonOutput) {
            const ms = Date.now() - testStartTime;
            console.log(`  ${c.red}✗ FAIL${c.reset} ${t.name} ${c.dim}(${ms}ms)${c.reset}`);
            console.log(`    ${c.red}${err.message}${c.reset}`);
          }

          if (bail) {
            if (!jsonOutput) console.log(`\n${c.yellow}Bailing out after failure (--bail)${c.reset}`);
            break;
          }
        } finally {
          if (suiteContext.closeCurrentPages) {
            await suiteContext.closeCurrentPages();
          }
        }

        if (report.tiers[suiteTier]) {
          report.tiers[suiteTier].tests.push({
            name: t.name,
            passed: pass,
            durationMs: Date.now() - testStartTime,
            error: testError ? testError.message : null,
          });
        }
      }

      if (!jsonOutput) console.log("");
      if (bail && report.summary.failed > 0) break;
    }
  } finally {
    await suiteContext.cleanup();
  }

  report.summary.durationMs = Date.now() - startTime;

  // Write JSON report if requested
  if (outArg) {
    const outPath = path.resolve(process.cwd(), outArg);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
    if (!jsonOutput) {
      console.log(`${c.dim}Report saved to: ${outPath}${c.reset}`);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    // Print Summary Table
    console.log(`${c.bold}${c.cyan}================================================================${c.reset}`);
    console.log(`${c.bold}  TEST SUITE EXECUTION SUMMARY${c.reset}`);
    console.log(`${c.bold}${c.cyan}================================================================${c.reset}`);
    console.log(`  Total Tests:    ${c.bold}${report.summary.total}${c.reset}`);
    console.log(`  Passed:         ${c.green}${c.bold}${report.summary.passed}${c.reset}`);
    console.log(`  Failed:         ${report.summary.failed > 0 ? c.red : c.green}${c.bold}${report.summary.failed}${c.reset}`);
    console.log(`  Skipped:        ${c.yellow}${report.summary.skipped}${c.reset}`);
    console.log(`  Duration:       ${(report.summary.durationMs / 1000).toFixed(2)}s`);
    console.log(`  Live Server:    ${report.summary.liveServerReachable ? c.green + "Connected" : c.yellow + "Offline / Virtual Harness"}${c.reset}`);
    console.log(`${c.cyan}----------------------------------------------------------------${c.reset}`);
    console.log(`  ${c.bold}Tier Breakdown:${c.reset}`);
    for (const [tier, data] of Object.entries(report.tiers)) {
      const statusColor = data.failed === 0 ? c.green : c.red;
      console.log(`    • ${tier.padEnd(20)}: ${statusColor}${data.passed}/${data.total} passed${c.reset} (${data.failed} failed)`);
    }

    if (report.failures.length > 0) {
      console.log(`\n${c.bold}${c.red}  Failures (${report.failures.length}):${c.reset}`);
      report.failures.forEach((f, idx) => {
        console.log(`    ${idx + 1}. [${f.tier}] ${f.suiteId} -> ${f.testName}`);
        console.log(`       ${c.red}${f.message}${c.reset}`);
      });
    }
    console.log(`${c.bold}${c.cyan}================================================================${c.reset}\n`);
  }

  // Exit code: 0 on 100% pass, 1 on any failure
  process.exit(report.summary.failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal runner error:", err);
  process.exit(2);
});
