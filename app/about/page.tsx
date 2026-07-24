"use client";

import Image from "next/image";
import CDPlayer from "@/components/CDPlayer";
import BentoHero from "@/components/BentoHero";
import { ScrollReveal, StaggerReveal, StaggerItem, EntranceStagger, EntranceItem } from "@/components/ScrollReveal";
import { FOOTER_LINKS } from "@/lib/site";
import { useDialKit } from "dialkit";

// `slug` keys into the per-logo DialKit crop/scale controls below — kept
// separate from `company` (the display name) so renaming a company never
// silently breaks its dial lookup.
const EXPERIENCE = [
  { slug: "cursor",     company: "Cursor",              role: "Campus Ambassador",           dates: "2026",         description: "leading growth at ucla",                            logo: "/images/about/logos/cursor.png" },
  { slug: "joola",      company: "JOOLA",               role: "Product Design Intern",       dates: "Summer 2026", description: "pioneers in pickleball & table tennis equipment", logo: "/images/about/logos/joola.avif" },
  { slug: "beaconsAi",  company: "Beacons AI",          role: "Product Designer (contract)", dates: "2026",         description: "via Product Space",                                logo: "/images/about/logos/beacons-ai.avif" },
  { slug: "dialogueAi", company: "Dialogue AI",         role: "Product Designer (contract)", dates: "2026",         description: "via Product Space",                                logo: "/images/about/logos/dialogue-ai.avif" },
  { slug: "sokaRecords", company: "Soka Records",       role: "Creative Intern",             dates: "2025",         description: "keshi, boywithuke, starfall, yel",                  logo: "/images/about/logos/soka-records.avif" },
  { slug: "mousepad",   company: "The Mousepad Company", role: "Visual Designer",            dates: "2020 – 2022",  description: "mousepads and social media",                        logo: "/images/about/logos/mousepad-company.avif", hidden: true },
];

const ORGS = [
  { name: "UCLA Product Space",       role: "Product Designer"            },
  { name: "Campus Events Commission", role: "Director of Media Production" },
];

const SOCIALS = FOOTER_LINKS;

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
  // Per-logo scale + crop (pan) controls. Each logo sits in a circular,
  // overflow:hidden frame — offsetX/offsetY shift the image within that
  // frame via transform, and anything pushed past the circle's edge is
  // clipped by the frame itself, which is what gives these an actual crop
  // effect rather than just resizing.
  const logoDk = useDialKit("About Logos", {
    cursor:      { scale: [1.38, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    joola:       { scale: [1.34, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    beaconsAi:   { scale: [1.38, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    dialogueAi:  { scale: [1.35, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    sokaRecords: { scale: [1.46, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    mousepad:    { scale: [1.6919374999999999, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
  });

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
              margin: "0 0 4px",
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
              margin: "0 0 32px",
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
              margin: "0 0 4px",
            }}>You can find me</p>
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
          <EntranceItem style={{ marginBottom: 5 }}>
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
                target={href.startsWith("mailto") ? undefined : "_blank"}
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
          {EXPERIENCE.filter((e) => !e.hidden).map(({ slug, company, role, dates, description, logo }) => {
            const crop = logoDk[slug as keyof typeof logoDk];
            return (
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
                    style={{ objectFit: "contain", padding: 5, transform: `scale(${crop.scale}) translate(${crop.offsetX}px, ${crop.offsetY}px)` }}
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
          );})}
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
