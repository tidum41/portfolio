"use client";

import { useState } from "react";
import DialogueReactFigure from "@/components/dialogue/DialogueReactFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";

const OPTIONS = [
  {
    id: "sidebar" as const,
    title: "Docked sidebar",
    priorityLine: "The priority is persistence over focus.",
    frameLabel: "Explored: docked sidebar",
    route: "section-6b",
    reflowMode: "placement" as const,
    assetId: "D-13",
  },
  {
    id: "bubble" as const,
    title: "Floating bubble",
    priorityLine: "The priority is focus over always-on chrome.",
    frameLabel: "Kept: floating bubble",
    route: "section-6",
    reflowMode: "placement" as const,
    assetId: "D-14",
  },
];

export default function DialoguePlacementCompare() {
  const [active, setActive] = useState<"sidebar" | "bubble">("bubble");
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
        <div className="dialogue-placement-compare__figures">
          {OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className="dialogue-placement-compare__figure"
              hidden={active !== opt.id}
            >
              <DialogueRachelFrame label={opt.frameLabel} tone="neutral">
                <DialogueReactFigure
                  exportRoute={opt.route}
                  title={opt.frameLabel}
                  assetId={opt.assetId}
                  reflowMode={opt.reflowMode}
                />
              </DialogueRachelFrame>
            </div>
          ))}
        </div>
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
