"use client";

/**
 * PS3SilkLab — playground fork of the hero wave.
 * Dev-only (/dev/ps3-wave-lab). Does not affect production PS3Silk.
 *
 * Research notes (dial through these, don't ship all at once):
 * 1. Classic XMB: stacked translucent sine ribbons, soft one-sided falloff,
 *    slow drift, modest cursor phase nudge — restraint is the look.
 * 2. Variable-size halftone: wave luma + cursor proximity drive radius;
 *    optional local cell-size warp near the cursor.
 * 3. Gooey / metaball: sum soft radial fields from neighboring cells, then
 *    threshold (same idea as nav HalftoneDotField's SVG goo, but GPU).
 * 4. UV warp / parallax: cursor pulls the field; secondary mouse lag on
 *    deeper ribbons reads as depth without extra geometry.
 * 5. Click pulse: one expanding ring — rare delight, not constant noise.
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

const STYLE_MAP: Record<string, number> = {
  smooth: 0,
  "hard dots": 1,
  "variable dots": 2,
  gooey: 3,
};

const FRAME_MS = 1000 / 60;

export default function PS3SilkLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dk = useDialKit(
    "PS3 Wave Lab",
    {
      look: {
        style: {
          type: "select",
          options: ["smooth", "hard dots", "variable dots", "gooey"],
          default: "variable dots",
        },
        waveColor: { type: "color", default: "#ffffff" },
        intensity: [0.2, 0, 1, 0.005],
        speed: [1.0, 0, 3, 0.01],
        yOffset: [40, -80, 120, 1],
      },
      wave: {
        _collapsed: false,
        xmbLayers: [1.0, 0, 1.5, 0.05],
        ribbonSoftness: [1.0, 0.4, 2.0, 0.05],
        secondaryHarmonic: [0.35, 0, 1.2, 0.05],
        edgeAmp: [0.15, 0, 0.6, 0.01],
      },
      cursor: {
        _collapsed: false,
        mouseStrength: [0.18, 0, 0.6, 0.01],
        mouseLag: [0.08, 0.02, 0.35, 0.01],
        warp: [0.12, 0, 0.45, 0.01],
        sizeField: [0.55, 0, 1.5, 0.05],
        sizeRadius: [0.28, 0.05, 0.7, 0.01],
        rippleStrength: [0.9, 0, 2.5, 0.05],
        parallax: [0.35, 0, 1.2, 0.05],
        pulseStrength: [1.0, 0, 2.5, 0.05],
      },
      halftone: {
        _collapsed: false,
        baseSize: [4.0, 1.5, 16, 0.25],
        sizeContrast: [1.0, 0.2, 2.2, 0.05],
        softEdge: [1.1, 0.2, 3.0, 0.05],
        ink: [0.55, 0.2, 1.0, 0.01],
      },
      goo: {
        _collapsed: true,
        threshold: [0.55, 0.15, 1.4, 0.01],
        softness: [0.18, 0.02, 0.5, 0.01],
        radiusBoost: [1.35, 0.8, 2.2, 0.05],
        neighbors: [1, 1, 2, 1],
      },
    },
    {
      id: "ps3-wave-lab",
      persist: { key: "ps3-wave-lab", storage: "localStorage", presets: true },
    },
  );

  // Live dials → refs (shader loop reads refs, never closes over stale dk)
  const refs = useRef({
    style: 2,
    waveColor: [1, 1, 1] as [number, number, number],
    intensity: 0.2,
    speed: 1,
    yOffset: 40,
    xmbLayers: 1,
    ribbonSoftness: 1,
    secondaryHarmonic: 0.35,
    edgeAmp: 0.15,
    mouseStrength: 0.18,
    mouseLag: 0.08,
    warp: 0.12,
    sizeField: 0.55,
    sizeRadius: 0.28,
    rippleStrength: 0.9,
    parallax: 0.35,
    pulseStrength: 1,
    baseSize: 4,
    sizeContrast: 1,
    softEdge: 1.1,
    ink: 0.55,
    gooThreshold: 0.55,
    gooSoftness: 0.18,
    gooRadiusBoost: 1.35,
    gooNeighbors: 1,
  });

  useEffect(() => {
    const r = refs.current;
    r.style = STYLE_MAP[dk.look.style] ?? 2;
    r.waveColor = hexToRgb(dk.look.waveColor);
    r.intensity = dk.look.intensity;
    r.speed = dk.look.speed;
    r.yOffset = dk.look.yOffset;
    r.xmbLayers = dk.wave.xmbLayers;
    r.ribbonSoftness = dk.wave.ribbonSoftness;
    r.secondaryHarmonic = dk.wave.secondaryHarmonic;
    r.edgeAmp = dk.wave.edgeAmp;
    r.mouseStrength = dk.cursor.mouseStrength;
    r.mouseLag = dk.cursor.mouseLag;
    r.warp = dk.cursor.warp;
    r.sizeField = dk.cursor.sizeField;
    r.sizeRadius = dk.cursor.sizeRadius;
    r.rippleStrength = dk.cursor.rippleStrength;
    r.parallax = dk.cursor.parallax;
    r.pulseStrength = dk.cursor.pulseStrength;
    r.baseSize = dk.halftone.baseSize;
    r.sizeContrast = dk.halftone.sizeContrast;
    r.softEdge = dk.halftone.softEdge;
    r.ink = dk.halftone.ink;
    r.gooThreshold = dk.goo.threshold;
    r.gooSoftness = dk.goo.softness;
    r.gooRadiusBoost = dk.goo.radiusBoost;
    r.gooNeighbors = Math.round(dk.goo.neighbors);
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
uniform float uXmbLayers;
uniform float uRibbonSoft;
uniform float uHarmonic;
uniform float uEdgeAmp;
uniform float uWarp;
uniform float uSizeField;
uniform float uSizeRadius;
uniform float uRippleStrength;
uniform float uParallax;
uniform float uPulseStrength;
uniform float uSizeContrast;
uniform float uSoftEdge;
uniform float uInk;
uniform float uGooThreshold;
uniform float uGooSoftness;
uniform float uGooRadiusBoost;
uniform int   uGooNeighbors;

float waveBand(vec2 uv, float uvx, float spd, float freq, float amp,
  float phase, float cy, float width, float sharp, bool flip, float mousePull) {
  float md = length(uv - uMouse);
  float mnudge = smoothstep(0.5, 0.0, md) * uMouseStrength * mousePull;
  float angle = uTime * uSpeed * spd * freq * -1.0
    + (phase + uvx + mnudge) * 2.0;
  // Secondary harmonic — closer to XMB's layered shimmer
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

float sampleWave(vec2 uv) {
  float aspectScale = uAspect / 2.414;
  float uvx = uv.x * aspectScale;
  // Cursor UV warp — pulls the field toward the pointer
  vec2 d = uv - uMouse;
  float md = length(d);
  uv -= d * uWarp * smoothstep(0.55, 0.0, md);
  uvx = uv.x * aspectScale;

  float c = 0.0;
  float layerMix = clamp(uXmbLayers, 0.0, 1.5);

  // Core stack (production DNA)
  c += waveBand(uv,uvx,0.18,0.22,0.32,0.00,0.62,0.090,18.0,false,1.0) * 0.90;
  c += waveBand(uv,uvx,0.38,0.42,0.24,0.00,0.62,0.085,20.0,false,0.85) * 0.68;
  c += waveBand(uv,uvx,0.28,0.62,0.20,0.00,0.62,0.042,28.0,false,0.7) * 0.38;
  c += waveBand(uv,uvx,0.12,0.18,0.14,0.00,0.62,0.065,22.0,false,0.5) * 0.16;
  c += waveBand(uv,uvx,0.14,0.28,0.14,0.00,0.58,0.095,20.0,true,1.0) * 0.84;
  c += waveBand(uv,uvx,0.33,0.39,0.11,0.00,0.58,0.088,22.0,true,0.8) * 0.62;
  c += waveBand(uv,uvx,0.48,0.50,0.09,0.00,0.56,0.040,30.0,true,0.6) * 0.32;
  c += waveBand(uv,uvx,0.22,0.57,0.08,0.00,0.52,0.160,18.0,true,0.45) * 0.14;

  // Extra XMB-ish ribbons (parallax: stronger mouse pull = "nearer")
  if (layerMix > 0.01) {
    float p = 1.0 + uParallax;
    c += waveBand(uv,uvx,0.16,0.31,0.18,1.2,0.66,0.10,16.0,false,p) * 0.55 * layerMix;
    c += waveBand(uv,uvx,0.42,0.55,0.12,2.1,0.54,0.07,24.0,true,p*0.8) * 0.4 * layerMix;
    c += waveBand(uv,uvx,0.09,0.15,0.10,0.7,0.48,0.12,14.0,true,p*0.5) * 0.28 * layerMix;
  }

  return clamp(c, 0.0, 1.0);
}

float localCellSize(vec2 cellUV) {
  float md = length(cellUV - uMouse);
  float near = 1.0 - smoothstep(0.0, uSizeRadius, md);
  // Closer → larger cells (playful); invert by setting sizeField negative via dial range start at 0
  return uHalftoneSize * (1.0 + uSizeField * near);
}

float pulseRing(vec2 uv) {
  if (uPulseAge > 2.5) return 0.0;
  float d = length(uv - uPulse);
  float r = uPulseAge * 0.35;
  float ring = exp(-pow((d - r) / 0.04, 2.0));
  float fade = exp(-uPulseAge * 1.4);
  return ring * fade * uPulseStrength;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.y += uYOffsetPx / uResolution.y;

  float waveLuma = sampleWave(uv);
  float waveLight = waveLuma * uIntensity * 4.5;
  waveLight += pulseRing(uv) * 0.45;

  // ── Smooth ribbons ──
  if (uStyle == 0) {
    float alpha = clamp(waveLight * 1.1, 0.0, 1.0);
    vec3 col = uWaveColor * 0.78;
    gl_FragColor = vec4(col * alpha, alpha);
    return;
  }

  // Shared cursor ripple (ring around pointer)
  float mouseDist = length(uv - uMouse);
  float ripple = exp(-pow((mouseDist - 0.10) / 0.055, 2.0))
    * uMouseStrength * uRippleStrength;

  // ── Hard / variable dots ──
  if (uStyle == 1 || uStyle == 2) {
    float cellSize = uStyle == 2 ? localCellSize(uv) : uHalftoneSize;
    vec2 cell = floor(gl_FragCoord.xy / cellSize);
    vec2 cellCenter = (cell + 0.5) * cellSize;
    vec2 cellUV = cellCenter / uResolution;
    cellUV.y += uYOffsetPx / uResolution.y;

    float light = sampleWave(cellUV) * uIntensity * 4.5;
    light += pulseRing(cellUV) * 0.45;
    float md = length(cellUV - uMouse);
    float near = 1.0 - smoothstep(0.0, uSizeRadius, md);
    float sizeMul = uStyle == 2
      ? pow(clamp(light - 0.05 + ripple * 0.38 + near * uSizeField * 0.25, 0.0, 1.4), uSizeContrast)
      : clamp(light - 0.05 + ripple * 0.38, 0.0, 1.2);

    float d = length(gl_FragCoord.xy - cellCenter);
    float radius = cellSize * 0.5 * sizeMul;
    float dotVal = smoothstep(radius + uSoftEdge, radius - uSoftEdge, d);
    float vis = smoothstep(0.02, 0.08, light);
    float a = dotVal * vis;
    vec3 dotColor = uWaveColor * uInk;
    gl_FragColor = vec4(dotColor * a, a);
    return;
  }

  // ── Gooey metaball field (fixed 5×5 loop for WebGL1; outer ring gated) ──
  {
    float cellSize = localCellSize(uv);
    float field = 0.0;
    float nMax = float(uGooNeighbors); // 1 = 3×3, 2 = 5×5
    for (int j = -2; j <= 2; j++) {
      for (int i = -2; i <= 2; i++) {
        float fi = float(i);
        float fj = float(j);
        // Gate outer ring without non-constant loop bounds
        float inRange = step(max(abs(fi), abs(fj)), nMax);
        vec2 cell = floor(gl_FragCoord.xy / cellSize) + vec2(fi, fj);
        vec2 center = (cell + 0.5) * cellSize;
        vec2 cellUV = center / uResolution;
        cellUV.y += uYOffsetPx / uResolution.y;
        float light = sampleWave(cellUV) * uIntensity * 4.5;
        light += pulseRing(cellUV) * 0.35;
        float md = length(cellUV - uMouse);
        float near = 1.0 - smoothstep(0.0, uSizeRadius, md);
        float rNorm = clamp(light - 0.04 + ripple * 0.3 + near * uSizeField * 0.2, 0.0, 1.35);
        rNorm = pow(rNorm, uSizeContrast);
        float radius = cellSize * 0.5 * rNorm * uGooRadiusBoost;
        float d = length(gl_FragCoord.xy - center);
        // Soft inverse-square contribution → blobs merge when close
        field += inRange * (radius * radius) / (d * d + 1.5);
      }
    }
    float a = smoothstep(uGooThreshold - uGooSoftness, uGooThreshold + uGooSoftness, field);
    // Kill empty background so alpha compositing stays clean
    a *= smoothstep(0.01, 0.06, waveLight + ripple * 0.15);
    vec3 col = uWaveColor * uInk;
    gl_FragColor = vec4(col * a, a);
  }
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
      xmb: gl.getUniformLocation(prog, "uXmbLayers"),
      ribbon: gl.getUniformLocation(prog, "uRibbonSoft"),
      harmonic: gl.getUniformLocation(prog, "uHarmonic"),
      edgeAmp: gl.getUniformLocation(prog, "uEdgeAmp"),
      warp: gl.getUniformLocation(prog, "uWarp"),
      sizeField: gl.getUniformLocation(prog, "uSizeField"),
      sizeRadius: gl.getUniformLocation(prog, "uSizeRadius"),
      ripple: gl.getUniformLocation(prog, "uRippleStrength"),
      parallax: gl.getUniformLocation(prog, "uParallax"),
      pulseStr: gl.getUniformLocation(prog, "uPulseStrength"),
      sizeContrast: gl.getUniformLocation(prog, "uSizeContrast"),
      softEdge: gl.getUniformLocation(prog, "uSoftEdge"),
      ink: gl.getUniformLocation(prog, "uInk"),
      gooTh: gl.getUniformLocation(prog, "uGooThreshold"),
      gooSoft: gl.getUniformLocation(prog, "uGooSoftness"),
      gooBoost: gl.getUniformLocation(prog, "uGooRadiusBoost"),
      gooN: gl.getUniformLocation(prog, "uGooNeighbors"),
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
      // Ignore DialKit / UI chrome clicks
      const t = e.target as Element | null;
      if (t?.closest?.(".dialkit-root, a, button, [role='button']")) return;
      pulse.x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      pulse.y = 1.0 - (e.clientY - rect.top) / Math.max(rect.height, 1);
      pulse.age = 0;
    }

    function draw(ms: number) {
      const r = refs.current;
      const wc = r.waveColor;
      gl!.uniform1f(locs.time, ms * 0.001);
      gl!.uniform2f(locs.res, canvas!.width, canvas!.height);
      gl!.uniform2f(locs.mouse, mouse.x, mouse.y);
      gl!.uniform2f(locs.pulse, pulse.x, pulse.y);
      gl!.uniform1f(locs.pulseAge, pulse.age);
      gl!.uniform1f(locs.intensity, r.intensity);
      gl!.uniform1f(locs.mouseStrength, r.mouseStrength);
      gl!.uniform1f(locs.aspect, canvas!.height > 0 ? canvas!.width / canvas!.height : 2.414);
      gl!.uniform1f(locs.yOffset, r.yOffset);
      gl!.uniform1i(locs.style, r.style);
      gl!.uniform1f(locs.htSize, r.baseSize);
      gl!.uniform3f(locs.waveColor, wc[0], wc[1], wc[2]);
      gl!.uniform1f(locs.speed, r.speed);
      gl!.uniform1f(locs.xmb, r.xmbLayers);
      gl!.uniform1f(locs.ribbon, r.ribbonSoftness);
      gl!.uniform1f(locs.harmonic, r.secondaryHarmonic);
      gl!.uniform1f(locs.edgeAmp, r.edgeAmp);
      gl!.uniform1f(locs.warp, r.warp);
      gl!.uniform1f(locs.sizeField, r.sizeField);
      gl!.uniform1f(locs.sizeRadius, r.sizeRadius);
      gl!.uniform1f(locs.ripple, r.rippleStrength);
      gl!.uniform1f(locs.parallax, r.parallax);
      gl!.uniform1f(locs.pulseStr, r.pulseStrength);
      gl!.uniform1f(locs.sizeContrast, r.sizeContrast);
      gl!.uniform1f(locs.softEdge, r.softEdge);
      gl!.uniform1f(locs.ink, r.ink);
      gl!.uniform1f(locs.gooTh, r.gooThreshold);
      gl!.uniform1f(locs.gooSoft, r.gooSoftness);
      gl!.uniform1f(locs.gooBoost, r.gooRadiusBoost);
      gl!.uniform1i(locs.gooN, r.gooNeighbors);
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
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}
