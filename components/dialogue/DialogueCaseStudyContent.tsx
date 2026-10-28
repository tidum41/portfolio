"use client";

import dynamic from "next/dynamic";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueChartLibrary from "@/components/dialogue/DialogueChartLibrary";
import DialogueRachelFrame, { DialogueCaption } from "@/components/dialogue/DialogueRachelFrame";
import StaticFigure from "@/components/dialogue/StaticFigure";
import { ScrollReveal } from "@/components/ScrollReveal";
import ClipQuotes from "@/components/dialogue/product/ClipQuotes";
import ParagraphAnswerFigure from "@/components/dialogue/product/scenarios/ParagraphAnswerFigure";
import DialogueDemoVideo from "@/components/dialogue/motion/DialogueDemoVideo";
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
  { id: "clips", label: "Clips" },
  { id: "data-viz", label: "Data visualization" },
  { id: "thin-data", label: "Thin data" },
  { id: "levels", label: "Levels of detail" },
  { id: "measure", label: "Shipped and next" },
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

function ClaimH2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={["cs-claim-h2", className].filter(Boolean).join(" ")}>{children}</h2>;
}

/** Round P8: names the researcher's step above each claim (Rachel Chen kicker). */
function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="cs-kicker dialogue-caption__label">{children}</p>;
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
  tone = "system",
}: {
  tone?: "problem" | "solution" | "system";
  caption: string;
  name: string;
  maxHeight: number;
  children: React.ReactNode;
}) {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame tone={tone}>
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
          { label: "Unsure", value: 75, display: "75 of 300" },
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
              Dialogue runs AI-moderated interviews and gives each study a chat. I redesigned the
              chat&rsquo;s answer so a research team gets to an insight fast without losing the
              detail behind it.
            </p>
            <div className="cs-hero-media-frame">
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="hero">
                    <DialogueDemoVideo src="/dialogue/motion/live-hero-ask.mp4" poster="/dialogue/motion/live-hero-ask.jpg" label="Priya taps a suggested question and the answer streams in as a count" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
            </div>
            <Caption>Tap a suggested question and the answer lands as a count out of 300. Illustrative data.</Caption>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem">
              <Kicker>The moment</Kicker>
              <ClaimH2>The chat answered fast.</ClaimH2>
              <ClaimH2 className="cs-h2--muted">Nobody could check the answer.</ClaimH2>
              <CaseStudyBody>
                Priya, a researcher at Hearthside, owes her team a share-out by tomorrow morning. Her
                real question is how many shoppers stand behind a claim, and a prose answer
                can&rsquo;t say.
              </CaseStudyBody>
              <CaseStudyBody>
                A good answer has to read in seconds and hold up when someone checks it.
              </CaseStudyBody>
              <ProductFigure caption="before" name="problem-before" maxHeight={360} tone="problem">
                <StudyChatShell hideComposer>
                  <UserMessageBubble>How many shoppers misread &lsquo;Arrives by Friday&rsquo;?</UserMessageBubble>
                  <ParagraphAnswerFigure focus="answer" wall />
                </StudyChatShell>
              </ProductFigure>
              <Caption>&lsquo;Many&rsquo; could be 160 or 280 of 300, and the reader can&rsquo;t tell which. Recreated with invented data.</Caption>
            </Section>

            <Section id="counts">
              <Kicker>Read the count, then tap a side</Kicker>
              <ClaimH2>The count is the way into the evidence, and both sides open</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                A bare count asks the reader to trust it. The panel is 448px wide, so I kept the count in
                one bar and made each side open its people.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>what you built before counts, in one line</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="counts-open">
                    <DialogueDemoVideo src="/dialogue/motion/live-side.mp4" poster="/dialogue/motion/live-side.jpg" label="Tapping 75 unsure opens a sample of that side" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>Tapping 75 opens a sample of that side, with the rest one more tap away. Illustrative data.</Caption>
            </Section>

            <Section id="clips">
              <Kicker>Hear the clip</Kicker>
              <ClaimH2>The clip starts at the moment, so checking keeps the thread</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A quote proves itself when you hear it. Tapping one plays its clip from that moment
                inside the answer, and the video loads only on tap.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="clip-open">
                    <DialogueDemoVideo src="/dialogue/motion/live-clip.mp4" poster="/dialogue/motion/live-clip.jpg" label="Tapping Mei&rsquo;s quote plays her clip in place" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>Tapping Mei&rsquo;s quote plays her clip in place, with the transcript following. Illustrative data.</Caption>
            </Section>

            <Section id="data-viz">
              <Kicker>Compare a segment</Kicker>
              <ClaimH2>The AI picks a chart from templates I designed</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Her PM asks whether first-time shoppers differ. The AI picks from templates I
                adapted from IBM Carbon, and each one shows counts out of its own group.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>how the model matches a question to a template, and which Carbon rule
                you bent</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueChartLibrary showTech={false} segmentsFirst />
              </figure>
              <Caption>At study scale a percent can hide a segment of nine people. Illustrative data.</Caption>
            </Section>

            <Section id="thin-data">
              <Kicker>See the thin flag</Kicker>
              <ClaimH2>A thin finding is labelled before anyone shares it</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Two lapsed buyers mentioned damaged orders, and a bar would make that look like a
                pattern. The answer drops the chart and says &lsquo;Early signal, 2 people&rsquo;.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>why the cutoff sits under 3 people, and what Dialogue measures that set it</Placeholder>
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

            <Section id="levels">
              <Kicker>Share it</Kicker>
              <ClaimH2>Depth sits inside one answer, so nobody picks a mode first</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Priya&rsquo;s PM reads the sentence and a skeptical director wants the people. I
                built two ways to reach each level and kept the one where depth opens inside the answer.
              </CaseStudyBody>
              <CaseStudyBody>
                I assumed that honing in on the smallest level of detail would be useful, but it
                might not be feasible or efficient for teams, so depth became optional.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <div className="dlg-demo-pair">
                  <div>
                    <p className="dlg-demo-pair__label dialogue-caption__label">Kept: depth opens inside the answer</p>
                    <p className="dlg-demo-pair__note">Fast by default. Each level costs one more tap.</p>
                    <DialogueRachelFrame tone="solution">
                      <DialogueDemoVideo src="/dialogue/motion/variant-toggles-full.mp4" poster="/dialogue/motion/variant-toggles-full.jpg" label="The answer starts at the insight; the chart, the people and the clip each open on a tap" />
                    </DialogueRachelFrame>
                  </div>
                  <div>
                    <p className="dlg-demo-pair__label dialogue-caption__label">Explored: pick a depth before asking</p>
                    <p className="dlg-demo-pair__note">Predictable. You choose the depth before you see the answer.</p>
                    <DialogueRachelFrame tone="problem">
                      <DialogueDemoVideo src="/dialogue/motion/variant-picker-full.mp4" poster="/dialogue/motion/variant-picker-full.jpg" label="A depth picker by the composer sets the level before the question is asked" />
                    </DialogueRachelFrame>
                  </div>
                </div>
              </figure>
              
              <Caption>The picker works like Dovetail&rsquo;s Fast and Deep modes. Inside the answer, nobody picks a mode first. Illustrative data.</Caption>
            </Section>

            <Section id="measure">
              <Kicker>What shipped</Kicker>
              <ClaimH2>Counts shipped, and I&rsquo;d test the rest on speed and depth together</ClaimH2>
              <StatusLine>Counts shipped. The test is proposed, with no results yet</StatusLine>
              <CaseStudyBody>
                Counts shipped. Clips in place, segment charts and the thin flag are concepts, and
                the answer format took 8 versions to settle.
              </CaseStudyBody>
              <CaseStudyBody>
                I&rsquo;d track time from question to share next to how often a side gets opened,
                and ask teams whether they trusted an answer enough to forward it. The gap is that
                neither tells me whether a checked answer led to a better decision.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>which signal you&rsquo;d watch first</Placeholder>
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
