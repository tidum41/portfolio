"use client";

/**
 * PS3SilkLab — elegant playground fork of the hero wave.
 * Dev-only (/dev/ps3-wave-lab). Production PS3Silk stays untouched.
 *
 * Principle: stay close to the original XMB silk, then add *quiet* flare.
 * Variation = density, softness, ribbon character, faint cursor bloom —
 * not cell-size explosions or goo slime by default.
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

/** Shader style ints — keep in sync with DialKit select options. */
const STYLE_MAP: Record<string, number> = {
  classic: 1, // production-like hard dots
  smooth: 0,
  "soft ink": 2,
  "fine grain": 3,
  breath: 4, // gentle wave→radius only
  braid: 5, // dual-phase ribbons + dots
  mist: 6, // smooth + faint dots
  "whisper cursor": 7, // classic + faint proximity bloom
  "soft merge": 8, // very light goo — optional
};

const FRAME_MS = 1000 / 30; // match production feel

export default function PS3SilkLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dk = useDialKit(
    "PS3 Wave Lab",
    {
      look: {
        variation: {
          type: "select",
          options: [
            "classic",
            "smooth",
            "soft ink",
            "fine grain",
            "breath",
            "braid",
            "mist",
            "whisper cursor",
            "soft merge",
          ],
          default: "classic",
        },
        waveColor: { type: "color", default: "#ffffff" },
        // Production defaults: intensity ~0.18, speed 1, yOffset ~49, dots ~3
        intensity: [0.18, 0.04, 0.45, 0.005],
        speed: [1.0, 0.2, 2.0, 0.01],
        yOffset: [49, -20, 100, 1],
        opacity: [0.55, 0.2, 1, 0.01],
      },
      wave: {
        _collapsed: true,
        extraRibbons: [0.25, 0, 1.0, 0.05],
        ribbonSoftness: [1.0, 0.7, 1.4, 0.05],
        harmonic: [0.12, 0, 0.55, 0.01],
        edgeAmp: [0.06, 0, 0.25, 0.01],
        braidOffset: [0.35, 0, 1.2, 0.05],
      },
      cursor: {
        _collapsed: false,
        // Production mouseStrength ~0.11 — keep gentle
        mouseStrength: [0.11, 0, 0.28, 0.005],
        mouseLag: [0.042, 0.02, 0.12, 0.001],
        warp: [0.02, 0, 0.12, 0.005],
        bloom: [0.22, 0, 0.7, 0.01],
        bloomRadius: [0.22, 0.08, 0.45, 0.01],
        ripple: [0.35, 0, 1.0, 0.05],
        pulse: [0.45, 0, 1.2, 0.05],
      },
      dots: {
        _collapsed: false,
        // Keep near production 3px — narrow range so it never blows up
        size: [3.0, 2.0, 5.5, 0.1],
        contrast: [0.85, 0.5, 1.25, 0.05],
        softEdge: [0.85, 0.4, 1.8, 0.05],
        ink: [0.55, 0.35, 0.8, 0.01],
        // Cap how much breath/whisper may grow a dot (fraction of cell)
        breatheAmt: [0.18, 0, 0.4, 0.01],
      },
      merge: {
        _collapsed: true,
        threshold: [0.72, 0.4, 1.2, 0.01],
        softness: [0.12, 0.04, 0.28, 0.01],
        radiusBoost: [1.08, 0.95, 1.35, 0.01],
      },
    },
    {
      id: "ps3-wave-lab-v2",
      persist: { key: "ps3-wave-lab-v2", storage: "localStorage", presets: true },
    },
  );

  const refs = useRef({
    style: 1,
    waveColor: [1, 1, 1] as [number, number, number],
    intensity: 0.18,
    speed: 1,
    yOffset: 49,
    opacity: 0.55,
    extraRibbons: 0.25,
    ribbonSoftness: 1,
    harmonic: 0.12,
    edgeAmp: 0.06,
    braidOffset: 0.35,
    mouseStrength: 0.11,
    mouseLag: 0.042,
    warp: 0.02,
    bloom: 0.22,
    bloomRadius: 0.22,
    ripple: 0.35,
    pulse: 0.45,
    size: 3,
    contrast: 0.85,
    softEdge: 0.85,
    ink: 0.55,
    breatheAmt: 0.18,
    mergeTh: 0.72,
    mergeSoft: 0.12,
    mergeBoost: 1.08,
  });

  useEffect(() => {
    const r = refs.current;
    r.style = STYLE_MAP[dk.look.variation] ?? 1;
    r.waveColor = hexToRgb(dk.look.waveColor);
    r.intensity = dk.look.intensity;
    r.speed = dk.look.speed;
    r.yOffset = dk.look.yOffset;
    r.opacity = dk.look.opacity;
    r.extraRibbons = dk.wave.extraRibbons;
    r.ribbonSoftness = dk.wave.ribbonSoftness;
    r.harmonic = dk.wave.harmonic;
    r.edgeAmp = dk.wave.edgeAmp;
    r.braidOffset = dk.wave.braidOffset;
    r.mouseStrength = dk.cursor.mouseStrength;
    r.mouseLag = dk.cursor.mouseLag;
    r.warp = dk.cursor.warp;
    r.bloom = dk.cursor.bloom;
    r.bloomRadius = dk.cursor.bloomRadius;
    r.ripple = dk.cursor.ripple;
    r.pulse = dk.cursor.pulse;
    r.size = dk.dots.size;
    r.contrast = dk.dots.contrast;
    r.softEdge = dk.dots.softEdge;
    r.ink = dk.dots.ink;
    r.breatheAmt = dk.dots.breatheAmt;
    r.mergeTh = dk.merge.threshold;
    r.mergeSoft = dk.merge.softness;
    r.mergeBoost = dk.merge.radiusBoost;
  }, [dk]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const pulse = { x: 0.5, y: 0.5, age: 99 };
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

    const VS = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.0,1.0); }`;
    const FS = `
precision highp float;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec2  uPulse;
uniform float uPulseAge;
uniform float uIntensity;
uniform float uMouseStrength;
uniform float uAspect;
uniform float uYOffsetPx;
uniform int   uStyle;
uniform float uHalftoneSize;
uniform vec3  uWaveColor;
uniform float uSpeed;
uniform float uExtraRibbons;
uniform float uRibbonSoft;
uniform float uHarmonic;
uniform float uEdgeAmp;
uniform float uBraidOffset;
uniform float uWarp;
uniform float uBloom;
uniform float uBloomRadius;
uniform float uRipple;
uniform float uPulseAmt;
uniform float uContrast;
uniform float uSoftEdge;
uniform float uInk;
uniform float uBreatheAmt;
uniform float uMergeTh;
uniform float uMergeSoft;
uniform float uMergeBoost;

float waveBand(vec2 uv, float uvx, float spd, float freq, float amp,
  float phase, float cy, float width, float sharp, bool flip, float mousePull) {
  float md = length(uv - uMouse);
  float mnudge = smoothstep(0.45, 0.0, md) * uMouseStrength * mousePull;
  float angle = uTime * uSpeed * spd * freq * -1.0
    + (phase + uvx + mnudge) * 2.0;
  angle += sin(angle * 0.5 + phase) * uHarmonic * 0.55;
  float edge = 1.0 + uEdgeAmp * abs(uv.x - 0.5) * 2.0;
  float wy = sin(angle) * amp * edge + cy;
  float dy = wy - uv.y;
  float dist = abs(dy);
  if (flip) { if (dy > 0.0) dist *= 4.0; }
  else       { if (dy < 0.0) dist *= 4.0; }
  float s = smoothstep(width * 1.5 * uRibbonSoft, 0.0, dist);
  return pow(s, sharp);
}

float sampleWave(vec2 uv, float phaseShift) {
  float aspectScale = uAspect / 2.414;
  vec2 d = uv - uMouse;
  float md = length(d);
  // Tiny warp — elegance over stretch
  uv -= d * uWarp * smoothstep(0.5, 0.0, md);
  float uvx = uv.x * aspectScale;

  float c = 0.0;
  // Production 8-band stack
  c += waveBand(uv,uvx,0.18,0.22,0.32,0.00+phaseShift,0.62,0.090,18.0,false,1.0) * 0.90;
  c += waveBand(uv,uvx,0.38,0.42,0.24,0.00+phaseShift,0.62,0.085,20.0,false,0.85) * 0.68;
  c += waveBand(uv,uvx,0.28,0.62,0.20,0.00+phaseShift,0.62,0.042,28.0,false,0.7) * 0.38;
  c += waveBand(uv,uvx,0.12,0.18,0.14,0.00+phaseShift,0.62,0.065,22.0,false,0.5) * 0.16;
  c += waveBand(uv,uvx,0.14,0.28,0.14,0.00+phaseShift,0.58,0.095,20.0,true,1.0) * 0.84;
  c += waveBand(uv,uvx,0.33,0.39,0.11,0.00+phaseShift,0.58,0.088,22.0,true,0.8) * 0.62;
  c += waveBand(uv,uvx,0.48,0.50,0.09,0.00+phaseShift,0.56,0.040,30.0,true,0.6) * 0.32;
  c += waveBand(uv,uvx,0.22,0.57,0.08,0.00+phaseShift,0.52,0.160,18.0,true,0.45) * 0.14;

  // Quiet extra ribbons (dialed, not loud)
  if (uExtraRibbons > 0.01) {
    float e = uExtraRibbons;
    c += waveBand(uv,uvx,0.16,0.31,0.14,1.1+phaseShift,0.64,0.09,17.0,false,0.9) * 0.35 * e;
    c += waveBand(uv,uvx,0.40,0.52,0.09,2.0+phaseShift,0.54,0.06,24.0,true,0.7) * 0.22 * e;
  }
  return clamp(c, 0.0, 1.0);
}

float pulseRing(vec2 uv) {
  if (uPulseAge > 2.2 || uPulseAmt < 0.01) return 0.0;
  float d = length(uv - uPulse);
  float r = uPulseAge * 0.28;
  float ring = exp(-pow((d - r) / 0.035, 2.0));
  return ring * exp(-uPulseAge * 1.6) * uPulseAmt;
}

float cursorBloom(vec2 uv) {
  float md = length(uv - uMouse);
  return (1.0 - smoothstep(0.0, uBloomRadius, md)) * uBloom * uMouseStrength * 2.0;
}

float cursorRipple(vec2 uv) {
  float md = length(uv - uMouse);
  return exp(-pow((md - 0.10) / 0.055, 2.0)) * uMouseStrength * uRipple;
}

// Shared hard-dot renderer with optional gentle breathe / bloom
vec4 renderDots(vec2 uv, float cellSize, float soft, float breathe, float bloomMix, float mistMix) {
  vec2 cell = floor(gl_FragCoord.xy / cellSize);
  vec2 cellCenter = (cell + 0.5) * cellSize;
  vec2 cellUV = cellCenter / uResolution;
  cellUV.y += uYOffsetPx / uResolution.y;

  float light = sampleWave(cellUV, 0.0) * uIntensity * 4.5;
  light += pulseRing(cellUV) * 0.35;
  float bloom = cursorBloom(cellUV) * bloomMix;
  float ripple = cursorRipple(cellUV);

  // Breathe: gentle radius from wave — capped so dots never explode
  float base = clamp(light - 0.05 + ripple * 0.28 + bloom * 0.15, 0.0, 1.15);
  float sizeMul = mix(base, pow(base, uContrast), 0.65);
  sizeMul = mix(0.92, sizeMul, 0.55 + breathe * 0.45);
  sizeMul = clamp(sizeMul, 0.0, 1.0 + uBreatheAmt * breathe);

  float d = length(gl_FragCoord.xy - cellCenter);
  float radius = cellSize * 0.5 * sizeMul;
  float dotVal = smoothstep(radius + soft, radius - soft, d);
  float vis = smoothstep(0.02, 0.08, light + bloom * 0.08);
  float a = dotVal * vis;

  // Mist: fade dots and leave room for smooth underlay
  a *= mix(1.0, 0.42, mistMix);

  vec3 col = uWaveColor * uInk;
  return vec4(col * a, a);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.y += uYOffsetPx / uResolution.y;

  float waveLuma = sampleWave(uv, 0.0);
  float waveLight = waveLuma * uIntensity * 4.5;
  waveLight += pulseRing(uv) * 0.35;

  // 0 — smooth ribbons
  if (uStyle == 0) {
    float alpha = clamp(waveLight * 1.1, 0.0, 1.0);
    vec3 col = uWaveColor * 0.78;
    gl_FragColor = vec4(col * alpha, alpha);
    return;
  }

  // 5 — braid: average two phase-shifted stacks, then dots
  float phase = (uStyle == 5) ? uBraidOffset : 0.0;
  if (uStyle == 5) {
    waveLuma = 0.5 * (sampleWave(uv, 0.0) + sampleWave(uv, phase));
    waveLight = waveLuma * uIntensity * 4.5;
  }

  // Cell size presets from variation (still dial-overridable base)
  float cellSize = uHalftoneSize;
  if (uStyle == 3) cellSize = uHalftoneSize * 0.78; // fine grain
  float soft = uSoftEdge;
  if (uStyle == 2) soft = uSoftEdge * 1.45; // soft ink
  if (uStyle == 3) soft = uSoftEdge * 0.75;

  float breathe = 0.0;
  float bloomMix = 0.0;
  float mistMix = 0.0;
  if (uStyle == 4) breathe = 1.0;          // breath
  if (uStyle == 7) bloomMix = 1.0;         // whisper cursor
  if (uStyle == 2) breathe = 0.35;         // soft ink slight breathe
  if (uStyle == 6) mistMix = 1.0;          // mist

  // 8 — soft merge (restrained goo)
  if (uStyle == 8) {
    float field = 0.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 cell = floor(gl_FragCoord.xy / cellSize) + vec2(float(i), float(j));
        vec2 center = (cell + 0.5) * cellSize;
        vec2 cellUV = center / uResolution;
        cellUV.y += uYOffsetPx / uResolution.y;
        float light = sampleWave(cellUV, 0.0) * uIntensity * 4.5;
        float rNorm = clamp(light - 0.05 + cursorRipple(cellUV) * 0.2, 0.0, 1.05);
        float radius = cellSize * 0.5 * rNorm * uMergeBoost;
        float d = length(gl_FragCoord.xy - center);
        field += (radius * radius) / (d * d + 2.2);
      }
    }
    float a = smoothstep(uMergeTh - uMergeSoft, uMergeTh + uMergeSoft, field);
    a *= smoothstep(0.015, 0.07, waveLight);
    vec3 col = uWaveColor * uInk;
    gl_FragColor = vec4(col * a, a);
    return;
  }

  // Mist: smooth base + faint dots
  if (uStyle == 6) {
    float alpha = clamp(waveLight * 0.85, 0.0, 1.0);
    vec3 smoothCol = uWaveColor * 0.72;
    vec4 dots = renderDots(uv, cellSize, soft, 0.2, 0.15, 1.0);
    vec3 rgb = smoothCol * alpha * (1.0 - dots.a) + dots.rgb;
    float a = max(alpha * 0.9, dots.a);
    gl_FragColor = vec4(rgb, a);
    return;
  }

  // classic (1), soft ink (2), fine grain (3), breath (4), braid (5), whisper (7)
  gl_FragColor = renderDots(uv, cellSize, soft, breathe, bloomMix, mistMix);
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
    const L = {
      time: gl.getUniformLocation(prog, "uTime"),
      res: gl.getUniformLocation(prog, "uResolution"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      pulse: gl.getUniformLocation(prog, "uPulse"),
      pulseAge: gl.getUniformLocation(prog, "uPulseAge"),
      intensity: gl.getUniformLocation(prog, "uIntensity"),
      mouseStrength: gl.getUniformLocation(prog, "uMouseStrength"),
      aspect: gl.getUniformLocation(prog, "uAspect"),
      yOffset: gl.getUniformLocation(prog, "uYOffsetPx"),
      style: gl.getUniformLocation(prog, "uStyle"),
      htSize: gl.getUniformLocation(prog, "uHalftoneSize"),
      waveColor: gl.getUniformLocation(prog, "uWaveColor"),
      speed: gl.getUniformLocation(prog, "uSpeed"),
      extra: gl.getUniformLocation(prog, "uExtraRibbons"),
      ribbon: gl.getUniformLocation(prog, "uRibbonSoft"),
      harmonic: gl.getUniformLocation(prog, "uHarmonic"),
      edgeAmp: gl.getUniformLocation(prog, "uEdgeAmp"),
      braid: gl.getUniformLocation(prog, "uBraidOffset"),
      warp: gl.getUniformLocation(prog, "uWarp"),
      bloom: gl.getUniformLocation(prog, "uBloom"),
      bloomR: gl.getUniformLocation(prog, "uBloomRadius"),
      ripple: gl.getUniformLocation(prog, "uRipple"),
      pulseAmt: gl.getUniformLocation(prog, "uPulseAmt"),
      contrast: gl.getUniformLocation(prog, "uContrast"),
      softEdge: gl.getUniformLocation(prog, "uSoftEdge"),
      ink: gl.getUniformLocation(prog, "uInk"),
      breathe: gl.getUniformLocation(prog, "uBreatheAmt"),
      mergeTh: gl.getUniformLocation(prog, "uMergeTh"),
      mergeSoft: gl.getUniformLocation(prog, "uMergeSoft"),
      mergeBoost: gl.getUniformLocation(prog, "uMergeBoost"),
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

    function onClick(e: MouseEvent) {
      const rect = wrapperRect ?? wrapper!.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }
      const t = e.target as Element | null;
      if (t?.closest?.(".dialkit-root, a, button, [role='button']")) return;
      pulse.x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      pulse.y = 1.0 - (e.clientY - rect.top) / Math.max(rect.height, 1);
      pulse.age = 0;
    }

    function draw(ms: number) {
      const r = refs.current;
      const wc = r.waveColor;
      wrapper!.style.opacity = String(r.opacity);
      gl!.uniform1f(L.time, ms * 0.001);
      gl!.uniform2f(L.res, canvas!.width, canvas!.height);
      gl!.uniform2f(L.mouse, mouse.x, mouse.y);
      gl!.uniform2f(L.pulse, pulse.x, pulse.y);
      gl!.uniform1f(L.pulseAge, pulse.age);
      gl!.uniform1f(L.intensity, r.intensity);
      gl!.uniform1f(L.mouseStrength, r.mouseStrength);
      gl!.uniform1f(L.aspect, canvas!.height > 0 ? canvas!.width / canvas!.height : 2.414);
      gl!.uniform1f(L.yOffset, r.yOffset);
      gl!.uniform1i(L.style, r.style);
      gl!.uniform1f(L.htSize, r.size);
      gl!.uniform3f(L.waveColor, wc[0], wc[1], wc[2]);
      gl!.uniform1f(L.speed, r.speed);
      gl!.uniform1f(L.extra, r.extraRibbons);
      gl!.uniform1f(L.ribbon, r.ribbonSoftness);
      gl!.uniform1f(L.harmonic, r.harmonic);
      gl!.uniform1f(L.edgeAmp, r.edgeAmp);
      gl!.uniform1f(L.braid, r.braidOffset);
      gl!.uniform1f(L.warp, r.warp);
      gl!.uniform1f(L.bloom, r.bloom);
      gl!.uniform1f(L.bloomR, r.bloomRadius);
      gl!.uniform1f(L.ripple, r.ripple);
      gl!.uniform1f(L.pulseAmt, r.pulse);
      gl!.uniform1f(L.contrast, r.contrast);
      gl!.uniform1f(L.softEdge, r.softEdge);
      gl!.uniform1f(L.ink, r.ink);
      gl!.uniform1f(L.breathe, r.breatheAmt);
      gl!.uniform1f(L.mergeTh, r.mergeTh);
      gl!.uniform1f(L.mergeSoft, r.mergeSoft);
      gl!.uniform1f(L.mergeBoost, r.mergeBoost);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function frame(ms: number) {
      if (!running) return;
      rafId = requestAnimationFrame(frame);
      if (ms - lastT < FRAME_MS) return;
      const dt = Math.min(0.05, (ms - lastT) / 1000);
      lastT = ms;
      const lag = refs.current.mouseLag;
      mouse.x += (mouse.tx - mouse.x) * lag;
      mouse.y += (mouse.ty - mouse.y) * lag;
      pulse.age += dt;
      draw(ms);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    rafId = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
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
        opacity: 0.55,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}
