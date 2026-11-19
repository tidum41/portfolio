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

runTest("1.1: PS3Silk.tsx has no black pre-roll hold; first drawn frame starts at INTRO_SILK_FLOOR (Nov 18 2026 fast cinematic)", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");
  const timingsSrc = fs.readFileSync(path.join(repoRoot, "lib/introTimings.ts"), "utf8");

  assert(!silkSrc.includes("preRollMs"), "preRollMs hold must be gone");
  assert(!silkSrc.includes("fadeNotBefore"), "Fade clock must not be held behind a pre-roll");
  assert(silkSrc.includes("INTRO_SILK_FLOOR + (1 - INTRO_SILK_FLOOR) * (1 - Math.pow(1 - t, 3))"), "Missing floor + ease-out cubic swell");
  assert(silkSrc.includes("KHR_parallel_shader_compile"), "Missing KHR_parallel_shader_compile gating");
  assert(/INTRO_SILK_FLOOR\s*=\s*0\.4/.test(timingsSrc), "INTRO_SILK_FLOOR must be 0.4");

  // Mirror of the swell: bright on frame 1, ~82% by 300ms, 100% at 900ms
  const op = (ms) => 0.4 + 0.6 * (1 - Math.pow(1 - Math.min(ms / 900, 1), 3));
  assert.strictEqual(op(0), 0.4, "First frame must sit at the 0.4 floor");
  assert(op(300) > 0.8, `Expected >80% opacity at 300ms, got ${op(300)}`);
  assert.strictEqual(op(900), 1, "Swell must reach 1.0 at 900ms");
});

runTest("1.2: React 19 StrictMode idempotency guard preserves isFirstLoad state", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");
  assert(silkSrc.includes("const hadMountedBefore = _hasMounted;"), "Missing hadMountedBefore capture");
  assert(silkSrc.includes("_hasMounted = hadMountedBefore;"), "Missing _hasMounted restoration in cleanup");
});

// ---------------------------------------------------------
// 2. 30fps Frame Rate Cap & Frame Pacing Simulation
// ---------------------------------------------------------
console.log("\n[Group 2] 30fps Frame Rate Cap & Clamped dt Simulation");

runTest("2.1: PS3Silk.tsx declares FRAME_MS = 1000/30, FRAME_TOLERANCE_MS, and MAX_FADE_DT_MS", () => {
  const silkSrc = fs.readFileSync(path.join(repoRoot, "components/PS3Silk.tsx"), "utf8");
  assert(silkSrc.includes("const FRAME_MS = 1000 / 30;"), "Missing FRAME_MS = 1000 / 30");
  assert(silkSrc.includes("const FRAME_TOLERANCE_MS = 3.5;"), "Missing FRAME_TOLERANCE_MS = 3.5");
  assert(silkSrc.includes("const MAX_FADE_DT_MS = 50;"), "Missing MAX_FADE_DT_MS = 50");
});

runTest("2.2: Simulation of 60Hz rAF displays strict 30fps throttling", () => {
  const FRAME_MS = 1000 / 30; // 33.333ms
  const FRAME_TOLERANCE_MS = 3.5;

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

  // 60Hz over 1s should produce exactly 30 rendered frames
  assert.strictEqual(renderCount, 30, `Expected exactly 30 rendered frames on 60Hz display, got ${renderCount}`);

  // Average delta between rendered frames should be ~33.33ms
  for (let i = 1; i < frameTimes.length; i++) {
    const delta = frameTimes[i] - frameTimes[i - 1];
    assert(Math.abs(delta - 33.333) < 1.0, `Render frame interval ${delta}ms was outside 30fps tolerance`);
  }
});

runTest("2.3: Simulation of 120Hz rAF displays strict 30fps throttling", () => {
  const FRAME_MS = 1000 / 30;
  const FRAME_TOLERANCE_MS = 3.5;

  let lastT = 0;
  let renderCount = 0;

  // 120 rAF ticks at 8.333ms intervals
  for (let tick = 1; tick <= 120; tick++) {
    const ms = tick * (1000 / 120);
    if (lastT !== 0 && ms - lastT < FRAME_MS - FRAME_TOLERANCE_MS) continue;
    lastT = ms;
    renderCount++;
  }

  // 120Hz over 1s should produce 30 rendered frames
  assert.strictEqual(renderCount, 30, `Expected 30 rendered frames on 120Hz display, got ${renderCount}`);
});

runTest("2.4: Simulation of frame stall clamps dt to MAX_FADE_DT_MS", () => {
  const MAX_FADE_DT_MS = 50;
  const introDuration = 900;

  let lastFadeMs = 100;
  let introElapsed = 0;

  // Simulate a 500ms browser freeze / stall
  const ms = 600;
  const dt = Math.min(Math.max(0, ms - lastFadeMs), MAX_FADE_DT_MS);
  introElapsed += dt;

  assert.strictEqual(dt, 50, `Expected stalled dt to be clamped to 50ms, got ${dt}`);
  assert.strictEqual(introElapsed, 50, `introElapsed should only advance by clamped 50ms`);
  const t = Math.min(introElapsed / introDuration, 1);
  assert(t < 0.1, `Fade progression should not jump ahead during freeze: t=${t}`);
});

// ---------------------------------------------------------
// 3. IntroOrchestrator Event Wiring & Fallback Contract
// ---------------------------------------------------------
console.log("\n[Group 3] IntroOrchestrator Event Wiring & Fallback Contract");

runTest("3.1: IntroOrchestrator ties fallback to introTimings.gateDuration with a 1800ms minimum", () => {
  const orchSrc = fs.readFileSync(path.join(repoRoot, "components/IntroOrchestrator.tsx"), "utf8");
  const timingsSrc = fs.readFileSync(path.join(repoRoot, "lib/introTimings.ts"), "utf8");

  assert(orchSrc.includes('import { introTimings, INTRO_FAILSAFE_MS } from "@/lib/introTimings";'), "Missing introTimings import");
  assert(
    orchSrc.includes("const fallbackDelay = Math.max(INTRO_FAILSAFE_MS, introTimings.gateDuration * 1000);"),
    "Missing `Math.max(INTRO_FAILSAFE_MS, introTimings.gateDuration * 1000)` fallback calculation"
  );
  assert(/INTRO_FAILSAFE_MS\s*=\s*1800/.test(timingsSrc), "INTRO_FAILSAFE_MS must be 1800");

  // Test mathematical behavior
  const calcFallback = (gateDuration) => Math.max(1800, gateDuration * 1000);
  assert.strictEqual(calcFallback(0.9), 1800, "For gateDuration=0.9s, fallback should be 1800ms");
  assert.strictEqual(calcFallback(1.5), 1800, "For gateDuration=1.5s, fallback should clamp to 1800ms min");
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

runTest("6.1: PersistentWorkShell.tsx uses native BruinLease 6:5 with no letterbox fill", () => {
  const shellSrc = fs.readFileSync(path.join(repoRoot, "components/PersistentWorkShell.tsx"), "utf8");
  assert(shellSrc.includes('"project-bruinlease": { css: "6 / 5"'), "Missing BruinLease native 6:5 aspect");
  assert(shellSrc.includes('objectFit="contain"'), "Grid videos should use object-fit contain");
  assert(!shellSrc.includes("#aac5e0"), "BruinLease letterbox fill should be gone");
  assert(!shellSrc.includes("#b3cde3"), "Legacy BruinLease letterbox fill should be gone");
});

console.log("\n=== TEST SUMMARY ===");
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
