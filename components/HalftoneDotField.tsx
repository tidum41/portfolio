"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { buildTextMask, buildIconMask, dotLocalProgress, gooHump, type HalftoneDot } from "./halftoneMask";

type Content =
  | { type: "text"; text: string; fontWeight: number; fontSizePx: number; lineHeightPx: number }
  | { type: "icon"; svgMarkup: string; sizeCss: number; cloneInner: string };

interface HalftoneDotFieldProps {
  id: string;
  dk: any;
  hoverColor: string;
  /** 0 = rest (no dots), 1 = fully formed — see useHalftoneMorph. */
  t: MotionValue<number>;
  content: Content;
}

/**
 * Renders the halftone effect as real, independently-animated SVG `<circle>`
 * elements instead of an SVG filter — see the halftone-morph-redesign plan
 * for why: `feTile` (the previous approach) can only repeat one identical
 * tile in lockstep, so per-dot stagger ("ink droplets" each settling on
 * their own schedule) is architecturally impossible with it.
 *
 * A live "clone" of the crisp glyph/icon (an SVG `<text>` for labels, a
 * cloned icon `<g>` for icons) renders *inside the same goo-filtered `<g>`*
 * as the dots — this is what makes the effect read as one continuous shape
 * deforming rather than two layers (crisp DOM text, blurred dot overlay)
 * crossfading: because the clone and the dots share one blur+threshold
 * pass, the clone visibly softens/deforms as it fades (not just goes
 * transparent while staying sharp), and its fading edges optically merge
 * with the growing, equally-blurred dots instead of looking like two
 * unrelated things swapping. The clone's own opacity fades out fast (see
 * `cloneFadeT`) and back in symmetrically, independent of the outer
 * base/overlay crossfade in the consumers — see `draw()` below for why.
 *
 * Three phases, matching this codebase's existing imperative-ref idiom
 * (see RabbitHoleVideo.tsx's setSpriteFrame for the precedent):
 *  1. BAKE (async, debounced on dial changes) — rasterizes the real glyph/
 *     icon shape offscreen once via halftoneMask.ts and gets back a dot
 *     list (+ baseline position for text). This is the only step that
 *     touches React state (mounts/unmounts the right number of <circle>
 *     elements).
 *  2. DRAW (every `t` tick) — plain setAttribute calls per dot/filter/clone,
 *     driven by useMotionValueEvent, bypassing React's render cycle
 *     entirely so a spring settling at 60fps never re-renders this
 *     component.
 */
export function HalftoneDotField({ id, dk, hoverColor, t, content }: HalftoneDotFieldProps) {
  const [dots, setDots] = useState<HalftoneDot[]>([]);
  const [box, setBox] = useState({ width: 0, height: 0, baselineY: 0 });
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const cloneRef = useRef<SVGGraphicsElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const matrixRef = useRef<SVGFEColorMatrixElement>(null);
  const rebakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dotPitch = dk?.dotShape?.dotSpacing ?? 3;
  const dotMaxRadius = dk?.dotShape?.dotSize ?? 1.6;
  const coverageGamma = dk?.dotShape?.sizeContrast ?? 0.85;
  const coverageThreshold = dk?.dotShape?.minVisibility ?? 0.04;
  const gridOffsetX = dk?.dotShape?.gridShiftX ?? 0;
  const gridOffsetY = dk?.dotShape?.gridShiftY ?? 0;
  const staggerJitter = dk?.ripple?.rippleRandomness ?? 0.35;
  const staggerOutward = dk?.ripple?.rippleOutward ?? true;
  const staggerSpread = dk?.ripple?.rippleSpread ?? 0.45;
  const overlayBlur = dk?.meltEffect?.extraSoftness ?? 0;
  const gooPeakBlur = dk?.meltEffect?.blurStrength ?? 0.35;
  const gooPeakPosition = dk?.meltEffect?.meltPeakTiming ?? 0.45;
  const gooRadiusBoost = dk?.meltEffect?.dotOverlapAmount ?? 1.25;
  const gooThresholdSteepness = dk?.meltEffect?.edgeSharpness ?? 14;
  const gooThresholdOffset = dk?.meltEffect?.fusionTightness ?? 7;
  // Fraction of |t| within which the glyph-clone fades out (activating) or
  // back in (deactivating). Deliberately independent of the outer
  // base/overlay crossfade duration (showDurationMs/hideDurationMs in the
  // consumers) — that outer crossfade guarantees SOMETHING is always
  // visible (see useHalftoneMorph.ts); this inner fade governs how much of
  // the *shared-filter* transition is "clone melting" vs "pure dots", tied
  // to the spring `t` (not wall-clock time) so it naturally lines up with
  // the goo hump regardless of spring tuning.
  const cloneFadeT = dk?.meltEffect?.textMeltDuration ?? 0.4;

  const draw = (globalT: number) => {
    // One shared "hump" — 0 at rest/fully-active, peaking mid-transition —
    // drives blur, threshold steepness, and a transient radius boost
    // together, so all three hit exact identity at both endpoints in
    // lockstep (see gooHump's doc comment in halftoneMask.ts for why lerping
    // from anything but true identity is a trap). This is what turns
    // "dots fading in" into "letter condensing into dots": boosted,
    // overlapping dots + blur + a steep alpha threshold visually fuse into
    // one connected blob at the peak, then resolve back into crisp
    // separated circles as the hump recedes.
    const hump = gooHump(globalT, gooPeakPosition);
    const stdDev = hump * gooPeakBlur;
    const matrixMult = 1 + hump * (gooThresholdSteepness - 1);
    const matrixOffset = hump * gooThresholdOffset;
    const radiusBoost = 1 + hump * (gooRadiusBoost - 1);

    blurRef.current?.setAttribute("stdDeviation", String(stdDev));
    matrixRef.current?.setAttribute(
      "values",
      `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${matrixMult} ${-matrixOffset}`
    );

    // Symmetric in |t| by design (not the signed value) — the clone should
    // be gone whenever we're meaningfully away from rest in EITHER
    // direction (activating, or mid-exit-before-settling), and present only
    // right at rest. cloneFadeT is deliberately tuned close to
    // gooPeakPosition (not a small fraction of it) so the fade-out window
    // spans roughly the same real time as the hump's rise to peak: at the
    // moment the clone finally hits 0 (|t| = cloneFadeT = 0.4, vs. hump's
    // peak at 0.45), hump is already ~0.97 of its peak, so stdDev/threshold
    // are already ~97% of maximum. That's what makes the crisp shape
    // visibly soften and deform *while* it fades, instead of finishing a
    // fast opacity dissolve before blur has done anything perceptible (the
    // bug at the old default of 0.15 — verified by sampling live: cloneOp
    // hit 0 while stdDev was still under half its eventual peak).
    const cloneOpacity = Math.max(0, 1 - Math.abs(globalT) / cloneFadeT);
    cloneRef.current?.setAttribute("opacity", String(cloneOpacity));

    for (let i = 0; i < dots.length; i++) {
      const local = dotLocalProgress(globalT, dots[i].phase, staggerSpread);
      // Bounded, not clamped to [0,1] — the underdamped out-spring sends
      // globalT slightly negative on purpose (see useHalftoneMorph.ts), and
      // letting each dot's local progress overshoot past its own window the
      // same way is what makes the settle read as a wobble/bubble per dot
      // instead of a hard stop.
      const clamped = Math.min(1.15, Math.max(-0.3, local));
      const r = Math.max(0, clamped * dots[i].maxRadius * radiusBoost);
      circleRefs.current[i]?.setAttribute("r", String(r));
    }
  };

  useMotionValueEvent(t, "change", draw);

  // Rebake whenever the content or any shape-affecting dial changes.
  // Debounced so dragging a DialKit slider doesn't synchronously re-rasterize
  // + getImageData on every intermediate value.
  useEffect(() => {
    if (rebakeTimeoutRef.current) clearTimeout(rebakeTimeoutRef.current);

    const opts = {
      pitch: dotPitch,
      maxRadius: dotMaxRadius,
      coverageGamma,
      coverageThreshold,
      offsetX: gridOffsetX,
      offsetY: gridOffsetY,
      staggerJitter,
      staggerOutward,
    };

    const bake = async () => {
      const result =
        content.type === "text"
          ? await buildTextMask(content.text, content.fontWeight, content.fontSizePx, content.lineHeightPx, opts)
          : await buildIconMask(content.svgMarkup, content.sizeCss, opts);
      circleRefs.current = new Array(result.dots.length).fill(null);
      setDots(result.dots);
      setBox({ width: result.width, height: result.height, baselineY: result.baselineY ?? 0 });
    };

    rebakeTimeoutRef.current = setTimeout(bake, 100);
    return () => {
      if (rebakeTimeoutRef.current) clearTimeout(rebakeTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    content.type,
    content.type === "text" ? content.text : content.svgMarkup,
    content.type === "text" ? content.fontWeight : content.sizeCss,
    content.type === "text" ? content.fontSizePx : undefined,
    content.type === "text" ? content.lineHeightPx : undefined,
    dotPitch, dotMaxRadius, coverageGamma, coverageThreshold,
    gridOffsetX, gridOffsetY, staggerJitter, staggerOutward,
  ]);

  // A fresh bake starts every dot at r=0 — reapply the current progress
  // immediately so a live DialKit change (e.g. staggerSpread, or any of the
  // goo params below, none of which trigger a rebake) or a rebake mid-hover
  // doesn't visibly flash to empty. This is also what makes previewActive
  // (see Nav.tsx) useful: with the effect pinned active, dragging a goo
  // slider re-runs draw() at the current `t` immediately instead of waiting
  // for the next real animation frame.
  useEffect(() => {
    draw(t.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dots, staggerSpread, gooPeakBlur, gooPeakPosition, gooRadiusBoost, gooThresholdSteepness, gooThresholdOffset, cloneFadeT]);

  return (
    <svg
      id={id}
      aria-hidden
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      style={{
        position: "absolute",
        inset: 0,
        margin: "auto",
        color: hoverColor,
        filter: overlayBlur ? `blur(${overlayBlur}px)` : undefined,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        {/* Goo/metaball filter — RGB rows stay identity since every dot is
            already the correct currentColor, only alpha needs reshaping.
            stdDeviation and the matrix's alpha row are rewritten every frame
            in draw(), starting from this literal-identity resting state. */}
        <filter id={`${id}-goo`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="0" result="blur" />
          <feColorMatrix
            ref={matrixRef}
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
          />
        </filter>
      </defs>
      <g filter={`url(#${id}-goo)`}>
        {/* Live glyph/icon clone — shares this filter with the dots, see the
            file-level doc comment for why. */}
        {content.type === "text" ? (
          <text
            ref={(el) => {
              cloneRef.current = el;
            }}
            x={2}
            y={box.baselineY}
            fontFamily="var(--font-sans)"
            fontWeight={content.fontWeight}
            fontSize={content.fontSizePx}
            fill="currentColor"
          >
            {content.text}
          </text>
        ) : (
          <svg width={content.sizeCss} height={content.sizeCss} viewBox="0 0 24 24">
            <g
              ref={(el) => {
                cloneRef.current = el;
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: content.cloneInner }}
            />
          </svg>
        )}
        {dots.map((d, i) => (
          <circle
            key={i}
            ref={(el) => {
              circleRefs.current[i] = el;
            }}
            cx={d.x}
            cy={d.y}
            r={0}
            fill="currentColor"
            data-phase={d.phase}
            data-maxr={d.maxRadius}
          />
        ))}
      </g>
    </svg>
  );
}
