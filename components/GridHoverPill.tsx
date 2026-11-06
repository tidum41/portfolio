"use client";


import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { HOVER_PILL_STYLE } from "./DialogueCardTap";


export interface GridHoverPillProps {
  gridSelector?: string;
  labels?: Record<string, string>;
}


const OFFSET_X = 14;
const OFFSET_Y = 18;
const VIEWPORT_PAD = 8;
/* Fixed 112x28 box: 112 fits the longest hover label ("Coming Soon") at
 * the shared 13px/500 pill type plus 10px side padding; 28 is the 16px
 * line height plus 6px top/bottom padding. The size never changes, so
 * label swaps need no measurement and clamping is pure arithmetic. */
const PILL_W = 112;
const PILL_H = 28;
const EASE = 0.35;
const SETTLE_PX = 0.5;


const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;


/** Cursor-following grid pill, one portal element for the whole grid.
 *  Always promoted, moved only with translate3d, fixed size with strict
 *  containment, no shadow, no backdrop filter. pointermove only resolves
 *  the card (cached while the pointer stays inside it), stores target
 *  coordinates, and starts the loop; one rAF loop eases toward the target
 *  and stops itself once settled, and hide stops it immediately. The
 *  label is written via textContent only when the card changes. Grid
 *  cover images are decoded once at idle time, never on hover. Hidden on
 *  grid pointerleave, window blur, scroll, and visibility change.
 *  Keyboard focus-visible anchors it at the card's bottom-left. */
export default function GridHoverPill({
  gridSelector = ".portfolio-grid",
  labels = {},
}: GridHoverPillProps) {
  const pillRef = useRef<HTMLDivElement | null>(null);
  const labelsRef = useRef(labels);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );


  useEffect(() => {
    labelsRef.current = labels;
  });


  useEffect(() => {
    if (!mounted) return;


    const pill = pillRef.current;
    const grid = document.querySelector<HTMLElement>(gridSelector);
    if (!pill || !grid) return;


    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");


    let enabled = hoverMq.matches;
    let visible = false;
    let currentId: string | null = null;
    let lastCard: HTMLElement | null = null;
    let rafId = 0;
    let targetLeft = 0;
    let targetTop = 0;
    let currentLeft = 0;
    let currentTop = 0;
    let hasPosition = false;


    const applyTransition = () => {
      pill.style.transition = motionMq.matches
        ? "none"
        : "opacity 120ms ease-out";
    };
    applyTransition();


    const clamp = (v: number, min: number, max: number) =>
      Math.min(Math.max(v, min), Math.max(min, max));


    const writeTransform = () => {
      pill.style.transform = `translate3d(${currentLeft}px, ${currentTop}px, 0)`;
    };


    const stopLoop = () => {
      if (!rafId) return;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    };


    const tick = () => {
      rafId = 0;
      if (!visible) return;
      const dx = targetLeft - currentLeft;
      const dy = targetTop - currentTop;
      if (
        motionMq.matches ||
        (Math.abs(dx) <= SETTLE_PX && Math.abs(dy) <= SETTLE_PX)
      ) {
        currentLeft = targetLeft;
        currentTop = targetTop;
        writeTransform();
        return;
      }
      currentLeft += dx * EASE;
      currentTop += dy * EASE;
      writeTransform();
      rafId = window.requestAnimationFrame(tick);
    };


    const startLoop = () => {
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };


    const show = () => {
      if (visible) return;
      visible = true;
      pill.style.opacity = "1";
    };


    const hide = () => {
      stopLoop();
      hasPosition = false;
      lastCard = null;
      if (!visible) return;
      visible = false;
      pill.style.opacity = "0";
    };


    const setLabelForId = (id: string) => {
      if (id === currentId) return true;
      const label = labelsRef.current[id];
      if (label == null) return false;
      currentId = id;
      pill.textContent = label;
      return true;
    };


    const cardFromTarget = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLElement>(".portfolio-grid-card")
        : null;


    const idForCard = (card: HTMLElement | null) => {
      const id = card?.getAttribute("data-grid-card");
      return id && id in labelsRef.current ? id : null;
    };


    const targetForPointer = (x: number, y: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = x + OFFSET_X;
      let top = y + OFFSET_Y;
      if (left + PILL_W > vw - VIEWPORT_PAD) left = x - PILL_W - OFFSET_X;
      if (top + PILL_H > vh - VIEWPORT_PAD) top = y - PILL_H - OFFSET_Y;
      return [
        clamp(left, VIEWPORT_PAD, vw - PILL_W - VIEWPORT_PAD),
        clamp(top, VIEWPORT_PAD, vh - PILL_H - VIEWPORT_PAD),
      ] as const;
    };


    const onPointerMove = (event: PointerEvent) => {
      if (!enabled || event.pointerType !== "mouse") return;
      let card: HTMLElement | null;
      if (
        lastCard &&
        event.target instanceof Node &&
        lastCard.contains(event.target)
      ) {
        card = lastCard;
      } else {
        card = cardFromTarget(event.target);
        lastCard = card;
      }
      const id = idForCard(card);
      if (!id || !setLabelForId(id)) {
        hide();
        return;
      }
      const [left, top] = targetForPointer(event.clientX, event.clientY);
      targetLeft = left;
      targetTop = top;
      if (!visible || !hasPosition) {
        currentLeft = left;
        currentTop = top;
        hasPosition = true;
        writeTransform();
        show();
        return;
      }
      show();
      startLoop();
    };


    const positionAtCard = (card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      currentLeft = clamp(
        rect.left + 12,
        VIEWPORT_PAD,
        window.innerWidth - PILL_W - VIEWPORT_PAD,
      );
      currentTop = clamp(
        rect.bottom - PILL_H - 12,
        VIEWPORT_PAD,
        window.innerHeight - PILL_H - VIEWPORT_PAD,
      );
      targetLeft = currentLeft;
      targetTop = currentTop;
      hasPosition = true;
      writeTransform();
    };


    const onFocusIn = (event: FocusEvent) => {
      if (!enabled || !(event.target instanceof Element)) return;
      const card = cardFromTarget(event.target);
      const id = idForCard(card);
      let focusVisible = true;
      try {
        focusVisible = event.target.matches(":focus-visible");
      } catch {
        focusVisible = true;
      }
      if (!card || !id || !focusVisible || !setLabelForId(id)) {
        hide();
        return;
      }
      stopLoop();
      lastCard = card;
      positionAtCard(card);
      show();
    };


    const onFocusOut = (event: FocusEvent) => {
      const card = cardFromTarget(event.target);
      const next = event.relatedTarget;
      if (card && next instanceof Node && card.contains(next)) return;
      hide();
    };


    const onPointerLeave = () => hide();
    const onBlur = () => hide();
    const onScroll = () => hide();
    const onVisibilityChange = () => {
      if (document.hidden) hide();
    };
    const onHoverMqChange = (event: MediaQueryListEvent) => {
      enabled = event.matches;
      if (!enabled) hide();
    };
    const onMotionMqChange = () => applyTransition();


    grid.addEventListener("pointermove", onPointerMove);
    grid.addEventListener("pointerleave", onPointerLeave);
    grid.addEventListener("focusin", onFocusIn);
    grid.addEventListener("focusout", onFocusOut);
    window.addEventListener("blur", onBlur);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    hoverMq.addEventListener("change", onHoverMqChange);
    motionMq.addEventListener("change", onMotionMqChange);


    /* Pre-decode grid covers once at idle time, so a first hover never
     * pays image decode on its frame. */
    const decodeCovers = () => {
      grid.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        if (typeof img.decode === "function") {
          void img.decode().catch(() => undefined);
        }
      });
    };
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId = 0;
    let idleIsRic = false;
    if (typeof idleWindow.requestIdleCallback === "function") {
      idleIsRic = true;
      idleId = idleWindow.requestIdleCallback(decodeCovers, { timeout: 2000 });
    } else {
      idleId = window.setTimeout(decodeCovers, 1000);
    }


    return () => {
      stopLoop();
      if (idleIsRic) {
        if (typeof idleWindow.cancelIdleCallback === "function") {
          idleWindow.cancelIdleCallback(idleId);
        }
      } else {
        window.clearTimeout(idleId);
      }
      grid.removeEventListener("pointermove", onPointerMove);
      grid.removeEventListener("pointerleave", onPointerLeave);
      grid.removeEventListener("focusin", onFocusIn);
      grid.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      hoverMq.removeEventListener("change", onHoverMqChange);
      motionMq.removeEventListener("change", onMotionMqChange);
    };
  }, [mounted, gridSelector]);


  if (!mounted) return null;


  return createPortal(
    <div
      ref={pillRef}
      data-grid-hover-pill=""
      aria-hidden="true"
      style={{
        ...HOVER_PILL_STYLE,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 60,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
        width: PILL_W,
        height: PILL_H,
        contain: "strict",
        boxShadow: "none",
        backdropFilter: "none",
        pointerEvents: "none",
        opacity: 0,
        willChange: "transform",
      }}
    />,
    document.body,
  );
}
