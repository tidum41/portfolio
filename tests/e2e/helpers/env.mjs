/**
 * Environment & Device Configuration for Playwright E2E Suites.
 */

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  desktopLarge: { width: 1920, height: 1080 },
  desktopUltraWide: { width: 3840, height: 2160 },
  mobile: { width: 390, height: 844 }, // iPhone 12/13/14 viewport
  mobileSmall: { width: 360, height: 780 },
  mobileNarrow: { width: 320, height: 568 }, // iPhone SE 1st gen
  tablet: { width: 768, height: 1024 },
};

export const THROTTLE_PROFILES = {
  normal: null,
  cpu4x: {
    rate: 4,
  },
  slow3G: {
    offline: false,
    downloadThroughput: Math.floor((400 * 1000) / 8),
    uploadThroughput: Math.floor((400 * 1000) / 8),
    latency: 400,
  },
  cpu4xSlow3G: {
    rate: 4,
    network: {
      offline: false,
      downloadThroughput: Math.floor((400 * 1000) / 8),
      uploadThroughput: Math.floor((400 * 1000) / 8),
      latency: 400,
    },
  },
};

export const CANONICAL_COPY = {
  heroHeading: "I'm Mudit, an AI-native product designer with a love for prototyping, tinkering, and visuals.",
  heroSubtitle: "Leading Cursor @ UCLA · Previously designing @ JOOLA",
  joolaHref: "/joola",
};

export const SPEC_TIMINGS = {
  // "Fast cinematic" intro (Nov 18, 2026) supersedes the Oct HOM-01 spec of a
  // 180ms pre-roll + 2.4s smoothstep fade. Source of truth: lib/introTimings.ts.
  maxPrerollMs: 50,        // no black hold; first drawn frame is already visible
  targetPrerollMs: 0,
  silkFloor: 0.4,          // uOpacity on the first drawn frame (non-reduced)
  minSilkFadeSec: 0.7,
  maxSilkFadeSec: 1.2,
  targetSilkFadeSec: 0.9,  // ease-out cubic
  heroDelayMs: 150,
  heroDurationMs: 800,
  subDelayMs: 500,
  failSafeMs: 1800,
  reducedMotionDurationMs: 350,
  targetFps: 30,
  frameDurationMs: 1000 / 30, // 33.33ms
  defaultHalftoneIntensity: 0.29,
  defaultHalftoneMode: 1, // Halftone mode
  minTouchTargetPx: 32,
};
