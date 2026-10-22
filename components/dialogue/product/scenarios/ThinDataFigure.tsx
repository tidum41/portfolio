import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { InfoCircleIcon } from "@/components/dialogue/product/icons";

/** f6a5192 low-signal answer: amber lead warning, clip link, next-study action, evidence footer. */
export default function ThinDataFigure() {
  return (
    <StudyChatShell compact hideHeader hideComposer evidence={4}>
      <UserMessageBubble>Why did people abandon on mobile?</UserMessageBubble>
      <p className="dp-summary dp-text-body" data-annotate-part="summary">
        On mobile, several participants bailed when Autofill skipped the apartment field and
        validation fired late.
      </p>
      <div className="dp-low-signal" data-annotate-part="low-signal-note">
        <InfoCircleIcon className="dp-low-signal__icon" />
        <p className="dp-low-signal__text">Only 4 of 24 interviews mention this. Treat it as a lead.</p>
      </div>
      <p className="dp-clips-link" data-annotate-part="clips-link">View 1 clip</p>
      <div className="dp-next-study" data-annotate-part="next-study-button">Ask this next study</div>
    </StudyChatShell>
  );
}
