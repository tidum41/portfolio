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
  drift: {
    strength: [0.08, 0, 0.3, 0.005],    // max crossing shift (uv) at full build-up
    buildup: [0.9, 0.1, 3, 0.05],       // build-up per hero-width of pointer travel
    smoothing: [1.0, 0.2, 5, 0.05],     // s, time constant the crossing eases toward its target
    relax: [8, 2, 30, 0.5],             // s, time constant the build-up fades after you stop
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
// 30fps, evenly paced. The ribbons and the drift move well under a pixel
// per frame at 30, while 60 doubles the GPU/compositor work the rest of the
// page (scroll, cards, cursor trail) competes with.
const FRAME_MS = 1000 / 30;
const MASK_TEXEL = 4;       // CSS px per scrim mask texel; the mask is a wide blur

type SilkParams = {
  drift: { strength: number; buildup: number; smoothing: number; relax: number };
  silk: { speed: number; intensity: number; dotSize: number };
};

const VS = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Pass 1: ribbon brightness. In halftone mode one texel per dot cell (the
// dots only read their cell centre), so the 8 ribbons are evaluated ~9x less
// often than per pixel. Wave mode needs it per CSS pixel.
const LUMA_FS = `
precision highp float;
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
  vec2 uv = gl_FragCoord.xy * uTexel / uCssSize;
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
    id: "ps3-silk-drift-v2",
    persist: { key: "ps3-silk-drift-v2", storage: "localStorage" },
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

    // Slow crossing drift. `charge` (0..1) builds with pointer travel over
    // the hero and decays on a long time constant; the crossing offset eases
    // toward (pointer - centre) * strength * charge on the smoothing time
    // constant, so it is eased but readable within a second or two of play.
    const ptr = { x: 0.5, y: 0.5, px: -1, py: -1 };
    const drift = { x: 0, y: 0 };
    let charge = 0;
    let modeMix = modeRef.current === 1 ? 1 : 0; // 1 = halftone
    let rafId = 0, lastT = 0;
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

    // Reduced motion: keep the slow ambient wave loop (low-amplitude, not the
    // kind of motion this preference is meant to suppress), but skip the
    // entrance fade and the cursor drift below — those are the
    // faster, more attention-grabbing pieces.
    const reducedMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    const INTRO_DURATION = isFirstLoad && !reducedMotion ? (introTimings.patternDuration * 1000) : 0;
    let introPhaseStart = performance.now();
    let introPhaseEnd = introPhaseStart + INTRO_DURATION;

    function onReplay() {
      const dur = introTimings.patternDuration * 1000;
      currentOpacity = 0;
      introPhaseStart = performance.now();
      introPhaseEnd   = introPhaseStart + dur;
    }
    window.addEventListener("intro-replay", onReplay);

    // Defer shader compilation on first load only, so it doesn't compete with the
    // page-transition animation. On repeat navigations, init immediately — the
    // shader is already GPU/driver-cached from the earlier compile, so there's
    // no jank to protect against, and any delay would just read as a stutter.
    const initTimer = setTimeout(() => {
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
      let vsync = 1000 / 60, rawLastT = 0;

      type GLState = {
        lumaProg: WebGLProgram; compProg: WebGLProgram; buf: WebGLBuffer;
        lumaTex: WebGLTexture; lumaFb: WebGLFramebuffer; maskTex: WebGLTexture;
        lu: Record<string, WebGLUniformLocation | null>;
        cu: Record<string, WebGLUniformLocation | null>;
      };
      let S: GLState | null = null;
      let luma = { w: 0, h: 0, texel: 0 };
      let mask = { w: 1, h: 1, dirty: true };

      function compile(src: string, type: number) {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
        return s;
      }
      function program(fs: string, names: string[]) {
        const p = gl.createProgram()!;
        gl.attachShader(p, compile(VS, gl.VERTEX_SHADER));
        gl.attachShader(p, compile(fs, gl.FRAGMENT_SHADER));
        gl.bindAttribLocation(p, 0, "aPos");
        gl.linkProgram(p);
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

      function setupGL() {
        const L = program(LUMA_FS, ["uTime", "uCssSize", "uTexel", "uYOffsetPx", "uSpeed", "uDrift", "uColorMax"]);
        const C = program(COMPOSITE_FS, ["uLuma", "uLumaUv", "uMask", "uMaskUv", "uPxToCss", "uModeMix", "uIntensity", "uIntensityWave", "uHalftoneSize", "uOpacity", "uWaveColor"]);
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
        gl.useProgram(C.p);
        gl.uniform1i(C.u.uLuma, 0);
        gl.uniform1i(C.u.uMask, 1);
        gl.clearColor(0, 0, 0, 0);
        S = { lumaProg: L.p, compProg: C.p, buf, lumaTex, lumaFb, maskTex, lu: L.u, cu: C.u };
        luma = { w: 0, h: 0, texel: 0 };
        mask = { w: 1, h: 1, dirty: true };
      }

      function ensureLuma(texel: number) {
        if (!S) return;
        const w = texel === 1 ? Math.floor(cssW) : Math.ceil(cssW / texel);
        const h = texel === 1 ? Math.floor(cssH) : Math.ceil(cssH / texel);
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

      function render(ms: number) {
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
        gl.useProgram(S.lumaProg);
        // Reduced motion: frozen time, no cursor input, one frame (see frame()).
        gl.uniform1f(S.lu.uTime, reducedMotion ? 0 : ms * 0.001);
        gl.uniform2f(S.lu.uCssSize, Math.floor(cssW), Math.floor(cssH));
        gl.uniform1f(S.lu.uTexel, texel);
        gl.uniform1f(S.lu.uYOffsetPx, Y_OFFSET);
        gl.uniform1f(S.lu.uSpeed, P.silk.speed);
        gl.uniform2f(S.lu.uDrift, reducedMotion ? 0 : drift.x, reducedMotion ? 0 : drift.y);
        gl.uniform1f(S.lu.uColorMax, Math.max(wc[0], wc[1], wc[2]));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(S.compProg);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, S.lumaTex);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, S.maskTex);
        gl.uniform2f(S.cu.uLumaUv, 1 / (luma.w * texel), 1 / (luma.h * texel));
        gl.uniform2f(S.cu.uMaskUv, 1 / (mask.w * MASK_TEXEL), 1 / (mask.h * MASK_TEXEL));
        gl.uniform2f(S.cu.uPxToCss, 1 / RENDER_SCALE, 1 / RENDER_SCALE);
        gl.uniform1f(S.cu.uModeMix, modeMix);
        gl.uniform1f(S.cu.uIntensity, P.silk.intensity);
        gl.uniform1f(S.cu.uIntensityWave, INTENSITY_WAVE);
        gl.uniform1f(S.cu.uHalftoneSize, P.silk.dotSize);
        gl.uniform1f(S.cu.uOpacity, currentOpacity);
        gl.uniform3f(S.cu.uWaveColor, wc[0], wc[1], wc[2]);
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
        render(performance.now());
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

      function onMouseMove(e: MouseEvent) {
        if (!activeRef.current || cssW < 2 || cssH < 2) return;
        const x = (e.clientX - pageLeft) / cssW;
        const y = 1.0 - (e.clientY + scrollY - pageTop) / cssH;
        const inside = x >= 0 && x <= 1 && y >= -0.15 && y <= 1;
        if (!inside || reducedMotion) { ptr.px = -1; return; }
        if (ptr.px >= 0) {
          const travel = Math.min(0.1, Math.hypot(x - ptr.px, (y - ptr.py) * cssH / cssW));
          charge = Math.min(1, charge + travel * paramsRef.current.drift.buildup);
        }
        ptr.px = x; ptr.py = y; ptr.x = x; ptr.y = y;
        if (!running && visible) startLoop();
      }

      function onPopState() {
        targetOpacity = currentOpacity = START_OPACITY;
      }

      function startLoop() {
        if (running || !S || !activeRef.current || !visible) return;
        running = true;
        lastT = 0;
        rawLastT = 0;
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

      // Offscreen (scrolled past the hero) = no frames at all.
      const io = new IntersectionObserver((entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        if (visible) startLoop(); else stopLoop();
      }, { rootMargin: "64px 0px" });
      io.observe(wrapper);

      const unsubscribeScrim = subscribeHeroScrim(() => {
        mask.dirty = true;
        if (!running) render(performance.now());
      });

      const onContextLost = (e: Event) => {
        e.preventDefault();
        stopLoop();
        S = null;
      };
      const onContextRestored = () => {
        setupGL();
        lifecycleRef.current?.wake();
      };
      canvas.addEventListener("webglcontextlost", onContextLost, false);
      canvas.addEventListener("webglcontextrestored", onContextRestored, false);

      window.addEventListener("resize", scheduledResize);
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("popstate", onPopState);
      removeListeners = () => {
        ro.disconnect();
        io.disconnect();
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
        gl.deleteProgram(S.lumaProg);
        gl.deleteProgram(S.compProg);
        gl.deleteBuffer(S.buf);
        gl.deleteTexture(S.lumaTex);
        gl.deleteTexture(S.maskTex);
        gl.deleteFramebuffer(S.lumaFb);
        S = null;
      };

      setupGL();

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
        if (!(isFirstLoad && !reducedMotion && performance.now() < introPhaseEnd)) {
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

        // Paced on rAF timestamps with half a vsync of slack, so the cadence
        // is even on any refresh rate (60Hz: every 2nd vsync, 120Hz: every
        // 4th). The old strict `ms - lastT < 33.3` test skipped a frame at
        // random whenever vsync jitter landed just under the interval, which
        // alternated 33/50ms (or 33/42ms at 120Hz) and read as judder.
        const raw = rawLastT ? ms - rawLastT : 0;
        rawLastT = ms;
        if (raw > 0 && raw < 50) vsync += (raw - vsync) * 0.1;
        const since = lastT ? ms - lastT : FRAME_MS;
        if (lastT && since < FRAME_MS - vsync / 2) return;
        lastT = ms;
        const dt = Math.min(0.1, since / 1000);

        // Exponential smoothing with real time constants (frame-rate
        // independent): charge relaxes over `relax` s, the crossing eases
        // toward its target over `smoothing` s. Max shift = strength.
        const P = paramsRef.current;
        charge *= Math.exp(-dt / Math.max(0.5, P.drift.relax));
        if (charge < 1e-4) charge = 0;
        const amt = P.drift.strength * charge;
        const tx = (ptr.x - 0.5) * 2 * amt;
        const ty = clamp(ptr.y - 0.6, -0.5, 0.5) * 2 * amt;
        const k = 1 - Math.exp(-dt / Math.max(0.2, P.drift.smoothing));
        drift.x += (tx - drift.x) * k;
        drift.y += (ty - drift.y) * k;
        const mixTarget = modeRef.current === 1 ? 1 : 0;
        const mixStep = dt / MODE_FADE;
        modeMix = reducedMotion ? mixTarget
          : modeMix < mixTarget ? Math.min(mixTarget, modeMix + mixStep) : Math.max(mixTarget, modeMix - mixStep);

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
        }
        if (reducedMotion) currentOpacity = targetOpacity;

        render(ms);
        // Reduced motion: time is frozen, so one frame is the whole picture.
        // Scroll / resize / click / wake restart the loop for a fresh frame.
        if (reducedMotion) stopLoop();
      }

      // Start only if we're currently the visible work route; otherwise wait
      // for the active→true wake. Avoids the old path of sizing to 0×0 on
      // about/archive first-paint and then permanently flattening the pattern.
      if (activeRef.current) {
        requestAnimationFrame(() => lifecycleRef.current?.wake());
      }
    }, isFirstLoad ? 150 : 0);

    return () => {
      _hasMounted = hadMountedBefore;
      window.removeEventListener("intro-replay", onReplay);
      clearTimeout(initTimer);
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
