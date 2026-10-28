"use client";

import { Check, X } from "@phosphor-icons/react/dist/ssr";
import dynamic from "next/dynamic";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueChartLibrary from "@/components/dialogue/DialogueChartLibrary";
import DialogueRachelFrame, { DialogueCaption } from "@/components/dialogue/DialogueRachelFrame";
import StaticFigure from "@/components/dialogue/StaticFigure";
import { ScrollReveal } from "@/components/ScrollReveal";
import ClipQuotes from "@/components/dialogue/product/ClipQuotes";
import DialogueDemoVideo from "@/components/dialogue/motion/DialogueDemoVideo";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";
import "@/components/dialogue/product/dialogue-product.css";

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

/** Short TOC labels (Rachel Chen style); the headings carry the full claims. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "levels", label: "Levels of detail" },
  { id: "counts", label: "Counts" },
  { id: "clips", label: "Clips" },
  { id: "data-viz", label: "Data visualization" },
  { id: "thin-data", label: "Thin data" },
  { id: "measure", label: "Shipped and next" },
  { id: "takeaway", label: "Takeaway" },
];

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
/* Levels pair: the reasoning behind each prototype. The bet leads as one line; under it, the marks
   from earlier Dialogue rounds (Phosphor Check and X, bold 16, .dialogue-lib__mark) plus X for
   the negative: check for the pro, X for the con, minus for the neutral tradeoff that decided it.
   Draft copy for Mudit to revise. */
type ReasonRow = { kind: "pro" | "con"; text: string };
const LEVELS_KEPT: ReasonRow = { kind: "pro", text: "It starts at the count, and each deeper level is one tap inside the answer." };
const LEVELS_EXPLORED: ReasonRow = { kind: "con", text: "It asks for a depth before you know whether the count matters." };
const REASON_ICON = { pro: Check, con: X } as const;

function LevelReasoning({ reasoning }: { reasoning: ReasonRow }) {
  const Icon = REASON_ICON[reasoning.kind];
  return (
    <ul className="dialogue-lib__points dlg-reason">
      <li>
        <span className="dialogue-lib__mark" data-kind={reasoning.kind} aria-hidden><Icon size={16} weight="bold" /></span>
        {reasoning.text}
      </li>
    </ul>
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
              Dialogue runs AI-moderated interviews, and each study gets a chat. I redesigned its
              answer so a research team can move fast on an insight and still check the people behind it.
            </p>
            <p className="cs-hero-body">
              [DRAFT, Mudit to reword] I design in code, so I can iterate fast and own every detail from first idea to the shipped panel.
            </p>
            <div className="cs-hero-media-frame">
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="hero">
                    <DialogueDemoVideo src="/dialogue/motion/live-hero-ask.mp4" ratio="4 / 3" poster="/dialogue/motion/live-hero-ask.jpg" label="The question is typed and sent, and the answer arrives as a count" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
            </div>
            <Caption>The final answer: a count out of 300, with each side one tap from its people. Recorded from my live code recreation, illustrative data.</Caption>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem">
              <Kicker>The moment</Kicker>
              <ClaimH2>The chat answered in seconds, but nobody could tell how many agreed</ClaimH2>
              <p className="dlg-constraint">[DRAFT, Mudit to reword] Nine weeks, a fixed 415px panel, and research teams I knew only through Dialogue&rsquo;s customer stories, including Kalshi&rsquo;s share-out by tomorrow morning.</p>
              <CaseStudyBody>
                Priya, a researcher at Hearthside (a made-up retailer), owes her team a share-out by tomorrow morning. She asks the study chat how shoppers read &lsquo;Arrives by Friday&rsquo; and gets a fluent paragraph.
              </CaseStudyBody>
              <CaseStudyBody>
                Her real question is how many shoppers stand behind each claim, and prose can&rsquo;t say. So the brief became a principle: every claim shows how many people hold it.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="problem">
                  <StaticFigure figure="problem-before">
                    <DialogueDemoVideo src="/dialogue/motion/variant-before-full.mp4" poster="/dialogue/motion/variant-before-full.jpg" label="Dialogue today: the question gets one fluent paragraph, with no count behind any claim" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>How Dialogue&rsquo;s chat answers today: plain prose under the question, with no count. &lsquo;Many&rsquo; could be 160 or 280 of 300. Recreated in code with invented data.</Caption>
            </Section>

            <Section id="levels">
              <Kicker>The turn</Kicker>
              <ClaimH2>Every level at once was too slow, so depth became optional</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                I first assumed every answer should carry every level of detail: the count, its chart, the people on each side and the source clip. The deepest detail seemed like the most useful.
              </CaseStudyBody>
              <CaseStudyBody>
                It slowed teams down, which cuts against the speed Dialogue sells. The open player pushed the count out of view, so a PM scrolled back up for the one number they came for. Depth had to be something the reader opens.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <p className="dlg-demo-pair__label dialogue-caption__label">First try: every level, every time</p>
                <DialogueRachelFrame tone="problem">
                  <StaticFigure figure="levels-every">
                    <DialogueDemoVideo src="/dialogue/motion/variant-every-full.mp4" poster="/dialogue/motion/variant-every-full.jpg" label="The first try: the answer opens the chart, the people and the clip at once, and the count scrolls away" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>The count shows for a moment, then the people and the player push it out of view. Illustrative data.</Caption>
              <CaseStudyBody>
                Priya&rsquo;s PM wants the sentence and a skeptical director wants the people. I built two ways to reach each level: A, a depth picker by the composer, and B, toggles inside the answer.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <div className="dlg-demo-pair">
                  <div>
                    <p className="dlg-demo-pair__label dialogue-caption__label">A, explored: pick a depth before asking</p>
                    <LevelReasoning reasoning={LEVELS_EXPLORED} />
                    <DialogueRachelFrame tone="problem">
                      <DialogueDemoVideo src="/dialogue/motion/variant-picker-full.mp4" poster="/dialogue/motion/variant-picker-full.jpg" label="A depth picker by the composer sets the level before the question is asked" />
                    </DialogueRachelFrame>
                  </div>
                  <div>
                    <p className="dlg-demo-pair__label dialogue-caption__label">B, kept: depth opens inside the answer</p>
                    <LevelReasoning reasoning={LEVELS_KEPT} />
                    <DialogueRachelFrame tone="solution">
                      <DialogueDemoVideo src="/dialogue/motion/variant-toggles-full.mp4" poster="/dialogue/motion/variant-toggles-full.jpg" label="The answer opens at the insight. People adds the chart and the quotes, and tapping Insight steps back out. The depth you pick carries to the next answer." />
                    </DialogueRachelFrame>
                  </div>
                </div>
              </figure>
              <Caption>A works like Dovetail&rsquo;s Fast and Deep modes and asks for depth up front. B starts at the count and goes deeper on a tap. Illustrative data.</Caption>
              <CaseStudyBody>
                So every part that follows stays one tap away.
              </CaseStudyBody>
            </Section>

            <Section id="counts">
              <Kicker>Read the count</Kicker>
              <ClaimH2>Every claim leads with how many, and both sides open</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                The count is the level everyone reads, so it leads. A table crowded the 415px panel, so the count became one bar with two labels, and each side opens its people on a tap.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>what you built before counts, in one line</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="counts-open">
                    <DialogueDemoVideo src="/dialogue/motion/live-side.mp4" poster="/dialogue/motion/live-side.jpg" label="Tapping 75 unsure opens a sample of that side, and it folds away again" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>Tapping 75 opens 2 of the unsure shoppers, and the chevron folds them back into the count. Illustrative data.</Caption>
              <CaseStudyBody>
                Each side opens with 2 quotes, picked by <Placeholder>how the 2 shown quotes are picked</Placeholder>, and +73 more pages in 5 at a time inside the answer.
              </CaseStudyBody>

            </Section>

            <Section id="clips">
              <Kicker>Hear it</Kicker>
              <ClaimH2>A quote plays from its moment, inside the answer</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                The source is the deepest level and the heaviest to load. The clip loads on a tap, starts at the quote&rsquo;s timestamp and folds away when you&rsquo;re done.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="clip-open">
                    <DialogueDemoVideo src="/dialogue/motion/live-clip.mp4" ratio="4 / 3" poster="/dialogue/motion/live-clip.jpg" label="Tapping Mei&rsquo;s quote plays her clip in place, and the chevron closes it" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>The player opens under Mei&rsquo;s quote with her 18:27 to 18:49 span marked on the scrubber, and the chevron closes it. Illustrative data.</Caption>
            </Section>

            <Section id="data-viz">
              <Kicker>Compare a segment</Kicker>
              <ClaimH2>Charts count people out of their own group</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A segment is a level only some readers open. At 300 interviews one can hold nine people, and 67% hides that, so each chart template I adapted from IBM Carbon labels N of its group.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>how the model matches a question to a template, and which Carbon rule you bent</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueChartLibrary showTech={false} only="segments" />
              </figure>
              <Caption>Illustrative data.</Caption>
            </Section>

            <Section id="thin-data">
              <Kicker>Flag thin data</Kicker>
              <ClaimH2>Two people get a flag, and no chart</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Some levels are too thin to open. A bar for 2 of 63 lapsed buyers would read as a pattern, so under three people the answer drops the chart, says &lsquo;Early signal, 2 people&rsquo; and offers to plan the next study.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>why the cutoff sits under 3, and what Dialogue measures that set it</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="system">
                  <DialogueProductFigure
                    scenario="thin-data"
                    title="The thin-data answer with its Early signal flag and the Add to my plan beat"
                  />
                </DialogueRachelFrame>
              </figure>
              <Caption>The early-signal note sits above the plan action, so it&rsquo;s harder to share as a finding. Illustrative data.</Caption>
            </Section>


            <Section id="measure">
              <Kicker>What shipped</Kicker>
              <ClaimH2>Counts shipped, and the rest is a concept I&rsquo;d test</ClaimH2>
              <StatusLine>Counts shipped. The test is proposed, with no results yet</StatusLine>
              <CaseStudyBody>
                Counts shipped in Dialogue. Clips in place, segment charts, the thin flag and depth toggles are concepts, and the answer format took 8 versions to settle.
              </CaseStudyBody>
              <CaseStudyBody>
                I&rsquo;d watch time from question to share-out next to how often a side gets opened. Neither tells me whether a checked answer changed a decision, and that&rsquo;s the gap I&rsquo;d ask teams about.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>which signal you&rsquo;d watch first, and why</Placeholder>
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
