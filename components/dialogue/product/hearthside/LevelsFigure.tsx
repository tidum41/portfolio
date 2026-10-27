import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import { FRIDAY_FINDING, FRIDAY_QUESTION, FRIDAY_QUOTES } from "@/lib/dialogue/product/hearthside";

const SPECIMENS = [
  {
    id: "text",
    label: "Text only",
    cost: "Simple text is condensed and easy to understand, but allows no further interaction.",
  },
  {
    id: "quotes",
    label: "Direct quotes",
    cost: "Verbatim responses help, but may not give a higher-level overview.",
  },
  {
    id: "evidence",
    label: "Answer and evidence",
    cost: "An easier-to-glance data viz with embedded responses to view directly.",
  },
] as const;

function SpecimenBody({ id }: { id: (typeof SPECIMENS)[number]["id"] }) {
  if (id === "text") {
    return (
      <div className="dp-lead-answer-card dp-lead-answer-card--paragraphs">
        <div className="dp-lead-answer-card__prose dp-text-prose-sm">
          <p>{FRIDAY_FINDING}</p>
        </div>
      </div>
    );
  }
  if (id === "quotes") {
    return (
      <div className="dp-lead-answer-card dp-lead-answer-card--quotes">
        <div className="dp-clip-quotes">
          {FRIDAY_QUOTES.map((q) => (
            <QuoteCardH key={q.name} quote={q} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="dp-lead-answer-card dp-lead-answer-card--structured">
      <p className="dp-hs-count-line">18 of 24</p>
      <div className="dp-levels__mini-bar">
        <ChartStackedBar
          total={24}
          segments={[
            { label: "Read it as this Friday", value: 18, display: "18 of 24", focal: true },
            { label: "Did not", value: 6, display: "6 of 24" },
          ]}
        />
      </div>
      <p className="dp-hs-mini-legend">18 of 24 read it as this Friday. 6 of 24 did not.</p>
      <QuoteCardH quote={FRIDAY_QUOTES[0]} />
      <div className="dp-hs-thumb dp-hs-thumb--levels" data-annotate-part="levels-clip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/dev/dialogue-static/clip-photos/clip-01.jpg" alt="" className="dp-hs-thumb__img" />
        <span className="dp-hs-thumb__time">18:27</span>
      </div>
    </div>
  );
}

/** The same answer at three depths. Equal-height specimens, 2+1 at desktop,
    a scroll row on phones. All three share the page's light treatment. */
export default function LevelsFigure() {
  return (
    <div className="dp-levels">
      <div
        className={`dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName} dp-levels__question`}
      >
        <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
      </div>
      <div className="dp-levels__row">
        {SPECIMENS.map((s) => (
          <div key={s.id} className="dp-levels__panel">
            {s.id === "evidence" ? (
              <p className="dialogue-lead-answer__chosen-row">
                <span className="dialogue-lead-answer__chosen-badge">Chosen</span>
              </p>
            ) : (
              <p className="dialogue-lead-answer__chosen-row dialogue-lead-answer__chosen-row--spacer" aria-hidden />
            )}
            <div
              className={[
                "dp-levels__card dialogue-product-root dp-chat-panel-typography",
                dialogueProductFontClassName,
              ].join(" ")}
            >
              <SpecimenBody id={s.id} />
            </div>
            <p className="dp-levels__caption">
              <span className="dp-levels__label">{s.label}</span> {s.cost}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
