"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Steps through a fixed timeline of states while the figure is on screen and playing.
 * Each step is [state, holdMs]. Reduced motion holds `still` and never advances.
 */
export function useLoop<S>(steps: readonly (readonly [S, number])[], still: S) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting && e.intersectionRatio >= 0.4), {
      threshold: [0, 0.4, 1],
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = visible && playing && !reduced;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % steps.length), steps[index][1]);
    return () => window.clearTimeout(t);
  }, [running, index, steps]);

  const state = reduced ? still : steps[index][0];
  return { ref, state, playing, setPlaying, reduced };
}
