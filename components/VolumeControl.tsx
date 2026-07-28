"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HalftoneDotField } from "./HalftoneDotField";
import { VOLUME_MASK_SVG, MUTED_MASK_SVG, VOLUME_CLONE_INNER, MUTED_CLONE_INNER } from "./halftoneIconMasks";
import { useHalftoneMorph } from "./useHalftoneMorph";
import { useIsMobile } from "./useIsMobile";
import { motion, useReducedMotion } from "framer-motion";

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
  // Compact (no hover-reveal slider) on touch devices OR a narrow viewport —
  // `isMobile` alone only catches touch-capable devices; a plain desktop
  // browser window resized narrow is mouse-capable (isMobile stays false)
  // but still has no room for a hover-revealed slider and no hover gesture
  // reliably available at that width either.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const isCompact = isMobile || isNarrow;
  const audioRef = useRef<HTMLAudioElement>(null);
  // Remembers the last non-zero volume so unmuting restores it rather than
  const preVolume = useRef(DEFAULT_VOLUME);
  // Mirrors React state for the ref callback — deps must stay [] so Nav
  // re-renders don't detach/reattach the node and reset playback.
  const mutedRef = useRef(DEFAULT_MUTED);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const reduced = useReducedMotion();

  const applyAudioState = useCallback((nextMuted: boolean, nextVolume: number) => {
    mutedRef.current = nextMuted;
    volumeRef.current = nextVolume;
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = nextMuted;
    audio.volume = nextVolume;
  }, []);

  const tryPlay = useCallback((audible = false) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audible) {
      audio.muted = mutedRef.current;
      audio.volume = volumeRef.current;
    }
    audio.play().catch(() => {
      // Blocked or not ready yet — canplay handler below retries muted start.
    });
  }, []);

  // Two React quirks meet at this ref, both worth spelling out:
  //  1. `muted` is a controlled media property — React re-asserts a literal
  //     JSX value for it on every re-render (e.g. when Nav re-renders on
  //     route change via usePathname()), which would stomp a real unmute.
  //  2. The `<audio>` tag itself only mounts on this component's *first*
  //     real render, so a `useEffect` keyed on `[muted]`/`[volume]` sees
  //     the same state values on that mount and — since nothing "changed" —
  //     never fires again to apply them to the newly created node.
  // Setting both directly here, once, at the moment the real node is
  // created sidesteps both: the effects below then own every *subsequent*
  // update, which are genuine value changes and fire correctly.
  // We also call .play() explicitly — browsers allow autoplay for muted
  // audio, but only if play() is initiated; the `autoPlay` attribute alone
  // is frequently blocked until a user gesture occurs.
  const setAudioNode = useCallback((node: HTMLAudioElement | null) => {
    audioRef.current = node;
    if (!node) return;
    node.muted = mutedRef.current;
    node.volume = volumeRef.current;
    const onCanPlay = () => {
      if (!node.paused) return;
      node.play().catch(() => {});
    };
    node.addEventListener("canplay", onCanPlay);
    node.play().catch(() => {});
    return () => node.removeEventListener("canplay", onCanPlay);
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Slider value: show 0 when muted, actual volume when unmuted.
  const sliderValue = muted ? 0 : volume;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    const nextMuted = v === 0;
    const nextVolume = v > 0 ? v : preVolume.current;
    if (v > 0) preVolume.current = v;
    // Apply on the DOM synchronously inside this gesture — unmute before
    // play() so audible start isn't deferred to a post-commit effect.
    applyAudioState(nextMuted, nextVolume);
    if (!nextMuted) tryPlay(true);
    setVolume(nextVolume);
    setMuted(nextMuted);
  };

  const handleMuteToggle = () => {
    if (muted) {
      const nextVolume = preVolume.current;
      applyAudioState(false, nextVolume);
      tryPlay(true);
      setVolume(nextVolume);
      setMuted(false);
    } else {
      if (volume > 0) preVolume.current = volume;
      applyAudioState(true, volume);
      setMuted(true);
    }
  };

  // dk.keepEffectOn (DialKit dev panel) pins the effect active regardless
  // of real hover/tap — see HalftoneNavLink.tsx's matching comment for why.
  const active = !!dk?.enabled && (!!dk?.keepEffectOn || isHovered || isTapped);

  const { filterId, t } = useHalftoneMorph(dk, active);

  // Fixed-duration, active-driven crossfade — NOT derived from `t`. See
  // useHalftoneMorph.ts's doc comment: base and overlay always share this
  // exact duration and start together, a strict complementary pair, which
  // is what guarantees the crisp icon and the halftone dots are never both
  // substantially gone at once.
  const crossfadeMs = reduced ? 1 : active ? (dk?.showHideSpeed?.showDurationMs ?? 220) : (dk?.showHideSpeed?.hideDurationMs ?? 550);
  const crossfadeTransition = { duration: crossfadeMs / 1000, ease: "easeInOut" as const };

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
        // collapsing the slider before it can be reached. On touch (no
        // hover), the slider never renders at all, so just the icon's width
        // keeps the control compact instead of reserving dead space.
        width: isCompact ? ICON_SIZE : ICON_SIZE + GAP + SLIDER_WIDTH,
      }}
    >
      <audio ref={setAudioNode} src="/audio/ps3-xmb-menu.mp3" loop preload="auto" />
      {!isCompact && (
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
      )}
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
        {/* Base Icon */}
        <motion.div
          style={{ position: "absolute", inset: 0, color: baseColor, willChange: "opacity" }}
          initial={false}
          animate={{ opacity: active ? 0 : 1 }}
          transition={crossfadeTransition}
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

        {/* Halftone Overlay Icon (independently-animated dots, see HalftoneDotField) */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            willChange: "opacity"
          }}
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={crossfadeTransition}
        >
          <motion.span
            aria-hidden
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            initial={false}
            animate={muted ? hiddenAnim : visibleAnim}
            transition={spring}
          >
            <HalftoneDotField id={filterId + "-volume"} dk={dk} hoverColor={hoverColor} t={t} content={{ type: "icon", svgMarkup: VOLUME_MASK_SVG, sizeCss: ICON_SIZE, cloneInner: VOLUME_CLONE_INNER }} />
          </motion.span>
          <motion.span
            aria-hidden
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            initial={false}
            animate={muted ? visibleAnim : hiddenAnim}
            transition={spring}
          >
            <HalftoneDotField id={filterId + "-muted"} dk={dk} hoverColor={hoverColor} t={t} content={{ type: "icon", svgMarkup: MUTED_MASK_SVG, sizeCss: ICON_SIZE, cloneInner: MUTED_CLONE_INNER }} />
          </motion.span>
        </motion.div>
      </button>
    </div>
  );
}
