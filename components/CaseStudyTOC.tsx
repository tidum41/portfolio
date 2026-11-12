"use client";

import { useState, useEffect, useLayoutEffect as _useLayoutEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { markInstantBack } from "@/lib/instantNav";

// SSR-safe useLayoutEffect, matching the pattern used elsewhere in this codebase.
const useLayoutEffect = typeof window !== "undefined" ? _useLayoutEffect : useEffect;

interface TocItem {
  id: string;
  label: string;
}

const COLOR_ACTIVE   = "var(--color-text-primary)";
const COLOR_INACTIVE = "var(--color-text-tertiary)";
const COLOR_HOVER    = "var(--color-text-primary)";

const NO_TAP_HIGHLIGHT = {
  WebkitTapHighlightColor: "transparent",
} as const;

// Touch devices fire mouseenter on tap with no matching mouseleave, which
// would otherwise leave links/buttons stuck in their "hovered" color until
// the next tap elsewhere. Guard every hover-driven state set with this.
function canHover() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export default function CaseStudyTOC({
  items = [],
  backHref = "/",
  /** Always render the mobile back chevron (used in the content-lane slot). */
  mobileBackOnly = false,
}: {
  items?: TocItem[];
  backHref?: string;
  mobileBackOnly?: boolean;
}) {
  const router  = useRouter();
  const rafRef  = useRef<number | null>(null);
  // Defaults to the first section rather than "" — a fresh mount (client nav
  // or hard reload) is essentially always scrolled to the top, so this
  // matches what updateActive() would compute anyway. Without it, first
  // paint shows nothing highlighted, which is the other half of the flicker
  // the layout effect below can't reach (it only prevents flicker within the
  // client-side render/hydration pipeline, not the SSR-HTML-to-hydration gap
  // on a hard reload).
  const [activeSection,  setActiveSection]  = useState(() => items.find((s) => s.label.trim())?.label ?? "");
  const [isMobile,       setIsMobile]       = useState(false);
  const [backHovered,    setBackHovered]    = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const activeSections = useMemo(() => items.filter((s) => s.label.trim()), [items]);

  const updateActive = useCallback(() => {
    const target = window.innerHeight * 0.5;
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;

    if (nearBottom && activeSections.length > 0) {
      const last = activeSections[activeSections.length - 1].label;
      setActiveSection((prev) => (prev !== last ? last : prev));
      return;
    }

    let current = "";
    activeSections.forEach(({ id, label }) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= target) current = label;
    });
    if (!current && activeSections.length > 0) {
      current = activeSections[0].label;
    }
    if (current) {
      setActiveSection((prev) => (prev !== current ? current : prev));
    }
  }, [activeSections]);

  // Layout effect (not a regular effect) so the initial `updateActive()` call
  // resolves the correct active section synchronously, before the browser
  // paints — a regular effect runs after paint, so the TOC would render with
  // nothing highlighted for one frame, then visibly snap to the right item
  // once the effect caught up. That was the flicker on page load.
  // Skipped for the mobile-back-only instance or when on mobile.
  useLayoutEffect(() => {
    if (mobileBackOnly || isMobile) return;

    // Synchronous initial calculation before paint to avoid first-frame flicker
    updateActive();

    const handleScrollOrResize = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateActive();
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [updateActive, mobileBackOnly, isMobile]);

  useEffect(() => {
    if (mobileBackOnly) return;
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check, { passive: true });
    check();
    return () => window.removeEventListener("resize", check);
  }, [mobileBackOnly]);

  const scrollTo = (id: string, label: string) => {
    setActiveSection(label);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Instant, in-place back: skip the hard reload + fade, restore prior scroll.
  // Always `push` with `{ scroll: false }` rather than `router.back()` — Next's
  // App Router does its own scroll-to-top on *any* navigation it manages,
  // including back/forward, and since PersistentWorkShell is a persistently-
  // mounted root-level component (not a normal per-route tree Next tracks a
  // scroll position for), that built-in reset fires after our own manual
  // scrollYRef restoration and wins, snapping back to the top regardless.
  // `{ scroll: false }` is the documented escape hatch that tells Next to
  // leave scroll handling to the page entirely, so PersistentWorkShell's own
  // instant restore is the only thing touching scroll position.
  const handleBack = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    markInstantBack();
    router.push(backHref, { scroll: false });
  }, [router, backHref]);

  /** Shared chevron for mobile + desktop. Tight 8x12 canvas so the ink is
      the box: no built-in icon padding, stroke matched to the 14px label.
      Points span 9 of the 12 tall canvas (1.5 to 10.5), so the rendered ink
      is about 10.5px against the label's 10px cap height, a half pixel of
      overshoot, with its centre on the cap centre at the +0.125px offset
      in globals.css. Calibrated at 4x against Helvetica Neue. */
  const backArrow = (
    <svg
      className="cs-back-arrow"
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="7 1.5 1.5 6 7 10.5" />
    </svg>
  );

  if (mobileBackOnly || isMobile) {
    return (
      <a
        href={backHref}
        onClick={handleBack}
        onMouseEnter={() => { if (canHover()) setBackHovered(true); }}
        onMouseLeave={() => setBackHovered(false)}
        className="cs-back-mobile"
        aria-label="Back to work"
        style={{
          ...NO_TAP_HIGHLIGHT,
          display: "inline-flex", alignItems: "center", justifyContent: "flex-start",
          gap: 6,
          minWidth: 44, minHeight: 44,
          margin: 0,
          padding: "0 8px 0 0",
          color: backHovered ? COLOR_ACTIVE : COLOR_INACTIVE,
          transition: "color 0.2s ease",
          textDecoration: "none",
        }}
      >
        {backArrow}
        <span className="cs-back-mobile-label">Back</span>
      </a>
    );
  }

  // Desktop: sticky sidebar (in-flow Back; aside sticky owns stick point)
  return (
    <div className="cs-toc-root">
      {/* Back — content-width hit area (min 44×44), not full aside column */}
      <a
        href={backHref}
        onClick={handleBack}
        onMouseEnter={() => { if (canHover()) setBackHovered(true); }}
        onMouseLeave={() => setBackHovered(false)}
        className="cs-back-desktop"
        aria-label="Back to work"
        style={{
          ...NO_TAP_HIGHLIGHT,
          // Layout (inline-flex, flex-start, 44×44, marginBottom 16) lives on .cs-back-desktop
          color: backHovered ? COLOR_ACTIVE : COLOR_INACTIVE,
          transition: "color 0.2s ease",
          textDecoration: "none",
        }}
      >
        {backArrow}
        <span className="cs-back-desktop-label">Back</span>
      </a>

      {activeSections.length > 0 && (
        <nav className="cs-toc-nav" aria-label="Table of contents">
          <div className="cs-toc-stack">
            {activeSections.map(({ id, label }) => {
              const isActive  = activeSection === label;
              const isHovered = hoveredSection === label;
              return (
                <button
                  key={label}
                  className="cs-toc-label"
                  onClick={() => scrollTo(id, label)}
                  onMouseEnter={() => { if (canHover()) setHoveredSection(label); }}
                  onMouseLeave={() => setHoveredSection(null)}
                  style={{
                    ...NO_TAP_HIGHLIGHT,
                    background: "none", border: "none", padding: 0,
                    cursor: "pointer", textAlign: "left",
                    color: (isActive || isHovered) ? COLOR_ACTIVE : COLOR_INACTIVE,
                    fontWeight: isActive ? 500 : 400,
                    transition: "color 0.15s ease, font-weight 0.15s ease",
                    whiteSpace: "normal",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
