import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueRachelFrame, { DialogueCaption } from "@/components/dialogue/DialogueRachelFrame";

const OPTIONS = [
  {
    id: "sidebar" as const,
    title: "Docked sidebar",
    sentence:
      "Always on screen, but it eats study canvas and stays in the way when you are watching a clip.",
    scenario: "placement-docked" as const,
    assetId: "D-13",
  },
  {
    id: "bubble" as const,
    title: "Floating bubble",
    sentence: "Study canvas stays full size; chat floats over it until you minimize.",
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
            <DialogueRachelFrame tone="system">
              <DialogueProductFigure
                scenario={opt.scenario}
                title={opt.title}
                assetId={opt.assetId}
              />
            </DialogueRachelFrame>
            <DialogueCaption
              label={opt.title}
              sentence={"sentence" in opt ? opt.sentence : undefined}
            />
          </div>
        ))}
      </div>
      <p className="dialogue-placement-compare__decision">
        Floating chat wins when the study page is the focus. The launcher stays in the corner when
        you minimize.
      </p>
    </div>
  );
}
