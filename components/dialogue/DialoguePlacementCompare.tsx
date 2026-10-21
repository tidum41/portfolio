"use client";

import { useState } from "react";
import DialogueLiveFigure from "@/components/dialogue/DialogueLiveFigure";

const OPTIONS = [
  { id: "sidebar", label: "Explored: docked sidebar", route: "section-6b" },
  { id: "bubble", label: "Kept: floating bubble", route: "section-6" },
] as const;

export default function DialoguePlacementCompare() {
  const [active, setActive] = useState<"sidebar" | "bubble">("bubble");
  const current = OPTIONS.find((o) => o.id === active) ?? OPTIONS[1];

  return (
    <div className="dialogue-placement-compare">
      <div className="dialogue-placement-compare__tabs" role="tablist" aria-label="Placement options">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active === opt.id}
            className={[
              "dialogue-placement-compare__tab",
              active === opt.id ? "dialogue-placement-compare__tab--active" : "",
            ].join(" ")}
            onClick={() => setActive(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="cs-figure-media dialogue-live-figure-shell">
        <DialogueLiveFigure
          exportRoute={current.route}
          title={current.label}
          tier="full"
          assetId={active === "sidebar" ? "D-13" : "D-14"}
        />
      </div>
      <p className="cs-figcaption">{current.label}</p>
    </div>
  );
}
