"use client";

import { useState } from "react";
import DialogueLiveFigure from "@/components/dialogue/DialogueLiveFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";

const OPTIONS = [
  {
    id: "sidebar" as const,
    title: "Docked sidebar",
    priorityLine: "The priority is persistence over focus.",
    frameLabel: "Explored: docked sidebar",
    route: "section-6b",
    assetId: "D-13",
  },
  {
    id: "bubble" as const,
    title: "Floating bubble",
    priorityLine: "The priority is focus over always-on chrome.",
    frameLabel: "Kept: floating bubble",
    route: "section-6",
    assetId: "D-14",
  },
];

export default function DialoguePlacementCompare() {
  const [active, setActive] = useState<"sidebar" | "bubble">("bubble");
  const current = OPTIONS.find((o) => o.id === active) ?? OPTIONS[1];

  return (
    <div className="dialogue-placement-compare">
      <div className="dialogue-placement-compare__layout">
        <div
          className="dialogue-placement-compare__options"
          role="tablist"
          aria-label="Placement options"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active === opt.id}
              className={[
                "dialogue-placement-compare__option",
                active === opt.id ? "dialogue-placement-compare__option--active" : "",
              ].join(" ")}
              onClick={() => setActive(opt.id)}
            >
              <span className="dialogue-placement-compare__option-title">{opt.title}</span>
              <span className="dialogue-placement-compare__option-line">{opt.priorityLine}</span>
            </button>
          ))}
        </div>
        <DialogueRachelFrame label={current.frameLabel} tone="neutral">
          <DialogueLiveFigure
            exportRoute={current.route}
            title={current.frameLabel}
            tier="full"
            assetId={current.assetId}
          />
        </DialogueRachelFrame>
      </div>
      <p className="dialogue-placement-compare__decision">
        Decision: Instead of a docked sidebar, I kept the floating chat.
      </p>
      <p className="dialogue-placement-compare__tradeoff">
        The tradeoff is the chat stays one tap away instead of always visible on the study canvas.
      </p>
    </div>
  );
}
