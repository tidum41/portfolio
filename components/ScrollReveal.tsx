"use client";

import { Children, createContext, useContext, useLayoutEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { TargetAndTransition, Transition } from "framer-motion";
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
export function EntranceItem({ children, style, className, y: yProp, instant = false, active, delay = 0, replayToken = 0, dialKitName: dialKitNameProp, defaults: defaultsProp, ...rest }: {
  children: ReactNode; style?: CSSProperties; className?: string; y?: number; instant?: boolean;
  active?: boolean; delay?: number; replayToken?: number; dialKitName?: string; defaults?: Partial<EntranceDefaults>;
  // Passed straight through to the underlying motion.div via ...rest below —
  // framer-motion merges whileHover with the entrance animate/variants state
  // fine on its own, this just widens the prop type so callers (e.g. the
  // project-card hover) can pass them without a TS error.
  whileHover?: TargetAndTransition;
  transition?: Transition;
  // Widened further for callers that make the whole item a click/keyboard
  // target (e.g. the CD Player / Habit Tracker grid tiles opening a popup)
  // rather than a plain link.
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
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced || instant || fromParent;
  const y = yProp ?? dk.y;
  const x = dk.x ?? ENTRANCE_DEFAULTS.x;
  const selfDriven = active !== undefined;

  // Keep-alive shells hide with display:none. Framer often skips applying
  // `hidden` under that, then on return thinks the node is already `visible`
  // while the DOM is still at spawn opacity — content stays gone. Drive
  // opacity/x/y ourselves so hide always lands, and every active false→true
  // starts from SPAWN_FROM_OPACITY. Fallbacks snap to 1 so a skipped tween
  // cannot rest hidden.
  const opacityMv = useMotionValue(SPAWN_FROM_OPACITY);
  const xMv = useMotionValue(0);
  const yMv = useMotionValue(0);
  const transformMv = useTransform([xMv, yMv], (latest) => {
    const xVal = latest[0] as number;
    const yVal = latest[1] as number;
    return spawnHidden(xVal, yVal);
  });
  const motionParamsRef = useRef({ duration: dk.duration, delay, x, y, reduced });
  // Keep the latest dials on the ref during render so the hide/show layout
  // effect in the same commit reads current values (keep-alive shells).
  // eslint-disable-next-line react-hooks/refs -- intentional render-time ref sync
  motionParamsRef.current = { duration: dk.duration, delay, x, y, reduced };
  const motionGenRef = useRef(0);
  const tweensRef = useRef<{ stop: () => void }[]>([]);
  const wasActiveRef = useRef(!!active);
  const wasTokenRef = useRef(replayToken);

  // Keep-alive shells hide with display:none. Arm spawn on leave so the next
  // primary-tab show can play the 8px / 1140ms enter. Back passes `instant`
  // and snaps to rest on show, before paint.
  //
  // Skip "already at rest" ONLY when `active` stayed true and replayToken
  // did not bump (intro releasing heroInstant). A false→true rising edge,
  // or a new replayToken, must always replay — finished motion values on
  // keep-alive nodes would otherwise snap after the first couple of visits.
  useLayoutEffect(() => {
    if (!selfDriven) return;
    const { duration, delay: itemDelay, x: xPx, y: yPx, reduced: rm } = motionParamsRef.current;
    const rose = !!active && !wasActiveRef.current;
    const tokenBumped = replayToken !== wasTokenRef.current;
    wasActiveRef.current = !!active;
    wasTokenRef.current = replayToken;
    if (!active) {
      motionGenRef.current += 1;
      for (const tween of tweensRef.current) tween.stop();
      tweensRef.current = [];
      if (prefersReduced) {
        opacityMv.set(1);
        xMv.set(0);
        yMv.set(0);
      } else {
        opacityMv.set(SPAWN_FROM_OPACITY);
        xMv.set(0);
        yMv.set(yPx);
      }
      return;
    }
    if (rm) {
      // `instant` can flip true after the first commit (intro gate closes
      // the grid in a layout effect; heroInstant follows). Stop any tween
      // that already started so it never paints as a second Layer B slide.
      motionGenRef.current += 1;
      for (const tween of tweensRef.current) tween.stop();
      tweensRef.current = [];
      opacityMv.set(1);
      xMv.set(0);
      yMv.set(0);
      return;
    }
    // Intro releases heroInstant (reduced false) while this wrapper is
    // already at rest and still active — do not restart Layer B on HeroText.
    if (
      !rose &&
      !tokenBumped &&
      tweensRef.current.length === 0 &&
      opacityMv.get() === 1 &&
      xMv.get() === 0 &&
      yMv.get() === 0
    ) {
      return;
    }
    motionGenRef.current += 1;
    const gen = motionGenRef.current;
    opacityMv.set(SPAWN_FROM_OPACITY);
    xMv.set(0);
    yMv.set(yPx);
    // Opacity + Y only. Skip a third tween when x is always 0 (cheaper on nav).
    const fade = animate(opacityMv, 1, { duration, delay: itemDelay, ease: PS3_OPACITY });
    const slideY = animate(yMv, 0, { duration, delay: itemDelay, ease: PS3_OPACITY });
    tweensRef.current = [fade, slideY];
    // Fire-and-forget fallback. Clearing it on cleanup is what left grid
    // cards at opacity 0 after a keep-alive return.
    window.setTimeout(() => {
      if (motionGenRef.current !== gen) return;
      opacityMv.set(1);
      xMv.set(0);
      yMv.set(0);
    }, Math.ceil((itemDelay + duration) * 1000) + 64);
  }, [selfDriven, active, reduced, prefersReduced, replayToken, opacityMv, xMv, yMv]);

  return (
    <motion.div
      {...rest}
      {...(selfDriven ? { initial: false } : { initial: "hidden" })}
      variants={
        selfDriven
          ? undefined
          : {
              hidden: {
                opacity: SPAWN_FROM_OPACITY,
                transform: reduced ? SPAWN_REST : spawnHidden(x, y),
              },
              visible: {
                opacity: 1,
                transform: SPAWN_REST,
                transition: {
                  duration: reduced ? 0 : dk.duration,
                  ease: PS3_OPACITY,
                },
              },
            }
      }
      style={
        selfDriven
          ? { ...style, opacity: opacityMv, transform: transformMv }
          : style
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
