"use client";

import dynamic from "next/dynamic";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueLeadAnswerCompare from "@/components/dialogue/DialogueLeadAnswerCompare";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import StaticFigure from "@/components/dialogue/StaticFigure";
import { ScrollReveal } from "@/components/ScrollReveal";
import ClipQuotes from "@/components/dialogue/product/ClipQuotes";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import ScaledChatViewport from "@/components/dialogue/product/ScaledChatViewport";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import SourcesRow from "@/components/dialogue/product/SourcesRow";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";
import "@/components/dialogue/product/dialogue-product.css";

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

/** Short TOC labels (Rachel Chen style); the headings carry the full claims. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "study-wide", label: "Study-wide chat" },
  { id: "counts", label: "Counts" },
  { id: "comparison", label: "Comparison" },
  { id: "levels", label: "Levels of detail" },
  { id: "clips", label: "Clips" },
  { id: "thin-data", label: "Thin data" },
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
      <DialogueRachelFrame label={caption} tone="system">
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
              Dialogue runs AI-moderated interviews and turns them into a study site with a chat.
              I redesigned how that chat answers: who said it, and how many.
            </p>
            <div className="cs-hero-media-frame">
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame
                  label="Figure: the answer, its count and its quote"
                  tone="system"
                >
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
            <Caption>One answer, traced to the person who said it; illustrative data.</Caption>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem">
              <ClaimH2>Teams needed to check an answer before sharing it</ClaimH2>
              <CaseStudyBody>
                I did a desk research deep dive on how UX research teams work, using NN/g, Maze,
                User Interviews and IBM Carbon, with no interviews. Dialogue&rsquo;s published
                case studies show teams comparing segments and funnel stages, and sharing
                findings with non-researchers within hours. The chat answered with a theme list,
                lost the subject on a follow-up, and summed up with a table of names.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame label="Recreated with invented data" tone="system">
                  <DialogueProductFigure
                    scenario="problem-paragraphs"
                    title="The chat as it was: a short prose answer with no count and no link back to the interviews"
                  />
                </DialogueRachelFrame>
              </figure>
              <Caption>Recreated with invented data.</Caption>
            </Section>

            <Section id="study-wide">
              <ClaimH2>I moved the chat from one interview to the whole study</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                The chat first answered about a single interview. Teams act on patterns across a
                study, so I moved it up to all 24 interviews. Every answer then had to say how
                much of the study it covered.
              </CaseStudyBody>
              <ProductFigure
                caption="The chat moved from one interview to the whole study"
                name="study-wide"
                maxHeight={520}
              >
                <StudyChatShell hideComposer>
                  <QuerySearchStep searched={24} found={18} />
                </StudyChatShell>
              </ProductFigure>
              <Caption>The chat moved from one interview to the whole study; illustrative data.</Caption>
            </Section>

            <Section id="counts">
              <ClaimH2>Counts read as 18 of 24, and both sides open</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                With 24 interviews a percent hides how few people sit behind a claim. The bar
                reads 18 of 24, and tapping either side opens the quotes behind it.
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
              <Caption>Tapping 18 or 6 opens the people behind the count; illustrative data.</Caption>
            </Section>

            <Section id="comparison">
              <ClaimH2>Comparisons answer with one row per segment</ClaimH2>
              <CaseStudyBody>
                Teams asked how first-time buyers differ from repeat buyers, so comparisons get
                one row per segment, each with its count and a clip. The rows measure different
                claims, free returns for first-time buyers and the Friday promise for repeat
                buyers, and both rest on the screener&rsquo;s segment tags being right.
              </CaseStudyBody>
              <ProductFigure
                caption="Each segment keeps its own count and its own evidence"
                name="comparison-rows"
                maxHeight={520}
              >
                <StudyChatShell hideComposer>
                  <UserMessageBubble>
                    How do first-time and repeat buyers differ?
                  </UserMessageBubble>
                  <ChartVizCard title="Free returns for first-time buyers, the Friday promise for repeat buyers.">
                    <ChartBarList
                      rows={[{ label: "First-time", value: 6, display: "6 of 9", focal: true }]}
                      max={9}
                    />
                    <SourcesRow selectedParticipant="Tomas R." selectedTime="12:04" />
                    <ChartBarList
                      rows={[{ label: "Repeat", value: 7, display: "7 of 10" }]}
                      max={10}
                    />
                    <SourcesRow selectedParticipant="Hannah L." selectedTime="09:18" />
                  </ChartVizCard>
                </StudyChatShell>
              </ProductFigure>
              <Caption>Each segment keeps its own count and its own evidence; illustrative data.</Caption>
            </Section>

            <Section id="levels">
              <ClaimH2>Each answer lets a team stop at the depth it needs</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A stakeholder needs the sentence and a researcher needs the evidence. The answer
                leads with a sentence and its count, and quotes sit one tap below.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame
                  label="Figure: one answer shown at three depths, with the deepest marked as chosen"
                  tone="system"
                >
                  <DialogueLeadAnswerCompare
                    heading="The same answer at three depths"
                    subheading="Each option keeps the question at the top; the difference is how much evidence travels with the answer."
                    options={[
                      {
                        id: "text-only",
                        title: "Text only",
                        label: "Text only",
                        costLine: "Costs: nothing to check the claim against, and nothing to quote.",
                        productScenario: "decision-paragraphs",
                      },
                      {
                        id: "direct-quotes",
                        title: "Direct quotes",
                        label: "Direct quotes",
                        costLine: "Costs: the reader still does the counting.",
                        productScenario: "decision-quotes",
                      },
                      {
                        id: "answer-evidence",
                        title: "Answer and evidence",
                        label: "Answer and evidence",
                        costLine: "Costs: the most room in the thread.",
                        productScenario: "decision-structured",
                      },
                    ]}
                    chosenId="answer-evidence"
                  />
                </DialogueRachelFrame>
              </figure>
              <Caption>
                One answer at three depths; the deepest keeps the count, the quote and the clip;
                illustrative data.
              </Caption>
            </Section>

            <Section id="clips">
              <ClaimH2>Playing the clip in place kept the answer in view</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Linking a quote to its session page pulls you away from the answer you were
                checking, and the check usually stopped there. Mei was one of the six who asked
                which Friday, so her quote opens the clip in place from the moment she says it,
                with the transcript following. Video is heavy in a chat panel, so it loads only
                on tap.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame
                  label="Figure: Mei's quote card over the clip playing in the chat"
                  tone="system"
                >
                  <div className={`dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}>
                    <ClipQuotes />
                  </div>
                  <DialogueProductFigure
                    scenario="clip-player"
                    title="The clip playing in the chat, with Mei's transcript line highlighted"
                  />
                </DialogueRachelFrame>
              </figure>
              <Caption>A quote opens its clip right where the answer is; illustrative data.</Caption>
            </Section>

            <Section id="thin-data">
              <ClaimH2>Thin findings say so and stay easy to check</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                2 of 5 lapsed buyers mentioned a damaged first order. Shown like 18 of 24 it
                would read as a pattern, so the answer carries a grey line, &lsquo;Early signal,
                2 people&rsquo;. &lsquo;Add to my plan&rsquo; copies the answer and its count
                into a prompt for the team&rsquo;s own tools. I have no outcome numbers, so next
                I&rsquo;d test whether flagged findings change what teams plan.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame
                  label="Figure: the thin-data answer with its flag and plan action"
                  tone="system"
                >
                  <DialogueProductFigure
                    scenario="thin-data"
                    title="The thin-data answer with its Early signal flag and the Add to my plan beat"
                  />
                </DialogueRachelFrame>
              </figure>
              <Caption>
                A thin finding gets flagged, then becomes a prompt for the next study;
                illustrative data.
              </Caption>
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
                  I study how UX research teams work, design inside Dialogue&rsquo;s own system,
                  and sweat the small decisions that shape a team&rsquo;s workflow.
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
