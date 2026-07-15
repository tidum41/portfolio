"use client";

import Image from "next/image";
import CDPlayer from "@/components/CDPlayer";
import BentoHero from "@/components/BentoHero";
import { ScrollReveal, StaggerReveal, StaggerItem, EntranceStagger, EntranceItem } from "@/components/ScrollReveal";

const LOGO_SCALE = 1.375;
const EXPERIENCE = [
  { company: "JOOLA",               role: "Product Design Intern",       dates: "Summer 2026", description: "pioneers in pickleball & table tennis equipment", logo: "/images/about/logos/joola.avif" },
  { company: "Beacons AI",          role: "Product Designer (contract)", dates: "2026",         description: "via Product Space",                                logo: "/images/about/logos/beacons-ai.avif" },
  { company: "Dialogue AI",         role: "Product Designer (contract)", dates: "2026",         description: "via Product Space",                                logo: "/images/about/logos/dialogue-ai.avif" },
  { company: "Soka Records",        role: "Creative Intern",             dates: "2025",         description: "keshi, boywithuke, starfall, yel",                  logo: "/images/about/logos/soka-records.avif" },
  { company: "The Mousepad Company", role: "Visual Designer",            dates: "2020 – 2022",  description: "mousepads and social media",                        logo: "/images/about/logos/mousepad-company.avif", logoScale: LOGO_SCALE * 1.15 },
];

const ORGS = [
  { name: "UCLA Product Space",       role: "Product Designer"          },
  { name: "Campus Events Commission", role: "Media Production Director" },
];

const SOCIALS = [
  { label: "linkedin", href: "https://www.linkedin.com/in/muditmahajan14/" },
  { label: "x",        href: "https://x.com/muditm14" },
  { label: "email",    href: "mailto:muditmahajan@g.ucla.edu" },
  { label: "resume",   href: "https://drive.google.com/file/d/1SFiqIjwtzkeJ4TEHE7z9_UNWtkyb1ixm/view?usp=sharing" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-display)",
      fontSize: 32,
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: "-0.8px",
      color: "var(--color-text-primary)",
      margin: "0 0 12px",
    }}>{children}</h2>
  );
}

export default function AboutPage() {
  return (
    <div style={{ paddingInline: "var(--page-px)", paddingTop: 40, paddingBottom: 120 }}>

    {/* ── One shared content column for the whole page, same width as
        case-study content (var(--content-max-w), see .cs-layout in
        globals.css) so /about lines up with the rest of the site instead
        of running its own bespoke width. Bio + bento sit side by side
        within it on desktop, collapsing to bento-on-top/bio-below (via
        CSS `order`, see .about-hero in globals.css) at the site's
        standard 767px mobile cutoff. ── */}
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: "var(--content-max-w)", marginInline: "auto" }}>

      {/* ── Bio + bento hero — one continuous entrance cascade; social
          links sit un-animated, nested inside the bento column so they
          stack directly beneath it at every breakpoint. ── */}
      <div style={{ marginBottom: 80 }}>
      <EntranceStagger active className="about-hero">

        <div className="about-hero-bio">
          <EntranceItem>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.8px",
              color: "var(--color-text-primary)",
              margin: "0 0 8px",
            }}>hello hello, i&apos;m mudit</h1>
          </EntranceItem>

          <EntranceItem>
            <p style={{
              fontSize: 14,
              lineHeight: 1.5,
              color: "var(--color-text-muted)",
              margin: "0 0 24px",
            }}>B.S. Cognitive Science | UCLA &apos;27</p>
          </EntranceItem>

          <EntranceItem>
            <p style={{
              fontSize: 15,
              lineHeight: 1.6,
              letterSpacing: "0.1px",
              color: "var(--color-text-secondary)",
              margin: "0 0 16px",
            }}>
              I&apos;m a designer because I love connecting people through thoughtful interactions. I grew up on
              the internet, shaped by communities and rabbit holes that taught me thoughtful craft turns
              ordinary moments into ones worth returning to. What I make is meant to be beautiful and
              functional, but mostly it&apos;s meant to give people a moment of joy they didn&apos;t expect.
            </p>
          </EntranceItem>

          <EntranceItem>
            <p style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              margin: "0 0 8px",
            }}>When I&apos;m not building, I&apos;m</p>
          </EntranceItem>

          <EntranceItem>
            <ul style={{
              fontSize: 15,
              lineHeight: 1.87,
              color: "var(--color-text-secondary)",
              margin: 0,
              paddingLeft: 20,
              listStyleType: "disc",
            }}>
              <li>shooting concerts for iconic artists and venues 📸</li>
              <li>building keyboards on youtube (1M+ views!) ⌨️</li>
              <li>winning a national table tennis title 🏓</li>
              <li>3D printing functional art</li>
              <li>running 🏃‍</li>
            </ul>
          </EntranceItem>
        </div>

        <div className="about-hero-bento-col">
          <EntranceItem style={{ marginBottom: 10 }}>
            <BentoHero
              featured={{ src: "/images/about/bento-large.jpg", alt: "Mudit in London" }}
              top={{ src: "/images/about/bento-top-right.webp", alt: "Getty Villa courtyard" }}
              bottom={{ src: "/images/about/bento-bottom-right.avif", alt: "Sitting by a window" }}
            />
          </EntranceItem>

          <nav aria-label="Social links" style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
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
        </div>

      </EntranceStagger>
      </div>

      {/* ── CD Player ── */}
      <ScrollReveal>
        <section style={{
          marginBottom: 80,
        }}>
          <SectionLabel>drag my favorite CDs!</SectionLabel>
          <CDPlayer style={{ marginTop: 16 }} />
        </section>
      </ScrollReveal>

      {/* ── Experience ── */}
      <section style={{
        marginBottom: 80,
      }}>
        <ScrollReveal><SectionLabel>experience</SectionLabel></ScrollReveal>
        <StaggerReveal style={{ display: "flex", flexDirection: "column" }}>
          {EXPERIENCE.map(({ company, role, dates, description, logo, logoScale }) => (
            <StaggerItem key={company} style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "20px 0",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "var(--color-placeholder)",
                  flexShrink: 0,
                }}>
                  <Image
                    src={logo}
                    alt={`${company} logo`}
                    fill
                    sizes="40px"
                    style={{ objectFit: "contain", padding: 5, transform: `scale(${logoScale ?? LOGO_SCALE})` }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>{company}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>{role}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "4px 0 0" }}>{description}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, flexShrink: 0 }}>{dates}</p>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </section>

      {/* ── Organizations ── */}
      <section style={{
        marginBottom: 80,
      }}>
        <ScrollReveal><SectionLabel>i&apos;m part of</SectionLabel></ScrollReveal>
        <StaggerReveal style={{ display: "flex", flexDirection: "column" }}>
          {ORGS.map(({ name, role }) => (
            <StaggerItem key={name} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
            }}>
              <p style={{ fontSize: 15, color: "var(--color-text-primary)", margin: 0 }}>{name}</p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>{role}</p>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </section>

    </div>
    </div>
  );
}
