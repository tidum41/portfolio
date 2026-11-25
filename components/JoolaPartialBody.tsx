import type { CSSProperties, ReactNode } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import AnnotatedFigure from "@/components/joola/AnnotatedFigure";
import FlawFigure from "@/components/joola/FlawFigure";
import { Callouts, OptionCards, OrderLoop, QuoteRules, type OptionCard, type QuoteRule } from "@/components/joola/StoryParts";
import ImportVersions, { type ImportVersion } from "@/components/joola/product/ImportVersions";
import RepApproveLoop from "@/components/joola/product/RepApproveLoop";

/**
 * JOOLA case study, v11 minimal: one Dick's order from buyer to rep, told mostly by the
 * figures. Each section is a plain heading and one or two sentences; the explanation
 * sits on the figures as numbered markers with a short legend.
 */

export const JOOLA_PARTIAL_TOC = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Before" },
  { id: "first-version", label: "First version" },
  { id: "research", label: "Research" },
  { id: "import", label: "Import" },
  { id: "credit", label: "Credit limit" },
  { id: "rep-queue", label: "Rep" },
  { id: "outcome", label: "Outcome" },
];

/** New captures get a new folder, so cached copies of older figures never show. */
const IMG = "/images/joola/v9";

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

const IMPORT_VERSIONS: readonly ImportVersion[] = [
  { id: "v1", tab: "V1 alert", caption: "The buyer has to leave the portal and open her order form to find the problem." },
  { id: "v2", tab: "V2 preview", caption: "It flags the SKU JOOLA doesn't carry, but 360 still reaches the cart." },
  {
    id: "final",
    tab: "Final",
    caption: "Try it.",
    notes: ["Row 18 waits for Change to 36 or Keep 360.", "The SKU JOOLA doesn't carry is skipped."],
  },
];

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

      <Section id="overview" noReveal>
        <H2 id="overview">{`What I designed`}</H2>
        <CaseStudyBody>{`JOOLA makes pickleball and table tennis gear, and stores buy it wholesale through a JOOLA sales rep. I designed both sides of an ordering portal, for the store's buyer and for the rep, as a coded prototype.`}</CaseStudyBody>
      </Section>

      <Section id="problem">
        <H2 id="problem">{`Orders before the portal`}</H2>
        <CaseStudyBody>{`Reps retyped every order by hand, and a quick order could wait 2 to 3 days.`}</CaseStudyBody>
        <figure className="cs-figure" style={{ margin: 0 }}>
          <OrderLoop nodes={["Order form", "Rep retypes every line", "NetSuite"]} back="email" label="How an order moved before the portal" />
        </figure>
      </Section>

      <Section id="first-version">
        <H2 id="first-version">{`My first version`}</H2>
        <CaseStudyBody>{`I built it from an old Jira spec, inside JOOLA's public store and its Shopify design system.`}</CaseStudyBody>
        <FlawFigure
          src={`${IMG}/first-nav.webp`}
          width={913}
          height={114}
          alt="Top of my first version: the public store menu with Pickleball Paddles, Apparel, Footwear and more, outlined, above the wholesale tabs Quick Order, Catalog, Templates, Order History and Invoices and Terms."
          flaw={{ left: 19.5, top: 6, width: 80, height: 41 }}
          label={`Store menu above wholesale tabs`}
          phoneCrop={0.56}
        />
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
        <H2 id="import">{`Importing the order form`}</H2>
        <CaseStudyBody>{`Maya Collins, a buyer at Dick's Sporting Goods, imports her usual order form. It has one typo, 360 paddles instead of 36.`}</CaseStudyBody>
        <ImportVersions versions={IMPORT_VERSIONS} earlierNote={`Earlier versions, recreated in the prototype.`} label="Three versions of the import, on rows 18 and 22 of Maya's order form" />
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
