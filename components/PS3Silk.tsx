"use client";

/**
 * Work-hero silk. Same print + Bayer material as PS3SilkLab, sampled in
 * lab-scale world UV so the hero is a window into that field — without
 * drawing a viewport-tall buffer and clipping it (that cut the ribbons
 * off and cost ~3× fill).
 */

import { useEffect, useRef, useState, startTransition } from "react";
import { useDialKit } from "dialkit";
import { introTimings } from "@/lib/introTimings";

let _hasMounted = false;

const FRAME_MS = 1000 / 30;

/** Locked to the lab’s current Vintage Halftone v7 defaults. */
const LAB = {
  intensity: 0.18,
  mouseNudge: 0.11,
  yOffset: 49,
  speed: 1,
  pitch: 4.8,
  screenAngle: 0,
  contrast: 1.1,
  inkSoft: 0.7,
  inkDensity: 0.44,
  minDot: 0.035,
  silkMix: 0.42,
  ditherMix: 0.35,
  bayerSize: 8,
  colorNum: 4,
  pixelSize: 1,
  opacity: 0.55,
  mouseLag: 0.055,
  bandCy: 0.62,
};

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
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (full.length < 6) return [1, 1, 1];
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function bayerRgba(n: 4 | 8): Uint8Array {
  const idx = new Uint8Array(n * n);
  const fill = (size: number, x: number, y: number, value: number, step: number) => {
    if (size === 1) {
      idx[y * n + x] = value;
      return;
    }
    const h = size / 2;
    fill(h, x, y, value, step * 4);
    fill(h, x + h, y, value + step * 2, step * 4);
    fill(h, x, y + h, value + step * 3, step * 4);
    fill(h, x + h, y + h, value + step, step * 4);
  };
  fill(n, 0, 0, 0, 1);
  const out = new Uint8Array(n * n * 4);
  const denom = n * n;
  for (let i = 0; i < n * n; i++) {
    const v = Math.round((idx[i] / denom) * 255);
    out[i * 4] = v;
    out[i * 4 + 1] = v;
    out[i * 4 + 2] = v;
    out[i * 4 + 3] = 255;
  }
  return out;
}

function uploadBayer(gl: WebGLRenderingContext, n: 4 | 8): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, bayerRgba(n));
  return tex;
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
  const [mode, setMode] = useState(initialMode);

  useEffect(() => { activeRef.current = active; }, [active]);

  const dk = useDialKit("PS3Silk", {
    endOpacity: [0.15, 0, 0.5, 0.01],
  });

  const intensityRef = useRef(LAB.intensity);
  const mouseStrRef = useRef(LAB.mouseNudge);
  const yOffsetRef = useRef(LAB.yOffset);
  const speedRef = useRef(LAB.speed);
  const halftSizeRef = useRef(3.0);
  const waveColorRef = useRef<[number, number, number]>(hexToRgb(waveColor));
  const endOpacityRef = useRef(0.15);

  useEffect(() => { endOpacityRef.current = dk.endOpacity; }, [dk.endOpacity]);
  useEffect(() => { waveColorRef.current = hexToRgb(waveColor); }, [waveColor]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

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

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d) return;
      if (d.intensity !== undefined) intensityRef.current = d.intensity;
      if (d.mouseStrength !== undefined) mouseStrRef.current = d.mouseStrength;
      if (d.yOffset !== undefined) yOffsetRef.current = d.yOffset;
      if (d.halftoneSize !== undefined) halftSizeRef.current = d.halftoneSize;
      if (d.speed !== undefined) speedRef.current = d.speed;
      if (d.waveColor !== undefined) {
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

  // Click-to-cycle mode — ignore rabbit-holes / buttons so opening a video
  // never flips the wave. Hero-sized canvas, so hit-test this wrapper.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const el = e.target as Element | null;
      if (el?.closest?.("a, button, [role='button'], #rh-trigger, #rh-hover-zone, #rh-rabbit-wrapper")) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        startTransition(() => {
          setMode((m) => {
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

  useEffect(() => {
    const _canvas = canvasRef.current;
    const _wrapper = wrapperRef.current;
    if (!_canvas || !_wrapper) return;
    const canvas = _canvas as HTMLCanvasElement;
    const wrapper = _wrapper as HTMLDivElement;

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let rafId = 0, lastT = 0;
    const START_OPACITY = LAB.opacity;
    let currentOpacity = 0, targetOpacity = START_OPACITY;

    const hadMountedBefore = _hasMounted;
    const isFirstLoad = !_hasMounted;
    if (isFirstLoad) _hasMounted = true;

    const reducedMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isFirstLoad && !reducedMotion) {
      wrapper.style.opacity = "0";
    } else {
      currentOpacity = START_OPACITY;
      targetOpacity = START_OPACITY;
      wrapper.style.opacity = String(START_OPACITY);
    }

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const ease3 = (t: number) => t * t * t;

    let removeListeners = () => {};
    let glRef: WebGLRenderingContext | null = null;
    let glProg: WebGLProgram | null = null;
    let bayer4: WebGLTexture | null = null;
    let bayer8: WebGLTexture | null = null;
    let running = false;

    const INTRO_DURATION = isFirstLoad && !reducedMotion ? (introTimings.patternDuration * 1000) : 0;
    let introPhaseStart = performance.now();
    let introPhaseEnd = introPhaseStart + INTRO_DURATION;

    function onReplay() {
      const dur = introTimings.patternDuration * 1000;
      currentOpacity = 0;
      wrapper.style.opacity = "0";
      introPhaseStart = performance.now();
      introPhaseEnd = introPhaseStart + dur;
    }
    window.addEventListener("intro-replay", onReplay);

    const initTimer = setTimeout(() => {
      const _glNullable = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
        desynchronized: true,
      });
      if (!_glNullable) return;
      const gl = _glNullable as WebGLRenderingContext;
      glRef = gl;
      const glCtx = gl;

      let wrapperRect: DOMRect | null = null;
      let posLoc = -1;
      let buf: WebGLBuffer | null = null;
      let worldSpan = 1;
      let worldAspect = 2.414;
      let viewResY = 1;

      function resize() {
        wrapper.style.top = "0px";
        wrapper.style.left = "0px";
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        const rect = wrapper.getBoundingClientRect();
        wrapperRect = rect;
        if (rect.width < 2 || rect.height < 2) return;
        const viewH = Math.max(window.innerHeight, 1);
        worldSpan = rect.height / viewH;
        worldAspect = rect.width / viewH;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        viewResY = viewH * dpr;
        const w = Math.max(2, Math.floor(rect.width * dpr));
        const h = Math.max(2, Math.floor(rect.height * dpr));
        if (canvas.width === w && canvas.height === h) {
          glCtx.viewport(0, 0, w, h);
          return;
        }
        canvas.width = w;
        canvas.height = h;
        glCtx.viewport(0, 0, w, h);
        if (buf && posLoc >= 0) draw(performance.now());
      }

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
        wrapperRect = wrapper.getBoundingClientRect();
        const scrollY = window.scrollY || 0;
        const fadeStart = window.innerHeight * 0.04;
        const fadeEnd = window.innerHeight * 0.12;
        const endOp = endOpacityRef.current;
        targetOpacity = START_OPACITY + (endOp - START_OPACITY) *
          ease3(clamp((scrollY - fadeStart) / (fadeEnd - fadeStart), 0, 1));
      }

      function onMouseMove(e: MouseEvent) {
        if (!activeRef.current) return;
        const rect = wrapperRect;
        if (!rect || rect.width < 2 || rect.height < 2) return;
        mouse.tx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        mouse.ty = LAB.bandCy + (0.5 - ny) * worldSpan;
      }

      function onPopState() {
        targetOpacity = currentOpacity = START_OPACITY;
        wrapper.style.opacity = String(START_OPACITY);
      }

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
      function onVisibility() {
        if (document.hidden) {
          stopLoop();
          return;
        }
        if (activeRef.current) startLoop();
      }
      document.addEventListener("visibilitychange", onVisibility);
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
        document.removeEventListener("visibilitychange", onVisibility);
      };

      const VS = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos,0.0,1.0); }`;
      const FS = `
precision highp float;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uIntensity;
uniform float uMouseNudge;
uniform float uAspect;
uniform float uYOffsetPx;
uniform float uSpeed;
uniform float uPitch;
uniform float uAngleRad;
uniform float uContrast;
uniform float uInkSoft;
uniform float uInkDensity;
uniform float uMinDot;
uniform vec3  uInkColor;
uniform float uSilkMix;
uniform sampler2D uBayer;
uniform float uBayerSize;
uniform float uDitherMix;
uniform float uColorNum;
uniform float uPixelSize;
uniform float uWorldSpan;
uniform float uBandCy;
uniform float uViewResY;

vec2 worldUV(vec2 f) {
  vec2 uv;
  uv.x = f.x / uResolution.x;
  float ny = uResolution.y > 0.0 ? f.y / uResolution.y : 0.5;
  uv.y = uBandCy + (ny - 0.5) * uWorldSpan;
  uv.y += uYOffsetPx / max(uViewResY, 1.0);
  return uv;
}

float waveBand(vec2 uv, float uvx, float spd, float freq, float amp,
  float phase, float cy, float width, float sharp, bool flip, float mnudge) {
  float angle = uTime * uSpeed * spd * freq * -1.0 + (phase + uvx + mnudge) * 2.0;
  float wy = sin(angle) * amp + cy;
  float dy = wy - uv.y;
  float dist = abs(dy);
  if (flip) { if (dy > 0.0) dist *= 4.0; }
  else       { if (dy < 0.0) dist *= 4.0; }
  float s = smoothstep(width * 1.5, 0.0, dist);
  return pow(s, sharp);
}

float sampleSilk(vec2 uv) {
  float aspectScale = uAspect / 2.414;
  float uvx = uv.x * aspectScale;
  float md = length(uv - uMouse);
  float mnudge = smoothstep(0.45, 0.0, md) * uMouseNudge;
  float c = 0.0;
  c += waveBand(uv,uvx,0.18,0.22,0.32,0.00,0.62,0.090,18.0,false,mnudge) * 0.90;
  c += waveBand(uv,uvx,0.38,0.42,0.24,0.00,0.62,0.085,20.0,false,mnudge) * 0.68;
  c += waveBand(uv,uvx,0.28,0.62,0.20,0.00,0.62,0.042,28.0,false,mnudge) * 0.38;
  c += waveBand(uv,uvx,0.12,0.18,0.14,0.00,0.62,0.065,22.0,false,mnudge) * 0.16;
  c += waveBand(uv,uvx,0.14,0.28,0.14,0.00,0.58,0.095,20.0,true,mnudge) * 0.84;
  c += waveBand(uv,uvx,0.33,0.39,0.11,0.00,0.58,0.088,22.0,true,mnudge) * 0.62;
  c += waveBand(uv,uvx,0.48,0.50,0.09,0.00,0.56,0.040,30.0,true,mnudge) * 0.32;
  c += waveBand(uv,uvx,0.22,0.57,0.08,0.00,0.52,0.160,18.0,true,mnudge) * 0.14;
  return clamp(c, 0.0, 1.0);
}

float inkRadius(float coverage, float pitch) {
  float t = clamp(coverage, 0.0, 1.0);
  if (t < uMinDot) return 0.0;
  return pitch * 0.5 * sqrt(pow(t, uContrast));
}

vec2 rotate2(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float px = max(uPixelSize, 1.0);
  if (px > 1.01) {
    frag = px * floor(frag / px) + px * 0.5;
  }
  vec2 uv = worldUV(frag);

  float silkLuma = sampleSilk(uv);
  float waveLight = silkLuma * uIntensity * 4.5;
  float silkA = clamp(waveLight * 1.1, 0.0, 1.0);

  float printA = 0.0;
  if (uSilkMix > 0.008) {
    vec2 screenPx = rotate2(frag, uAngleRad);
    float pitch = max(uPitch, 1.5);
    vec2 cell = floor(screenPx / pitch);
    vec2 centerScreen = (cell + 0.5) * pitch;
    vec2 centerFrag = rotate2(centerScreen, -uAngleRad);
    vec2 centerUV = worldUV(centerFrag);

    float cellSilk = sampleSilk(centerUV) * uIntensity * 4.5;
    float cellCov = clamp(cellSilk - 0.05, 0.0, 1.2);

    float rCrisp = inkRadius(cellCov, pitch);
    float dCrisp = length(frag - centerFrag);
    float crispDot = smoothstep(rCrisp + uInkSoft, rCrisp - uInkSoft, dCrisp);
    float crispVis = smoothstep(uMinDot, uMinDot + 0.06, cellCov);
    printA = crispDot * crispVis;
  }

  float a = mix(silkA, printA, clamp(uSilkMix, 0.0, 1.0));
  a = max(a, silkA * (1.0 - clamp(uSilkMix, 0.0, 1.0)) * 0.35 + silkA * 0.12 * step(0.55, uSilkMix));

  vec3 col = uInkColor * mix(0.78, uInkDensity, clamp(uSilkMix, 0.0, 1.0));
  vec3 rgb = col * a;

  if (uDitherMix > 0.001) {
    vec2 bUv = (mod(frag, uBayerSize) + 0.5) / uBayerSize;
    float th = texture2D(uBayer, bUv).r;
    float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float n = max(uColorNum - 1.0, 1.0);
    float q = clamp(lum + (th - 0.5) / max(uColorNum, 2.0), 0.0, 1.0);
    q = floor(q * n + 0.5) / n;
    rgb = mix(rgb, uInkColor * q, clamp(uDitherMix, 0.0, 1.0));
    a = mix(a, q, clamp(uDitherMix, 0.0, 1.0));
  }

  gl_FragColor = vec4(rgb, a);
}`;

      function compile(src: string, type: number) {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error("[PS3Silk]", gl.getShaderInfoLog(s));
        return s;
      }

      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(VS, gl.VERTEX_SHADER));
      gl.attachShader(prog, compile(FS, gl.FRAGMENT_SHADER));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("[PS3Silk]", gl.getProgramInfoLog(prog));
        return;
      }
      gl.useProgram(prog);
      glProg = prog;

      posLoc = gl.getAttribLocation(prog, "aPos");
      const L = {
        time: gl.getUniformLocation(prog, "uTime"),
        res: gl.getUniformLocation(prog, "uResolution"),
        mouse: gl.getUniformLocation(prog, "uMouse"),
        intensity: gl.getUniformLocation(prog, "uIntensity"),
        mouseNudge: gl.getUniformLocation(prog, "uMouseNudge"),
        aspect: gl.getUniformLocation(prog, "uAspect"),
        yOffset: gl.getUniformLocation(prog, "uYOffsetPx"),
        speed: gl.getUniformLocation(prog, "uSpeed"),
        pitch: gl.getUniformLocation(prog, "uPitch"),
        angle: gl.getUniformLocation(prog, "uAngleRad"),
        contrast: gl.getUniformLocation(prog, "uContrast"),
        inkSoft: gl.getUniformLocation(prog, "uInkSoft"),
        inkDensity: gl.getUniformLocation(prog, "uInkDensity"),
        minDot: gl.getUniformLocation(prog, "uMinDot"),
        inkColor: gl.getUniformLocation(prog, "uInkColor"),
        silkMix: gl.getUniformLocation(prog, "uSilkMix"),
        bayer: gl.getUniformLocation(prog, "uBayer"),
        bayerSize: gl.getUniformLocation(prog, "uBayerSize"),
        ditherMix: gl.getUniformLocation(prog, "uDitherMix"),
        colorNum: gl.getUniformLocation(prog, "uColorNum"),
        pixelSize: gl.getUniformLocation(prog, "uPixelSize"),
        worldSpan: gl.getUniformLocation(prog, "uWorldSpan"),
        bandCy: gl.getUniformLocation(prog, "uBandCy"),
        viewResY: gl.getUniformLocation(prog, "uViewResY"),
      };

      bayer4 = uploadBayer(gl, 4);
      bayer8 = uploadBayer(gl, 8);
      gl.uniform1i(L.bayer, 0);

      function draw(ms: number) {
        const ic = waveColorRef.current;
        const waveMode = modeRef.current === 0;
        gl.uniform1f(L.time, reducedMotion ? 0 : ms * 0.001);
        gl.uniform2f(L.res, canvas.width, canvas.height);
        gl.uniform2f(L.mouse, mouse.x, mouse.y);
        gl.uniform1f(L.intensity, intensityRef.current);
        gl.uniform1f(L.mouseNudge, reducedMotion ? 0 : mouseStrRef.current);
        gl.uniform1f(L.aspect, worldAspect);
        gl.uniform1f(L.yOffset, yOffsetRef.current);
        gl.uniform1f(L.speed, speedRef.current);
        gl.uniform1f(L.pitch, Math.max(1.5, halftSizeRef.current * (LAB.pitch / 3)));
        gl.uniform1f(L.angle, (LAB.screenAngle * Math.PI) / 180);
        gl.uniform1f(L.contrast, LAB.contrast);
        gl.uniform1f(L.inkSoft, LAB.inkSoft);
        gl.uniform1f(L.inkDensity, LAB.inkDensity);
        gl.uniform1f(L.minDot, LAB.minDot);
        gl.uniform3f(L.inkColor, ic[0], ic[1], ic[2]);
        gl.uniform1f(L.silkMix, waveMode ? 0 : LAB.silkMix);
        gl.uniform1f(L.ditherMix, waveMode ? 0 : LAB.ditherMix);
        gl.uniform1f(L.bayerSize, LAB.bayerSize);
        gl.uniform1f(L.colorNum, LAB.colorNum);
        gl.uniform1f(L.pixelSize, LAB.pixelSize);
        gl.uniform1f(L.worldSpan, worldSpan);
        gl.uniform1f(L.bandCy, LAB.bandCy);
        gl.uniform1f(L.viewResY, viewResY);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, LAB.bayerSize < 6 ? bayer4 : bayer8);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);

      const wake = () => {
        if (glCtx.isContextLost()) return;
        resize();
        updateTarget();
        if (!(isFirstLoad && !reducedMotion && performance.now() < introPhaseEnd)) {
          currentOpacity = targetOpacity;
          wrapper.style.opacity = String(Math.max(0, Math.min(1, currentOpacity)));
        }
        if (glProg && buf) {
          glCtx.useProgram(glProg);
          glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buf);
          glCtx.enableVertexAttribArray(posLoc);
          glCtx.vertexAttribPointer(posLoc, 2, glCtx.FLOAT, false, 0, 0);
        }
        startLoop();
      };
      const pause = () => {
        stopLoop();
      };
      lifecycleRef.current = { wake, pause };

      function frame(ms: number) {
        if (!running) return;
        if (document.hidden) {
          rafId = 0;
          return;
        }
        rafId = requestAnimationFrame(frame);

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

        mouse.x += (mouse.tx - mouse.x) * LAB.mouseLag;
        mouse.y += (mouse.ty - mouse.y) * LAB.mouseLag;

        updateTarget();
        const isIntro = ms < introPhaseEnd;
        if (isIntro && INTRO_DURATION > 0) {
          const rawT = (ms - introPhaseStart) / (introPhaseEnd - introPhaseStart);
          const t = Math.min(rawT, 1);
          const eased = t * t * (3 - 2 * t);
          currentOpacity = eased * START_OPACITY;
        } else {
          const lerpSpeed = currentOpacity > targetOpacity ? 0.08 : 0.035;
          currentOpacity += (targetOpacity - currentOpacity) * lerpSpeed;
        }
        wrapper.style.opacity = String(Math.max(0, Math.min(1, currentOpacity)));

        draw(ms);
      }

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
      if (glRef && !glRef.isContextLost()) {
        if (glProg) glRef.deleteProgram(glProg);
        if (bayer4) glRef.deleteTexture(bayer4);
        if (bayer8) glRef.deleteTexture(bayer8);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        ...style,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", background: "transparent" }} />
    </div>
  );
}
