"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useDialKit } from "dialkit";
import { introTimings } from "@/lib/introTimings";

// Module-level flag: persists during client-side nav, resets on page reload
let _hasMounted = false;

const FRAME_MS = 1000 / 30; // 30fps cap

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
  intensity?: number;
  mouseStrength?: number;
  yOffset?: number;
  waveColor?: string;
  mode?: number;
  style?: React.CSSProperties;
  /** When false (work shell hidden via display:none), pause rendering and
   *  never write a 0×0 drawing buffer — that path is what flattened the
   *  pattern after navigating away from "/" and coming back. */
  active?: boolean;
}

/** Wrap physics + distinct AM print; crest glow = finer dots. */
const V9 = {
  intensity: 0.19,
  mouseStrength: 0.12,
  yOffset: 49,
  speed: 0.92,
  startOpacity: 0.33,
  printPitch: 3.4,
  parallax: 0.065,
  crestBoost: 0.14,
  harmonic: 0.36,
  sheetSoft: 0.6,
  // Print-forward so dots read clearly; silk stays the coverage plate
  silkMix: 0.78,
  contrast: 1.35,
  inkSoft: 0.32,
  inkDensity: 0.58,
  minDot: 0.028,
};

export default function PS3Silk({
  intensity = V9.intensity,
  mouseStrength = V9.mouseStrength,
  yOffset = V9.yOffset,
  waveColor = "#ffffff",
  mode: initialMode = 1,
  style,
  active = true,
}: PS3SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(initialMode);
  const activeRef = useRef(active);
  activeRef.current = active;
  const lifecycleRef = useRef<{ wake: () => void; pause: () => void } | null>(null);
  const [mode, setMode] = useState(initialMode);

  const dk = useDialKit("PS3Silk", {
    intensity:     [intensity,           0,    1.0],
    mouseStrength: [mouseStrength,       0,    0.5],
    yOffset:       [yOffset,             -50,  100],
    // Maps to print pitch in wrap+print mode
    halftoneSize:  [V9.printPitch,       2.2,  10,  0.1],
    speed:         [V9.speed,            0,    4],
    endOpacity:    [0.12,                0,    0.5, 0.01],
  });

  const intensityRef    = useRef(intensity);
  const mouseStrRef     = useRef(mouseStrength);
  const yOffsetRef      = useRef(yOffset);
  const waveColorRef    = useRef<[number, number, number]>(hexToRgb(waveColor));
  const halftSizeRef    = useRef(V9.printPitch);
  const speedRef        = useRef(V9.speed);
  const endOpacityRef   = useRef(0.12);

  // Sync DialKit live values into refs each frame
  useEffect(() => { intensityRef.current = dk.intensity; }, [dk.intensity]);
  useEffect(() => { mouseStrRef.current = dk.mouseStrength; }, [dk.mouseStrength]);
  useEffect(() => { yOffsetRef.current = dk.yOffset; }, [dk.yOffset]);
  useEffect(() => { halftSizeRef.current = dk.halftoneSize; }, [dk.halftoneSize]);
  useEffect(() => { speedRef.current = dk.speed; }, [dk.speed]);
  useEffect(() => { endOpacityRef.current = dk.endOpacity; }, [dk.endOpacity]);
  useEffect(() => { waveColorRef.current = hexToRgb(waveColor); }, [waveColor]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Wake after paint so about→work isn't competing with layout + Mux resume
  // on the same frame. Pause immediately when leaving.
  useEffect(() => {
    if (!active) {
      lifecycleRef.current?.pause();
      return;
    }
    let cancelled = false;
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) lifecycleRef.current?.wake();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(outer);
    };
  }, [active]);

  // ps3-update event
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d) return;
      if (d.intensity    !== undefined) intensityRef.current  = d.intensity;
      if (d.mouseStrength !== undefined) mouseStrRef.current  = d.mouseStrength;
      if (d.yOffset      !== undefined) yOffsetRef.current    = d.yOffset;
      if (d.halftoneSize !== undefined) halftSizeRef.current  = d.halftoneSize;
      if (d.speed        !== undefined) speedRef.current      = d.speed;
      if (d.waveColor    !== undefined) {
        waveColorRef.current = Array.isArray(d.waveColor)
          ? (d.waveColor as [number, number, number])
          : hexToRgb(d.waveColor);
      }
      if (d.mode !== undefined) {
        modeRef.current = d.mode;
        startTransition(() => setMode(d.mode));
      }
    };
    window.addEventListener("ps3-update", handler);
    return () => window.removeEventListener("ps3-update", handler);
  }, []);

  // click-to-cycle mode — ignore rabbit-holes trigger/hover (and any click
  // already swallowed by RabbitHoleVideo's mobile dismiss handler) so opening
  // or closing the video popup never flips the wave pattern.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const el = e.target as Element | null;
      if (el?.closest?.("a, button, [role='button'], #rh-trigger, #rh-hover-zone, #rh-rabbit-wrapper")) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        startTransition(() => {
          setMode(m => {
            const next = m === 0 ? 1 : 0;
            modeRef.current = next;
            window.dispatchEvent(new CustomEvent("ps3-mode-sync", { detail: { mode: next } }));
            return next;
          });
        });
      }
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

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let rafId = 0, lastT = 0;
    const START_OPACITY = V9.startOpacity;
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
    // entrance fade and the cursor-reactive ripple/warp below — those are the
    // faster, more attention-grabbing pieces.
    const reducedMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // First-ever mount this session: start transparent, RAF loop fades in slowly.
    // Every later page nav: appear at full resting opacity immediately — no fade, no gap.
    if (isFirstLoad && !reducedMotion) {
      wrapper.style.opacity = "0";
    } else {
      currentOpacity = START_OPACITY;
      targetOpacity  = START_OPACITY;
      wrapper.style.opacity = String(START_OPACITY);
    }

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const ease3 = (t: number) => t * t * t;

    let removeListeners = () => {};
    let glRef: WebGLRenderingContext | null = null;
    let glProg: WebGLProgram | null = null;
    let running = false;

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
      wrapper.style.opacity = "0";
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
        antialias: false,
        preserveDrawingBuffer: false,
      });
      if (!_glNullable) return;
      const gl = _glNullable as WebGLRenderingContext;
      glRef = gl;
      const glCtx = gl;

      // Cached on resize/scroll and reused by onMouseMove below, instead of
      // calling getBoundingClientRect() on every raw mousemove event — that
      // forces a synchronous layout read well over 60x/second on a modern
      // trackpad/high-poll mouse, exactly while a visitor is interacting
      // with the hero.
      let wrapperRect: DOMRect | null = null;

      // Match lab canvas sizing: device pixels (capped) so print pitch / soft
      // edges / yOffset stay in the same fragment units DialKit was tuned in.
      // Shipping CSS-pixel buffers made pitch 6.3 read ~2× chunkier on retina
      // and doubled the UV y-nudge vs the lab look.
      let bufferDpr = 1;

      function resize() {
        const rect = wrapperRef.current?.getBoundingClientRect();
        wrapperRect = rect ?? null;
        if (!rect || !canvas) return;
        // Never write a 0×0 (or near-zero) drawing buffer. The persistent work
        // shell hides via display:none on non-/ routes, which reports 0×0 here;
        // assigning that size is what made the pattern go flat/empty on return.
        bufferDpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(0, Math.floor(rect.width * bufferDpr));
        const h = Math.max(0, Math.floor(rect.height * bufferDpr));
        if (w < 2 || h < 2) return;
        if (canvas.width === w && canvas.height === h) {
          glCtx.viewport(0, 0, w, h);
          return;
        }
        canvas.width = w;
        canvas.height = h;
        glCtx.viewport(0, 0, w, h);
        // Reassigning canvas.width/height clears the WebGL drawing buffer to
        // transparent — the only thing that ever repaints it otherwise is the
        // 30fps-throttled frame() loop below, which can lag up to a frame (or
        // more, if resize events keep arriving faster than it catches up)
        // behind. That gap between "buffer cleared" and "next scheduled
        // redraw" is what read as a flicker during a drag-resize. Redrawing
        // synchronously, right here, closes it — draw() is only defined once
        // the program/buffer exist (below), guarded via `buf`.
        if (buf && posLoc >= 0) draw(performance.now());
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

      function updateTarget() {
        // getBoundingClientRect() is viewport-relative, so the resize-only
        // cache above would go stale as soon as the page scrolls without the
        // wrapper's own size changing. This already runs once per scroll
        // event (far less often than raw mousemove), so refreshing it here
        // keeps onMouseMove's cached rect correct without reintroducing a
        // per-mousemove layout read.
        wrapperRect = wrapperRef.current?.getBoundingClientRect() ?? null;
        const scrollY    = window.scrollY || 0;
        const fadeStart  = window.innerHeight * 0.04;  // ~36px at 900px vh
        const fadeEnd    = window.innerHeight * 0.12;  // ~108px
        const endOp      = endOpacityRef.current;
        targetOpacity = START_OPACITY + (endOp - START_OPACITY) *
          ease3(clamp((scrollY - fadeStart) / (fadeEnd - fadeStart), 0, 1));
      }

      function onMouseMove(e: MouseEvent) {
        if (!activeRef.current) return;
        const rect = wrapperRect;
        if (!rect || rect.width < 2 || rect.height < 2) return;
        mouse.tx = (e.clientX - rect.left) / rect.width;
        mouse.ty = 1.0 - (e.clientY - rect.top) / rect.height;
      }

      function onPopState() {
        targetOpacity = currentOpacity = START_OPACITY;
        if (wrapper) wrapper.style.opacity = String(START_OPACITY);
      }

      // Declared early so wake/start helpers (assigned after GL setup) can close
      // over them; filled in once the program + quad buffer exist.
      let posLoc = -1;
      let buf: WebGLBuffer | null = null;

      function startLoop() {
        if (running) return;
        running = true;
        lastT = 0;
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
        if (canvas.width >= 2 && canvas.height >= 2) startLoop();
      });
      ro.observe(wrapper);

      const onContextLost = (e: Event) => {
        e.preventDefault();
        stopLoop();
      };
      const onContextRestored = () => {
        lifecycleRef.current?.wake();
      };
      canvas.addEventListener("webglcontextlost", onContextLost, false);
      canvas.addEventListener("webglcontextrestored", onContextRestored, false);

      window.addEventListener("resize", scheduledResize);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("scroll", updateTarget, { passive: true });
      window.addEventListener("popstate", onPopState);
      removeListeners = () => {
        ro.disconnect();
        lifecycleRef.current = null;
        stopLoop();
        canvas.removeEventListener("webglcontextlost", onContextLost, false);
        canvas.removeEventListener("webglcontextrestored", onContextRestored, false);
        window.removeEventListener("resize", scheduledResize);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("scroll", updateTarget);
        window.removeEventListener("popstate", onPopState);
      };

      const VS = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos,0.0,1.0); }`;
      // Lab v9 wrap + crest print — morph never runs in production (perf).
      // mode 0 = pure silk sheets; mode 1 = silk + print material (default).
      const FS = `
precision highp float;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uIntensity;
uniform float uMouseStrength;
uniform float uAspect;
uniform float uYOffsetPx;
uniform int   uMode;
uniform float uHalftoneSize;
uniform vec3  uWaveColor;
uniform float uSpeed;

const float kParallax   = ${V9.parallax.toFixed(3)};
const float kCrestBoost = ${V9.crestBoost.toFixed(3)};
const float kHarmonic   = ${V9.harmonic.toFixed(3)};
const float kSheetSoft  = ${V9.sheetSoft.toFixed(3)};
const float kSilkMix    = ${V9.silkMix.toFixed(3)};
const float kContrast   = ${V9.contrast.toFixed(3)};
const float kInkSoft    = ${V9.inkSoft.toFixed(3)};
const float kInkDensity = ${V9.inkDensity.toFixed(3)};
const float kMinDot     = ${V9.minDot.toFixed(3)};

float waveBand(vec2 uv, float uvx, float spd, float freq, float amp,
  float phase, float cy, float width, float sharp, bool flip,
  float paraSign, float harmPhase) {
  float md = length(uv - uMouse);
  float mnudge = smoothstep(0.45, 0.0, md) * uMouseStrength;
  float px = uvx + paraSign * kParallax * (uv.x - 0.5) * 2.0;
  float angle = uTime * uSpeed * spd * freq * -1.0 + (phase + px + mnudge) * 2.0;
  float harm = sin(angle * 2.0 + harmPhase) * amp * kHarmonic * 0.35;
  float wy = sin(angle) * amp + harm + cy;
  float dy = wy - uv.y;
  float dist = abs(dy);
  if (flip) { if (dy > 0.0) dist *= 4.0; }
  else       { if (dy < 0.0) dist *= 4.0; }
  float softW = mix(width * 1.5, width * 1.9, kSheetSoft);
  float softPow = mix(sharp, sharp * 0.68, kSheetSoft);
  float s = smoothstep(softW, 0.0, dist);
  return pow(s, softPow);
}

float sampleSilk(vec2 uv) {
  float aspectScale = uAspect / 2.414;
  float uvx = uv.x * aspectScale;
  float c = 0.0;
  c += waveBand(uv,uvx,0.18,0.22,0.32,0.00,0.62,0.090,18.0,false, 1.00, 0.0) * 0.90;
  c += waveBand(uv,uvx,0.38,0.42,0.24,0.00,0.62,0.085,20.0,false, 0.55, 1.2) * 0.68;
  c += waveBand(uv,uvx,0.28,0.62,0.20,0.00,0.62,0.042,28.0,false, 0.25, 2.4) * 0.38;
  c += waveBand(uv,uvx,0.12,0.18,0.14,0.00,0.62,0.065,22.0,false, 0.80, 0.6) * 0.16;
  c += waveBand(uv,uvx,0.14,0.28,0.14,0.00,0.58,0.095,20.0,true, -0.90, 1.7) * 0.84;
  c += waveBand(uv,uvx,0.33,0.39,0.11,0.00,0.58,0.088,22.0,true, -0.50, 3.1) * 0.62;
  c += waveBand(uv,uvx,0.48,0.50,0.09,0.00,0.56,0.040,30.0,true, -0.30, 0.9) * 0.32;
  c += waveBand(uv,uvx,0.22,0.57,0.08,0.00,0.52,0.160,18.0,true, -1.10, 2.0) * 0.14;
  return clamp(c, 0.0, 1.0);
}

float inkRadius(float coverage, float pitch) {
  float t = clamp(coverage, 0.0, 1.0);
  if (t < kMinDot) return 0.0;
  return pitch * 0.5 * sqrt(pow(t, kContrast));
}

// AM dot layer at a given pitch — silk coverage is the wave plate
float amDot(vec2 frag, float pitch, float covBoost) {
  pitch = max(pitch, 1.35);
  vec2 cell = floor(frag / pitch);
  vec2 centerFrag = (cell + 0.5) * pitch;
  vec2 centerUV = centerFrag / uResolution;
  centerUV.y += uYOffsetPx / uResolution.y;
  float cellSilk = sampleSilk(centerUV);
  float cellLight = cellSilk * uIntensity * 4.5;
  float cursorProx = smoothstep(0.38, 0.0, length(centerUV - uMouse));
  float cellCov = clamp(
    cellLight - 0.03 + cursorProx * uMouseStrength * 1.55 + covBoost,
    0.0, 1.3
  );
  float soft = max(kInkSoft * (pitch / 3.4), 0.22);
  float r = inkRadius(cellCov, pitch);
  float d = length(frag - centerFrag);
  float dot = smoothstep(r + soft, r - soft, d);
  float vis = smoothstep(kMinDot, kMinDot + 0.045, cellCov);
  // Keep dots on the ribbon — wave physics gates the screen
  float plate = smoothstep(0.015, 0.14, cellSilk);
  return dot * vis * plate;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uResolution;
  uv.y += uYOffsetPx / uResolution.y;

  float silkLuma = sampleSilk(uv);
  float waveLight = silkLuma * uIntensity * 4.5;
  float crest = pow(clamp(silkLuma, 0.0, 1.0), 1.35);

  // mode 1 = print (AM on wave plate); mode 0 = continuous wave sheets
  float mixAmt = (uMode == 1) ? kSilkMix : 0.0;
  // In print mode, dial back continuous crest glow — glow becomes fine dots
  float silkGlow = kCrestBoost * crest * 0.85 * (1.0 - mixAmt * 0.92);
  float silkA = clamp(waveLight * (1.05 + silkGlow), 0.0, 1.0);
  float a = silkA;

  if (mixAmt > 0.001) {
    float bodyPitch = max(uHalftoneSize, 1.5);
    // Crest / glow layer: smaller halftone cells riding the bright ridges
    float glowPitch = max(bodyPitch * 0.45, 1.4);
    float bodyA = amDot(frag, bodyPitch, 0.0);
    float glowA = amDot(frag, glowPitch, 0.06);
    float crestW = smoothstep(0.18, 0.55, silkLuma);
    // Distinct AM field shaped by wrap; fine dots build the luminous crests
    float printA = max(bodyA, glowA * crestW * 1.25);
    printA = max(printA, bodyA * 0.85);

    a = mix(silkA * 0.18, printA, mixAmt);
    // Thin continuous whisper so sheets still wrap under the screen
    a = max(a, silkA * (1.0 - mixAmt) * 0.22);
  }

  vec3 col = uWaveColor * mix(0.82, kInkDensity, mixAmt);
  gl_FragColor = vec4(col * a, a);
}`;

      function compile(src: string, type: number) {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
        return s;
      }

      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(VS, gl.VERTEX_SHADER));
      gl.attachShader(prog, compile(FS, gl.FRAGMENT_SHADER));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      glProg = prog;

      posLoc                  = gl.getAttribLocation(prog, "aPos");
      const uTimeLoc          = gl.getUniformLocation(prog, "uTime");
      const uResLoc           = gl.getUniformLocation(prog, "uResolution");
      const uMouseLoc         = gl.getUniformLocation(prog, "uMouse");
      const uIntLoc           = gl.getUniformLocation(prog, "uIntensity");
      const uMStrLoc          = gl.getUniformLocation(prog, "uMouseStrength");
      const uAspLoc           = gl.getUniformLocation(prog, "uAspect");
      const uYOfsLoc          = gl.getUniformLocation(prog, "uYOffsetPx");
      const uModeLoc          = gl.getUniformLocation(prog, "uMode");
      const uHtSizeLoc        = gl.getUniformLocation(prog, "uHalftoneSize");
      const uWaveColorLoc     = gl.getUniformLocation(prog, "uWaveColor");
      const uSpeedLoc         = gl.getUniformLocation(prog, "uSpeed");

      // Sets every uniform from current state and paints one frame. Shared by
      // frame()'s regular throttled loop and resize()'s immediate post-resize
      // repaint (see resize() above) — both just need "paint whatever the
      // current state is right now," so there's one definition of what that
      // means instead of two copies drifting apart.
      function draw(ms: number) {
        const wc = waveColorRef.current;
        // Reduced-motion: freeze the shader's time input instead of feeding
        // it the running clock, so the wave pattern still renders (just as a
        // static frame) rather than keeping the animation loop's only
        // visible effect running at full speed regardless of the preference.
        gl.uniform1f(uTimeLoc, reducedMotion ? 0 : ms * 0.001);
        gl.uniform2f(uResLoc, canvas.width, canvas.height);
        gl.uniform2f(uMouseLoc, mouse.x, mouse.y);
        gl.uniform1f(uIntLoc, intensityRef.current);
        gl.uniform1f(uMStrLoc, reducedMotion ? 0 : mouseStrRef.current);
        gl.uniform1f(uAspLoc, canvas.height > 0 ? canvas.width / canvas.height : 2.414);
        // Lab dial yOffset=49 was tuned fullscreen. Scale so UV nudge matches
        // that fraction inside the shorter hero band (not 49/heroHeight).
        const cssH = wrapperRect?.height || (bufferDpr > 0 ? canvas.height / bufferDpr : canvas.height);
        const vh = typeof window !== "undefined" ? Math.max(window.innerHeight, 1) : cssH;
        gl.uniform1f(uYOfsLoc, yOffsetRef.current * (cssH / vh));
        gl.uniform1i(uModeLoc, modeRef.current);
        gl.uniform1f(uHtSizeLoc, halftSizeRef.current);
        gl.uniform3f(uWaveColorLoc, wc[0], wc[1], wc[2]);
        gl.uniform1f(uSpeedLoc, speedRef.current);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      // Called when the work route becomes visible again (and once at init if
      // already active). Re-measure against a real box and rebind GL state so
      // the pattern keeps intensity / halftone / aspect after a round-trip.
      const wake = () => {
        if (glCtx.isContextLost()) return;
        resize();
        updateTarget();
        // Snap opacity to the scroll-derived target — no leftover intro/
        // hidden-state value that would wash the pattern out.
        if (!(isFirstLoad && !reducedMotion && performance.now() < introPhaseEnd)) {
          currentOpacity = targetOpacity;
          if (wrapper) wrapper.style.opacity = String(Math.max(0, Math.min(1, currentOpacity)));
        }
        if (glProg && buf) {
          glCtx.useProgram(glProg);
          glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buf);
          glCtx.enableVertexAttribArray(posLoc);
          glCtx.vertexAttribPointer(posLoc, 2, glCtx.FLOAT, false, 0, 0);
        }
        startLoop();
      };
      // Stop RAF and collapse the drawing buffer so a full-hero GPU surface
      // isn't retained while PersistentWorkShell is display:none on other
      // routes. wake() remeasures and restores size on return.
      const pause = () => {
        stopLoop();
        if (canvas.width > 1 || canvas.height > 1) {
          canvas.width = 1;
          canvas.height = 1;
          if (!glCtx.isContextLost()) glCtx.viewport(0, 0, 1, 1);
        }
      };
      lifecycleRef.current = { wake, pause };

      function frame(ms: number) {
        if (!running) return;
        rafId = requestAnimationFrame(frame);

        // Pause draws while the work shell is hidden (or still 0-sized). Keep
        // the RAF chain alive only while active so wake() doesn't need to
        // fight a skipped loop; when inactive, stopLoop() clears it entirely.
        if (!activeRef.current) {
          stopLoop();
          return;
        }
        if (canvas.width < 2 || canvas.height < 2 || glCtx.isContextLost()) {
          resize();
          if (canvas.width < 2 || canvas.height < 2 || glCtx.isContextLost()) return;
        }

        if (ms - lastT < FRAME_MS) return;
        lastT = ms;

        mouse.x += (mouse.tx - mouse.x) * 0.085;
        mouse.y += (mouse.ty - mouse.y) * 0.085;

        updateTarget();
        const isIntro = ms < introPhaseEnd;
        if (isIntro && INTRO_DURATION > 0) {
          // Time-based ease-in-out: reaches exactly START_OPACITY at introPhaseEnd
          const rawT = (ms - introPhaseStart) / (introPhaseEnd - introPhaseStart);
          const t = Math.min(rawT, 1);
          const eased = t * t * (3 - 2 * t); // smoothstep
          currentOpacity = eased * START_OPACITY;
        } else {
          const lerpSpeed = currentOpacity > targetOpacity ? 0.08 : 0.035; // dim fast, recover medium
          currentOpacity += (targetOpacity - currentOpacity) * lerpSpeed;
        }
        if (wrapper) wrapper.style.opacity = String(Math.max(0, Math.min(1, currentOpacity)));

        draw(ms);
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
      if (glRef && glProg && !glRef.isContextLost()) glRef.deleteProgram(glProg);
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
