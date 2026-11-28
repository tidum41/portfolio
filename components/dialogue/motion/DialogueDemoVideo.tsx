"use client";

import { useEffect, useRef, useState } from "react";
import PlayPauseButton from "@/components/PlayPauseButton";
import { recordingAspect, STAGE_GUTTER, STAGE_PANEL_W, type MotionDemo } from "@/components/dialogue/motion/stages";
import DialogueMotionStage, { type StageStill } from "@/components/dialogue/live/DialogueMotionStage";
import MOTION_VERSIONS from "@/lib/dialogue/motionVersions.json";

/**
 * Round P10: a recorded product demo of the live recreation (scripts/record-dialogue-live.mjs).
 * Muted and auto-looping, with the BruinLease pause and play button (shared PlayPauseButton). The button
 * anchors to the figure's background well (.dialogue-rachel-frame), 8px from its top right, not the video.
 * It plays only in view and keeps a pause the reader set. Under prefers-reduced-motion it shows
 * the poster (the held, open state) with no button. Each demo has a light and a dark recording whose well
 * matches the figure background in that theme; the html data-theme attribute picks one.
 */
/** P16 round 4: each take's URL carries its content hash, so a re-recorded take is never served from a stale cache. */
const VERSIONS = MOTION_VERSIONS as Record<string, string>;
const versioned = (path: string) => { const v = VERSIONS[path.split("/").pop() ?? ""]; return v ? `${path}?v=${v}` : path; };
const themed = (path: string, dark: boolean) => versioned(dark ? path.replace(/\.(mp4|jpg)$/, "-dark.$1") : path);
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

/** Consult r1: a frozen final frame of the live stage, scaled to the well. Real components, no recording, nothing mid-animation. */
function LiveStill({ demo, still, label }: { demo: MotionDemo; still: StageStill; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ scale: number; h: number; x: number } | null>(null);
  const w = STAGE_PANEL_W + 2 * STAGE_GUTTER;
  useEffect(() => {
    const el = wrap.current, inn = inner.current;
    if (!el || !inn) return;
    const measure = () => { const scale = Math.min(1, el.clientWidth / w); setBox({ scale, h: inn.offsetHeight * scale, x: (el.clientWidth - w * scale) / 2 }); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el); ro.observe(inn);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div className="dlg-demo dlg-demo--live" style={{ margin: 0 }}>
      <div ref={wrap} className="dlg-live-still" role="img" aria-label={label} data-measured={box ? "" : undefined} style={box ? { height: box.h } : undefined}>
        <div ref={inner} className="dlg-live-still__inner" style={{ width: w, padding: STAGE_GUTTER, boxSizing: "border-box", transform: `translateX(${box?.x ?? 0}px) scale(${box?.scale ?? 1})` }} aria-hidden>
          <div className="dialogue-product-root dp-chat-panel-typography dlg-motion-frame__panel dlg-live-still__panel" style={{ width: STAGE_PANEL_W }}>
            <DialogueMotionStage demo={demo} still={still} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** P16: a held still on the same stage as the videos (the picker), themed like them, with no play control.
 *  Consult r1: pass `live` to hold a frozen frame of the live stage instead of a recorded JPG (takes are real live UI). */
export function DialogueDemoStill({ src, label, live }: { src: string; label: string; live?: { demo: MotionDemo; still: StageStill } }) {
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
  if (live) return <LiveStill demo={live.demo} still={live.still} label={label} />;
  return (
    <div className="dlg-demo">
      {dark === null ? <div className="dlg-demo__video" style={{ aspectRatio: ratio }} aria-hidden /> : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="dlg-demo__video" style={{ aspectRatio: ratio }} src={themed(ssrc, dark)} alt={label} decoding="async" />
      )}
    </div>
  );
}
