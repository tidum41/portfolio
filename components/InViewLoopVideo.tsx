"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { warmRootMargin } from "@/lib/networkHint";

/**
 * Below-the-fold looping clip. The poster paints immediately; the media file
 * stays unloaded until the frame is near the viewport, then plays muted.
 */
export default function InViewLoopVideo({
  src,
  poster,
  style,
}: {
  src: string;
  poster?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || active) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        obs.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        setActive(true);
      },
      { rootMargin: warmRootMargin() },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const play = el.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  }, [active]);

  return (
    <video
      ref={ref}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      autoPlay={active}
      src={active ? src : undefined}
      style={style}
    />
  );
}
