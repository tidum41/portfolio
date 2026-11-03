"use client";

import { useEffect, useState, type ReactNode } from "react";

/** The recorder can run the page in slow motion (window.__K, CSS time is slowed by the same factor) and retime the
 *  capture, so every frame of the final video is a real captured frame. Timers and scroll durations scale with it. */
export const K = () => (typeof window === "undefined" ? 1 : ((window as unknown as { __K?: number }).__K ?? 1));

/* Height grows via grid rows (0fr→1fr open, fade then fold on close). Panel size stays fixed; its body scrolls. */
export function Grow({ open, children, className, closeMs = 450 }: { open: boolean; children: ReactNode; className?: string; closeMs?: number }) {
  const [mounted, setMounted] = useState(open);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (open) { setMounted(true); setLeaving(false); return; }
    if (!mounted) return;
    setLeaving(true);
    // The fold ends at 0fr and holds (fill: both); unmount after it, never during its tail, so no pixel pops at the end.
    const t = setTimeout(() => { setMounted(false); setLeaving(false); }, Math.max(closeMs + 80, 1500) * K());
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!mounted) return null;
  return (
    <div
      className={["dlg-grow", leaving ? "dlg-grow--out" : "dlg-grow--in", className].filter(Boolean).join(" ")}
      onAnimationEnd={(e) => { if (leaving && e.target === e.currentTarget) { setMounted(false); setLeaving(false); } }}
    >
      <div className="dlg-grow__inner">{children}</div>
    </div>
  );
}
