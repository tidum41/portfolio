"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cssEase, EASE_OPACITY } from "@/lib/motion";

type Props = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

export default function CaseStudyLightbox({ src, alt, open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setVisible(true);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  const ease = cssEase(EASE_OPACITY);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className="cs-lightbox-backdrop"
      role="presentation"
      onClick={onBackdrop}
      style={{
        opacity: visible ? 1 : 0,
        transition: reduced ? "none" : `opacity 0.22s ${ease}`,
      }}
    >
      <div
        className="cs-lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.98)",
          transition: reduced ? "none" : `opacity 0.26s ${ease}, transform 0.26s ${ease}`,
        }}
      >
        <button
          ref={closeRef}
          type="button"
          className="cs-lightbox-close"
          onClick={onClose}
          aria-label="Close enlarged image"
        >
          Close
        </button>
        <div className="cs-lightbox-media">
          <Image src={src} alt={alt} width={2400} height={1600} style={{ width: "100%", height: "auto" }} />
        </div>
      </div>
    </div>
  );
}
