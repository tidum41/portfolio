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
        I mocked the numbers and account names in these screens. JOOLA&apos;s real wholesale numbers
        and partners stay private.
      </p>

      <Section id="problem" noReveal>
        <SectionLabel>The problem</SectionLabel>
        <H2>Wholesale orders kept ending up in a sales rep&apos;s inbox.</H2>
        <Body>
          JOOLA already had a B2B tool, but it was fragmented and kept running into problems, so
          vendors went back to email. Some sent a spreadsheet order form, and some just wrote in
          with the products and quantities they wanted. Sales handled each one.
        </Body>
        <JoolaBeforeAfter caption="Before, every order went through a rep's inbox. In the portal, the buyer builds the order and a rep steps in when it needs one." />
      </Section>

      <Section id="research">
        <SectionLabel>Research</SectionLabel>
        <H2>I had three weeks, so I spent them on decisions JOOLA could build from.</H2>
        <Body>
          The portal was a three-week project inside my ten-week internship. I interviewed the sales
          team and went through how an order moves through NetSuite.
        </Body>
        <Body>
          The interviews kept coming back to email. Sales wanted to focus on actual sales, but too
          much of the job was emailing about out-of-stock items, failed payment methods, and shipping
          status. They keyed warehouse orders into NetSuite by hand, and they read and verified every
          spreadsheet themselves. There was very little automation or design support to make any of
          it easier. With distribution and warehouse teams in Asia in the loop, one order could take
          up to two days.
        </Body>
        <Body>
          The rep&apos;s NetSuite view also had fields a buyer never touches, like warehouse notes and
          an order type that marks a replacement versus a new order. Those fields shaped the buyer
          screens, and later the rep screens. I tried to settle as many key decisions as I could in
          those three weeks, so it&apos;d be easier for JOOLA to implement changes. The goal I kept
          coming back to was to make ordering very simple.
        </Body>
      </Section>

      <Section id="quick-order">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Distributors know what they want, so the first screen is a search box.</H2>
        <Body>
          Quick Order is for a buyer who already knows the SKUs. It searches by name, category, or
          SKU, and it takes a CSV for a big order. Each quantity reprices its line against the tier
          pricing as you type. The order total is the largest number on the screen, because it&apos;s
          the number the buyer is checking.
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
        <H2>The header names the store first and the buyer second.</H2>
        <Body>
          A wholesale account is a store with several people ordering for it. The store&apos;s name
          leads the header, and the person logged in appears under it in smaller type. Saved orders
          belong to the account, so anyone on the team can load last month&apos;s restock and change
          it.
        </Body>
        <JoolaSavedOrder caption='A saved restock opened to its lines, with the name of whoever saved it.' />
      </Section>

      <Section id="recommended">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Recommendations come from what the account already orders.</H2>
        <Body>
          Distributors restock the same lines over and over. Recommended for you uses the
          account&apos;s own order history, so most of it is products they&apos;d add anyway. It has
          its own band under the category chips, and the buyer can hide it.
        </Body>
        <JoolaRecommended caption="Recommended for you, based on the account's past orders." />
      </Section>

      <Section id="terms-and-credit">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Net 30 is the default, with the remaining credit next to it.</H2>
        <Body>
          This account&apos;s standing terms are Net 30, so checkout opens on Net 30 and shows how
          much of the credit line is used. The PO number a buyer enters is the one they&apos;ll see
          on the invoice. If an order goes over the remaining credit, checkout says a rep needs to
          approve it before it ships.
        </Body>
        <JoolaCreditMeter caption='Checkout and the invoice show the same credit line and PO number.' />
        <JoolaInvoiceRow />
      </Section>

      <Section id="the-reps-side">
        <SectionLabel>Design decision</SectionLabel>
        <H2>I designed the rep&apos;s side of the same portal.</H2>
        <Body>
          Checkout tells the buyer a rep will approve an over-limit order, so the rep needs a place
          to do it. Orders over an account&apos;s Net 30 credit wait in an approval queue. A rep who
          overrides one has to give a reason, so the next person on the account can see why it went
          through. Replacements get their own review screen, since NetSuite tracks them as their own
          order type. Each distributor&apos;s account is on one screen. Like the buyer side, this
          hasn&apos;t shipped.
        </Body>
        <JoolaApprovalQueue caption="Orders over their Net 30 credit wait here, and an override needs a reason." />
        <JoolaRepFigures caption="Replacement review, and one distributor's account." />
      </Section>

      <Section id="messages">
        <SectionLabel>Design decision</SectionLabel>
        <H2>Any JOOLA rep can pick up the conversation.</H2>
        <Body>
          Stock and order-update questions filled the sales inbox. After a design critique with sales
          and product, I added a message thread inside the portal. The buyer writes to JOOLA Sales as
          a team, whoever is free answers, and the reply stays next to the order.
        </Body>
        <JoolaMessages caption="A buyer asks when a paddle restocks, and JOOLA Sales answers in the same thread." />
      </Section>

      <Section id="iterations">
        <SectionLabel>Iterations</SectionLabel>
        <H2>Most of these screens took a few rounds.</H2>
        <Body>
          Pick a decision and step through its rounds. Each round says what I changed and whether I
          kept it.
        </Body>
        <DecisionCycle />
      </Section>

      <Section id="solution">
        <SectionLabel>Solution</SectionLabel>
        <H2>Here&apos;s one restock order, from search to reply.</H2>
        <Body>
          Anna, a buyer at a pickleball shop, searches a SKU. Recommended fills in the other two
          paddles she reorders. She places the order on Net 30 and asks sales when it ships.
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
          The full portal covers Quick Order, the catalog, saved orders, cart and checkout, order
          history, invoices and terms, messages, store-retailer integrations, and the rep&apos;s
          approval and account screens.
        </Body>
      </Section>

      <Section id="outcome">
        <SectionLabel>Outcome</SectionLabel>
        <H2>It&apos;s on JOOLA&apos;s product roadmap. It hasn&apos;t shipped.</H2>
        <Body>
          I demoed the portal to Caroline Kajihara, Head of Digital, and Rich Bloom, Creative
          Director. They were very happy with it. They saw it as closer to JOOLA&apos;s polished
          products than the tool they&apos;d been using, and they asked whether I wanted to keep
          working on it and what my plans were after graduating. It&apos;s now on the roadmap for
          JOOLA&apos;s B2B portal.
        </Body>
        <Body>
          I flagged a few things and didn&apos;t build them. A buyer account has one role, and
          nothing sets who on it can spend what. Switching between the retail store and wholesale
          needs real account logic, so I took out the placeholder link instead of faking it.
        </Body>
      </Section>
    </>
  );
}
