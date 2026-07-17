"use client";

import { Children } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TargetAndTransition, Transition } from "framer-motion";
import { useDialKit } from "dialkit";
import { EASE_Y as PS3_EASE, EASE_OPACITY as PS3_OPACITY, ENTRANCE_DEFAULTS } from "@/lib/motion";
import type { EntranceDefaults } from "@/lib/motion";
import type { ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
  y?: number;
}

export function ScrollReveal({ children, delay = 0, style, className, y: yProp }: Props) {
  const dk = useDialKit("ScrollReveal", {
    y:              [16,   0,    80],
    yDuration:      [0.95, 0.1,  2.5],
    opacityDuration:[0.75, 0.1,  2.5],
    viewportMargin: [-60, -300,  0],
  });
  const y = yProp ?? dk.y;
  const reduced = useReducedMotion();

  return (
    <motion.div
      // Full `transform` string rather than the `y` shorthand, so this stays
      // on the compositor instead of running via rAF on the main thread —
      // this primitive backs nearly every scroll reveal on the site.
      initial={{ opacity: 0, transform: `translateY(${y}px)` }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, margin: `${dk.viewportMargin}px` }}
      transition={{
        opacity:   { duration: reduced ? 0 : dk.opacityDuration, ease: PS3_OPACITY, delay: reduced ? 0 : delay },
        transform: { duration: reduced ? 0 : dk.yDuration,       ease: PS3_EASE,    delay: reduced ? 0 : delay },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container — children animate in sequence
interface StaggerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  style?: CSSProperties;
  className?: string;
}

export function StaggerReveal({ children, stagger = 0.07, delay = 0, style, className }: StaggerProps) {
  const dk = useDialKit("StaggerReveal", {
    stagger: [0.07, 0, 0.4],
  });
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : (dk.stagger ?? stagger), delayChildren: reduced ? 0 : delay } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Child item for StaggerReveal
export function StaggerItem({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, transform: "translateY(16px)" },
        visible: { opacity: 1, transform: "translateY(0px)", transition: { duration: reduced ? 0 : 0.7, ease: PS3_EASE } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Entrance — reveal-on-route-arrival, not scroll-into-view ────────────────
// Same fade-up + slide-up shape as StaggerReveal/StaggerItem, but triggered
// by an explicit `active` flag instead of `whileInView`. For above-the-fold
// content that should animate the instant its page becomes current (work
// grid, about page) rather than when scrolled to. Adds a brief mid-flight
// blur on top of opacity/y — barely perceptible, gone by the time the item
// is at rest. Shares the "Entrance" dialkit panel with BentoGallery's plain-
// CSS implementation of the same vocabulary, so one panel tunes both.
interface EntranceStaggerProps {
  active: boolean;
  children: ReactNode;
  stagger?: number;
  delay?: number;
  style?: CSSProperties;
  className?: string;
  // Skip straight to the resting state with no animation at all — treated
  // the same as reduced-motion. Used for the case-study "Back" arrival,
  // which must stay instant (no remount, no fade) for the WebGL canvas fix.
  instant?: boolean;
  // Which DialKit panel to read/tune — lets a caller (e.g. case study pages)
  // own an independently-tunable variant of this same vocabulary instead of
  // sharing the work-grid/about-page "Entrance" panel. Defaults preserve
  // existing callers' behavior exactly.
  dialKitName?: string;
  defaults?: Partial<EntranceDefaults>;
}

const ENTRANCE_RANGES = (defaults?: Partial<EntranceDefaults>) => {
  const d = { ...ENTRANCE_DEFAULTS, ...defaults };
  return {
    y:         [d.y,         0,   80] as [number, number, number],
    duration:  [d.duration,  0.1, 2]  as [number, number, number],
    stagger:   [d.stagger,   0,   0.4] as [number, number, number],
    maxSpread: [d.maxSpread, 0,   2]  as [number, number, number],
  };
};

// Shared live dial values for the "Entrance" panel — exported so callers that
// need to compute their own per-item delay (e.g. PersistentWorkShell's
// cross-column work-grid stagger, which EntranceItem's self-driven mode
// can't derive on its own) read the exact same tunable numbers.
export function useEntranceDials(dialKitName = "Entrance", defaults?: Partial<EntranceDefaults>) {
  return useDialKit(dialKitName, ENTRANCE_RANGES(defaults));
}

export function EntranceStagger({ active, children, stagger, delay = 0, style, className, instant = false, dialKitName = "Entrance", defaults }: EntranceStaggerProps) {
  const dk = useDialKit(dialKitName, ENTRANCE_RANGES(defaults));
  const reduced = useReducedMotion() || instant;

  // Cap total spread regardless of item count, per maxSpread.
  const childCount = Children.count(children);
  const rawStagger = stagger ?? dk.stagger;
  const effectiveStagger = childCount > 1
    ? Math.min(rawStagger, dk.maxSpread / (childCount - 1))
    : rawStagger;

  return (
    <motion.div
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : effectiveStagger,
            delayChildren:   reduced ? 0 : delay,
          },
        },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Child item for EntranceStagger. Two modes:
//  - Nested (no `active` prop): inherits "hidden"/"visible" from an ancestor
//    EntranceStagger via Framer Motion's variant propagation, auto-staggered
//    by DOM order within that one container. Used on the about page.
//  - Self-driven (`active` provided): manages its own initial/animate,
//    ignoring any ancestor propagation, with an explicit per-item `delay`.
//    Needed where items span more than one physical container that still
//    need to read as a single interleaved sequence — e.g. the work grid's
//    two DOM columns, where "visual reading order" crosses both columns.
export function EntranceItem({ children, style, className, y: yProp, instant = false, active, delay = 0, dialKitName = "Entrance", defaults, ...rest }: {
  children: ReactNode; style?: CSSProperties; className?: string; y?: number; instant?: boolean;
  active?: boolean; delay?: number; dialKitName?: string; defaults?: Partial<EntranceDefaults>;
  // Passed straight through to the underlying motion.div via ...rest below —
  // framer-motion merges whileHover with the entrance animate/variants state
  // fine on its own, this just widens the prop type so callers (e.g. the
  // project-card hover) can pass them without a TS error.
  whileHover?: TargetAndTransition;
  transition?: Transition;
  [key: `data-${string}`]: unknown;
}) {
  const dk = useDialKit(dialKitName, ENTRANCE_RANGES(defaults));
  const reduced = useReducedMotion() || instant;
  const y = yProp ?? dk.y;
  const selfDriven = active !== undefined;

  return (
    <motion.div
      {...rest}
      {...(selfDriven ? { initial: "hidden", animate: active ? "visible" : "hidden" } : {})}
      variants={{
        hidden: {
          opacity: 0,
          transform: reduced ? "translateY(0px)" : `translateY(${y}px)`,
        },
        visible: {
          opacity: 1,
          transform: "translateY(0px)",
          // `delay` only set in self-driven mode, where there's no parent
          // EntranceStagger to inject it via staggerChildren/delayChildren.
          // In nested mode, an explicit delay here (even 0) would override
          // that parent-orchestrated stagger instead of composing with it.
          transition: {
            duration: reduced ? 0 : dk.duration,
            ease: PS3_EASE,
            ...(selfDriven ? { delay: reduced ? 0 : delay } : {}),
          },
        },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}
