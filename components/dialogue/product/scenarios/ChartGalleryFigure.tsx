import LineChart from "@/components/dialogue/product/LineChart";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_QUESTION } from "@/lib/dialogue/product/sampleData";

export type GalleryVariant =
  | "trend"
  | "funnel"
  | "segment"
  | "distribution"
  | "theme"
  | "quote-freq"
  | "timeline"
  | "coverage";

export default function ChartGalleryFigure({ variant }: { variant: GalleryVariant }) {
  switch (variant) {
    case "trend":
      return (
        <StudyChatShell>
          <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
          <LineChart />
        </StudyChatShell>
      );
    case "funnel":
      return (
        <StudyChatShell>
          <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
          <FunnelChart />
        </StudyChatShell>
      );
    case "segment":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>Which segment struggled with address validation?</UserMessageBubble>
          <p className="dp-summary" style={{ fontSize: 14 }}>Mobile participants reported autocomplete resets 2× more often.</p>
          <FunnelChart compact />
        </StudyChatShell>
      );
    case "distribution":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>How often did payment trust come up?</UserMessageBubble>
          <div className="dp-funnel">
            {[
              { label: "Never", pct: 18 },
              { label: "Once", pct: 42 },
              { label: "2–3×", pct: 28 },
              { label: "4+×", pct: 12 },
            ].map((row) => (
              <div key={row.label} className="dp-funnel__row">
                <div className="dp-funnel__row-main">
                  <span className="dp-funnel__label">{row.label}</span>
                  <div className="dp-funnel__bar-wrap">
                    <div className="dp-funnel__bar" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
                <span className="dp-funnel__pct">{row.pct}%</span>
              </div>
            ))}
          </div>
        </StudyChatShell>
      );
    case "theme":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>Top themes in checkout frustration</UserMessageBubble>
          <div className="dp-quote-list">
            {["Address validation", "Unexpected fees", "Saved payment"].map((t, i) => (
              <div key={t} className="dp-quote-item">
                <strong>{i + 1}. {t}</strong>
                Mentioned in {18 - i * 3} interviews
              </div>
            ))}
          </div>
        </StudyChatShell>
      );
    case "quote-freq":
      return <StructuredAnswerFigure compact showClips={false} />;
    case "timeline":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>When did participants mention delivery fees?</UserMessageBubble>
          <LineChart />
        </StudyChatShell>
      );
    case "coverage":
      return (
        <StudyChatShell>
          <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
          <p className="dp-text-meta">Coverage callout: 18 of 24 participants mentioned address friction</p>
          <FunnelChart compact />
        </StudyChatShell>
      );
    default:
      return null;
  }
}
