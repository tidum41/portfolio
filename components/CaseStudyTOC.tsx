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
  outline: "none",
} as const;

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
      setActiveSection(activeSections[activeSections.length - 1].label);
      return;
    }

    let current = "";
    activeSections.forEach(({ id, label }) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= target) current = label;
    });
    if (current) setActiveSection(current);
  }, [activeSections]);

  // Layout effect (not a regular effect) so the initial `updateActive()` call
  // resolves the correct active section synchronously, before the browser
  // paints — a regular effect runs after paint, so the TOC would render with
  // nothing highlighted for one frame, then visibly snap to the right item
  // once the effect caught up. That was the flicker on page load.
  // Skipped for the mobile-back-only instance (no section labels to track).
  useLayoutEffect(() => {
    if (mobileBackOnly) return;
    let lastScrollY = -1;

    const tick = () => {
      const y = window.scrollY;
      if (y !== lastScrollY) {
        lastScrollY = y;
        updateActive();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    updateActive();
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [updateActive, mobileBackOnly]);

  useEffect(() => {
    if (mobileBackOnly) return;
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
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

  // Tip sits at x≈1 so the stroke’s leftmost pixel lands on the content /
  // hero-media left edge when the parent has no negative margin.
  const backArrow = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="10 18 2 12 10 6" />
    </svg>
  );

  if (mobileBackOnly || isMobile) {
    return (
      <a
        href={backHref}
        onClick={handleBack}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        className="cs-back-mobile"
        aria-label="Back"
        style={{
          ...NO_TAP_HIGHLIGHT,
          display: "inline-flex", alignItems: "center", justifyContent: "flex-start",
          minWidth: 44, minHeight: 44,
          margin: 0,
          padding: 0,
          color: backHovered ? COLOR_ACTIVE : COLOR_INACTIVE,
          transition: "color 0.2s ease",
          textDecoration: "none",
        }}
      >
        {backArrow}
      </a>
    );
  }

  // Desktop: sticky sidebar
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Back button — inline-flex, narrow hit area */}
      <a
        href={backHref}
        onClick={handleBack}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        style={{
          ...NO_TAP_HIGHLIGHT,
          display: "flex", alignItems: "flex-start", gap: 2,
          minHeight: 40,
          marginLeft: 0,
          color: backHovered ? COLOR_ACTIVE : COLOR_INACTIVE,
          transition: "color 0.2s ease",
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        {backArrow}
        <span style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, lineHeight: 1.5 }}>Back</span>
      </a>

      {activeSections.length > 0 && (
        <nav aria-label="Table of contents">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeSections.map(({ id, label }) => {
              const isActive  = activeSection === label;
              const isHovered = hoveredSection === label;
              return (
                <button
                  key={label}
                  onClick={() => scrollTo(id, label)}
                  onMouseEnter={() => setHoveredSection(label)}
                  onMouseLeave={() => setHoveredSection(null)}
                  style={{
                    ...NO_TAP_HIGHLIGHT,
                    background: "none", border: "none", padding: 0,
                    cursor: "pointer", textAlign: "left",
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: 14, letterSpacing: "0.1px", lineHeight: 1.5,
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
