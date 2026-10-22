import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import CoverageCallout from "@/components/dialogue/product/CoverageCallout";

/** Timestamp owners follow the DLG-48 map: Marcus W. owns 21:08, Hannah L. owns 22:41. */
export default function ThinDataFigure() {
  return (
    <StudyChatShell compact hideHeader hideComposer>
      <UserMessageBubble>Why do people hesitate at payment?</UserMessageBubble>
      <CoverageCallout headline="2 of 24 interviews" detail="Only a few interviews match." />
      <p className="dp-summary dp-text-body">
        Two interviews mention payment retry. Treat it as a lead, not a trend.
      </p>
      <div className="dp-sources" aria-hidden>
        <span className="dp-source-pill">Marcus W., 21:08</span>
        <span className="dp-source-pill">Hannah L., 22:41</span>
      </div>
      <p className="dp-chart-held-note">
        When few interviews match, the answer leads with the count and holds the chart back.
      </p>
    </StudyChatShell>
  );
}
