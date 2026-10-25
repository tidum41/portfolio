"use client";

import { useEffect, useRef } from "react";
import { cardFocusController } from "@/lib/cardFocusController";

/** Wires the shared card-focus controller to the portfolio grid once. */
export default function CardFocusGrid({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!cardFocusController.enabled()) return;

    cardFocusController.mount(grid);
    (window as Window & { __cardFocusReady?: boolean }).__cardFocusReady = true;

    return () => {
      cardFocusController.unmount();
      (window as Window & { __cardFocusReady?: boolean }).__cardFocusReady = false;
    };
  }, []);

  return (
    <section
      ref={gridRef}
      aria-label="Portfolio"
      className="project-grid portfolio-grid"
      style={{
        paddingTop: "var(--space-5)",
        /* 120px above the footer on home: 72 here + the wrap's 48. */
        paddingBottom: 72,
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(1px, 1fr))",
        gap: "var(--grid-gutter)",
        alignItems: "start",
      }}
    >
      {children}
    </section>
  );
}
