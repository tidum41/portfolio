type Props = {
  /** Interviews that support this answer, out of the 300 in the study. */
  count?: number;
};

/** Evidence footer. Every answer card keeps one (design/RULES.md). */
export default function EvidenceFooter({ count = 24 }: Props) {
  return (
    <div className="dp-evidence-footer" data-annotate-part="evidence-footer">
      <p className="dp-evidence-footer__text">Based on {count} of 300 interviews</p>
    </div>
  );
}
