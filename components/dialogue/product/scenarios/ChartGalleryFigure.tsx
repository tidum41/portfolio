import LineChart from "@/components/dialogue/product/LineChart";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import { CHECKOUT_QUESTION, SENTIMENT_LINE } from "@/lib/dialogue/product/sampleData";

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
          <UserMessageBubble>{SENTIMENT_LINE.question}</UserMessageBubble>
          <QuerySearchStep searched={24} found={18} />
          <LineChart
            title={SENTIMENT_LINE.title}
            points={SENTIMENT_LINE.points}
            legend="Average sentiment score by prototype round"
          />
        </StudyChatShell>
      );
    case "funnel":
      return (
        <StudyChatShell>
          <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
          <QuerySearchStep searched={24} found={9} />
          <FunnelChart />
        </StudyChatShell>
      );
    case "segment":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>Which segment struggled with address validation?</UserMessageBubble>
          <QuerySearchStep searched={24} found={11} />
          <p className="dp-summary" style={{ fontSize: "var(--text-summary-size)" }}>
            Mobile participants reported autocomplete resets 2× more often.
          </p>
          <FunnelChart compact />
        </StudyChatShell>
      );
    case "distribution":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>How often did payment trust come up?</UserMessageBubble>
          <QuerySearchStep searched={24} found={14} />
          <div className="dp-funnel">
            {[
              { label: "Never", pct: 18 },
              { label: "Once", pct: 42 },
              { label: "2–3×", pct: 28 },
              { label: "4+×", pct: 12 },
            ].map((row) => (
              <div key={row.label} className="dp-funnel__row">
                <span className="dp-funnel__label">{row.label}</span>
                <div className="dp-funnel__track">
                  <div className="dp-funnel__bar-wrap">
                    <div className="dp-funnel__bar-inner">
                      <div
                        className="dp-funnel__bar"
                        style={{ width: `max(4px, calc(${row.pct}% - 2rem))` }}
                      />
                      <span className="dp-funnel__pct">{row.pct}%</span>
                      <div className="dp-funnel__bar-rest" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </StudyChatShell>
      );
    case "theme":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>Top themes in checkout frustration</UserMessageBubble>
          <QuerySearchStep searched={24} found={16} />
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
          <QuerySearchStep searched={24} found={12} />
          <LineChart
            title="Delivery fees spike after the cart step in round two."
            points={[
              { label: "Min 5", value: 2 },
              { label: "Min 12", value: 5 },
              { label: "Min 22", value: 9 },
              { label: "Min 31", value: 6 },
            ]}
            legend="Mentions of delivery fees across interview timeline"
          />
        </StudyChatShell>
      );
    case "coverage":
      return (
        <StudyChatShell>
          <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
          <QuerySearchStep searched={24} found={9} />
          <p className="dp-text-meta">18 of 24 participants mentioned address friction</p>
          <FunnelChart compact />
        </StudyChatShell>
      );
    default:
      return null;
  }
}
