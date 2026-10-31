"use client";

import { useEffect, useRef, useState } from "react";
import PlayPauseButton from "@/components/PlayPauseButton";
import { recordingAspect } from "@/components/dialogue/motion/stages";

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
/** P16 round 3: phones get takes cropped to the card (name-m.mp4), so figure text stays at 12px or more. */
const PHONE = "(max-width: 600px)";
const sized = (path: string, phone: boolean) => (phone ? path.replace(/\.(mp4|jpg)$/, "-m.$1") : path);
function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}
export default function DialogueDemoVideo({ src, poster, label, ratio }: { src: string; poster: string; label: string; ratio?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [reduce, setReduce] = useState(false);
  const userPaused = useRef(false);
  const [dark, setDark] = useState(false);
  // P15: render the video only once the theme is known, so the first poster painted is the right theme's.
  const [themeKnown, setThemeKnown] = useState(false);
  const phone = usePhone();
  const vsrc = sized(src, phone), vposter = sized(poster, phone);
  useEffect(() => {
    setDark(isDarkNow());
    setThemeKnown(true);
    const mo = new MutationObserver(() => setDark(isDarkNow()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    const v = ref.current;
    if (v && !reduce && !userPaused.current) v.play().catch(() => {});
  }, [dark, reduce, themeKnown, phone]);
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
  }, [themeKnown]);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (isPlaying) { v.pause(); userPaused.current = true; setIsPlaying(false); }
    else { userPaused.current = false; v.play(); setIsPlaying(true); }
  };
  return (
    <div className="dlg-demo">
      {themeKnown ? <video ref={ref} className="dlg-demo__video" style={{ aspectRatio: ratio ?? recordingAspect(vsrc) ?? "1 / 1" }} src={reduce ? undefined : themed(vsrc, dark)} poster={themed(vposter, dark)} muted loop playsInline preload="metadata" aria-label={label} /> : <div className="dlg-demo__video" style={{ aspectRatio: ratio ?? recordingAspect(src) ?? "1 / 1" }} aria-hidden />}
      {reduce ? null : <PlayPauseButton isPlaying={isPlaying} onToggle={toggle} />}
    </div>
  );
}

/** P16: a held still on the same stage as the videos (the picker), themed like them, with no play control. */
export function DialogueDemoStill({ src, label }: { src: string; label: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    setDark(isDarkNow());
    const mo = new MutationObserver(() => setDark(isDarkNow()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  const phone = usePhone();
  const ssrc = sized(src, phone);
  const ratio = recordingAspect(ssrc) ?? "1 / 1";
  return (
    <div className="dlg-demo">
      {dark === null ? <div className="dlg-demo__video" style={{ aspectRatio: ratio }} aria-hidden /> : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="dlg-demo__video" style={{ aspectRatio: ratio }} src={themed(ssrc, dark)} alt={label} decoding="async" />
      )}
    </div>
  );
}
