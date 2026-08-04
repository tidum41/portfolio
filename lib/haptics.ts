/**
 * Demo-safe haptics helper aligned with iOS 18.4+ Safari constraints:
 *
 * - Apple only treats a **click** as a trusted haptic grant (drag does not).
 * - That grant expires after ~1s; longer patterns need main-thread blocking
 *   (we never enable that — it would jank Framer/CD drag).
 * - Call `haptic()` only from `click` / `pointerup` / `change` handlers.
 *
 * On Android/Chrome, `navigator.vibrate` is native. On iOS Safari, the
 * `ios-vibrator-pro-max` polyfill must be imported by the demo page first.
 */

export const HAPTIC_SAFE_BUDGET_MS = 900;

export type HapticPattern = number | number[];

export const HAPTIC_PRESETS = {
  /** Light selection tick */
  tick: 12,
  /** Soft tap / button press */
  tap: 24,
  /** Confirmed action */
  success: [18, 40, 28] as number[],
  /** Attention / warning double-pulse */
  warn: [30, 50, 30] as number[],
  /** Stronger single hit (still well under 1s) */
  heavy: 55,
} as const satisfies Record<string, HapticPattern>;

export function patternDurationMs(pattern: HapticPattern): number {
  if (typeof pattern === "number") return Math.max(0, pattern);
  return pattern.reduce((sum, n) => sum + Math.max(0, n), 0);
}

export function isHapticPatternSafe(pattern: HapticPattern): boolean {
  return patternDurationMs(pattern) <= HAPTIC_SAFE_BUDGET_MS;
}

export type HapticResult =
  | { ok: true; durationMs: number }
  | { ok: false; reason: "unsupported" | "too-long" | "threw"; durationMs: number; error?: string };

/** Fire a short vibration. Must run inside a user click/pointerup on iOS 18.4+. */
export function haptic(pattern: HapticPattern = HAPTIC_PRESETS.tap): HapticResult {
  const durationMs = patternDurationMs(pattern);
  if (durationMs > HAPTIC_SAFE_BUDGET_MS) {
    return { ok: false, reason: "too-long", durationMs };
  }
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return { ok: false, reason: "unsupported", durationMs };
  }
  try {
    const accepted = navigator.vibrate(pattern);
    if (!accepted) return { ok: false, reason: "unsupported", durationMs };
    return { ok: true, durationMs };
  } catch (err) {
    return {
      ok: false,
      reason: "threw",
      durationMs,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function detectHapticEnvironment() {
  if (typeof window === "undefined") {
    return {
      vibrateApi: false,
      coarsePointer: false,
      isAppleTouch: false,
      isSafari: false,
      platform: "ssr" as const,
    };
  }
  const ua = navigator.userAgent;
  const isAppleTouch = /iPhone|iPad|iPod/i.test(ua)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return {
    vibrateApi: typeof navigator.vibrate === "function",
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    isAppleTouch,
    isSafari,
    platform: navigator.platform || "unknown",
  };
}
