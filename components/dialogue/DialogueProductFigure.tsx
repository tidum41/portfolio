import DialogueProductScenario, {
  type DialogueProductScenario as Scenario,
} from "@/components/dialogue/product/DialogueProductScenario";
import ScaledChatViewport from "@/components/dialogue/product/ScaledChatViewport";
type Props = {
  scenario: Scenario;
  title: string;
  assetId?: string;
  className?: string;
};

/** Live study-chat panel width (t384: ~447.78px → 448). */
const CHAT_W = 448;
/** Callout rail 122 + gutter 48 + chat 448 */
const ANATOMY_W = 618;
/** Answer column + clip drawer cluster */
const FULL_ANSWER_W = 798;

function scaleProps(scenario: Scenario): { innerWidth: number; maxScale?: number } | null {
  if (scenario === "placement-docked" || scenario === "placement-bubble") return null;
  if (typeof scenario === "object" && "gallery" in scenario) {
    // Never upscale chart cards — keeps 1:1 axis/label proportions.
    return { innerWidth: CHAT_W, maxScale: 1 };
  }
  switch (scenario) {
    case "hero":
      // 448 chat + 14 gap + ~320 clips; allow scale-up so UI fills the 3:2 frame
      return { innerWidth: 782 };
    case "anatomy":
      // Centerpiece: fill the content width
      return { innerWidth: ANATOMY_W };
    case "full-answer":
      return { innerWidth: FULL_ANSWER_W, maxScale: 1 };
    case "clip-player":
    case "problem-paragraphs":
    case "decision-paragraphs":
    case "decision-quotes":
    case "decision-structured":
      return { innerWidth: CHAT_W, maxScale: 1 };
    default:
      return { innerWidth: CHAT_W, maxScale: 1 };
  }
}

/** In-page Dialogue product UI (no iframe). */
export default function DialogueProductFigure({ scenario, title, assetId, className }: Props) {
  const scale = scaleProps(scenario);
  const inner = (
    <DialogueProductScenario scenario={scenario} className={className} />
  );

  return (
    <div
      className="dialogue-product-block dialogue-product-block--static"
      data-dialogue-asset-id={assetId}
      aria-label={title}
      aria-hidden
      // Remove from tab order / hit-testing; figures are decorative in the case study.
      inert
    >
      {scale ? (
        <ScaledChatViewport innerWidth={scale.innerWidth} maxScale={scale.maxScale}>
          {inner}
        </ScaledChatViewport>
      ) : (
        inner
      )}
    </div>
  );
}
