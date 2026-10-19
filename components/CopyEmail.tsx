"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
 * Copies CONTACT_EMAIL on click. Shows “Copied” + check briefly, with a polite live region.
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onClick = useCallback(async () => {
    const ok = await copyToClipboard(CONTACT_EMAIL);
    setAnnouncement(
      ok
        ? `${CONTACT_EMAIL} copied to clipboard`
        : `Select and copy ${CONTACT_EMAIL}`,
    );
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopied(false);
      setAnnouncement("");
    }, 1500);
  }, []);

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
        className={className}
        style={{ ...baseStyle, ...style }}
        aria-label={ariaLabel ?? `Copy ${CONTACT_EMAIL} to clipboard`}
        onClick={onClick}
      >
        {copied ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CheckIcon />
            {copiedLabel}
          </span>
        ) : (
          children
        )}
      </button>
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
