"use client";

import { useEffect, useLayoutEffect as _useLayoutEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";

// SSR-safe useLayoutEffect, matching the pattern used elsewhere in this codebase.
const useLayoutEffect = typeof window !== "undefined" ? _useLayoutEffect : useEffect;

const smoothstep = (t: number) => t * t * (3 - 2 * t);

// Cheap deterministic per-pixel hash (the classic GLSL sin-hash) — good enough
// for dithering, since we only need noise, not real randomness or cross-run
// reproducibility, and it costs nothing extra to compute inline in the pixel loop.
function hash(x: number, y: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

// Renders the falloff as a pre-dithered raster instead of a CSS gradient.
//
// A CSS radial-gradient — no matter how many color-mix() stops you sample it
// at, and no matter how much you blur the result afterwards — still gets
// quantized into an 8-bit-per-channel framebuffer before it reaches the
// screen. Blurring an already-banded layer only softens the edges of bands
// that are already there; it doesn't add back the bit depth that produced
// them, and a static, low-opacity noise overlay is too weak to fully mask a
// large step. The standard fix (the one behind every "buttery smooth"
// gradient on a polished site) is to stop asking the GPU to interpolate the
// gradient at all: compute the falloff yourself, one pixel at a time, and
// dither the rounding error into each pixel's alpha *before* it gets
// quantized — the same trick a proper image editor uses when exporting a
// gradient to a lossy format. The browser then just positions and scales a
// finished bitmap, which is exactly as cheap to composite as the gradient
// was.
//
// This only needs to happen once per parameter change, not per frame — same
// performance profile as the CSS version, just computed up front instead of
// by the GPU's gradient rasterizer.
const CANVAS_SIZE = 512;

function generateDitheredFalloff(feather: number, opacity: number, grain: number, bg: string) {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Resolve the CSS custom property to concrete RGB — a canvas pixel buffer
  // can't reference var(--color-bg) the way the old gradient string could,
  // so we bake in whichever value is active (light/dark) at generation time
  // and regenerate when the theme flips (see the effect below).
  const probe = document.createElement("div");
  probe.style.color = bg;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const [r, g, b] = resolved.match(/\d+/g)!.map(Number);

  const featherFrac = feather / 100;
  const ditherAmount = grain * 6; // ± a handful of 8-bit levels at grain=1
  const half = CANVAS_SIZE / 2;

  const image = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
  const data = image.data;
  for (let py = 0; py < CANVAS_SIZE; py++) {
    const ny = (py - half) / half;
    for (let px = 0; px < CANVAS_SIZE; px++) {
      const nx = (px - half) / half;
      const dist = Math.sqrt(nx * nx + ny * ny);
      const u = featherFrac > 0 ? Math.min(dist / featherFrac, 1) : 1;
      const alpha = (1 - smoothstep(u)) * opacity * 255;
      const dithered = alpha + (hash(px, py) - 0.5) * ditherAmount;
      const i = (py * CANVAS_SIZE + px) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.max(0, Math.min(255, Math.round(dithered)));
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

export default function HeroLegibilityScrim() {
  const dk = useDialKit("Hero Scrim", {
    opacity: [0.69, 0, 1, 0.01],
    width: [86, 20, 100, 1],
    height: [111, 20, 150, 1],
    x: [24, 0, 100, 1],
    y: [53, 0, 100, 1],
    feather: [87, 20, 100, 1],
    // Dither amount — spread into each pixel's alpha at generation time (see
    // generateDitheredFalloff above), not a visible overlay layer, so this
    // now controls real quantization-error diffusion rather than a texture.
    grain: [0.19, 0, 1, 0.01],
    // Outlines the ellipse this shape occupies (dashed) and the edge the
    // falloff actually fades to transparent by (solid) — a tuning aid for
    // width/height/x/y/feather, no effect on the rendered scrim itself.
    debug: false,
  });

  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const themeRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const generate = () => {
      const theme = document.documentElement.getAttribute("data-theme") ?? "dark";
      themeRef.current = theme;
      setDataUrl(generateDitheredFalloff(dk.feather, dk.opacity, dk.grain, "var(--color-bg)"));
    };
    generate();

    // Regenerate on a light/dark switch — the bitmap has a concrete color
    // baked in, unlike the old gradient string which read the CSS variable
    // live, so a theme flip needs a fresh bitmap to match.
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute("data-theme") ?? "dark";
      if (theme !== themeRef.current) generate();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [dk.feather, dk.opacity, dk.grain]);

  // `left/top: X%/Y%` + `translate(-50%,-50%)` centers the element's own
  // middle at X%,Y% of the section — matching the old radial-gradient's
  // `at X% Y%` semantics. (`background-position: X% Y%` on its own does
  // NOT mean this — its offset scales with background-size, so the same
  // 14%/64% pair used to visibly land the center around 37% instead.)
  // Every outline below shares these exact four properties so they can
  // never drift out of sync with what's actually rendered.
  const centered = (widthPct: number, heightPct: number): React.CSSProperties => ({
    position: "absolute",
    left: `${dk.x}%`,
    top: `${dk.y}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <img
        src={dataUrl ?? undefined}
        alt=""
        style={{ ...centered(dk.width, dk.height), objectFit: "fill" }}
      />
      {dk.debug && (
        <>
          {/* Full ellipse this shape occupies — width%/height% at their
              nominal 100% extent, regardless of feather. */}
          <div style={{ ...centered(dk.width, dk.height), border: "1px dashed rgba(255,64,64,0.7)", borderRadius: "50%" }} />
          {/* Where the falloff actually reaches transparent — feather% of
              that same ellipse, i.e. the edge of the visible shadow. */}
          <div style={{ ...centered(dk.width * dk.feather / 100, dk.height * dk.feather / 100), border: "1.5px solid rgba(255,64,64,0.9)", borderRadius: "50%" }} />
          {/* Center point. */}
          <div style={{ ...centered(0, 0), width: 6, height: 6, borderRadius: "50%", background: "rgba(255,64,64,0.9)" }} />
        </>
      )}
    </div>
  );
}
