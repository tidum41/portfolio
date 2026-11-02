"use client";

import { Check, X } from "@phosphor-icons/react/dist/ssr";
import dynamic from "next/dynamic";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueChartLibrary from "@/components/dialogue/DialogueChartLibrary";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import StaticFigure from "@/components/dialogue/StaticFigure";
import { ScrollReveal } from "@/components/ScrollReveal";
import DialogueDemoVideo, { DialogueDemoStill } from "@/components/dialogue/motion/DialogueDemoVideo";
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

/* Levels pair: the reasoning behind each prototype. Check for the kept path, X for the explored one. */
type ReasonRow = { kind: "pro" | "con"; text: string };
const LEVELS_KEPT: ReasonRow = { kind: "pro", text: "Starts at the count. Each level is one tap away." };
const LEVELS_EXPLORED: ReasonRow = { kind: "con", text: "Asks for depth before you know if the count matters." };
const THIN_BAR: ReasonRow = { kind: "con", text: "A full bar for two people reads as a pattern." };
const THIN_FLAG: ReasonRow = { kind: "pro", text: "Says why there is no chart, and offers follow-ups to count." };
const REASON_ICON = { pro: Check, con: X } as const;

/* P15 item 5: the variant letter and the mark share one 16px column. */
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
                    <DialogueDemoVideo src="/dialogue/motion/live-hero-ask.mp4" poster="/dialogue/motion/live-hero-ask.jpg" label="The question is typed and sent, the count arrives, and tapping 225 brings Ana's quote under it" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
            </div>
            <Caption>The final answer: 225 of 300 shoppers, and tapping the 225 brings Ana&rsquo;s quote under it. Recorded from my live code recreation.</Caption>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <p className="cs-hero-body">
              Dialogue runs AI-moderated interviews, and each study gets a chat. I redesigned its
              answer so a research team can move fast on an insight and still check the people behind it.
            </p>
            <Section id="problem">
              <Kicker>The moment</Kicker>
              <ClaimH2>Teams needed answers fast, and the detail got lost</ClaimH2>
              <p className="dlg-constraint">Two constraints: Dialogue&rsquo;s fixed 448px chat panel, and teams I knew only through Dialogue&rsquo;s customer stories, where Kalshi sets the bar at a share-out by tomorrow morning.</p>
              <CaseStudyBody>
                Priya, a researcher at Hearthside, has that deadline. She asks the study chat how shoppers read &lsquo;Arrives by Friday&rsquo; and gets a fluent paragraph.
              </CaseStudyBody>
              <CaseStudyBody>
                Her real question is how many shoppers stand behind each claim, and prose can&rsquo;t say. So I set one principle: every claim shows how many people hold it.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="problem">
                  <StaticFigure figure="problem-before">
                    <DialogueDemoStill src="/dialogue/motion/variant-before-full.jpg" label="Dialogue today: one fluent paragraph under the question, with &ldquo;Many found&rdquo; underlined and noted as an unstated count" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>How Dialogue&rsquo;s chat answers today, recreated in code. &ldquo;Many found&rdquo; stands in for a count the answer never states.</Caption>
            </Section>

            <Section id="levels">
              <Kicker>The turn</Kicker>
              <ClaimH2>Every level at once was too slow, so depth became optional</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                I first assumed every answer should carry every level of detail: the count, its chart, the people on each side and the source clip. The deepest detail seemed like the most useful.
              </CaseStudyBody>
              <CaseStudyBody>
                In my build, a PM had to scroll back up for the one number they came for, so depth had to be something the reader opens.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <p className="dlg-demo-pair__label dialogue-caption__label">First try: every level, every time</p>
                <DialogueRachelFrame tone="problem">
                  <StaticFigure figure="levels-every">
                    <DialogueDemoVideo src="/dialogue/motion/variant-every-full.mp4" poster="/dialogue/motion/variant-every-full.jpg" label="Tapping the 75 opens its people. Tapping Mei opens her clip, and the player pushes the count out of view until the chevron folds it back." />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>My first try opened each level below the last. By the time Mei&rsquo;s clip plays, the count it explains has scrolled out of view.</Caption>
              <CaseStudyBody>
                Priya&rsquo;s PM wants the sentence and a skeptical director wants the people. I built two ways to reach each level: A, a depth picker by the composer, and B, toggles inside the answer.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <div className="dlg-demo-pair">
                  <div>
                    <LevelReasoning letter="A" label="Explored: pick a depth before asking" reasoning={LEVELS_EXPLORED} />
                    <DialogueRachelFrame tone="problem">
                      <DialogueDemoStill src="/dialogue/motion/variant-picker-full.jpg" label="A depth picker by the composer, set to Chart before the question is asked, with the count and bar that come back" />
                    </DialogueRachelFrame>
                  </div>
                  <div>
                    <LevelReasoning letter="B" label="Kept: depth opens inside the answer" reasoning={LEVELS_KEPT} />
                    <DialogueRachelFrame tone="solution">
                      <DialogueDemoVideo src="/dialogue/motion/variant-toggles-full.mp4" poster="/dialogue/motion/variant-toggles-full.jpg" label="The answer opens at the insight. Each toggle adds one level under it, and tapping Ana plays her clip." />
                    </DialogueRachelFrame>
                  </div>
                </div>
              </figure>
              <Caption>In B the toggles stay above the open clip, so one tap on Insight brings the count back.</Caption>
            </Section>

            <Section id="counts">
              <Kicker>Read the count</Kicker>
              <ClaimH2>Every claim leads with how many, and both sides open</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                The count is the level everyone reads, so it leads. A table crowded the 448px panel, so the count became one bar with two labels, and each side opens its people on a tap.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>what you built before counts, in one line</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="counts-open">
                    <DialogueDemoVideo src="/dialogue/motion/live-side.mp4" poster="/dialogue/motion/live-side.jpg" label="Tapping 75 swaps the 225 shoppers for the 75 unsure, and tapping 225 swaps them back" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>With the 225 open, tapping 75 swaps in two of the unsure shoppers, and tapping 225 swaps them back.</Caption>
              <CaseStudyBody>
                Each side opens with 2 quotes, picked by <Placeholder>how the 2 shown quotes are picked</Placeholder>, and the rest open inside the answer.
              </CaseStudyBody>

            </Section>

            <Section id="clips">
              <Kicker>Hear it</Kicker>
              <ClaimH2>A quote plays from its moment, inside the answer</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                The source is the deepest level and the heaviest to load, so the clip loads only on a tap and starts at the moment the quote was said.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="clip-open">
                    <DialogueDemoVideo src="/dialogue/motion/live-clip.mp4" poster="/dialogue/motion/live-clip.jpg" label="From the open 225, tapping Ana&rsquo;s quote plays her clip in place; tapping again closes it" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>Ana&rsquo;s clip opens under her quote and runs only its 14 seconds, 04:10 to 04:24. Tap the quote again to close it.</Caption>
            </Section>

            <Section id="data-viz">
              <Kicker>Match the chart</Kicker>
              <ClaimH2>The AI picks a chart from templates I designed</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A segment is a level only some readers open, so its chart has to read at a glance. 9 of 14 and 88 of 125 look alike as percents, so each template I adapted from IBM Carbon counts people out of their own group.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>how much the model decides versus fixed rules</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueChartLibrary templates />
              </figure>
              <Caption>Each question type gets one chart, with its reason beside it, and By group sits beside the percent chart I ruled out.</Caption>
              <CaseStudyBody>
                Where I departed from Carbon, it was to keep people countable: one highlight on the value the answer is about, and counts printed out of their own group wherever groups differ in size. Carbon has no rule for thin data, so that path is my addition. <Placeholder>which Carbon guideline you bent on purpose</Placeholder>
              </CaseStudyBody>
            </Section>

            <Section id="thin-data">
              <Kicker>Flag thin data</Kicker>
              <ClaimH2>Two people get a flag, and no chart</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Some levels are too thin to open, so under three people the answer swaps its chart for an early-signal flag, with follow-ups the same interviews can count.
              </CaseStudyBody>
              <CaseStudyBody>
                <Placeholder>why the cutoff sits under 3, and what would change your mind</Placeholder>
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <div className="dlg-demo-pair">
                  <div>
                    <LevelReasoning letter="A" label="Explored: a bar for two people" reasoning={THIN_BAR} />
                    <DialogueRachelFrame tone="problem">
                      <DialogueChartLibrary thinNearMiss />
                    </DialogueRachelFrame>
                  </div>
                  <div>
                    <LevelReasoning letter="B" label="Kept: a flag in place of the chart" reasoning={THIN_FLAG} />
                    <DialogueRachelFrame tone="system">
                      <StaticFigure figure="thin-followups">
                        <DialogueDemoVideo src="/dialogue/motion/live-thin.mp4" poster="/dialogue/motion/live-thin.jpg" label="A thin answer flags its early signal and offers follow-up questions; tapping one answers it with a count" />
                      </StaticFigure>
                    </DialogueRachelFrame>
                  </div>
                </div>
              </figure>
              <Caption>A&rsquo;s bar fills its track for two people, so B puts a flag in its place, and a follow-up answers with a count out of 125. Recorded from my live code recreation.</Caption>
            </Section>


            <Section id="measure">
              <Kicker>What shipped</Kicker>
              <ClaimH2>Counts shipped, and the rest is a concept I&rsquo;d test</ClaimH2>
              <StatusLine>Proposed test, no results yet</StatusLine>
              <CaseStudyBody>
                Everything here beyond the count is a concept I built in code, and the answer format took 8 versions to settle.
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
