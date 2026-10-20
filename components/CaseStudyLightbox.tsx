"use client";

import { useCallback, useEffect, useRef, useState } from "react";
type Props = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};

export default function CaseStudyLightbox({ src, alt, open, onClose, returnFocusRef }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const scrollYRef = useRef(0);

  const finishClose = useCallback(() => {
    onClose();
    window.scrollTo(0, scrollYRef.current);
    returnFocusRef?.current?.focus({ preventScroll: true });
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    scrollYRef.current = window.scrollY;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
    } else {
      requestAnimationFrame(() => setVisible(true));
    }
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, finishClose]);

  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) finishClose();
    },
    [finishClose],
  );

  if (!open) return null;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = "ease-out";
  const duration = reduced ? "0ms" : "200ms";

  return (
    <div
      className="cs-lightbox-backdrop"
      role="presentation"
      onClick={onBackdrop}
      style={{
        opacity: visible ? 1 : 0,
        transition: reduced ? "none" : `opacity ${duration} ${ease}`,
      }}
    >
      <div
        className="cs-lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        onClick={onBackdrop}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.98)",
          transition: reduced ? "none" : `opacity ${duration} ${ease}, transform ${duration} ${ease}`,
        }}
      >
        <button
          ref={closeRef}
          type="button"
          className="cs-lightbox-close"
          onClick={finishClose}
          aria-label="Close enlarged image"
        >
          <span aria-hidden="true">×</span>
        </button>
        <div className="cs-lightbox-media" onClick={(e) => e.stopPropagation()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="cs-lightbox-img" />
        </div>
      </div>
    </div>
  );
}
