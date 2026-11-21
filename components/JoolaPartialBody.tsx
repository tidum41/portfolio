import type { CSSProperties, ReactNode } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyFigure from "@/components/CaseStudyFigure";
import { CASE_STUDY_MEDIA_SIZES } from "@/lib/caseStudyLayout";

/**
 * JOOLA partial case study: one Dick's order goes from buyer to rep.
 * Copy is verbatim from design/briefs/joola-condensed-copy-v6.md (sentences cut, never
 * reworded). Section, label and heading styling matches the BruinLease page
 * (app/ucla-sublease/page.tsx). Figures are v18 captures with mock data, 2400x1500.
 */

export const JOOLA_PARTIAL_TOC = [
  { id: "problem", label: "Problem" },
  { id: "ledger", label: "Ledger" },
  { id: "import", label: "Import" },
  { id: "credit", label: "Credit" },
  { id: "rep-queue", label: "Rep queue" },
  { id: "outcome", label: "Outcome" },
];

const IMG = "/images/joola/v18";
const W = 2400;
const H = 1500;

function Section({ id, children, noReveal = false }: { id: string; children: ReactNode; noReveal?: boolean }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      style={{ scrollMarginTop: 120, minWidth: 0, paddingBottom: "var(--section-pb)", marginBottom: "var(--section-gap)" }}
    >
      {noReveal ? <>{children}</> : <ScrollReveal>{children}</ScrollReveal>}
    </section>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
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
    </p>
  );
}

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={`${id}-heading`}
      style={{
        overflowWrap: "break-word",
        fontFamily: "var(--font-sans-medium)",
        fontSize: "var(--fs-h2)",
        fontWeight: "var(--fw-h2)" as CSSProperties["fontWeight"],
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

export default function JoolaPartialBody() {
  return (
    <article style={{ minWidth: 0 }}>
      <p className="cs-figcaption" style={{ margin: "16px 0 var(--cs-para-gap)" }}>
        {`Names and numbers in these screens are mocked for this case study.`}
      </p>

      {/* 1. Problem */}
      <Section id="problem" noReveal>
        <SectionLabel>{`Problem`}</SectionLabel>
        <H2 id="problem">{`Distributors need self-service ordering for wholesale orders and one-off orders, that reflect their business pricing.`}</H2>
        <CaseStudyBody>{`An order sent by email or spreadsheet reached NetSuite only when someone typed it in.`}</CaseStudyBody>
        <CaseStudyBody>{`JOOLA's B2B portal is a wholesale ordering site where distributor and retailer buyers place orders and JOOLA reps approve the ones that go over a credit limit.`}</CaseStudyBody>
      </Section>

      {/* 2. Ledger */}
      <Section id="ledger">
        <SectionLabel>{`Solution`}</SectionLabel>
        <H2 id="ledger">{`A buyer who knows the SKUs can build an order from one dense ledger.`}</H2>
        <CaseStudyBody>{`I decided on the dense ledger, with the account price on every line.`}</CaseStudyBody>
        <CaseStudyFigure
          src={`${IMG}/01-quick-order-ledger.webp`}
          alt="Quick order screen for Dick's Sporting Goods: a dense ledger of lines, each with product, SKU, account price, quantity stepper and line total, with 8 lines and 156 units in the footer."
          caption={`Zero-quantity lines stay hidden, so the ledger shows only what is in the order.`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
      </Section>

      {/* 3. Import */}
      <Section id="import">
        <SectionLabel>{`Exploration: importing orders`}</SectionLabel>
        <H2 id="import">{`An import should add the valid rows and list the ones it skipped.`}</H2>
        <CaseStudyBody>{`I decided the import adds the valid rows and lists the skipped ones. It never overwrites an address silently, so when the file's address differs from the account, it flags the difference and asks.`}</CaseStudyBody>
        <CaseStudyFigure
          src={`${IMG}/02a-import-preview-skipped-rows.webp`}
          alt={`Import order form dialog previewing a CSV: rows marked Ready, and one row marked "Unknown SKU (skipped)" under the line "1 row will be skipped."`}
          caption={`Each row in the preview gets a status, and a row with an unknown SKU is skipped.`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
      </Section>

      {/* 4. Credit */}
      <Section id="credit">
        <SectionLabel>{`Decision: credit`}</SectionLabel>
        <H2 id="credit">{`Net 30 credit shows up once, as one account meter.`}</H2>
        <CaseStudyBody>{`I decided on one account meter on Invoices, showing credit used against the limit with the amount left as a number, and one quiet line in the cart.`}</CaseStudyBody>
        <CaseStudyFigure
          src={`${IMG}/06a-over-limit-cart.webp`}
          alt={`Cart screen with 9 lines and 300 units, where "Credit left after order" shows $0.00 and a note says the order is over the remaining Net 30 credit.`}
          caption={`Over the limit it reads "Over your remaining Net 30 credit. Your JOOLA rep approves it before a ship date is confirmed."`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
      </Section>

      {/* 5. Rep queue */}
      <Section id="rep-queue">
        <SectionLabel>{`Exploration: the rep's side`}</SectionLabel>
        <H2 id="rep-queue">
          <span style={{ display: "block" }}>{`Over-limit orders wait in a queue for a rep...`}</span>{" "}
          <span style={{ display: "block" }}>{`...but I haven't picked a layout for that queue yet.`}</span>
        </H2>
        <CaseStudyBody>{`Orders over a buyer's Net 30 credit wait in an approval queue, and I designed the rep's side of the portal as part of my internship work. I designed a ledger and a split inbox for that queue and haven't picked one.`}</CaseStudyBody>
        <CaseStudyFigure
          src={`${IMG}/06c-rep-approval-queue-ledger.webp`}
          alt="Approval queue as a ledger: a table of over-limit orders with Account, Over by, Why and Actions, and the Dick's Sporting Goods row open to its credit math and lines."
          caption={`Ledger`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
        <CaseStudyFigure
          src={`${IMG}/06d-rep-approval-queue-split-inbox.webp`}
          alt="Approval queue as a split inbox: 3 orders waiting on the left, and the selected Dick's Sporting Goods order with its credit math, lines, and Approve and Reject on the right."
          caption={`Split inbox`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
      </Section>

      {/* 6. Outcome */}
      <Section id="outcome">
        <SectionLabel>{`Outcome`}</SectionLabel>
        <H2 id="outcome">{`I demoed it inside JOOLA, and it's on the roadmap.`}</H2>
        <CaseStudyBody>{`The portal was a three-week project inside my ten-week internship, and it hasn't shipped.`}</CaseStudyBody>
        <CaseStudyBody>{`Order turnaround is the number that would show the portal works. Nothing is measured yet, and the baselines are the sales team's own estimates from the call.`}</CaseStudyBody>
      </Section>
    </article>
  );
}
