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


const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;


/** Cursor-following grid pill, mounted once, fine pointers only. Perf
 *  contract, tightened against the branch trace (FunctionCall 3843 vs
 *  main 3184):
 *  - One pointermove listener (no duplicate pointerover pass). The move
 *    handler only resolves the card, stores coordinates, and schedules a
 *    single rAF; the rAF writes transform (translate3d) and nothing else.
 *  - No React state on the move path, and none at all after mount: the
 *    portal mount is read with useSyncExternalStore, labels live in a ref
 *    so a new labels object never rebinds listeners.
 *  - The label is written via ref.textContent only when the card changes,
 *    and the pill is measured (offsetWidth/Height) only at that moment;
 *    the cached size feeds viewport clamping, so no layout reads run
 *    per frame.
 *  - Opacity is written only on show/hide; will-change:transform stays on.
 *  - Chrome is the shared PILL_STYLE: opaque lilac token fill, 8px
 *    radius, one 2px shadow, no border, no filter, no backdrop-filter.
 *  Hidden on grid pointerleave, window blur, scroll, and visibility
 *  change. Keyboard focus-visible anchors it at the card's bottom-left. */
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
    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;
    let hasPending = false;
    let pillW = 0;
    let pillH = 0;


    const applyTransition = () => {
      pill.style.transition = motionMq.matches
        ? "none"
        : "opacity 120ms ease-out";
    };
    applyTransition();


    const clamp = (v: number, min: number, max: number) =>
      Math.min(Math.max(v, min), Math.max(min, max));


    const show = () => {
      if (visible) return;
      visible = true;
      pill.style.opacity = "1";
    };


    const hide = () => {
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
      pillW = pill.offsetWidth;
      pillH = pill.offsetHeight;
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


    const flush = () => {
      rafId = 0;
      if (!hasPending) return;
      hasPending = false;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = pendingX + OFFSET_X;
      let top = pendingY + OFFSET_Y;
      if (left + pillW > vw - VIEWPORT_PAD) left = pendingX - pillW - OFFSET_X;
      if (top + pillH > vh - VIEWPORT_PAD) top = pendingY - pillH - OFFSET_Y;
      left = clamp(left, VIEWPORT_PAD, vw - pillW - VIEWPORT_PAD);
      top = clamp(top, VIEWPORT_PAD, vh - pillH - VIEWPORT_PAD);
      pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    };


    const schedule = (x: number, y: number) => {
      pendingX = x;
      pendingY = y;
      hasPending = true;
      if (!rafId) rafId = window.requestAnimationFrame(flush);
    };


    const onPointerMove = (event: PointerEvent) => {
      if (!enabled || event.pointerType !== "mouse") return;
      const id = idForCard(cardFromTarget(event.target));
      if (!id || !setLabelForId(id)) {
        hide();
        return;
      }
      schedule(event.clientX, event.clientY);
      show();
    };


    const positionAtCard = (card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const left = clamp(
        rect.left + 12,
        VIEWPORT_PAD,
        window.innerWidth - pillW - VIEWPORT_PAD,
      );
      const top = clamp(
        rect.bottom - pillH - 12,
        VIEWPORT_PAD,
        window.innerHeight - pillH - VIEWPORT_PAD,
      );
      pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
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
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        hasPending = false;
      }
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


    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
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
      aria-hidden="true"
      style={{
        ...HOVER_PILL_STYLE,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 60,
        display: "inline-flex",
        alignItems: "center",
        opacity: 0,
        willChange: "transform",
      }}
    />,
    document.body,
  );
}
