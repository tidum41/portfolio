"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { peekSoftNav, peekSkipRouteFade, clearSoftNav } from "@/lib/instantNav";
import { EASE_OPACITY, EASE_EXIT, DURATION } from "@/lib/motion";

// Detaches whichever element is currently *exiting* from normal document
// flow (position: absolute, pinned to the top of the relative wrapper) so it
// can fade out in place without ever being stacked in flow alongside the
// incoming page. Without this, both pages briefly occupied real document
// height at once — a layout jump that read as a flicker rather than a clean
// cross-dissolve. `useIsPresent` is framer-motion's supported hook for
// exactly this "detach on exit" pattern.
function TransitionLayer({ children }: { children: React.ReactNode }) {
  const isPresent = useIsPresent();
  return (
    <div
      style={{
        position: isPresent ? "static" : "absolute",
        top: 0,
        left: 0,
        width: "100%",
        pointerEvents: isPresent ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

// Provides page enter/exit animations keyed by route.
// Lives in layout.tsx (persistent) so AnimatePresence survives navigations.
// template.tsx is kept as a passthrough for Next.js scroll-reset behaviour.
// Soft primary-nav (work/about/archive) bypasses AnimatePresence entirely —
// the exit layer + opacity bookkeeping was competing with destination mount
// (cursor gaps). Case studies and hard loads keep the crossfade.
export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skipFade = peekSkipRouteFade();
  const reduced = useReducedMotion();
  const dur = (d: number) => (reduced ? 0 : d);

  // Latch soft-swap for this pathname commit (session flag clears in effect).
  const pathRef = useRef(pathname);
  const softSwapRef = useRef(skipFade);
  if (pathRef.current !== pathname) {
    softSwapRef.current = peekSkipRouteFade();
    pathRef.current = pathname;
  }
  const softSwap = softSwapRef.current;

  useEffect(() => {
    if (peekSoftNav()) clearSoftNav();
    // Tell the custom cursor the route has committed; trail can unmute soon.
    let idleId = 0;
    const settle = () => {
      window.dispatchEvent(new CustomEvent("soft-nav-settled", { detail: { pathname } }));
    };
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof window.requestIdleCallback === "function") {
          idleId = window.requestIdleCallback(settle, { timeout: 400 });
        } else {
          settle();
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [pathname]);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {softSwap ? (
        <div key={pathname}>{children}</div>
      ) : (
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: dur(DURATION.routeEnterFast), ease: EASE_OPACITY } }}
            exit={{ opacity: 0, transition: { duration: dur(DURATION.routeExit), ease: EASE_EXIT } }}
          >
            <TransitionLayer>{children}</TransitionLayer>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
