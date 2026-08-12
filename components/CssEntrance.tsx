"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ENTRANCE_DEFAULTS, EASE_Y } from "@/lib/motion";

/**
 * Same fade-up + slide-up vocabulary as Framer EntranceStagger/EntranceItem
 * and BentoGallery — CSS transitions only (no Framer, no DialKit on the
 * hot path). Use for route-arrival reveals where the motion is simple.
 */

const ENTRANCE_EASE_CSS = `cubic-bezier(${EASE_Y.join(",")})`;

type CssEntranceCtx = {
  ready: boolean;
  instant: boolean;
  duration: number;
  stagger: number;
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
  duration?: number;
  stagger?: number;
  maxSpread?: number;
  [key: `data-${string}`]: string | undefined;
}) {
  const [ready, setReady] = useState(instant);
  const [snap, setSnap] = useState(instant);
  const counterRef = useRef(0);
  counterRef.current = 0;

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noMotion = instant || prefersReduced;
    setSnap(noMotion);
    if (noMotion) {
      setReady(true);
      return;
    }
    if (!active) {
      setReady(false);
      return;
    }
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
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
        y,
        takeIndex,
      }}
    >
      <div className={className} style={style} {...rest}>
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
        transform: show ? "translateY(0px)" : `translateY(${ctx.y}px)`,
        transition: ctx.instant
          ? "none"
          : `opacity ${ctx.duration}s ${ENTRANCE_EASE_CSS} ${delay}s, transform ${ctx.duration}s ${ENTRANCE_EASE_CSS} ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
