"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export interface GridHoverPillProps {
  gridSelector?: string;
  labels?: Record<string, string>;
}

const noopSubscribe = () => () => {};

const OFFSET_X = 14;
const OFFSET_Y = 18;
const VIEWPORT_PAD = 8;

export default function GridHoverPill({
  gridSelector = ".portfolio-grid",
  labels = {},
}: GridHoverPillProps) {
  const pillRef = useRef<HTMLDivElement | null>(null);
  // true on the client, false during SSR — no setState-in-effect.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (!mounted) return;

    const pill = pillRef.current;
    const grid = document.querySelector<HTMLElement>(gridSelector);
    if (!pill || !grid) return;

    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let enabled = hoverMq.matches;
    let currentId: string | null = null;
    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;
    let hasPendingPointer = false;

    const applyTransition = () => {
      pill.style.transition = motionMq.matches
        ? "none"
        : "opacity 120ms ease-out";
    };
    applyTransition();

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), Math.max(min, max));

    const show = () => {
      pill.style.opacity = "1";
    };

    const hide = () => {
      pill.style.opacity = "0";
    };

    const setLabelForId = (id: string) => {
      if (id === currentId) return true;
      const label = labels[id];
      if (label == null) return false;
      currentId = id;
      pill.textContent = label;
      return true;
    };

    const cardFromTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>(".portfolio-grid-card");
    };

    const idForCard = (card: HTMLElement | null) => {
      if (!card) return null;
      const id = card.getAttribute("data-grid-card");
      if (!id || !(id in labels)) return null;
      return id;
    };

    const positionAtPointer = () => {
      rafId = 0;
      if (!hasPendingPointer) return;
      hasPendingPointer = false;

      const width = pill.offsetWidth;
      const height = pill.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = pendingX + OFFSET_X;
      let top = pendingY + OFFSET_Y;

      if (left + width > vw - VIEWPORT_PAD) {
        left = pendingX - width - OFFSET_X;
      }
      if (top + height > vh - VIEWPORT_PAD) {
        top = pendingY - height - OFFSET_Y;
      }

      left = clamp(left, VIEWPORT_PAD, vw - width - VIEWPORT_PAD);
      top = clamp(top, VIEWPORT_PAD, vh - height - VIEWPORT_PAD);

      pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    };

    const schedulePointerPosition = (x: number, y: number) => {
      pendingX = x;
      pendingY = y;
      hasPendingPointer = true;
      if (!rafId) {
        rafId = window.requestAnimationFrame(positionAtPointer);
      }
    };

    const positionAtCard = (card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const width = pill.offsetWidth;
      const height = pill.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const left = clamp(
        rect.left + 12,
        VIEWPORT_PAD,
        vw - width - VIEWPORT_PAD,
      );
      const top = clamp(
        rect.bottom - height - 12,
        VIEWPORT_PAD,
        vh - height - VIEWPORT_PAD,
      );

      pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    };

    const handlePointer = (event: PointerEvent) => {
      if (!enabled || event.pointerType !== "mouse") return;

      const card = cardFromTarget(event.target);
      const id = idForCard(card);
      if (!id) {
        hide();
        return;
      }
      if (!setLabelForId(id)) {
        hide();
        return;
      }
      schedulePointerPosition(event.clientX, event.clientY);
      show();
    };

    const onPointerOver = (event: PointerEvent) => handlePointer(event);
    const onPointerMove = (event: PointerEvent) => handlePointer(event);

    const onPointerLeave = () => {
      hide();
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!enabled) return;
      const card = cardFromTarget(event.target);
      const id = idForCard(card);
      if (!id || !(event.target instanceof Element)) {
        hide();
        return;
      }

      let focusVisible = false;
      try {
        focusVisible = event.target.matches(":focus-visible");
      } catch {
        focusVisible = true;
      }
      if (!focusVisible) {
        hide();
        return;
      }

      if (!setLabelForId(id)) {
        hide();
        return;
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        hasPendingPointer = false;
      }
      if (card) positionAtCard(card);
      show();
    };

    const onFocusOut = (event: FocusEvent) => {
      const card = cardFromTarget(event.target);
      const next = event.relatedTarget;
      if (card && next instanceof Node && card.contains(next)) return;
      hide();
    };

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

    grid.addEventListener("pointerover", onPointerOver);
    grid.addEventListener("pointermove", onPointerMove);
    grid.addEventListener("pointerleave", onPointerLeave);
    grid.addEventListener("focusin", onFocusIn);
    grid.addEventListener("focusout", onFocusOut);

    window.addEventListener("blur", onBlur);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (typeof hoverMq.addEventListener === "function") {
      hoverMq.addEventListener("change", onHoverMqChange);
    } else {
      hoverMq.addListener(onHoverMqChange);
    }
    if (typeof motionMq.addEventListener === "function") {
      motionMq.addEventListener("change", onMotionMqChange);
    } else {
      motionMq.addListener(onMotionMqChange);
    }

    return () => {
      hide();
      if (rafId) window.cancelAnimationFrame(rafId);

      grid.removeEventListener("pointerover", onPointerOver);
      grid.removeEventListener("pointermove", onPointerMove);
      grid.removeEventListener("pointerleave", onPointerLeave);
      grid.removeEventListener("focusin", onFocusIn);
      grid.removeEventListener("focusout", onFocusOut);

      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      if (typeof hoverMq.removeEventListener === "function") {
        hoverMq.removeEventListener("change", onHoverMqChange);
      } else {
        hoverMq.removeListener(onHoverMqChange);
      }
      if (typeof motionMq.removeEventListener === "function") {
        motionMq.removeEventListener("change", onMotionMqChange);
      } else {
        motionMq.removeListener(onMotionMqChange);
      }
    };
  }, [mounted, gridSelector, labels]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={pillRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        background: "var(--color-badge-bg)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-control)",
        boxShadow:
          "0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)",
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "16px",
        color: "var(--color-text-card-sub)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 120ms ease-out",
        willChange: "transform",
      }}
    />,
    document.body,
  );
}
