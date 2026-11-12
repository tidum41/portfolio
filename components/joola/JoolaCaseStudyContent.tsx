"use client";

import { useState, type ReactNode } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import type { CaseStudyData } from "@/lib/sanity/queries";
import JoolaSanityText from "./JoolaSanityText";
import JoolaBeforeAfter from "./JoolaBeforeAfter";
import JoolaProtoIframe from "./JoolaProtoIframe";
import JoolaVariantEmbed from "./JoolaVariantEmbed";
import {
  JOOLA_EMBED_DESIGN_WIDTH,
  JOOLA_EMBED_HEIGHT,
  JOOLA_FIGURE_URLS,
  approvalUrl,
  qoRowUrl,
  type QoVariant,
} from "@/lib/joola/protoEmbed";
import "./joola-case-study.css";

const COLOR_WRONG = "#C62828";
const EMBED_W = JOOLA_EMBED_DESIGN_WIDTH;

function Section({
  id,
  children,
  noReveal = false,
}: {
  id: string;
  children: ReactNode;
  noReveal?: boolean;
}) {
  const inner = noReveal ? <>{children}</> : <ScrollReveal>{children}</ScrollReveal>;
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: 120,
        paddingBottom: "var(--section-pb)",
        marginBottom: "var(--section-gap)",
      }}
    >
      {inner}
    </section>
  );
}

function SectionLabel({ children, as: Tag = "p" }: { children: ReactNode; as?: "p" | "h2" }) {
  return (
    <Tag
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-section-label)",
        fontWeight: 400,
        letterSpacing: "0.02em",
        color: "var(--color-text-tertiary)",
        margin: "0 0 var(--cs-para-gap)",
      }}
    >
      {children}
    </Tag>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-sans-medium)",
        fontSize: "var(--fs-h2)",
        fontWeight: "var(--fw-h2)" as React.CSSProperties["fontWeight"],
        lineHeight: "var(--lh-h2)",
        letterSpacing: "var(--ls-h2)",
        color: "var(--color-text-primary)",
        margin: "0 0 var(--cs-h2-mb)",
      }}
    >
      {children}
    </h2>
  );
}

function Body({ children }: { children: ReactNode }) {
  return <CaseStudyBody>{children}</CaseStudyBody>;
}

function PainPoint({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 4 }}>
        <path
          d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
          stroke={COLOR_WRONG}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <p
        style={{
          fontSize: "var(--fs-body)",
          lineHeight: "var(--lh-body)",
          letterSpacing: "var(--ls-body)",
          color: "var(--color-text-secondary)",
          margin: 0,
          fontWeight: 400,
        }}
      >
        <JoolaSanityText text={text} />
      </p>
    </div>
  );
}

function MockDisclaimer() {
  return (
    <p className="joola-mock-note" role="note">
      Names and numbers in these screens are mocked for this case study.
    </p>
  );
}

export default function JoolaCaseStudyContent({ cs }: { cs: CaseStudyData }) {
  const painPoints = cs.painPoints ?? [];
  const [qoVariant, setQoVariant] = useState<QoVariant>("1");
  const [approvalView, setApprovalView] = useState<"split" | "ledger">("split");
  const [qoHeights, setQoHeights] = useState<Record<QoVariant, number>>({
    "1": JOOLA_EMBED_HEIGHT["quick-order-row-compact"],
    "3": JOOLA_EMBED_HEIGHT["quick-order-row-reorder"],
    "4": JOOLA_EMBED_HEIGHT["quick-order-row-stock"],
    "2": JOOLA_EMBED_HEIGHT["quick-order-row-compact"],
    "5": JOOLA_EMBED_HEIGHT["quick-order-row-compact"],
  });
  const [approvalHeights, setApprovalHeights] = useState({
    split: JOOLA_EMBED_HEIGHT["approval-queue-split"],
    ledger: JOOLA_EMBED_HEIGHT["approval-queue-ledger"],
  });
  const bumpQoH = (v: QoVariant, h: number) =>
    setQoHeights((prev) => ({ ...prev, [v]: Math.max(prev[v] ?? 0, h) }));
  const bumpApprovalH = (v: "split" | "ledger", h: number) =>
    setApprovalHeights((prev) => ({ ...prev, [v]: Math.max(prev[v] ?? 0, h) }));

  return (
    <article style={{ minWidth: 0 }}>
      <MockDisclaimer />

      <Section id="problem" noReveal>
        <SectionLabel>{cs.problemLabel}</SectionLabel>
        <H2>
          <JoolaSanityText text={cs.problemHeading} />
        </H2>
        <Body>
          <JoolaSanityText text={cs.problemBody} />
        </Body>
        {cs.problemImageCaption ? (
          <JoolaBeforeAfter
            caption={<JoolaSanityText text={cs.problemImageCaption} />}
          />
        ) : (
          <JoolaBeforeAfter />
        )}
        {painPoints.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
            {painPoints.map((text, i) => (
              <PainPoint key={i} text={text} />
            ))}
          </div>
        ) : null}
      </Section>

      <Section id="solution">
        <SectionLabel>{cs.solutionLabel}</SectionLabel>
        <H2>
          <JoolaSanityText text={cs.solutionHeading} />
        </H2>
        <Body>
          <JoolaSanityText text={cs.solutionBody} />
        </Body>
        <JoolaProtoIframe
          figureId="quick-order-portal"
          src={JOOLA_FIGURE_URLS["quick-order-portal"]}
          designWidth={EMBED_W}
          designHeight={JOOLA_EMBED_HEIGHT["quick-order-portal"]}
          caption="Quick order in the portal shell, search-first for buyers who already know the SKUs."
        />
      </Section>

      <Section id="research">
        <SectionLabel>{cs.researchLabel}</SectionLabel>
        <H2>
          <JoolaSanityText text={cs.researchHeading} />
        </H2>
        <Body>
          <JoolaSanityText text={cs.researchBody} />
        </Body>
      </Section>

      <Section id="decision-1">
        <SectionLabel>{cs.d1Label}</SectionLabel>
        <H2>
          <JoolaSanityText text={cs.d1Heading} />
        </H2>
        <Body>
          <JoolaSanityText text={cs.d1Body} />
        </Body>
        <JoolaProtoIframe
          figureId="quick-order-row-search"
          src={qoRowUrl("1")}
          designWidth={EMBED_W}
          designHeight={JOOLA_EMBED_HEIGHT["quick-order-row-search"]}
          caption="Search by name or SKU on the quick-order line."
        />
      </Section>

      <Section id="decision-2">
        <SectionLabel>{cs.d2Label}</SectionLabel>
        <H2>
          <JoolaSanityText text={cs.d2Heading} />
        </H2>
        <Body>
          <JoolaSanityText text={cs.d2Body} />
        </Body>
        <JoolaVariantEmbed
          label="Quick order line view"
          value={qoVariant}
          options={[
            { value: "1", label: "Compact" },
            { value: "3", label: "Reorder" },
            { value: "4", label: "Stock status" },
          ]}
          onChange={setQoVariant}
          buildSrc={qoRowUrl}
          figureId="quick-order-row-compare"
          designWidth={EMBED_W}
          heights={qoHeights}
          onEmbedHeight={bumpQoH}
          captions={{
            "1": "Compact stepper-only line, one account price per SKU.",
            "3": "Use last reorder and quantity on the same row.",
            "4": "Stock status and quantity controls on one line.",
          }}
        />
      </Section>

      <Section id="decision-3">
        <SectionLabel>
          {cs.d3Label}
          <span className="joola-draft-tag">Needs review</span>
        </SectionLabel>
        <H2>
          <JoolaSanityText text={cs.d3Heading} />
        </H2>
        <Body>
          <JoolaSanityText text={cs.d3Body} />
        </Body>
        <JoolaProtoIframe
          figureId="review-checkout"
          src={JOOLA_FIGURE_URLS["review-checkout"]}
          designWidth={EMBED_W}
          designHeight={JOOLA_EMBED_HEIGHT["review-checkout"]}
          caption="Checkout opens on Net 30 and shows credit in use before the buyer places the order."
        />
      </Section>

      <Section id="decision-4">
        <SectionLabel>{cs.d4Label}</SectionLabel>
        <H2>
          <JoolaSanityText text={cs.d4Heading} />
        </H2>
        <Body>
          <JoolaSanityText text={cs.d4Body} />
        </Body>
        <JoolaVariantEmbed
          label="Approval queue view"
          value={approvalView}
          options={[
            { value: "split", label: "Split inbox" },
            { value: "ledger", label: "Ledger" },
          ]}
          onChange={setApprovalView}
          buildSrc={(v) => approvalUrl(v === "split" ? "3" : "1")}
          figureId="approval-queue"
          designWidth={EMBED_W}
          heights={approvalHeights}
          onEmbedHeight={bumpApprovalH}
          captions={{
            split: "Over-limit orders in a split inbox with credit math beside the list.",
            ledger: "Ledger inbox with expandable rows and credit math per order.",
          }}
        />
      </Section>
    </article>
  );
}
