"use client";

import { useState, useEffect, useLayoutEffect as _useLayoutEffect, useCallback, useRef, useMemo } from "react";

// SSR-safe useLayoutEffect, matching the pattern used elsewhere in this codebase.
const useLayoutEffect = typeof window !== "undefined" ? _useLayoutEffect : useEffect;

interface TocItem {
  id: string;
  label: string;
}

const COLOR_ACTIVE   = "var(--color-text-primary)";
const COLOR_INACTIVE = "var(--color-text-tertiary)";

const NO_TAP_HIGHLIGHT = {
  WebkitTapHighlightColor: "transparent",
} as const;

// Touch devices fire mouseenter on tap with no matching mouseleave, which
// would otherwise leave links/buttons stuck in their "hovered" color until
// the next tap elsewhere. Guard every hover-driven state set with this.
function canHover() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Desktop (>=1200) section rail. Back lives in the nav row (CaseStudyBack). */
export default function CaseStudyTOC({
  items = [],
}: {
  items?: TocItem[];
}) {
  const rafRef  = useRef<number | null>(null);
  // Defaults to the first section rather than "" — a fresh mount (client nav
  // or hard reload) is essentially always scrolled to the top, so this
  // matches what updateActive() would compute anyway. Without it, first
  // paint shows nothing highlighted, which is the other half of the flicker
  // the layout effect below can't reach (it only prevents flicker within the
  // client-side render/hydration pipeline, not the SSR-HTML-to-hydration gap
  // on a hard reload).
  const [activeSection,  setActiveSection]  = useState(() => items.find((s) => s.label.trim())?.label ?? "");
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
  // Below 1200 the aside is display:none, so this costs only a listener.
  useLayoutEffect(() => {

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
  }, [updateActive]);

  const scrollTo = (id: string, label: string) => {
    setActiveSection(label);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (activeSections.length === 0) return null;

  // Sticky sidebar (the aside owns the stick point)
  return (
    <div className="cs-toc-root">
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
    </div>
  );
}
