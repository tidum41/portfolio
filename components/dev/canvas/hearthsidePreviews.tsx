"use client";

import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { InfoCircleIcon } from "@/components/dialogue/product/icons";
import { THIN_FLAG, THIN_TIP } from "@/lib/dialogue/product/thinCopy";

function ProductRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className={`dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}>{children}</div>
  );
}

const SHARE = (n: number) => n.toLocaleString("en-US");

const HEARTHSIDE_CHIP_QUESTIONS = [
  "How do shoppers read \u2018Arrives by Friday\u2019?",
  "Do new and repeat shoppers read it the same way?",
  "What did shoppers ask for after checkout?",
  "Which delivery badge most changed confidence to add to cart?",
  "Did anyone miss a delivery over \u2018Arrives by Friday\u2019?",
] as const;

const ILLUSTRATIVE = "Illustrative data.";

const THIN_QUESTION = "Did anyone miss a delivery over \u2018Arrives by Friday\u2019?";

export function HearthsideStudyDefaultChipsPreview() {
  return (
    <ProductRoot>
      <StudyChatShell>
        <div className="dlg-live">
          <div className="dlg-empty">
            <p className="dlg-empty__lead">Ask questions across all 300 interviews.</p>
            {HEARTHSIDE_CHIP_QUESTIONS.map((q) => (
              <button key={q} type="button" className="dlg-suggest">
                + {q}
              </button>
            ))}
          </div>
        </div>
      </StudyChatShell>
    </ProductRoot>
  );
}

export function HearthsideCountSplitFridayPreview() {
  return (
    <ProductRoot>
      <AnswerCard still chart segment={false} />
      <p className="dp-text-body-sm" style={{ margin: "8px 0 0", color: "var(--dp-muted)" }}>
        {ILLUSTRATIVE}
      </p>
    </ProductRoot>
  );
}

const SEGMENT_COMPARE_TITLE =
  "New shoppers and repeat shoppers both often read it as this Friday; each count is out of its own group (9 of 14, 88 of 125).";

export function HearthsideSegmentComparePreview() {
  return (
    <ProductRoot>
      <ChartVizCard title={SEGMENT_COMPARE_TITLE} caption={ILLUSTRATIVE}>
        <ChartBarList
          max={1}
          rows={[
            { label: "New shoppers", value: 9 / 14, display: `${SHARE(9)} of ${SHARE(14)}`, focal: true },
            { label: "Repeat shoppers", value: 88 / 125, display: `${SHARE(88)} of ${SHARE(125)}`, secondary: true },
          ]}
        />
      </ChartVizCard>
    </ProductRoot>
  );
}

const RANKED_FINDING = "41 of 300 shoppers asked to show an exact calendar date.";

const RANKED_ROWS = [
  { label: "Show an exact calendar date", value: 41, focal: true },
  { label: "Say which Friday it means", value: 28 },
  { label: "Warn when Friday slips", value: 17 },
  { label: "Offer a pickup option", value: 11 },
  { label: "Email the day before", value: 8 },
] as const;

export function HearthsideRankedAfterCheckoutPreview() {
  return (
    <ProductRoot>
      <ChartVizCard title={RANKED_FINDING} caption={ILLUSTRATIVE}>
        <ChartBarList
          max={41}
          rows={RANKED_ROWS.map((row) => ({
            label: row.label,
            value: row.value,
            display: String(row.value),
            focal: "focal" in row && row.focal,
          }))}
        />
      </ChartVizCard>
    </ProductRoot>
  );
}

const BADGES_FINDING =
  "118 of 300 shoppers said \u2018Arrives by Friday\u2019 most changed their confidence to add to cart.";

const BADGE_ROWS = [
  { label: "A Arrives by Friday", value: 118, focal: true },
  { label: "B Free delivery over $50", value: 72 },
  { label: "C Free returns for 30 days", value: 110 },
] as const;

export function HearthsidePreferenceBadgesPreview() {
  return (
    <ProductRoot>
      <ChartVizCard title={BADGES_FINDING} caption={ILLUSTRATIVE}>
        <ChartBarList
          max={118}
          rows={BADGE_ROWS.map((row) => ({
            label: row.label,
            value: row.value,
            display: String(row.value),
            focal: "focal" in row && row.focal,
          }))}
        />
      </ChartVizCard>
    </ProductRoot>
  );
}

const THIN_REPEAT = { friday: 88, other: 37, of: 125 } as const;

export function HearthsideThinEarlySignalPreview() {
  const followTitle = `${THIN_REPEAT.friday} of ${THIN_REPEAT.of} repeat shoppers read \u2018Arrives by Friday\u2019 as this Friday.`;
  return (
    <ProductRoot>
      <StudyChatShell>
        <UserMessageBubble>{THIN_QUESTION}</UserMessageBubble>
        <div className="dp-low-signal">
          <span className="dlg-info" tabIndex={0} aria-describedby="canvas-thin-tip">
            <InfoCircleIcon className="dp-low-signal__icon" />
            <span id="canvas-thin-tip" role="tooltip" className="dp-hero-tooltip dlg-info__tip">
              {THIN_TIP}
            </span>
          </span>
          <p className="dp-low-signal__text">{THIN_FLAG}</p>
        </div>
        <ChartVizCard title={followTitle} caption={ILLUSTRATIVE}>
          <ChartStackedBar
            lanes
            total={THIN_REPEAT.of}
            segments={[
              {
                label: "Read it as this Friday",
                value: THIN_REPEAT.friday,
                display: `${THIN_REPEAT.friday} of ${THIN_REPEAT.of}`,
                focal: true,
              },
              {
                label: "Other",
                value: THIN_REPEAT.other,
                display: `${THIN_REPEAT.other} of ${THIN_REPEAT.of}`,
              },
            ]}
          />
        </ChartVizCard>
      </StudyChatShell>
    </ProductRoot>
  );
}
