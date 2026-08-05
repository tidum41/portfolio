"use client";

/**
 * PS3SilkLab — near-identical fork of production PS3Silk, with one quiet
 * experiment: local halftone scale follows the cursor.
 * Dev-only (/dev/ps3-wave-lab). Does not change production PS3Silk.
 */

import { useEffect, useRef } from "react";
import { useDialKit } from "dialkit";

function hexToRgb(hex: string): [number, number, number] {
  if (!hex || typeof hex !== "string") return [1, 1, 1];
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (full.length < 6) return [1, 1, 1];
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

/** 0 original · 1 cell scale near cursor · 2 radius bloom · 3 finer near cursor */
const FLARE_MAP: Record<string, number> = {
  original: 0,
  "cursor cell scale": 1,
  "cursor radius bloom": 2,
  "cursor finer grain": 3,
};

const FRAME_MS = 1000 / 30;

export default function PS3SilkLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dk = useDialKit(
    "PS3 Wave Lab",
    {
      // Production-matching defaults first
      intensity: [0.18, 0, 0.5, 0.005],
      mouseStrength: [0.11, 0, 0.35, 0.005],
      yOffset: [49, -20, 100, 1],
      halftoneSize: [3.0, 2.0, 6.0, 0.1],
      speed: [1.0, 0, 2.5, 0.01],
      waveColor: { type: "color", default: "#ffffff" },
      mode: {
        type: "select",
        options: ["halftone", "smooth"],
        default: "halftone",
      },
      flare: {
        type: "select",
        options: [
          "original",
          "cursor cell scale",
          "cursor radius bloom",
          "cursor finer grain",
        ],
        default: "cursor cell scale",
      },
      // How much the cursor may nudge scale — keep modest
      cursorScaleAmt: [0.35, 0, 0.8, 0.01],
      cursorScaleRadius: [0.28, 0.1, 0.55, 0.01],
    },
    {
      id: "ps3-wave-lab-v3",
      persist: { key: "ps3-wave-lab-v3", storage: "localStorage", presets: true },
    },
  );

  const refs = useRef({
    intensity: 0.18,
    mouseStrength: 0.11,
    yOffset: 49,
    halftoneSize: 3,
    speed: 1,
    waveColor: [1, 1, 1] as [number, number, number],
    mode: 1,
    flare: 1,
    cursorScaleAmt: 0.35,
    cursorScaleRadius: 0.28,
  });

  useEffect(() => {
    const r = refs.current;
    r.intensity = dk.intensity;
    r.mouseStrength = dk.mouseStrength;
    r.yOffset = dk.yOffset;
    r.halftoneSize = dk.halftoneSize;
    r.speed = dk.speed;
    r.waveColor = hexToRgb(dk.waveColor);
    r.mode = dk.mode === "smooth" ? 0 : 1;
    r.flare = FLARE_MAP[dk.flare] ?? 1;
    r.cursorScaleAmt = dk.cursorScaleAmt;
    r.cursorScaleRadius = dk.cursorScaleRadius;
  }, [dk]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let wrapperRect: DOMRect | null = null;
    let rafId = 0;
    let lastT = 0;
    let running = true;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    // Same wave stack as production PS3Silk — only halftone path gains
    // optional local scale from cursor (uFlare / uCursorScale*).
    const VS = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.0,1.0); }`;
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
uniform int   uFlare;
uniform float uCursorScaleAmt;
uniform float uCursorScaleRadius;

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
    // Cursor influence 0..1 within scale radius
    float near = 1.0 - smoothstep(0.0, uCursorScaleRadius, length(uv - uMouse));
    float amt = uCursorScaleAmt * near;

    // Local cell size — same grid as production unless flare asks otherwise
    float cellSize = uHalftoneSize;
    if (uFlare == 1) {
      // Slightly larger cells near cursor (scale up ~amt)
      cellSize = uHalftoneSize * (1.0 + amt);
    } else if (uFlare == 3) {
      // Slightly finer grain near cursor (scale down)
      cellSize = uHalftoneSize * (1.0 - amt * 0.45);
      cellSize = max(cellSize, uHalftoneSize * 0.55);
    }

    vec2 cell       = floor(gl_FragCoord.xy / cellSize);
    vec2 cellCenter = (cell + 0.5) * cellSize;
    vec2 cellUV     = cellCenter / uResolution;
    // Match production: mouse in same space as wave uv (incl. y offset)
    cellUV.y += uYOffsetPx / uResolution.y;

    float mouseDist = length(cellUV - uMouse);
    float ripple    = exp(-pow((mouseDist - 0.10) / 0.055, 2.0)) * uMouseStrength * 2.8;

    float radiusMul = clamp(waveLight - 0.05 + ripple * 0.38, 0.0, 1.2);
    if (uFlare == 2) {
      // Radius bloom only — grid stays production; dots grow mildly near cursor
      float bloomNear = 1.0 - smoothstep(0.0, uCursorScaleRadius, mouseDist);
      radiusMul = clamp(radiusMul * (1.0 + uCursorScaleAmt * bloomNear * 0.55), 0.0, 1.35);
    }

    float d      = length(gl_FragCoord.xy - cellCenter);
    float radius = cellSize * 0.5 * radiusMul;
    float dotVal = smoothstep(radius + 0.8, radius - 0.8, d);
    vec3  dotColor = uWaveColor * 0.55;
    float vis = smoothstep(0.02, 0.08, waveLight);
    float a = dotVal * vis;
    gl_FragColor = vec4(dotColor * a, a);
    return;
  }

  vec3  darkWave = uWaveColor * 0.78;
  float alpha    = clamp(waveLight * 1.1, 0.0, 1.0);
  gl_FragColor = vec4(darkWave * alpha, alpha);
}`;

    function compile(src: string, type: number) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error("[PS3SilkLab]", gl!.getShaderInfoLog(s));
      }
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(VS, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(FS, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[PS3SilkLab]", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const posLoc = gl.getAttribLocation(prog, "aPos");
    const locs = {
      time: gl.getUniformLocation(prog, "uTime"),
      res: gl.getUniformLocation(prog, "uResolution"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      intensity: gl.getUniformLocation(prog, "uIntensity"),
      mouseStrength: gl.getUniformLocation(prog, "uMouseStrength"),
      aspect: gl.getUniformLocation(prog, "uAspect"),
      yOffset: gl.getUniformLocation(prog, "uYOffsetPx"),
      mode: gl.getUniformLocation(prog, "uMode"),
      htSize: gl.getUniformLocation(prog, "uHalftoneSize"),
      waveColor: gl.getUniformLocation(prog, "uWaveColor"),
      speed: gl.getUniformLocation(prog, "uSpeed"),
      flare: gl.getUniformLocation(prog, "uFlare"),
      scaleAmt: gl.getUniformLocation(prog, "uCursorScaleAmt"),
      scaleRadius: gl.getUniformLocation(prog, "uCursorScaleRadius"),
    };

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function resize() {
      const rect = wrapper!.getBoundingClientRect();
      wrapperRect = rect;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.floor(rect.width * dpr));
      const h = Math.max(2, Math.floor(rect.height * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      gl!.viewport(0, 0, w, h);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = wrapperRect ?? wrapper!.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / Math.max(rect.width, 1);
      mouse.ty = 1.0 - (e.clientY - rect.top) / Math.max(rect.height, 1);
    }

    function draw(ms: number) {
      const r = refs.current;
      const wc = r.waveColor;
      gl!.uniform1f(locs.time, ms * 0.001);
      gl!.uniform2f(locs.res, canvas!.width, canvas!.height);
      gl!.uniform2f(locs.mouse, mouse.x, mouse.y);
      gl!.uniform1f(locs.intensity, r.intensity);
      gl!.uniform1f(locs.mouseStrength, r.mouseStrength);
      gl!.uniform1f(locs.aspect, canvas!.height > 0 ? canvas!.width / canvas!.height : 2.414);
      gl!.uniform1f(locs.yOffset, r.yOffset);
      gl!.uniform1i(locs.mode, r.mode);
      gl!.uniform1f(locs.htSize, r.halftoneSize);
      gl!.uniform3f(locs.waveColor, wc[0], wc[1], wc[2]);
      gl!.uniform1f(locs.speed, r.speed);
      gl!.uniform1i(locs.flare, r.flare);
      gl!.uniform1f(locs.scaleAmt, r.cursorScaleAmt);
      gl!.uniform1f(locs.scaleRadius, r.cursorScaleRadius);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function frame(ms: number) {
      if (!running) return;
      rafId = requestAnimationFrame(frame);
      if (ms - lastT < FRAME_MS) return;
      lastT = ms;
      // Same lag as production PS3Silk
      mouse.x += (mouse.tx - mouse.x) * 0.042;
      mouse.y += (mouse.ty - mouse.y) * 0.042;
      draw(ms);
    }

    resize();
    wrapper.style.opacity = "0.5"; // production START_OPACITY
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    rafId = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      if (!gl.isContextLost()) gl.deleteProgram(prog);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.5,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}
