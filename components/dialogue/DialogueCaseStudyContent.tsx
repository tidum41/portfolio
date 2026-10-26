"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueLeadAnswerCompare from "@/components/dialogue/DialogueLeadAnswerCompare";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueHeroMoment from "@/components/dialogue/DialogueHeroMoment";
import { HERO_QUESTION } from "@/components/dialogue/product/scenarios/HeroChatCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import type { DialogueProductScenario } from "@/components/dialogue/product/DialogueProductScenario";
import "@/components/dialogue/product/dialogue-product.css";
import DialogueRachelFrame, {
  DialogueCaption,
  type DialogueFrameTone,
} from "@/components/dialogue/DialogueRachelFrame";
import { DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";

function frameToneFromLabel(label: string): DialogueFrameTone {
  if (label.startsWith("Problem:")) return "problem";
  if (label.startsWith("Solution:")) return "solution";
  return "system";
}

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

/** Round O (where insights come from): sections and TOC per design/stories/dialogue-round-o.md. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "context", label: "Context" },
  { id: "surface", label: "Surface" },
  { id: "levels", label: "Levels of detail" },
  { id: "whole-study", label: "Whole study" },
  { id: "depth", label: "More depth" },
  { id: "moment", label: "The moment" },
  { id: "counts", label: "Counts" },
  { id: "few", label: "Few responses" },
  { id: "happened", label: "What happened" },
  { id: "next", label: "Next" },
];

function Section({
  id,
  children,
  noReveal = false,
  separated = false,
}: {
  id: string;
  children: React.ReactNode;
  noReveal?: boolean;
  /** Round O: the Next section sits after a hairline with a 72px gap. */
  separated?: boolean;
}) {
  const inner = noReveal ? <>{children}</> : <ScrollReveal>{children}</ScrollReveal>;
  return (
    <section
      id={id}
      className="dialogue-cs-section"
      style={{
        scrollMarginTop: 96,
        paddingBottom: 0,
        marginBottom: "var(--dialogue-section-gap)",
        ...(separated
          ? {
              marginTop: 72,
              borderTop: "1px solid var(--color-border-subtle)",
              paddingTop: "var(--dialogue-section-gap)",
            }
          : {}),
      }}
    >
      {inner}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-sans-medium)",
        fontSize: "var(--fs-h2)",
        fontWeight: "var(--fw-h2)" as React.CSSProperties["fontWeight"],
        lineHeight: "var(--lh-h2)",
        letterSpacing: "var(--ls-h2)",
        color: "var(--color-text-primary)",
        margin: "0 0 24px",
        maxWidth: 640,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </h2>
  );
}

function ProductFigureBlock({
  scenario,
  title,
  assetId,
  wrapRaster,
  frameLabel,
  frameTone,
}: {
  scenario: DialogueProductScenario;
  title: string;
  assetId?: string;
  wrapRaster?: RasterAnnotator;
  frameLabel?: string;
  frameTone?: DialogueFrameTone;
}) {
  const tone = frameTone ?? (frameLabel ? frameToneFromLabel(frameLabel) : "system");
  const media = (
    <DialogueRachelFrame label={frameLabel} tone={tone}>
      <DialogueProductFigure scenario={scenario} title={title} assetId={assetId} />
    </DialogueRachelFrame>
  );
  const wrapped = assetId && wrapRaster ? wrapRaster(assetId, media) : media;
  return <figure className="cs-figure dialogue-live-block">{wrapped}</figure>;
}

export function DialogueCaseStudyContent({
  annotateRaster,
  backHref = "/",
}: {
  annotateRaster?: RasterAnnotator;
  backHref?: string;
}) {
  const wrap = annotateRaster;

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
            metadata={[
              {
                _key: "team",
                label: "Team",
                wide: true,
                values: [
                  <>
                    <span className="cs-meta-name">Benjamin Lo</span>
                    <span className="cs-meta-role">Co-founder, CEO</span>
                  </>,
                  <>
                    <span className="cs-meta-name">Justin Hoang</span>
                    <span className="cs-meta-role">Co-founder, CPO</span>
                  </>,
                ],
              },
              {
                _key: "scope",
                label: "Scope",
                values: ["Interaction design", "Visual design", "Prototyping"],
              },
            ]}
          >
            <>
              {wrap
                ? wrap(
                    "D-01",
                    <div className="cs-hero-media-frame dialogue-hero-media dialogue-hero-joola">
                      <DialogueHeroMoment />
                    </div>,
                  )
                : (
                    <div className="cs-hero-media-frame dialogue-hero-media dialogue-hero-joola">
                      <DialogueHeroMoment />
                    </div>
                  )}
            </>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <div style={{ marginBottom: "var(--dialogue-section-gap)" }}>
              <CaseStudyBody>
                The goal of this project was to hone in on where insights come from. A team
                should be able to go from an answer down to the real moment someone said it.
              </CaseStudyBody>
            </div>

            <Section id="context">
              <H2>Context</H2>
              <CaseStudyBody>
                Dialogue runs AI-moderated interviews for UX research teams and turns them into
                a study site with a chat you can ask questions in. I designed how that chat
                answers.
              </CaseStudyBody>
            </Section>

            <Section id="surface">
              <H2>The answers stopped at the surface</H2>
              <CaseStudyBody>
                The chat answered in a confident paragraph with a couple of quotes cited
                underneath. It read well, but it only had one level of detail. There was no way
                to tell how many people an answer stood on, and no way to get from a quote to
                the moment it was said. &ldquo;Most participants&rdquo; could mean almost
                everyone or a handful.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="problem-paragraphs"
                title="Study chat answer as it was: a prose paragraph with quote cards cited underneath and no count"
                wrapRaster={wrap}
                frameLabel="The answer as it was. Quotes, but no count."
                frameTone="problem"
              />
            </Section>

            <Section id="levels">
              <H2>Levels of detail</H2>
              <CaseStudyBody>
                I wanted the answer to work at different depths. A summary is enough when
                you&rsquo;re skimming. A count tells you how much to trust it. Quotes give you
                people&rsquo;s words, and the clip gives you the moment itself. The idea was
                that you could stop at whichever level you need and go deeper from there.
              </CaseStudyBody>
            </Section>

            <Section id="whole-study">
              <H2>Moving from one interview to the whole study</H2>
              <CaseStudyBody>
                The chat originally answered questions about a single interview. That&rsquo;s
                useful when you&rsquo;re reviewing one session, but the insights a team acts on
                usually come from across a study. Keeping the chat per interview would also mean
                a count could never be more than one person. So the chat moved up a level and
                answers across all 24 interviews. Everything after this depends on it, because
                once an answer covers a whole study, it has to say how much of the study it
                covers.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="scope-headers"
                title="The chat header at two scopes: per interview, muted, beside the whole study"
                wrapRaster={wrap}
                frameLabel="Whole study: the chat's scope, from one interview to all 24."
              />
            </Section>

            <Section id="depth">
              <H2>Bringing more depth to answers</H2>
              <CaseStudyBody>
                I put the same question through a few formats. Text only was the fastest to
                read, but it gave you nowhere to go. Direct quotes kept people&rsquo;s actual
                words, but with enough of them the overview disappears and you do the
                summarizing yourself. Each one had the level the other was missing. The version
                I kept puts a short answer and its count on top, with the quotes underneath as
                evidence.
              </CaseStudyBody>
              <DialogueLeadAnswerCompare
                question={HERO_QUESTION}
                annotateRaster={wrap}
                options={[
                  {
                    id: "paragraphs",
                    label: "Text only",
                    title: "Text only",
                    productScenario: "decision-paragraphs",
                    rasterAssetId: "D-04",
                  },
                  {
                    id: "quote-list",
                    label: "Direct quotes",
                    title: "Direct quotes",
                    productScenario: "decision-quotes",
                    rasterAssetId: "D-05",
                  },
                  {
                    id: "structured",
                    label: "Answer and evidence",
                    title: "Answer and evidence",
                    productScenario: "decision-structured",
                    rasterAssetId: "D-06",
                  },
                ]}
              />
            </Section>

            <Section id="moment">
              <H2>Watching the moment without leaving the chat</H2>
              <CaseStudyBody>
                The deepest level is the clip. One option was linking out to the session page,
                which is the usual pattern. The tradeoff is that it pulls you away from the
                answer you were checking. Playing the clip inside the chat keeps the answer and
                its evidence in one place. Tapping a response plays it from where the
                participant says it, with the transcript highlighting along.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="inline-clip"
                title="Clip playing inside the chat answer, with the speaker's line highlighted in the synced transcript"
                wrapRaster={wrap}
              />
            </Section>

            <Section id="counts">
              <H2>Counts you can open</H2>
              <CaseStudyBody>
                The bar reads 18 of 24 instead of a percent, because with this few interviews a
                percent hides how few people are behind it. Tapping the 6 of 24 who
                didn&rsquo;t struggle opens their quotes too.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="counts"
                title="The count bar with the 6 of 24 segment open, showing its quote cards beneath"
                wrapRaster={wrap}
              />
            </Section>

            <Section id="few">
              <H2>When a finding rests on few responses</H2>
              <CaseStudyBody>
                Counts made a new problem visible. A finding can rest on many responses or very
                few, and the design has to work for both. One answer said 4 of 24 interviews
                mentioned autofill skipping the apartment field on mobile. Shown the same way
                as 18 of 24, it read like a trend. Four people is a lead, not a pattern. So
                answers that rest on little now say so right under the count, and the quotes and
                clips stay just as reachable, so a small finding can still be checked in depth.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="thin-data-slim"
                title="Thin-data answer with a plain text count reading Based on 4 of 24 interviews"
                wrapRaster={wrap}
                frameLabel="Few responses: the answer states its count in plain text."
              />
            </Section>

            <Section id="happened">
              <H2>What happened</H2>
              <CaseStudyBody>
                Dialogue&rsquo;s team adopted the study-wide chat and the count bars. The
                thin-data flags went in too. I don&rsquo;t have outcome numbers.
              </CaseStudyBody>
            </Section>

            <Section id="next" separated>
              <H2>What I&rsquo;d test next</H2>
              <CaseStudyBody>
                A thin finding is usually a reason to study something further. &ldquo;Add to my
                plan&rdquo; copies a prompt that can be pasted into any agent, and it carries
                the context of what the original plan was based on. I&rsquo;d test whether
                teams use it to turn weak signals into their next study, and whether
                stakeholders who can open the evidence stop asking who said that.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="thin-data-prompt"
                title="The thin-data answer with Add to my plan tapped, showing the copied prompt and the context it carries"
                wrapRaster={wrap}
              />
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
