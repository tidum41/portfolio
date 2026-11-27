import type { CSSProperties, ReactNode } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import AnnotatedFigure from "@/components/joola/AnnotatedFigure";
import { BeforeAfter, Callouts, OptionCards, QuoteRules, type FlowPanel, type OptionCard, type QuoteRule } from "@/components/joola/StoryParts";
import ImportBeats from "@/components/joola/product/ImportBeats";
import RepApproveLoop from "@/components/joola/product/RepApproveLoop";

/**
 * JOOLA case study, v11 minimal: one Dick's order from buyer to rep, told mostly by the
 * figures. Each section is a plain heading and one or two sentences; the explanation
 * sits on the figures as numbered markers with a short legend.
 */

export const JOOLA_PARTIAL_TOC = [
  { id: "impact", label: "Before and after" },
  { id: "overview", label: "Overview" },
  { id: "research", label: "Research" },
  { id: "import", label: "Import" },
  { id: "credit", label: "Credit limit" },
  { id: "rep-queue", label: "Rep" },
  { id: "outcome", label: "Outcome" },
];

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


const QUOTE_RULES: readonly QuoteRule[] = [
  { theme: "Pricing", quotes: ["q1", "q2"], who: "For buyers", rule: "The portal has to be as trustworthy as the order form on pricing, or buyers stay in the form." },
  { theme: "Rep time", quotes: ["q3", "q4"], who: "For reps", rule: "Exceptions get handled on screen instead of over email." },
];


const BEFORE: FlowPanel = {
  title: "Before",
  steps: ["Order form", "Rep retypes every line", "NetSuite"],
  back: "email",
  caption: "Reps retyped every order. A quick order could wait 2 to 3 days.",
};

const AFTER: FlowPanel = {
  title: "With the portal",
  steps: ["Buyer imports her order form", "Portal flags the problem rows", "Rep approves only the exceptions"],
  caption: "The buyer fixes her own order; the rep only sees what needs a decision. Demoed inside JOOLA, on the roadmap, not shipped.",
};

const OPTIONS: readonly OptionCard[] = [
  { title: "Stop the order", plus: "Keeps credit safe.", minus: "Loses the sale." },
  { title: "Pay the gap", plus: "Keeps the sale.", minus: "Confuses the buyer and fights how wholesale credit works." },
  { title: "Ask the rep", plus: "Keeps the order moving and the relationship.", minus: "It waits for her rep.", chosen: true },
];

export default function JoolaPartialBody() {
  return (
    <article className="jo-cs" style={{ minWidth: 0 }}>
      <p className="cs-figcaption" style={{ margin: "16px 0 var(--space-3)" }}>
        {`Names and numbers in these screens are mocked for this case study.`}
      </p>

      <Section id="impact" noReveal>
        <h2 id="impact-heading" className="sr-only">{`Before and after the portal`}</h2>
        <BeforeAfter before={BEFORE} after={AFTER} label="How an order moved before the portal and with it" />
      </Section>

      <Section id="overview" noReveal>
        <H2 id="overview">{`What I designed`}</H2>
        <CaseStudyBody>{`JOOLA makes pickleball and table tennis gear, and stores buy it wholesale through a JOOLA sales rep. I designed both sides of an ordering portal, for the store's buyer and for the rep, as a coded prototype.`}</CaseStudyBody>
      </Section>

      <Section id="research">
        <H2 id="research">{`Talking to sales`}</H2>
        <CaseStudyBody>{`The sales team was busy, so I walked over and interviewed them.`}</CaseStudyBody>
        <figure className="cs-figure" style={{ margin: 0 }}>
          <QuoteRules items={QUOTE_RULES} label="What the sales team said, and the rule each theme led to" />
          <figcaption className="cs-figcaption">{`Quotes are blurred and unattributed.`}</figcaption>
        </figure>
      </Section>

      <Section id="import">
        <ImportBeats
          heading={
            <H2 id="import">{`Buyers already send the form. I wanted the problems in it to be visible at upload, before a rep retypes the sheet.`}</H2>
          }
        />
      </Section>

      <Section id="credit">
        <H2 id="credit">{`Orders over the credit limit`}</H2>
        <CaseStudyBody>{`Maya changes it to 36. Her order is now $7,860 over her credit limit.`}</CaseStudyBody>
        <figure className="cs-figure" style={{ margin: 0 }}>
          <OptionCards options={OPTIONS} label="Three versions of an order over the credit limit" />
        </figure>
        <AnnotatedFigure
          src="/images/joola/v11/credit-meter.webp"
          width={1944}
          height={450}
          className="jo-annot--wide"
          phone={{ src: "/images/joola/v11/credit-meter-sm.webp", width: 954, height: 501, at: { 1: 14, 2: 68 } }}
          alt={`Credit meter on the review page: the bar runs past the limit in red, "Order total $42,214.50. Credit left $34,354.50.", and a notice that her JOOLA rep approves the order before a ship date is confirmed.`}
          notes={[
            { n: 1, at: 16, text: "The red part is the $7,860 over her credit limit." },
            { n: 2, at: 72, text: "Maya can still place the order. It waits for her rep." },
          ]}
        />
      </Section>

      <Section id="rep-queue">
        <H2 id="rep-queue">{`The rep's approval panel`}</H2>
        <CaseStudyBody>{`The order waits in her rep's approval queue. Reps are paid to sell, so the panel keeps the decision short.`}</CaseStudyBody>
        <figure className="cs-figure" style={{ margin: 0 }}>
          <RepApproveLoop marked />
          <Callouts small items={[`Why it's over, with payment history and policy, comes first.`, `Reject and Approve come last, with no help text in the way.`]} />
        </figure>
      </Section>

      <Section id="outcome">
        <H2 id="outcome">{`Demo and roadmap`}</H2>
        <CaseStudyBody>{`I demoed the prototype inside JOOLA, and the portal is on the roadmap. It hasn't shipped, and I haven't tested it with real buyers or reps.`}</CaseStudyBody>
      </Section>
    </article>
  );
}
