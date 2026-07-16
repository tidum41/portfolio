"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { introTimings } from "@/lib/introTimings";
import { EASE_OPACITY, EASE_Y } from "@/lib/motion";

// Module-level: false on fresh page load, true after first mount.
// Persists across client-side navigation — same pattern as PS3Silk._hasMounted.
let _animated = false;

export default function HeroText() {
  const instant = typeof window !== "undefined" && _animated;
  const [subReady, setSubReady] = useState(instant);
  const h1Controls = useAnimation();
  const reduced = useReducedMotion();

  useEffect(() => {
    _animated = true;

    if (instant) return;

    function animateH1(delay = introTimings.heroDelay, dur = introTimings.heroDuration) {
      h1Controls.set({ opacity: 0, y: 22 });
      h1Controls.start({
        opacity: 1,
        y: 0,
        transition: {
          opacity: { duration: reduced ? 0 : dur,         ease: EASE_OPACITY, delay: reduced ? 0 : delay },
          y:       { duration: reduced ? 0 : dur * 2.375, ease: EASE_Y,       delay: reduced ? 0 : delay },
        },
      });
    }

    animateH1();

    function onDone() { setSubReady(true); }
    window.addEventListener("intro-done", onDone, { once: true });

    function onReplay() {
      _animated = false;
      setSubReady(false);
      animateH1(introTimings.heroDelay, introTimings.heroDuration);
      // Re-register so subtitle animates in after the replayed intro-done
      window.addEventListener("intro-done", onDone, { once: true });
    }
    window.addEventListener("intro-replay", onReplay);

    return () => {
      window.removeEventListener("intro-done", onDone);
      window.removeEventListener("intro-replay", onReplay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const h1Initial = instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 };
  const subTx = instant || reduced
    ? { duration: 0 }
    : { opacity: { duration: 1.5, ease: EASE_OPACITY }, y: { duration: 1.9, ease: EASE_Y } };

  return (
    <>
      <div style={{ position: "relative", zIndex: 1, width: "50%", minWidth: 340 }}>
        <motion.h1
          initial={h1Initial}
          animate={h1Controls}
          className="hero-heading"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(26px, 2.8vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {"I'm Mudit, a product designer with a love for craft, curiosity, and rabbit holes"}
        </motion.h1>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 22 }}
        animate={subReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
        transition={subTx}
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--font-sans)",
          fontSize: 17,
          lineHeight: 1.5,
          color: "var(--color-text-secondary)",
          margin: 0,
        }}
      >
        cognitive science at <span style={{ color: "rgb(53, 121, 204)", fontWeight: 500 }}>ucla</span>
      </motion.p>
    </>
  );
}
