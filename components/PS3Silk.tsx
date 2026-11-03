"use client";

import { useEffect, useRef } from "react";
import { useDialKit } from "dialkit";
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
const SILK_DIALS = {
  // Cursor input is a trail of touches sampled from the pointer's speed, so
  // a still hover adds nothing. Each touch bows the ribbons away from it and
  // rises and fades on a sine envelope over `trailDecay`, so the silk parts
  // along the cursor's path like fabric. The same trail is the target of a
  // damped spring on the ribbons' crossing: `driftStrength` x (where the
  // trail is - crossing), easing back to rest a few seconds after it fades.
  drift: {
    trailStrength: [12, 0, 40, 1],      // px, how far the ribbons part around the cursor's path
    trailRadius: [120, 30, 300, 5],     // px, size of each touch
    trailDecay: [1.0, 0.3, 3, 0.05],    // s, life of a touch
    stiffness: [10, 0.5, 40, 0.5],      // spring responsiveness (1/s^2)
    damping: [1.0, 0.2, 2, 0.05],       // damping ratio: 1 settles without overshoot, <1 sways
    driftStrength: [0.13, 0, 0.6, 0.01], // share of the trail's offset the crossing follows
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
const RELAX_S = 3;          // s, how slowly it lets go after the trail fades
const TRAIL_N = 16;          // touches in the ring
const TRAIL_ATTACK = 0.3;   // share of a touch's life spent rising
const TRAIL_SPEED = 900;    // px/s of pointer speed for a full-strength touch
// Rest position of the ribbons' crossing, in the drift's uv (y up).
const CROSS_X = 0.5, CROSS_Y = 0.6;
const DRIFT_Y_MAX = 0.12;   // uv; more squashes the ribbon amplitude visibly

type SilkParams = {
  drift: {
    trailStrength: number; trailRadius: number; trailDecay: number;
    stiffness: number; damping: number; driftStrength: number;
  };
  silk: { speed: number; intensity: number; dotSize: number };
};

const VS = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Pass 1: ribbon brightness. In halftone mode one texel per dot cell (the
// dots only read their cell centre), so the 8 ribbons and the trail are
// evaluated ~9x less often than per pixel. Wave mode needs it per CSS pixel.
// Built twice: with TRAIL while touches are alive, without it otherwise, so
// the idle silk never pays for the trail loop (a uniform-false branch around
// it still slowed every frame on software GL).
const lumaFs = (trail: boolean) => `
precision highp float;
${trail ? "#define TRAIL" : ""}
#define TRAIL_N ${TRAIL_N}
#ifdef TRAIL
uniform vec3  uTrail[TRAIL_N]; // live touches first: xy CSS px (y up), z envelope x strength
uniform float uTrailCount;
uniform vec4  uTrailBox;     // live touches' bounds plus 3 radii (beyond that a push is < 0.02px)
uniform float uTrailInvR2;   // 1 / radius^2
uniform float uTrailGain;    // px of push per unit of d * gaussian
uniform float uTrailMax;     // px
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
  // Each touch moves this cell's sample point toward it along the gradient
  // of a Gaussian, so ribbons near the cursor's path bow away from it. The
  // push is zero at the touch itself and smooth everywhere, so the silk
  // stretches instead of folding or tearing.
#ifdef TRAIL
  if (all(greaterThan(px, uTrailBox.xy)) && all(lessThan(px, uTrailBox.zw))) {
    vec2 push = vec2(0.0);
    for (int k = 0; k < TRAIL_N; k++) {
      if (float(k) >= uTrailCount) break;
      vec3 t = uTrail[k];
      vec2 d = px - t.xy;
      float q = dot(d, d) * uTrailInvR2;
      if (q < 9.0) push += d * (exp(-q) * t.z);
    }
    // Overlapping touches saturate smoothly toward uTrailMax (tanh), so a
    // fast sweep never creases the ribbons where a hard clamp would kick in.
    push *= uTrailGain;
    float l = length(push) / uTrailMax + 1e-6;
    px -= push * ((1.0 - 2.0 / (exp(2.0 * l) + 1.0)) / l);
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

  const dk = useDialKit("PS3Silk", SILK_DIALS as never, {
    id: "ps3-silk-drift-v4",
    persist: { key: "ps3-silk-drift-v4", storage: "localStorage" },
  }) as SilkParams;
  const paramsRef = useRef<SilkParams>(dk);
  useEffect(() => { paramsRef.current = dk; });

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

    // Touch trail and crossing drift (see SILK_DIALS). Pointer in CSS px
    // relative to the hero's top-left (y down), plus its viewport position
    // (cx, cy; lx, ly at the last frame); touches in CSS px, y up, as the
    // shader sees them; drift offset/velocity in uv.
    const ptr = { x: 0, y: 0, cx: 0, cy: 0, lx: 0, ly: 0, over: false };
    const trail = new Float32Array(TRAIL_N * 4);  // x, y, age (s), strength
    const trailGpu = new Float32Array(TRAIL_N * 3);
    const trailBox = [0, 0, 0, 0];
    let trailHead = 0, trailLive = 0, trailCredit = 1, pendingStrength = 0;
    let trailCx = 0, trailCy = 0;
    const drift = { x: 0, y: 0, vx: 0, vy: 0 };
    let engage = 0, springAcc = 0;
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
      let trailWarm = false;

      type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
      type GLState = {
        luma: Prog; trail: Prog; comp: Prog; buf: WebGLBuffer;
        lumaTex: WebGLTexture; lumaFb: WebGLFramebuffer; maskTex: WebGLTexture;
      };
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
      // paint used to flatten the pattern for good). The trail program is
      // warmed later, once the silk first settles, so neither the intro nor
      // the first hover pays for it.
      function* setup(): Generator<void, void, void> {
        const lp = program(lumaFs(false)), tp = program(lumaFs(true)), cp = program(COMPOSITE_FS);
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
        const ribbons = ["uTime", "uCssSize", "uTexel", "uYOffsetPx", "uSpeed", "uDrift", "uColorMax"];
        const C = linked(cp, ["uLuma", "uLumaUv", "uMask", "uMaskUv", "uPxToCss", "uModeMix", "uIntensity", "uIntensityWave", "uHalftoneSize", "uOpacity", "uWaveColor"]);
        gl.useProgram(C.p);
        gl.uniform1i(C.u.uLuma, 0);
        gl.uniform1i(C.u.uMask, 1);
        S = {
          luma: linked(lp, ribbons),
          trail: linked(tp, [...ribbons, "uTrail", "uTrailCount", "uTrailBox", "uTrailInvR2", "uTrailGain", "uTrailMax"]),
          comp: C, buf, lumaTex, lumaFb, maskTex,
        };
        luma = { w: 0, h: 0, texel: 0 };
        mask = { w: 1, h: 1, dirty: true };
        yield;
        warmUp(S.luma);
        yield;
        if (activeRef.current) lifecycleRef.current?.wake();
      }

      function runSetup() {
        cancelAnimationFrame(initRaf);
        trailWarm = false;
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
        const r = Math.max(1, P.drift.trailRadius);
        // One touch's push d/r * exp(-d²/r²) peaks at 0.4289 (at d = r/√2).
        // Peaks above ~0.42r would let the push outrun the distance and
        // fold the silk over itself, so the strength is capped there.
        const peak = Math.min(P.drift.trailStrength, 0.42 * r);
        const live = peak > 0 ? trailLive : 0;
        const L = live ? S.trail : S.luma;
        gl.useProgram(L.p);
        if (live) {
          const m = 3 * r;
          gl.uniform1f(L.u.uTrailCount, live);
          gl.uniform4f(L.u.uTrailBox, trailBox[0] - m, trailBox[1] - m, trailBox[2] + m, trailBox[3] + m);
          gl.uniform3fv(L.u.uTrail, trailGpu.subarray(0, live * 3));
          gl.uniform1f(L.u.uTrailInvR2, 1 / (r * r));
          gl.uniform1f(L.u.uTrailGain, peak / (0.4289 * r));
          gl.uniform1f(L.u.uTrailMax, peak);
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

      // Only records where the pointer is; the frame loop turns its speed
      // into touches.
      function onMouseMove(e: MouseEvent) {
        if (reducedMotion || !activeRef.current || cssW < 2 || cssH < 2) return;
        const x = e.clientX - pageLeft;
        const y = e.clientY + scrollY - pageTop;
        if (x < 0 || x > cssW || y < 0 || y > cssH * 1.15) {
          ptr.over = false;
          return;
        }
        // Speed is taken in viewport space, so scrolling under a still
        // pointer adds nothing.
        if (!ptr.over) { ptr.lx = e.clientX; ptr.ly = e.clientY; ptr.over = true; }
        ptr.cx = e.clientX; ptr.cy = e.clientY;
        ptr.x = x; ptr.y = y;
        startLoop();
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
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("popstate", onPopState);
      };
      teardownGL = () => {
        if (!S || gl.isContextLost()) return;
        gl.deleteProgram(S.luma.p);
        gl.deleteProgram(S.trail.p);
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

      // Touches are laid down at most every life/TRAIL_N seconds, so each
      // lives out its whole envelope before the ring reuses its slot. A
      // touch's strength is the fastest pointer speed seen since the last
      // one. Ages everything, packs the live touches for the shader, and
      // returns their summed strength.
      function stepTrail(real: number, dt: number, life: number) {
        if (ptr.over) {
          const v = Math.hypot(ptr.cx - ptr.lx, ptr.cy - ptr.ly) / Math.max(real, 1e-3);
          ptr.lx = ptr.cx; ptr.ly = ptr.cy;
          pendingStrength = Math.max(pendingStrength, Math.min(1, (v / TRAIL_SPEED) ** 2));
        }
        let n = 0, sum = 0, sx = 0, sy = 0;
        trailBox[0] = trailBox[1] = Infinity;
        trailBox[2] = trailBox[3] = -Infinity;
        for (let k = 0; k < TRAIL_N; k++) {
          const i = k * 4;
          if (trail[i + 3] <= 0) continue;
          const m = (trail[i + 2] += dt) / life;
          if (m >= 1) { trail[i + 3] = 0; continue; }
          const env = m < TRAIL_ATTACK
            ? Math.sin((m / TRAIL_ATTACK) * Math.PI / 2)
            : Math.sin((1 - (m - TRAIL_ATTACK) / (1 - TRAIL_ATTACK)) * Math.PI / 2);
          const s = env * trail[i + 3];
          trailGpu[n * 3] = trail[i]; trailGpu[n * 3 + 1] = trail[i + 1]; trailGpu[n * 3 + 2] = s;
          n++; sum += s; sx += s * trail[i]; sy += s * trail[i + 1];
          trailBox[0] = Math.min(trailBox[0], trail[i]); trailBox[1] = Math.min(trailBox[1], trail[i + 1]);
          trailBox[2] = Math.max(trailBox[2], trail[i]); trailBox[3] = Math.max(trailBox[3], trail[i + 1]);
        }
        trailCredit = Math.min(1, trailCredit + (dt * TRAIL_N) / life);
        if (trailCredit >= 1) {
          if (pendingStrength > 0.02) {
            trailCredit -= 1;
            const i = trailHead * 4;
            trail[i] = ptr.x; trail[i + 1] = Math.floor(cssH) - ptr.y; trail[i + 2] = 0; trail[i + 3] = pendingStrength;
            trailHead = (trailHead + 1) % TRAIL_N;
          }
          pendingStrength = 0;
        }
        trailLive = n;
        if (sum > 0) { trailCx = sx / sum; trailCy = sy / sum; }
        return sum;
      }

      // Damped spring on the crossing offset, integrated in fixed steps so
      // its feel doesn't depend on frame rate or dropped frames. The pull
      // engages with the trail's strength and keeps aiming at where the
      // trail last was while it lets go.
      function stepDrift(D: SilkParams["drift"], dt: number, energy: number) {
        const goal = Math.min(1, energy);
        engage += (goal - engage) * (1 - Math.exp(-dt / (goal > engage ? ENGAGE_TAU : RELAX_S)));
        if (goal === 0 && engage < 0.01) engage = 0;
        let tx = 0, ty = 0;
        if (engage > 0 && cssW >= 2 && cssH >= 2) {
          const w = D.driftStrength * engage;
          tx = (w * (trailCx - CROSS_X * cssW)) / cssW;
          ty = clamp((w * (trailCy - CROSS_Y * cssH)) / cssH, -DRIFT_Y_MAX, DRIFT_Y_MAX);
        }
        const k = Math.max(0.01, D.stiffness);
        const c = 2 * Math.max(0, D.damping) * Math.sqrt(k);
        springAcc += dt;
        while (springAcc >= SPRING_STEP) {
          springAcc -= SPRING_STEP;
          drift.vx += (k * (tx - drift.x) - c * drift.vx) * SPRING_STEP;
          drift.vy += (k * (ty - drift.y) - c * drift.vy) * SPRING_STEP;
          drift.x += drift.vx * SPRING_STEP;
          drift.y += drift.vy * SPRING_STEP;
        }
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
        if (!reducedMotion) {
          silkTime += dt;
          stepDrift(P.drift, dt, stepTrail(real, dt, Math.max(0.05, P.drift.trailDecay)));
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
        idle = trailLive === 0 && pendingStrength === 0 && modeMix === mixTarget
          && !isIntro && currentOpacity === targetOpacity;
        if (idle && !trailWarm && S && !reducedMotion) {
          trailWarm = true;
          warmUp(S.trail);
        }
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
