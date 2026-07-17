"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HalftoneFilterDef } from "./HalftoneFilterDef";
import { useHalftoneMorph } from "./useHalftoneMorph";
import { useIsMobile } from "./useIsMobile";
import { motion, useReducedMotion, useTransform } from "framer-motion";

const ICON_SIZE = 17;
const SLIDER_WIDTH = 72;
const GAP = 8;

function VolumeIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

const DEFAULT_MUTED = true;
const DEFAULT_VOLUME = 0.4;

export default function VolumeControl({ dk }: { dk?: any }) {
  const [muted, setMuted] = useState(DEFAULT_MUTED);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  const audioRef = useRef<HTMLAudioElement>(null);
  // Remembers the last non-zero volume so unmuting restores it rather than
  const preVolume = useRef(DEFAULT_VOLUME);
  const reduced = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

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
  //     nothing \"changed\" — never fires again to apply them to the newly
  //     created node.
  // Setting both directly here, once, at the moment the real node is
  // created sidesteps both: the effects below then own every *subsequent*
  // update, which are genuine value changes and fire correctly.
  // We also call .play() explicitly — browsers allow autoplay for muted
  // audio, but only if play() is initiated; the `autoPlay` attribute alone
  // is frequently blocked until a user gesture occurs.
  const setAudioNode = useCallback((node: HTMLAudioElement | null) => {
    audioRef.current = node;
    if (node) {
      node.muted = DEFAULT_MUTED;
      node.volume = DEFAULT_VOLUME;
      node.play().catch(() => {
        // Autoplay was blocked (no user gesture yet). The audio will start
        // as soon as the user interacts with the page (e.g. clicks unmute).
      });
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Slider value: show 0 when muted, actual volume when unmuted.
  const sliderValue = muted ? 0 : volume;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (v > 0) {
      preVolume.current = v;
      // Slider moved above 0 — start playback if the initial autoplay was
      // blocked (this gesture satisfies the browser's interaction requirement).
      audioRef.current?.play().catch(() => {});
    }
    setVolume(v > 0 ? v : preVolume.current);
    setMuted(v === 0);
  };

  const handleMuteToggle = () => {
    setMuted((m) => {
      if (m) {
        // Unmuting — restore the last non-zero volume and ensure playback
        // is actually running (may have been blocked on mount).
        setVolume(preVolume.current);
        audioRef.current?.play().catch(() => {});
      } else {
        // Muting — remember current volume so we can restore it.
        if (volume > 0) preVolume.current = volume;
      }
      return !m;
    });
  };

  const active = dk?.enabled ? (
    isMobile ? !isTapped : (isHovered || isTapped)
  ) : false;

  const { filterId, t } = useHalftoneMorph(dk, active);
  const baseOpacity = useTransform(t, [0, 1], [1, 0]);
  // |t|, not t — the underdamped \"out\" spring sends t slightly negative as
  // it settles, and without abs() this layer clamps near-invisible for
  // exactly that window, hiding the bubble the undershoot exists to produce.
  const overlayOpacity = useTransform(t, (v) => Math.max(Math.abs(v) * 1.5, 0.0001));

  if (!isDesktop) return null;

  const onEnter = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setIsHovered(true);
  };
  const onLeave = () => setIsHovered(false);

  const spring = reduced
    ? { duration: 0.15 }
    : { type: "spring" as const, duration: 0.3, bounce: 0 };
  const visibleAnim = { opacity: 1, scale: 1, filter: "blur(0px)" };
  const hiddenAnim = { opacity: 0, scale: reduced ? 1 : 0.25, filter: reduced ? "blur(0px)" : "blur(4px)" };

  const baseColor = muted ? "var(--color-text-muted)" : "var(--color-text-primary)";
  const hoverColor = "var(--color-text-primary)";

  return (
    <div
      className="volume-control"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        gap: GAP,
        // Fixed at the fully-expanded width (icon + gap + slider) even while
        // collapsed, so the hover hitbox already covers the space the slider
        // reveals into — moving the mouse from the icon toward where the
        // slider is about to appear stays inside this box the whole time,
        // instead of exiting a hitbox that was only ever icon-sized and
        // collapsing the slider before it can be reached.
        width: ICON_SIZE + GAP + SLIDER_WIDTH,
      }}
    >
      <audio ref={setAudioNode} src="/audio/ps3-xmb-menu.mp3" loop autoPlay preload="auto" />
      <motion.div
        initial={false}
        animate={{ width: isHovered ? SLIDER_WIDTH : 0, opacity: isHovered ? 1 : 0 }}
        transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 30 }}
        style={{ overflow: "hidden", display: "flex", alignItems: "center", flexShrink: 0 }}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={sliderValue}
          onChange={handleSliderChange}
          className="volume-slider"
          aria-label="Volume"
          style={{ width: 64 }}
        />
      </motion.div>
      <button
        onClick={handleMuteToggle}
        className="nav-link theme-toggle-btn"
        aria-label={muted ? "Unmute background audio" : "Mute background audio"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          lineHeight: 0,
          WebkitTapHighlightColor: "transparent",
          position: "relative",
          width: ICON_SIZE,
          height: ICON_SIZE,
          flexShrink: 0,
        }}
      >
        {dk && <HalftoneFilterDef id={filterId} dk={dk} hoverColor={hoverColor} t={t} />}

        {/* Base Icon */}
        <motion.div
          style={{ position: "absolute", inset: 0, color: baseColor, opacity: baseOpacity, willChange: "opacity" }}
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
        </motion.div>

        {/* Halftone Overlay Icon */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            color: hoverColor,
            filter: `url(#${filterId})`,
            opacity: overlayOpacity,
            willChange: "opacity, filter"
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
        </motion.div>
      </button>
    </div>
  );
}
