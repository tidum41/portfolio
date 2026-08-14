"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { introTimings } from "@/lib/introTimings";
import { EASE_OPACITY, ENTRANCE_DEFAULTS, SPAWN_FROM_OPACITY } from "@/lib/motion";
import { HERO_HEADLINE } from "@/lib/site";

// Layer C only — see the Instant vs Orchestrated contract in lib/instantNav.ts.
// This guards the long cold-load/tab-replay timeline. On an SPA soft return,
// PersistentWorkShell's Layer B EntranceItem moves this settled inner content;
// never reset _animated for that path or the hero will double-motion/arrive late.
// Module-level: false on fresh page load, true after first mount.
// Persists across client-side navigation — same pattern as PS3Silk._hasMounted.
// Set true only after the first-load intro finishes (not at effect start) so
// React StrictMode remount can still hear `intro-done`.
let _animated = false;

export default function HeroText() {
  const instant = typeof window !== "undefined" && _animated;
  const [subReady, setSubReady] = useState(instant);
  const h1Controls = useAnimation();
  const reduced = useReducedMotion();

  useEffect(() => {
    // Do not set `_animated` until this intro actually finishes. Setting it
    // at effect start made StrictMode's remount see `instant` and return
    // before re-registering `intro-done` — the subtitle stayed at spawn
    // (the JOOLA / UCLA line "never arriving", then popping).
    if (instant) return;

    function animateH1(delay = introTimings.heroDelay, dur = introTimings.heroDuration) {
      // Full `transform` string rather than the `y` shorthand — the shorthand
      // runs on the main thread via rAF, while `transform` stays on the
      // compositor. This entrance fires at the busiest possible moment
      // (page load/hydration), so it's the one place that matters most.
      // Opacity + Y share one duration — a longer transform used to keep
      // sliding after the fade (and after intro-done), which read as a jump
      // on the JOOLA / UCLA line and made the menu pill chase the box.
      const fromY = `translateY(${ENTRANCE_DEFAULTS.y}px)`;
      h1Controls.set({ opacity: reduced ? 1 : SPAWN_FROM_OPACITY, transform: reduced ? "translateY(0px)" : fromY });
      h1Controls.start({
        opacity: 1,
        transform: "translateY(0px)",
        transition: {
          opacity:   { duration: reduced ? 0 : dur, ease: EASE_OPACITY, delay: reduced ? 0 : delay },
          transform: { duration: reduced ? 0 : dur, ease: EASE_OPACITY, delay: reduced ? 0 : delay },
        },
      });
    }

    animateH1();

    function onDone() {
      _animated = true;
      setSubReady(true);
    }
    if (document.documentElement.getAttribute("data-intro") !== "playing") {
      onDone();
    } else {
      window.addEventListener("intro-done", onDone, { once: true });
    }
    // Intro gate is 1.9s; if intro-done never fires, still show the subtitle.
    const subFallback = window.setTimeout(onDone, Math.ceil((introTimings.gateDuration + 0.6) * 1000));

    function onReplay() {
      _animated = false;
      setSubReady(false);
      animateH1(introTimings.heroDelay, introTimings.heroDuration);
      window.addEventListener("intro-done", onDone, { once: true });
    }
    window.addEventListener("intro-replay", onReplay);

    return () => {
      window.clearTimeout(subFallback);
      window.removeEventListener("intro-done", onDone);
      window.removeEventListener("intro-replay", onReplay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fromY = `translateY(${ENTRANCE_DEFAULTS.y}px)`;
  const h1Initial = instant ? { opacity: 1, transform: "translateY(0px)" } : { opacity: SPAWN_FROM_OPACITY, transform: fromY };
  const subTx = instant || reduced
    ? { duration: 0 }
    : {
        opacity:   { duration: ENTRANCE_DEFAULTS.duration, ease: EASE_OPACITY },
        transform: { duration: ENTRANCE_DEFAULTS.duration, ease: EASE_OPACITY },
      };

  return (
    <>
      {/* minWidth caps at 100% of the available width via min() — a bare
          340px floor overflowed the section's overflow:hidden ancestor on
          viewports under ~388px (iPhone SE, common Android widths), clipping
          the headline instead of just letting it wrap a bit tighter. */}
      <div style={{ position: "relative", zIndex: 1, width: "50%", minWidth: "min(340px, 100%)" }}>
        <motion.h1
          initial={h1Initial}
          animate={h1Controls}
          className="hero-heading"
          style={{
            fontFamily: "var(--font-page-title)",
            fontSize: "clamp(26px, 2.8vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {HERO_HEADLINE}
        </motion.h1>
      </div>

      <motion.p
        className="hero-sub"
        data-hero-sub
        initial={{ opacity: SPAWN_FROM_OPACITY, transform: fromY }}
        animate={subReady ? { opacity: 1, transform: "translateY(0px)" } : { opacity: SPAWN_FROM_OPACITY, transform: fromY }}
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
        {"currently @ "}
        <a
          href="https://joola.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-joola"
        >
          JOOLA
        </a>
        {" "}
        <span className="hero-dot">·</span>
        {" cognitive science at "}
        <a
          href="https://www.ucla.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-ucla"
        >
          ucla
        </a>
      </motion.p>
    </>
  );
}
