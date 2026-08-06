"use client";

/**
 * PS3SilkLab v9 — visual reference preset + gated print/morph for perf.
 *
 * Defaults bake Mudit's DialKit look (soft wrap + print silkMix 0.46, morph off).
 * Shader skips print when silkMix≈0 and skips the 3×9 morph sampleSilk loop
 * unless morph is on — so this look stays shippable without the lab tax.
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

export default function PS3SilkLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dk = useDialKit(
    "PS3 Wave Lab",
    {
      // Visual reference preset (Aug 2026) — wrap + soft print; morph off for perf
      silk: {
        parallax: [0.065, 0, 0.22, 0.005],
        crestBoost: [0.14, 0, 1.2, 0.01],
        harmonic: [0.36, 0, 0.55, 0.01],
        sheetSoft: [0.6, 0, 1, 0.01],
      },
      print: {
        pitch: [6.3, 2.2, 6.5, 0.1],
        screenAngle: [0, 0, 45, 0.5],
        contrast: [1.25, 0.45, 1.4, 0.05],
        inkSoftness: [0.85, 0.35, 2.2, 0.05],
        inkDensity: [0.43, 0.3, 0.9, 0.01],
        minDot: [0.05, 0, 0.15, 0.005],
        inkColor: { type: "color", default: "#ffffff" },
        silkMix: [0.46, 0, 1, 0.01],
      },
      plate: {
        intensity: [0.19, 0.06, 0.4, 0.005],
        mouseNudge: [0, 0, 0.28, 0.005],
        speed: [0.92, 0.15, 2.0, 0.01],
        yOffset: [49, -20, 100, 1],
        opacity: [0.33, 0.25, 0.9, 0.01],
      },
      morph: {
        _collapsed: true,
        enabled: false,
        strength: [0.55, 0, 1, 0.01],
        radius: [0.22, 0.1, 0.5, 0.01],
        fusion: [0.55, 0.2, 1.1, 0.01],
        softness: [0.14, 0.04, 0.35, 0.01],
        overlap: [1.15, 0.9, 1.7, 0.05],
        lag: [0.055, 0.02, 0.14, 0.005],
      },
    },
    {
      id: "ps3-wave-lab-v9",
      persist: {
        key: "ps3-wave-lab-v9",
        storage: "localStorage",
        presets: true,
      },
    },
  );

  const refs = useRef({
    pitch: 6.3,
    screenAngle: 0,
    contrast: 1.25,
    inkSoftness: 0.85,
    inkDensity: 0.43,
    minDot: 0.05,
    inkColor: [1, 1, 1] as [number, number, number],
    silkMix: 0.46,
    parallax: 0.065,
    crestBoost: 0.14,
    harmonic: 0.36,
    sheetSoft: 0.6,
    morphOn: false,
    morphStrength: 0.55,
    morphRadius: 0.22,
    morphFusion: 0.55,
    morphSoftness: 0.14,
    morphOverlap: 1.15,
    morphLag: 0.055,
    intensity: 0.19,
    mouseNudge: 0,
    speed: 0.92,
    yOffset: 49,
    opacity: 0.33,
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
    r.parallax = dk.silk.parallax;
    r.crestBoost = dk.silk.crestBoost;
    r.harmonic = dk.silk.harmonic;
    r.sheetSoft = dk.silk.sheetSoft;
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
      preserveDrawingBuffer: false,
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
uniform float uParallax;
uniform float uCrestBoost;
uniform float uHarmonic;
uniform float uSheetSoft;
uniform float uMorphOn;
uniform float uMorphStrength;
uniform float uMorphRadius;
uniform float uMorphFusion;
uniform float uMorphSoft;
uniform float uMorphOverlap;

// Production PS3Silk band DNA + wrap cues from frame analysis
float waveBand(vec2 uv, float uvx, float spd, float freq, float amp,
  float phase, float cy, float width, float sharp, bool flip,
  float paraSign, float harmPhase) {
  float md = length(uv - uMouse);
  float mnudge = smoothstep(0.45, 0.0, md) * uMouseNudge;
  // Parallax: layer-scaled x phase → L/R crest y divergence (ps3silk lag)
  float px = uvx + paraSign * uParallax * (uv.x - 0.5) * 2.0;
  float angle = uTime * uSpeed * spd * freq * -1.0 + (phase + px + mnudge) * 2.0;
  // Secondary harmonic — fine filaments inside broader sheets
  float harm = sin(angle * 2.0 + harmPhase) * amp * uHarmonic * 0.35;
  float wy = sin(angle) * amp + harm + cy;
  float dy = wy - uv.y;
  float dist = abs(dy);
  if (flip) { if (dy > 0.0) dist *= 4.0; }
  else       { if (dy < 0.0) dist *= 4.0; }
  // Higher sheetSoft → wider, softer translucent edges (refs: bloom not hard lines)
  float softW = mix(width * 1.5, width * 1.9, clamp(uSheetSoft, 0.0, 1.0));
  float softPow = mix(sharp, sharp * 0.68, clamp(uSheetSoft, 0.0, 1.0));
  float s = smoothstep(softW, 0.0, dist);
  return pow(s, softPow);
}

float sampleSilk(vec2 uv) {
  float aspectScale = uAspect / 2.414;
  float uvx = uv.x * aspectScale;
  float c = 0.0;
  // Down-facing sheets (paraSign +) — production weights preserved
  c += waveBand(uv,uvx,0.18,0.22,0.32,0.00,0.62,0.090,18.0,false, 1.00, 0.0) * 0.90;
  c += waveBand(uv,uvx,0.38,0.42,0.24,0.00,0.62,0.085,20.0,false, 0.55, 1.2) * 0.68;
  c += waveBand(uv,uvx,0.28,0.62,0.20,0.00,0.62,0.042,28.0,false, 0.25, 2.4) * 0.38;
  c += waveBand(uv,uvx,0.12,0.18,0.14,0.00,0.62,0.065,22.0,false, 0.80, 0.6) * 0.16;
  // Up-facing sheets (paraSign −) — opposing wrap / depth
  c += waveBand(uv,uvx,0.14,0.28,0.14,0.00,0.58,0.095,20.0,true, -0.90, 1.7) * 0.84;
  c += waveBand(uv,uvx,0.33,0.39,0.11,0.00,0.58,0.088,22.0,true, -0.50, 3.1) * 0.62;
  c += waveBand(uv,uvx,0.48,0.50,0.09,0.00,0.56,0.040,30.0,true, -0.30, 0.9) * 0.32;
  c += waveBand(uv,uvx,0.22,0.57,0.08,0.00,0.52,0.160,18.0,true, -1.10, 2.0) * 0.14;
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
  vec2 uv = frag / uResolution;
  uv.y += uYOffsetPx / uResolution.y;

  // ── Continuous XMB ribbons (one sampleSilk — the beauty / wrap path) ──
  float silkLuma = sampleSilk(uv);
  float waveLight = silkLuma * uIntensity * 4.5;
  float mouseDist = length(uv - uMouse);

  float crest = pow(clamp(silkLuma, 0.0, 1.0), 1.35);
  float silkA = clamp(
    waveLight * (1.05 + uCrestBoost * crest * 0.85),
    0.0, 1.0
  );

  float mixAmt = clamp(uSilkMix, 0.0, 1.0);
  float a = silkA;
  float printA = 0.0;

  // Print only when mixed in — skip second silk sample + grid when silkMix≈0
  if (mixAmt > 0.001) {
    vec2 screenPx = rotate2(frag, uAngleRad);
    float pitch = max(uPitch, 1.5);
    vec2 cell = floor(screenPx / pitch);
    vec2 centerScreen = (cell + 0.5) * pitch;
    vec2 centerFrag = rotate2(centerScreen, -uAngleRad);
    vec2 centerUV = centerFrag / uResolution;
    centerUV.y += uYOffsetPx / uResolution.y;

    float cellSilk = sampleSilk(centerUV);
    float cellLight = cellSilk * uIntensity * 4.5;
    float cellCov = clamp(cellLight - 0.05, 0.0, 1.2);

    float rCrisp = inkRadius(cellCov, pitch);
    float dCrisp = length(frag - centerFrag);
    float crispDot = smoothstep(rCrisp + uInkSoft, rCrisp - uInkSoft, dCrisp);
    float crispVis = smoothstep(uMinDot, uMinDot + 0.06, cellCov);
    float crestMask = smoothstep(0.12, 0.55, cellSilk);
    float crispA = crispDot * crispVis * mix(0.35, 1.0, crestMask);

    // Morph 3×3 is expensive (9× sampleSilk) — only when enabled + near cursor
    float melt = 0.0;
    float meltA = 0.0;
    if (uMorphOn > 0.5) {
      melt = (1.0 - smoothstep(0.0, uMorphRadius, mouseDist)) * uMorphStrength;
      if (melt > 0.01) {
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
        meltA = smoothstep(uMorphFusion - uMorphSoft, uMorphFusion + uMorphSoft, field);
        meltA *= smoothstep(uMinDot, uMinDot + 0.05, waveLight) * mix(0.35, 1.0, crestMask);
      }
    }
    printA = mix(crispA, meltA, melt);
    a = mix(silkA, printA, mixAmt);
    a = max(a, silkA * (1.0 - mixAmt) * 0.40 + silkA * 0.14 * step(0.45, mixAmt));
  }

  vec3 col = uInkColor * mix(0.82, uInkDensity, mixAmt);
  gl_FragColor = vec4(col * a, a);
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
      parallax: gl.getUniformLocation(prog, "uParallax"),
      crestBoost: gl.getUniformLocation(prog, "uCrestBoost"),
      harmonic: gl.getUniformLocation(prog, "uHarmonic"),
      sheetSoft: gl.getUniformLocation(prog, "uSheetSoft"),
      morphOn: gl.getUniformLocation(prog, "uMorphOn"),
      morphStrength: gl.getUniformLocation(prog, "uMorphStrength"),
      morphRadius: gl.getUniformLocation(prog, "uMorphRadius"),
      morphFusion: gl.getUniformLocation(prog, "uMorphFusion"),
      morphSoft: gl.getUniformLocation(prog, "uMorphSoft"),
      morphOverlap: gl.getUniformLocation(prog, "uMorphOverlap"),
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
      gl!.uniform1f(L.parallax, r.parallax);
      gl!.uniform1f(L.crestBoost, r.crestBoost);
      gl!.uniform1f(L.harmonic, r.harmonic);
      gl!.uniform1f(L.sheetSoft, r.sheetSoft);
      gl!.uniform1f(L.morphOn, r.morphOn ? 1 : 0);
      gl!.uniform1f(L.morphStrength, r.morphStrength);
      gl!.uniform1f(L.morphRadius, r.morphRadius);
      gl!.uniform1f(L.morphFusion, r.morphFusion);
      gl!.uniform1f(L.morphSoft, r.morphSoftness);
      gl!.uniform1f(L.morphOverlap, r.morphOverlap);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function frame(ms: number) {
      if (!running) return;
      rafId = requestAnimationFrame(frame);
      if (ms - lastT < FRAME_MS) return;
      lastT = ms;
      const lag = refs.current.morphLag;
      mouse.x += (mouse.tx - mouse.x) * lag;
      mouse.y += (mouse.ty - mouse.y) * lag;
      draw(ms);
    }

    resize();
    wrapper.style.opacity = "0.33";
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
        opacity: 0.33,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}
