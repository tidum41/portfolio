type Props = {
  /** Interviews that support this answer, out of the 300 in the study. */
  count?: number;
  /** The group the count is out of, when it is not the whole study ("lapsed buyers", with of=63). */
  of?: number;
  group?: string;
};

/** Evidence footer. Every answer card keeps one (design/RULES.md). */
export default function EvidenceFooter({ count = 24, of = 300, group = "interviews" }: Props) {
  return (
    <div className="dp-evidence-footer" data-annotate-part="evidence-footer">
      <p className="dp-evidence-footer__text">Based on {count} of {of} {group}</p>
    </div>
  );
}
