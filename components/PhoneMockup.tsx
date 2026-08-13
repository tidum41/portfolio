"use client";

import { useRef, useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { useDialKit } from "dialkit";

const REF_W = 344;
const REF_H = 614;
const PHONE_W = 280;
const PHONE_H = 580;

export type PhoneMockupValues = {
  insetTop: number;
  insetBottom: number;
  insetSide: number;
  screenRadius: number;
  videoX: number;
  videoY: number;
  videoScale: number;
};

interface Props {
  frameSrc?: string;
  videoSrc?: string;
  muxPlaybackId?: string;
  poster?: string;
  insetTop?: number;
  insetBottom?: number;
  insetSide?: number;
  screenRadius?: number;
  videoX?: number;
  videoY?: number;
  videoScale?: number;
  autoPlay?: boolean;
  loop?: boolean;
  showFrame?: boolean;
  /** Unique key used for dialkit controls — allows per-instance tuning */
  instanceKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PhoneMockup({
  frameSrc = "/images/phone-frame.webp",
  videoSrc,
  muxPlaybackId,
  poster,
  insetTop,
  insetBottom,
  insetSide,
  screenRadius,
  videoX,
  videoY,
  videoScale,
  autoPlay = true,
  loop = true,
  showFrame = false,
  instanceKey = "default",
  className,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [containerWidth, setContainerWidth] = useState(REF_W);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Per-instance dialkit key so each phone can be tuned independently
  const dialKey = `PhoneMockup/${instanceKey}`;
  const dk = useDialKit(dialKey, {
    insetTop:     [1.5,  0, 15,  0.01],
    insetBottom:  [1.5,  0, 15,  0.01],
    insetSide:    [4.0,  0, 15,  0.01],
    screenRadius: [7.5,  0, 20,  0.01],
    videoX:       [0.0, -12, 12, 0.01],
    videoY:       [0.0, -12, 12, 0.01],
    videoScale:   [1.0,  0.8, 1.4, 0.01],
  });

  const resolved = {
    insetTop:     insetTop     ?? dk.insetTop,
    insetBottom:  insetBottom  ?? dk.insetBottom,
    insetSide:    insetSide    ?? dk.insetSide,
    screenRadius: screenRadius ?? dk.screenRadius,
    videoX:       videoX       ?? dk.videoX,
    videoY:       videoY       ?? dk.videoY,
    videoScale:   videoScale   ?? dk.videoScale,
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.min(entry.contentRect.width, REF_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShouldLoad(true); obs.disconnect(); } },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scale = containerWidth / REF_W;
  const intrinsicHeight = containerWidth * (REF_H / REF_W);
  const hasVideo = !!(muxPlaybackId || videoSrc);
  const muxPoster = muxPlaybackId
    ? `https://image.mux.com/${muxPlaybackId}/thumbnail.webp?time=1&width=640`
    : poster;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    isPlaying ? video.pause() : video.play();
    setIsPlaying((p) => !p);
  };

  const playPauseButton = videoSrc && !muxPlaybackId ? (
    <button
      onClick={togglePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isPlaying ? "Pause" : "Play"}
      className="phone-mockup-play-btn"
      style={{
        position: "absolute", top: 8, right: 8, zIndex: 10,
        width: 32, height: 32, borderRadius: "50%",
        background: "var(--color-placeholder)",
        boxShadow: isHovered ? "inset 0 0 0 1.5px var(--color-text-muted)" : "none",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        flexShrink: 0,
        transition: "box-shadow 150ms ease",
      }}
    >
      {isPlaying ? (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <rect x="1.5" y="1.5" width="3" height="8" rx="1" fill="var(--color-text-secondary)" />
          <rect x="6.5" y="1.5" width="3" height="8" rx="1" fill="var(--color-text-secondary)" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" style={{ marginLeft: 1 }}>
          <path d="M2 1.5 L9.5 5.5 L2 9.5 Z" fill="var(--color-text-secondary)" />
        </svg>
      )}
    </button>
  ) : null;

  const phoneContent = (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        margin: "0 auto",
        ...(showFrame ? {} : style),
        maxWidth: REF_W,
        height: intrinsicHeight,
        opacity: 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: PHONE_W,
          height: PHONE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Screen window — sits behind the frame PNG */}
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            top: `${resolved.insetTop}%`,
            bottom: `${resolved.insetBottom}%`,
            left: `${resolved.insetSide}%`,
            right: `${resolved.insetSide}%`,
            borderRadius: `${resolved.screenRadius}%`,
            overflow: "hidden",
            background: "#000",
          }}
        >
          {hasVideo ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `translate(${resolved.videoX}%, ${resolved.videoY}%) scale(${resolved.videoScale})`,
                transformOrigin: "center center",
              }}
            >
              {muxPoster && (
                <img
                  src={muxPoster}
                  alt=""
                  aria-hidden
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", pointerEvents: "none",
                  }}
                />
              )}
              {shouldLoad && muxPlaybackId && (
                <MuxPlayer
                  playbackId={muxPlaybackId}
                  streamType="on-demand"
                  autoPlay="muted"
                  loop muted playsInline nohotkeys
                  preload="auto"
                  poster={muxPoster}
                  style={{
                    display: "block",
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    // @ts-expect-error Mux player CSS custom properties
                    "--controls": "none",
                    "--media-background-color": "transparent",
                  }}
                />
              )}
              {shouldLoad && !muxPlaybackId && videoSrc && (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  poster={poster}
                  autoPlay={autoPlay}
                  loop={loop}
                  muted playsInline
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
          ) : (
            <div style={{
              width: "100%", height: "100%", background: "#1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "sans-serif",
            }}>
              no video
            </div>
          )}
        </div>

        {/* Phone frame PNG — overlaid at z-index 2 */}
        {frameSrc && (
          <img
            src={frameSrc}
            alt=""
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              objectFit: "contain",
              zIndex: 2, pointerEvents: "none", userSelect: "none",
            }}
          />
        )}
      </div>

      {/* Play/pause — only when NOT showFrame (frame variant positions button in its own container) */}
      {!showFrame && playPauseButton}
    </div>
  );

  if (showFrame) {
    return (
      <div style={{
        position: "relative",
        background: "var(--color-placeholder)",
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}>
        {phoneContent}
        {playPauseButton}
      </div>
    );
  }

  return phoneContent;
}
