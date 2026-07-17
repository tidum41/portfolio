"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";

// The dot's SVG content is scale-invariant — a circle inscribed exactly in
// its own width×height box (no viewBox) looks identical at any box size. So
// the actual rendered dot pitch is controlled entirely by the <feImage>'s
// width/height attributes below, not by this string, which means it can be
// frozen as a real constant instead of regenerated (and re-encoded) on every
// dial change or animation frame — the single biggest cost this sweep would
// otherwise pay per tick.
const DOT_SVG =
  `<svg width="1" height="1" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-opacity="1" stop-color="white" /><stop offset="100%" stop-opacity="0" stop-color="white" /></radialGradient></defs><circle cx="0.5" cy="0.5" r="0.5" fill="url(#g)" /></svg>`;
const DOT_DATA_URI = `data:image/svg+xml,${encodeURIComponent(DOT_SVG)}`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface HalftoneFilterDefProps {
  id: string;
  dk: any;
  hoverColor: string;
  /** 0 = crisp text (rest), 1 = fully halftoned — see useHalftoneMorph. */
  t: MotionValue<number>;
}

export function HalftoneFilterDef({ id, dk, hoverColor, t }: HalftoneFilterDefProps) {
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const dotRef = useRef<SVGFEImageElement>(null);
  const matrixRef = useRef<SVGFEColorMatrixElement>(null);

  const dotSizeRest = dk?.dotSizeRest ?? 1;
  const dotSize = dk?.dotSize ?? 4;
  const blurRest = dk?.blurAmountRest ?? 0;
  const blurActive = dk?.blurAmount ?? 1.5;
  const threshMultRest = dk?.thresholdMultRest ?? 1;
  const threshMultActive = dk?.thresholdMult ?? 20;
  const threshOffRest = dk?.thresholdOffsetRest ?? 0;
  const threshOffActive = dk?.thresholdOffset ?? 20;
  const offsetX = dk?.offsetX ?? 0;
  const offsetY = dk?.offsetY ?? 0;

  // Sweeps three primitives together as `progress` moves 0→1:
  //  - the dot grid's pitch (feImage width/height) — the dominant cue, since
  //    a widening pitch is literally the halftone-printing phenomenon: fine
  //    screen reads as continuous tone, coarse screen reads as visible dots.
  //  - blur (feGaussianBlur stdDeviation) — softens glyph edges just enough
  //    that, combined with the widening pitch, the multiply step below
  //    carves round blobs instead of jagged pixel steps as the grid coarsens.
  //  - the threshold curve (feColorMatrix) — without sweeping this too, the
  //    mid-transition would just look blurry rather than "forming dots"; it
  //    starts at an identity pass-through (alpha = alpha) and ramps up to
  //    today's aggressive crush that turns the graduated multiply into hard
  //    circular silhouettes.
  // Plain setAttribute writes driven by the motion value's own change event,
  // bypassing React's render cycle entirely — the same imperative-ref
  // pattern this codebase already uses for canvas/SVG work elsewhere
  // (RabbitHoleVideo.tsx), just applied to filter primitives here.
  const applyAt = (progress: number) => {
    // `progress` is a spring value, not a clamped 0..1 fraction — the
    // deliberately underdamped "out" spring (see Nav.tsx's stiffnessOut/
    // dampingOut) overshoots past 0 on purpose, for a bubbly wobble as the
    // dot grid settles. That's fine for dot pitch (its rest value, 1, has
    // headroom below it), but blur/threshold sit right at the floor of what
    // SVG accepts — stdDeviation must be non-negative, and an unclamped
    // negative threshOffset would even format into an invalid malformed
    // value ("--0.07") in the matrix string below. Only dot pitch is left
    // free to overshoot; everything else clamps to its valid range so the
    // wobble reads as "dots pulsing," not a filter glitch.
    const size = Math.max(0.1, lerp(dotSizeRest, dotSize, progress));
    const blur = Math.max(0, lerp(blurRest, blurActive, progress));
    const threshMult = Math.max(0, lerp(threshMultRest, threshMultActive, progress));
    const threshOff = Math.max(0, lerp(threshOffRest, threshOffActive, progress));

    dotRef.current?.setAttribute("width", String(size));
    dotRef.current?.setAttribute("height", String(size));
    dotRef.current?.setAttribute("x", String(offsetX));
    dotRef.current?.setAttribute("y", String(offsetY));
    blurRef.current?.setAttribute("stdDeviation", String(blur));
    matrixRef.current?.setAttribute(
      "values",
      `0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${threshMult} ${-threshOff / 10}`
    );
  };

  useMotionValueEvent(t, "change", applyAt);

  // useMotionValueEvent only fires when `t` itself changes — if a dial value
  // (e.g. dotSize) is tuned while sitting idle at rest, nothing above would
  // reapply it until the next hover. Re-run the same sweep at the current
  // progress whenever any endpoint value changes so DialKit tuning is live.
  useEffect(() => {
    applyAt(t.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotSizeRest, dotSize, blurRest, blurActive, threshMultRest, threshMultActive, threshOffRest, threshOffActive, offsetX, offsetY]);

  return (
    <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none", color: hoverColor }}>
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation={blurRest} result="blurredText" />

          <feImage ref={dotRef} href={DOT_DATA_URI} x={offsetX} y={offsetY} width={dotSizeRest} height={dotSizeRest} preserveAspectRatio="none" result="dot" />
          <feTile in="dot" result="pattern" />

          <feComposite
            in="blurredText"
            in2="pattern"
            operator="arithmetic"
            k1="1"
            k2="0"
            k3="0"
            k4="0"
            result="added"
          />

          <feColorMatrix ref={matrixRef} type="matrix" in="added" values={`
            0 0 0 0 1
            0 0 0 0 1
            0 0 0 0 1
            0 0 0 ${threshMultRest} -${threshOffRest / 10}
          `} result="halftoneMask" />

          <feFlood floodColor="currentColor" result="flood" />
          <feComposite in="flood" in2="halftoneMask" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
