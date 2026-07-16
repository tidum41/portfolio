"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

function VolumeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

const DEFAULT_MUTED = true;
const DEFAULT_VOLUME = 0.4;

export default function VolumeControl() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [muted, setMuted] = useState(DEFAULT_MUTED);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [hovered, setHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  // Two React quirks meet at this ref, both worth spelling out:
  //  1. `muted` is a controlled media property — React re-asserts a literal
  //     JSX value for it on every re-render (e.g. when Nav re-renders on
  //     route change via usePathname()), which would stomp a real unmute.
  //  2. The `<audio>` tag itself only mounts on this component's *second*
  //     render (the first render returns null while the isDesktop check is
  //     still pending), so a `useEffect` keyed on `[muted]`/`[volume]` sees
  //     the same state values across that null→real transition and — since
  //     nothing "changed" — never fires again to apply them to the newly
  //     created node.
  // Setting both directly here, once, at the moment the real node is
  // created sidesteps both: the effects below then own every *subsequent*
  // update, which are genuine value changes and fire correctly.
  const setAudioNode = useCallback((node: HTMLAudioElement | null) => {
    audioRef.current = node;
    if (node) {
      node.muted = DEFAULT_MUTED;
      node.volume = DEFAULT_VOLUME;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!isDesktop) return null;

  const onEnter = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setHovered(true);
  };
  const onLeave = () => setHovered(false);

  const spring = reduced
    ? { duration: 0.15 }
    : { type: "spring" as const, duration: 0.3, bounce: 0 };
  const visibleAnim = { opacity: 1, scale: 1, filter: "blur(0px)" };
  const hiddenAnim = { opacity: 0, scale: reduced ? 1 : 0.25, filter: reduced ? "blur(0px)" : "blur(4px)" };

  return (
    <div
      className="volume-control"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ alignItems: "center", gap: 8 }}
    >
      <audio ref={setAudioNode} src="/audio/ps3-xmb-menu.mp3" loop autoPlay preload="auto" />
      <motion.div
        initial={false}
        animate={{ width: hovered ? 72 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ overflow: "hidden", display: "flex", alignItems: "center" }}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            if (muted) setMuted(false);
          }}
          className="volume-slider"
          aria-label="Volume"
          style={{ width: 64 }}
        />
      </motion.div>
      <button
        onClick={() => setMuted((m) => !m)}
        className="nav-link theme-toggle-btn"
        aria-label={muted ? "Unmute background audio" : "Mute background audio"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          color: "var(--color-text-primary)",
          display: "flex",
          alignItems: "center",
          lineHeight: 0,
          transition: "color 0.25s ease",
          WebkitTapHighlightColor: "transparent",
          position: "relative",
          width: 15,
          height: 15,
        }}
      >
        <motion.span
          aria-hidden
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={false}
          animate={muted ? hiddenAnim : visibleAnim}
          transition={spring}
        >
          <VolumeIcon />
        </motion.span>
        <motion.span
          aria-hidden
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={false}
          animate={muted ? visibleAnim : hiddenAnim}
          transition={spring}
        >
          <MutedIcon />
        </motion.span>
      </button>
    </div>
  );
}
