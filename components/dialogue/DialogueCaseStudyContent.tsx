"use client";

import dynamic from "next/dynamic";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueChartLibrary from "@/components/dialogue/DialogueChartLibrary";
import DialogueLeadAnswerCompare from "@/components/dialogue/DialogueLeadAnswerCompare";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import StaticFigure from "@/components/dialogue/StaticFigure";
import { ScrollReveal } from "@/components/ScrollReveal";
import ClipQuotes from "@/components/dialogue/product/ClipQuotes";
import ParagraphAnswerFigure from "@/components/dialogue/product/scenarios/ParagraphAnswerFigure";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import ScaledChatViewport from "@/components/dialogue/product/ScaledChatViewport";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";
import "@/components/dialogue/product/dialogue-product.css";

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

/** Short TOC labels (Rachel Chen style); the headings carry the full claims. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "counts", label: "Counts" },
  { id: "levels", label: "Levels of detail" },
  { id: "data-viz", label: "Data visualization" },
  { id: "clips", label: "Clips" },
  { id: "thin-data", label: "Thin data" },
  { id: "measure", label: "Measuring it" },
  { id: "takeaway", label: "Takeaway" },
];

const FRIDAY_QUESTION = "How did shoppers read \u2018Arrives by Friday\u2019?";
const FRIDAY_FINDING =
  "18 of 24 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.";

function Section({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="dialogue-cs-section"
      style={{
        scrollMarginTop: 96,
        paddingBottom: 0,
        marginBottom: "var(--dialogue-section-gap)",
      }}
    >
      <ScrollReveal>{children}</ScrollReveal>
    </section>
  );
}

function ClaimH2({ children }: { children: React.ReactNode }) {
  return <h2 className="cs-claim-h2">{children}</h2>;
}

function StatusLine({ children }: { children: React.ReactNode }) {
  return <p className="cs-status-line">{children}</p>;
}

/** Visible scaffold for copy Mudit writes himself (TASTE: visible markers, never invented facts). */
function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="cs-placeholder">[PLACEHOLDER: {children}]</span>;
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="dialogue-caption cs-caption">
      <span className="dialogue-caption__sentence">{children}</span>
    </p>
  );
}

/** A scaled product figure: Rachel frame, static wrapper, 448 panel viewport. */
function ProductFigure({
  caption,
  name,
  maxHeight,
  children,
}: {
  caption: string;
  name: string;
  maxHeight: number;
  children: React.ReactNode;
}) {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame tone="system">
        <StaticFigure figure={name}>
          <ScaledChatViewport maxHeight={maxHeight}>{children}</ScaledChatViewport>
        </StaticFigure>
      </DialogueRachelFrame>
    </figure>
  );
}

function FridayBar() {
  return (
    <ChartVizCard title={FRIDAY_FINDING}>
      <ChartStackedBar
        total={24}
        segments={[
          { label: "Read it as this Friday", value: 18, display: "18 of 24", focal: true },
          { label: "Did not", value: 6, display: "6 of 24" },
        ]}
      />
    </ChartVizCard>
  );
}

export function DialogueCaseStudyContent({
  backHref = "/",
}: {
  annotateRaster?: RasterAnnotator;
  backHref?: string;
}) {
  return (
    <div className="dialogue-case-study" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">
        <aside className="cs-aside">
          <CaseStudyTOC items={DIALOGUE_TOC_ITEMS} backHref={backHref} />
        </aside>

        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>
          <div className="cs-mobile-back">
            <CaseStudyTOC items={[]} backHref={backHref} mobileBackOnly />
          </div>

          <CaseStudyOpen
            title={DIALOGUE_TITLE}
            subtitle="Product designer (contract), Dec 2025 to Mar 2026"
            metadata={[]}
          >
            <p className="cs-hero-body">
              Dialogue is an AI tool that runs user interviews and analyses them, then turns a
              study into a site with a chat. UX research teams ask that chat questions and share
              the answers with their product teams. I redesigned the answer so a research team can
              surface an insight quickly without losing the detail behind it. Part of it shipped, and the
              rest is shown as concept.
            </p>
            <div className="cs-hero-media-frame">
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="system">
                  <StaticFigure figure="hero">
                    <ScaledChatViewport maxHeight={320}>
                      <StudyChatShell hideComposer>
                        <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
                        <FridayBar />
                        <ClipQuotes />
                      </StudyChatShell>
                    </ScaledChatViewport>
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
            </div>
            <Caption>One answer, traced to the person who said it. Illustrative data.</Caption>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem">
              <ClaimH2>Teams needed to check an answer before sharing it</ClaimH2>
              <CaseStudyBody>
                I did a desk research deep dive on how UX research teams work, using NN/g, Maze,
                User Interviews and IBM Carbon, with no interviews. Teams share findings with
                non-researchers within hours, so they need the insight fast without losing the detail that backs it. <Placeholder>first try: the chat answered like a standard LLM, with
                plain markdown tables that were long and hard to glance at; why grouping responses
                was the move</Placeholder>
              </CaseStudyBody>
              <ProductFigure caption="before" name="problem-before" maxHeight={420}>
                <StudyChatShell hideComposer>
                  <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
                  <ParagraphAnswerFigure focus="answer" />
                </StudyChatShell>
              </ProductFigure>
              <Caption>The chat before: themes in prose, with no count and no way back to a person. Recreated with invented data.</Caption>
            </Section>

            <Section id="counts">
              <ClaimH2>Counts read as 18 of 24, and both sides open</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                The chat first answered about a single interview, and I moved it up to the whole
                study. With 24 interviews a percent hides how few people sit behind a claim, so
                the bar reads 18 of 24, and tapping either side opens the quotes behind it. The old paragraph made a team
                reread transcripts to check it, and the count gives the headline at a glance with
                the people one tap away.
              </CaseStudyBody>
              <ProductFigure
                caption="Tapping 18 or 6 opens the people behind the count"
                name="counts-open"
                maxHeight={520}
              >
                <StudyChatShell hideComposer>
                  <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
                  <FridayBar />
                  <QuoteListFigure focus="answer" />
                </StudyChatShell>
              </ProductFigure>
              <Caption>Tapping 18 or 6 opens the people behind the count. Illustrative data.</Caption>
            </Section>

            <Section id="levels">
              <ClaimH2>Each answer lets a team stop at the depth it needs</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A stakeholder needs the sentence and a researcher needs the evidence. Of the eight
                versions of the answer card, these three show the call: the answer leads with a
                sentence and its count, and the quotes sit one tap below. Next to the old paragraph, this format adds the
                count and the people while the sentence still leads.{" "}
                <Placeholder>what the eight versions taught you; where each format works and where
                it doesn&rsquo;t</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueLeadAnswerCompare
                  heading="One question, three formats"
                  subheading="The last keeps the overview and the evidence together. Illustrative data."
                  options={[
                    {
                      id: "text-only",
                      title: "Text only",
                      label: "Text only",
                      costLine: "Works for a quick read. Doesn’t let anyone check the claim.",
                      productScenario: "decision-paragraphs",
                    },
                    {
                      id: "direct-quotes",
                      title: "Direct quotes",
                      label: "Direct quotes",
                      costLine: "Works as proof. Doesn’t say how many people agree.",
                      productScenario: "decision-quotes",
                    },
                    {
                      id: "answer-evidence",
                      title: "Answer and evidence",
                      label: "Answer and evidence",
                      costLine: "Works for both readers. Takes the most room in the thread.",
                      productScenario: "decision-structured",
                    },
                  ]}
                  chosenId="answer-evidence"
                />
              </figure>
            </Section>

            <Section id="data-viz">
              <ClaimH2>Data visualization</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Dialogue&rsquo;s AI picks the chart for each answer, so I designed the set it picks
                from. Each pair below is one template, with the common chart next to mine on the
                same data. The model matches a template to the question and the level of detail
                asked for, and rules cover edge cases, so a thin finding gets a plain line instead
                of a chart. The old answer had no charts, and each chart here reads in one
                glance while keeping the count it rests on.{" "}
                <Placeholder>how the model matches a question to a template, and which Carbon
                guideline you adapted</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueChartLibrary />
              </figure>
              <Caption>Each chart type paired with the common version, with where it works and where it doesn&rsquo;t. Illustrative data.</Caption>
            </Section>

            <Section id="clips">
              <ClaimH2>Playing the clip in place kept the answer in view</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Linking a quote to its session page pulls you away from the answer you were
                checking, and the check usually stopped there. Mei was one of the six who asked
                which Friday, so her quote opens the clip in place from the moment she says it,
                with the transcript following. Video is heavy in a chat panel, so it loads only
                on tap. Checking a quote used to mean leaving the answer, and now the
                detail plays inside it without slowing the read.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="system">
                  <div className={`dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}>
                    <ClipQuotes />
                  </div>
                  <DialogueProductFigure
                    scenario="clip-player"
                    title="The clip playing in the chat, with Mei's transcript line highlighted"
                  />
                </DialogueRachelFrame>
              </figure>
              <Caption>A quote opens its clip right where the answer is. Illustrative data.</Caption>
            </Section>

            <Section id="thin-data">
              <ClaimH2>Thin findings say so and stay easy to check</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                2 of 5 lapsed buyers mentioned a damaged first order. Shown like 18 of 24 it
                would read as a pattern, so the answer carries a quiet line, &lsquo;Early signal,
                2 people&rsquo;. The old answer stated thin and strong findings the same
                way, and the flag keeps the read fast while saying when it rests on two people. &lsquo;Add to my plan&rsquo;
                copies the answer and its count into a prompt for the team&rsquo;s own tools. I have no outcome numbers, so next
                I&rsquo;d test whether flagged findings change what teams plan.{" "}
                <Placeholder>why the cutoff sits where it does, and what would change your
                mind</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="system">
                  <DialogueProductFigure
                    scenario="thin-data"
                    title="The thin-data answer with its Early signal flag and the Add to my plan beat"
                  />
                </DialogueRachelFrame>
              </figure>
              <Caption>
                A thin finding gets flagged, then becomes a prompt for the next study.
                Illustrative data.
              </Caption>
            </Section>

            <Section id="measure">
              <ClaimH2>I&rsquo;d measure whether teams get answers faster without skipping the detail</ClaimH2>
              <StatusLine>Proposed, no results yet</StatusLine>
              <CaseStudyBody>
                In the product I&rsquo;d track clip plays per answer, how often source quotes get
                opened, answers shared or exported, and thin-data flags that a team follows up.
                From teams I&rsquo;d ask whether they trusted an answer enough to share it and how
                long checking it took.
              </CaseStudyBody>
              <CaseStudyBody>
                Speed alone would mislead, so I&rsquo;d read it next to quote opens. None of this tells me whether a checked answer led to a better product decision,
                and I haven&rsquo;t run it with Dialogue&rsquo;s customers.{" "}
                <Placeholder>which signal you&rsquo;d watch first, and what result would make you
                change the design</Placeholder>
              </CaseStudyBody>
            </Section>

            <section
              id="takeaway"
              className="cs-takeaway"
              style={{
                scrollMarginTop: 96,
              }}
            >
              <ScrollReveal>
                <p className="cs-takeaway__text">
                  I redesigned Dialogue&rsquo;s answer so research teams get to an insight fast
                  without losing the detail behind it, working inside Dialogue&rsquo;s own system.
                </p>
              </ScrollReveal>
            </section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
