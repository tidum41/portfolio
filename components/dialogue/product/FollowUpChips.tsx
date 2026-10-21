import { FOLLOW_UPS } from "@/lib/dialogue/product/sampleData";

export default function FollowUpChips() {
  return (
    <div className="dp-followups">
      {FOLLOW_UPS.map((label) => (
        <span key={label} className="dp-chip">{label}</span>
      ))}
    </div>
  );
}
