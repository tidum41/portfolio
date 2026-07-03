"use client";

import { useEffect, useRef, useState } from "react";

// Source: MusicPlayerEmbed.tsx pattern applied to the habit tracker.
// Netlify embed: https://sprightly-stroopwafel-8f1061.netlify.app/
const EMBED_URL = "https://sprightly-stroopwafel-8f1061.netlify.app/";

export default function HabitTrackerEmbed({ style }: { style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => { setIsTouch(window.matchMedia("(hover: none)").matches); }, []);

  // Lazy load (400px rootMargin)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fallback = setTimeout(() => setReady(true), 1500);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { clearTimeout(fallback); setReady(true); obs.disconnect(); } },
      { rootMargin: "0px 0px 400px 0px" },
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  const forward = (e: React.PointerEvent, type: string) => {
    if (!iframeRef.current?.contentWindow) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    iframeRef.current.contentWindow.postMessage(
      { type, x: e.clientX - rect.left, y: e.clientY - rect.top }, "*",
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 550,
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-card)",
        background: "var(--color-placeholder)",
        ...style,
      }}
    >
      {ready && (
        <iframe
          ref={iframeRef}
          src={EMBED_URL}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            border: "none",
            pointerEvents: isTouch ? "auto" : "none",
          }}
          title="Dumb Habit Tracker"
          allow="autoplay"
        />
      )}
      {!isTouch && ready && (
        <div
          onPointerDown={(e)  => forward(e, "framer-pointerdown")}
          onPointerMove={(e)  => forward(e, "framer-pointermove")}
          onPointerUp={(e)    => forward(e, "framer-pointerup")}
          style={{ position: "absolute", inset: 0 }}
        />
      )}
    </div>
  );
}
