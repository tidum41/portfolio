import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ScrollReveal, EntranceStagger, EntranceItem } from "@/components/ScrollReveal";
import { CASE_STUDY_ENTRANCE_DEFAULTS } from "@/lib/motion";
import { getCaseStudy } from "@/lib/sanity/queries";
import type { Stat as StatData, TocItem } from "@/lib/sanity/queries";

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

const TOC_ITEMS: TocItem[] = [
  { _key: "t1", id: "problem",  label: "Problem"  },
  { _key: "t2", id: "solution", label: "Solution" },
  { _key: "t3", id: "process",  label: "Process"  },
  { _key: "t4", id: "impact",   label: "Impact"   },
];

// ── Layout primitives — match ucla-sublease exactly ───────────────────────────

// `noReveal` — for a section that sits above the fold (right after the hero,
// which itself skips ScrollReveal for the same reason): the page-level
// crossfade in AnimationProvider already reveals it, so wrapping it in its
// own ScrollReveal double-fades and reads as a flicker. Below-fold sections
// keep the normal scroll-triggered reveal.
function Section({ id, children, noReveal = false }: { id: string; children: React.ReactNode; noReveal?: boolean }) {
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-section-label)",
      fontWeight: 400,
      letterSpacing: "0.02em",
      color: "var(--color-text-tertiary)",
      margin: "0 0 16px",
    }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-sans-medium)",
      fontSize: "var(--fs-h2)",
      fontWeight: "var(--fw-h2)" as React.CSSProperties["fontWeight"],
      lineHeight: "var(--lh-h2)",
      letterSpacing: "var(--ls-h2)",
      color: "var(--color-text-primary)",
      margin: "0 0 24px",
    }}>
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      letterSpacing: "0.1px",
      color: "var(--color-text-secondary)",
      margin: "0 0 16px",
    }}>
      {children}
    </p>
  );
}

// Renders a Sanity/fallback body string as separate paragraphs, split on blank lines.
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((p, i) => (
        <Body key={i}>{p.trim()}</Body>
      ))}
    </>
  );
}

// Media wrapper — same card treatment as the subleasing case study's embeds
function MediaCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: "var(--radius-card)",
      overflow: "hidden",
      boxShadow: "0 0 0 1.5px var(--color-border-subtle) inset",
      ...style,
    }}>
      {children}
    </div>
  );
}

// Stat card — same accent-subtle card style as the subleasing case study
function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{
      background: "var(--color-accent-subtle)",
      borderRadius: 8,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <span style={{ display: "flex", flexShrink: 0, lineHeight: 0 }}>{icon}</span>
      <p style={{
        fontFamily: "var(--font-sans-medium)",
        fontSize: "var(--fs-stat)",
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: "-0.5px",
        fontVariantNumeric: "tabular-nums",
        color: "var(--color-text-primary)",
        margin: 0,
      }}>
        {value}
      </p>
      <p style={{
        fontSize: "var(--fs-meta)",
        lineHeight: 1.5,
        color: "var(--color-text-secondary)",
        margin: 0,
      }}>
        {label}
      </p>
    </div>
  );
}

// Icons
function IconPlay() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="var(--color-accent)" stroke="none" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

// ── Metadata ──────────────────────────────────────────────────────────────────

const METADATA = [
  { label: "Role",          values: ["Self-ran"] },
  { label: "Timeline",      values: ["2021"] },
  { label: "Tools",         values: ["DaVinci Resolve", "Photoshop", "Fujifilm XS10", "Tamron 17-70 f/2.8"] },
  { label: "Collaborators", values: ["SteelSeries", "DROP", "Glorious", "KBDfans"] },
];

// ── Fallback content — real copy, source of truth until authored in Sanity Studio ──

const FB = {
  tocItems: TOC_ITEMS,
  heroTagline: "YouTube · Personal · 2021",
  heroTitle: "Personal YouTube, 1M+ views",
  problemLabel: "The Problem",
  problemHeading: "Custom Keyboards were hard to learn about",
  problemBody:
`During the pandemic, I learned about the custom mechanical keyboard hobby. I had a cheap gaming keyboard and wanted to modify it to sound and feel better. Diving down the rabbit hole, I learned that info on how to build and modify keyboards was already on YouTube. But reviews on keyboard cases, keycaps, switches, and various other parts were deeply rooted in other communities and added friction for beginners like myself. Reddit, Discord, and Geekhack, were primary sources for learning but hard to use.

There was no single voice producing digestible, well-structured content for people just getting into the hobby. The barrier wasn't the keyboards—it was the information architecture around them.`,

  solutionLabel: "Solution",
  solutionHeading: "Engaging and Structured YouTube videos, with 1M+ Views",
  solutionBody:
`One of my goals was to build a custom keyboard that was affordable and didn't compromise on certain features. Part of this process heavily relied on the "switches," the actual mechanism registering keystrokes. With my Sony A6100 I was new to using at the time, 16 year-old me produced a full review for some budget switches. My first keyboard video amassed over 500K views.

I immersed myself in discord and reddit communities, learning from others and understanding pain points. I covered anything keyboard related in a digestible captivating format for the sake of not only sharing my subjective thoughts, but sharing others' takes as well. I became a reliable creator and established myself within the hobby, such that beginners and enthusiasts alike had the resources to guide their own purchases (and listen to some crispy asmr).`,

  processLabel: "Production Process",
  processHeading: "Digestible, engaging, and structured YouTube videos",
  processBody:
`I started off with a Sony A6100, with no knowledge on how to film besides using the auto setting. I learned how to edit in Premiere Pro, and used my Photoshop skillset to make thumbnails. As I got more serious, I switched to a Fujifilm XS-10 and Tamron 17-70 f/2.8, with 2 small softboxes. This did the trick for me in combination with editing in DaVinci Resolve. I honed in on my craft to intentionally color grade, set up scenes, and story tell through my reviews.

The constraint I held myself to: every video had to be watchable at 1.5× speed. If it wasn't, the pacing was wrong.`,

  impactLabel: "Impact Online and In-Person",
  impactHeading: "Becoming an established creator with hobbyist roots",
  impactBody:
`My online persona was well-received, allowing me to collaborate with KBDFans, one of the original and biggest custom keyboard marketplaces. I also did collaboration videos with bigger names like SteelSeries, Glorious, DROP, and some more creative collaborators like Field Notes and Grovemade.

My heavy online presence ultimately led me to create the NorCal Keyboard Group, an online and in-person community with 700+ members. I helped organize and promote in-person meetups, for enthusiasts of all experiences to come together and nerd out over this mutual love for the game.`,
};

// Local static fallbacks for media — used until these are authored in Sanity Studio.
const LOCAL_HERO_IMAGE    = "/images/sviz/hero-channel-screenshot.png";
const LOCAL_PROCESS_IMAGE = "/images/sviz/process-camera.jpeg";
const LOCAL_SOLUTION_VIDEO = "/images/sviz/solution-video.webm";

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SvizPage() {
  const raw = await getCaseStudy("sviz").catch(() => ({ slug: "sviz" }));

  const cs = {
    ...FB,
    heroImage: undefined as string | undefined,
    processImage: undefined as string | undefined,
    solutionVideo: undefined as string | undefined,
    stats: undefined as StatData[] | undefined,
    ...Object.fromEntries(Object.entries(raw).filter(([, v]) => v != null && (Array.isArray(v) ? v.length > 0 : v !== ""))),
  };

  const stats: StatData[] = cs.stats ?? [
    { _key: "views",  value: "1M+",   label: "total views across the channel" },
    { _key: "first",  value: "500K+", label: "views on the first upload, organic" },
  ];
  const heroImageSrc     = cs.heroImage     ?? LOCAL_HERO_IMAGE;
  const processImageSrc  = cs.processImage  ?? LOCAL_PROCESS_IMAGE;
  const solutionVideoSrc = cs.solutionVideo ?? LOCAL_SOLUTION_VIDEO;

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">

        <aside className="cs-aside">
          <CaseStudyTOC
            items={(cs.tocItems?.length ? cs.tocItems : TOC_ITEMS).map((t) => ({ id: t.id, label: t.label }))}
            backHref="/"
          />
        </aside>

        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>

          <div className="cs-mobile-back">
            <CaseStudyTOC items={[]} backHref="/" mobileBackOnly />
          </div>

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          {/* Staggers in top-to-bottom on route arrival, own "Case Study
              Entrance" DialKit panel — see app/ucla-sublease/page.tsx for the
              full rationale. TOC (aside, above) never participates. */}
          <header className="cs-hero-header" style={{ marginBottom: 64 }}>
            <EntranceStagger active dialKitName="Case Study Entrance" defaults={CASE_STUDY_ENTRANCE_DEFAULTS}>
              <EntranceItem className="cs-hero-tagline-wrap">
                <p className="cs-hero-tagline" style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                  color: "var(--color-text-muted)",
                  margin: "0 0 16px",
                }}>
                  {cs.heroTagline}
                </p>
              </EntranceItem>

              <EntranceItem className="cs-hero-title-wrap">
                <h1 className="cs-hero-title" style={{
                  fontFamily: "var(--font-sans-medium)",
                  fontSize: "var(--fs-hero)",
                  fontWeight: "var(--fw-hero)" as React.CSSProperties["fontWeight"],
                  lineHeight: 1.1,
                  letterSpacing: "var(--ls-hero)",
                  color: "var(--color-text-primary)",
                  margin: "0 0 20px",
                }}>
                  {cs.heroTitle}
                </h1>
              </EntranceItem>

              <EntranceItem className="cs-hero-media-wrap">
                <MediaCard>
                  <Image
                    src={heroImageSrc}
                    alt="sviz YouTube channel"
                    width={1596}
                    height={1388}
                    sizes="(max-width: 750px) 100vw, 750px"
                    style={{ width: "100%", height: "auto", display: "block" }}
                    priority
                  />
                </MediaCard>
              </EntranceItem>

              {/* Metadata — 4-column */}
              <EntranceItem>
                <div className="cs-meta-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${METADATA.length}, 1fr)`, marginTop: 32 }}>
                  {METADATA.map(({ label, values }) => (
                    <div key={label} style={{ padding: "0 24px 0 0" }}>
                      <p style={{ fontFamily: "var(--font-sans-medium)", fontSize: 14, fontWeight: 500, letterSpacing: "normal", color: "var(--color-text-tertiary)", margin: "0 0 8px" }}>
                        {label}
                      </p>
                      {values.map((v) => (
                        <p key={v} style={{ fontSize: 14, fontWeight: 400, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.45, letterSpacing: "-0.1px" }}>
                          {v}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </EntranceItem>
            </EntranceStagger>
          </header>

          <article style={{ minWidth: 0 }}>

            {/* ── Problem ──────────────────────────────────────────────────── */}
            <Section id="problem" noReveal>
              <SectionLabel>{cs.problemLabel}</SectionLabel>
              <H2>{cs.problemHeading}</H2>
              <Paragraphs text={cs.problemBody} />
            </Section>

            {/* ── Solution ─────────────────────────────────────────────────── */}
            <Section id="solution">
              <SectionLabel>{cs.solutionLabel}</SectionLabel>
              <H2>{cs.solutionHeading}</H2>
              <div className="cs-stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, margin: "0 0 28px" }}>
                {stats.map((s: StatData) => (
                  <Stat key={s._key ?? s.value} icon={s.value.includes("500") ? <IconCamera /> : <IconPlay />} value={s.value} label={s.label} />
                ))}
              </div>
              <Paragraphs text={cs.solutionBody} />
              <MediaCard style={{ margin: "24px 0 8px", aspectRatio: "16/9" }}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={solutionVideoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </MediaCard>
            </Section>

            {/* ── Process ──────────────────────────────────────────────────── */}
            <Section id="process">
              <SectionLabel>{cs.processLabel}</SectionLabel>
              <H2>{cs.processHeading}</H2>
              <Paragraphs text={cs.processBody} />

              <MediaCard style={{ margin: "24px auto 8px", maxWidth: 420 }}>
                <Image
                  src={processImageSrc}
                  alt="Filming setup for a keyboard review"
                  width={3024}
                  height={4032}
                  sizes="(max-width: 420px) 100vw, 420px"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </MediaCard>
            </Section>

            {/* ── Impact ───────────────────────────────────────────────────── */}
            <Section id="impact">
              <SectionLabel>{cs.impactLabel}</SectionLabel>
              <H2>{cs.impactHeading}</H2>
              <Paragraphs text={cs.impactBody} />
            </Section>

          </article>
        </div>
      </div>
    </div>
  );
}
