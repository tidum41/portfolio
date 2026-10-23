import { ExpandIcon } from "@/components/dialogue/product/icons";

type Props = {
  /** Interviews that support this answer, out of the 24 in the study. */
  count?: number;
  expand?: boolean;
};

/** Evidence footer. Every answer card keeps one (design/RULES.md). */
export default function EvidenceFooter({ count = 24, expand }: Props) {
  return (
    <div className="dp-evidence-footer" data-annotate-part="evidence-footer">
      <p className="dp-evidence-footer__text">Based on {count} of 24 interviews</p>
      {expand ? <ExpandIcon className="dp-evidence-footer__expand" /> : null}
    </div>
  );
}
