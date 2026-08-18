"use client";

/**
 * PS3SilkLab v7 — XMB ribbon physics first, print + Bayer dither as materials.
 *
 * Real XMB (spline.elf): subdivided mesh / continuous translucent ribbons with
 * fresnel-ish sheet lighting + a SEPARATE particles.elf sparkle pass.
 * Your site already approximates the ribbons as additive one-sided sine bands
 * (production PS3Silk). v4 flattened that into AM print coverage and lost the
 * wrapping sheets. v5 restores continuous silk, then textures it with print
 * dots (and optional cursor melt) — no floating sparkles.
 *
 * v6 adds Maxime Heckel's ordered-dither / quantization / pixelize post
 * (https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/)
 * as a mixable material on the same silk, not a replacement for wrap physics.
 * CRT curvature/scanlines from that article are omitted — PS3 XMB is HD silk,
 * not a shadow-mask monitor.
 *
 * v7 is a perf pass: dither itself is one texture lookup. The real cost was
 * sampleSilk (8 sines) running ~11×/pixel because the print 3×3 morph loop
 * always ran, plus a 2× DPR fullscreen buffer vs production's 1× CSS pixels.
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

const FRAME_MS = 1000 / 30;
/** Match production silk: CSS pixels, not device pixels. Cap so 4K isn't 8M fragments. */
const MAX_BUFFER_W = 1440;

/** Bayer 2^n via the 2×2 recurrence. Values 0..n²-1, then scaled to 0–255. */
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
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, bayerRgba(n),
  );
  return tex;
}

export default function PS3SilkLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dk = useDialKit(
    "Vintage Halftone",
    {
      print: {
        // User-tuned defaults (Aug 2026)
        pitch: [4.8, 2.2, 6.5, 0.1],
        screenAngle: [0, 0, 45, 0.5],
        contrast: [1.1, 0.45, 1.4, 0.05],
        inkSoftness: [0.7, 0.35, 2.2, 0.05],
        inkDensity: [0.44, 0.3, 0.9, 0.01],
        minDot: [0.035, 0, 0.15, 0.005],
        inkColor: { type: "color", default: "#ffffff" },
        // 0 = pure continuous silk (production physics), 1 = dots only
        silkMix: [0.42, 0, 1, 0.01],
      },
      retro: {
        // Heckel ordered dither as a material on the silk (0 = off)
        mix: [0.35, 0, 1, 0.01],
        matrix: { type: "select", options: ["4x4", "8x8"], default: "8x8" },
        colors: [4, 2, 8, 1],
        pixelSize: [1, 1, 12, 1],
      },
      morph: {
        enabled: false,
        strength: [0.7, 0, 1, 0.01],
        radius: [0.26, 0.1, 0.5, 0.01],
        fusion: [0.55, 0.2, 1.1, 0.01],
        softness: [0.14, 0.04, 0.35, 0.01],
        overlap: [1.2, 0.9, 1.7, 0.05],
        lag: [0.055, 0.02, 0.14, 0.005],
      },
      plate: {
        _collapsed: true,
        intensity: [0.18, 0.06, 0.4, 0.005],
        mouseNudge: [0.11, 0, 0.28, 0.005],
        speed: [1.0, 0.15, 2.0, 0.01],
        yOffset: [49, -20, 100, 1],
        opacity: [0.55, 0.25, 0.9, 0.01],
      },
    },
    {
      id: "ps3-vintage-halftone-v7",
      persist: {
        key: "ps3-vintage-halftone-v7",
        storage: "localStorage",
        presets: true,
      },
    },
  );

  const refs = useRef({
    pitch: 4.8,
    screenAngle: 0,
    contrast: 1.1,
    inkSoftness: 0.7,
    inkDensity: 0.44,
    minDot: 0.035,
    inkColor: [1, 1, 1] as [number, number, number],
    silkMix: 0.42,
    ditherMix: 0.35,
    bayerSize: 8,
    colorNum: 4,
    pixelSize: 1,
    morphOn: false,
    morphStrength: 0.7,
    morphRadius: 0.26,
    morphFusion: 0.55,
    morphSoftness: 0.14,
    morphOverlap: 1.2,
    morphLag: 0.055,
    intensity: 0.18,
    mouseNudge: 0.11,
    speed: 1,
    yOffset: 49,
    opacity: 0.55,
  });

  useEffect(() => {
    const r = refs.current;
    r.pitch = dk.print.pitch;
    r.screenAngle = dk.print.screenAngle;
    r.contrast = dk.print.contrast;
    r.inkSoftness = dk.print.inkSoftness;
    r.inkDensity = dk.print.inkDensity;
    r.minDot = dk.print.minDot;
    r.inkColor = hexToRgb(dk.print.inkColor);
    r.silkMix = dk.print.silkMix;
    r.ditherMix = dk.retro.mix;
    r.bayerSize = dk.retro.matrix === "4x4" ? 4 : 8;
    r.colorNum = dk.retro.colors;
    r.pixelSize = dk.retro.pixelSize;
    r.morphOn = dk.morph.enabled;
    r.morphStrength = dk.morph.strength;
    r.morphRadius = dk.morph.radius;
    r.morphFusion = dk.morph.fusion;
    r.morphSoftness = dk.morph.softness;
    r.morphOverlap = dk.morph.overlap;
    r.morphLag = dk.morph.lag;
    r.intensity = dk.plate.intensity;
    r.mouseNudge = dk.plate.mouseNudge;
    r.speed = dk.plate.speed;
    r.yOffset = dk.plate.yOffset;
    r.opacity = dk.plate.opacity;
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
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      desynchronized: true,
    });
    if (!gl) return;

    const VS = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.0,1.0); }`;
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
uniform float uMorphOn;
uniform float uMorphStrength;
uniform float uMorphRadius;
uniform float uMorphFusion;
uniform float uMorphSoft;
uniform float uMorphOverlap;
uniform sampler2D uBayer;
uniform float uBayerSize;
uniform float uDitherMix;
uniform float uColorNum;
uniform float uPixelSize;

// Exact production PS3Silk band — continuous ribbon with one-sided thickness.
// mnudge is hoisted in sampleSilk (same uv → same mouse dist for all 8 bands).
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
  vec2 uv = frag / uResolution;
  uv.y += uYOffsetPx / uResolution.y;

  // ── Continuous XMB ribbons (physics / wrapping sheets) ──
  float silkLuma = sampleSilk(uv);
  float waveLight = silkLuma * uIntensity * 4.5;
  // Production wave has no brightness halo — mouse only warps band phase
  // (mnudge in waveBand). Keep that interactivity; drop the Gaussian ring.
  float silkA = clamp(waveLight * 1.1, 0.0, 1.0);

  // ── Halftone material riding ON the silk (not replacing it) ──
  // Uniform branches: whole draw takes one path. Morph 3×3 is ~9 extra
  // sampleSilk calls — skip unless melt is actually on.
  float printA = 0.0;
  if (uSilkMix > 0.008) {
    vec2 screenPx = rotate2(frag, uAngleRad);
    float pitch = max(uPitch, 1.5);
    vec2 cell = floor(screenPx / pitch);
    vec2 centerScreen = (cell + 0.5) * pitch;
    vec2 centerFrag = rotate2(centerScreen, -uAngleRad);
    vec2 centerUV = centerFrag / uResolution;
    centerUV.y += uYOffsetPx / uResolution.y;

    float cellSilk = sampleSilk(centerUV) * uIntensity * 4.5;
    float cellCov = clamp(cellSilk - 0.05, 0.0, 1.2);

    float rCrisp = inkRadius(cellCov, pitch);
    float dCrisp = length(frag - centerFrag);
    float crispDot = smoothstep(rCrisp + uInkSoft, rCrisp - uInkSoft, dCrisp);
    float crispVis = smoothstep(uMinDot, uMinDot + 0.06, cellCov);
    float crispA = crispDot * crispVis;
    printA = crispA;

    if (uMorphOn > 0.5) {
      float mouseDist = length(uv - uMouse);
      float melt = (1.0 - smoothstep(0.0, uMorphRadius, mouseDist)) * uMorphStrength;
      float field = 0.0;
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec2 nCell = cell + vec2(float(i), float(j));
          vec2 nCenterS = (nCell + 0.5) * pitch;
          vec2 nCenterF = rotate2(nCenterS, -uAngleRad);
          vec2 nUV = nCenterF / uResolution;
          nUV.y += uYOffsetPx / uResolution.y;
          float nCov = clamp(sampleSilk(nUV) * uIntensity * 4.5 - 0.05, 0.0, 1.2);
          float nR = inkRadius(nCov, pitch) * mix(1.0, uMorphOverlap, melt);
          float nD = length(frag - nCenterF);
          field += (nR * nR) / (nD * nD + 2.0);
        }
      }
      float meltA = smoothstep(uMorphFusion - uMorphSoft, uMorphFusion + uMorphSoft, field);
      meltA *= smoothstep(uMinDot, uMinDot + 0.05, waveLight);
      printA = mix(crispA, meltA, melt);
    }
  }

  // Composite: continuous silk sheet + print texture. silkMix=0 → pure XMB
  // ribbons; 1 → dots only (old v4 look). Default keeps wrapping readable.
  float a = mix(silkA, printA, clamp(uSilkMix, 0.0, 1.0));
  // Keep a whisper of continuous silk even at high silkMix so crests still wrap
  a = max(a, silkA * (1.0 - clamp(uSilkMix, 0.0, 1.0)) * 0.35 + silkA * 0.12 * step(0.55, uSilkMix));

  vec3 col = uInkColor * mix(0.78, uInkDensity, clamp(uSilkMix, 0.0, 1.0));
  vec3 rgb = col * a;

  // Ordered dither + quantization (Heckel) — post on the silk, not a new wave.
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
      morphOn: gl.getUniformLocation(prog, "uMorphOn"),
      morphStrength: gl.getUniformLocation(prog, "uMorphStrength"),
      morphRadius: gl.getUniformLocation(prog, "uMorphRadius"),
      morphFusion: gl.getUniformLocation(prog, "uMorphFusion"),
      morphSoft: gl.getUniformLocation(prog, "uMorphSoft"),
      morphOverlap: gl.getUniformLocation(prog, "uMorphOverlap"),
      bayer: gl.getUniformLocation(prog, "uBayer"),
      bayerSize: gl.getUniformLocation(prog, "uBayerSize"),
      ditherMix: gl.getUniformLocation(prog, "uDitherMix"),
      colorNum: gl.getUniformLocation(prog, "uColorNum"),
      pixelSize: gl.getUniformLocation(prog, "uPixelSize"),
    };

    const bayer4 = uploadBayer(gl, 4);
    const bayer8 = uploadBayer(gl, 8);
    gl.uniform1i(L.bayer, 0);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    // Fullscreen quad overwrites every pixel with premultiplied rgba — skip
    // clear+blend (equivalent to ONE, ONE_MINUS_SRC_ALPHA onto a cleared buffer).
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    function resize() {
      const rect = wrapper!.getBoundingClientRect();
      wrapperRect = rect;
      const scale = Math.min(1, MAX_BUFFER_W / Math.max(rect.width, 1));
      const w = Math.max(2, Math.floor(rect.width * scale));
      const h = Math.max(2, Math.floor(rect.height * scale));
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
      const ic = r.inkColor;
      wrapper!.style.opacity = String(r.opacity);
      gl!.uniform1f(L.time, ms * 0.001);
      gl!.uniform2f(L.res, canvas!.width, canvas!.height);
      gl!.uniform2f(L.mouse, mouse.x, mouse.y);
      gl!.uniform1f(L.intensity, r.intensity);
      gl!.uniform1f(L.mouseNudge, r.mouseNudge);
      gl!.uniform1f(L.aspect, canvas!.height > 0 ? canvas!.width / canvas!.height : 2.414);
      gl!.uniform1f(L.yOffset, r.yOffset);
      gl!.uniform1f(L.speed, r.speed);
      gl!.uniform1f(L.pitch, r.pitch);
      gl!.uniform1f(L.angle, (r.screenAngle * Math.PI) / 180);
      gl!.uniform1f(L.contrast, r.contrast);
      gl!.uniform1f(L.inkSoft, r.inkSoftness);
      gl!.uniform1f(L.inkDensity, r.inkDensity);
      gl!.uniform1f(L.minDot, r.minDot);
      gl!.uniform3f(L.inkColor, ic[0], ic[1], ic[2]);
      gl!.uniform1f(L.silkMix, r.silkMix);
      gl!.uniform1f(L.ditherMix, r.ditherMix);
      gl!.uniform1f(L.bayerSize, r.bayerSize);
      gl!.uniform1f(L.colorNum, r.colorNum);
      gl!.uniform1f(L.pixelSize, r.pixelSize);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, r.bayerSize < 6 ? bayer4 : bayer8);
      gl!.uniform1f(L.morphOn, r.morphOn ? 1 : 0);
      gl!.uniform1f(L.morphStrength, r.morphStrength);
      gl!.uniform1f(L.morphRadius, r.morphRadius);
      gl!.uniform1f(L.morphFusion, r.morphFusion);
      gl!.uniform1f(L.morphSoft, r.morphSoftness);
      gl!.uniform1f(L.morphOverlap, r.morphOverlap);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function frame(ms: number) {
      if (!running) return;
      if (document.hidden) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(frame);
      if (ms - lastT < FRAME_MS) return;
      lastT = ms;
      const lag = refs.current.morphLag;
      mouse.x += (mouse.tx - mouse.x) * lag;
      mouse.y += (mouse.ty - mouse.y) * lag;
      draw(ms);
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
        return;
      }
      if (running && rafId === 0) {
        lastT = 0;
        rafId = requestAnimationFrame(frame);
      }
    }

    resize();
    wrapper.style.opacity = "0.55";
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("visibilitychange", onVisibility);
    rafId = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (!gl.isContextLost()) {
        gl.deleteProgram(prog);
        gl.deleteTexture(bayer4);
        gl.deleteTexture(bayer8);
      }
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
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "transparent",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
