"use client";

import { useEffect, useRef, useState } from "react";

// Source: CDPlayer.tsx (Framer).
// 1296×1080 iframe (cdplayer-peach.vercel.app).
// Lazy-loaded. Desktop: pointer-forward overlay. Touch: native pointer events.
const DESIGN_W = 1296;
const DESIGN_H = 1080;
const IFRAME_SRC = "https://cdplayer-peach.vercel.app/";

export default function CDPlayer({ style }: { style?: React.CSSProperties }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const iframeRef     = useRef<HTMLIFrameElement>(null);
  const [cw, setCw]          = useState(DESIGN_W);
  const [isTouch, setIsTouch]   = useState(false);
  const [ready, setReady]       = useState(false);

  useEffect(() => { setIsTouch(window.matchMedia("(hover: none)").matches); }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Lazy load
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

  const s = cw / DESIGN_W;

  const forward = (e: React.PointerEvent, type: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !iframeRef.current?.contentWindow) return;
    const x = (e.clientX - rect.left - (rect.width  - DESIGN_W * s) / 2) / s;
    const y = (e.clientY - rect.top  - (rect.height - DESIGN_H * s) / 2) / s;
    iframeRef.current.contentWindow.postMessage({ type, x, y }, "*");
  };

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        width: "100%",
        aspectRatio: `${DESIGN_W} / ${DESIGN_H}`,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: DESIGN_W, height: DESIGN_H,
          transform: `scale(${s})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}
      >
        <iframe
          ref={iframeRef}
          src={ready ? IFRAME_SRC : undefined}
          width={DESIGN_W}
          height={DESIGN_H}
          style={{ border: "none", display: "block", pointerEvents: isTouch ? "auto" : "none" }}
          allow="autoplay"
          title="CD Player"
        />
      </div>

      {!isTouch && (
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
