"use client";

import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { useDialKit } from "dialkit";

// Source: MuxVideoEmbed.tsx (Framer).
// Blur-up placeholder → 500ms opacity crossfade on canplay.

interface Props {
  playbackId: string;
  thumbnailTime?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export default function MuxVideoEmbed({
  playbackId,
  thumbnailTime = 0,
  delay = 0,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [shouldLoad, setShouldLoad]   = useState(false);
  const [playing, setPlaying]         = useState(true);
  const [hovered, setHovered]         = useState(false);

  const dk = useDialKit("MuxVideoEmbed", {
    blurAmount:      [24,  0,  80],
    blurScale:       [1.08, 1, 1.3],
    fadeDuration:    [500, 50, 2000],
    thumbnailWidth:  [16,  8,  64],
  });

  const blurUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${thumbnailTime}&width=${dk.thumbnailWidth}`;

  // Lazy load via IntersectionObserver (400px margin)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timer: ReturnType<typeof setTimeout>;
    const reveal = () => setShouldLoad(true);
    const fallback = setTimeout(reveal, 1500);
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(fallback);
          if (delay > 0) { timer = setTimeout(reveal, delay); } else reveal();
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px 400px 0px" },
    );
    obs.observe(container);
    return () => { obs.disconnect(); clearTimeout(timer); clearTimeout(fallback); };
  }, [delay]);

  function togglePlay() {
    const video = containerRef.current?.querySelector("video");
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().catch(() => {});
      setPlaying(true);
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%", height: "100%",
        overflow: "hidden", position: "relative",
        backgroundColor: "#EBEBEB",
        isolation: "isolate",
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Blur placeholder crossfades out when player is ready */}
      <img
        src={blurUrl}
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          transform: `scale(${dk.blurScale})`, filter: `blur(${dk.blurAmount}px)`,
          opacity: playerReady ? 0 : 1,
          transition: `opacity ${dk.fadeDuration}ms ease`,
          pointerEvents: "none", zIndex: 1,
        }}
      />

      {shouldLoad && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          opacity: playerReady ? 1 : 0,
          transition: "opacity 500ms ease",
        }}>
          <MuxPlayer
            playbackId={playbackId}
            thumbnailTime={thumbnailTime}
            streamType="on-demand"
            autoPlay="muted"
            loop
            muted
            className="mux-cover"
            onCanPlay={() => setPlayerReady(true)}
          />
        </div>
      )}

      {/* Custom play/pause overlay button */}
      {playerReady && (
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          style={{
            position: "absolute",
            bottom: 14,
            right: 14,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: hovered ? "1.5px solid var(--color-text-primary)" : "1.5px solid transparent",
            background: "var(--color-bg)",
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "border-color 0.2s ease, color 0.2s ease, background 0.2s ease",
            opacity: 0.9,
          }}
        >
          {playing ? (
            // Pause icon
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
              <rect x="7.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
            </svg>
          ) : (
            // Play icon (slightly offset right for optical center)
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true" style={{ marginLeft: 2 }}>
              <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
