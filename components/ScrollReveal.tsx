"use client";

import { Children, createContext, useContext } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TargetAndTransition, Transition } from "framer-motion";
import { Ps3Enter } from "@/components/Ps3Enter";
import { useDialKit } from "dialkit";
import { EASE_Y as PS3_EASE, EASE_OPACITY as PS3_OPACITY, ENTRANCE_DEFAULTS, SPAWN_REST, SPAWN_FROM_OPACITY, spawnHidden } from "@/lib/motion";
import type { EntranceDefaults } from "@/lib/motion";
import type { ReactNode, CSSProperties } from "react";

/** When true, nested EntranceItems snap (case-study Back). */
const InstantEntranceCtx = createContext(false);

/** Nested EntranceItems inherit the parent's DialKit panel + defaults. */
const EntranceTuneCtx = createContext<{
  dialKitName: string;
  defaults?: Partial<EntranceDefaults>;
}>({ dialKitName: "Entrance" });

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
    yDuration:      [0.55, 0.1,  2.5],
    opacityDuration:[0.45, 0.1,  2.5],
    viewportMargin: [-60, -300,  0],
  });
  const y = yProp ?? dk.y;
  const reduced = useReducedMotion();

  return (
    <motion.div
      // Full `transform` string rather than the `y` shorthand, so this stays
      // on the compositor instead of running via rAF on the main thread —
      // this primitive backs nearly every scroll reveal on the site.
      initial={{ opacity: SPAWN_FROM_OPACITY, transform: `translateY(${y}px)` }}
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
        hidden:  { opacity: SPAWN_FROM_OPACITY, transform: reduced ? SPAWN_REST : spawnHidden(ENTRANCE_DEFAULTS.x, ENTRANCE_DEFAULTS.y) },
        visible: { opacity: 1, transform: SPAWN_REST, transition: { duration: reduced ? 0 : ENTRANCE_DEFAULTS.duration, ease: PS3_OPACITY } },
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
// grid, about page) rather than when scrolled to. Shares the "Entrance"
// dialkit panel with BentoGallery's plain-CSS implementation of the same
// opacity + translateY vocabulary, so one panel tunes both.
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
    x:         [d.x,         0,   80] as [number, number, number],
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
    <EntranceTuneCtx.Provider value={{ dialKitName, defaults }}>
      <InstantEntranceCtx.Provider value={reduced}>
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
      </InstantEntranceCtx.Provider>
    </EntranceTuneCtx.Provider>
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
export function EntranceItem({ children, style, className, y: yProp, instant = false, active, delay = 0, replayToken = 0, dialKitName: dialKitNameProp, defaults: defaultsProp, whileHover: _whileHover, transition: _transition, ...rest }: {
  children: ReactNode; style?: CSSProperties; className?: string; y?: number; instant?: boolean;
  active?: boolean; delay?: number; replayToken?: number; dialKitName?: string; defaults?: Partial<EntranceDefaults>;
  // Accepted so existing callers type-check; hover is CSS on project cards.
  whileHover?: TargetAndTransition;
  transition?: Transition;
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  [key: `data-${string}`]: unknown;
}) {
  const tune = useContext(EntranceTuneCtx);
  const dialKitName = dialKitNameProp ?? tune.dialKitName;
  const defaults = defaultsProp ?? tune.defaults;
  const dk = useDialKit(dialKitName, ENTRANCE_RANGES(defaults));
  const fromParent = useContext(InstantEntranceCtx);
  const y = yProp ?? dk.y;
  const selfDriven = active !== undefined;

  if (!selfDriven) {
    return (
      <div {...rest} style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <Ps3Enter
      {...rest}
      play={!!active}
      instant={instant || fromParent}
      replayToken={replayToken}
      delayMs={Math.round(delay * 1000)}
      yPx={y}
      fromOpacity={defaults?.fromOpacity ?? ENTRANCE_DEFAULTS.fromOpacity ?? SPAWN_FROM_OPACITY}
      durationMs={Math.round(dk.duration * 1000)}
      hideWhenInactive
      className={className}
      style={style}
    >
      {children}
    </Ps3Enter>
  );
}
