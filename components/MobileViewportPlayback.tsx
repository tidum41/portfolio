"use client";

import { useEffect } from "react";
import { collectCardVideos } from "@/lib/cardFocusVideo";

const MOBILE_MQ = "(max-width: 600px)";
const PLAY_AT = 0.5;
const PAUSE_BELOW = 0.2;
const PAUSE_DEBOUNCE_MS = 300;
const RESCAN_MS = 1000;

type Entry = { ratio: number; timer: number; pausedByUs: boolean };

/**
 * At 600px and below, muted loops follow the viewport: play at 50% visible or more,
 * pause only below 20% after a 300ms debounce, and resume from currentTime. Several
 * videos may play at once. Only videos this component paused are resumed, so a
 * viewer's own pause button is respected. Desktop is untouched.
 */
export default function MobileViewportPlayback() {
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const entries = new Map<HTMLVideoElement, Entry>();
    let io: IntersectionObserver | null = null;
    let rescan = 0;
    let mo: MutationObserver | null = null;

    const pause = (v: HTMLVideoElement, e: Entry) => {
      v.dataset.vpOut = "1";
      if (!v.paused) {
        e.pausedByUs = true;
        try {
          v.pause();
        } catch {
          /* ignore */
        }
      }
    };

    const play = (v: HTMLVideoElement, e: Entry) => {
      delete v.dataset.vpOut;
      if (reducedMq.matches || !v.paused || !e.pausedByUs) return;
      v.muted = true;
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.then(
          () => {
            e.pausedByUs = false;
          },
          () => {},
        );
      }
    };

    const onPlayEvent = (ev: Event) => {
      const v = ev.currentTarget as HTMLVideoElement;
      const e = entries.get(v);
      if (!e) return;
      if (reducedMq.matches || (v.dataset.vpOut === "1" && e.ratio < PAUSE_BELOW)) pause(v, e);
    };

    const onIntersect = (list: IntersectionObserverEntry[]) => {
      for (const it of list) {
        const v = it.target as HTMLVideoElement;
        const e = entries.get(v);
        if (!e) continue;
        e.ratio = it.intersectionRatio;
        if (reducedMq.matches) {
          pause(v, e);
        } else if (e.ratio >= PLAY_AT) {
          window.clearTimeout(e.timer);
          e.timer = 0;
          play(v, e);
        } else if (e.ratio < PAUSE_BELOW && !e.timer) {
          e.timer = window.setTimeout(() => {
            e.timer = 0;
            if (e.ratio < PAUSE_BELOW) pause(v, e);
          }, PAUSE_DEBOUNCE_MS);
        } else if (e.ratio >= PAUSE_BELOW && e.timer) {
          window.clearTimeout(e.timer);
          e.timer = 0;
        }
      }
    };

    const isLoop = (v: HTMLVideoElement) => v.muted && !v.controls;

    const scan = () => {
      if (!io) return;
      const live = new Set(collectCardVideos(document.body).filter(isLoop));
      for (const v of live) {
        if (entries.has(v)) continue;
        entries.set(v, { ratio: 1, timer: 0, pausedByUs: false });
        v.addEventListener("play", onPlayEvent);
        v.addEventListener("playing", onPlayEvent);
        io.observe(v);
      }
      for (const [v, e] of entries) {
        if (live.has(v) && v.isConnected) continue;
        window.clearTimeout(e.timer);
        v.removeEventListener("play", onPlayEvent);
        v.removeEventListener("playing", onPlayEvent);
        io.unobserve(v);
        entries.delete(v);
      }
    };

    const start = () => {
      io = new IntersectionObserver(onIntersect, { threshold: [0, PAUSE_BELOW, PLAY_AT] });
      scan();
      rescan = window.setInterval(scan, RESCAN_MS);
      mo = new MutationObserver(() => scan());
      mo.observe(document.body, { childList: true, subtree: true });
    };

    const stop = () => {
      window.clearInterval(rescan);
      mo?.disconnect();
      mo = null;
      io?.disconnect();
      io = null;
      for (const [v, e] of entries) {
        window.clearTimeout(e.timer);
        v.removeEventListener("play", onPlayEvent);
        v.removeEventListener("playing", onPlayEvent);
        delete v.dataset.vpOut;
        if (v.paused && e.pausedByUs && !reducedMq.matches) {
          void v.play()?.catch(() => {});
        }
      }
      entries.clear();
    };

    const sync = () => {
      stop();
      if (mq.matches) start();
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
