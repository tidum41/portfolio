"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useDialKit } from "dialkit";

// Module-level flag: persists during client-side nav, resets on page reload
let _hasMounted = false;

const FADE_DURATION = 3500;
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
}

export default function PS3Silk({
  intensity = 0.1,
  mouseStrength = 0.11,
  yOffset = 10,
  waveColor = "#ffffff",
  mode: initialMode = 1,
  style,
}: PS3SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(initialMode);
  const [mode, setMode] = useState(initialMode);

  const dk = useDialKit("PS3Silk", {
    intensity:     [intensity,      0,    0.5],
    mouseStrength: [mouseStrength,  0,    0.5],
    yOffset:       [yOffset,        -50,  100],
    halftoneSize:  [3.0,            1,    20],
    speed:         [1.0,            0,    4],
  });

  const intensityRef    = useRef(intensity);
  const mouseStrRef     = useRef(mouseStrength);
  const yOffsetRef      = useRef(yOffset);
  const waveColorRef    = useRef<[number, number, number]>(hexToRgb(waveColor));
  const halftSizeRef    = useRef(3.0);
  const speedRef        = useRef(1.0);

  // Sync DialKit live values into refs each frame
  useEffect(() => { intensityRef.current = dk.intensity; }, [dk.intensity]);
  useEffect(() => { mouseStrRef.current = dk.mouseStrength; }, [dk.mouseStrength]);
  useEffect(() => { yOffsetRef.current = dk.yOffset; }, [dk.yOffset]);
  useEffect(() => { halftSizeRef.current = dk.halftoneSize; }, [dk.halftoneSize]);
  useEffect(() => { speedRef.current = dk.speed; }, [dk.speed]);
  useEffect(() => { waveColorRef.current = hexToRgb(waveColor); }, [waveColor]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

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

  // click-to-cycle mode
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if ((e.target as Element).closest("a, button, [role='button']")) return;
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
    const START_OPACITY = 0.5, END_OPACITY = 0.2;
    let currentOpacity = START_OPACITY, targetOpacity = START_OPACITY;

    const isFirstLoad = !_hasMounted;
    if (isFirstLoad) _hasMounted = true;
    let fadeDone = !isFirstLoad;

    if (isFirstLoad) {
      wrapper.style.transition = "none";
      wrapper.style.opacity = "0";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          wrapper.style.transition = `opacity ${FADE_DURATION}ms ease-out`;
          wrapper.style.opacity = String(START_OPACITY);
          setTimeout(() => { wrapper.style.transition = "none"; fadeDone = true; }, FADE_DURATION + 100);
        })
      );
    } else {
      wrapper.style.transition = "none";
      wrapper.style.opacity = String(START_OPACITY);
      fadeDone = true;
    }

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const ease3 = (t: number) => t * t * t;

    let removeListeners = () => {};
    let glRef: WebGLRenderingContext | null = null;
    let glProg: WebGLProgram | null = null;

    // Defer shader compilation so the navigation animation stays smooth
    const initTimer = setTimeout(() => {
      const _glNullable = canvas.getContext("webgl", { alpha: true });
      if (!_glNullable) return;
      const gl = _glNullable as WebGLRenderingContext;
      glRef = gl;
      const glCtx = gl;

      function resize() {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect || !canvas) return;
        canvas.width = rect.width; canvas.height = rect.height;
        glCtx.viewport(0, 0, rect.width, rect.height);
      }

      function updateTarget() {
        const fadeStart = window.innerHeight * 0.04, fadeEnd = window.innerHeight * 0.12;
        const sy = window.scrollY || 0;
        targetOpacity = START_OPACITY + (END_OPACITY - START_OPACITY) *
          ease3(clamp((sy - fadeStart) / (fadeEnd - fadeStart), 0, 1));
      }

      function onMouseMove(e: MouseEvent) {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.tx = (e.clientX - rect.left) / rect.width;
        mouse.ty = 1.0 - (e.clientY - rect.top) / rect.height;
      }

      window.addEventListener("resize", resize);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("scroll", updateTarget, { passive: true });
      removeListeners = () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("scroll", updateTarget);
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

      const posLoc        = gl.getAttribLocation(prog, "aPos");
      const uTimeLoc      = gl.getUniformLocation(prog, "uTime");
      const uResLoc       = gl.getUniformLocation(prog, "uResolution");
      const uMouseLoc     = gl.getUniformLocation(prog, "uMouse");
      const uIntLoc       = gl.getUniformLocation(prog, "uIntensity");
      const uMStrLoc      = gl.getUniformLocation(prog, "uMouseStrength");
      const uAspLoc       = gl.getUniformLocation(prog, "uAspect");
      const uYOfsLoc      = gl.getUniformLocation(prog, "uYOffsetPx");
      const uModeLoc      = gl.getUniformLocation(prog, "uMode");
      const uHtSizeLoc    = gl.getUniformLocation(prog, "uHalftoneSize");
      const uWaveColorLoc = gl.getUniformLocation(prog, "uWaveColor");
      const uSpeedLoc     = gl.getUniformLocation(prog, "uSpeed");

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.clearColor(0, 0, 0, 0);

      function frame(ms: number) {
        rafId = requestAnimationFrame(frame);
        if (ms - lastT < FRAME_MS) return;
        lastT = ms;

        mouse.x += (mouse.tx - mouse.x) * 0.042;
        mouse.y += (mouse.ty - mouse.y) * 0.042;

        if (fadeDone) {
          const lerpSpeed = currentOpacity > targetOpacity ? 0.08 : 0.015;
          currentOpacity += (targetOpacity - currentOpacity) * lerpSpeed;
          if (wrapper) wrapper.style.opacity = String(currentOpacity);
        }

        const wc = waveColorRef.current;
        gl.uniform1f(uTimeLoc, ms * 0.001);
        gl.uniform2f(uResLoc, canvas.width, canvas.height);
        gl.uniform2f(uMouseLoc, mouse.x, mouse.y);
        gl.uniform1f(uIntLoc, intensityRef.current);
        gl.uniform1f(uMStrLoc, mouseStrRef.current);
        gl.uniform1f(uAspLoc, canvas.height > 0 ? canvas.width / canvas.height : 2.414);
        gl.uniform1f(uYOfsLoc, yOffsetRef.current);
        gl.uniform1i(uModeLoc, modeRef.current);
        gl.uniform1f(uHtSizeLoc, halftSizeRef.current);
        gl.uniform3f(uWaveColorLoc, wc[0], wc[1], wc[2]);
        gl.uniform1f(uSpeedLoc, speedRef.current);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      requestAnimationFrame(() => { resize(); updateTarget(); rafId = requestAnimationFrame(frame); });
    }, 150);

    return () => {
      clearTimeout(initTimer);
      cancelAnimationFrame(rafId);
      removeListeners();
      if (glRef && glProg) glRef.deleteProgram(glProg);
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
