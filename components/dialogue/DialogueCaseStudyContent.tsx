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
const LEVELS_KEPT: ReasonRow = { kind: "pro", text: "Starts at the count. Each level is one tap away." };
const LEVELS_EXPLORED: ReasonRow = { kind: "con", text: "Asks for depth before you know if the count matters." };
const REASON_ICON = { pro: Check, con: X } as const;

/* P15 item 5: the variant letter and the mark share one 16px column, so the letter, the icon and both
   text lines start on the same two edges. */
function LevelReasoning({ letter, label, reasoning }: { letter: string; label: string; reasoning: ReasonRow }) {
  const Icon = REASON_ICON[reasoning.kind];
  return (
    <div className="dlg-reason">
      <p className="dlg-reason__row dlg-reason__row--label dialogue-caption__label">
        <span className="dlg-reason__key">{letter}</span>
        <span>{label}</span>
      </p>
      <p className="dlg-reason__row">
        <span className="dlg-reason__key dialogue-lib__mark" data-kind={reasoning.kind} aria-hidden><Icon size={16} weight="bold" /></span>
        <span>{reasoning.text}</span>
      </p>
    </div>
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
            tagline="Dialogue AI, Case Study, Contract 2026"
            title={DIALOGUE_TITLE}
            metadata={[
              { _key: "role", label: "Role", values: ["Product designer (contract)"] },
              { _key: "timeline", label: "Timeline", values: ["Dec 2025 to Mar 2026"] },
              { _key: "team", label: "Team", wide: true, values: [<Placeholder key="t">team names and roles</Placeholder>] },
              { _key: "scope", label: "Scope", values: ["Product design", "Prototyping in code"] },
            ]}
          >
            <div className="cs-hero-media-frame">
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="hero">
                    <DialogueDemoVideo src="/dialogue/motion/live-hero-ask.mp4" poster="/dialogue/motion/live-hero-ask.jpg" label="The question is typed and sent, and the answer arrives as a count" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
            </div>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <p className="cs-hero-body">
              Dialogue runs AI-moderated interviews, and each study gets a chat. I redesigned its
              answer so a research team can move fast on an insight and still check the people behind it.
            </p>
            <Caption>The final answer: a count of everyone interviewed, with each side one tap from its people. Recorded from my live code recreation.</Caption>
            <Section id="problem">
              <Kicker>The moment</Kicker>
              <ClaimH2>The chat answered in seconds, but nobody could tell how many agreed</ClaimH2>
              <p className="dlg-constraint">[DRAFT, Mudit to reword] A fixed 415px panel, and research teams I knew only through Dialogue&rsquo;s customer stories, including Kalshi&rsquo;s share-out by tomorrow morning.</p>
              <CaseStudyBody>
                Priya, a researcher at Hearthside, owes her team a share-out by tomorrow morning. She asks the study chat how shoppers read &lsquo;Arrives by Friday&rsquo; and gets a fluent paragraph.
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
              <Caption>How Dialogue&rsquo;s chat answers today: plain prose under the question, with no count. Recreated in code.</Caption>
            </Section>

            <Section id="levels">
              <Kicker>The turn</Kicker>
              <ClaimH2>Every level at once was too slow, so depth became optional</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                I first assumed every answer should carry every level of detail: the count, its chart, the people on each side and the source clip. The deepest detail seemed like the most useful.
              </CaseStudyBody>
              <CaseStudyBody>
                In my build, the open player pushed the count out of view, so a PM scrolled back up for the one number they came for. Depth had to be something the reader opens.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <p className="dlg-demo-pair__label dialogue-caption__label">First try: every level, every time</p>
                <DialogueRachelFrame tone="problem">
                  <StaticFigure figure="levels-every">
                    <DialogueDemoVideo src="/dialogue/motion/variant-every-full.mp4" poster="/dialogue/motion/variant-every-full.jpg" label="The first try: tapping a side of the count opens its people and a clip at once, then folds back" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>Each tap opens every level for one side at once, its people and a playing clip, then it folds back.</Caption>
              <CaseStudyBody>
                Priya&rsquo;s PM wants the sentence and a skeptical director wants the people. I built two ways to reach each level: A, a depth picker by the composer, and B, toggles inside the answer.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <div className="dlg-demo-pair">
                  <div>
                    <LevelReasoning letter="A" label="Explored: pick a depth before asking" reasoning={LEVELS_EXPLORED} />
                    <DialogueRachelFrame tone="problem">
                      <DialogueDemoVideo src="/dialogue/motion/variant-picker-full.mp4" poster="/dialogue/motion/variant-picker-full.jpg" label="A depth picker by the composer sets the level before the question is asked" />
                    </DialogueRachelFrame>
                  </div>
                  <div>
                    <LevelReasoning letter="B" label="Kept: depth opens inside the answer" reasoning={LEVELS_KEPT} />
                    <DialogueRachelFrame tone="solution">
                      <DialogueDemoVideo src="/dialogue/motion/variant-toggles-full.mp4" poster="/dialogue/motion/variant-toggles-full.jpg" label="The answer opens at the insight. Each toggle adds a level under it, down to the clip of a quote, and Insight steps back out." />
                    </DialogueRachelFrame>
                  </div>
                </div>
              </figure>
              <Caption>A asks for depth up front. B starts at the insight, then opens its people and their clip on a tap.</Caption>
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
                    <DialogueDemoVideo src="/dialogue/motion/live-side.mp4" poster="/dialogue/motion/live-side.jpg" label="Each side of the count opens 2 of its shoppers, and the chevron folds them back" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>Each side opens 2 of its shoppers, and the chevron folds them back.</Caption>
              <CaseStudyBody>
                Each side opens with 2 quotes, picked by <Placeholder>how the 2 shown quotes are picked</Placeholder>, and the rest open inside the answer.
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
                    <DialogueDemoVideo src="/dialogue/motion/live-clip.mp4" poster="/dialogue/motion/live-clip.jpg" label="Tapping Mei&rsquo;s quote plays her clip in place; tapping again closes it" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>The player opens under the quote with its span marked on the scrubber. Tap the quote again to close it.</Caption>
            </Section>

            <Section id="data-viz">
              <Kicker>Compare a segment</Kicker>
              <ClaimH2>Charts count people out of their own group</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A segment is a level only some readers open. A small group can sit beside a large one, and a percent hides that, so each chart template I adapted from IBM Carbon counts people out of their own group.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>how the model matches a question to a template, and which Carbon rule you bent</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueChartLibrary templates />
              </figure>
              <Caption>Four templates, each with the Carbon chart it started from. Pick one to see its answer.</Caption>
            </Section>

            <Section id="thin-data">
              <Kicker>Flag thin data</Kicker>
              <ClaimH2>Two people get a flag, and no chart</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Some levels are too thin to open. A bar for two people would read as a pattern, so under three people the answer drops the chart, flags an early signal and offers questions the same sessions can answer with a count.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>why the cutoff sits under 3, and what Dialogue measures that set it</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="system">
                  <StaticFigure figure="thin-followups">
                    <DialogueDemoVideo src="/dialogue/motion/live-thin.mp4" poster="/dialogue/motion/live-thin.jpg" label="A thin answer flags its early signal and offers follow-up questions; tapping one answers it with a count" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>The flag says the count is thin, and a tapped follow-up counts the same lapsed buyers. Recorded from my live code recreation.</Caption>
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
