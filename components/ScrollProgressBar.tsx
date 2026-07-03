"use client";

import { useEffect, useRef } from "react";

// Fixed 2px bar at top. Color #2E2E2E. z-index 10000.
// RAF-throttled. Source: ScrollProgressBar.tsx (Framer).
export default function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      const pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
      if (fillRef.current) {
        fillRef.current.style.width = `${pct}%`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      <div
        ref={fillRef}
        style={{
          height: "100%",
          width: "0%",
          background: "var(--color-text-primary)",
          transition: "width 80ms linear",
        }}
      />
    </div>
  );
}
