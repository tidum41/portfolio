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

export default function PS3Silk({
  intensity = 0.1,
  mouseStrength = 0.11,
  yOffset = 49,
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
    intensity:     [intensity,      0,    0.5],
    mouseStrength: [mouseStrength,  0,    0.5],
    yOffset:       [yOffset,        -50,  100],
    halftoneSize:  [3.0,            1,    20],
    speed:         [1.0,            0,    4],
    endOpacity:    [0.15,           0,    0.5,  0.01],
  });

  const intensityRef    = useRef(intensity);
  const mouseStrRef     = useRef(mouseStrength);
  const yOffsetRef      = useRef(yOffset);
  const waveColorRef    = useRef<[number, number, number]>(hexToRgb(waveColor));
  const halftSizeRef    = useRef(3.0);
  const speedRef        = useRef(1.0);
  const endOpacityRef   = useRef(0.15);

  // Sync DialKit live values into refs each frame
  useEffect(() => { intensityRef.current = dk.intensity; }, [dk.intensity]);
  useEffect(() => { mouseStrRef.current = dk.mouseStrength; }, [dk.mouseStrength]);
  useEffect(() => { yOffsetRef.current = dk.yOffset; }, [dk.yOffset]);
  useEffect(() => { halftSizeRef.current = dk.halftoneSize; }, [dk.halftoneSize]);
  useEffect(() => { speedRef.current = dk.speed; }, [dk.speed]);
  useEffect(() => { endOpacityRef.current = dk.endOpacity; }, [dk.endOpacity]);
  useEffect(() => { waveColorRef.current = hexToRgb(waveColor); }, [waveColor]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Wake (or pause) the WebGL loop when the work route's visibility flips —
  // forces a real-sized resize + restores resting opacity on return; stops the
  // RAF entirely while hidden so we aren't burning frames into a dead canvas.
  useEffect(() => {
    if (active) lifecycleRef.current?.wake();
    else lifecycleRef.current?.pause();
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
    const START_OPACITY = 0.5;
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
      const _glNullable = canvas.getContext("webgl", { alpha: true, preserveDrawingBuffer: false });
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

      function resize() {
        const rect = wrapperRef.current?.getBoundingClientRect();
        wrapperRect = rect ?? null;
        if (!rect || !canvas) return;
        // Never write a 0×0 (or near-zero) drawing buffer. The persistent work
        // shell hides via display:none on non-/ routes, which reports 0×0 here;
        // assigning that size is what made the pattern go flat/empty on return.
        const w = Math.max(0, Math.floor(rect.width));
        const h = Math.max(0, Math.floor(rect.height));
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

vec3 wave(vec2 uv, float uvx, float spd, float freq, float amp,
  float phase, float cy, vec3 col, float width, float sharp, bool flip) {
  float md = length(uv - uMouse);
  float mnudge = smoothstep(0.45, 0.0, md) * uMouseStrength;
  float angle = uTime * uSpeed * spd * freq * -1.0 + (phase + uvx + mnudge) * 2.0;
  float wy = sin(angle) * amp + cy;
  float dy = wy - uv.y;
  float dist = abs(dy);
  if (flip) { if (dy > 0.0) dist *= 4.0; }
  else       { if (dy < 0.0) dist *= 4.0; }
  float s = smoothstep(width * 1.5, 0.0, dist);
  return min(col * pow(s, sharp), col);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.y += uYOffsetPx / uResolution.y;
  float aspectScale = uAspect / 2.414;
  float uvx = uv.x * aspectScale;

  vec3 c = vec3(0.0);
  c += wave(uv,uvx,0.18,0.22,0.32,0.00,0.62,uWaveColor*0.90,0.090,18.0,false);
  c += wave(uv,uvx,0.38,0.42,0.24,0.00,0.62,uWaveColor*0.68,0.085,20.0,false);
  c += wave(uv,uvx,0.28,0.62,0.20,0.00,0.62,uWaveColor*0.38,0.042,28.0,false);
  c += wave(uv,uvx,0.12,0.18,0.14,0.00,0.62,uWaveColor*0.16,0.065,22.0,false);
  c += wave(uv,uvx,0.14,0.28,0.14,0.00,0.58,uWaveColor*0.84,0.095,20.0,true);
  c += wave(uv,uvx,0.33,0.39,0.11,0.00,0.58,uWaveColor*0.62,0.088,22.0,true);
  c += wave(uv,uvx,0.48,0.50,0.09,0.00,0.56,uWaveColor*0.32,0.040,30.0,true);
  c += wave(uv,uvx,0.22,0.57,0.08,0.00,0.52,uWaveColor*0.14,0.160,18.0,true);
  c = clamp(c,0.0,1.0);

  float waveLuma  = max(max(c.r,c.g),c.b);
  float waveLight = waveLuma * uIntensity * 4.5;

  if (uMode == 1) {
    vec2 cell       = floor(gl_FragCoord.xy / uHalftoneSize);
    vec2 cellCenter = (cell + 0.5) * uHalftoneSize;
    vec2 cellUV     = cellCenter / uResolution;
    float mouseDist = length(cellUV - uMouse);
    float ripple    = exp(-pow((mouseDist - 0.10) / 0.055, 2.0)) * uMouseStrength * 2.8;
    float d         = length(gl_FragCoord.xy - cellCenter);
    float radius    = uHalftoneSize * 0.5 * clamp(waveLight - 0.05 + ripple * 0.38, 0.0, 1.2);
    float dotVal    = smoothstep(radius + 0.8, radius - 0.8, d);
    vec3  dotColor  = uWaveColor * 0.55;
    float vis       = smoothstep(0.02, 0.08, waveLight);
    float a         = dotVal * vis;
    gl_FragColor = vec4(dotColor * a, a);
    return;
  }

  vec3  darkWave = uWaveColor * 0.78;
  float alpha    = clamp(waveLight * 1.1, 0.0, 1.0);
  gl_FragColor = vec4(darkWave * alpha, alpha);
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
        gl.uniform1f(uYOfsLoc, yOffsetRef.current);
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
      lifecycleRef.current = { wake, pause: stopLoop };

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

        mouse.x += (mouse.tx - mouse.x) * 0.042;
        mouse.y += (mouse.ty - mouse.y) * 0.042;

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
      // about/play first-paint and then permanently flattening the pattern.
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
