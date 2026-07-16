"use client";

import { useMemo } from "react";
import { useDialKit } from "dialkit";

// Smoothstep-shaped falloff (zero derivative at both t=0 and t=1) instead of
// a hard 2-stop linear ramp. A plain 2-stop radial-gradient has a visible
// "seam" right where the fade starts and another right where it ends — this
// spreads the same fade across several stops following an eased curve so
// there's no perceptible edge at either end, just a smooth dome.
const CURVE_STEPS = [0, 0.16, 0.34, 0.54, 0.74, 0.9, 1] as const;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// Fading a color to the bare `transparent` keyword doesn't just drop alpha —
// `transparent` is rgba(0,0,0,0), so the RGB channels drift toward black as
// they fade too, which is the other classic source of visible muddying/
// banding in fade-to-transparent gradients. color-mix() keeps every stop on
// --color-bg's own hue and only varies alpha, which is what actually reads
// as "this looks like it has less opacity" rather than "a shadow appeared."
// This is most visible in dark mode: --color-bg is near-black (#101214), so
// any residual 8-bit alpha step is far more perceptible there (Weber's law —
// small absolute steps show up much more at low luminance) and gets amplified
// further by compositing on top of PS3Silk's moving, high-contrast pattern.
function scrimGradient(width: number, height: number, x: number, y: number, feather: number, opacity: number) {
  const stops = CURVE_STEPS.map((t) => {
    const alphaPct = (1 - smoothstep(t)) * opacity * 100;
    return `color-mix(in oklab, var(--color-bg) ${alphaPct.toFixed(1)}%, transparent) ${(t * feather).toFixed(1)}%`;
  }).join(", ");
  return `radial-gradient(ellipse ${width}% ${height}% at ${x}% ${y}%, ${stops})`;
}

// Tiny tileable alpha noise (feTurbulence) that dithers away whatever 8-bit
// alpha-quantization banding the smooth gradient above still leaves on the
// framebuffer. This is the standard fix for gradient banding: it doesn't add
// real bit depth, it just randomizes the quantization error spatially so the
// eye reads smooth gradation instead of discrete rings. A single small static
// raster the browser rasterizes once and tiles — no per-frame cost, and it
// never touches PS3Silk's WebGL canvas.
const NOISE_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function HeroLegibilityScrim() {
  const dk = useDialKit("Hero Scrim", {
    opacity: [0.6, 0, 1, 0.01],
    width: [59, 20, 100, 1],
    height: [85, 20, 150, 1],
    x: [14, 0, 100, 1],
    y: [50, 0, 100, 1],
    feather: [61, 20, 100, 1],
    // Dither strength — masked to the scrim's own footprint below, so it
    // only ever shows up exactly where the dimming is visible, never beyond it.
    grain: [0.35, 0, 1, 0.01],
    // A slight blur on the gradient layer (not the grain layer — see below)
    // erases residual 8-bit alpha-quantization banding directly rather than
    // just camouflaging it: a low-pass filter mathematically averages
    // neighboring quantization steps into a continuous-looking transition.
    // The masked noise below helps too, but its own mask is this same
    // gradient, so any banding baked into it "shows through" the mask at the
    // same spots — the blur is what actually removes it at the source.
    blur: [46, 0, 64, 1],
  });

  // Memoized so tuning `grain`/`blur` alone (which don't affect the gradient
  // shape itself) doesn't regenerate this string and repaint the base layer.
  const gradient = useMemo(
    () => scrimGradient(dk.width, dk.height, dk.x, dk.y, dk.feather, dk.opacity),
    [dk.width, dk.height, dk.x, dk.y, dk.feather, dk.opacity],
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: gradient,
          filter: dk.blur > 0 ? `blur(${dk.blur}px)` : undefined,
        }}
      />
      {dk.grain > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: NOISE_TILE,
            backgroundSize: "64px 64px",
            backgroundRepeat: "repeat",
            // Reuse the exact same gradient as a mask, so the dither only
            // appears in proportion to the scrim's own alpha at every point —
            // full strength at the center, gone by the feather edge, never
            // visible past where the dimming itself would be.
            WebkitMaskImage: gradient,
            maskImage: gradient,
            opacity: dk.grain,
            mixBlendMode: "overlay",
          }}
        />
      )}
    </>
  );
}
