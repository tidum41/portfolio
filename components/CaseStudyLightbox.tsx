"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useModalDialog } from "@/lib/useModalDialog";
import { usePinchZoom } from "@/lib/usePinchZoom";

type Props = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
  /** Image width / height, so the image fits the window with no scroll. */
  aspectRatio: number;
  /** The figure's caption, shown bottom left under the image. */
  caption?: string;
};

/** Same glyph weight as the Back link chevron: 10px box, 1.5 stroke. */
function CloseGlyph() {
  return (
    <svg className="cs-lightbox-close-glyph" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M1 1L9 9M9 1L1 9" />
    </svg>
  );
}

/**
 * Case study image lightbox (Paper "JOOLA lightbox redesign 2026-11-21"): the page
 * background fills the window, a text Close sits top right like Back, and the image
 * is fitted below it with its caption. Portaled to <body> so a ScrollReveal transform
 * on an ancestor can't become the fixed overlay's containing block.
 */
export default function CaseStudyLightbox({ src, alt, open, onClose, aspectRatio, caption }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  // Phones only: pinch, pan and double tap on the image. Desktop keeps the fitted view.
  const gesturedRef = usePinchZoom({ enabled: open, stageRef, targetRef: mediaRef, query: "(max-width: 767px)" });

  useModalDialog({
    open,
    containerRef: rootRef,
    onEscape: onClose,
    initialFocus: () => {
      // Keyboard opens show the ring on Close; pointer opens move focus without painting it.
      const byKeyboard = document.activeElement?.matches(":focus-visible") ?? false;
      closeRef.current?.focus({ preventScroll: true, focusVisible: byKeyboard } as FocusOptions);
    },
  });

  // One frame at opacity 0, then the CSS fade runs (instant under reduced motion).
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(id);
      setVisible(false);
    };
  }, [open]);

  if (!open) return null;

  const onBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (gesturedRef.current) {
      gesturedRef.current = false;
      return;
    }
    const target = e.target as Element;
    if (!target.closest(".cs-lightbox-media, .cs-lightbox-close")) onClose();
  };

  return createPortal(
    <div
      ref={rootRef}
      className="cs-lightbox"
      data-visible={visible ? "" : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={caption ?? alt}
      onClick={onBackdropClick}
      style={{ "--cs-lightbox-ar": aspectRatio } as CSSProperties}
    >
      <div className="cs-lightbox-bar">
        <button ref={closeRef} type="button" className="cs-lightbox-close" onClick={onClose} aria-label="Close enlarged image">
          <CloseGlyph />
          <span>Close</span>
        </button>
      </div>
      <div ref={stageRef} className="cs-lightbox-stage">
        <div className="cs-lightbox-frame">
          <div ref={mediaRef} className="cs-lightbox-media">
            <Image src={src} alt={alt} width={2400} height={Math.round(2400 / aspectRatio)} sizes="(max-width: 1248px) 100vw, 1200px" />
          </div>
          <div className="cs-lightbox-meta">
            <span>{caption}</span>
            <span className="cs-lightbox-hint">Esc to close</span>
            <span className="cs-lightbox-zoomhint">Pinch to zoom</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
