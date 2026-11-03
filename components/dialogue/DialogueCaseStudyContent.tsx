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
  { id: "data-viz", label: "Data visualization" },
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
const LEVELS_KEPT: ReasonRow = { kind: "pro", text: "Opens at the insight, with the count. Each level is one tap away." };
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
              { _key: "scope", label: "Scope", values: ["Product design", "Prototyping in code"] },
            ]}
          >
            <div className="cs-hero-media-frame">
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="hero">
                    <DialogueDemoVideo src="/dialogue/motion/live-hero-ask.mp4" poster="/dialogue/motion/live-hero-ask.jpg" label="The question is typed and sent, the count arrives, and tapping 225 brings Ana's quote under it, with pills for the others in that group" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
            </div>
            <Caption>The final answer: 225 of 300 shoppers. Tapping the 225 brings Ana&rsquo;s quote under it, with a pill for each other person in that group. Recorded from my live code recreation. Illustrative data.</Caption>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <p className="cs-hero-body">
              Dialogue runs AI-moderated interviews, and each study gets a chat. I redesigned its
              answer so a research team can move fast on an insight and still check the people behind it.
            </p>
            <Section id="problem">
              <Kicker>The moment</Kicker>
              <ClaimH2>Teams needed answers fast, and the detail got lost</ClaimH2>
              <p className="dlg-constraint">Priya and Hearthside are an illustrative scenario, and every figure on this page uses invented data.</p>
              <CaseStudyBody>
                Priya, a researcher at Hearthside, needs one claim for tomorrow&rsquo;s share-out. She asks the study chat how shoppers read &lsquo;Arrives by Friday&rsquo; and gets a fluent paragraph.
              </CaseStudyBody>
              <CaseStudyBody>
                A fast answer and a deep one pull apart. The paragraph reads in seconds and hides the people behind each claim, and finding them means leaving it.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="problem">
                  <StaticFigure figure="problem-before">
                    <DialogueDemoStill src="/dialogue/motion/variant-before-full.jpg" label="Dialogue today: one fluent paragraph under the question, with &ldquo;Many found&rdquo; underlined and noted as an unstated count" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>How Dialogue&rsquo;s chat answers today, recreated in code. &ldquo;Many found&rdquo; stands in for a count the answer never states. Illustrative data.</Caption>
              <p className="dlg-constraint">Two constraints: Dialogue&rsquo;s fixed 448px chat panel, and teams I knew only through Dialogue&rsquo;s customer stories, where Kalshi sets the bar at a share-out by tomorrow morning.</p>
            </Section>

            <Section id="levels">
              <Kicker>The turn</Kicker>
              <ClaimH2>Every level at once was too slow, so depth became optional</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                I first assumed every answer should carry every level of detail, from the insight at the top down to the people and their source clips. The deepest detail seemed like the most useful.
              </CaseStudyBody>
              <CaseStudyBody>
                A prototype check on my own build showed the open player pushed the count out of view, and I had to scroll back up for the one number I came for. Depth had to be something the reader opens.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <p className="dlg-demo-pair__label dialogue-caption__label">First try: every level, every time</p>
                <DialogueRachelFrame tone="problem">
                  <StaticFigure figure="levels-every">
                    <DialogueDemoVideo src="/dialogue/motion/variant-every-full.mp4" poster="/dialogue/motion/variant-every-full.jpg" label="Tapping the 75 opens its people. Tapping Mei opens her clip, and the player pushes the count out of view until the chevron folds it back." />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>My first try opened each level below the last. By the time Mei&rsquo;s clip plays, the count it explains has scrolled out of view. Illustrative data.</Caption>
              <CaseStudyBody>
                Priya&rsquo;s PM wants the sentence and a skeptical director wants the people. I built two ways to reach each level: A, a depth picker by the composer, and B, toggles inside the answer.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <div className="dlg-demo-pair">
                  <div>
                    <LevelReasoning letter="A" label="Explored: pick a depth before asking" reasoning={LEVELS_EXPLORED} />
                    <DialogueRachelFrame tone="problem">
                      <DialogueDemoVideo src="/dialogue/motion/variant-picker-full.mp4" poster="/dialogue/motion/variant-picker-full.jpg" label="A depth picker by the composer. Picking Chart, typing the question and sending it returns the count with its bar." />
                    </DialogueRachelFrame>
                  </div>
                  <div>
                    <LevelReasoning letter="B" label="Kept: depth opens inside the answer" reasoning={LEVELS_KEPT} />
                    <DialogueRachelFrame tone="solution">
                      <DialogueDemoVideo src="/dialogue/motion/variant-toggles-full.mp4" poster="/dialogue/motion/variant-toggles-full.jpg" label="The answer opens at the insight. Chart and People each add one level under it, and every quote already carries its play button." />
                    </DialogueRachelFrame>
                  </div>
                </div>
              </figure>
              <Caption>In B the toggles stay where they are, so one tap on Insight brings the count back. Illustrative data.</Caption>
              <CaseStudyBody>
                The clip is the deepest level and the heaviest to load, so it loads only when a quote&rsquo;s play button is tapped and starts at the moment the quote was said.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="solution">
                  <StaticFigure figure="clip-open">
                    <DialogueDemoStill src="/dialogue/motion/live-clip.jpg" label="Ana&rsquo;s quote open under the head line &ldquo;picked from the 225&rdquo;, with her clip player inside the answer" />
                  </StaticFigure>
                </DialogueRachelFrame>
              </figure>
              <Caption>Ana&rsquo;s clip opens under her quote, inside the answer. Illustrative data.</Caption>
            </Section>

            <Section id="counts">
              <Kicker>Read the count</Kicker>
              <ClaimH2>Every claim leads with how many, and both sides open</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                The answer format took 8 versions to settle. The count is the level everyone reads, so it leads, and I iterated on standard two-bar charts until a single bar read quicker in the 448px panel.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <div className="dlg-demo-pair">
                  <div>
                    <DialogueRachelFrame tone="problem">
                      <DialogueChartLibrary countsExplored />
                    </DialogueRachelFrame>
                  </div>
                  <div>
                    <p className="dlg-demo-pair__label dialogue-caption__label">Shipped: one bar with two sides</p>
                    <DialogueRachelFrame tone="solution">
                      <StaticFigure figure="counts-open">
                        <DialogueDemoVideo src="/dialogue/motion/live-side.mp4" poster="/dialogue/motion/live-side.jpg" label="Tapping 75 swaps the 225 shoppers for the 75 unsure, and tapping 225 swaps them back" />
                      </StaticFigure>
                    </DialogueRachelFrame>
                  </div>
                </div>
              </figure>
              <Caption>The versions run from two bars side by side, to two stacked, to the one bar that shipped. Tapping 75 swaps in two of the unsure shoppers. Illustrative data.</Caption>
            </Section>

            <Section id="data-viz">
              <Kicker>Match the chart</Kicker>
              <ClaimH2>The AI picks a chart from templates I designed</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                The chart follows a rule I wrote. Two short groups fit one bar, and three or more groups, or any label over 26 characters, get one row each, scaled to the 300.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame tone="system">
                  <DialogueChartLibrary answerRows />
                </DialogueRachelFrame>
              </figure>
              <Caption>A long question with long group labels. Both labels would wrap on the bar, so each group gets its own row. Illustrative data.</Caption>
              <CaseStudyBody>
                Each template is adapted from IBM Carbon and counts people out of their own group, since two groups of different size look alike as percents.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueChartLibrary templates />
              </figure>
              <Caption>Three questions, three charts, and one line under each. Illustrative data.</Caption>
              <CaseStudyBody>
                The last rule is for thin data. Under three people the answer swaps its chart for an early-signal flag, with follow-ups the same interviews can count.
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
              <Caption>Two people get a flag, and no chart. A&rsquo;s bar fills its track for two people, so B puts a flag in its place, and a follow-up answers with a count out of 125. Recorded from my live code recreation. Illustrative data.</Caption>
            </Section>

            <Section id="measure">
              <Kicker>What shipped</Kicker>
              <ClaimH2>Counts shipped, and the rest is a concept I&rsquo;d test</ClaimH2>
              <StatusLine>Proposed test, no results yet</StatusLine>
              <CaseStudyBody>
                Everything here beyond the count is a concept I built in code, and none of it has been tested with a research team.
              </CaseStudyBody>
              <CaseStudyBody>
                I&rsquo;d watch time from question to share-out next to how often a side gets opened. Neither tells me whether a checked answer changed a decision, and that&rsquo;s the gap I&rsquo;d ask teams about.
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
                  Fast and deep can share one answer when depth waits for a tap.
                </p>
                <CaseStudyBody>
                  <Placeholder>your learning from the Levels reversal: you opened every level at once, then learned to start from the insight</Placeholder>
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
