"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ProjectHoverIndicator.module.css";

const SHOW_DELAY_MS = 400;
const LEAVE_GRACE_MS = 40;
const FALLBACK_IN_MS = 280;
const FALLBACK_OUT_MS = 360;
const FALLBACK_EASE = "cubic-bezier(0.25, 0, 0, 1)";

type Phase = "pre" | "in" | "open" | "leaving";
type Motion = { inMs: number; outMs: number; ease: string };
type Ui = { label: string; phase: Phase; motion: Motion };

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

/** The plate’s own transition, so the pill fades on the same clock. */
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

function placePill(anchor: HTMLElement, pill: HTMLElement, root: HTMLElement): void {
  const media = anchor.querySelector(".project-img-wrap");
  const a = (media instanceof HTMLElement ? media : anchor).getBoundingClientRect();
  const d = pill.getBoundingClientRect();
  const margin = 8;
  const gap = 8;
  let y = a.top - gap - d.height;
  if (y < margin) y = a.bottom + gap;
  let x = a.left + a.width / 2 - d.width / 2;
  const maxX = window.innerWidth - margin - d.width;
  const maxY = window.innerHeight - margin - d.height;
  x = Math.min(Math.max(margin, x), Math.max(margin, maxX));
  y = Math.min(Math.max(margin, y), Math.max(margin, maxY));
  root.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

/**
 * One shared pill for the work grid. First hover waits, moving between
 * cards swaps in place, and leaving fades the same element out.
 */
export default function ProjectHoverIndicator() {
  const [ui, setUi] = useState<Ui | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let phase: "idle" | "waiting" | "open" | "leaving" = "idle";
    let card: HTMLElement | null = null;
    let showTimer = 0;
    let graceTimer = 0;
    let hideTimer = 0;

    const clear = (id: number) => {
      if (id) window.clearTimeout(id);
      return 0;
    };

    const publish = (visual: Phase) => {
      if (!card || (phase !== "open" && phase !== "leaving")) {
        anchorRef.current = null;
        setUi(null);
        return;
      }
      anchorRef.current = card;
      const label = card.getAttribute("data-indicator") ?? "";
      if (!label) {
        anchorRef.current = null;
        setUi(null);
        return;
      }
      const motion = readCardMotion(card);
      const shown = reduced.matches && (visual === "pre" || visual === "leaving") ? "open" : visual;
      if (reduced.matches && visual === "leaving") {
        anchorRef.current = null;
        setUi(null);
        return;
      }
      setUi({ label, phase: shown, motion });
    };

    const cardFrom = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const el = target.closest("[data-indicator]");
      return el instanceof HTMLElement ? el : null;
    };

    const onOver = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch") return;
      if (document.documentElement.getAttribute("data-intro") === "playing") return;
      const next = cardFrom(event.target);
      if (!next) return;

      if (next === card && (phase === "waiting" || phase === "open" || phase === "leaving")) {
        if (phase === "leaving") {
          graceTimer = clear(graceTimer);
          hideTimer = clear(hideTimer);
          phase = "open";
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
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      clear(showTimer);
      clear(graceTimer);
      clear(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!ui || ui.phase !== "pre") return;
    const id = requestAnimationFrame(() => {
      setUi((cur) => (cur && cur.phase === "pre" ? { ...cur, phase: "in" } : cur));
    });
    return () => cancelAnimationFrame(id);
  }, [ui]);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!ui || !anchor || !root || !pill) return;

    const place = () => {
      const current = anchorRef.current;
      const liveRoot = rootRef.current;
      const livePill = pillRef.current;
      if (!current || !liveRoot || !livePill) return;
      placePill(current, livePill, liveRoot);
    };

    place();
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [ui]);

  if (!ui || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      className={styles.root}
      data-project-hover
      data-phase={ui.phase}
      aria-hidden
      style={{
        ["--pill-in" as string]: `${ui.motion.inMs}ms`,
        ["--pill-out" as string]: `${ui.motion.outMs}ms`,
        ["--pill-ease" as string]: ui.motion.ease,
      }}
    >
      <div ref={pillRef} className={styles.pill}>
        {ui.label}
      </div>
    </div>,
    document.body,
  );
}
