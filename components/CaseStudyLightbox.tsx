"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { usePinchZoom } from "@/lib/usePinchZoom";

type Props = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
  /** The in-page (already loaded) image URL: shown at once while the large version loads. */
  previewSrc?: string;
  /** Element that opened the lightbox; focus returns here on close. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// Full-screen image viewer: portal to <body> (escapes transformed ancestors that would
// break `position: fixed`), page frozen behind it, pinch / double-tap zoom, Close in its
// own corner outside the image area. Layout + tokens: .cs-lightbox* in app/globals.css.
export default function CaseStudyLightbox({ open, ...rest }: Props) {
  // The dialog is its own component so its effects (scroll lock, focus, zoom gestures)
  // run on mount, when every ref is attached, and clean up on close.
  if (!open || typeof document === "undefined") return null;
  return createPortal(<LightboxDialog {...rest} />, document.body);
}

function LightboxDialog({ src, alt, onClose, returnFocusRef, previewSrc }: Omit<Props, "open">) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const opener = useRef<HTMLElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const requestClose = useCallback(() => onCloseRef.current(), []);

  useEffect(() => {
    opener.current = returnFocusRef?.current ?? (document.activeElement as HTMLElement | null);
    lockScroll();
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };
    // Keep focus inside the dialog even if something outside grabs it.
    const onFocusIn = (e: FocusEvent) => {
      const d = dialogRef.current;
      if (d && e.target instanceof Node && !d.contains(e.target)) closeRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
      unlockScroll();
      opener.current?.focus({ preventScroll: true });
    };
  }, [requestClose, returnFocusRef]);

  usePinchZoom({ stageRef, panRef, imgRef, onTapOutside: requestClose });

  const onDialogKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  return (
    <div
      ref={dialogRef}
      className="cs-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onKeyDown={onDialogKeyDown}
    >
      <div ref={stageRef} className="cs-lightbox-stage">
        <div ref={panRef} className="cs-lightbox-pan">
          {previewSrc && !loaded ? (
            // eslint-disable-next-line @next/next/no-img-element -- plain <img>: the exact URL the page already has cached
            <img src={previewSrc} alt="" aria-hidden className="cs-lightbox-img cs-lightbox-img--preview" draggable={false} />
          ) : null}
          <Image
            ref={imgRef}
            data-loaded={loaded ? "true" : "false"}
            onLoad={() => setLoaded(true)}
            src={src}
            alt={alt}
            fill
            sizes="200vw"
            quality={90}
            draggable={false}
            className="cs-lightbox-img"
          />
        </div>
      </div>
      <button ref={closeRef} type="button" className="cs-lightbox-close" onClick={requestClose} aria-label="Close enlarged image">
        <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
          <line x1="2" y1="2" x2="14" y2="14" />
          <line x1="14" y1="2" x2="2" y2="14" />
        </svg>
      </button>
    </div>
  );
}
