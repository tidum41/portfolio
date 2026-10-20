"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LinkSimple } from "@phosphor-icons/react";
import { CONTACT_EMAIL } from "@/lib/site";

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
 * Copies CONTACT_EMAIL on click. Smoothly adjusts width and crossfades
 * between resting and "Copied" states without abrupt layout jumping.
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

  const trackRef = useRef<HTMLSpanElement>(null);
  const idleRef = useRef<HTMLSpanElement>(null);
  const copiedRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const onClick = useCallback(async () => {
    const ok = await copyToClipboard(CONTACT_EMAIL);
    setAnnouncement(
      ok
        ? `${CONTACT_EMAIL} copied to clipboard`
        : `Select and copy ${CONTACT_EMAIL}`,
    );

    const track = trackRef.current;
    const idleEl = idleRef.current;
    const copiedEl = copiedRef.current;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!copied && track && idleEl && copiedEl && !prefersReducedMotion) {
      const startW = idleEl.offsetWidth;
      const endW = copiedEl.offsetWidth;

      // Anchor starting width into browser layout before initiating the CSS transition
      track.style.width = `${startW}px`;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      track.offsetWidth;

      setCopied(true);
      track.style.width = `${endW}px`;

      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      animTimerRef.current = setTimeout(() => {
        if (track) track.style.width = "";
      }, 240);
    } else {
      setCopied(true);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (track && idleEl && copiedEl && !prefersReducedMotion) {
        const curW = copiedEl.offsetWidth;
        const targetW = idleEl.offsetWidth;

        track.style.width = `${curW}px`;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        track.offsetWidth;

        setCopied(false);
        track.style.width = `${targetW}px`;

        if (animTimerRef.current) clearTimeout(animTimerRef.current);
        animTimerRef.current = setTimeout(() => {
          if (track) track.style.width = "";
          setAnnouncement("");
        }, 240);
      } else {
        setCopied(false);
        setAnnouncement("");
      }
    }, 1500);
  }, [copied]);

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

  return (
    <>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
      <button
        type="button"
        className={`copy-email-btn ${className ?? ""}`.trim()}
        style={{ ...baseStyle, ...style }}
        data-copied={copied}
        aria-label={ariaLabel ?? `Copy ${CONTACT_EMAIL} to clipboard`}
        onClick={onClick}
      >
        <span ref={trackRef} className="copy-email-track">
          <span
            ref={idleRef}
            className="copy-email-layer copy-email-idle"
            aria-hidden={copied}
          >
            {children}
          </span>
          <span
            ref={copiedRef}
            className="copy-email-layer copy-email-copied"
            aria-hidden={!copied}
          >
            <CopyIcon />
            {copiedLabel}
          </span>
        </span>
      </button>
    </>
  );
}

function CopyIcon() {
  return (
    <LinkSimple
      size={14}
      weight="regular"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transform: "translateY(-0.5px)",
      }}
    />
  );
}
