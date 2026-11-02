"use client";

import { useEffect, useLayoutEffect as _useLayoutEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";
import { setHeroScrim, type ScrimLine } from "@/lib/heroScrim";

// SSR-safe useLayoutEffect, matching the pattern used elsewhere in this codebase.
const useLayoutEffect = typeof window !== "undefined" ? _useLayoutEffect : useEffect;

const TEXT_SELECTORS = [".hero-heading", "[data-hero-sub]"];

// Page position from the offset chain, so entrance translateY animations on
// the text (or its EntranceItem wrapper) never skew the measurement.
function layoutOrigin(el: HTMLElement) {
  let x = 0, y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

// Rendered line boxes of the hero headline + subtitle, merged per line, in
// page CSS px. Line rects come from text ranges (the real ragged extents, not
// the 50%-wide block), offset from the element's own transformed box.
function measureLines(section: HTMLElement): { lines: ScrimLine[]; lineHeight: number } | null {
  const lines: ScrimLine[] = [];
  let lineHeight = 0;
  for (const sel of TEXT_SELECTORS) {
    const el = section.querySelector<HTMLElement>(sel);
    if (!el || !el.offsetParent) continue;
    if (!lineHeight) lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 0;
    const origin = layoutOrigin(el);
    const box = el.getBoundingClientRect();
    const rects: ScrimLine[] = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim() || node.parentElement?.closest("[role='tooltip']")) continue;
      range.selectNodeContents(node);
      for (const q of range.getClientRects()) {
        if (q.width < 1 || q.height < 1) continue;
        rects.push({
          l: origin.x + q.left - box.left,
          t: origin.y + q.top - box.top,
          r: origin.x + q.right - box.left,
          b: origin.y + q.bottom - box.top,
        });
      }
    }
    rects.sort((a, b) => a.t - b.t);
    for (const q of rects) {
      const last = lines[lines.length - 1];
      const mid = (q.t + q.b) / 2;
      if (last && mid > last.t && mid < last.b) {
        last.l = Math.min(last.l, q.l); last.r = Math.max(last.r, q.r);
        last.t = Math.min(last.t, q.t); last.b = Math.max(last.b, q.b);
      } else {
        lines.push({ ...q });
      }
    }
  }
  if (!lines.length) return null;
  return { lines, lineHeight: lineHeight || lines[0].b - lines[0].t };
}

/**
 * Measures the hero text lines and hands them to PS3Silk, which fades the
 * silk behind them in its shader (a Gaussian blur of the line boxes, dithered
 * at output). Nothing is painted here, so there is no large layer to
 * composite and no 8-bit overlay to band over the background.
 */
export default function HeroLegibilityScrim() {
  const dk = useDialKit("Hero Scrim", {
    opacity: [0.74, 0, 1, 0.01],
    // Blur sigma in headline line heights: along the lines / across them.
    spreadX: [2.6, 0.5, 8, 0.1],
    spreadY: [1.15, 0.3, 4, 0.05],
    // Outlines the measured line boxes (tuning aid only).
    debug: false,
  });
  const anchorRef = useRef<HTMLDivElement>(null);
  const dkRef = useRef(dk);
  const [debugLines, setDebugLines] = useState<ScrimLine[] | null>(null);
  const publishRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const section = anchorRef.current?.parentElement;
    if (!section) return;
    let raf = 0;
    const publish = () => {
      raf = 0;
      const m = measureLines(section);
      if (!m) return;
      const d = dkRef.current;
      setHeroScrim({ ...m, opacity: d.opacity, spreadX: d.spreadX, spreadY: d.spreadY });
      if (d.debug) {
        const o = layoutOrigin(section);
        setDebugLines(m.lines.map((q) => ({ l: q.l - o.x, t: q.t - o.y, r: q.r - o.x, b: q.b - o.y })));
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(publish); };
    publishRef.current = publish;
    publish();

    const ro = new ResizeObserver(schedule);
    ro.observe(section);
    for (const sel of TEXT_SELECTORS) {
      const el = section.querySelector(sel);
      if (el) ro.observe(el);
    }
    document.fonts?.ready.then(schedule).catch(() => {});
    document.fonts?.addEventListener?.("loadingdone", schedule);
    window.addEventListener("intro-done", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", schedule);
      window.removeEventListener("intro-done", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    dkRef.current = dk;
    if (!dk.debug) setDebugLines(null);
    publishRef.current();
  }, [dk.opacity, dk.spreadX, dk.spreadY, dk.debug]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={anchorRef} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {debugLines?.map((q, i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: q.l, top: q.t, width: q.r - q.l, height: q.b - q.t,
            border: "1px dashed rgba(255,64,64,0.8)", pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
