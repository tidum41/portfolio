/**
 * Empirical Verification Harness for Milestone 3 (Silk Startup & Scheduler Repair)
 * Run with: node tests/empirical_m3_harness.mjs
 */
import fs from "fs";
import path from "path";
import assert from "assert";

const repoRoot = process.cwd();

console.log("=== EMPIRICAL CHALLENGE SUITE: MILESTONE 3 ===");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------
// 1. WebGL Startup Timing Logic & Source Verification
// ---------------------------------------------------------
console.log("\n[Group 1] WebGL Startup Timing & Pre-roll");

runTest("1.1: PS3Silk.tsx keeps a 180ms first-load pre-roll and skips it for reduced-motion or soft nav", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");

  const match = silkSrc.match(/const\s+preRollMs\s*=\s*(isFirstLoad\s*&&\s*!reducedMotion\s*\?\s*180\s*:\s*0)/);
  assert(match, "Could not find preRollMs = isFirstLoad && !reducedMotion ? 180 : 0 in components/PS3Silk.tsx");
  assert(silkSrc.includes("ms < fadeNotBefore"), "Fade clock must stay held until the pre-roll ends");

  const calcDelay = (isFirstLoad, reducedMotion) => (isFirstLoad && !reducedMotion ? 180 : 0);
  assert.strictEqual(calcDelay(true, false), 180, "First load without reduced motion must delay 180ms");
  assert.strictEqual(calcDelay(true, true), 0, "First load with reduced motion must delay 0ms");
  assert.strictEqual(calcDelay(false, false), 0, "Subsequent navigation must delay 0ms");
  assert.strictEqual(calcDelay(false, true), 0, "Subsequent navigation with reduced motion must delay 0ms");
});

runTest("1.2: React 19 StrictMode idempotency guard preserves isFirstLoad state", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");
  assert(silkSrc.includes("const hadMountedBefore = _hasMounted;"), "Missing hadMountedBefore capture");
  assert(silkSrc.includes("_hasMounted = hadMountedBefore;"), "Missing _hasMounted restoration in cleanup");
});

// ---------------------------------------------------------
// 2. 60fps Frame Rate & Frame Pacing Simulation
// ---------------------------------------------------------
console.log("\n[Group 2] 60fps Frame Rate & Clamped dt Simulation");

runTest("2.1: PS3Silk.tsx declares FRAME_MS = 1000/60, FRAME_TOLERANCE_MS, and MAX_FADE_DT_MS", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");
  assert(silkSrc.includes("const FRAME_MS = 1000 / 60;"), "Missing FRAME_MS = 1000 / 60");
  assert(silkSrc.includes("const FRAME_TOLERANCE_MS = 2.5;"), "Missing FRAME_TOLERANCE_MS = 2.5");
  assert(silkSrc.includes("const MAX_FADE_DT_MS = 50;"), "Missing MAX_FADE_DT_MS = 50");
});

runTest("2.2: Simulation of 60Hz rAF displays 60fps", () => {
  const FRAME_MS = 1000 / 60; // 16.667ms
  const FRAME_TOLERANCE_MS = 2.5;

  let lastT = 0;
  let renderCount = 0;
  const frameTimes = [];

  // Simulate 60 rAF ticks at 16.666ms intervals (1 second total)
  for (let tick = 1; tick <= 60; tick++) {
    const ms = tick * (1000 / 60); // 16.666ms intervals
    if (lastT !== 0 && ms - lastT < FRAME_MS - FRAME_TOLERANCE_MS) {
      // Skipped frame
      continue;
    }
    lastT = ms;
    renderCount++;
    frameTimes.push(ms);
  }

  // 60Hz over 1s should produce exactly 60 rendered frames
  assert.strictEqual(renderCount, 60, `Expected exactly 60 rendered frames on 60Hz display, got ${renderCount}`);

  for (let i = 1; i < frameTimes.length; i++) {
    const delta = frameTimes[i] - frameTimes[i - 1];
    assert(Math.abs(delta - 16.667) < 1.0, `Render frame interval ${delta}ms was outside 60fps tolerance`);
  }
});

runTest("2.3: Simulation of 120Hz rAF skips the extra frame and stays at 60fps", () => {
  const FRAME_MS = 1000 / 60;
  const FRAME_TOLERANCE_MS = 2.5;

  let lastT = 0;
  let renderCount = 0;

  // 120 rAF ticks at 8.333ms intervals
  for (let tick = 1; tick <= 120; tick++) {
    const ms = tick * (1000 / 120);
    if (lastT !== 0 && ms - lastT < FRAME_MS - FRAME_TOLERANCE_MS) continue;
    lastT = ms;
    renderCount++;
  }

  // 120Hz over 1s should produce 60 rendered frames
  assert.strictEqual(renderCount, 60, `Expected 60 rendered frames on 120Hz display, got ${renderCount}`);
});

runTest("2.4: Simulation of frame stall clamps dt to MAX_FADE_DT_MS", () => {
  const MAX_FADE_DT_MS = 50;
  const introDuration = 2400;

  let lastFadeMs = 100;
  let introElapsed = 0;

  // Simulate a 500ms browser freeze / stall
  const ms = 600;
  const dt = Math.min(Math.max(0, ms - lastFadeMs), MAX_FADE_DT_MS);
  introElapsed += dt;

  assert.strictEqual(dt, 50, `Expected stalled dt to be clamped to 50ms, got ${dt}`);
  assert.strictEqual(introElapsed, 50, `introElapsed should only advance by clamped 50ms`);
  const t = Math.min(introElapsed / introDuration, 1);
  assert(t < 0.05, `Fade progression should not jump ahead during freeze: t=${t}`);
});

// ---------------------------------------------------------
// 3. IntroOrchestrator Event Wiring & Fallback Contract
// ---------------------------------------------------------
console.log("\n[Group 3] IntroOrchestrator Event Wiring & Fallback Contract");

runTest("3.1: IntroOrchestrator ties fallback to introTimings.gateDuration with 3500ms minimum", () => {
  const orchSrc = fs.readFileSync(path.join(repoRoot, "components/IntroOrchestrator.tsx"), "utf8");
  
  assert(orchSrc.includes('import { introTimings } from "@/lib/introTimings";'), "Missing introTimings import");
  assert(
    orchSrc.includes("const fallbackDelay = Math.max(3500, introTimings.gateDuration * 1000);"),
    "Missing `Math.max(3500, introTimings.gateDuration * 1000)` fallback calculation"
  );

  // Test mathematical behavior
  const calcFallback = (gateDuration) => Math.max(3500, gateDuration * 1000);
  assert.strictEqual(calcFallback(2.4), 3500, "For gateDuration=2.4s, fallback should be 3500ms");
  assert.strictEqual(calcFallback(1.5), 3500, "For gateDuration=1.5s, fallback should clamp to 3500ms min");
  assert.strictEqual(calcFallback(4.0), 4000, "For gateDuration=4.0s, fallback should scale up to 4000ms");
});

runTest("3.2: IntroOrchestrator listens for ps3-silk-intro-complete, soft-nav-start, and route changes", () => {
  const orchSrc = fs.readFileSync(path.join(repoRoot, "components/IntroOrchestrator.tsx"), "utf8");

  assert(orchSrc.includes('window.addEventListener("ps3-silk-intro-complete", onSilkComplete'), "Missing ps3-silk-intro-complete listener");
  assert(orchSrc.includes('window.addEventListener("soft-nav-start", onSoftNav'), "Missing soft-nav-start listener");
  assert(orchSrc.includes('if (pathname !== "/")'), "Missing pathname !== '/' check");
  assert(orchSrc.includes('completeIntro();'), "Missing completeIntro() calls on completion/navigation");
});

// ---------------------------------------------------------
// 4. Ripple Formula Removal & Smooth Spatial Pull
// ---------------------------------------------------------
console.log("\n[Group 4] Cursor Ripple Removal & Spatial Pull Analysis");

runTest("4.1: PS3Silk.tsx does NOT contain exp(-rx*rx) or any donut ripple formulas", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");
  
  assert(!silkSrc.includes("exp(-rx*rx)"), "Found prohibited ripple formula exp(-rx*rx) in PS3Silk.tsx");
  assert(!silkSrc.includes("exp(-"), "Found exp(-...) pattern in PS3Silk.tsx");
  assert(!silkSrc.includes("sin(md"), "Found circular sinusoidal ripple pattern");
});

runTest("4.2: Fragment shader implements monotonic smoothstep spatial pull", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");

  assert(silkSrc.includes("float md = length(uv - uMouse);"), "Missing md distance calculation");
  assert(silkSrc.includes("float mnudge = smoothstep(0.45, 0.0, md) * uMouseStrength;"), "Missing smoothstep spatial pull");
  assert(silkSrc.includes("float uvxNudged = uvx + mnudge;"), "Missing uvxNudged application");

  // Mathematical verification of smoothstep(0.45, 0.0, md):
  // smoothstep(edge0, edge1, x):
  // clamp((x - 0.45) / (0.0 - 0.45), 0.0, 1.0)
  // For md = 0 -> 1.0
  // For md = 0.225 -> 0.5
  // For md = 0.45 -> 0.0
  // For md > 0.45 -> 0.0
  // Derivative is strictly <= 0 everywhere for md >= 0.
  const smoothstep = (e0, e1, x) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  const md_0 = smoothstep(0.45, 0.0, 0.0);
  const md_1 = smoothstep(0.45, 0.0, 0.1);
  const md_2 = smoothstep(0.45, 0.0, 0.2);
  const md_3 = smoothstep(0.45, 0.0, 0.3);
  const md_4 = smoothstep(0.45, 0.0, 0.45);
  const md_5 = smoothstep(0.45, 0.0, 0.6);

  assert.strictEqual(md_0, 1.0, "Center nudge should be 1.0");
  assert(md_1 < md_0 && md_1 > md_2, "Must decrease monotonically from 0 to 0.2");
  assert(md_2 > md_3 && md_3 > md_4, "Must decrease monotonically from 0.2 to 0.45");
  assert.strictEqual(md_4, 0.0, "Boundary at 0.45 must be exactly 0.0");
  assert.strictEqual(md_5, 0.0, "Outside 0.45 must remain 0.0");
});

// ---------------------------------------------------------
// 5. Canvas ID Invariant
// ---------------------------------------------------------
console.log("\n[Group 5] Canvas DOM ID Invariant");

runTest("5.1: PS3Silk.tsx renders canvas with id='ps3-silk-canvas'", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");
  assert(silkSrc.includes('id="ps3-silk-canvas"'), "Canvas must have id='ps3-silk-canvas'");
});

// ---------------------------------------------------------
// 6. BruinLease Isolation Invariant
// ---------------------------------------------------------
console.log("\n[Group 6] BruinLease Containment Invariant");

runTest("6.1: PersistentWorkShell.tsx preserves project-bruinlease contain style", () => {
  const shellSrc = fs.readFileSync(path.join(repoRoot, "components/PersistentWorkShell.tsx"), "utf8");
  assert(shellSrc.includes('p._id === "project-bruinlease" ? "contain" : undefined'), "Missing BruinLease contain rule");
  assert(shellSrc.includes('p._id === "project-bruinlease" ? "#b3cde3" : undefined'), "Missing BruinLease background color rule");
});

console.log("\n=== TEST SUMMARY ===");
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
