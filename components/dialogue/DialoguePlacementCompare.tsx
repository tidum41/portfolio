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

/** Two equal static frames. No tabs, no selected chrome. */
export default function DialoguePlacementCompare() {
  return (
    <div className="dialogue-placement-compare">
      <div className="dialogue-placement-compare__pair">
        {OPTIONS.map((opt) => (
          <div key={opt.id} className="dialogue-placement-compare__cell">
            <p className="dialogue-placement-compare__label">{opt.title}</p>
            <DialogueRachelFrame tone="system">
              <DialogueProductFigure
                scenario={opt.scenario}
                title={opt.title}
                assetId={opt.assetId}
              />
            </DialogueRachelFrame>
            <p className="dialogue-placement-compare__cost">{opt.costLine}</p>
          </div>
        ))}
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
