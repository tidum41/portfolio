"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";

// SSR-safe useLayoutEffect, matching CaseStudyTOC.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Clamp for --cs-back-optical-dx, in CSS pixels. */
const CLAMP_PX = 4;

/**
 * Shared in-content Back optical alignment (all case-study pages).
 *
 * After `document.fonts.ready`, measures the first-ink of the title's first
 * glyph (Range rect + canvas `measureText().actualBoundingBoxLeft`) and the
 * chevron tip (SVG path bbox mapped into the SVG's box, falling back to the
 * painted polyline's `getBoundingClientRect`). Sets `--cs-back-optical-dx`
 * on the Back so the chevron tip sits on the title ink edge. Clamped to
 * ±4px. No-op if measurement fails. Re-runs on resize and font load.
 *
 * One hook, no per-page values. Used only on `.cs-back-mobile` (the
 * in-content control); the desktop TOC-rail Back is left alone.
 */
export function useCaseStudyOpticalAlign(
  backRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useIsoLayoutEffect(() => {
    if (!enabled) return;
    const back = backRef.current;
    if (!back) return;

    let cancelled = false;
    let raf = 0;

    const align = () => {
      if (cancelled) return;
      const title = back.closest(".cs-layout")?.querySelector(".cs-hero-title");
      const svg = back.querySelector<SVGSVGElement>(".cs-back-arrow");
      const path = svg?.querySelector("polyline, path, polygon");
      if (!title || !svg || !path) return;

      const glyph = firstGlyph(title);
      if (!glyph) return;

      const prev = back.style.getPropertyValue("--cs-back-optical-dx");
      back.style.setProperty("--cs-back-optical-dx", "0px");
      // Force layout so measurements ignore a previously applied nudge.
      void back.offsetWidth;

      const titleInk = measureTitleInk(title, glyph);
      const chevronInk = measureChevronInk(svg, path);
      if (titleInk == null || chevronInk == null || cancelled) {
        if (prev) back.style.setProperty("--cs-back-optical-dx", prev);
        else back.style.removeProperty("--cs-back-optical-dx");
        return;
      }

      const raw = titleInk - chevronInk;
      if (!Number.isFinite(raw)) {
        back.style.removeProperty("--cs-back-optical-dx");
        return;
      }
      const dx = Math.max(-CLAMP_PX, Math.min(CLAMP_PX, raw));
      back.style.setProperty("--cs-back-optical-dx", `${dx}px`);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        align();
      });
    };

    const start = async () => {
      try {
        await document.fonts.ready;
      } catch {
        // Still try once; align() no-ops if it cannot measure.
      }
      if (!cancelled) align();
    };
    void start();

    document.fonts.addEventListener("loadingdone", schedule);
    window.addEventListener("resize", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    const layout = back.closest(".cs-layout");
    if (layout) ro.observe(layout);
    ro.observe(back);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      document.fonts.removeEventListener("loadingdone", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [backRef, enabled]);
}

function firstGlyph(title: Element): { node: Text; index: number; ch: string } | null {
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    const index = text.search(/\S/);
    if (index >= 0) return { node: node as Text, index, ch: text[index] };
  }
  return null;
}

/** Typographic origin of the first glyph plus canvas ink bearing. */
function measureTitleInk(
  title: Element,
  glyph: { node: Text; index: number; ch: string },
): number | null {
  const range = document.createRange();
  range.setStart(glyph.node, glyph.index);
  range.setEnd(glyph.node, glyph.index + 1);
  const origin = range.getBoundingClientRect().left;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const cs = getComputedStyle(title);
  ctx.font = cs.font;
  const spacing = cs.letterSpacing;
  if (spacing && spacing !== "normal" && "letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = spacing;
  }
  const metrics = ctx.measureText(glyph.ch);
  if (!Number.isFinite(metrics.actualBoundingBoxLeft)) return null;
  // actualBoundingBoxLeft is positive when ink extends left of the origin,
  // so inkLeft = origin - actualBoundingBoxLeft (a right-side bearing is
  // negative, which pushes inkLeft to the right of the typographic box).
  return origin - metrics.actualBoundingBoxLeft;
}

/** Chevron tip in CSS pixels: path bbox mapped into the SVG box, else painted rect. */
function measureChevronInk(svg: SVGSVGElement, path: Element): number | null {
  const svgBox = svg.getBoundingClientRect();
  try {
    const bbox = (path as SVGGraphicsElement).getBBox();
    const vb = svg.viewBox.baseVal;
    const userW = vb && vb.width ? vb.width : svgBox.width;
    if (userW > 0 && Number.isFinite(bbox.x)) {
      return svgBox.left + bbox.x * (svgBox.width / userW);
    }
  } catch {
    // getBBox throws if the node is not in the rendering tree.
  }
  const painted = path.getBoundingClientRect();
  if (!painted.width && !painted.height) return null;
  return painted.left;
}
