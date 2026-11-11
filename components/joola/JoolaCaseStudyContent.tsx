"use client";

import { useState, type ReactNode } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import type { CaseStudyData } from "@/lib/sanity/queries";
import JoolaSanityText from "./JoolaSanityText";
import JoolaBeforeAfter from "./JoolaBeforeAfter";
import JoolaProtoIframe from "./JoolaProtoIframe";
import JoolaFigureSeg from "./JoolaFigureSeg";
import {
  JOOLA_EMBED_HEIGHT,
  JOOLA_FIGURE_URLS,
  approvalUrl,
  qoRowUrl,
  type QoVariant,
} from "@/lib/joola/protoEmbed";
import "./joola-case-study.css";

const COLOR_WRONG = "#C62828";
const QO_W = 1024;
const PORTAL_W = 1280;

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
      Names and numbers in these screens are mocked. They are illustrative, not JOOLA clients or
      real wholesale figures.
    </p>
  );
}

export default function JoolaCaseStudyContent({ cs }: { cs: CaseStudyData }) {
  const painPoints = cs.painPoints ?? [];
  const [qoVariant, setQoVariant] = useState<QoVariant>("2");
  const [approvalView, setApprovalView] = useState<"split" | "ledger">("split");
  const [qoSlotH, setQoSlotH] = useState(JOOLA_EMBED_HEIGHT["quick-order-row-compare"]);
  const [approvalSlotH, setApprovalSlotH] = useState(
    Math.max(JOOLA_EMBED_HEIGHT["approval-queue-split"], JOOLA_EMBED_HEIGHT["approval-queue-ledger"]),
  );
  const bumpQoH = (h: number) => setQoSlotH((prev) => Math.max(prev, h));
  const bumpApprovalH = (h: number) => setApprovalSlotH((prev) => Math.max(prev, h));

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
          designWidth={PORTAL_W}
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
          designWidth={QO_W}
          designHeight={JOOLA_EMBED_HEIGHT["quick-order-row-search"]}
          caption="Search by name, category, or SKU, with CSV upload for large orders."
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
        <JoolaProtoIframe
          key={qoVariant}
          figureId="quick-order-row-compare"
          src={qoRowUrl(qoVariant)}
          designWidth={QO_W}
          designHeight={qoSlotH}
          onEmbedHeight={bumpQoH}
          caption="Case pack steps, reorder, and stock status on the same line component."
          footer={
            <JoolaFigureSeg
              label="Quick order line view"
              value={qoVariant}
              options={[{ value: "2", label: "Cases" }, { value: "3", label: "Reorder" }, { value: "4", label: "Stock status" }]}
              onChange={setQoVariant}
            />
          }
        />
      </Section>

      <Section id="decision-3">
        <SectionLabel>{cs.d3Label}</SectionLabel>
        <H2>
          <JoolaSanityText text={cs.d3Heading} />
        </H2>
        <Body>
          <JoolaSanityText text={cs.d3Body} />
        </Body>
        <JoolaProtoIframe
          figureId="review-checkout"
          src={JOOLA_FIGURE_URLS["review-checkout"]}
          designWidth={PORTAL_W}
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
        <JoolaProtoIframe
          key={approvalView}
          figureId="approval-queue"
          src={approvalView === "split" ? approvalUrl("3") : approvalUrl("1")}
          designWidth={PORTAL_W}
          designHeight={approvalSlotH}
          onEmbedHeight={bumpApprovalH}
          caption="Over-limit orders in a split inbox, with credit math beside the ledger table."
          footer={
            <JoolaFigureSeg
              label="Approval queue view"
              value={approvalView}
              options={[
                { value: "split", label: "Split inbox" },
                { value: "ledger", label: "Ledger" },
              ]}
              onChange={setApprovalView}
            />
          }
        />
      </Section>
    </article>
  );
}
