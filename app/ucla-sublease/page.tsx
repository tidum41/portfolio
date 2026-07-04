import React from "react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getCaseStudy } from "@/lib/sanity/queries";
import type { CompRow as CompRowData, TocItem, PhonePos } from "@/lib/sanity/queries";

function pp(pos: PhonePos | undefined) {
  if (!pos) return {};
  const { videoX, videoY, videoScale, insetTop, insetBottom, insetSide, screenRadius } = pos;
  return {
    ...(videoX     != null && { videoX }),
    ...(videoY     != null && { videoY }),
    ...(videoScale != null && { videoScale }),
    ...(insetTop   != null && { insetTop }),
    ...(insetBottom!= null && { insetBottom }),
    ...(insetSide  != null && { insetSide }),
    ...(screenRadius != null && { screenRadius }),
  };
}

const CaseStudyTOC       = dynamic(() => import("@/components/CaseStudyTOC"));
const PhoneMockup        = dynamic(() => import("@/components/PhoneMockup"));
const PhoneMockupDevPanel = dynamic(() => import("@/components/PhoneMockupDevPanel"));
const QuarterPicker      = dynamic(() => import("@/components/QuarterPicker"));
const DevNavigator       = dynamic(() => import("@/components/DevNavigator"));

const COLOR_WRONG   = "#C62828";
const COLOR_RIGHT   = "#2E7D32";
const COLOR_NEUTRAL = "#757575";

// ── Layout primitives ─────────────────────────────────────────────────────────

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 120, paddingBottom: "var(--section-pb)", marginBottom: "var(--section-gap)" }}>
      <ScrollReveal>{children}</ScrollReveal>
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

function Body({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      letterSpacing: "0.1px",
      color: "var(--color-text-secondary)",
      margin: "0 0 16px",
      ...style,
    }}>
      {children}
    </p>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-stat)",
        fontWeight: 400,
        lineHeight: 1,
        letterSpacing: "-0.5px",
        color: "var(--color-text-primary)",
        margin: "0 0 8px",
      }}>
        {value}
      </p>
      <p style={{
        fontSize: "var(--fs-meta)",
        lineHeight: 1.5,
        color: "var(--color-text-secondary)",
        margin: 0,
        maxWidth: 200,
      }}>
        {label}
      </p>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 4 }}>
      <path d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5" stroke={COLOR_WRONG} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 4 }}>
      <path d="M2 7L5.5 10.5L12 3.5" stroke={COLOR_RIGHT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NeutralIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 4 }}>
      <path d="M2.5 7H11.5" stroke={COLOR_NEUTRAL} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PainPoint({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ color: "var(--color-text-secondary)", fontSize: 20, lineHeight: 1, marginTop: 3, flexShrink: 0, fontWeight: 400 }}>•</span>
      <p style={{ fontSize: 15, lineHeight: "var(--lh-body)", color: "var(--color-text-secondary)", margin: 0, fontWeight: 400 }}>{text}</p>
    </div>
  );
}

function CardBox({ src, alt, label, position }: { src?: string; alt: string; label: string; position?: "left" | "middle" | "right" }) {
  const radius = position === "left"
    ? "var(--radius-card) 0 0 var(--radius-card)"
    : position === "right"
    ? "0 var(--radius-card) var(--radius-card) 0"
    : "0";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ background: "var(--color-placeholder)", borderRadius: radius, overflow: "hidden", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {src
          ? <img src={src} alt={alt} style={{ width: "100%", display: "block", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: 160, background: "var(--color-border-subtle)" }} />
        }
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", margin: 0 }}>{label}</p>
    </div>
  );
}

function CompRow({ type, text }: { type: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      {type === "right"   && <CheckIcon />}
      {type === "wrong"   && <XIcon />}
      {type === "neutral" && <NeutralIcon />}
      <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--color-text-secondary)", margin: 0 }}>{text}</p>
    </div>
  );
}

function ToolCard({ tool, desc }: { tool: string; desc: string }) {
  return (
    <div style={{ background: "var(--color-accent-subtle)", borderRadius: 8, padding: "12px 16px" }}>
      <p style={{ fontFamily: "var(--font-sans-medium)", fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 4px" }}>{tool}</p>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--color-text-secondary)", margin: 0 }}>{desc}</p>
    </div>
  );
}

// ── Static fallbacks ──────────────────────────────────────────────────────────

const FB = {
  tocItems: [
    { _key: "t1", id: "problem",    label: "Problem"           },
    { _key: "t2", id: "research",   label: "Research"          },
    { _key: "t3", id: "process",    label: "Process"           },
    { _key: "t4", id: "decision-1", label: "Design Decision 1" },
    { _key: "t5", id: "decision-2", label: "Design Decision 2" },
    { _key: "t6", id: "decision-3", label: "Design Decision 3" },
    { _key: "t7", id: "decision-4", label: "Design Decision 4" },
    { _key: "t8", id: "solution",   label: "Solution"          },
    { _key: "t9", id: "reflection", label: "Reflection"        },
  ] as TocItem[],
  heroTagline:   "Product Design  ·  Case Study  ·  2026",
  heroTitle:     "Simplifying UCLA subleasing",
  heroBg:        "var(--color-hero-tint)",
  heroMuxId:     "XpkQyhqkEwMLrhDAhNEB2aRWS3wP023sbdbsS2zbY02eg",
  metadata: [
    { _key: "m1", label: "Role",          values: ["Product Designer", "& Frontend"] },
    { _key: "m2", label: "Timeline",      values: ["5 Weeks"] },
    { _key: "m3", label: "Tools",         values: ["Figma", "Google Stitch", "Claude Code"] },
    { _key: "m4", label: "Collaborators", values: ["1 PM", "1 PMM"] },
  ],
  problemLabel: "The Problem",
  problemHeading: "UCLA students struggle with subleasing, using platforms that weren't built for it.",
  problemBody: "Entering my third year, I needed summer housing for my first time outside a dorm. 2 weeks of Reddit threads, Facebook groups, and texting friends-of-friends, I found something. I got lucky and I knew it. I asked friends if they found a place, and kept hearing the same story with different details.",
  problemImageCaption: "left to right — Facebook, ULoop, Reddit",
  painPoints: [
    "No standardized apartment info. Posts are inconsistent in pricing, dates, room details, forcing constant back-and-forth just to get basics.",
    "Platform switching is common. Students juggle Facebook groups, Reddit threads, Instagram stories, and word of mouth with little reliability.",
    "Trust is always a concern. Communicating across informal channels with no verification adds anxiety to a process of high importance.",
  ],
  researchLabel: "Research Insights",
  researchHeading: "We surveyed 60 UCLA students across all years and living situations, then conducted 8 interviews with seekers and renters.",
  researchBody: "My subleasing story turned out to be less unique than I thought, deja vu from conversations with friends scrambling to find a last-minute spot. Seekers lacked confidence in listings, going through multiple points of entry. Listers had no idea why people weren't responding.",
  stats: [
    { _key: "s1", value: "75%", label: "rated the subleasing process as highly stressful, even students who hadn't done it yet" },
    { _key: "s2", value: "83%", label: "said trust and clear listing information were their top priorities" },
    { _key: "s3", value: "70%", label: "reached out to listings on at least 3 different platforms before securing a sublease" },
  ],
  processLabel: "Process",
  processHeading: "With under 5 weeks to build, I owned design and prototyping end-to-end.",
  processBody: "With limited capacity for user testing, I prioritized iteration and feedback rounds. Tight constraints shaped my flexible workflow.",
  processTools: [
    { _key: "p1", tool: "Figma",         desc: "Wireframes, user flows, and component structure to establish hierarchy." },
    { _key: "p2", tool: "Google Stitch", desc: "Explored alternate information architectures to see what held up before moving into detail." },
    { _key: "p3", tool: "Claude Code",   desc: "Built interactions and prototyped in real time, allowing for iteration. I was able to focus on creating a feeling." },
    { _key: "p4", tool: "Vercel",        desc: "Deployment and testing on a more native iOS view." },
  ],
  d1Label: "Design Decision",
  d1Heading: "Condensing apartment info into a standardized format.",
  d1Body: "Based on research insights, I explored card layouts to communicate apartment details without being overwhelming. This is the first interaction with hundreds of listings, so conveying essential info without additional fluff is important.",
  d1CardLabels: ["initial", "condensed", "final"],
  d1CompCol1: [
    { _key: "c1a", type: "right",   text: "Compact format for fast-scanning" },
    { _key: "c1b", type: "wrong",   text: "Thumbnail too small for preview" },
    { _key: "c1c", type: "wrong",   text: "More listings, less intentional scan" },
  ] as CompRowData[],
  d1CompCol2: [
    { _key: "c2a", type: "neutral", text: "Larger card provides hierarchy" },
    { _key: "c2b", type: "neutral", text: "More listings, less intentional scan" },
    { _key: "c2c", type: "right",   text: "Preview image visible + carousel" },
  ] as CompRowData[],
  d1CompCol3: [
    { _key: "c3a", type: "right",   text: "Refined hierarchy with price separate" },
    { _key: "c3b", type: "right",   text: "Location on one line" },
    { _key: "c3c", type: "right",   text: "Verified student indicator" },
  ] as CompRowData[],
  d1Insights: [
    "83% valued trust as their top priority, so a verified student badge on listings and messages, tied to .edu email",
    "Price moved to top left, the first thing eyes notice when scrolling",
    "Students think in distance, not addresses, so showing both together is intuitive",
  ],
  d2Label: "Design Decision",
  d2Heading: "Reviews are sifted and displayed by default.",
  d2Body: "I added an independent layer with aggregated reviews, auto sifted on every listing to provide quick access to otherwise external information. Seekers are able to see real reviews without navigating lengthy forums.",
  d3Label: "Design Decision",
  d3Heading: "The academic calendar is built-in.",
  d3Body: "Subleasing demand follows UCLA's academic calendar, not arbitrary calendar windows. One tap eliminates an initial barrier by filtering date ranges that work for you.",
  d4Label: "Design Decision",
  d4Heading: "Guiding listing creation",
  d4Body: "Creating a listing requires a lot of manual selection. I landed on two listing flows that I would love to A/B test. While both have drawbacks, I landed on the stepped creation as it provides structure that reduces cognitive load by dividing sections.",
  solutionLabel: "Solution",
  solutionHeading: "BruinLease is a dedicated subleasing platform built specifically for UCLA students.",
  solutionBody: "Digestible listings, quarter-based search, verified identities, and in-app messaging.",
  solutionBg: "var(--color-hero-tint)",
  solutionMuxId: "XpkQyhqkEwMLrhDAhNEB2aRWS3wP023sbdbsS2zbY02eg",
  reflectionLabel: "Reflection",
  reflectionItems: [
    { _key: "r1", heading: "Verification works if scaled",                   body: "Verified badges are meaningful callouts, filtering legitimate UCLA students. But right now, our backend only accepts ucla.edu emails. Without opening it to all, the badge adds visual and cognitive noise." },
    { _key: "r2", heading: "Minimalist doesn't mean boring",                 body: "I prioritized information clarity. But the UI ended up flatter than I wanted, resulting in loose hierarchy. More visual texture would make the experience feel less like a prototype and more like a product." },
    { _key: "r3", heading: "Prototyping real time closed the feedback loop", body: "Using Claude Code, I found interaction problems quickly that would have taken longer to work around in Figma. I could refine micro-interactions and visual details through real time code manipulation." },
    { _key: "r4", heading: "If I could do it differently",                   body: "With a bigger time window, I would have run usability tests to measure how long it takes listers to match with leasers, how friction is reduced or added, and feedback from a large user audience to help push iteration." },
  ],
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BruinLeasePage() {
  const raw = await getCaseStudy("ucla-sublease");

  const cs = {
    ...FB,
    problemImage:           undefined as string | undefined,
    decision1CardInitial:   undefined as string | undefined,
    decision1CardCondensed: undefined as string | undefined,
    decision1CardFinal:     undefined as string | undefined,
    homepageComparison:     undefined as string | undefined,
    ueTestingVideo:         undefined as string | undefined,
    oldFlowVideo:           undefined as string | undefined,
    decision1Video:         undefined as string | undefined,
    heroPhonePos:           undefined as import("@/lib/sanity/queries").PhonePos | undefined,
    d2PhonePos:             undefined as import("@/lib/sanity/queries").PhonePos | undefined,
    d3BeforePhonePos:       undefined as import("@/lib/sanity/queries").PhonePos | undefined,
    d3AfterPhonePos:        undefined as import("@/lib/sanity/queries").PhonePos | undefined,
    solutionPhonePos:       undefined as import("@/lib/sanity/queries").PhonePos | undefined,
    ...Object.fromEntries(Object.entries(raw).filter(([, v]) => v != null && (Array.isArray(v) ? v.length > 0 : v !== ""))),
  };

  const tocItems        = (cs.tocItems      ?? FB.tocItems)      as TocItem[];
  const metadata        = (cs.metadata      ?? FB.metadata);
  const stats           = (cs.stats         ?? FB.stats);
  const processTools    = (cs.processTools  ?? FB.processTools);
  const d1CompCol1      = (cs.d1CompCol1    ?? FB.d1CompCol1)    as CompRowData[];
  const d1CompCol2      = (cs.d1CompCol2    ?? FB.d1CompCol2)    as CompRowData[];
  const d1CompCol3      = (cs.d1CompCol3    ?? FB.d1CompCol3)    as CompRowData[];
  const d1CardLabels    = (cs.d1CardLabels  ?? FB.d1CardLabels)  as string[];
  const d1Insights      = (cs.d1Insights    ?? FB.d1Insights)    as string[];
  const painPoints      = (cs.painPoints    ?? FB.painPoints)    as string[];
  const reflectionItems = (cs.reflectionItems ?? FB.reflectionItems);

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <DevNavigator />
      <PhoneMockupDevPanel />
      <div className="cs-layout">

        <aside className="cs-aside">
          <CaseStudyTOC items={tocItems.map(t => ({ id: t.id, label: t.label }))} backHref="/" />
        </aside>

        <div style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>

          {/* ── Hero ───────────────────────────────────────────────────── */}
          <header className="cs-hero-header" style={{ marginBottom: 64 }}>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.01em",
              color: "var(--color-text-muted)",
              margin: "0 0 16px",
            }}>
              {cs.heroTagline}
            </p>
            <h1 style={{
              fontFamily: "var(--font-sans-medium)",
              fontSize: "var(--fs-hero)",
              fontWeight: "var(--fw-hero)" as React.CSSProperties["fontWeight"],
              lineHeight: 1.1,
              letterSpacing: "var(--ls-hero)",
              color: "var(--color-text-primary)",
              margin: "0 0 36px",
            }}>
              {cs.heroTitle}
            </h1>

            <div style={{ background: cs.heroBg, borderRadius: "var(--radius-card)", padding: "40px 24px", display: "flex", justifyContent: "center" }}>
              <div className="pm-hero-wrap" style={{ width: "45%", maxWidth: 280 }}>
                <PhoneMockup
                  muxPlaybackId={cs.heroMuxId}
                  instanceKey="hero"
                  {...pp(cs.heroPhonePos)}
                />
              </div>
            </div>

            {/* Metadata — 4-column, no border */}
            {metadata.length > 0 && (
              <div className="cs-meta-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${metadata.length}, 1fr)`, marginTop: 32 }}>
                {metadata.map(({ _key, label, values }) => (
                  <div key={_key} style={{ padding: "0 24px 0 0" }}>
                    <p style={{ fontFamily: "var(--font-sans-medium)", fontSize: 14, fontWeight: 500, letterSpacing: "normal", color: "var(--color-text-tertiary)", margin: "0 0 8px" }}>{label}</p>
                    {values.map((v) => <p key={v} style={{ fontSize: 14, fontWeight: 400, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.45, letterSpacing: "-0.1px" }}>{v}</p>)}
                  </div>
                ))}
              </div>
            )}
          </header>

          <article style={{ minWidth: 0 }}>

            {/* ── Problem ──────────────────────────────────────────────── */}
            <Section id="problem">
              <SectionLabel>{cs.problemLabel}</SectionLabel>
              <H2>{cs.problemHeading}</H2>
              <Body>{cs.problemBody}</Body>

              {cs.problemImage
                ? <img src={cs.problemImage} alt="Fragmented subleasing platforms" style={{ width: "100%", aspectRatio: "16/7", objectFit: "cover", borderRadius: "var(--radius-card)", display: "block", margin: "24px 0 8px" }} />
                : <div style={{ width: "100%", aspectRatio: "16/7", background: "var(--color-placeholder)", borderRadius: "var(--radius-card)", margin: "24px 0 8px" }} />
              }
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", marginBottom: 28 }}>{cs.problemImageCaption}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {painPoints.map((text, i) => <PainPoint key={i} text={text} />)}
              </div>
            </Section>

            {/* ── Research ─────────────────────────────────────────────── */}
            <Section id="research">
              <SectionLabel>{cs.researchLabel}</SectionLabel>
              <H2>{cs.researchHeading}</H2>

              {/* Stats box with internal dividers */}
              <div style={{ position: "relative", width: "100%", margin: "32px 0 24px" }}>
                <div className="cs-stats-row" style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: 20, borderRadius: 4 }}>
                  {stats.map(({ _key, value, label }, i) => (
                    <React.Fragment key={_key}>
                      {i > 0 && <div className="cs-stats-divider" style={{ width: 1, flexShrink: 0, background: "var(--color-border-subtle)", borderRadius: 8, alignSelf: "stretch" }} />}
                      <div style={{ display: "flex", flexBasis: 0, flexGrow: 1, flexShrink: 0, minWidth: 120 }}>
                        <Stat value={value} label={label} />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ position: "absolute", inset: 0, border: "1.5px solid var(--color-border-subtle)", borderRadius: 4, pointerEvents: "none" }} />
              </div>

              <Body>{cs.researchBody}</Body>
            </Section>

            {/* ── Process ──────────────────────────────────────────────── */}
            <Section id="process">
              <SectionLabel>{cs.processLabel}</SectionLabel>
              <H2>{cs.processHeading}</H2>
              <Body>{cs.processBody}</Body>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 24 }}>
                {processTools.map(({ _key, tool, desc }) => (
                  <ToolCard key={_key} tool={tool} desc={desc} />
                ))}
              </div>
            </Section>

            {/* ── Decision 1 ───────────────────────────────────────────── */}
            <Section id="decision-1">
              <SectionLabel>{cs.d1Label}</SectionLabel>
              <H2>{cs.d1Heading}</H2>
              <Body>{cs.d1Body}</Body>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, margin: "28px 0 20px" }}>
                <CardBox src={cs.decision1CardInitial}   alt="Initial card"   label={d1CardLabels[0] ?? "initial"}   position="left" />
                <CardBox src={cs.decision1CardCondensed} alt="Condensed card" label={d1CardLabels[1] ?? "condensed"} position="middle" />
                <CardBox src={cs.decision1CardFinal}     alt="Final card"     label={d1CardLabels[2] ?? "final"}     position="right" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "16px 0 28px" }}>
                {[d1CompCol1, d1CompCol2, d1CompCol3].map((col, ci) => (
                  <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.map((row) => <CompRow key={row._key} type={row.type} text={row.text} />)}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)", margin: "0 0 12px", fontFamily: "var(--font-sans-medium)", letterSpacing: "-0.1px" }}>
                research insights drove key changes
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {d1Insights.map((point, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", width: "90%" }}>
                    <span style={{ color: "var(--color-accent)", fontSize: 19, lineHeight: 1, marginTop: 3, flexShrink: 0 }}>•</span>
                    <p style={{ fontSize: 14, lineHeight: "var(--lh-body)", color: "var(--color-text-secondary)", margin: 0 }}>{point}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Decision 2 ───────────────────────────────────────────── */}
            <Section id="decision-2">
              <SectionLabel>{cs.d2Label}</SectionLabel>
              <H2>{cs.d2Heading}</H2>
              <Body>{cs.d2Body}</Body>
              {cs.ueTestingVideo && (
                <div style={{ display: "flex", justifyContent: "center", margin: "32px 0" }}>
                  <div className="pm-d2-wrap" style={{ width: "72%", maxWidth: 364 }}>
                    <PhoneMockup
                      videoSrc={cs.ueTestingVideo}
                      showFrame
                      instanceKey="d2"
                      {...pp(cs.d2PhonePos)}
                    />
                  </div>
                </div>
              )}
            </Section>

            {/* ── Decision 3 ───────────────────────────────────────────── */}
            <Section id="decision-3">
              <SectionLabel>{cs.d3Label}</SectionLabel>
              <H2>{cs.d3Heading}</H2>
              <Body>{cs.d3Body}</Body>

              <div style={{ marginTop: 24 }}><QuarterPicker /></div>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", margin: "8px 0 0" }}>
                Selecting a quarter autofills exact move-in and move-out dates.
              </p>

              {(cs.oldFlowVideo || cs.decision1Video) && (
                <div className="pm-d3-row" style={{ display: "flex", gap: 24, justifyContent: "center", margin: "32px 0", alignItems: "flex-start" }}>
                  {cs.oldFlowVideo && (
                    <div className="pm-d3-wrap" style={{ flex: 1, maxWidth: 338, display: "flex", flexDirection: "column", gap: 5 }}>
                      <PhoneMockup
                        videoSrc={cs.oldFlowVideo}
                        showFrame
                        instanceKey="d3-before"
                        {...pp(cs.d3BeforePhonePos)}
                        style={{ border: "2px solid transparent" }}
                      />
                      <p style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", margin: 0 }}>before</p>
                    </div>
                  )}
                  {cs.decision1Video && (
                    <div className="pm-d3-wrap" style={{ flex: 1, maxWidth: 338, display: "flex", flexDirection: "column", gap: 5 }}>
                      <PhoneMockup
                        videoSrc={cs.decision1Video}
                        showFrame
                        instanceKey="d3-after"
                        {...pp(cs.d3AfterPhonePos)}
                        style={{ background: `${COLOR_RIGHT}18`, border: `2px solid ${COLOR_RIGHT}` }}
                      />
                      <p style={{ fontSize: 12, color: COLOR_RIGHT, textAlign: "center", margin: 0, fontWeight: 500 }}>after</p>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* ── Decision 4 ───────────────────────────────────────────── */}
            <Section id="decision-4">
              <SectionLabel>{cs.d4Label}</SectionLabel>
              <H2>{cs.d4Heading}</H2>
              <Body>{cs.d4Body}</Body>
              {cs.homepageComparison
                ? <img src={cs.homepageComparison} alt="BruinLease homepage comparison" style={{ width: "108%", marginLeft: "-4%", display: "block", marginTop: 24, marginBottom: 24 }} />
                : <div style={{ width: "108%", marginLeft: "-4%", aspectRatio: "16/9", background: "var(--color-placeholder)", marginTop: 24, marginBottom: 24 }} />
              }
            </Section>

            {/* ── Solution ─────────────────────────────────────────────── */}
            <Section id="solution">
              <SectionLabel>{cs.solutionLabel}</SectionLabel>
              <H2>{cs.solutionHeading}</H2>
              <Body>{cs.solutionBody}</Body>
              <div style={{ display: "flex", justifyContent: "center", background: cs.solutionBg, borderRadius: "var(--radius-card)", padding: "48px 24px", margin: "32px 0" }}>
                <div className="pm-solution-wrap" style={{ width: "45%", maxWidth: 240 }}>
                  <PhoneMockup
                    muxPlaybackId={cs.solutionMuxId ?? cs.heroMuxId}
                    instanceKey="solution"
                    {...pp(cs.solutionPhonePos)}
                  />
                </div>
              </div>
            </Section>

            {/* ── Reflection ───────────────────────────────────────────── */}
            <Section id="reflection">
              <SectionLabel>{cs.reflectionLabel}</SectionLabel>
              <div className="reflection-grid" style={{ marginTop: 8 }}>
                {reflectionItems.map(({ _key, heading, body }) => (
                  <div key={_key}>
                    <h3 style={{
                      fontFamily: "var(--font-sans-medium)",
                      fontSize: 18,
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      margin: "0 0 8px",
                      lineHeight: 1.35,
                      letterSpacing: "-0.2px",
                    }}>
                      {heading}
                    </h3>
                    <p style={{ fontSize: 14, lineHeight: "var(--lh-body)", color: "var(--color-text-secondary)", margin: 0 }}>
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

          </article>
        </div>
      </div>
    </div>
  );
}
