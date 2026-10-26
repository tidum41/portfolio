"use client";

import {
  useEffect,
  useId,
  useLayoutEffect as _useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_EXIT, EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";

const useLayoutEffect = typeof window !== "undefined" ? _useLayoutEffect : useEffect;

export type PopupMetaItem = {
  label: string;
  values: string[];
};

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
  /**
   * `large` = near-fullscreen app embed (desktop ~90dvh panel; mobile full
   * screen). Adds an info control that toggles a metadata overlay. Default
   * keeps the existing CD / habit chrome unchanged.
   */
  size?: "default" | "large";
  /** Metadata rows for the large-size info panel. */
  infoMeta?: PopupMetaItem[];
  /** External "open full app" link shown in the large-size info panel. */
  infoLink?: { href: string; label: string };
  /**
   * Collapsed disclosure body under the metadata. Defaults to a clearly
   * marked placeholder — do not invent a reason if omitted.
   */
  whyBuilt?: string;
  children: ReactNode;
}

const INFO_MOTION = {
  duration: 0.16,
  ease: EASE_OPACITY,
} as const;

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
  size = "default",
  infoMeta,
  infoLink,
  whyBuilt = "TODO(Mudit): one or two sentences on why you built it.",
  children,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerElRef = useRef<Element | null>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);
  const infoInnerRef = useRef<HTMLDivElement>(null);
  const whySectionRef = useRef<HTMLDetailsElement>(null);
  const sheetDragRef = useRef<{ startY: number; dragging: boolean } | null>(null);
  const reduced = useReducedMotion();
  const isLarge = size === "large";
  const [infoOpen, setInfoOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  /** Measured mobile sheet height (px); null on desktop / before measure. */
  const [sheetHeight, setSheetHeight] = useState<number | null>(null);
  /** Live drag offset while swiping the sheet handle down (mobile only). */
  const [sheetDragY, setSheetDragY] = useState(0);
  const infoOpenRef = useRef(false);
  const infoPanelId = useId();

  const backdropEnter = reduced ? 0.01 : PANEL_DURATION.backdrop.enter;
  const backdropExit  = reduced ? 0.01 : PANEL_DURATION.backdrop.exit;
  const panelEnter    = reduced ? 0.01 : PANEL_DURATION.panel.enter;
  const panelExit     = reduced ? 0.01 : PANEL_DURATION.panel.exit;
  const panelY        = reduced ? 0 : 10;
  const infoY         = reduced ? 0 : 4;
  const infoDuration  = reduced ? 0.01 : INFO_MOTION.duration;
  const sheetDuration = reduced ? 0.01 : 0.2;
  /** Dimmed info-sheet scrim — 200ms fade per spec. */
  const scrimDuration = reduced ? 0.01 : 0.2;

  infoOpenRef.current = infoOpen;

  useEffect(() => {
    // Bottom-sheet / compact chrome below 640px AND short landscape
    // viewports (e.g. 844×390) where a desktop popover would clip.
    const mq = window.matchMedia("(max-width: 639px), (max-height: 500px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Reset info chrome whenever the dialog closes so the next open starts
  // with the app filling the panel (info closed, disclosure collapsed).
  useEffect(() => {
    if (!open) {
      setInfoOpen(false);
      setWhyOpen(false);
      setSheetHeight(null);
      setSheetDragY(0);
      sheetDragRef.current = null;
    }
  }, [open]);

  // Mobile sheet: grow to content up to 50dvh (closed Why) / 85dvh (open Why).
  useLayoutEffect(() => {
    if (!infoOpen || !isMobile) {
      if (!isMobile) setSheetHeight(null);
      return;
    }
    const panel = infoPanelRef.current;
    if (!panel) return;
    // Measure natural height (ignore the animated inline height).
    const prev = panel.style.height;
    panel.style.height = "auto";
    const contentH = panel.scrollHeight;
    panel.style.height = prev;
    // Prefer visualViewport when present (iOS dynamic toolbars); fall back to
    // innerHeight. Caps are dvh-equivalent fractions of the live viewport.
    // Closed Why must still fit Open full app + Why summary without clipping;
    // open Why can grow further (sheet scrolls internally past the cap).
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const shortLandscape = vh <= 500;
    const cap = shortLandscape
      ? (whyOpen ? 0.75 : 0.7) * vh
      : (whyOpen ? 0.85 : 0.72) * vh;
    setSheetHeight(Math.min(contentH, cap));
  }, [infoOpen, whyOpen, isMobile, infoMeta, whyBuilt, infoLink]);

  // After Why expands, keep its body in view inside the sheet without a
  // manual scroll when content hits the 85dvh cap.
  useLayoutEffect(() => {
    if (!whyOpen || !isMobile || !whySectionRef.current) return;
    const id = requestAnimationFrame(() => {
      whySectionRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [whyOpen, isMobile, sheetHeight, reduced]);

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
        // Large variant: dismiss the info overlay first, then the dialog.
        if (isLarge && infoOpenRef.current) {
          setInfoOpen(false);
          return;
        }
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
    const html = document.documentElement;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      overscroll: body.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyBg: body.style.backgroundColor,
      htmlBg: html.style.backgroundColor,
      htmlScheme: html.style.colorScheme,
      bodyScheme: body.style.colorScheme,
    };

    // Pin left/right (not only width:100%) so the fixed flex body can't pick
    // a stale static position and shift the grid under the backdrop blur.
    // paddingRight replaces the disappearing scrollbar so column widths stay put.
    // Lock color-scheme to the live data-theme so the browser canvas cannot
    // paint the opposite theme behind project cards / the CD plate.
    // overflow + overscroll on html/body block background scroll and the
    // rubber-band that can show a second scrollbar behind the modal.
    const scheme = html.getAttribute("data-theme") === "light" ? "light" : "dark";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "auto";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.backgroundColor = "var(--color-bg)";
    html.style.backgroundColor = "var(--color-bg)";
    html.style.colorScheme = scheme;
    body.style.colorScheme = scheme;
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    document.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      body.style.overscrollBehavior = prev.overscroll;
      body.style.paddingRight = prev.paddingRight;
      body.style.backgroundColor = prev.bodyBg;
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      html.style.backgroundColor = prev.htmlBg;
      html.style.colorScheme = prev.htmlScheme;
      body.style.colorScheme = prev.bodyScheme;
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
      document.removeEventListener("keydown", onKeyDown);
      (triggerElRef.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [open, onClose, isLarge]);

  if (typeof document === "undefined") return null;

  // Large dimensions / mobile full-screen live in `.project-popup-panel--large`
  // so a max-width media query can override them (inline width/radius would win).
  const panelStyle: CSSProperties = isLarge
    ? {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: panelBg,
        colorScheme: "inherit",
        boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
        outline: "none",
        position: "relative",
      }
    : {
        width: `min(${maxWidth}px, 100%)`,
        // Leave a slim margin so the panel fills more of the viewport
        // across breakpoints without scraping the edges.
        maxHeight: "calc(100dvh - 2 * clamp(12px, 2.2vw, 20px))",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: panelBg,
        colorScheme: "inherit",
        borderRadius: "var(--radius-panel)",
        border: "1px solid var(--color-border-subtle)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
        outline: "none",
      };

  const closeButton = (
    <button
      className="popup-close-btn"
      onClick={() => {
        // Large variant: dismiss the info sheet first (matches Esc / scrim),
        // then close the dialog on a second tap.
        if (isLarge && infoOpenRef.current) {
          setInfoOpen(false);
          return;
        }
        onClose();
      }}
      aria-label={isLarge && infoOpen ? "Close project info" : "Close"}
      title="Close"
    >
      <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="2" y1="2" x2="14" y2="14" />
        <line x1="14" y1="2" x2="2" y2="14" />
      </svg>
    </button>
  );

  const infoButton = (
    <button
      type="button"
      className="popup-info-btn"
      onClick={() => setInfoOpen((v) => !v)}
      aria-label={infoOpen ? "Hide project info" : "Show project info"}
      aria-expanded={infoOpen}
      aria-controls={infoPanelId}
      title="Info"
    >
      <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="7.25" x2="8" y2="11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.85" fill="currentColor" />
      </svg>
    </button>
  );

  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: backdropEnter, ease: EASE_OPACITY } }}
          exit={{ opacity: 0, transition: { duration: backdropExit, ease: EASE_EXIT } }}
          onClick={onClose}
            className={isLarge ? "project-popup-backdrop project-popup-backdrop--large" : undefined}
          style={
            isLarge
              ? {
                  // Positioning/size live in `.project-popup-backdrop--large`
                  // (100vw × 100dvh) so scrollbar-gutter on html cannot leave a
                  // strip outside inset:0. Shared chrome only here.
                  zIndex: 999998,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  overscrollBehavior: "none",
                }
              : {
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
                  padding: "clamp(12px, 2.2vw, 20px)",
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  overscrollBehavior: "none",
                }
          }
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className={isLarge ? "project-popup-panel project-popup-panel--large" : undefined}
            // Opacity + y only, deliberately no scale — matches
            // PS3ControlPanel's own panel-open language (ExpandSection:
            // max-height + opacity, no scale) rather than a card-hover-press
            // treatment, and keeps the panel's actual box size constant
            // throughout so embeds inside it (CDPlayer's ResizeObserver)
            // never see a spurious resize mid-animation. Asymmetric timing —
            // slower open, snappier close — mirrors that same precedent
            // (320ms/220ms open vs 240ms/160ms close there).
            initial={{ opacity: 0, transform: `translateY(${panelY}px)` }}
            animate={{ opacity: 1, transform: "translateY(0px)", transition: { duration: panelEnter, ease: EASE_OPACITY } }}
            exit={{ opacity: 0, transform: `translateY(${panelY}px)`, transition: { duration: panelExit, ease: EASE_EXIT } }}
            style={panelStyle}
          >
            {!isLarge && (
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px 16px 0", flexShrink: 0 }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>{title}</p>
                  {sub && (
                    <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" }}>{sub}</p>
                  )}
                </div>
                {closeButton}
              </div>
            )}

            {isLarge && (
              // Title tab above the iframe — info icon lives here as its
              // standard spot (restored from the pre-floating chrome design).
              <div className="project-popup-topbar project-popup-topbar--large">
                <div className="project-popup-topbar-title">
                  <p>{title}</p>
                </div>
                <div className="project-popup-topbar-actions">
                  {infoButton}
                  {closeButton}
                </div>
              </div>
            )}

            <div
              className={isLarge ? "project-popup-body project-popup-body--large" : undefined}
              style={{
                padding: isLarge ? 0 : 16,
                // basis auto (not 0) so preferred child heights size the panel
                // when it only has maxHeight; minHeight 0 still lets embeds
                // shrink once the panel hits the viewport cap.
                flex: "1 1 auto",
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {children}

              <AnimatePresence>
                {isLarge && infoOpen && (
                  <>
                    <motion.button
                      key="info-scrim"
                      type="button"
                      className="project-popup-info-scrim"
                      aria-label="Dismiss project info"
                      onClick={() => {
                        setSheetDragY(0);
                        setInfoOpen(false);
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: scrimDuration, ease: EASE_OPACITY } }}
                      exit={{ opacity: 0, transition: { duration: scrimDuration, ease: EASE_EXIT } }}
                    />
                    <motion.div
                      key="info-panel"
                      ref={infoPanelRef}
                      id={infoPanelId}
                      className="project-popup-info"
                      role="region"
                      aria-label="Project details"
                      data-why-open={whyOpen ? "true" : "false"}
                      initial={{ opacity: 0, y: infoY }}
                      animate={{
                        opacity: 1,
                        y: isMobile ? sheetDragY : 0,
                        ...(isMobile && sheetHeight != null ? { height: sheetHeight } : {}),
                        transition: sheetDragY > 0
                          ? { duration: 0 }
                          : {
                              opacity: { duration: infoDuration, ease: EASE_OPACITY },
                              y: { duration: infoDuration, ease: EASE_OPACITY },
                              height: { duration: sheetDuration, ease: EASE_OPACITY },
                            },
                      }}
                      exit={{
                        opacity: 0,
                        y: infoY,
                        transition: {
                          opacity: { duration: infoDuration, ease: EASE_EXIT },
                          y: { duration: infoDuration, ease: EASE_EXIT },
                        },
                      }}
                    >
                      {isMobile && (
                        <div
                          className="project-popup-info-handle"
                          aria-hidden
                          onPointerDown={(e) => {
                            if (e.button != null && e.button !== 0) return;
                            sheetDragRef.current = { startY: e.clientY, dragging: true };
                            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                          }}
                          onPointerMove={(e) => {
                            const drag = sheetDragRef.current;
                            if (!drag?.dragging) return;
                            const dy = Math.max(0, e.clientY - drag.startY);
                            setSheetDragY(dy);
                          }}
                          onPointerUp={(e) => {
                            const drag = sheetDragRef.current;
                            sheetDragRef.current = null;
                            if (!drag?.dragging) return;
                            const dy = Math.max(0, e.clientY - drag.startY);
                            if (dy > 64) {
                              setSheetDragY(0);
                              setInfoOpen(false);
                            } else {
                              setSheetDragY(0);
                            }
                          }}
                          onPointerCancel={() => {
                            sheetDragRef.current = null;
                            setSheetDragY(0);
                          }}
                        >
                          <span className="project-popup-info-handle-bar" />
                        </div>
                      )}
                      <div className="project-popup-info-inner" ref={infoInnerRef}>
                        {infoMeta && infoMeta.length > 0 && (
                          <dl className="project-popup-spec">
                            {infoMeta.map(({ label, values }) => (
                              <div key={label} className="project-popup-spec-row">
                                <dt className="project-popup-spec-label">{label}</dt>
                                {values.map((v) => (
                                  <dd key={v} className="project-popup-spec-value">
                                    {v}
                                  </dd>
                                ))}
                              </div>
                            ))}
                          </dl>
                        )}
                        {infoLink && (
                          <a
                            className="project-popup-info-link"
                            href={infoLink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="project-popup-info-link-text">{infoLink.label}</span>
                            <svg className="project-popup-info-link-icon" viewBox="0 0 12 12" width={10} height={10} fill="none" aria-hidden>
                              <path d="M3.5 2.5H9.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                          </a>
                        )}
                        <details
                          ref={whySectionRef}
                          className="project-popup-why"
                          open={whyOpen}
                          onToggle={(e) => setWhyOpen((e.target as HTMLDetailsElement).open)}
                        >
                          <summary>
                            <span className="project-popup-why-chevron" aria-hidden>
                              <svg viewBox="0 0 12 12" width={10} height={10} fill="none">
                                <path d="M4.25 2.5L7.75 6L4.25 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <span className="project-popup-why-label">Why I built it</span>
                          </summary>
                          <p>{whyBuilt}</p>
                        </details>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {!isLarge && (description || (tools && tools.length > 0)) && (
              <div style={{ padding: "0 16px 16px", flexShrink: 0 }}>
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
