/**
 * Opaque-box Assertion Utilities for muditm.com E2E Test Suite.
 * Provides explicit, informative error messages and diffs for test verifications.
 */

export class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = "AssertionError";
    this.expected = expected;
    this.actual = actual;
  }
}

export function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new AssertionError(message, true, false);
  }
}

export function assertEqual(actual, expected, message) {
  const msg = message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
  if (actual !== expected) {
    throw new AssertionError(msg, expected, actual);
  }
}

export function assertNotEqual(actual, unexpected, message) {
  const msg = message || `Expected value not to equal ${JSON.stringify(unexpected)}`;
  if (actual === unexpected) {
    throw new AssertionError(msg, `not ${JSON.stringify(unexpected)}`, actual);
  }
}

export function assertInRange(value, min, max, message) {
  const msg = message || `Expected ${value} to be in range [${min}, ${max}]`;
  if (typeof value !== "number" || isNaN(value) || value < min || value > max) {
    throw new AssertionError(msg, `[${min}, ${max}]`, value);
  }
}

export function assertGreaterThanOrEqual(actual, min, message) {
  const msg = message || `Expected ${actual} >= ${min}`;
  if (actual < min) {
    throw new AssertionError(msg, `>= ${min}`, actual);
  }
}

export function assertLessThanOrEqual(actual, max, message) {
  const msg = message || `Expected ${actual} <= ${max}`;
  if (actual > max) {
    throw new AssertionError(msg, `<= ${max}`, actual);
  }
}

export function assertMatch(text, pattern, message) {
  const reg = typeof pattern === "string" ? new RegExp(pattern) : pattern;
  const msg = message || `Expected "${text}" to match ${pattern}`;
  if (!reg.test(String(text))) {
    throw new AssertionError(msg, String(pattern), String(text));
  }
}

export async function assertRejects(fn, expectedErrorPattern, message) {
  let threw = false;
  let caughtError = null;
  try {
    await fn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }
  if (!threw) {
    throw new AssertionError(message || "Expected async function to throw, but it succeeded", "Error thrown", "No error");
  }
  if (expectedErrorPattern) {
    const reg = typeof expectedErrorPattern === "string" ? new RegExp(expectedErrorPattern, "i") : expectedErrorPattern;
    const errStr = caughtError ? String(caughtError.message || caughtError) : "";
    if (!reg.test(errStr)) {
      throw new AssertionError(
        message || `Expected error message to match ${expectedErrorPattern}, got "${errStr}"`,
        String(expectedErrorPattern),
        errStr
      );
    }
  }
  return caughtError;
}
