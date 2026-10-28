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
  "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.";

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
        total={300}
        segments={[
          { label: "Read it as this Friday", value: 225, display: "225 of 300", focal: true },
          { label: "Did not", value: 75, display: "75 of 300" },
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
              Dialogue runs AI-moderated user interviews and turns each study into a site with a
              chat, where UX research teams ask questions and share answers with product teams. I
              redesigned that answer so a team can surface an insight quickly without losing the
              detail behind it, and part of it shipped.
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
            <Caption>One answer at study scale, with the people behind it a tap away. Illustrative data.</Caption>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem">
              <ClaimH2>The chat answered fast, in prose nobody could check</ClaimH2>
              <CaseStudyBody>
                Dialogue&rsquo;s chat answered in a few sentences of prose, with the evidence a
                few pages away. Research teams share findings with non-researchers, so an answer
                has to be quick to read and easy to check. I worked from desk research on NN/g,
                Maze, User Interviews and IBM Carbon, with no interviews of my own.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>your first try: what did the markdown table answer look like, and
                what made you switch to grouping responses?</Placeholder>
              </CaseStudyBody>
              <ProductFigure caption="before" name="problem-before" maxHeight={420}>
                <StudyChatShell hideComposer>
                  <UserMessageBubble>How many shoppers misread &lsquo;Arrives by Friday&rsquo;?</UserMessageBubble>
                  <ParagraphAnswerFigure focus="answer" wall />
                </StudyChatShell>
              </ProductFigure>
              <Caption>Asked how many, the old chat answered with words like many and some. Recreated with invented data.</Caption>
            </Section>

            <Section id="counts">
              <ClaimH2>The count is the way into the evidence, and both sides open</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                The chat first answered about one interview at a time, and I moved it up to the
                whole study. Each answer leads with a count out of the whole study, and tapping
                either side opens its people, including the ones who didn&rsquo;t say it. A
                stakeholder reads the headline at a glance, and a skeptic can check the minority
                in one tap.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>why open the side that didn&rsquo;t say it, when other tools only
                count citations? Confirm before naming Marvin&rsquo;s citation counts or
                Maze&rsquo;s coverage percent, and say what pushback you got from Dialogue&rsquo;s
                team.</Placeholder>
              </CaseStudyBody>
              <ProductFigure
                caption="Tapping 75 opens the shoppers who did not read it as this Friday"
                name="counts-open"
                maxHeight={520}
              >
                <StudyChatShell hideComposer>
                  <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
                  <FridayBar />
                  <QuoteListFigure focus="answer" />
                </StudyChatShell>
              </ProductFigure>
              <Caption>Tapping 75 opens the shoppers who didn&rsquo;t read it as this Friday. Illustrative data.</Caption>
            </Section>

            <Section id="levels">
              <ClaimH2>Depth sits inside one answer, so nobody picks a mode first</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A stakeholder wants the sentence and a researcher wants the evidence. Other
                research tools split this into a quick mode and a deep mode, which makes the
                reader choose depth before seeing the answer. I layered depth inside one answer,
                and that card takes the most room in the thread.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>the answer card went through 8 versions: which one failed most
                clearly, and did you consider a quick and deep toggle? Confirm before naming
                Dovetail&rsquo;s Fast and Deep modes or Marvin&rsquo;s Quick Answer.</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueLeadAnswerCompare
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
                  chosenFirst
                />
              </figure>
              <Caption>Text is quickest and quotes go deepest, so the chosen answer carries both. Illustrative data.</Caption>
            </Section>

            <Section id="data-viz">
              <ClaimH2>The AI picks a chart from templates I designed</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Dialogue&rsquo;s AI picks the chart for each answer, so I designed the templates it
                picks from, adapting IBM Carbon&rsquo;s chart guidance. Each pair shows the common
                chart next to my version on the same data. The call most teams would question is
                counts over percents, because a filtered segment can still be nine people inside a
                big study.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>how does the model match a question to a template today, and which
                Carbon rule did you bend for a 448px chat panel?</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueChartLibrary showTech={false} segmentsFirst />
              </figure>
              <Caption>At study scale a percent can hide a segment of nine people. Illustrative data.</Caption>
            </Section>

            <Section id="clips">
              <ClaimH2>The clip starts at the moment, so checking keeps the thread</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Inline clips already exist in other research tools, so the work here is in the
                details. Mei&rsquo;s quote opens her clip at the moment she asks which Friday,
                with the transcript following. Video is heavy in a chat panel, so it loads only
                on tap.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>did you try linking out to the session modal first, and what made in
                place win? Confirm before naming Dovetail&rsquo;s inline clip carousel.</Placeholder>
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
              <Caption>A quote opens its clip at the moment it was said. Illustrative data.</Caption>
            </Section>

            <Section id="thin-data">
              <ClaimH2>A thin finding is labelled before anyone shares it</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                When only two people raise something, a bar would make it look like a pattern.
                The answer drops the chart and carries a quiet line, &lsquo;Early signal, 2
                people&rsquo;, with the clip one tap away. &lsquo;Add to my plan&rsquo; turns that
                line into a prompt for the next study.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>why does the cutoff sit under 3 people, and what evidence would make
                you move it?</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="system">
                  <DialogueProductFigure
                    scenario="thin-data"
                    title="The thin-data answer with its Early signal flag and the Add to my plan beat"
                  />
                </DialogueRachelFrame>
              </figure>
              <Caption>Two people get an early-signal line and no chart. Illustrative data.</Caption>
            </Section>

            <Section id="measure">
              <ClaimH2>I&rsquo;d know it worked if teams share faster and still open the quotes</ClaimH2>
              <StatusLine>Proposed, no results yet</StatusLine>
              <CaseStudyBody>
                Speed alone would mislead, so I&rsquo;d read how fast an answer gets shared next to
                how often its quotes get opened. I haven&rsquo;t run this with Dialogue&rsquo;s
                customers, and none of it shows whether a checked answer led to a better product
                decision.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>which signal would you watch first, and what result would make you
                change the design?</Placeholder>
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
                <CaseStudyBody>
                  <Placeholder>one learning in your words: what would you do differently on the
                  next answer surface?</Placeholder>
                </CaseStudyBody>
              </ScrollReveal>
            </section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
