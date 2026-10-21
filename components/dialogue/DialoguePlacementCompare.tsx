"use client";

import { useState } from "react";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";

const OPTIONS = [
  {
    id: "sidebar" as const,
    title: "Docked sidebar",
    costLine:
      "Always on screen, but it eats study canvas and stays in the way when you are watching a clip.",
    scenario: "placement-docked" as const,
    assetId: "D-13",
  },
  {
    id: "bubble" as const,
    title: "Floating bubble",
    costLine:
      "Keeps the study page clear, but the chat is one tap away instead of always visible.",
    scenario: "placement-bubble" as const,
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
              <span className="dialogue-placement-compare__option-line">{opt.costLine}</span>
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
              <DialogueRachelFrame tone={opt.id === "bubble" ? "solution" : "problem"}>
                <DialogueProductFigure
                  scenario={opt.scenario}
                  title={opt.title}
                  assetId={opt.assetId}
                />
              </DialogueRachelFrame>
            </div>
          ))}
        </div>
      </div>
      <p className="dialogue-placement-compare__decision">
        Floating chat wins when the study page is the focus. The launcher stays in the corner when
        you minimize.
      </p>
      <p className="dialogue-placement-compare__tradeoff">
        The chat stays one tap away instead of always visible on the study canvas.
      </p>
    </div>
  );
}
