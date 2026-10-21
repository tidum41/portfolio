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
 * Copies CONTACT_EMAIL on click. Crossfades the label to "Copied" in place
 * (grid-stacked layers) so width, height, and baseline never shift.
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
    // Hand clicks over from the pre-hydration handler in BootScripts.
    (window as Window & { __copyEmailReady?: boolean }).__copyEmailReady = true;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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

    setCopied(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopied(false);
      setAnnouncement("");
    }, HOLD_MS);
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
        <span className="copy-email-track">
          <span className="copy-email-layer copy-email-layer--idle" aria-hidden={copied}>
            {children}
          </span>
          <span
            className="copy-email-layer copy-email-layer--copied"
            aria-hidden={!copied}
          >
            {copiedLabel}
          </span>
        </span>
      </button>
    </>
  );
}
