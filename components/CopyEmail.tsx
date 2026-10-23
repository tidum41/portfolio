"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { CONTACT_EMAIL } from "@/lib/site";

/** Visible "Copied" hold before fading back. Fade durations live in CSS. */
const HOLD_MS = 1600;

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }

  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(el);
  }
}

/**
 * Copies CONTACT_EMAIL on click. Crossfades to chain icon + "Copied" while the
 * track width eases between the two natural label widths, so neighbors keep
 * the same gap and smoothly make room.
 */
export default function CopyEmail({
  children,
  copiedLabel = "Copied",
  className,
  style,
  ariaLabel,
  unstyled = false,
}: {
  children: ReactNode;
  copiedLabel?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  /** Strip default button chrome so footer/about link styles apply. */
  unstyled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const idleRef = useRef<HTMLSpanElement | null>(null);
  const copiedRef = useRef<HTMLSpanElement | null>(null);

  /** Animate the track from its current width to `to`'s natural width. */
  const animateWidth = useCallback((to: HTMLSpanElement | null, release: boolean) => {
    const track = trackRef.current;
    if (!track || !to) return;
    if (clearRef.current) clearTimeout(clearRef.current);
    const from = track.getBoundingClientRect().width;
    const target = to.getBoundingClientRect().width;
    track.style.width = `${from}px`;
    void track.offsetWidth; // commit start width before transitioning
    track.style.width = `${target}px`;
    if (release) {
      // Back at rest: drop the inline width so "Email" stays at natural width.
      clearRef.current = setTimeout(() => {
        track.style.width = "";
      }, 300);
    }
  }, []);

  useEffect(() => {
    // Hand clicks over from the pre-hydration handler in BootScripts.
    (window as Window & { __copyEmailReady?: boolean }).__copyEmailReady = true;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (clearRef.current) clearTimeout(clearRef.current);
    };
  }, []);

  const onClick = useCallback(async () => {
    if (copied) return;

    void copyToClipboard(CONTACT_EMAIL).then((ok) =>
      setAnnouncement(
        ok
          ? `${CONTACT_EMAIL} copied to clipboard`
          : `Select and copy ${CONTACT_EMAIL}`,
      ),
    );

    animateWidth(copiedRef.current, false);
    setCopied(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      animateWidth(idleRef.current, true);
      setCopied(false);
      setAnnouncement("");
    }, HOLD_MS);
  }, [copied, animateWidth]);

  const baseStyle: CSSProperties = unstyled
    ? {
        background: "none",
        border: "none",
        padding: 0,
        margin: 0,
        font: "inherit",
        color: "inherit",
        cursor: "pointer",
        textAlign: "inherit",
      }
    : { cursor: "pointer" };

  const mergedClass = [className, "copy-email-btn"].filter(Boolean).join(" ");

  return (
    <>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
      <button
        type="button"
        className={mergedClass}
        style={{ ...baseStyle, ...style }}
        aria-label={ariaLabel ?? `Copy ${CONTACT_EMAIL} to clipboard`}
        data-copied={copied ? "true" : "false"}
        onClick={onClick}
      >
        <span className="copy-email-track" ref={trackRef}>
          <span ref={idleRef} className="copy-email-layer copy-email-layer--idle" aria-hidden={copied}>
            {children}
          </span>
          <span
            ref={copiedRef}
            className="copy-email-layer copy-email-layer--copied"
            aria-hidden={!copied}
          >
            <ChainLinkIcon />
            {copiedLabel}
          </span>
        </span>
      </button>
    </>
  );
}

function ChainLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.75 9.25a2.75 2.75 0 0 0 3.89 0l2.12-2.12a2.75 2.75 0 0 0-3.89-3.89l-.88.88M9.25 6.75a2.75 2.75 0 0 0-3.89 0L3.24 8.87a2.75 2.75 0 0 0 3.89 3.89l.88-.88"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
