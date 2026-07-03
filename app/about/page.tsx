"use client";

import CDPlayer from "@/components/CDPlayer";

const EXPERIENCE = [
  { company: "JOOLA",             role: "Design Lead",           dates: "2024 – Present" },
  { company: "Beacons AI",        role: "Product Design Intern",  dates: "Summer 2024"    },
  { company: "Dialogue AI",       role: "Product Design",         dates: "2023 – 2024"    },
  { company: "Soka Records",      role: "Design Consultant",      dates: "2023"            },
  { company: "The Mousepad Co",   role: "Co-Founder",             dates: "2022"            },
];

const ORGS = [
  { name: "UCLA Product Space",       role: "Member"       },
  { name: "Campus Events Commission", role: "Photographer" },
];

const SOCIALS = [
  { label: "linkedin", href: "https://www.linkedin.com/in/muditmahajan14/" },
  { label: "x",        href: "https://x.com/muditm14" },
  { label: "email",    href: "mailto:muditmahajan@g.ucla.edu" },
  { label: "resume",   href: "#" },
];

// Placeholder tile — replace bg with actual photo when available
function PhotoTile({ style }: { style?: React.CSSProperties }) {
  return <div style={{ background: "var(--color-placeholder)", borderRadius: 4, ...style }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 12,
      letterSpacing: "0.03em",
      color: "var(--color-text-muted)",
      margin: "0 0 20px",
      fontFamily: "var(--font-sans)",
    }}>{children}</p>
  );
}

export default function AboutPage() {
  return (
    <div style={{ paddingInline: "var(--page-px)", paddingTop: 40, paddingBottom: 120 }}>
    <div style={{
      fontFamily: "var(--font-sans)",
      maxWidth: "var(--content-max-w)",
      marginInline: "auto",
    }}>

      {/* ── Photo bento ── */}
      <section style={{ marginBottom: 28, maxWidth: 340 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
          gap: 8,
        }}>
          {/* Left: one tall photo */}
          <PhotoTile style={{ aspectRatio: "3/4" }} />

          {/* Right: two stacked photos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <PhotoTile style={{ aspectRatio: "4/3" }} />
            <PhotoTile style={{ aspectRatio: "3/4" }} />
          </div>
        </div>
      </section>

      {/* ── Social links — centered below photos ── */}
      <nav aria-label="Social links" style={{
        display: "flex",
        justifyContent: "center",
        gap: 24,
        marginBottom: 56,
      }}>
        {SOCIALS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto") || href === "#" ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="nav-link"
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationThickness: "1px",
            }}
          >{label}</a>
        ))}
      </nav>

      {/* ── Bio ── */}
      <section style={{
        maxWidth: 680,
        marginBottom: 80,
      }}>
        <h1 style={{
          fontFamily: "var(--font-sans)",
          fontSize: 32,
          fontWeight: 400,
          lineHeight: "38px",
          letterSpacing: "-0.8px",
          color: "var(--color-text-primary)",
          margin: "0 0 8px",
        }}>hello hello, i&apos;m mudit</h1>

        <p style={{
          fontSize: 14,
          lineHeight: "21px",
          color: "var(--color-text-muted)",
          margin: "0 0 24px",
        }}>B.S. Cognitive Science | UCLA &apos;27</p>

        <p style={{
          fontSize: 15,
          lineHeight: "24px",
          letterSpacing: "0.1px",
          color: "var(--color-text-secondary)",
          margin: "0 0 16px",
        }}>
          I&apos;m a designer because I love connecting people through thoughtful interactions. I grew up on
          the internet, shaped by communities and rabbit holes that taught me thoughtful craft turns
          ordinary moments into ones worth returning to. What I make is meant to be beautiful and
          functional, but mostly it&apos;s meant to give people a moment of joy they didn&apos;t expect.
        </p>

        <p style={{
          fontSize: 15,
          lineHeight: "24px",
          color: "var(--color-text-secondary)",
          margin: "0 0 8px",
        }}>When I&apos;m not building, I&apos;m</p>

        <ul style={{
          fontSize: 15,
          lineHeight: "28px",
          color: "var(--color-text-secondary)",
          margin: 0,
          paddingLeft: 20,
        }}>
          <li>shooting concerts for iconic artists and venues 📸</li>
          <li>building keyboards on youtube (1M+ views!) ⌨️</li>
          <li>winning a national table tennis title 🏓</li>
          <li>3D printing functional art</li>
          <li>running 🏃‍</li>
        </ul>
      </section>

      {/* ── CD Player ── */}
      <section style={{
        marginBottom: 80,
      }}>
        <SectionLabel>drag my favorite CDs!</SectionLabel>
        <CDPlayer />
      </section>

      {/* ── Experience ── */}
      <section style={{
        marginBottom: 80,
      }}>
        <SectionLabel>experience</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {EXPERIENCE.map(({ company, role, dates }, i) => (
            <div key={company} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: i < EXPERIENCE.length - 1 ? "1px solid var(--color-border-subtle)" : undefined,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 24, background: "var(--color-placeholder)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>{company}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>{role}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, flexShrink: 0 }}>{dates}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Organizations ── */}
      <section style={{
        marginBottom: 80,
      }}>
        <SectionLabel>i&apos;m part of</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ORGS.map(({ name, role }, i) => (
            <div key={name} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: i < ORGS.length - 1 ? "1px solid var(--color-border-subtle)" : undefined,
            }}>
              <p style={{ fontSize: 15, color: "var(--color-text-primary)", margin: 0 }}>{name}</p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>{role}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
    </div>
  );
}
