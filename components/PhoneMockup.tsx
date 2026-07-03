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
  className?: string;
  style?: React.CSSProperties;
}

export default function PhoneMockup({
  frameSrc = "/images/phone-frame.png",
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
  className,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [containerWidth, setContainerWidth] = useState(REF_W);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Live controls via DialKit — prop overrides take precedence
  const dk = useDialKit("PhoneMockup", {
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

  useEffect(() => {
    setFrameLoaded(false);
    if (!frameSrc) return;
    const img = imgRef.current;
    if (img?.complete && img?.naturalWidth > 0) setFrameLoaded(true);
  }, [frameSrc]);

  const scale = containerWidth / REF_W;
  const intrinsicHeight = containerWidth * (REF_H / REF_W);
  const hasVideo = !!(muxPlaybackId || videoSrc);
  const isVisible = !frameSrc || frameLoaded;

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
      style={{
        position: "absolute", top: 8, right: 8, zIndex: 10,
        width: 32, height: 32, borderRadius: "50%",
        background: isHovered ? "#E2E2E2" : "#F0F0F0",
        boxShadow: isHovered ? "inset 0 0 0 1.5px rgba(0,0,0,0.1)" : "none",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        flexShrink: 0, outline: "none",
      }}
    >
      {isPlaying ? (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <rect x="1.5" y="1.5" width="3" height="8" rx="1" fill="rgba(0,0,0,0.45)" />
          <rect x="6.5" y="1.5" width="3" height="8" rx="1" fill="rgba(0,0,0,0.45)" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" style={{ marginLeft: 1 }}>
          <path d="M2 1.5 L9.5 5.5 L2 9.5 Z" fill="rgba(0,0,0,0.45)" />
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
        opacity: isVisible ? 1 : 0,
        transition: "opacity 150ms ease",
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
              {shouldLoad && muxPlaybackId && (
                <MuxPlayer
                  playbackId={muxPlaybackId}
                  autoPlay="muted"
                  loop muted playsInline nohotkeys
                  style={{
                    display: "block", width: "100%", height: "100%", objectFit: "cover",
                    // @ts-ignore CSS custom property
                    "--controls": "none",
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
                  preload="none"
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
            ref={imgRef}
            src={frameSrc}
            alt=""
            onLoad={() => setFrameLoaded(true)}
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
        padding: "20px 16px",
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
