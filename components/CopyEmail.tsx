"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TransitionEvent,
} from "react";
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
 * Copies CONTACT_EMAIL on click. Crossfades calmly between resting and "Copied" states;
 * track width animates between measured label widths so rest stays natural "Email" width.
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
  const [trackWidthPx, setTrackWidthPx] = useState<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const idleRef = useRef<HTMLSpanElement>(null);
  const copiedRef = useRef<HTMLSpanElement>(null);
  const widthsRef = useRef({ idle: 0, copied: 0 });

  const measureLayers = useCallback(() => {
    const idle = idleRef.current;
    const copied = copiedRef.current;
    if (!idle || !copied) return;
    widthsRef.current = {
      idle: Math.ceil(idle.getBoundingClientRect().width),
      copied: Math.ceil(copied.getBoundingClientRect().width),
    };
  }, []);

  useLayoutEffect(() => {
    measureLayers();
  }, [measureLayers, children, copiedLabel]);

  useEffect(() => {
    // Hand clicks over from the pre-hydration handler in app/layout.tsx.
    (window as Window & { __copyEmailReady?: boolean }).__copyEmailReady = true;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onTrackTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLSpanElement>) => {
      if (event.propertyName !== "width") return;
      if (!copied) {
        setTrackWidthPx(undefined);
      }
    },
    [copied],
  );

  const onClick = useCallback(async () => {
    measureLayers();
    const { idle, copied: copiedW } = widthsRef.current;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Start the visual change immediately; the clipboard write runs alongside it.
    void copyToClipboard(CONTACT_EMAIL).then((ok) =>
      setAnnouncement(
        ok
          ? `${CONTACT_EMAIL} copied to clipboard`
          : `Select and copy ${CONTACT_EMAIL}`,
      ),
    );

    const currentIdle =
      trackWidthPx ?? Math.ceil(trackRef.current?.getBoundingClientRect().width ?? idle);

    if (reduced) {
      setTrackWidthPx(copiedW);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        setAnnouncement("");
        setTrackWidthPx(undefined);
      }, 1100);
      return;
    }

    setTrackWidthPx(currentIdle);
    requestAnimationFrame(() => {
      setCopied(true);
      setTrackWidthPx(copiedW);
    });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopied(false);
      setTrackWidthPx(idle);
    }, 1100);
  }, [measureLayers]);

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
        <span
          ref={trackRef}
          className="copy-email-track"
          style={trackWidthPx !== undefined ? { width: trackWidthPx } : undefined}
          onTransitionEnd={onTrackTransitionEnd}
        >
          <span ref={idleRef} className="copy-email-layer copy-email-layer--idle">
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
