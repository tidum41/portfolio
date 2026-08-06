"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HalftoneDotField } from "./HalftoneDotField";
import { VOLUME_MASK_SVG, MUTED_MASK_SVG, VOLUME_CLONE_INNER, MUTED_CLONE_INNER } from "./halftoneIconMasks";
import { useHalftoneMorph } from "./useHalftoneMorph";
import { useIsMobile } from "./useIsMobile";
import { motion, useReducedMotion } from "framer-motion";
import { playUiSound, setUiSoundVolume, warmUiSounds } from "@/lib/uiSound";

const ICON_SIZE = 17;
const SLIDER_WIDTH = 72;
const GAP = 8;

const STORAGE_VOLUME = "site-audio-volume";
const STORAGE_AMBIENT_MUTED = "site-ambient-muted";

const DEFAULT_AMBIENT_MUTED = true;
const DEFAULT_VOLUME = 0.4;

function readStoredVolume(): number {
  try {
    const raw = localStorage.getItem(STORAGE_VOLUME);
    if (raw != null) {
      const n = parseFloat(raw);
      if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
    }
  } catch {
    // private mode / blocked storage
  }
  return DEFAULT_VOLUME;
}

function readStoredAmbientMuted(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_AMBIENT_MUTED);
    if (raw === "false") return false;
    if (raw === "true") return true;
  } catch {
    // private mode / blocked storage
  }
  return DEFAULT_AMBIENT_MUTED;
}

function persistVolume(volume: number) {
  try {
    localStorage.setItem(STORAGE_VOLUME, String(volume));
  } catch {
    // ignore
  }
}

function persistAmbientMuted(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_AMBIENT_MUTED, String(muted));
  } catch {
    // ignore
  }
}

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

export default function VolumeControl({ dk }: { dk?: any }) {
  const [ambientMuted, setAmbientMuted] = useState(() =>
    typeof window !== "undefined" ? readStoredAmbientMuted() : DEFAULT_AMBIENT_MUTED,
  );
  const [volume, setVolume] = useState(() =>
    typeof window !== "undefined" ? readStoredVolume() : DEFAULT_VOLUME,
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
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
  const preVolume = useRef(volume);
  const ambientMutedRef = useRef(ambientMuted);
  const volumeRef = useRef(volume);
  const reduced = useReducedMotion();

  const applyAmbientState = useCallback((nextMuted: boolean, nextVolume: number) => {
    ambientMutedRef.current = nextMuted;
    volumeRef.current = nextVolume;
    setUiSoundVolume(nextVolume);
    persistVolume(nextVolume);
    persistAmbientMuted(nextMuted);
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = nextMuted;
    audio.volume = nextVolume;
  }, []);

  useEffect(() => {
    setUiSoundVolume(volume);
  }, [volume]);

  const tryPlayAmbient = useCallback((audible = false) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audible) {
      audio.muted = ambientMutedRef.current;
      audio.volume = volumeRef.current;
    }
    audio.play().catch(() => {
      // Blocked or not ready yet.
    });
  }, []);

  const setAudioNode = useCallback((node: HTMLAudioElement | null) => {
    audioRef.current = node;
    if (!node) return;
    node.muted = ambientMutedRef.current;
    node.volume = volumeRef.current;
  }, []);

  useEffect(() => {
    ambientMutedRef.current = ambientMuted;
    if (!audioRef.current) return;
    audioRef.current.muted = ambientMuted;
  }, [ambientMuted]);

  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const sliderValue = ambientMuted ? 0 : volume;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    const nextAmbientMuted = v === 0;
    const nextVolume = v > 0 ? v : preVolume.current;
    if (v > 0) preVolume.current = v;
    const wasAmbientMuted = ambientMutedRef.current;
    applyAmbientState(nextAmbientMuted, nextVolume);
    if (!nextAmbientMuted) {
      tryPlayAmbient(true);
      warmUiSounds();
      if (wasAmbientMuted) void playUiSound("option");
    }
    setVolume(nextVolume);
    setAmbientMuted(nextAmbientMuted);
  };

  const handleMuteToggle = () => {
    if (ambientMuted) {
      const nextVolume = preVolume.current;
      applyAmbientState(false, nextVolume);
      tryPlayAmbient(true);
      warmUiSounds();
      void playUiSound("option");
      setVolume(nextVolume);
      setAmbientMuted(false);
    } else {
      if (volume > 0) preVolume.current = volume;
      applyAmbientState(true, volume);
      setAmbientMuted(true);
    }
  };

  const active = !!dk?.enabled && (!!dk?.keepEffectOn || isHovered || isTapped);

  const { filterId, t } = useHalftoneMorph(dk, active);

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

  const baseColor = ambientMuted ? "var(--color-text-muted)" : "var(--color-text-primary)";
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
        width: isCompact ? ICON_SIZE : ICON_SIZE + GAP + SLIDER_WIDTH,
      }}
    >
      <audio ref={setAudioNode} src="/audio/ps3-xmb-menu.mp3" loop preload="none" />
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
            aria-label="Background music volume"
            style={{ width: 64 }}
          />
        </motion.div>
      )}
      <button
        onClick={handleMuteToggle}
        className="nav-link theme-toggle-btn"
        aria-label={ambientMuted ? "Unmute background music" : "Mute background music"}
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
            animate={ambientMuted ? hiddenAnim : visibleAnim}
            transition={spring}
          >
            <VolumeIcon />
          </motion.span>
          <motion.span
            aria-hidden
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            initial={false}
            animate={ambientMuted ? visibleAnim : hiddenAnim}
            transition={spring}
          >
            <MutedIcon />
          </motion.span>
        </motion.div>

        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            willChange: "opacity",
          }}
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={crossfadeTransition}
        >
          <motion.span
            aria-hidden
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            initial={false}
            animate={ambientMuted ? hiddenAnim : visibleAnim}
            transition={spring}
          >
            <HalftoneDotField id={filterId + "-volume"} dk={dk} hoverColor={hoverColor} t={t} content={{ type: "icon", svgMarkup: VOLUME_MASK_SVG, sizeCss: ICON_SIZE, cloneInner: VOLUME_CLONE_INNER }} />
          </motion.span>
          <motion.span
            aria-hidden
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            initial={false}
            animate={ambientMuted ? visibleAnim : hiddenAnim}
            transition={spring}
          >
            <HalftoneDotField id={filterId + "-muted"} dk={dk} hoverColor={hoverColor} t={t} content={{ type: "icon", svgMarkup: MUTED_MASK_SVG, sizeCss: ICON_SIZE, cloneInner: MUTED_CLONE_INNER }} />
          </motion.span>
        </motion.div>
      </button>
    </div>
  );
}
