"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Round P10: a recorded product demo of the live recreation (scripts/record-dialogue-live.mjs),
 * shown like Rachel Chen's clips: muted, looping, with a small pause and replay pair.
 * Under prefers-reduced-motion it shows the poster (the final state) and does not autoplay.
 */
export default function DialogueDemoVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    const v = ref.current;
    if (!v || r) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !paused) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, [paused]);
  return (
    <div className="dlg-demo">
      <video ref={ref} className="dlg-demo__video" src={reduce ? undefined : src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} />
      {reduce ? null : (
        <div className="dlg-demo-ctl">
          <button type="button" onClick={() => { const v = ref.current; if (!v) return; if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); } }}>
            {paused ? "Play" : "Pause"}
          </button>
          <button type="button" onClick={() => { const v = ref.current; if (!v) return; v.currentTime = 0; v.play(); setPaused(false); }}>
            Replay
          </button>
        </div>
      )}
    </div>
  );
}
