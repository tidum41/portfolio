"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_EXIT, EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
  title: string;
  sub?: string;
  description?: string;
  tools?: string[];
  /** Panel width — narrower for tall/narrow content (e.g. a phone mockup) so
   *  the embed still fills the available width edge-to-edge at the same 20px
   *  gutter the wider panels use, instead of floating in extra empty space. */
  maxWidth?: number;
  /** Match the panel's fill to the grid tile's own background so the popup
   *  reads as a continuation of that card, not a generic dialog. */
  panelBg?: string;
  children: React.ReactNode;
}

// Lightweight in-page modal for grid items that are meant to be played with
// rather than read (CD Player, Habit Tracker) — an alternative to a full
// case-study page navigation. Portaled to <body> (same pattern as
// GlobalCustomCursor's own document.body mount) so it sits above the grid's
// own stacking contexts regardless of where the trigger lives in the tree.
export default function ProjectPopup({
  open,
  onClose,
  onExitComplete,
  title,
  sub,
  description,
  tools,
  maxWidth = 560,
  panelBg = "var(--color-bg)",
  children,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerElRef = useRef<Element | null>(null);
  const reduced = useReducedMotion();

  const backdropEnter = reduced ? 0.01 : PANEL_DURATION.backdrop.enter;
  const backdropExit  = reduced ? 0.01 : PANEL_DURATION.backdrop.exit;
  const panelEnter    = reduced ? 0.01 : PANEL_DURATION.panel.enter;
  const panelExit     = reduced ? 0.01 : PANEL_DURATION.panel.exit;
  const panelY        = reduced ? 0 : 10;

  // Remember what had focus before opening, so it can be restored on close —
  // and move focus into the panel itself so screen readers/keyboard users
  // land somewhere sensible immediately. Fixed-body scroll lock preserves
  // the page's scroll position (overflow:hidden alone causes jumps on close
  // and focus-restore can scroll the trigger back into view).
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    triggerElRef.current = document.activeElement;
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    document.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.paddingRight = prev.paddingRight;
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
      document.removeEventListener("keydown", onKeyDown);
      (triggerElRef.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: backdropEnter, ease: EASE_OPACITY } }}
          exit={{ opacity: 0, transition: { duration: backdropExit, ease: EASE_EXIT } }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            // Just under GlobalCustomCursor's z-index (999999, see
            // components/GlobalCustomCursor.tsx) so the custom cursor keeps
            // painting on top of the modal instead of disappearing behind
            // it — the native cursor is hidden sitewide, so without this the
            // popup left visitors with no visible cursor at all.
            zIndex: 999998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            // Opacity + y only, deliberately no scale — matches
            // PS3ControlPanel's own panel-open language (ExpandSection:
            // max-height + opacity, no scale) rather than a card-hover-press
            // treatment, and keeps the panel's actual box size constant
            // throughout so embeds inside it (CDPlayer's ResizeObserver)
            // never see a spurious resize mid-animation. Asymmetric timing —
            // slower open, snappier close — mirrors that same precedent
            // (320ms/220ms open vs 240ms/160ms close there).
            initial={{ opacity: 0, y: panelY }}
            animate={{ opacity: 1, y: 0, transition: { duration: panelEnter, ease: EASE_OPACITY } }}
            exit={{ opacity: 0, y: panelY, transition: { duration: panelExit, ease: EASE_EXIT } }}
            style={{
              width: `min(${maxWidth}px, 100%)`,
              maxHeight: "85vh",
              overflowY: "auto",
              background: panelBg,
              borderRadius: "var(--radius-panel)",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
              outline: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 20px 0" }}>
              <div>
                <p style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>{title}</p>
                {sub && (
                  <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" }}>{sub}</p>
                )}
              </div>
              <button
                className="popup-close-btn"
                onClick={onClose}
                aria-label="Close"
                title="Close"
              >
                <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="2" x2="14" y2="14" />
                  <line x1="14" y1="2" x2="2" y2="14" />
                </svg>
              </button>
            </div>

            <div style={{ padding: 20 }}>
              {children}
            </div>

            {(description || (tools && tools.length > 0)) && (
              <div style={{ padding: "0 20px 20px" }}>
                {description && (
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
                    {description}
                  </p>
                )}
                {tools && tools.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {tools.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-tertiary)",
                          border: "1px solid var(--color-border-subtle)",
                          borderRadius: 999,
                          padding: "3px 10px",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
