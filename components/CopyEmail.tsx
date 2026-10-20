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

const HOLD_MS = 1200;

/**
 * Copies CONTACT_EMAIL on click. Calm opacity crossfade to "Copied"
 * (stacked layers keep width stable — no layout shift).
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
    }, HOLD_MS);
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
        className={`copy-email-btn ${className ?? ""}`.trim()}
        style={{ ...baseStyle, ...style }}
        data-copied={copied}
        aria-label={ariaLabel ?? `Copy ${CONTACT_EMAIL} to clipboard`}
        onClick={onClick}
      >
        <span className="copy-email-track">
          <span className="copy-email-layer copy-email-idle" aria-hidden={copied}>
            {children}
          </span>
          <span className="copy-email-layer copy-email-copied" aria-hidden={!copied}>
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
