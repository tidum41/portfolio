"use client";

import { useEffect, useRef, useState } from "react";
import PlayPauseButton from "@/components/PlayPauseButton";

/**
 * Round P10: a recorded product demo of the live recreation (scripts/record-dialogue-live.mjs).
 * Muted and auto-looping, with the BruinLease pause and play button (shared PlayPauseButton). The button
 * anchors to the figure's background well (.dialogue-rachel-frame), 8px from its top right, not the video.
 * It plays only in view and keeps a pause the reader set. Under prefers-reduced-motion it shows
 * the poster (the held, open state) with no button. Each demo has a light and a dark recording whose well
 * matches the figure background in that theme; the html data-theme attribute picks one.
 */
const themed = (path: string, dark: boolean) => (dark ? path.replace(/\.(mp4|jpg)$/, "-dark.$1") : path);
const isDarkNow = () => document.documentElement.getAttribute("data-theme") !== "light";
export default function DialogueDemoVideo({ src, poster, label, ratio = "1 / 1" }: { src: string; poster: string; label: string; ratio?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [reduce, setReduce] = useState(false);
  const userPaused = useRef(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(isDarkNow());
    const mo = new MutationObserver(() => setDark(isDarkNow()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    const v = ref.current;
    if (v && !reduce && !userPaused.current) v.play().catch(() => {});
  }, [dark, reduce]);
  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    const v = ref.current;
    if (!v || r) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) v.play().then(() => setIsPlaying(true)).catch(() => {});
      else v.pause();
    }, { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (isPlaying) { v.pause(); userPaused.current = true; setIsPlaying(false); }
    else { userPaused.current = false; v.play(); setIsPlaying(true); }
  };
  return (
    <div className="dlg-demo">
      <video ref={ref} className="dlg-demo__video" style={{ aspectRatio: ratio }} src={reduce ? undefined : themed(src, dark)} poster={themed(poster, dark)} muted loop playsInline preload="metadata" aria-label={label} />
      {reduce ? null : <PlayPauseButton isPlaying={isPlaying} onToggle={toggle} />}
    </div>
  );
}
