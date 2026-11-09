"use client";

import type { CSSProperties, ReactNode } from "react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import MuxVideoEmbed from "@/components/MuxVideoEmbed";
import JoolaBeforeAfter from "@/components/joola/JoolaBeforeAfter";
import JoolaQuickOrderLine from "@/components/joola/JoolaQuickOrderLine";
import JoolaSavedOrder from "@/components/joola/JoolaSavedOrder";
import JoolaRecommended from "@/components/joola/JoolaRecommended";
import JoolaCreditMeter from "@/components/joola/JoolaCreditMeter";
import JoolaInvoiceRow from "@/components/joola/JoolaInvoiceRow";
import JoolaApprovalQueue from "@/components/joola/JoolaApprovalQueue";
import JoolaRepFigures from "@/components/joola/JoolaRepFigures";
import JoolaMessages from "@/components/joola/JoolaMessages";
import { JOOLA_MUX_PLAYBACK_ID } from "@/lib/caseStudies/joola";

const DecisionCycle = dynamic(() => import("@/components/joola/DecisionCycle"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: 320, borderRadius: 8, background: "var(--color-bg-secondary)" }} />
  ),
});

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

function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
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

function Body({ children }: { children: ReactNode }) {
  return <CaseStudyBody>{children}</CaseStudyBody>;
}

export default function JoolaBody() {
  return (
    <>
      <p
        style={{
          margin: "0 0 var(--section-gap)",
          fontSize: "var(--fs-meta, 13px)",
          lineHeight: 1.5,
          color: "var(--color-text-muted)",
          maxWidth: "40rem",
        }}
      >
        I made up the numbers and account names in these screens. They&apos;re illustrative, not
        JOOLA clients or real wholesale figures.
      </p>

      <Section id="problem" noReveal>
        <SectionLabel>The problem</SectionLabel>
        <H2>Wholesale orders kept ending up in a sales rep&apos;s inbox.</H2>
        <Body>
          JOOLA&apos;s earlier B2B tool was fragmented and ran into issues, so vendors went back to
          email. Some sent a spreadsheet order form, and some wrote in with the products and
          quantities they wanted. Each one landed with a sales rep.
        </Body>
        <JoolaBeforeAfter caption="Before, every order went through a rep. In the portal, the buyer builds the order, and a rep steps in when it needs one." />
      </Section>

      <Section id="research">
        <SectionLabel>Research</SectionLabel>
        <H2>Sales spent their time on email, and one order could take up to two days.</H2>
        <Body>
          The portal was a three-week project inside my ten-week internship. I interviewed the sales
          team and went through how an order moves through NetSuite.
        </Body>
        <Body>
          Sales wanted to focus on selling, but email took up too much of the job: out-of-stock
          updates, failed payment methods, and shipping status. They keyed warehouse orders into
          NetSuite by hand and read and verified the spreadsheets themselves. They had very little
          automation or design support. With distribution and warehouse teams in Asia in the loop,
          one order could take up to two days. Sales also confirmed that distributors place
          recurring orders.
        </Body>
        <Body>
          The rep&apos;s NetSuite view also had fields a buyer never touches, like warehouse notes
          and an order type that marks a replacement versus a new order. Those fields shaped the
          buyer screens, and later the rep screens. Three weeks was short, so I settled the
          decisions JOOLA would need to build it. My goal was to make ordering very simple for the
          buyer and keep a rep for the cases that need one.
        </Body>
      </Section>

      <Section id="quick-order">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Distributors know what they want, so the first screen is a search box.</H2>
        <Body>
          Quick Order is for a buyer who already knows the SKUs. It searches by name, category, or
          SKU, and it takes a CSV for a big order. Each quantity reprices its line against the tier
          pricing as you type. The order total is the largest number on the screen, because
          it&apos;s the number the buyer is checking.
        </Body>
        <JoolaQuickOrderLine caption="Typing a quantity reprices the line against its tier." />
        <JoolaQuickOrderLine
          mobile
          caption="Mobile covers Quick Order only. I set that scope in the first round."
        />
      </Section>

      <Section id="what-i-cut">
        <SectionLabel>Design decision</SectionLabel>
        <H2>I retired the product page.</H2>
        <Body>
          The first build had a wholesale product page, since that&apos;s where tier pricing usually
          lives. Then I learned this distributor buys at a fixed price. The page explained a pricing
          model the account doesn&apos;t have, so I took it out of the flow instead of polishing it.
        </Body>
      </Section>

      <Section id="shared-accounts">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Saved orders belong to the store, so anyone on the team can reorder.</H2>
        <Body>
          A wholesale account is a store with several people ordering for it. The store&apos;s name
          leads the header, and the person logged in appears under it in smaller type. Anyone on the
          team can load last month&apos;s restock and change it.
        </Body>
        <JoolaSavedOrder caption="A saved restock opened to its lines, with the name of whoever saved it." />
      </Section>

      <Section id="recommended">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Recommendations come from what the account already orders.</H2>
        <Body>
          Recommended for you is built from the account&apos;s own order history. Distributors place
          recurring orders, so the rail starts from what the account has already ordered. It has its
          own band under the category chips, and the buyer can hide it.
        </Body>
        <JoolaRecommended caption="Recommended for you, based on the account's past orders." />
      </Section>

      <Section id="terms-and-credit">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Checkout opens on Net 30 and shows the credit in use.</H2>
        <Body>
          This account&apos;s standing terms are Net 30, so checkout starts there and shows how much
          of the credit line is used. The PO number a buyer enters is the one they&apos;ll see on
          the invoice. If an order goes over the remaining credit, checkout says a rep needs to
          approve it before it ships.
        </Body>
        <JoolaCreditMeter caption="Checkout and the invoice show the same credit line and PO number." />
        <JoolaInvoiceRow />
      </Section>

      <Section id="the-reps-side">
        <SectionLabel>Design decision</SectionLabel>
        <H2>A rep needs a place to approve an over-limit order.</H2>
        <Body>
          I designed the rep&apos;s side of the same portal, starting from the notice a buyer sees
          at checkout. Orders over an account&apos;s Net 30 credit wait in an approval queue. A rep
          who overrides one has to give a reason, so the next person on the account can see why it
          went through. Replacements get their own review screen, since NetSuite tracks them as
          their own order type. Each distributor&apos;s account is on one screen. Like the buyer
          side, this hasn&apos;t shipped.
        </Body>
        <JoolaApprovalQueue caption="Orders over their Net 30 credit wait here, and an override needs a reason." />
        <JoolaRepFigures caption="Replacement review, and one distributor's account." />
      </Section>

      <Section id="messages">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Any JOOLA rep can pick up the conversation.</H2>
        <Body>
          Stock and order-update questions were already filling the sales inbox, and the version I
          demoed had no message thread. I added one afterward, because JOOLA had a limited number of
          sales reps and the portal needed to support them. The buyer writes to JOOLA Sales as a
          team, whoever is free answers, and the reply stays next to the order.
        </Body>
        <JoolaMessages caption="A buyer asks when a paddle restocks, and JOOLA Sales answers in the same thread." />
      </Section>

      <Section id="iterations">
        <SectionLabel>Iterations</SectionLabel>
        <H2>Six decisions took 46 rounds, and some changes didn&apos;t last.</H2>
        <Body>
          Pick a decision and step through its rounds. Each one shows that version at full size,
          what changed, and whether it stayed.
        </Body>
        <DecisionCycle />
      </Section>

      <Section id="solution">
        <SectionLabel>Solution</SectionLabel>
        <H2>Here&apos;s one restock order, from search to reply.</H2>
        <Body>
          Anna, a buyer at a sporting goods retailer, searches a SKU. Recommended fills in the other
          two paddles she reorders. She places the order on Net 30 and asks sales when it ships.
        </Body>
        <figure className="cs-figure" style={{ margin: "24px 0 8px" }}>
          <div className="cs-figure-media" style={{ borderRadius: 8, overflow: "hidden" }}>
            <MuxVideoEmbed playbackId={JOOLA_MUX_PLAYBACK_ID} />
          </div>
          <figcaption className="cs-figcaption">
            A restock order in the wholesale portal prototype.
          </figcaption>
        </figure>
        <Body>
          The prototype is working HTML in JOOLA&apos;s own font and color tokens. Every total is
          computed from the quantities and prices on screen. Order history, invoices and terms, and
          store-retailer integrations are also part of the portal.
        </Body>
      </Section>

      <Section id="outcome">
        <SectionLabel>Outcome</SectionLabel>
        <H2>It&apos;s on JOOLA&apos;s product roadmap. It hasn&apos;t shipped.</H2>
        <Body>
          I demoed the portal to Caroline Kajihara, Head of Digital, and Rich Bloom, Creative
          Director. They were very happy with it. They saw the design as aligned with JOOLA&apos;s
          polished products, and they asked whether I wanted to keep working on it and what my plans
          were after graduating. It&apos;s now on the roadmap for JOOLA&apos;s B2B portal. The
          message thread wasn&apos;t in that demo.
        </Body>
        <Body>
          The prototype is a front end. Credit limits are visual only, search is static, and the
          Recommended badges use sample data. I also flagged two things and didn&apos;t build them.
          A buyer account has one role, with no rules for who can spend what. And switching between
          the retail store and wholesale needs real account logic, so I took out the placeholder
          link instead of faking it.
        </Body>
      </Section>
    </>
  );
}
