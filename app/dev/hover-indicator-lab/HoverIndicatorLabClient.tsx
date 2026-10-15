"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LabDemoCard from "./LabDemoCard";
import "./hilab.css";
import type { DockPlacementMode, LabProject } from "./types";

const PLACEMENTS: { id: DockPlacementMode; label: string }[] = [
  { id: "anchored", label: "Anchored" },
  { id: "cursor-follow", label: "Cursor follow" },
];

export default function HoverIndicatorLabClient({ projects }: { projects: LabProject[] }) {
  const [dockPlacement, setDockPlacement] = useState<DockPlacementMode>("anchored");

  useEffect(() => {
    document.documentElement.setAttribute("data-hilab", "");
    return () => {
      document.documentElement.removeAttribute("data-hilab");
    };
  }, []);

  return (
    <div className="hilab-root">
      <div className="hilab-toolbar" aria-label="Lab controls">
        <div className="hilab-seg" role="tablist" aria-label="Tooltip placement">
          {PLACEMENTS.map((p) => {
            const selected = dockPlacement === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className="hilab-seg__btn"
                data-selected={selected ? "true" : "false"}
                onClick={() => setDockPlacement(p.id)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <ThemeToggle />
      </div>

      <div className="hilab-canvas">
        {projects.length === 0 ? (
          <p className="hilab-empty">No project thumbnails loaded.</p>
        ) : (
          <div className="hilab-grid">
            {projects.map((p) => (
              <LabDemoCard key={`${p.id}-${p.kind}`} project={p} dockPlacement={dockPlacement} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
