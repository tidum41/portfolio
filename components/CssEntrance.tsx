"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { afterPaint } from "@/lib/afterPaint";
import { ENTRANCE_DEFAULTS, EASE_Y, EASE_OPACITY, SPAWN_REST, spawnHidden, cssEase } from "@/lib/motion";

const ENTRANCE_EASE_Y = cssEase(EASE_Y);
const ENTRANCE_EASE_OP = cssEase(EASE_OPACITY);

/**
 * Same fade + XMB side-cascade as Framer EntranceStagger/EntranceItem
 * and BentoGallery — CSS transitions only (no Framer, no DialKit on the
 * hot path). Use for route-arrival reveals where the motion is simple.
 * Scale is not used — XMB focus is translate from the left, not shrink.
 */

type CssEntranceCtx = {
  ready: boolean;
  instant: boolean;
  duration: number;
  stagger: number;
  x: number;
  y: number;
  takeIndex: () => number;
};

const Ctx = createContext<CssEntranceCtx | null>(null);

export function CssEntranceStagger({
  active,
  instant = false,
  className,
  style,
  children,
  y = ENTRANCE_DEFAULTS.y,
  x = ENTRANCE_DEFAULTS.x,
  duration = ENTRANCE_DEFAULTS.duration,
  stagger = ENTRANCE_DEFAULTS.stagger,
  maxSpread = ENTRANCE_DEFAULTS.maxSpread,
  ...rest
}: {
  active: boolean;
  instant?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  y?: number;
  x?: number;
  duration?: number;
  stagger?: number;
  maxSpread?: number;
  [key: `data-${string}`]: string | undefined;
}) {
  const [ready, setReady] = useState(instant);
  const [snap, setSnap] = useState(instant);
  const genRef = useRef(0);
  const counterRef = useRef(0);
  counterRef.current = 0;

  useLayoutEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noMotion = instant || prefersReduced;
    if (!active) {
      // Invalidate in-flight show timers so a stale afterPaint cannot
      // un-hide this page while it's off-route.
      genRef.current += 1;
      setSnap(true);
      setReady(false);
      return;
    }
    if (noMotion) {
      setSnap(true);
      setReady(true);
      return;
    }
    setSnap(false);
    const gen = genRef.current;
    // Fire-and-forget — do not return afterPaint's cancel. Cleanup was
    // aborting the reveal and leaving keep-alive About copy at opacity 0.
    afterPaint(() => {
      if (genRef.current === gen) setReady(true);
    });
  }, [active, instant]);

  // About nests ~6 items under 2 layout columns — don't derive stagger from
  // column count. Cap total spread like Framer EntranceStagger.
  const effectiveStagger = Math.min(stagger, maxSpread / 5);

  const takeIndex = () => counterRef.current++;

  return (
    <Ctx.Provider
      value={{
        ready,
        instant: snap,
        duration,
        stagger: effectiveStagger,
        x,
        y,
        takeIndex,
      }}
    >
      <div
        className={className}
        style={style}
        {...rest}
        data-entrance={ready ? "in" : "out"}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function CssEntranceItem({
  children,
  style,
  className,
  index,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** Optional explicit order; otherwise assigned in render order. */
  index?: number;
}) {
  const ctx = useContext(Ctx);
  const autoIndex = useRef<number | null>(null);
  if (ctx && autoIndex.current === null && index === undefined) {
    autoIndex.current = ctx.takeIndex();
  }
  const i = index ?? autoIndex.current ?? 0;

  if (!ctx) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const delay = i * ctx.stagger;
  const show = ctx.ready;

  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? SPAWN_REST : spawnHidden(ctx.x, ctx.y),
        transition: ctx.instant
          ? "none"
          : `opacity ${ctx.duration}s ${ENTRANCE_EASE_OP} ${delay}s, transform ${ctx.duration}s ${ENTRANCE_EASE_Y} ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
