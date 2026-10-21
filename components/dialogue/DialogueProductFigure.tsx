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

const CHAT_W = 392;
const ANATOMY_W = 562;
const FULL_ANSWER_W = 742;

function scaleProps(scenario: Scenario): { innerWidth: number; maxScale?: number } | null {
  if (scenario === "placement-docked" || scenario === "placement-bubble") return null;
  if (typeof scenario === "object" && "gallery" in scenario) {
    return { innerWidth: CHAT_W };
  }
  switch (scenario) {
    case "hero":
      return { innerWidth: 822 };
    case "anatomy":
      return { innerWidth: ANATOMY_W };
    case "full-answer":
      return { innerWidth: FULL_ANSWER_W };
    case "clip-player":
    case "problem-paragraphs":
    case "decision-paragraphs":
    case "decision-quotes":
    case "decision-structured":
      return { innerWidth: CHAT_W };
    default:
      return { innerWidth: CHAT_W };
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
