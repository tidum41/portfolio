"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
// Every route's above-the-fold content now owns a richer entrance of its own
// (EntranceStagger/EntranceItem — see about page, PersistentWorkShell,
// BentoGallery, case study pages), so this crossfade is deliberately just a
// fast, opacity-only swap — a fuller fade+slide+scale here would compete
// with each page's own entrance and read as double motion (the case-study
// page's whole-page slide read as "buggy" for exactly this reason: it also
// dragged the sticky TOC along with it).
export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Layer A only — see the Instant vs Orchestrated contract in lib/instantNav.ts.
  const skipFade = peekSkipRouteFade();
  const reduced = useReducedMotion();
  const dur = (d: number) => (reduced ? 0 : d);

  // Soft-nav is one-shot per navigation; clear after commit so it doesn't
  // leak into the next unrelated transition.
  useEffect(() => {
    if (peekSoftNav()) clearSoftNav();
  }, [pathname]);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          initial={skipFade ? false : { opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: dur(DURATION.routeEnterFast), ease: EASE_OPACITY } }}
          exit={
            skipFade
              ? { opacity: 1, transition: { duration: 0 } }
              : { opacity: 0, transition: { duration: dur(DURATION.routeExit), ease: EASE_EXIT } }
          }
        >
          <TransitionLayer>{children}</TransitionLayer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
