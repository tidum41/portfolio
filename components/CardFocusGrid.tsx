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

    const mo = new MutationObserver(() => {
      cardFocusController.observeNewVideos();
    });
    mo.observe(grid, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      cardFocusController.unmount();
    };
  }, []);

  return (
    <section
      ref={gridRef}
      aria-label="Portfolio"
      className="project-grid portfolio-grid"
      style={{
        paddingTop: "var(--space-5)",
        paddingBottom: "var(--space-8)",
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
