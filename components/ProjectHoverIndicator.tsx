"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ProjectHoverIndicator.module.css";

const SHOW_DELAY_MS = 400;
const LEAVE_GRACE_MS = 40;
const LEAVE_FADE_MS = 120;

type Phase = "open" | "leaving";
type Ui = { label: string; phase: Phase };

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

    const publish = () => {
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
      setUi({ label, phase });
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
          publish();
        }
        return;
      }

      graceTimer = clear(graceTimer);
      hideTimer = clear(hideTimer);
      card = next;

      if (phase === "open" || phase === "leaving") {
        phase = "open";
        publish();
        return;
      }

      if (phase === "waiting") return;

      phase = "waiting";
      showTimer = clear(showTimer);
      showTimer = window.setTimeout(() => {
        if (phase !== "waiting" || !card) return;
        phase = "open";
        publish();
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
          publish();
          return;
        }
        phase = "leaving";
        publish();
        hideTimer = clear(hideTimer);
        hideTimer = window.setTimeout(() => {
          if (phase !== "leaving") return;
          phase = "idle";
          card = null;
          publish();
        }, reduced.matches ? 0 : LEAVE_FADE_MS);
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
    <div ref={rootRef} className={styles.root} data-project-hover data-phase={ui.phase} aria-hidden>
      <div ref={pillRef} className={styles.pill}>
        {ui.label}
      </div>
    </div>,
    document.body,
  );
}
