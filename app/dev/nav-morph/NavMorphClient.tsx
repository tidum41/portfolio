"use client";

import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HalftoneDotField } from "@/components/HalftoneDotField";
import OutlineMorphWord from "@/components/OutlineMorphWord";
import { useHalftoneMorph } from "@/components/useHalftoneMorph";

const LABELS = ["work", "archive", "about"] as const;

// Resolved defaults from Nav.tsx's "Nav Links" DialKit config. Passed in
// as a plain object so this lab does not mount a second dial panel.
const NAV_DK = {
  enabled: true,
  keepEffectOn: false,
  dotShape: {
    dotSpacing: 2.25,
    dotSize: 0.8,
    sizeContrast: 0.95,
    minVisibility: 0.07,
    gridShiftX: 0,
    gridShiftY: 0,
  },
  ripple: {
    rippleSpread: 0.1,
    rippleRandomness: 0.25,
    rippleOutward: true,
  },
  meltEffect: {
    blurStrength: 0.35,
    meltPeakTiming: 0.45,
    dotOverlapAmount: 1.25,
    edgeSharpness: 12,
    fusionTightness: 6,
    textMeltDuration: 0.4,
    extraSoftness: 0,
  },
  showHideSpeed: {
    showDurationMs: 220,
    hideDurationMs: 550,
    slowMotion: 1,
  },
  bouncePhysics: {
    activateSpeed: 260,
    activateSmoothness: 20,
    settleSpeed: 13,
    settleWobbleControl: 3.2,
    textEndScale: 1,
    dotsEndScale: 1,
  },
};

const SLOW_DK = {
  ...NAV_DK,
  showHideSpeed: {
    showDurationMs: 2600,
    hideDurationMs: 2600,
    slowMotion: 10,
  },
};

function MeltWord({ label, dk }: { label: string; dk: typeof NAV_DK }) {
  const [hovered, setHovered] = useState(false);
  const active = dk.enabled ? hovered || dk.keepEffectOn : false;
  const { filterId, t } = useHalftoneMorph(dk, active);
  const reduced = useReducedMotion();
  const showMs = dk.showHideSpeed.showDurationMs;
  const hideMs = dk.showHideSpeed.hideDurationMs;
  const overlayMs = reduced ? 0.001 : active ? showMs : hideMs;
  const baseMs = reduced ? 0.001 : active ? showMs : Math.min(hideMs, 120);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        height: 24,
        fontSize: 16,
        fontWeight: 400,
        lineHeight: "24px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <motion.span
        style={{
          color: "var(--color-text-muted)",
          fontWeight: 400,
          fontSize: 16,
          display: "inline-flex",
          alignItems: "center",
        }}
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={{ duration: baseMs / 1000, ease: "easeInOut" }}
      >
        {label}
      </motion.span>
      <motion.span
        aria-hidden
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: overlayMs / 1000, ease: "easeInOut" }}
      >
        <HalftoneDotField
          id={filterId}
          dk={dk}
          hoverColor="var(--color-text-primary)"
          t={t}
          content={{
            type: "text",
            text: label,
            fontWeight: 400,
            fontSizePx: 16,
            lineHeightPx: 24,
          }}
        />
      </motion.span>
    </span>
  );
}

function OutlineWordButton({
  label,
  slow,
  hold,
}: {
  label: string;
  slow: boolean;
  hold: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "inline-flex", cursor: "pointer" }}
    >
      <OutlineMorphWord
        label={label}
        active={hovered}
        duration={slow ? 2.6 : undefined}
        pinned={hold ? 0.5 : null}
      />
    </span>
  );
}

export default function NavMorphClient() {
  const [slow, setSlow] = useState(false);
  const [hold, setHold] = useState(false);
  const reduced = useReducedMotion();
  const dk = slow ? SLOW_DK : NAV_DK;

  return (
    <div
      data-nav-morph
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "var(--grid-max-w)",
        margin: "0 auto",
        padding: "48px var(--page-px) 96px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 13,
          lineHeight: "20px",
          color: "var(--color-text-muted)",
        }}
      >
        Nav morph
      </p>
      <p
        style={{
          margin: "0 0 28px",
          maxWidth: 460,
          fontSize: 16,
          fontWeight: 400,
          lineHeight: "24px",
          color: "var(--color-text-primary)",
        }}
      >
        The live nav uses the outline morph. This page keeps the previous melt
        beside it. Hover a word. The two sides do not share a hover.
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
        <button
          type="button"
          onClick={() => setSlow((value) => !value)}
          style={toggleStyle(slow)}
        >
          {slow ? "Speed: slow" : "Speed: normal"}
        </button>
        <button
          type="button"
          onClick={() => setHold((value) => !value)}
          style={toggleStyle(hold)}
        >
          {hold ? "Outline held midway" : "Hold outline midway"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 48,
          alignItems: "start",
        }}
      >
        <section>
          <h2 style={labelStyle}>Previous melt</h2>
          <div style={rowStyle}>
            {LABELS.map((label) => (
              <MeltWord key={label} label={label} dk={dk} />
            ))}
          </div>
          <p style={noteStyle}>
            Crossfade and blur. The solid word fades out while the dots fade
            in. The letterforms are not interpolated. This is no longer what
            the primary nav uses.
          </p>
        </section>

        <section>
          <h2 style={labelStyle}>Outline morph</h2>
          <div style={rowStyle}>
            {LABELS.map((label) => (
              <OutlineWordButton
                key={label}
                label={label}
                slow={slow}
                hold={hold}
              />
            ))}
          </div>
          <p style={noteStyle}>
            Shape morph. Each droplet starts as a piece of the ABC Areal
            outline and the path deforms into the dot. This is the live nav.
            {reduced ? " Reduced motion is on, so this side jumps." : ""}
          </p>
        </section>
      </div>
    </div>
  );
}

const labelStyle = {
  margin: "0 0 20px",
  fontSize: 13,
  fontWeight: 400,
  lineHeight: "20px",
  letterSpacing: "0.04em",
  color: "var(--color-text-muted)",
} as const;

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 40,
  minHeight: 24,
} as const;

const noteStyle = {
  margin: "20px 0 0",
  maxWidth: 360,
  fontSize: 14,
  lineHeight: "22px",
  color: "var(--color-text-muted)",
} as const;

function toggleStyle(on: boolean): CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid color-mix(in srgb, var(--color-text-muted) 35%, transparent)",
    background: on ? "color-mix(in srgb, var(--color-text-primary) 8%, transparent)" : "transparent",
    color: "var(--color-text-primary)",
    font: "inherit",
    fontSize: 13,
    lineHeight: "20px",
    cursor: "pointer",
  };
}
