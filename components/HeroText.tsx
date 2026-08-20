"use client";

import { useEffect, useState } from "react";
import { introTimings } from "@/lib/introTimings";
import { HERO_HEADLINE } from "@/lib/site";
import { Ps3Enter } from "@/components/Ps3Enter";

// Layer C only — see the Instant vs Orchestrated contract in lib/instantNav.ts.
// This guards the long cold-load/tab-replay timeline. On an SPA soft return,
// PersistentWorkShell's Layer B EntranceItem moves this settled inner content;
// never reset _animated for that path or the hero will double-motion/arrive late.
// Module-level: false on fresh page load, true after first mount.
// Persists across client-side navigation — same pattern as PS3Silk._hasMounted.
// Set true only after the first-load intro finishes (not at effect start) so
// React StrictMode remount can still hear `intro-done`.
let _animated = false;

const H1_STYLE = {
  fontFamily: "var(--font-page-title)",
  fontSize: "clamp(26px, 2.8vw, 36px)",
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: "-0.5px",
  color: "var(--color-text-primary)",
  margin: 0,
} as const;

const SUB_STYLE = {
  position: "relative",
  zIndex: 1,
  fontFamily: "var(--font-sans)",
  fontSize: 17,
  lineHeight: 1.5,
  color: "var(--color-text-secondary)",
  margin: 0,
} as const;

export default function HeroText() {
  const instant = typeof window !== "undefined" && _animated;
  const [playId, setPlayId] = useState(0);

  useEffect(() => {
    // Do not set `_animated` until this intro actually finishes. Setting it
    // at effect start made StrictMode's remount see `instant` and return
    // before re-registering `intro-done` — the subtitle stayed at spawn
    // (the JOOLA / UCLA line "never arriving", then popping).
    if (instant) return;

    function onDone() {
      _animated = true;
    }
    if (document.documentElement.getAttribute("data-intro") !== "playing") {
      onDone();
    } else {
      window.addEventListener("intro-done", onDone, { once: true });
    }
    const subFallback = window.setTimeout(
      onDone,
      Math.ceil((introTimings.gateDuration + 0.6) * 1000),
    );

    function onReplay() {
      _animated = false;
      setPlayId((n) => n + 1);
      window.addEventListener("intro-done", onDone, { once: true });
    }
    window.addEventListener("intro-replay", onReplay);

    return () => {
      window.clearTimeout(subFallback);
      window.removeEventListener("intro-done", onDone);
      window.removeEventListener("intro-replay", onReplay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const play = !instant;

  return (
    <>
      {/* minWidth caps at 100% of the available width via min() — a bare
          340px floor overflowed the section's overflow:hidden ancestor on
          viewports under ~388px (iPhone SE, common Android widths), clipping
          the headline instead of just letting it wrap a bit tighter. */}
      <div style={{ position: "relative", zIndex: 1, width: "50%", minWidth: "min(340px, 100%)" }}>
        <Ps3Enter
          as="h1"
          play={play}
          replayToken={playId}
          delayMs={play ? Math.round(introTimings.heroDelay * 1000) : 0}
          className="hero-heading"
          style={H1_STYLE}
        >
          {HERO_HEADLINE}
        </Ps3Enter>
      </div>

      <Ps3Enter
        as="p"
        play={play}
        replayToken={playId}
        delayMs={play ? Math.round(introTimings.gateDuration * 1000) : 0}
        className="hero-sub"
        data-hero-sub=""
        style={SUB_STYLE}
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
        {" cognitive science "}
        <span className="hero-sub-end">
          {"at "}
          <a
            href="https://www.ucla.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-ucla"
          >
            ucla
          </a>
        </span>
      </Ps3Enter>
    </>
  );
}
