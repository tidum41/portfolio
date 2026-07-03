"use client";

import CaseStudyTOC from "@/components/CaseStudyTOC";
import MuxVideoEmbed from "@/components/MuxVideoEmbed";

const TOC_ITEMS = [
  { id: "overview",  label: "Overview"  },
  { id: "research",  label: "Research"  },
  { id: "channel",   label: "Channel"   },
  { id: "impact",    label: "Impact"    },
  { id: "community", label: "Community" },
];

const SVIZ_MUX_ID  = "ldUPCnRBKkv01LNVxS8Pms3xc00Rd6A6e6TVWQMvhMSKw";
const ALLIN_MUX_ID = "5KPB85eNACrhm1lsLFUX2NZT00I00fd00XtEdwXVba1I7A";

// Research stat — 32px bold #2E2E2E per Framer source
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: 32,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.5px",
        color: "var(--color-text-primary)",
        margin: "0 0 8px",
      }}>{value}</p>
      <p style={{
        fontSize: 14,
        lineHeight: "21px",
        color: "var(--color-text-secondary)",
        margin: 0,
        maxWidth: 200,
      }}>{label}</p>
    </div>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 120, paddingBottom: 64, borderBottom: "1px solid var(--color-border-subtle)", marginBottom: 64 }}>
      {children}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-sans)",
      fontSize: 24,
      fontWeight: 500,
      lineHeight: "31.2px",
      letterSpacing: "-0.25px",
      color: "var(--color-text-primary)",
      margin: "0 0 24px",
    }}>{children}</h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 15,
      lineHeight: "24px",
      letterSpacing: "0.1px",
      color: "var(--color-text-secondary)",
      margin: "0 0 16px",
    }}>{children}</p>
  );
}

export default function SvizPage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>

      <div className="cs-layout">

        <aside className="cs-aside">
          <CaseStudyTOC items={TOC_ITEMS} backHref="/" />
        </aside>

        <div style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>

      {/* ── Hero ── */}
      <header style={{ marginBottom: 64 }}>
        {/* Title — HN Medium 48px per Framer source */}
        <h1 style={{
          fontSize: 48,
          fontWeight: 500,
          lineHeight: "52.8px",
          letterSpacing: "-0.5px",
          color: "var(--color-text-primary)",
          margin: "0 0 32px",
        }}>sviz</h1>

        {/* Hero video */}
        <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "0 0 0 1.5px var(--color-border-subtle) inset" }}>
          <MuxVideoEmbed playbackId={SVIZ_MUX_ID} />
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", marginTop: 12, textWrap: "balance" }}>keyboards · sonic experiences · building community</p>

        {/* Metadata grid — below hero */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 40px", marginTop: 40 }}>
          {[
            { label: "Type",      value: "YouTube, Personal" },
            { label: "Started",   value: "2020 – Present" },
            { label: "Role",      value: "Self-ran" },
            { label: "Camera",    value: "Fujifilm XS-10" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-tertiary)", margin: 0, letterSpacing: "-0.25px" }}>{label}</p>
              <p style={{ fontSize: 14, color: "var(--color-text-primary)", margin: 0, letterSpacing: "-0.25px" }}>{value}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── TOC (fixed) + Body ── */}
        <article style={{ minWidth: 0 }}>
          <Section id="overview">
            <H2>Custom keyboards were impossible to learn about</H2>
            <Body>
              When I got into mechanical keyboards in 2020, the learning curve was steep. Information
              was scattered across forums, Discord servers, and Reddit threads with no single place
              for digestible, well-produced video content.
            </Body>
            <Body>
              I started SVIZ to be that resource — honest keyboard reviews with real production
              quality, focused on what actually matters to builders.
            </Body>
          </Section>

          <Section id="research">
            <H2>Keyboard content was scattered. No single voice existed.</H2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px 40px", margin: "32px 0 32px" }}>
              <Stat value="500K+" label="views on first upload, organic" />
              <Stat value="700+"  label="NorCal Keyboard Group members" />
              <Stat value="4"     label="brand collabs (SteelSeries, DROP, Glorious, KBDFans)" />
            </div>
            <Body>
              The first video hit 500K+ views organically — no paid promotion. That reach turned into
              something more durable: a community of builders who actually talk to each other.
            </Body>
          </Section>

          <Section id="channel">
            <H2>Digestible reviews with real production quality</H2>
            <Body>
              Every video follows the same format: unboxing, build breakdown, sound test, and a clear
              verdict. I write, shoot, and edit everything myself. The goal is a video you can watch
              once and actually know whether a keyboard is worth building.
            </Body>

            {/* "All in one" compilation Mux video */}
            <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "var(--radius-card)", overflow: "hidden", margin: "32px 0", boxShadow: "0 0 0 1.5px var(--color-border-subtle) inset" }}>
              <MuxVideoEmbed playbackId={ALLIN_MUX_ID} delay={200} />
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", marginTop: 8, marginBottom: 24, textWrap: "balance" }}>compilation — all in one</p>

            <Body>
              Shot on a Fujifilm XS-10 with the Tamron 17–70. Editing in DaVinci Resolve for the
              grade and timeline. The constraint: every video has to be watchable at 1.5x. If it
              isn&apos;t, the pacing is wrong.
            </Body>
          </Section>

          <Section id="impact">
            <H2>500K views and a community that outlasts any video</H2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "32px 40px", margin: "32px 0 32px" }}>
              <Stat value="500K+" label="views on first upload" />
              <Stat value="1.5×"  label="watchable speed constraint" />
            </div>
            <Body>
              Brand collaborations with SteelSeries, DROP, Glorious, and KBDFans followed organically.
              The channel became a reference point for the NorCal keyboard community.
            </Body>
          </Section>

          <Section id="community">
            <H2>Founded the NorCal Keyboard Group</H2>
            <Body>
              The channel led directly to founding the NorCal Keyboard Group — a local community for
              builders and enthusiasts in Northern California. A Discord server for subscribers grew
              into 700+ members who meet, trade parts, and run group buys together.
            </Body>

            {/* Brand collabs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 32 }}>
              {["SteelSeries", "DROP", "Glorious", "KBDFans"].map((name) => (
                <div key={name} style={{
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "var(--radius-card)",
                  padding: "16px 20px",
                }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>{name}</p>
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
