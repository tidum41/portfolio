#!/usr/bin/env node
/**
 * Eval the Dialogue routing demo against data/dialogue/routing-eval.json.
 * Always reports rule-router accuracy. Reports model accuracy only when a
 * gateway key is available. Never invents numbers.
 *
 * Usage: node scripts/eval-dialogue-routing.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EVAL_PATH = join(ROOT, "data/dialogue/routing-eval.json");
const OUT_DIR = join(ROOT, "shots/routing-demo");
const OUT_JSON = join(OUT_DIR, "eval-results.json");

const require = createRequire(import.meta.url);

function loadTs(specifier) {
  // Prefer compiled path via tsx if available; else dynamic import of .ts through next's loader is unavailable.
  // Run under `npx tsx` when present.
  return import(pathToFileURL(join(ROOT, specifier)).href);
}

async function main() {
  const evalFile = JSON.parse(readFileSync(EVAL_PATH, "utf8"));
  const cases = evalFile.cases;
  if (!Array.isArray(cases) || cases.length !== 20) {
    console.error(`Expected 20 eval cases, got ${cases?.length ?? 0}`);
    process.exit(1);
  }

  let routeByRules;
  let routeQuestion;
  let hasGatewayKey;
  try {
    // tsx registers .ts loaders when invoked as `npx tsx scripts/eval-dialogue-routing.mjs`
    const rules = await loadTs("lib/dialogue/routing/ruleRouter.ts");
    const model = await loadTs("lib/dialogue/routing/modelRouter.ts");
    routeByRules = rules.routeByRules;
    routeQuestion = model.routeQuestion;
    hasGatewayKey = model.hasGatewayKey;
  } catch (err) {
    console.error("Failed to load routers. Run with: npx tsx scripts/eval-dialogue-routing.mjs");
    console.error(String(err));
    process.exit(1);
  }

  const ruleRows = [];
  let ruleHits = 0;
  for (const c of cases) {
    const got = routeByRules(c.question);
    const ok =
      got.template === c.expected.template && got.props.topic === c.expected.topic;
    if (ok) ruleHits += 1;
    ruleRows.push({
      id: c.id,
      question: c.question,
      expected: c.expected,
      got: { template: got.template, topic: got.props.topic, reason: got.reason },
      ok,
    });
  }
  const ruleAccuracy = ruleHits / cases.length;

  let modelAccuracy = null;
  let modelRows = null;
  let modelSkippedReason = null;
  if (!hasGatewayKey()) {
    modelSkippedReason = "No AI_GATEWAY_API_KEY / VERCEL_OIDC_TOKEN / OPENAI_API_KEY in env";
  } else {
    modelRows = [];
    let modelHits = 0;
    for (const c of cases) {
      const got = await routeQuestion(c.question);
      const ok =
        got.template === c.expected.template && got.props.topic === c.expected.topic;
      if (ok) modelHits += 1;
      modelRows.push({
        id: c.id,
        question: c.question,
        expected: c.expected,
        got: {
          template: got.template,
          topic: got.props.topic,
          reason: got.reason,
          path: got.path,
        },
        ok,
      });
    }
    modelAccuracy = modelHits / cases.length;
  }

  const report = {
    evaluatedAt: new Date().toISOString(),
    caseCount: cases.length,
    thinDataMinParticipants: evalFile.thinDataMinParticipants,
    rules: {
      hits: ruleHits,
      total: cases.length,
      accuracy: Number(ruleAccuracy.toFixed(4)),
      accuracyPercent: `${(ruleAccuracy * 100).toFixed(1)}%`,
      rows: ruleRows,
    },
    model: modelAccuracy === null
      ? { skipped: true, reason: modelSkippedReason }
      : {
          skipped: false,
          hits: Math.round(modelAccuracy * cases.length),
          total: cases.length,
          accuracy: Number(modelAccuracy.toFixed(4)),
          accuracyPercent: `${(modelAccuracy * 100).toFixed(1)}%`,
          rows: modelRows,
        },
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

  console.log(`Rule router: ${report.rules.hits}/${report.rules.total} = ${report.rules.accuracyPercent}`);
  if (report.model.skipped) {
    console.log(`Model router: skipped (${report.model.reason})`);
  } else {
    console.log(`Model router: ${report.model.hits}/${report.model.total} = ${report.model.accuracyPercent}`);
  }
  const misses = ruleRows.filter((r) => !r.ok);
  if (misses.length) {
    console.log("Rule misses:");
    for (const m of misses) {
      console.log(
        `  ${m.id}: expected ${m.expected.template}/${m.expected.topic}, got ${m.got.template}/${m.got.topic}`,
      );
    }
  }
  console.log(`Wrote ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

void require;
