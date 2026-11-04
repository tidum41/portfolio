"use client";

import { useEffect, useRef } from "react";
import { useDialKitController } from "dialkit";
import { introTimings } from "@/lib/introTimings";
import { getHeroScrim, rasterizeHeroScrim, subscribeHeroScrim } from "@/lib/heroScrim";

// Module-level flag: persists during client-side nav, resets on page reload
let _hasMounted = false;

function hexToRgb(hex: string): [number, number, number] {
  if (!hex || typeof hex !== "string") return [1, 1, 1];
  if (hex.startsWith("hsl")) {
    const n = hex.match(/[\d.]+/g);
    if (n && n.length >= 3) {
      const h = parseFloat(n[0]) / 360, s = parseFloat(n[1]) / 100, l = parseFloat(n[2]) / 100;
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 0.5) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s, p2 = 2 * l - q2;
      return [hue2rgb(p2, q2, h + 1 / 3), hue2rgb(p2, q2, h), hue2rgb(p2, q2, h - 1 / 3)];
    }
  }
  if (hex.startsWith("rgb")) {
    const n = hex.match(/[\d.]+/g);
    if (n && n.length >= 3) return [parseFloat(n[0]) / 255, parseFloat(n[1]) / 255, parseFloat(n[2]) / 255];
  }
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  if (full.length < 6) return [1, 1, 1];
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

export interface PS3SilkProps {
  waveColor?: string;
  /** Fallback mode when nothing is saved this session: 1 halftone, 0 wave. */
  mode?: number;
  style?: React.CSSProperties;
  /** When false (work shell hidden via display:none), pause rendering and
   *  never write a 0×0 drawing buffer — that path is what flattened the
   *  pattern after navigating away from "/" and coming back. */
  active?: boolean;
}

// Mode is session state (same key the old control panel used), so a soft-nav
// round trip keeps whatever the visitor clicked to.
const MODE_KEY = "ps3cp_mode";
function readMode(fallback: number) {
  try { const r = sessionStorage.getItem(MODE_KEY); return r === "0" ? 0 : r === "1" ? 1 : fallback; } catch { return fallback; }
}
function saveMode(m: number) { try { sessionStorage.setItem(MODE_KEY, String(m)); } catch {} }

/**
 * Silk tuning. DialKit's panel only mounts in `next dev` (DevChrome); in
 * production `dialkit` resolves to lib/dialkit-prod.tsx, which returns these
 * defaults, so visitors never see controls.
 */
// Cursor behaviours. Picking one in the panel writes its values into the
// Drift dials, which stay tunable afterwards; the dials mean:
//   wake    pointer speed lays down touches that part the ribbons behind the
//           cursor. strength: px of parting; radius: touch size; decay: s a
//           touch lives.
//   well    while the pointer is over the hero the silk bends and lens-warps
//           toward it, and lets go on leave. strength: px of pull; radius:
//           well size; decay: s to let go; stiffness/damping: how the well
//           follows the cursor.
//   ripple  pointer speed emits rings that travel out and fade. strength: px
//           of swell; radius: px a ring travels; decay: s a ring lives.
// In every mode the ribbons' crossing hangs on a damped spring (stiffness,
// damping) aimed `driftStrength` of the way at the effect, and `glow`
// brightens the dots the effect touches.
const PRESETS = {
  wake: { strength: 30, radius: 130, decay: 1.4, stiffness: 10, damping: 1.0, driftStrength: 0.1, glow: 0.3 },
  well: { strength: 150, radius: 250, decay: 2.5, stiffness: 14, damping: 1.0, driftStrength: 0.12, glow: 0.5 },
  ripple: { strength: 14, radius: 300, decay: 1.8, stiffness: 10, damping: 1.0, driftStrength: 0.06, glow: 1.2 },
} as const;
type Preset = keyof typeof PRESETS;
const DEFAULT_PRESET: Preset = "wake";
const D0 = PRESETS[DEFAULT_PRESET];

const SILK_DIALS = {
  drift: {
    preset: {
      type: "select",
      options: [
        { value: "wake", label: "Wake" },
        { value: "well", label: "Gravity well" },
        { value: "ripple", label: "Ripple" },
      ],
      default: DEFAULT_PRESET,
    },
    strength: [D0.strength, 0, 200, 1],       // px
    radius: [D0.radius, 30, 400, 5],          // px
    decay: [D0.decay, 0.3, 4, 0.05],          // s
    stiffness: [D0.stiffness, 0.5, 40, 0.5],  // spring responsiveness (1/s^2)
    damping: [D0.damping, 0.2, 2, 0.05],      // damping ratio: 1 settles without overshoot, <1 sways
    driftStrength: [D0.driftStrength, 0, 0.6, 0.01], // share of the effect's offset the crossing follows
    glow: [D0.glow, 0, 1.5, 0.05],            // extra dot brightness where the effect is
  },
  silk: {
    speed: [1.2, 0, 4, 0.05],
    intensity: [0.21, 0, 1, 0.01],      // halftone mode
    dotSize: [3.0, 1, 20, 0.5],
  },
} as const;

// Fixed design values (formerly dials).
const INTENSITY_WAVE = 0.07;
const Y_OFFSET = 49;
const START_OPACITY = 0.5;
const END_OPACITY = 0.15;
const MODE_FADE = 0.45;     // s, halftone <-> wave crossfade
// Composite at CSS px on every screen. On 2x/3x displays the browser's
// upscale softens the 3px dots into the silk texture the design was tuned
// on; device-resolution rendering reads as crisp digital dots instead (and
// costs 4-9x the fill).
const RENDER_SCALE = 1;
// ~30fps, evenly paced. The ribbons and the drift move well under a pixel
// per frame at 30, while 60 doubles the GPU/compositor work the rest of the
// page (scroll, cards, cursor trail) competes with. With no trail and
// nothing easing, the slow ribbons alone drop to 20.
const FRAME_MS = 1000 / 30;
const IDLE_FRAME_MS = 1000 / 20;
const MAX_DT = 1 / 30;      // s, simulation step ceiling (one paced frame)
const MASK_TEXEL = 4;       // CSS px per scrim mask texel; the mask is a wide blur
const SPRING_STEP = 1 / 120; // s, fixed physics step (frame-rate independent)
const ENGAGE_TAU = 0.25;    // s, how fast the pull engages once the cursor moves
const WELL_TAU = 0.45;      // s, how fast the well deepens once the cursor is over the hero
const RELAX_S = 3;          // s, how slowly the crossing lets go after the trail fades
const SWITCH_S = 0.3;       // s, fade out / in around a preset switch
const TRAIL_N = 16;          // touches in the ring
const TRAIL_ATTACK = 0.3;   // share of a touch's life spent rising
const RING_ATTACK = 0.12;   // same, for a ripple ring
const RING_GAP = 0.16;      // s, minimum time between ripple rings
const RING_WIDTH = 0.08;    // ring band, as a share of how far rings travel
const WAKE_CLEAR = 0.85;    // share of the silk cleared right on the wake's path
const RING_FLOOR = 0.12;    // luma a full ring adds off the ribbons, per unit of glow
// Pointer speed (px/s) below which nothing is laid down, and the speed that
// gives a full-strength touch.
const SPEED_MIN = 60, SPEED_FULL = 760;
// Rest position of the ribbons' crossing, in the drift's uv (y up).
const CROSS_X = 0.5, CROSS_Y = 0.6;
const DRIFT_Y_MAX = 0.12;   // uv; more squashes the ribbon amplitude visibly

type SilkParams = {
  drift: {
    preset: string;
    strength: number; radius: number; decay: number;
    stiffness: number; damping: number; driftStrength: number; glow: number;
  };
  silk: { speed: number; intensity: number; dotSize: number };
};
// Effect shader variants: wake and well share one (push away vs pull in).
type Fx = "displace" | "ripple";
const fxOf = (p: string): Fx => (p === "ripple" ? "ripple" : "displace");

const VS = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Pass 1: ribbon brightness. In halftone mode one texel per dot cell (the
// dots only read their cell centre), so the 8 ribbons and the trail are
// evaluated ~9x less often than per pixel. Wave mode needs it per CSS pixel.
// Built once plain and once per cursor effect in use; the plain one runs
// whenever no effect is alive, so the idle silk never pays for an effect
// loop (a uniform-false branch around it still slowed every frame on
// software GL).
const lumaFs = (fx: Fx | null) => `
precision highp float;
${fx === "displace" ? "#define DISPLACE" : fx === "ripple" ? "#define RIPPLE" : ""}
#define FX_N ${TRAIL_N}
#if defined(DISPLACE) || defined(RIPPLE)
uniform vec4  uFx[FX_N];     // live touches first: xy CSS px (y up), z envelope x strength, w ring radius px
uniform float uFxCount;
uniform vec4  uFxBox;        // live touches' reach (beyond it an effect is < 0.02px)
uniform float uFxK;          // 1 / touch radius² (displace) or 1 / ring width (ripple)
uniform float uFxGain;       // px of push per unit of profile; negative pulls in
uniform float uFxMax;        // px, where the push saturates
uniform float uGlow;
uniform float uCore;         // displace: how much of the silk right on the path clears away
#endif
uniform float uTime;
uniform vec2  uCssSize;
uniform float uTexel;        // CSS px per texel
uniform float uYOffsetPx;
uniform float uSpeed;
uniform vec2  uDrift;        // slow crossing offset in uv (x along ribbons, y across)
uniform float uColorMax;     // brightest channel of the wave colour

// The ribbons' shared phase origin and centre line are shifted by uDrift, so
// the place where they cross slides a little toward where the visitor plays.
float wave(vec2 uv, float uvx, float spd, float freq, float amp,
  float cy, float width, float sharp, bool flip) {
  float angle = uTime * uSpeed * spd * freq * -1.0 + uvx * 2.0;
  float wy = sin(angle) * amp * (1.0 - abs(uDrift.y) * 2.0) + cy + uDrift.y;
  float dy = wy - uv.y;
  float dist = abs(dy);
  if (flip) { if (dy > 0.0) dist *= 4.0; }
  else       { if (dy < 0.0) dist *= 4.0; }
  return pow(smoothstep(width * 1.5, 0.0, dist), sharp);
}

void main() {
  vec2 px = gl_FragCoord.xy * uTexel;
  float fx = 0.0, fxCore = 0.0;
  // Displace: each touch moves this cell's sample point toward it along the
  // gradient of a Gaussian, so ribbons near it bow away (wake); a negative
  // gain samples from farther out instead, drawing the silk in (well).
  // Ripple: each ring moves sample points toward its centre within a soft
  // band around its radius, so a swell travels out through the ribbons.
  // Pushes are smooth everywhere and capped below the point where the
  // mapping would fold, so the silk stretches instead of creasing.
#if defined(DISPLACE) || defined(RIPPLE)
  if (all(greaterThan(px, uFxBox.xy)) && all(lessThan(px, uFxBox.zw))) {
    vec2 push = vec2(0.0);
    float ring = 0.0; // summed touch / ring field, for the glow
    float core = 0.0; // same, at half the radius
    for (int k = 0; k < FX_N; k++) {
      if (float(k) >= uFxCount) break;
      vec4 t = uFx[k];
      vec2 d = px - t.xy;
#ifdef DISPLACE
      float q = dot(d, d) * uFxK;
      if (q < 9.0) { float a = exp(-q), g = a * t.z; push += d * g; ring += g; a *= a; core += a * a * t.z; }
#else
      float rho = length(d) + 1e-3;
      float x = (rho - t.w) * uFxK;
      if (abs(x) < 3.0) { float b = exp(-x * x) * t.z; push += d * (b / rho); ring += b; }
#endif
    }
    // Overlapping touches saturate smoothly toward uFxMax (tanh), so a fast
    // sweep never creases the ribbons where a hard clamp would kick in.
    push *= uFxGain;
    float l = length(push) / uFxMax + 1e-6;
    float s = 1.0 - 2.0 / (exp(2.0 * l) + 1.0);
    px -= push * (s / l);
    fx = ring / (0.6 + ring);
    fxCore = core / (0.3 + core);
  }
#endif
  vec2 uv = px / uCssSize;
  uv.y += uYOffsetPx / uCssSize.y;
  float uvx = (uv.x - uDrift.x) * (uCssSize.x / uCssSize.y) / 2.414;
  float c = 0.0;
  c += 0.90 * wave(uv,uvx,0.18,0.22,0.32,0.62,0.090,18.0,false);
  c += 0.68 * wave(uv,uvx,0.38,0.42,0.24,0.62,0.085,20.0,false);
  c += 0.38 * wave(uv,uvx,0.28,0.62,0.20,0.62,0.042,28.0,false);
  c += 0.16 * wave(uv,uvx,0.12,0.18,0.14,0.62,0.065,22.0,false);
  c += 0.84 * wave(uv,uvx,0.14,0.28,0.14,0.58,0.095,20.0,true);
  c += 0.62 * wave(uv,uvx,0.33,0.39,0.11,0.58,0.088,22.0,true);
  c += 0.32 * wave(uv,uvx,0.48,0.50,0.09,0.56,0.040,30.0,true);
  c += 0.14 * wave(uv,uvx,0.22,0.57,0.08,0.52,0.160,18.0,true);
#if defined(DISPLACE) || defined(RIPPLE)
  c *= 1.0 + uGlow * fx;
#endif
#ifdef DISPLACE
  // Pushing away alone would magnify a ribbon the path runs along into a
  // smear; clearing the core opens the silk behind the cursor instead.
  c *= 1.0 - uCore * fxCore;
#endif
#ifdef RIPPLE
  // A faint floor, so rings also show as a trace of dots off the ribbons.
  c += uGlow * fx * ${RING_FLOOR.toFixed(3)};
#endif
  gl_FragColor = vec4(clamp(c * uColorMax, 0.0, 1.0), 0.0, 0.0, 1.0);
}`;

// Pass 2: dots / wave glow at device resolution, faded behind the hero text
// by the scrim mask, then dithered so low-alpha gradients (wave mode, the
// scrim falloff, the intro fade) never quantise into bands.
const COMPOSITE_FS = `
precision highp float;
uniform sampler2D uLuma;
uniform vec2  uLumaUv;       // CSS px -> luma uv
uniform sampler2D uMask;
uniform vec2  uMaskUv;       // CSS px -> mask uv
uniform vec2  uPxToCss;
uniform float uModeMix;      // 1 halftone, 0 wave; between = crossfade
uniform float uIntensity;
uniform float uIntensityWave;
uniform float uHalftoneSize;
uniform float uOpacity;
uniform vec3  uWaveColor;

float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

void main() {
  vec2 css = gl_FragCoord.xy * uPxToCss;
  vec4 o = vec4(0.0);
  if (uModeMix > 0.001) {
    vec2 cc = (floor(css / uHalftoneSize) + 0.5) * uHalftoneSize;
    float waveLight = texture2D(uLuma, cc * uLumaUv).r * uIntensity * 4.5;
    float radius = uHalftoneSize * 0.5 * clamp(waveLight - 0.05, 0.0, 1.2);
    float dotVal = 1.0 - smoothstep(radius - 0.8, radius + 0.8, length(css - cc));
    float a = dotVal * smoothstep(0.02, 0.08, waveLight);
    o += vec4(uWaveColor * 0.55 * a, a) * uModeMix;
  }
  if (uModeMix < 0.999) {
    float alpha = clamp(texture2D(uLuma, css * uLumaUv).r * uIntensityWave * 4.95, 0.0, 1.0);
    o += vec4(uWaveColor * 0.78 * alpha, alpha) * (1.0 - uModeMix);
  }
  o *= uOpacity * (1.0 - texture2D(uMask, css * uMaskUv).r);
  float n = ign(gl_FragCoord.xy) + ign(gl_FragCoord.yx + 17.0) - 1.0;
  gl_FragColor = clamp(o + n / 255.0 * step(0.5 / 255.0, o.a), 0.0, 1.0);
}`;

export default function PS3Silk({
  waveColor = "#ffffff",
  mode: initialMode = 1,
  style,
  active = true,
}: PS3SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(initialMode);
  const activeRef = useRef(active);
  const lifecycleRef = useRef<{ wake: () => void; pause: () => void } | null>(null);

  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { modeRef.current = readMode(initialMode); }, [initialMode]);

  const dkc = useDialKitController("PS3Silk", SILK_DIALS as never, {
    id: "ps3-silk-drift-v5",
    persist: { key: "ps3-silk-drift-v5", storage: "localStorage" },
  }) as unknown as { values: SilkParams; setValues: (v: unknown) => void };
  const dk = dkc.values;
  const paramsRef = useRef<SilkParams>(dk);
  useEffect(() => { paramsRef.current = dk; });
  // Picking a preset writes its values into the dials (a saved session
  // reloads with its own tuned values, not the preset's).
  const presetRef = useRef(dk.drift.preset);
  const { setValues } = dkc;
  useEffect(() => {
    const p = dk.drift.preset;
    if (p === presetRef.current) return;
    presetRef.current = p;
    if (p in PRESETS) setValues({ drift: { ...PRESETS[p as Preset] } });
  }, [dk.drift.preset, setValues]);

  const waveColorRef = useRef<[number, number, number]>(hexToRgb(waveColor));
  useEffect(() => { waveColorRef.current = hexToRgb(waveColor); }, [waveColor]);

  // Wake immediately on return so soft-nav back to work doesn't blank the
  // pattern for a couple of frames. Pause stops RAF only.
  useEffect(() => {
    if (!active) {
      lifecycleRef.current?.pause();
      return;
    }
    lifecycleRef.current?.wake();
  }, [active]);

  useEffect(() => {
    const pause = () => lifecycleRef.current?.pause();
    window.addEventListener("soft-nav-start", pause);
    return () => window.removeEventListener("soft-nav-start", pause);
  }, []);

  // PS3ThemeSync can still push a wave colour.
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.waveColor === undefined) return;
      waveColorRef.current = Array.isArray(d.waveColor)
        ? (d.waveColor as [number, number, number])
        : hexToRgb(d.waveColor);
    };
    window.addEventListener("ps3-update", handler);
    return () => window.removeEventListener("ps3-update", handler);
  }, []);

  // Click on bare silk toggles halftone (0.21) <-> wave (0.07) with a
  // soft crossfade. The canvas
  // stays pointer-events:none and this listens passively on window, so links,
  // cards and controls keep their clicks: anything interactive (or the rabbit-
  // hole trigger/popup), a text selection, or an already-handled click is
  // ignored.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current || !activeRef.current || e.defaultPrevented || e.button !== 0) return;
      const el = e.target as Element | null;
      if (el?.closest?.("a, button, input, select, textarea, label, summary, [role='button'], [role='link'], [tabindex]:not([tabindex='-1']), .project-card, .portfolio-grid-card, #rh-trigger, #rh-hover-zone, #rh-rabbit-wrapper")) return;
      const sel = window.getSelection?.();
      if (sel && !sel.isCollapsed) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
      const next = modeRef.current === 0 ? 1 : 0;
      modeRef.current = next;
      saveMode(next);
      lifecycleRef.current?.wake();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // WebGL
  useEffect(() => {
    const _canvas = canvasRef.current;
    const _wrapper = wrapperRef.current;
    if (!_canvas || !_wrapper) return;
    const canvas = _canvas as HTMLCanvasElement;
    const wrapper = _wrapper as HTMLDivElement;

    // Cursor effect and crossing drift (see PRESETS). Pointer in viewport
    // px (cx, cy; lx, ly at the last frame), turned into hero CSS px (y up,
    // as the shader sees it) each frame, so scrolling under a still pointer
    // moves it with the page. Touches (wake, ripple) and the well in hero CSS
    // px, y up; drift offset/velocity in uv.
    const ptr = { cx: 0, cy: 0, lx: 0, ly: 0, over: false };
    const trail = new Float32Array(TRAIL_N * 4);  // x, y, age (s), strength
    const fxGpu = new Float32Array(TRAIL_N * 4);
    const fxBox = [0, 0, 0, 0];
    let trailHead = 0, trailCredit = 1, pendingStrength = 0;
    let fxLive = 0, fxCx = 0, fxCy = 0;
    // The well's centre follows the pointer on the same spring as the drift.
    const well = { x: 0, y: 0, vx: 0, vy: 0 };
    const drift = { x: 0, y: 0, vx: 0, vy: 0 };
    let engage = 0, springAcc = 0;
    // Preset in effect, and a 0-1 gain that fades it out and the next one in
    // when the panel switches presets.
    let preset = paramsRef.current.drift.preset;
    let fxGain = 1;
    let modeMix = modeRef.current === 1 ? 1 : 0; // 1 = halftone
    let rafId = 0;
    let currentOpacity = 0, targetOpacity = START_OPACITY;

    // StrictMode-safety: in dev, React mounts this effect, tears it straight
    // back down, then mounts it again for real — without capturing/restoring
    // the pre-mount value here, that phantom first invocation would flip
    // _hasMounted permanently, making the real, persisting invocation always
    // compute isFirstLoad=false and silently skip the intro fade on every
    // dev reload. In production StrictMode double-invoke doesn't happen, so
    // this is a no-op there. Matches the same guard IntroOrchestrator uses.
    const hadMountedBefore = _hasMounted;
    const isFirstLoad = !_hasMounted;
    if (isFirstLoad) _hasMounted = true;

    // Reduced motion: one still frame (time frozen, no cursor input, no
    // entrance fade); the loop stops after each draw and only resize,
    // scroll, a mode click or a wake asks for another.
    const reducedMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Simulation time: advances by the clamped frame step, so after a stall,
    // a hidden tab or a soft-nav round trip the ribbons carry on from where
    // they stopped instead of jumping.
    let silkTime = reducedMotion ? 0 : performance.now() / 1000;

    // First-ever mount this session: fade in from 0 (in the shader, dithered).
    // Every later page nav: appear at full resting opacity immediately.
    if (!(isFirstLoad && !reducedMotion)) currentOpacity = START_OPACITY;

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const ease3 = (t: number) => t * t * t;

    let removeListeners = () => {};
    let teardownGL = () => {};

    // Intro fade-in: linear ease-in-out from 0 → START_OPACITY over
    // patternDuration, first load only. Uses time-based interpolation (not
    // lerp) so it reaches exactly START_OPACITY at t=duration. Declared out
    // here (not inside the deferred GL-init timer below) so onReplay — armed
    // synchronously, immediately below — can reset it even if a replay fires
    // before shader init has run; every other intro-timed piece
    // (IntroOrchestrator/HeroText/GridFirstLoad/RabbitHoleVideo) arms its
    // own intro-replay listener synchronously at mount for the same reason.
    // The fade is anchored to the first visible frame (GL init waits for an
    // idle slot after hydration, so that frame can land well after mount):
    // it always starts from 0, and still ends on the mount-based schedule
    // the rest of the intro uses unless that would rush it.
    const INTRO_DURATION = isFirstLoad && !reducedMotion ? (introTimings.patternDuration * 1000) : 0;
    const mountedAt = performance.now();
    let introArmed = INTRO_DURATION > 0;
    let introPhaseStart = mountedAt;
    let introPhaseEnd = mountedAt + INTRO_DURATION;
    function startIntro(ms: number) {
      introArmed = false;
      introPhaseStart = ms;
      introPhaseEnd = ms + Math.max(INTRO_DURATION * 0.6, mountedAt + INTRO_DURATION - ms);
    }

    function onReplay() {
      const dur = introTimings.patternDuration * 1000;
      currentOpacity = 0;
      introArmed = false;
      introPhaseStart = performance.now();
      introPhaseEnd   = introPhaseStart + dur;
    }
    window.addEventListener("intro-replay", onReplay);

    // First load: start GL in an idle slot after hydration (Safari has no
    // requestIdleCallback; a short timer stands in), so context creation and
    // shader compile don't land in the same frames as hydration and the
    // intro. Repeat navigations init immediately: the shaders are cached and
    // any delay would read as a stutter.
    let initRaf = 0;
    let cancelInit = () => {};
    if (!isFirstLoad) {
      const t = setTimeout(initGL, 0);
      cancelInit = () => clearTimeout(t);
    } else if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(initGL, { timeout: 500 });
      cancelInit = () => window.cancelIdleCallback(id);
    } else {
      const t = setTimeout(initGL, 150);
      cancelInit = () => clearTimeout(t);
    }

    function initGL() {
      const _glNullable = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      });
      if (!_glNullable) return;
      const gl = _glNullable as WebGLRenderingContext;

      // Layout is cached (on resize / ResizeObserver only) so neither the
      // frame loop nor pointer/scroll handlers ever read layout.
      let cssW = 0, cssH = 0, pageLeft = 0, pageTop = 0;
      let scrollY = window.scrollY || 0;
      let visible = true;
      let running = false;
      let wrapperShown = false;
      // Frame pacing (see frame()): recent rAF intervals, vsync estimate.
      const rawIntervals = new Float64Array(24);
      let rawIdx = 0, rawLastT = 0, vsync = 0, frameMs = FRAME_MS, lastFrameT = 0, idle = false;

      type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
      // Effect programs: linked and warmed (ready), or compiling.
      type FxProg = { prog: Prog | null; raw: WebGLProgram; warm: boolean };
      type GLState = {
        luma: Prog; fx: Partial<Record<Fx, FxProg>>; comp: Prog; buf: WebGLBuffer;
        lumaTex: WebGLTexture; lumaFb: WebGLFramebuffer; maskTex: WebGLTexture;
      };
      const RIBBON_U = ["uTime", "uCssSize", "uTexel", "uYOffsetPx", "uSpeed", "uDrift", "uColorMax"];
      const FX_U = [...RIBBON_U, "uFx", "uFxCount", "uFxBox", "uFxK", "uFxGain", "uFxMax", "uGlow", "uCore"];
      let S: GLState | null = null;
      let luma = { w: 0, h: 0, texel: 0 };
      let mask = { w: 1, h: 1, dirty: true };

      // Compile + link are only queued here. Any status or uniform query
      // blocks the main thread until the driver finishes (ANGLE/Metal on Macs
      // can take tens of ms), so with KHR_parallel_shader_compile those wait
      // until the driver reports completion.
      const parallel = gl.getExtension("KHR_parallel_shader_compile");
      function program(fs: string) {
        const p = gl.createProgram()!;
        for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]] as const) {
          const s = gl.createShader(type)!;
          gl.shaderSource(s, src);
          gl.compileShader(s);
          gl.attachShader(p, s);
        }
        gl.bindAttribLocation(p, 0, "aPos");
        gl.linkProgram(p);
        return p;
      }
      function linked(p: WebGLProgram, names: string[]) {
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
          for (const s of gl.getAttachedShaders(p) ?? []) {
            const log = gl.getShaderInfoLog(s);
            if (log) console.error(log);
          }
          console.error(gl.getProgramInfoLog(p));
        }
        const u: Record<string, WebGLUniformLocation | null> = {};
        for (const n of names) u[n] = gl.getUniformLocation(p, n);
        return { p, u };
      }
      function texture() {
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      }

      // Startup, one step per animation frame so no frame carries more than
      // one piece of it: queue compile + link, create buffers and textures
      // while the driver works, wait for KHR_parallel_shader_compile to
      // report done, look up uniforms, warm up, then draw the first frame.
      // Starts only if we're the visible work route; otherwise the
      // active→true wake does it (sizing to 0×0 on an about/archive first
      // paint used to flatten the pattern for good). The effect program is
      // warmed later, once the silk first settles, so neither the intro nor
      // the first hover pays for it; another preset's variant is compiled
      // the same way, in the background, when the panel picks it.
      function* setup(): Generator<void, void, void> {
        const fx0 = fxOf(preset);
        const lp = program(lumaFs(null)), tp = program(lumaFs(fx0)), cp = program(COMPOSITE_FS);
        yield;
        const buf = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const lumaTex = texture();
        const lumaFb = gl.createFramebuffer()!;
        const maskTex = texture();
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array(1));
        gl.clearColor(0, 0, 0, 0);
        yield;
        const done = (p: WebGLProgram) => !parallel || gl.getProgramParameter(p, parallel.COMPLETION_STATUS_KHR);
        while (!(done(lp) && done(tp) && done(cp))) yield;
        const C = linked(cp, ["uLuma", "uLumaUv", "uMask", "uMaskUv", "uPxToCss", "uModeMix", "uIntensity", "uIntensityWave", "uHalftoneSize", "uOpacity", "uWaveColor"]);
        gl.useProgram(C.p);
        gl.uniform1i(C.u.uLuma, 0);
        gl.uniform1i(C.u.uMask, 1);
        S = {
          luma: linked(lp, RIBBON_U),
          fx: { [fx0]: { prog: linked(tp, FX_U), raw: tp, warm: false } },
          comp: C, buf, lumaTex, lumaFb, maskTex,
        };
        luma = { w: 0, h: 0, texel: 0 };
        mask = { w: 1, h: 1, dirty: true };
        yield;
        warmUp(S.luma);
        yield;
        if (activeRef.current) lifecycleRef.current?.wake();
      }

      // The effect program for `f`, once it is linked and warmed; kicks off
      // its compile (and later its warm-up) on first ask. Returns null until
      // then.
      function fxProgram(f: Fx): Prog | null {
        if (!S) return null;
        let e = S.fx[f];
        if (!e) {
          e = S.fx[f] = { prog: null, raw: program(lumaFs(f)), warm: false };
          return null;
        }
        if (!e.prog) {
          if (parallel && !gl.getProgramParameter(e.raw, parallel.COMPLETION_STATUS_KHR)) return null;
          e.prog = linked(e.raw, FX_U);
          return null;
        }
        if (!e.warm) {
          e.warm = true;
          warmUp(e.prog);
          return null;
        }
        return e.prog;
      }

      function runSetup() {
        cancelAnimationFrame(initRaf);
        const steps = setup();
        const step = () => {
          initRaf = 0;
          if (gl.isContextLost()) return;
          if (!steps.next().done) initRaf = requestAnimationFrame(step);
        };
        step();
      }

      // Drivers finish pipeline setup (and SwiftShader JITs) on a program's
      // first draw, per render target format. Draw it once into one texel of
      // the luma target (and the composite at zero opacity at startup), so
      // that cost is paid off screen instead of as a hitch in visible frames.
      // Every render() redraws the whole luma target anyway.
      function warmUp(prog: Prog) {
        if (!S) return;
        if (!luma.w) ensureLuma(-1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, S.lumaFb);
        gl.viewport(0, 0, 1, 1);
        gl.useProgram(prog.p);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (prog === S.luma) {
          gl.useProgram(S.comp.p);
          gl.uniform1f(S.comp.u.uOpacity, 0);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        gl.flush();
      }

      function ensureLuma(texel: number) {
        if (!S) return;
        // texel -1: 1x1 warm-up target.
        const w = texel < 0 ? 1 : texel === 1 ? Math.floor(cssW) : Math.ceil(cssW / texel);
        const h = texel < 0 ? 1 : texel === 1 ? Math.floor(cssH) : Math.ceil(cssH / texel);
        if (w === luma.w && h === luma.h && texel === luma.texel) return;
        luma = { w, h, texel };
        gl.bindTexture(gl.TEXTURE_2D, S.lumaTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, S.lumaFb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, S.lumaTex, 0);
      }

      // Rasterised on the CPU only when the text lines, the hero size or the
      // scrim dials change; per frame it is one texture read.
      function updateMask() {
        if (!S || cssW < 2) return;
        mask.dirty = false;
        const scrim = getHeroScrim();
        const m = scrim
          ? rasterizeHeroScrim(scrim, pageLeft, pageTop, cssW, cssH, MASK_TEXEL)
          : { data: new Uint8Array(1), width: 1, height: 1 };
        mask.w = m.width; mask.h = m.height;
        gl.bindTexture(gl.TEXTURE_2D, S.maskTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, m.width, m.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, m.data);
      }

      function render() {
        if (!S || cssW < 2 || cssH < 2) return;
        const P = paramsRef.current;
        const wc = waveColorRef.current;
        if (mask.dirty) updateMask();
        // Wave mode (and the crossfade) samples ribbons per CSS pixel; pure
        // halftone only needs one sample per dot cell.
        const texel = modeMix < 0.999 ? 1 : P.silk.dotSize;
        ensureLuma(texel);

        gl.bindFramebuffer(gl.FRAMEBUFFER, S.lumaFb);
        gl.viewport(0, 0, luma.w, luma.h);
        const D = P.drift;
        const r = Math.max(1, D.radius);
        const f = fxOf(preset);
        // Displace: one touch's push (d/r) exp(-d²/r²) peaks at 0.4289 r (at
        // d = r/√2). Pushing away folds the silk past ~0.42r, pulling in past
        // ~0.96r, so the strength is capped below each. Ripple: a ring's
        // radial push folds once it passes ~1.16x the band width.
        const w = Math.max(8, RING_WIDTH * r);
        const peak = Math.min(D.strength, f === "ripple" ? w : preset === "well" ? 0.8 * r : 0.42 * r) * fxGain;
        const glow = Math.max(0, D.glow) * fxGain;
        const L = fxLive && (peak > 0 || glow > 0) ? fxProgram(f) ?? S.luma : S.luma;
        gl.useProgram(L.p);
        if (L !== S.luma) {
          gl.uniform1f(L.u.uFxCount, fxLive);
          gl.uniform4f(L.u.uFxBox, fxBox[0], fxBox[1], fxBox[2], fxBox[3]);
          gl.uniform4fv(L.u.uFx, fxGpu.subarray(0, fxLive * 4));
          gl.uniform1f(L.u.uFxK, f === "ripple" ? 1 / w : 1 / (r * r));
          gl.uniform1f(L.u.uFxGain, f === "ripple" ? peak : (preset === "well" ? -peak : peak) / (0.4289 * r));
          gl.uniform1f(L.u.uFxMax, Math.max(peak, 1e-3));
          gl.uniform1f(L.u.uGlow, glow);
          gl.uniform1f(L.u.uCore, preset === "wake" ? WAKE_CLEAR : 0);
        }
        gl.uniform1f(L.u.uTime, silkTime);
        gl.uniform2f(L.u.uCssSize, Math.floor(cssW), Math.floor(cssH));
        gl.uniform1f(L.u.uTexel, texel);
        gl.uniform1f(L.u.uYOffsetPx, Y_OFFSET);
        gl.uniform1f(L.u.uSpeed, P.silk.speed);
        gl.uniform2f(L.u.uDrift, drift.x, drift.y);
        gl.uniform1f(L.u.uColorMax, Math.max(wc[0], wc[1], wc[2]));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        const C = S.comp.u;
        gl.useProgram(S.comp.p);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, S.lumaTex);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, S.maskTex);
        gl.uniform2f(C.uLumaUv, 1 / (luma.w * texel), 1 / (luma.h * texel));
        gl.uniform2f(C.uMaskUv, 1 / (mask.w * MASK_TEXEL), 1 / (mask.h * MASK_TEXEL));
        gl.uniform2f(C.uPxToCss, 1 / RENDER_SCALE, 1 / RENDER_SCALE);
        gl.uniform1f(C.uModeMix, modeMix);
        gl.uniform1f(C.uIntensity, P.silk.intensity);
        gl.uniform1f(C.uIntensityWave, INTENSITY_WAVE);
        gl.uniform1f(C.uHalftoneSize, P.silk.dotSize);
        gl.uniform1f(C.uOpacity, currentOpacity);
        gl.uniform3f(C.uWaveColor, wc[0], wc[1], wc[2]);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (!wrapperShown) {
          wrapperShown = true;
          wrapper.style.opacity = "1";
        }
      }

      function resize() {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;
        // Never write a 0×0 (or near-zero) drawing buffer. The persistent work
        // shell hides via display:none on non-/ routes, which reports 0×0 here;
        // assigning that size is what made the pattern go flat/empty on return.
        if (rect.width < 2 || rect.height < 2) return;
        scrollY = window.scrollY || 0;
        const moved = rect.width !== cssW || rect.height !== cssH
          || rect.left !== pageLeft || rect.top + scrollY !== pageTop;
        cssW = rect.width; cssH = rect.height;
        pageLeft = rect.left; pageTop = rect.top + scrollY;
        if (moved) mask.dirty = true;
        const w = Math.floor(cssW * RENDER_SCALE), h = Math.floor(cssH * RENDER_SCALE);
        if (canvas.width === w && canvas.height === h && !moved) return;
        canvas.width = w;
        canvas.height = h;
        // Reassigning canvas.width/height clears the drawing buffer; repaint
        // now instead of on the next paced frame, so a drag-resize never
        // flashes an empty canvas.
        render();
      }

      // Native `resize` fires many times per second during a drag; coalescing
      // to at most once per animation frame avoids redundant clear+redraws
      // stacking up faster than the browser can paint them, without adding
      // any debounce delay — the canvas still resizes live, every frame.
      let resizeScheduled = false;
      function scheduledResize() {
        if (resizeScheduled) return;
        resizeScheduled = true;
        requestAnimationFrame(() => {
          resizeScheduled = false;
          resize();
        });
      }

      function updateScrollTarget() {
        const fadeStart  = window.innerHeight * 0.04;  // ~36px at 900px vh
        const fadeEnd    = window.innerHeight * 0.12;  // ~108px
        targetOpacity = START_OPACITY + (END_OPACITY - START_OPACITY) *
          ease3(clamp((scrollY - fadeStart) / (fadeEnd - fadeStart), 0, 1));
      }

      function onScroll() {
        scrollY = window.scrollY || 0;
        updateScrollTarget();
        if (reducedMotion && visible) startLoop();
      }

      // Only records where the pointer is (`over`: on the page at all); the
      // frame loop decides whether that is over the hero and turns its
      // speed into touches.
      function onMouseMove(e: MouseEvent) {
        if (reducedMotion || !activeRef.current) return;
        if (!ptr.over) { ptr.lx = e.clientX; ptr.ly = e.clientY; ptr.over = true; }
        ptr.cx = e.clientX; ptr.cy = e.clientY;
        startLoop();
      }
      function onMouseOut(e: MouseEvent) {
        if (!e.relatedTarget) ptr.over = false;
      }

      function onPopState() {
        targetOpacity = currentOpacity = START_OPACITY;
      }

      function startLoop() {
        if (running || !S || !activeRef.current || !visible || document.hidden) return;
        running = true;
        rawLastT = 0;
        lastFrameT = 0;
        rafId = requestAnimationFrame(frame);
      }

      function stopLoop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      }

      // ResizeObserver catches the wrapper going from 0×0 (display:none) back
      // to its real size when the work route becomes active again — window.resize
      // alone doesn't fire on route-change visibility toggles. We still refuse
      // to apply the 0×0 measurement itself (see resize()).
      const ro = new ResizeObserver(() => {
        if (!activeRef.current) return;
        resize();
        startLoop();
      });
      ro.observe(wrapper);

      // Offscreen (scrolled past the hero) or a hidden tab = no frames at all.
      const io = new IntersectionObserver((entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        if (visible) startLoop(); else stopLoop();
      }, { rootMargin: "64px 0px" });
      io.observe(wrapper);
      const onVisibility = () => {
        if (document.hidden) stopLoop(); else startLoop();
      };
      document.addEventListener("visibilitychange", onVisibility);

      const unsubscribeScrim = subscribeHeroScrim(() => {
        mask.dirty = true;
        if (!running) render();
      });

      const onContextLost = (e: Event) => {
        e.preventDefault();
        stopLoop();
        cancelAnimationFrame(initRaf);
        S = null;
      };
      const onContextRestored = () => runSetup();
      canvas.addEventListener("webglcontextlost", onContextLost, false);
      canvas.addEventListener("webglcontextrestored", onContextRestored, false);

      window.addEventListener("resize", scheduledResize);
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      document.addEventListener("mouseout", onMouseOut, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("popstate", onPopState);
      removeListeners = () => {
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        unsubscribeScrim();
        lifecycleRef.current = null;
        stopLoop();
        canvas.removeEventListener("webglcontextlost", onContextLost, false);
        canvas.removeEventListener("webglcontextrestored", onContextRestored, false);
        window.removeEventListener("resize", scheduledResize);
        window.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseout", onMouseOut);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("popstate", onPopState);
      };
      teardownGL = () => {
        if (!S || gl.isContextLost()) return;
        gl.deleteProgram(S.luma.p);
        for (const e of Object.values(S.fx)) if (e) gl.deleteProgram(e.raw);
        gl.deleteProgram(S.comp.p);
        gl.deleteBuffer(S.buf);
        gl.deleteTexture(S.lumaTex);
        gl.deleteTexture(S.maskTex);
        gl.deleteFramebuffer(S.lumaFb);
        S = null;
      };

      // Called when the work route becomes visible again (and once at init if
      // already active). Re-measure against a real box so the pattern keeps
      // intensity / halftone / aspect after a round-trip.
      const wake = () => {
        if (gl.isContextLost()) return;
        resize();
        scrollY = window.scrollY || 0;
        updateScrollTarget();
        // Snap opacity to the scroll-derived target — no leftover intro/
        // hidden-state value that would wash the pattern out.
        if (!(isFirstLoad && !reducedMotion && (introArmed || performance.now() < introPhaseEnd))) {
          currentOpacity = targetOpacity;
        }
        startLoop();
      };
      // Stop RAF while off-route, but keep the last framebuffer. Shrinking to
      // 1×1 blanked the pattern until wake()+draw, which read as a split-
      // second pop-in on About/Archive → Work. One silk canvas is cheap vs Mux.
      const pause = () => {
        stopLoop();
      };
      lifecycleRef.current = { wake, pause };

      function clearFx() {
        trail.fill(0);
        fxLive = 0;
        pendingStrength = 0;
        engage = 0;
      }

      // Wake and ripple. Touches are laid down at most every life/TRAIL_N
      // seconds (ripple rings at least RING_GAP apart), so each lives out its
      // whole envelope before the ring reuses its slot. A touch's strength is
      // the fastest pointer speed over the hero since the last one. Ages
      // everything, packs the live touches and their reach for the shader,
      // and returns their summed strength.
      function stepTrail(D: SilkParams["drift"], real: number, dt: number, hx: number, hy: number, inside: boolean) {
        const life = Math.max(0.05, D.decay);
        const ripple = preset === "ripple";
        if (ptr.over) {
          const v = Math.hypot(ptr.cx - ptr.lx, ptr.cy - ptr.ly) / Math.max(real, 1e-3);
          ptr.lx = ptr.cx; ptr.ly = ptr.cy;
          if (inside) pendingStrength = Math.max(pendingStrength, clamp((v - SPEED_MIN) / (SPEED_FULL - SPEED_MIN), 0, 1));
        }
        const attack = ripple ? RING_ATTACK : TRAIL_ATTACK;
        const r = Math.max(1, D.radius), w = Math.max(8, RING_WIDTH * r);
        let n = 0, sum = 0, sx = 0, sy = 0;
        fxBox[0] = fxBox[1] = Infinity;
        fxBox[2] = fxBox[3] = -Infinity;
        for (let k = 0; k < TRAIL_N; k++) {
          const i = k * 4;
          if (trail[i + 3] <= 0) continue;
          const m = (trail[i + 2] += dt) / life;
          if (m >= 1) { trail[i + 3] = 0; continue; }
          const env = m < attack
            ? Math.sin((m / attack) * Math.PI / 2)
            : Math.sin((1 - (m - attack) / (1 - attack)) * Math.PI / 2);
          const s = env * trail[i + 3];
          // Rings travel out fast and slow down, like a swell on water.
          const R = ripple ? r * (1 - (1 - m) * (1 - m)) : 0;
          const reach = ripple ? R + 3 * w : 3 * r;
          const x = trail[i], y = trail[i + 1];
          fxGpu[n * 4] = x; fxGpu[n * 4 + 1] = y; fxGpu[n * 4 + 2] = s; fxGpu[n * 4 + 3] = R;
          n++; sum += s; sx += s * x; sy += s * y;
          fxBox[0] = Math.min(fxBox[0], x - reach); fxBox[1] = Math.min(fxBox[1], y - reach);
          fxBox[2] = Math.max(fxBox[2], x + reach); fxBox[3] = Math.max(fxBox[3], y + reach);
        }
        const gap = ripple ? Math.max(RING_GAP, life / TRAIL_N) : life / TRAIL_N;
        trailCredit = Math.min(1, trailCredit + dt / gap);
        if (trailCredit >= 1) {
          if (pendingStrength > 0.02) {
            trailCredit -= 1;
            const i = trailHead * 4;
            trail[i] = hx; trail[i + 1] = hy; trail[i + 2] = 0; trail[i + 3] = pendingStrength;
            trailHead = (trailHead + 1) % TRAIL_N;
          }
          pendingStrength = 0;
        }
        fxLive = n;
        if (sum > 0) { fxCx = sx / sum; fxCy = sy / sum; }
        return sum;
      }

      // Damped springs, integrated in fixed steps so their feel doesn't
      // depend on frame rate or dropped frames: the crossing offset (uv)
      // aims `driftStrength` of the way at the effect while it is engaged,
      // and the well (CSS px) follows the pointer while it is over the hero.
      function stepSprings(D: SilkParams["drift"], dt: number, follow: boolean, hx: number, hy: number) {
        let tx = 0, ty = 0;
        if (engage > 0) {
          const s = D.driftStrength * engage;
          tx = (s * (fxCx - CROSS_X * cssW)) / cssW;
          ty = clamp((s * (fxCy - CROSS_Y * cssH)) / cssH, -DRIFT_Y_MAX, DRIFT_Y_MAX);
        }
        const k = Math.max(0.01, D.stiffness);
        const c = 2 * Math.max(0, D.damping) * Math.sqrt(k);
        const h = SPRING_STEP;
        springAcc += dt;
        while (springAcc >= h) {
          springAcc -= h;
          drift.vx += (k * (tx - drift.x) - c * drift.vx) * h;
          drift.vy += (k * (ty - drift.y) - c * drift.vy) * h;
          drift.x += drift.vx * h;
          drift.y += drift.vy * h;
          if (!follow) continue;
          well.vx += (k * (hx - well.x) - c * well.vx) * h;
          well.vy += (k * (hy - well.y) - c * well.vy) * h;
          well.x += well.vx * h;
          well.y += well.vy * h;
        }
      }

      // One step of the cursor effect. Wake and ripple engage with their
      // touches' strength and let go over RELAX_S; the well engages while
      // the pointer is over the hero, whether or not it moves, holds where it
      // was when the pointer leaves, and lets go over `decay`. Returns
      // whether anything is still easing.
      function stepFx(D: SilkParams["drift"], real: number, dt: number) {
        const hx = ptr.cx - pageLeft, down = ptr.cy + scrollY - pageTop;
        const inside = ptr.over && hx >= 0 && hx <= cssW && down >= 0 && down <= cssH * 1.15;
        const hy = Math.floor(cssH) - down;
        const isWell = preset === "well";
        let goal: number, rise: number, fall: number;
        if (isWell) {
          if (inside && engage < 0.02) { well.x = hx; well.y = hy; well.vx = well.vy = 0; }
          goal = inside ? 1 : 0; rise = WELL_TAU; fall = Math.max(0.05, D.decay);
        } else {
          goal = Math.min(1, stepTrail(D, real, dt, hx, hy, inside)); rise = ENGAGE_TAU; fall = RELAX_S;
        }
        engage += (goal - engage) * (1 - Math.exp(-dt / (goal > engage ? rise : fall)));
        if (goal === 0 && engage < 0.005) engage = 0;
        stepSprings(D, dt, isWell && inside, hx, hy);
        if (!isWell) return fxLive > 0 || pendingStrength > 0;
        const r = Math.max(1, D.radius);
        fxLive = engage > 0 ? 1 : 0;
        fxGpu[0] = fxCx = well.x; fxGpu[1] = fxCy = well.y; fxGpu[2] = engage; fxGpu[3] = 0;
        fxBox[0] = well.x - 3 * r; fxBox[1] = well.y - 3 * r;
        fxBox[2] = well.x + 3 * r; fxBox[3] = well.y + 3 * r;
        return Math.abs(goal - engage) > 1e-3 || Math.hypot(well.vx, well.vy) > 2
          || (inside && Math.hypot(hx - well.x, hy - well.y) > 0.5);
      }

      function frame(ms: number) {
        if (!running) return;
        rafId = requestAnimationFrame(frame);

        // Pause draws while the work shell is hidden (or still 0-sized).
        if (!activeRef.current) {
          stopLoop();
          return;
        }
        if (cssW < 2 || cssH < 2 || gl.isContextLost()) {
          resize();
          if (cssW < 2 || cssH < 2 || gl.isContextLost()) return;
        }

        // Pacing: a frame every `frameMs`, a whole number of vsyncs near 33ms
        // (60Hz: every 2nd, 120Hz: every 4th, 144Hz: every 5th), or near 50ms
        // while idle, with half a vsync of slack for timestamp jitter. vsync
        // is averaged over only
        // the recent single-vsync intervals, so long frames can't inflate it:
        // the old running average crept up under hydration load and let
        // 120/144Hz displays drop to every 3rd vsync, mixing 25ms frames in
        // with the long ones for the first second or two.
        if (rawLastT) {
          rawIntervals[rawIdx] = ms - rawLastT;
          rawIdx = (rawIdx + 1) % rawIntervals.length;
          let m = Infinity;
          for (let i = 0; i < rawIntervals.length; i++) {
            const v = rawIntervals[i];
            if (v > 2 && v < m) m = v;
          }
          let sum = 0, n = 0;
          for (let i = 0; i < rawIntervals.length; i++) {
            const v = rawIntervals[i];
            if (v > 2 && v < m * 1.5) { sum += v; n++; }
          }
          if (n && m < 100) vsync = sum / n;
        }
        rawLastT = ms;
        const target = idle ? IDLE_FRAME_MS : FRAME_MS;
        frameMs = vsync ? vsync * Math.max(1, Math.round(target / vsync)) : target;
        if (lastFrameT && ms - lastFrameT < frameMs - (vsync || 1000 / 60) / 2) return;
        const real = lastFrameT ? (ms - lastFrameT) / 1000 : MAX_DT;
        // Clamped to one paced frame, so a stall (long task, GC, hydration)
        // slows everything for a frame instead of lurching it.
        const dt = Math.min(real, Math.max(MAX_DT, frameMs / 1000));
        lastFrameT = ms;

        const P = paramsRef.current;
        let fxBusy = false;
        if (!reducedMotion) {
          silkTime += dt;
          // A preset switch fades the current effect out, swaps once the new
          // variant is compiled and warmed, then fades it back in.
          const want = P.drift.preset in PRESETS ? P.drift.preset : DEFAULT_PRESET;
          if (want !== preset) {
            fxGain = Math.max(0, fxGain - dt / SWITCH_S);
            if (fxProgram(fxOf(want)) && fxGain === 0) { preset = want; clearFx(); }
          } else if (fxGain < 1) {
            fxGain = Math.min(1, fxGain + dt / SWITCH_S);
          }
          fxBusy = stepFx(P.drift, real, dt) || want !== preset || fxGain < 1;
        }
        const mixTarget = modeRef.current === 1 ? 1 : 0;
        const mixStep = dt / MODE_FADE;
        modeMix = reducedMotion ? mixTarget
          : modeMix < mixTarget ? Math.min(mixTarget, modeMix + mixStep) : Math.max(mixTarget, modeMix - mixStep);

        if (introArmed) startIntro(ms);
        const isIntro = ms < introPhaseEnd;
        if (isIntro && INTRO_DURATION > 0) {
          // Time-based ease-in-out: reaches exactly START_OPACITY at introPhaseEnd
          const rawT = (ms - introPhaseStart) / (introPhaseEnd - introPhaseStart);
          const t = Math.min(rawT, 1);
          const eased = t * t * (3 - 2 * t); // smoothstep
          currentOpacity = eased * START_OPACITY;
        } else {
          // Dim fast, recover medium (time constants ~0.4s / ~0.9s).
          const tau = currentOpacity > targetOpacity ? 0.4 : 0.94;
          currentOpacity += (targetOpacity - currentOpacity) * (1 - Math.exp(-dt / tau));
          if (Math.abs(targetOpacity - currentOpacity) < 1e-3) currentOpacity = targetOpacity;
        }
        if (reducedMotion) currentOpacity = targetOpacity;

        render();
        idle = !fxBusy && modeMix === mixTarget && !isIntro && currentOpacity === targetOpacity;
        if (idle && !reducedMotion) fxProgram(fxOf(preset));
        // Reduced motion: time is frozen, so one frame is the whole picture.
        // Scroll / resize / click / wake restart the loop for a fresh frame.
        if (reducedMotion) stopLoop();
      }

      runSetup();
    }

    return () => {
      _hasMounted = hadMountedBefore;
      window.removeEventListener("intro-replay", onReplay);
      cancelInit();
      cancelAnimationFrame(initRaf);
      lifecycleRef.current = null;
      cancelAnimationFrame(rafId);
      removeListeners();
      teardownGL();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        ...style,
        position: "absolute",
        top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", background: "transparent" }} />
    </div>
  );
}
