"use client";

import {
  createElement,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import {
  cssEase,
  EASE_OPACITY,
  ENTRANCE_DEFAULTS,
  SPAWN_FROM_OPACITY,
} from "@/lib/motion";

export const PS3_ENTER_CLASS = "ps3-enter";

export type Ps3EnterVars = {
  delayMs?: number;
  yPx?: number;
  fromOpacity?: number;
  durationMs?: number;
  ease?: string;
};

/** CSS custom properties consumed by `.ps3-enter` in globals.css. */
export function ps3EnterVars({
  delayMs,
  yPx,
  fromOpacity,
  durationMs,
  ease,
}: Ps3EnterVars): CSSProperties {
  const style: Record<string, string> = {};
  if (delayMs != null) style["--ps3-enter-delay"] = `${delayMs}ms`;
  if (yPx != null) style["--ps3-enter-y"] = `${yPx}px`;
  if (fromOpacity != null) style["--ps3-enter-from-opacity"] = String(fromOpacity);
  if (durationMs != null) style["--ps3-enter-duration"] = `${durationMs}ms`;
  if (ease) style["--ps3-enter-ease"] = ease;
  return style as CSSProperties;
}

export function defaultPs3EnterVars(overrides: Ps3EnterVars = {}): CSSProperties {
  return ps3EnterVars({
    delayMs: 0,
    yPx: ENTRANCE_DEFAULTS.y,
    fromOpacity: ENTRANCE_DEFAULTS.fromOpacity ?? SPAWN_FROM_OPACITY,
    durationMs: Math.round(ENTRANCE_DEFAULTS.duration * 1000),
    ease: cssEase(EASE_OPACITY),
    ...overrides,
  });
}

/** Restart `.ps3-enter` — a finished CSS animation will not replay in place. */
export function replayPs3Enter(el: HTMLElement | null, play: boolean) {
  if (!el) return;
  el.classList.remove(PS3_ENTER_CLASS);
  if (!play) return;
  void el.offsetWidth;
  el.classList.add(PS3_ENTER_CLASS);
}

type Ps3EnterOwnProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** When true, this node is allowed to play (or keep) the enter. */
  play: boolean;
  /** Snap to rest with no class (Back / intro hero wrapper). */
  instant?: boolean;
  /** Bump to replay on an already-playing keep-alive node. */
  replayToken?: number;
  delayMs?: number;
  yPx?: number;
  fromOpacity?: number;
  durationMs?: number;
  ease?: string;
  /**
   * When play is false, park at the spawn keyframe (opacity 0 / y) so the
   * next rising edge can enter. About/Hero leave this off — they rest visible.
   */
  hideWhenInactive?: boolean;
};

export type Ps3EnterProps = Ps3EnterOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof Ps3EnterOwnProps | "style" | "className" | "children">;

/**
 * Shared compositor fade-up. Rising `play` or a new `replayToken` restarts
 * the class. `instant` flipping false while `play` stays true does NOT replay
 * (intro releasing the work hero wrapper must not slide HeroText a second time).
 */
export function Ps3Enter({
  as = "div",
  children,
  className,
  style,
  play,
  instant = false,
  replayToken = 0,
  delayMs = 0,
  yPx = ENTRANCE_DEFAULTS.y,
  fromOpacity = ENTRANCE_DEFAULTS.fromOpacity ?? SPAWN_FROM_OPACITY,
  durationMs = Math.round(ENTRANCE_DEFAULTS.duration * 1000),
  ease = cssEase(EASE_OPACITY),
  hideWhenInactive = false,
  ...rest
}: Ps3EnterProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const wasPlayRef = useRef(false);
  const wasTokenRef = useRef(replayToken);

  const snap = instant || !!reduced;
  const animate = play && !snap;
  const spawnHidden = hideWhenInactive && !play && !reduced && !instant;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rose = play && !wasPlayRef.current;
    const tokenBumped = replayToken !== wasTokenRef.current;
    wasPlayRef.current = play;
    wasTokenRef.current = replayToken;

    if (!play || snap) {
      el.classList.remove(PS3_ENTER_CLASS);
      return;
    }
    if (!rose && !tokenBumped) return;
    replayPs3Enter(el, true);
  }, [play, snap, replayToken]);

  const vars = defaultPs3EnterVars({ delayMs, yPx, fromOpacity, durationMs, ease });
  const mergedStyle: CSSProperties = spawnHidden
    ? {
        ...style,
        ...vars,
        opacity: fromOpacity,
        translate: `0 ${yPx}px`,
      }
    : animate
      ? { ...style, ...vars }
      : style ?? {};

  const mergedClass = [className, animate ? PS3_ENTER_CLASS : null]
    .filter(Boolean)
    .join(" ");

  return createElement(as, {
    ...rest,
    ref,
    className: mergedClass || undefined,
    style: mergedStyle,
  }, children);
}
