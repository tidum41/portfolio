"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useDialKit } from 'dialkit';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import { VinylPlayer } from './components/VinylPlayer/VinylPlayer';
import { AlbumGrid } from './components/AlbumGrid/AlbumGrid';
import { DragDisc } from './components/Disc/DragDisc';
import { AudioConsent } from './components/AudioConsent/AudioConsent';
import { usePlayerState } from './hooks/usePlayerState';
import { useAudio } from './hooks/useAudio';
import { EASE_OPACITY, PANEL_DURATION } from '@/lib/motion';
import { useAlbumColors } from './hooks/useAlbumColors';
import { albums } from './data/albums';
import type { Album } from './data/albums';
import { DragHint } from './components/DragHint/DragHint';
import styles from './CdPlayerApp.module.css';

// Ported from the standalone CD Player app (github.com/tidum41/cdplayer) —
// this used to be embedded via iframe with a postMessage pointer-forwarding
// protocol (see that repo's App.tsx / MusicPlayerEmbed.tsx for the Framer
// version, which still needs it). Native here: no origin boundary, so real
// DOM pointer/touch events reach dnd-kit directly — the forwarding listener
// and the `window.self !== window.top` cursor-hide check are both gone.

const PLAYER_W = 893;
const PLAYER_H = 1321;
const PLATTER_SIZE = 835;
const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(', ')})`;

/** Compact carousel covers on narrow/short stacks so the vinyl stays fully visible. */
function carouselArtForWidth(width: number, dialSize: number, height = Infinity): number {
  let size = dialSize;
  if (width < 400) size = Math.min(size, 40);
  else if (width < 520) size = Math.min(size, 46);
  else if (width < 700) size = Math.min(size, 56);
  // Short popup / about slots: shrink covers further so the player isn't cropped.
  if (height < 360) size = Math.min(size, 36);
  if (height < 280) size = Math.min(size, 32);
  return size;
}

export default function CdPlayerApp({ active = true, variant = 'work' }: { active?: boolean; variant?: 'work' | 'about' }) {
  // The /about page's static embed sits inline in a narrow text column, not
  // a full grid tile/popup — it needs its own (smaller) size and its own
  // tunable breakpoint, independent of the work-page instance. Separate
  // DialKit key so tuning one never moves the other.
  const dk = useDialKit(variant === 'about' ? 'CDPlayerAbout' : 'CDPlayerWork', {
    // Breakpoint (px) below which the CD Player switches to the single-row
    // mobile carousel. "work" compares against the SITE's viewport width —
    // deliberately raised past `.portfolio-grid`'s own 767px breakpoint
    // (app/globals.css) rather than matching it: the 3-column album grid
    // needs more headroom than the rest of the page's layout does, so
    // tablet-ish widths (~800-1000px) that read fine as a single-column
    // page still need the CD player's own carousel mode to stay legible.
    // "about" instead compares against this component's OWN container width
    // (see the isVertical effect below) since it's embedded in a prose
    // column whose width doesn't track viewport width at all.
    // About column is ~340–400px on phones — breakpoint must sit above that
    // so carousel mode engages. Min 480 also invalidates older DialKit saves
    // that still had 320 (which kept phones in clipped horizontal layout).
    mobileBreakpoint:   variant === 'about' ? [560, 480, 800, 1] : [1000, 400, 1200, 1],
    targetPlayerWidth:  variant === 'about' ? [220, 120, 400, 1] : [460, 200, 620,  1],
    albumArtMaxSize:    [120, 60,  200,  1],
    // Mobile carousel default — kept modest so vertical stacks (player +
    // hint + covers + titles) fit the popup slot without clipping.
    // Max 64 clamps prior DialKit saves that still had 78.
    carouselArtSize:    [56,  36,  64,  1],
    gridGap:            [14,  0,   40,   1],
    transportBarHeight: [271, 150, 350,  1],
    titleFontSize:      [11,  8,   18,   0.5],
    artistFontSize:     [10,  8,   16,   0.5],
    dateLine1FontSize:  [24,  14,  34,   1],
    dateLine2FontSize:  [20,  12,  28,   1],
  });

  const { activeAlbum, isPlaying, loadAlbum, play, pause, eject } = usePlayerState();
  const { loadAndPlay, playAudio, pauseAudio, stopAudio, volumeUp, volumeDown, volume, analyserRef, scratchAudio, primeAudio, audioError, clearAudioError } = useAudio();
  const colorMap = useAlbumColors(albums);
  const [scratchRate, setScratchRate] = useState(1);
  const [dragAlbum, setDragAlbum] = useState<Album | null>(null);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [snapAnim, setSnapAnim] = useState(false);
  const [ejectAnim, setEjectAnim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  // Seeded to match the server's fallback (no DOM to measure) so the grid's
  // artSize/gridWidth agree on the very first client render; corrected
  // post-mount by updateScale, same pattern as `scale`/`isVertical` above.
  const [containerH, setContainerH] = useState(800);
  const [dragDiscSize, setDragDiscSize] = useState(120);
  const [dragCursorPos, setDragCursorPos] = useState<{x: number; y: number} | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [containerW, setContainerW] = useState(800);
  const [audioEnabled, setAudioEnabled] = useState<boolean | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [ejectDragPos, setEjectDragPos] = useState<{ x: number; y: number } | null>(null);
  const pendingAlbumRef = useRef<Album | null>(null);
  const [liveMessage, setLiveMessage] = useState('');
  const announceOnMountRef = useRef(false);

  const platterCenterRef = useRef<{ x: number; y: number } | null>(null);
  const ejectAnimatingRef = useRef(false); // guard against double-eject
  const containerRef = useRef<HTMLDivElement>(null);
  const artSizeRef = useRef(120); // updated each render; handlers see current artSize via closure

  // Layout mode always follows this component's container width — never the
  // site viewport. Grid tiles sit in ~half-width columns (~350–500px) even on
  // wide desktops; viewport breakpoints pinned them in horizontal 3×3 mode.
  const carouselAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => {
      const w = el.clientWidth;
      setContainerW(w);
      setIsVertical(w < dk.mobileBreakpoint);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dk.mobileBreakpoint]);

  const updateScale = useCallback(() => {
    const el = containerRef.current;
    const W = el?.clientWidth  ?? window.innerWidth;
    const H = el?.clientHeight || el?.offsetHeight || window.innerHeight;
    setContainerW(W);

    if (isVertical) {
      // Shrink carousel art at narrow/short widths so the vinyl + covers both fit.
      const carouselArt = carouselArtForWidth(W, dk.carouselArtSize, H);
      const DRAG_HINT_H = 30;
      const CAROUSEL_PAD_V = 16;
      const META_H = Math.ceil(dk.titleFontSize * 1.35 * 2 + dk.artistFontSize * 1.35 + 7);
      const GRID_COL_PAD = 4;
      const CONTENT_TOP_PAD = 8;
      const BUFFER = 4;
      const computedReserve =
        DRAG_HINT_H + CAROUSEL_PAD_V + carouselArt + META_H + GRID_COL_PAD + CONTENT_TOP_PAD + BUFFER;
      // Prefer the laid-out carousel block height so player scale matches the
      // real vertical stack (hint + row + padding) instead of a static guess.
      const measuredReserve = carouselAreaRef.current?.offsetHeight ?? 0;
      const RESERVED_CAROUSEL_H =
        measuredReserve > 0 ? measuredReserve + BUFFER : computedReserve;
      const availW = W * 0.96;
      // Leave a few px so title/artist lines under covers aren't clipped.
      const availH = Math.max(80, H - RESERVED_CAROUSEL_H - 8);
      const s = Math.min(1, availW / PLAYER_W, availH / PLAYER_H);
      // Fit-to-slot: no hard floor — a floor larger than available height was
      // clipping the player and "↑ drag to play" hint inside overflow:hidden.
      setScale(Math.max(0.08, s));
    } else {
      // Horizontal: prefer a fixed (dial-tunable) player width; only shrink for tight viewports.
      // Desktop popup slots are wider now (~960), so allow up to ~58% of the container.
      const targetScale = dk.targetPlayerWidth / PLAYER_W;
      const maxFromW = (W * 0.58) / PLAYER_W;
      const maxFromH = Math.max(0.12, (H - 24) / PLAYER_H);
      const s = Math.min(targetScale, maxFromW, maxFromH);
      setScale(Math.max(0.14, s));
    }
    setContainerH(H);
  }, [isVertical, dk.targetPlayerWidth, dk.carouselArtSize, dk.titleFontSize, dk.artistFontSize]);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    if (carouselAreaRef.current) ro.observe(carouselAreaRef.current);
    return () => {
      window.removeEventListener('resize', updateScale);
      ro.disconnect();
    };
  }, [updateScale, isVertical]);

  // Screen-reader announcements for load / play / pause / errors
  useEffect(() => {
    if (!announceOnMountRef.current) {
      announceOnMountRef.current = true;
      return;
    }
    if (audioError) {
      setLiveMessage(audioError);
      return;
    }
    if (isLoading && activeAlbum) {
      setLiveMessage(`Loading ${activeAlbum.title}`);
      return;
    }
    if (activeAlbum) {
      setLiveMessage(
        isPlaying
          ? `Now playing ${activeAlbum.title} by ${activeAlbum.artist}`
          : `Paused: ${activeAlbum.title} by ${activeAlbum.artist}`
      );
    }
  }, [activeAlbum, isPlaying, isLoading, audioError]);

  const updatePlatterCenter = useCallback(() => {
    if (!containerRef.current) return;
    const platterEl = containerRef.current.querySelector('[data-platter]') as HTMLElement | null;
    if (platterEl) {
      const rect = platterEl.getBoundingClientRect();
      platterCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      return;
    }
    const sizer = containerRef.current.querySelector('[data-player-sizer]') as HTMLElement;
    if (!sizer) return;
    const rect = sizer.getBoundingClientRect();
    const platterCx = rect.left + (PLAYER_W / 2) * scale;
    const platterCy = rect.top + (120 + PLATTER_SIZE / 2) * scale;
    platterCenterRef.current = { x: platterCx, y: platterCy };
  }, [scale]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 12 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setDragAlbum(event.active.data.current?.album ?? null);
    setDragDiscSize(artSizeRef.current);
    setDragCursorPos(null);
    setDragDirection(null);
    updatePlatterCenter();
  }

  function getActivatorCoords(activatorEvent: Event): { x: number; y: number } {
    if (typeof TouchEvent !== 'undefined' && activatorEvent instanceof TouchEvent) {
      const t = activatorEvent.changedTouches[0] ?? activatorEvent.touches[0];
      return { x: t?.clientX ?? 0, y: t?.clientY ?? 0 };
    }
    const pe = activatorEvent as PointerEvent;
    return { x: pe.clientX, y: pe.clientY };
  }

  function handleDragMove(event: DragMoveEvent) {
    const dx = event.delta?.x ?? 0;
    const dy = event.delta?.y ?? 0;

    updatePlatterCenter();

    // Track actual cursor/touch position for the fixed-position disc
    if (event.activatorEvent) {
      const { x: startX, y: startY } = getActivatorCoords(event.activatorEvent);
      setDragCursorPos({ x: startX + dx, y: startY + dy });
    }

    // Grow disc as cursor approaches platter. Use a fixed reference distance so
    // overshooting the platter center never makes the disc shrink back.
    if (platterCenterRef.current && event.activatorEvent) {
      const { x: startX, y: startY } = getActivatorCoords(event.activatorEvent);
      const cursorX = startX + dx;
      const cursorY = startY + dy;
      const pc = platterCenterRef.current;
      const dist = Math.sqrt((cursorX - pc.x) ** 2 + (cursorY - pc.y) ** 2);
      // Disc reaches full platter size when cursor is within 60px of platter center
      const FULL_SIZE_DIST = 60;
      // Disc starts growing when cursor is within GROWTH_DIST of platter center
      const GROWTH_DIST = 380;
      const rawT = Math.max(0, Math.min(1, 1 - (dist - FULL_SIZE_DIST) / (GROWTH_DIST - FULL_SIZE_DIST)));
      const t = rawT * rawT; // ease-in
      const minSize = artSizeRef.current;
      const targetSize = PLATTER_SIZE * scale * 0.92;
      setDragDiscSize(Math.round(minSize + (targetSize - minSize) * t));
    }

    // Track cardinal drag direction (4-way only, threshold 8px)
    if (Math.abs(dx) >= 8 || Math.abs(dy) >= 8) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        setDragDirection(dx > 0 ? 'right' : 'left');
      } else {
        setDragDirection(dy > 0 ? 'down' : 'up');
      }
    }
  }

  const loadAlbumWithAudio = useCallback((album: Album, withAudio: boolean) => {
    // Prime the AudioContext NOW (inside the user gesture) so iOS Safari doesn't
    // block the audio.play() that fires 1300ms later inside a setTimeout.
    if (withAudio) primeAudio();
    loadAlbum(album);
    setIsLoading(true);
    setSnapAnim(true);
    setTimeout(() => setSnapAnim(false), 500);
    setTimeout(() => {
      setIsLoading(false);
      play();
      if (withAudio) loadAndPlay(album);
    }, 1300);
  }, [loadAlbum, play, loadAndPlay, primeAudio]);

  function handleDragEnd(event: DragEndEvent) {
    const droppedOnPlatter =
      event.over?.id === 'platter' && event.active.data.current?.album;

    if (droppedOnPlatter) {
      const album = event.active.data.current!.album as Album;
      if (audioEnabled === null) {
        pendingAlbumRef.current = album;
        setShowConsent(true);
      } else {
        loadAlbumWithAudio(album, audioEnabled);
      }
    }

    setDragAlbum(null);
    setDragDiscSize(artSizeRef.current);
    setDragCursorPos(null);
    setDragDirection(null);
  }

  const handleConsentAccept = useCallback(() => {
    setAudioEnabled(true);
    setShowConsent(false);
    const album = pendingAlbumRef.current;
    pendingAlbumRef.current = null;
    if (album) loadAlbumWithAudio(album, true);
  }, [loadAlbumWithAudio]);

  const handleConsentDecline = useCallback(() => {
    setAudioEnabled(false);
    setShowConsent(false);
    const album = pendingAlbumRef.current;
    pendingAlbumRef.current = null;
    if (album) loadAlbumWithAudio(album, false);
  }, [loadAlbumWithAudio]);

  const handleAlbumTap = useCallback((album: Album) => {
    if (audioEnabled === null) {
      pendingAlbumRef.current = album;
      setShowConsent(true);
    } else {
      loadAlbumWithAudio(album, audioEnabled);
    }
  }, [audioEnabled, loadAlbumWithAudio]);

  const handlePlay = useCallback(() => {
    if (activeAlbum) { play(); if (audioEnabled !== false) playAudio(); }
  }, [activeAlbum, play, playAudio, audioEnabled]);

  const handlePause = useCallback(() => {
    pause(); if (audioEnabled !== false) pauseAudio();
  }, [pause, pauseAudio, audioEnabled]);

  // Stop playback when the popup modal closes (active flips true -> false).
  // The instance stays portaled/mounted (per PersistentWorkShell's single-
  // instance architecture) so the loaded album is still there next time it
  // opens — this only pauses, it doesn't eject.
  const prevActiveRef = useRef(active);
  useEffect(() => {
    if (prevActiveRef.current && !active) handlePause();
    prevActiveRef.current = active;
  }, [active, handlePause]);

  const handleEject = useCallback(() => {
    if (ejectAnimatingRef.current) return;
    ejectAnimatingRef.current = true;
    setEjectAnim(true);
    setTimeout(() => {
      setEjectAnim(false);
      ejectAnimatingRef.current = false;
      eject();
      setDragAlbum(null);
      setEjectDragPos(null);
      setScratchRate(1);
      if (audioEnabled !== false) stopAudio();
    }, 440);
  }, [eject, stopAudio, audioEnabled]);

  const handleScratch = useCallback((degPerMs: number) => {
    if (audioEnabled !== false) scratchAudio(degPerMs);
    if (degPerMs === 0) {
      setScratchRate(1);
    } else {
      const normalDegPerMs = 360 / (16 * 1000);
      const rate = degPerMs / normalDegPerMs;
      // Allow full signed range — negative = counter-clockwise = rewind
      setScratchRate(Math.max(-3.5, Math.min(3.5, rate)));
    }
  }, [audioEnabled, scratchAudio]);

  const handleEjectDragMove = useCallback((x: number, y: number) => {
    setEjectDragPos({ x, y });
  }, []);

  const handleEjectDragCancel = useCallback(() => {
    setEjectDragPos(null);
  }, []);

  // ── Disc speed normalization ───────────────────────────────────────────────
  // Desktop reference scale ≈ targetPlayerWidth / PLAYER_W. On mobile the player
  // is rendered much smaller, so the disc appears to spin slower at the same deg/frame.
  // Multiply by the inverse ratio so perceived angular velocity stays consistent.
  const discSpeedMultiplier = Math.min(2.5, Math.max(1, (dk.targetPlayerWidth / PLAYER_W) / scale));

  // ── Layout math ────────────────────────────────────────────────────────────
  const playerWidth  = PLAYER_W * scale;
  const playerHeight = PLAYER_H * scale;

  const GRID_GAP = dk.gridGap;

  let artSize: number;
  let gridWidth: number;

  if (isVertical) {
    // Vertical: single-row carousel, compact art so player gets more height
    artSize = carouselArtForWidth(containerW, dk.carouselArtSize, containerH);
    gridWidth = 0; // Not used in carousel mode
  } else {
    // Horizontal: fixed-width grid so player + grid sit compact and centered together.
    // Capped at albumArtMaxSize so drag distance to platter stays short (UX).
    // Uses the `containerH` state (updated post-mount by updateScale) rather
    // than reading containerRef/window directly during render — that direct
    // read differed between the server's fallback and the client's real,
    // already-measured value, causing a hydration mismatch on this width.
    const availGridH = containerH - 32;
    const META_H = 65;
    const artFromH = Math.max(40, Math.floor((availGridH - GRID_GAP * 2 - 3 * META_H) / 3));
    artSize   = Math.max(40, Math.min(dk.albumArtMaxSize, artFromH));
    gridWidth  = artSize * 3 + GRID_GAP * 2;
  }
  artSizeRef.current = artSize;

  // ── Eject drag disc size ──────────────────────────────────────────────────
  let ejectDiscSize = 0;
  if (ejectDragPos && platterCenterRef.current && activeAlbum) {
    const pc = platterCenterRef.current;
    const dx = ejectDragPos.x - pc.x;
    const dy = ejectDragPos.y - pc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const platterRadius = (PLATTER_SIZE * scale) / 2;
    const distFromEdge = Math.max(0, dist - platterRadius);
    const maxDist = 280;
    const t = Math.min(1, distFromEdge / maxDist);
    const maxSize = PLATTER_SIZE * scale * 0.70;
    const minSize = artSize;
    ejectDiscSize = Math.round(maxSize * (1 - t) + minSize * t);
  }

  return (
    <>
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
      {showConsent && (
        <AudioConsent onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      )}
      <DndContext
        id="cd-player-dnd"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div
          className={`${styles.layout} ${isVertical ? styles.layoutVertical : ''}`}
          ref={containerRef}
          style={{
            '--cd-transport-bar-height': `${dk.transportBarHeight}px`,
            '--cd-title-font-size': `${dk.titleFontSize}px`,
            '--cd-artist-font-size': `${dk.artistFontSize}px`,
            '--cd-date-line1-font-size': `${dk.dateLine1FontSize}px`,
            '--cd-date-line2-font-size': `${dk.dateLine2FontSize}px`,
          } as React.CSSProperties}
        >
          {audioError && (
            <div className={styles.audioError} role="alert">
              <span>{audioError}</span>
              <button type="button" className={styles.audioErrorDismiss} onClick={clearAudioError} aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}
          <div className={`${styles.contentBox} ${isVertical ? styles.contentBoxVertical : ''}`}>

            {/* CD Player */}
            <div className={`${styles.playerCol} ${isVertical ? styles.playerColVertical : ''}`}>
              <div
                data-player-sizer
                style={{
                  width: playerWidth,
                  height: playerHeight,
                  flexShrink: 0,
                  // Reparenting into the popup can't recompute `scale` from
                  // this container's new size until a frame after the DOM
                  // actually moves (ResizeObserver is async) — animating the
                  // correction turns that one-frame snap into a deliberate
                  // settle instead of a visible jitter. Uses the SAME
                  // duration/easing as ProjectPopup's own panel fade-in
                  // (lib/motion.ts) rather than an independent 0.18s ease —
                  // an earlier version snapped this instantly instead to
                  // avoid a "grow" animation on open, but that just traded
                  // it for two motions (a smooth panel + content popping in
                  // with zero motion) reading as disjointed. Sharing one
                  // timing/easing across the panel and its content settles
                  // them together as a single motion.
                  transition: `width ${PANEL_DURATION.panel.enter}s ${EASE_CSS}, height ${PANEL_DURATION.panel.enter}s ${EASE_CSS}`,
                }}
              >
                <div style={{
                  width: PLAYER_W,
                  height: PLAYER_H,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  transition: `transform ${PANEL_DURATION.panel.enter}s ${EASE_CSS}`,
                }}>
                  <VinylPlayer
                    activeAlbum={activeAlbum}
                    isPlaying={isPlaying}
                    isLoading={isLoading}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEject={handleEject}
                    onVolumeUp={volumeUp}
                    onVolumeDown={volumeDown}
                    snapAnim={snapAnim}
                    ejectAnim={ejectAnim}
                    discSpeedMultiplier={discSpeedMultiplier}
                    volume={volume}
                    analyserRef={analyserRef}
                    onScratch={handleScratch}
                    scratchRate={scratchRate}
                    onEjectDragMove={handleEjectDragMove}
                    onEjectDragCancel={handleEjectDragCancel}
                  />
                </div>
              </div>
            </div>

            {/* Album Grid — wrapped in relative div so horizontal hint floats above without being clipped by overflow */}
            <div
              ref={isVertical ? carouselAreaRef : undefined}
              className={styles.gridColWrapper}
              style={isVertical ? { width: '100%' } : { width: gridWidth }}
            >
              {/* Horizontal hint: absolute above gridCol, never inside the overflow container */}
              {!isVertical && (
                <DragHint variant="horizontal" visible={!activeAlbum} />
              )}
              <div
                className={`${styles.gridCol} ${isVertical ? styles.gridColVertical : ''}`}
              >
                <AlbumGrid
                  activeAlbumId={activeAlbum?.id ?? null}
                  gridWidth={isVertical ? undefined : gridWidth}
                  artSize={artSize}
                  colorMap={colorMap}
                  isCarousel={isVertical}
                  onAlbumTap={handleAlbumTap}
                  dragDirection={dragDirection}
                  showHint={!activeAlbum}
                />
              </div>
            </div>

          </div>
        </div>

      </DndContext>

      {/* Disc peek/drag ghost — fixed-position, escapes all overflow clipping.
          z-index 1000 puts it above the grid but the dragging card's art is z-index 1001
          so the disc appears to emerge from behind the album cover. */}
      {dragAlbum && dragDirection !== null && dragCursorPos && (
        <div style={{
          position: 'fixed',
          left: dragCursorPos.x - dragDiscSize / 2,
          top: dragCursorPos.y - dragDiscSize / 2,
          width: dragDiscSize,
          height: dragDiscSize,
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'width 0.08s linear, height 0.08s linear',
        }}>
          <DragDisc size={dragDiscSize} color={colorMap[dragAlbum.id] ?? dragAlbum.color} />
        </div>
      )}

      {/* Eject drag ghost — fixed-position disc that appears when dragging disc off platter */}
      {ejectDragPos && activeAlbum && ejectDiscSize > 0 && (
        <div style={{
          position: 'fixed',
          left: ejectDragPos.x,
          top: ejectDragPos.y,
          width: ejectDiscSize,
          height: ejectDiscSize,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'width 0.05s linear, height 0.05s linear',
        }}>
          <DragDisc size={ejectDiscSize} color={colorMap[activeAlbum.id] ?? activeAlbum.color} />
        </div>
      )}
    </>
  );
}
