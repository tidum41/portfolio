import { FOLLOW_UPS } from "@/lib/dialogue/product/sampleData";
import { annotateSlug } from "@/components/dialogue/annotate";

export default function FollowUpChips() {
  return (
    <div className="dp-followups" data-annotate-part="followups">
      {FOLLOW_UPS.map((label) => (
        <span key={label} className="dp-followup-btn" data-annotate-part={`followup-${annotateSlug(label)}`}>{label}</span>
      ))}
    </div>
  );
}
