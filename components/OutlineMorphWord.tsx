"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { OUTLINE_WORDS, type OutlineWord } from "./outlineMorphData";

/** Same timing the /dev/nav-morph preview was approved at. */
export const OUTLINE_MORPH_S = 0.32;

const WORDS = new Map<string, OutlineWord>(
  OUTLINE_WORDS.map((word) => [word.label, word]),
);

function DropletPath({
  start,
  end,
  progress,
}: {
  start: string;
  end: string;
  progress: MotionValue<number>;
}) {
  const d = useTransform(progress, [0, 1], [start, end]);
  return <motion.path d={d} fill="currentColor" />;
}

/**
 * Solid ABC Areal letter pieces that deform into the halftone dots.
 * `active` drives the shape (and, unless `emphasized`, the color) from
 * the outline to the dots. Reduced motion jumps to the target.
 */
export default function OutlineMorphWord({
  label,
  active,
  emphasized = false,
  duration = OUTLINE_MORPH_S,
  pinned = null,
}: {
  label: string;
  active: boolean;
  /** Current page: rest in primary so the tab still reads as selected. */
  emphasized?: boolean;
  duration?: number;
  /** Lab only. Pins the morph at this progress instead of 0 or 1. */
  pinned?: number | null;
}) {
  const reduced = useReducedMotion();
  const progress = useMotionValue(active ? 1 : 0);
  const word = WORDS.get(label);

  useEffect(() => {
    const target = pinned != null ? pinned : active ? 1 : 0;
    if (reduced) {
      progress.set(target);
      return;
    }
    const controls = animate(progress, target, {
      duration,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [active, pinned, duration, reduced, progress]);

  if (!word) {
    return (
      <span
        style={{
          fontSize: 16,
          fontWeight: 400,
          lineHeight: "24px",
          color: emphasized
            ? "var(--color-text-primary)"
            : "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <motion.span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: word.height,
        color: emphasized
          ? "var(--color-text-primary)"
          : "color-mix(in srgb, var(--color-text-muted), var(--color-text-primary) calc(var(--nav-morph, 0) * 100%))",
        ["--nav-morph" as string]: progress,
      }}
    >
      <svg
        width={word.width}
        height={word.height}
        viewBox={`0 0 ${word.width} ${word.height}`}
        aria-hidden
        style={{ display: "block", overflow: "visible" }}
      >
        {word.droplets.map((droplet, index) => (
          <DropletPath
            key={index}
            start={droplet.start}
            end={droplet.end}
            progress={progress}
          />
        ))}
      </svg>
    </motion.span>
  );
}
