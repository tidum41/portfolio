"use client";

import { useEffect, useRef, useState } from "react";
import DockTooltipPortal from "./DockTooltipPortal";
import type { AnchoredAppearance, CardKind, DockPlacementMode } from "./types";

const SHOW_DELAY_MS = 400;
const LEAVE_GRACE_MS = 40;
const FALLBACK_IN_MS = 280;
const FALLBACK_OUT_MS = 360;
const FALLBACK_EASE = "cubic-bezier(0.25, 0, 0, 1)";

type Phase = "pre" | "in" | "open" | "leaving";
type Motion = { inMs: number; outMs: number; ease: string };
type Ui = {
  kind: CardKind;
  anchorEl: HTMLElement;
  phase: Phase;
  motion: Motion;
  pointer: { x: number; y: number };
};

function parseDurationMs(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  if (v.endsWith("ms")) return Number.parseFloat(v);
  if (v.endsWith("s")) return Number.parseFloat(v) * 1000;
  return null;
}

function firstTiming(value: string): string {
  const v = value.trim();
  if (v.startsWith("cubic-bezier(")) {
    const end = v.indexOf(")");
    return end === -1 ? v : v.slice(0, end + 1);
  }
  return v.split(",")[0]?.trim() ?? v;
}

function readCardMotion(card: HTMLElement): Motion {
  const host = card.classList.contains("project-card")
    ? card
    : card.querySelector(".project-card");
  const el = host instanceof HTMLElement ? host : card;
  const cs = getComputedStyle(el);
  const inMs = parseDurationMs(cs.getPropertyValue("--project-hover-in")) ?? FALLBACK_IN_MS;
  const outMs = parseDurationMs(cs.getPropertyValue("--project-hover-out")) ?? FALLBACK_OUT_MS;
  const plateEase = firstTiming(getComputedStyle(el, "::before").transitionTimingFunction);
  const varEase = cs.getPropertyValue("--project-hover-ease").trim();
  const ease = plateEase && plateEase !== "ease"
    ? plateEase
    : varEase && !varEase.startsWith("var(")
      ? varEase
      : cs.getPropertyValue("--expand-ease").trim() || FALLBACK_EASE;
  return { inMs, outMs, ease };
}

function isKind(value: string | null): value is CardKind {
  return value === "case-study" || value === "demo" || value === "both";
}

/**
 * One pill for the lab grid. First hover waits, moving between cards swaps
 * in place, and leaving fades with the card plate.
 */
export default function SharedDock({
  placement,
  appearance,
}: {
  placement: DockPlacementMode;
  appearance: AnchoredAppearance;
}) {
  const [ui, setUi] = useState<Ui | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const visualRef = useRef<Phase>("open");

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let phase: "idle" | "waiting" | "open" | "leaving" = "idle";
    let card: HTMLElement | null = null;
    let showTimer = 0;
    let graceTimer = 0;
    let hideTimer = 0;
    let pointer = { x: 0, y: 0 };

    const clear = (id: number) => {
      if (id) window.clearTimeout(id);
      return 0;
    };

    const anchorOf = (el: HTMLElement) => {
      const media = el.querySelector(".project-img-wrap");
      return media instanceof HTMLElement ? media : el;
    };

    const publish = (visual: Phase, point = pointer) => {
      if (!card || (phase !== "open" && phase !== "leaving")) {
        cardRef.current = null;
        setUi(null);
        return;
      }
      const kind = card.getAttribute("data-kind");
      if (!isKind(kind)) {
        cardRef.current = null;
        setUi(null);
        return;
      }
      if (reduced.matches && visual === "leaving") {
        cardRef.current = null;
        visualRef.current = "open";
        setUi(null);
        return;
      }
      cardRef.current = card;
      const shown = reduced.matches && visual === "pre" ? "open" : visual;
      visualRef.current = shown;
      setUi({
        kind,
        anchorEl: anchorOf(card),
        phase: shown,
        motion: readCardMotion(card),
        pointer: point,
      });
    };

    const cardFrom = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const el = target.closest("[data-kind]");
      return el instanceof HTMLElement ? el : null;
    };

    const onOver = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      const next = cardFrom(event.target);
      if (!next) return;

      if (next === card && (phase === "waiting" || phase === "open" || phase === "leaving")) {
        if (phase === "leaving") {
          graceTimer = clear(graceTimer);
          hideTimer = clear(hideTimer);
          phase = "open";
          publish("open");
        } else if (placement === "cursor-follow" && phase === "open") {
          publish("open");
        }
        return;
      }

      graceTimer = clear(graceTimer);
      hideTimer = clear(hideTimer);
      card = next;

      if (phase === "open" || phase === "leaving") {
        phase = "open";
        publish("open");
        return;
      }

      if (phase === "waiting") return;

      phase = "waiting";
      showTimer = clear(showTimer);
      showTimer = window.setTimeout(() => {
        if (phase !== "waiting" || !card) return;
        phase = "open";
        publish("pre");
      }, SHOW_DELAY_MS);
    };

    const onMove = (event: PointerEvent) => {
      if (placement !== "cursor-follow") return;
      if (!fine.matches || event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      if (phase !== "open" || !card) return;
      if (visualRef.current === "pre" || visualRef.current === "in") return;
      if (!(event.target instanceof Node) || !card.contains(event.target)) return;
      publish("open");
    };

    const onOut = (event: PointerEvent) => {
      const leaving = cardFrom(event.target);
      if (!leaving || leaving !== card) return;
      const related = event.relatedTarget;
      if (related instanceof Node && leaving.contains(related)) return;
      if (phase === "idle") return;

      graceTimer = clear(graceTimer);
      graceTimer = window.setTimeout(() => {
        if (card !== leaving) return;
        showTimer = clear(showTimer);
        if (phase === "waiting") {
          phase = "idle";
          card = null;
          publish("open");
          return;
        }
        const outMs = reduced.matches ? 0 : readCardMotion(leaving).outMs;
        phase = "leaving";
        publish("leaving");
        hideTimer = clear(hideTimer);
        hideTimer = window.setTimeout(() => {
          if (phase !== "leaving") return;
          phase = "idle";
          card = null;
          publish("open");
        }, outMs);
      }, LEAVE_GRACE_MS);
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointermove", onMove);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointermove", onMove);
      clear(showTimer);
      clear(graceTimer);
      clear(hideTimer);
    };
  }, [placement]);

  useEffect(() => {
    if (!ui || ui.phase !== "pre") return;
    const id = requestAnimationFrame(() => {
      setUi((cur) => {
        if (!cur || cur.phase !== "pre") return cur;
        visualRef.current = "in";
        return { ...cur, phase: "in" };
      });
    });
    return () => cancelAnimationFrame(id);
  }, [ui]);

  if (!ui) return null;

  const shown = ui.phase === "in" || ui.phase === "open" || ui.phase === "pre";

  return (
    <DockTooltipPortal
      kind={ui.kind}
      visible={shown}
      leaving={ui.phase === "leaving"}
      phase={ui.phase}
      motion={ui.motion}
      placement={placement}
      anchoredAppearance={appearance}
      anchorEl={ui.anchorEl}
      pointer={ui.pointer}
    />
  );
}
