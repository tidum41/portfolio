"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

interface TocItem {
  id: string;
  label: string;
}

const COLOR_ACTIVE   = "var(--color-text-primary)";
const COLOR_INACTIVE = "var(--color-text-muted)";

const NO_TAP_HIGHLIGHT = {
  WebkitTapHighlightColor: "transparent",
  outline: "none",
} as const;

export default function CaseStudyTOC({
  items = [],
  backHref = "/",
}: {
  items?: TocItem[];
  backHref?: string;
}) {
  const rafRef  = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("");
  const [isMobile,      setIsMobile]      = useState(false);
  const [backHovered,   setBackHovered]   = useState(false);

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

  useEffect(() => {
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
  }, [updateActive]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    check();
    return () => window.removeEventListener("resize", check);
  }, []);

  const scrollTo = (id: string, label: string) => {
    setActiveSection(label);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const backArrow = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );

  if (isMobile) {
    return (
      <a
        href={backHref}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        style={{
          ...NO_TAP_HIGHLIGHT,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          minWidth: 44, minHeight: 44,
          marginLeft: -12, /* compensate so chevron visually aligns with content edge */
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
      {/* Back button — left-aligned with labels, wide hit area */}
      <a
        href={backHref}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        style={{
          ...NO_TAP_HIGHLIGHT,
          display: "flex", alignItems: "center",
          minHeight: 44,
          paddingRight: 16, /* extend hit area rightward toward nav labels */
          color: backHovered ? COLOR_ACTIVE : COLOR_INACTIVE,
          transition: "color 0.2s ease",
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        {backArrow}
      </a>

      {activeSections.length > 0 && (
        <nav aria-label="Table of contents">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeSections.map(({ id, label }) => {
              const isActive = activeSection === label;
              return (
                <button
                  key={label}
                  onClick={() => scrollTo(id, label)}
                  style={{
                    ...NO_TAP_HIGHLIGHT,
                    background: "none", border: "none", padding: 0,
                    cursor: "pointer", textAlign: "left",
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: 14, letterSpacing: "0.1px", lineHeight: 1.5,
                    color: isActive ? COLOR_ACTIVE : COLOR_INACTIVE,
                    fontWeight: 400,
                    transition: "color 0.2s ease, font-weight 0.2s ease",
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
