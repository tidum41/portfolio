import type { CSSProperties, ReactNode } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyFigure from "@/components/CaseStudyFigure";
import { CASE_STUDY_MEDIA_SIZES } from "@/lib/caseStudyLayout";

/**
 * JOOLA partial case study: one Dick's order goes from buyer to rep.
 * Copy is verbatim from design/briefs/joola-condensed-copy-v6.md and the approved
 * proposal-v7 lines (sentences cut, never reworded). Section, label and heading styling
 * matches the BruinLease page (app/ucla-sublease/page.tsx). Figures are full v18
 * windows (1280x800 at 2x, production build, mock data), so every figure is 16:10.
 */

export const JOOLA_PARTIAL_TOC = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "ledger", label: "Ledger" },
  { id: "import", label: "Import" },
  { id: "credit", label: "Credit" },
  { id: "rep-queue", label: "Rep" },
  { id: "outcome", label: "Outcome" },
];

/** New captures get a new folder, so cached copies of older figures never show. */
const IMG = "/images/joola/v7";
const W = 2560;
const H = 1600;

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

/** "Earlier version" or "Final" above each import figure. Same style as the section label. */
function VersionTag({ version }: { version: "Earlier version" | "Final" }) {
  return <SectionLabel>{version}</SectionLabel>;
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        overflowWrap: "break-word",
        fontFamily: "var(--font-sans-medium)",
        fontSize: "var(--fs-lg)",
        fontWeight: "var(--fw-h2)" as CSSProperties["fontWeight"],
        lineHeight: "var(--lh-h2)",
        letterSpacing: "var(--ls-h2)",
        color: "var(--color-text-primary)",
        margin: "var(--cs-para-gap) 0 var(--cs-h2-mb)",
      }}
    >
      {children}
    </h3>
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

      {/* 1. Overview */}
      <Section id="overview" noReveal>
        <SectionLabel>{`Overview`}</SectionLabel>
        <H2 id="overview">{`JOOLA's B2B portal is a wholesale ordering site where distributor and retailer buyers place orders and JOOLA reps approve the ones that go over a credit limit.`}</H2>
      </Section>

      {/* 2. Problem */}
      <Section id="problem">
        <SectionLabel>{`Problem`}</SectionLabel>
        <H2 id="problem">{`Distributors need self-service ordering for wholesale orders and one-off orders, that reflect their business pricing.`}</H2>
        <CaseStudyBody>{`The current loop for ordering requires back and forth emailing, spreadsheet order forms, and causes all parties involved to focus on aspects that can be designed for.`}</CaseStudyBody>
        <H2 id="problem-keying">{`An order sent by email or spreadsheet reached NetSuite only when someone typed it in.`}</H2>
        <CaseStudyBody>{`Small orders were a key part of the problem: buyers placing them still faced a 2–3 day turnaround because reps manually entered orders and resolved issues over email or WeChat. That made self-service ordering especially valuable for these buyers.`}</CaseStudyBody>
      </Section>

      {/* 3. Ledger */}
      <Section id="ledger">
        <SectionLabel>{`Solution`}</SectionLabel>
        <H2 id="ledger">{`A buyer who knows the SKUs can build an order from one dense ledger.`}</H2>
        <CaseStudyBody>{`I decided on the dense ledger, with the account price on every line.`}</CaseStudyBody>
        <CaseStudyFigure
          src={`${IMG}/01-quick-order-ledger.webp`}
          alt="New order screen for Dick's Sporting Goods: a dense ledger of 4 lines, each with product, SKU, account price, quantity stepper and line total, and a total of $42,214.50 for 450 units."
          caption={`Zero-quantity lines stay hidden, so the ledger shows only what is in the order.`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
      </Section>

      {/* 4. Import: three versions, same file, same window */}
      <Section id="import">
        <SectionLabel>{`Exploration: importing orders`}</SectionLabel>
        <H2 id="import">{`An import should add the valid rows and list the ones it skipped.`}</H2>
        <CaseStudyBody>{`Buyers sent order forms because it was the only way to be sure their pricing was correct.`}</CaseStudyBody>
        <p className="cs-figcaption" style={{ margin: "0 0 var(--cs-para-gap)" }}>
          {`Earlier versions, recreated in the prototype.`}
        </p>

        <VersionTag version="Earlier version" />
        <H3>{`The first version only showed an alert.`}</H3>
        <CaseStudyFigure
          src={`${IMG}/02-import-1-alert-only.webp`}
          alt={`Cart after importing the order form: the valid lines were added, and one alert at the top says "Row 21 couldn't be imported."`}
          caption={`It named the row and nothing else.`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />

        <VersionTag version="Earlier version" />
        <H3>{`Then a preview listed every row and skipped the SKU it couldn't find.`}</H3>
        <CaseStudyFigure
          src={`${IMG}/02-import-2-line-preview.webp`}
          alt={`Import order form dialog for the same file: every row has a status, row 21 reads "Unknown SKU (skipped)", and the button reads "Add 10 lines".`}
          caption={`Quantity 400 is not checked against history.`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />

        <VersionTag version="Final" />
        <H3>{`The final import reads the form's header and checks quantities against what the account usually orders.`}</H3>
        <CaseStudyBody>{`I decided the import adds the valid rows and lists the skipped ones. It never overwrites an address silently, so when the file's address differs from the account, it flags the difference and asks.`}</CaseStudyBody>
        <CaseStudyFigure
          src={`${IMG}/02-import-3-final.webp`}
          alt={`Import order form dialog for the same file: "Autofilled from import" shows the ship to, PO, dates, email and comments from the form, "1 row will be skipped." sits over the rows with row 21 marked "Unknown SKU (skipped)", and a control flags quantities above 5x the usual.`}
          caption={`Each row in the preview gets a status, and a row with an unknown SKU is skipped.`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
      </Section>

      {/* 5. Credit */}
      <Section id="credit">
        <SectionLabel>{`Decision: credit`}</SectionLabel>
        <H2 id="credit">{`Net 30 credit shows up once, as one account meter.`}</H2>
        <CaseStudyBody>{`I decided on one account meter on Invoices, showing credit used against the limit with the amount left as a number, and one quiet line in the cart.`}</CaseStudyBody>
        <CaseStudyFigure
          src={`${IMG}/06a-over-limit-cart.webp`}
          alt={`Cart with 4 lines and 450 units, where "Credit left after order" shows $0.00 and a note says the order is over the remaining Net 30 credit.`}
          caption={`Over the limit it reads "Over your remaining Net 30 credit. Your JOOLA rep approves it before a ship date is confirmed."`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
      </Section>

      {/* 6. Rep */}
      <Section id="rep-queue">
        <SectionLabel>{`Decision: the rep's side`}</SectionLabel>
        <H2 id="rep-queue">
          <span style={{ display: "block" }}>{`Over-limit orders wait in a queue for a rep...`}</span>{" "}
          <span style={{ display: "block" }}>{`...who sees why it's over before Approve.`}</span>
        </H2>
        <CaseStudyBody>{`Orders over a buyer's Net 30 credit wait in an approval queue, and I designed the rep's side of the portal as part of my internship work.`}</CaseStudyBody>
        <CaseStudyBody>{`Reps are paid to sell, so keep their admin short.`}</CaseStudyBody>
        <CaseStudyFigure
          src={`${IMG}/06-rep-approval-queue.webp`}
          alt={`Approval queue with Dick's Sporting Goods selected: over the limit by $7,860.00, Within policy, last 12 invoices on time, a Reason field marked "Internal only.", order type, and Reject and Approve order at the end.`}
          caption={`The decision panel puts the payment history and policy above the reason, and Reject and Approve come last.`}
          width={W}
          height={H}
          sizes={CASE_STUDY_MEDIA_SIZES}
        />
      </Section>

      {/* 7. Outcome */}
      <Section id="outcome">
        <SectionLabel>{`Outcome`}</SectionLabel>
        <H2 id="outcome">{`I demoed it inside JOOLA, and it's on the roadmap.`}</H2>
        <CaseStudyBody>{`The portal was a three-week project inside my ten-week internship, and it hasn't shipped.`}</CaseStudyBody>
        <CaseStudyBody>{`Order turnaround is the number that would show the portal works. Nothing is measured yet, and the baselines are the sales team's own estimates from the call.`}</CaseStudyBody>
      </Section>
    </article>
  );
}
