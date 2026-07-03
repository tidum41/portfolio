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
    </div>
  );
}
