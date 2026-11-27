"use client";

import { useEffect, useRef, type RefObject } from "react";

type ModalDialogOptions = {
  /** Lock and trap only while true. */
  open: boolean;
  /** The dialog element. Tab is trapped inside it; it gets focus when `initialFocus` is not given. */
  containerRef: RefObject<HTMLElement | null>;
  /** Called on Escape. Read through a ref, so a new function each render is fine. */
  onEscape: () => void;
  /** Moves focus into the dialog on open. Defaults to focusing `containerRef`. */
  initialFocus?: () => void;
};

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal behaviour for the site's overlays (ProjectPopup, CaseStudyLightbox):
 * remembers the opener and returns focus to it on close, traps Tab, closes on Escape,
 * and locks page scroll with a fixed body so the scroll position never jumps.
 */
export function useModalDialog({ open, containerRef, onEscape, initialFocus }: ModalDialogOptions) {
  const onEscapeRef = useRef(onEscape);
  const initialFocusRef = useRef(initialFocus);
  useEffect(() => {
    onEscapeRef.current = onEscape;
    initialFocusRef.current = initialFocus;
  });

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const trigger = document.activeElement as HTMLElement | null;
    if (initialFocusRef.current) initialFocusRef.current();
    else containerRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeRef.current();
        return;
      }
      if (e.key !== "Tab" || !containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const body = document.body;
    const html = document.documentElement;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      overscroll: body.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyBg: body.style.backgroundColor,
      htmlBg: html.style.backgroundColor,
      htmlScheme: html.style.colorScheme,
      bodyScheme: body.style.colorScheme,
    };

    // Pin left/right (not only width:100%) so the fixed flex body can't pick
    // a stale static position and shift the grid under the backdrop blur.
    // paddingRight replaces the disappearing scrollbar so column widths stay put.
    // Lock color-scheme to the live data-theme so the browser canvas cannot
    // paint the opposite theme behind the overlay.
    // overflow + overscroll on html/body block background scroll and the
    // rubber-band that can show a second scrollbar behind the modal.
    const scheme = html.getAttribute("data-theme") === "light" ? "light" : "dark";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "auto";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.backgroundColor = "var(--color-bg)";
    html.style.backgroundColor = "var(--color-bg)";
    html.style.colorScheme = scheme;
    body.style.colorScheme = scheme;
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    document.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      body.style.overscrollBehavior = prev.overscroll;
      body.style.paddingRight = prev.paddingRight;
      body.style.backgroundColor = prev.bodyBg;
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      html.style.backgroundColor = prev.htmlBg;
      html.style.colorScheme = prev.htmlScheme;
      body.style.colorScheme = prev.bodyScheme;
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus?.({ preventScroll: true });
    };
  }, [open, containerRef]);
}
