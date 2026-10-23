"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { isEditableTarget } from "@/lib/isEditableTarget";
type Props = {
  src?: string;
  children?: ReactNode;
  alt: string;
  open: boolean;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  annotate?: string;
};

/** Close fade: opacity only, no scale. Open has no transition at all. */
const CLOSE_FADE_MS = 120;

export default function CaseStudyLightbox({ src, children, alt, open, onClose, returnFocusRef, annotate = "cs-figure" }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  // True only after hydration, so the portal never renders on the server.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const scrollYRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);

  // Reset the fade state when a new open starts, during render, so the
  // reopened lightbox never inherits the previous close's opacity 0.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setClosing(false);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const finishClose = useCallback(() => {
    closeTimerRef.current = null;
    closingRef.current = false;
    onClose();
    window.scrollTo(0, scrollYRef.current);
    returnFocusRef?.current?.focus({ preventScroll: true });
  }, [onClose, returnFocusRef]);

  // Single close path for the X button, Esc and backdrop clicks: a short
  // 120ms opacity fade-out, or an instant close under reduced motion.
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      finishClose();
      return;
    }
    setClosing(true);
    closeTimerRef.current = window.setTimeout(finishClose, CLOSE_FADE_MS);
  }, [finishClose]);

  useEffect(() => {
    if (!open) return;
    scrollYRef.current = window.scrollY;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e)) return;
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, requestClose]);

  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) requestClose();
    },
    [requestClose],
  );

  if (!open || !mounted) return null;

  // No transition while opening or at rest: the lightbox appears instantly.
  // The transition exists only in the closing state, so it can never run on open.
  const fadeStyle = closing
    ? { opacity: 0, transition: `opacity ${CLOSE_FADE_MS}ms ease-out` }
    : { opacity: 1, transition: "none" as const };

  return createPortal(
    <div
      className="cs-lightbox-backdrop"
      data-annotate={`${annotate}/lightbox-backdrop`}
      role="presentation"
      onClick={onBackdrop}
      style={fadeStyle}
    >
      <button
        ref={closeRef}
        type="button"
        className="cs-lightbox-close"
        data-annotate={`${annotate}/lightbox-close`}
        onClick={requestClose}
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div
        className="cs-lightbox-dialog"
        data-annotate={`${annotate}/lightbox-dialog`}
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        onClick={onBackdrop}
        style={fadeStyle}
      >
        <div className="cs-lightbox-media" data-annotate={`${annotate}/lightbox-media`} onClick={(e) => e.stopPropagation()}>
          {children ? (
            <div className="cs-lightbox-live">{children}</div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} className="cs-lightbox-img" />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
