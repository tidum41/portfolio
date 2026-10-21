import DialogueProductScenario, {
  type DialogueProductScenario as Scenario,
} from "@/components/dialogue/product/DialogueProductScenario";

type Props = {
  scenario: Scenario;
  title: string;
  assetId?: string;
  className?: string;
};

/** In-page Dialogue product UI (no iframe). */
export default function DialogueProductFigure({ scenario, title, assetId, className }: Props) {
  return (
    <div
      className={["dialogue-product-block", className].filter(Boolean).join(" ")}
      data-dialogue-asset-id={assetId}
      aria-label={title}
    >
      <DialogueProductScenario scenario={scenario} />
    </div>
  );
}
