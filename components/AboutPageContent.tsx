"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import CDPlayer from "@/components/CDPlayer";
import BentoHero from "@/components/BentoHero";
import { ScrollReveal, StaggerReveal, StaggerItem } from "@/components/ScrollReveal";
import {
  ABOUT_BIO,
  ABOUT_INTERESTS,
  EXPERIENCE,
  ORGS,
  SOCIALS,
} from "@/lib/about";
import { useDialKit } from "dialkit";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-page-title)",
      fontSize: 32,
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: "-0.8px",
      color: "var(--color-text-primary)",
      margin: "0 0 12px",
    }}>{children}</h2>
  );
}

/** Compositor fade-up. Resting opacity is 1 — Framer hidden:0 was eating copy. */
function Enter({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className="ps3-enter"
      style={{ ...style, ["--ps3-enter-delay" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function AboutPageContent() {
  const logoDk = useDialKit("About Logos", {
    cursor:      { scale: [1.38, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    joola:       { scale: [1.34, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    beaconsAi:   { scale: [1.38, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    dialogueAi:  { scale: [1.35, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    sokaRecords: { scale: [1.46, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    mousepad:    { scale: [1.6919374999999999, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
  });

  return (
    <div style={{ paddingInline: "var(--page-px)", paddingTop: "var(--space-5)", paddingBottom: "var(--space-9)" }}>
      <div style={{ fontFamily: "var(--font-sans)", maxWidth: "var(--content-max-w)", marginInline: "auto" }}>
        <div style={{ marginBottom: "var(--space-7)" }}>
          <div className="about-hero">
            <div className="about-hero-bio">
              <Enter delay={0}>
                <h1 style={{
                  fontFamily: "var(--font-page-title)",
                  fontSize: 32,
                  fontWeight: 400,
                  lineHeight: 1.2,
                  letterSpacing: "-0.8px",
                  color: "var(--color-text-primary)",
                  margin: "0 0 4px",
                }}>hello hello, i&apos;m mudit</h1>
              </Enter>

              <Enter delay={40}>
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "var(--color-text-muted)",
                  margin: "0 0 24px",
                }}>B.S. Cognitive Science | UCLA &apos;27</p>
              </Enter>

              <Enter delay={80}>
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  letterSpacing: "0.1px",
                  color: "var(--color-text-secondary)",
                  margin: "0 0 32px",
                  textWrap: "pretty",
                }}>
                  {ABOUT_BIO}
                </p>
              </Enter>

              <Enter delay={120}>
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--color-text-secondary)",
                  margin: "0 0 4px",
                }}>You can find me</p>
              </Enter>

              <Enter delay={160}>
                <ul style={{
                  fontSize: 15,
                  lineHeight: 1.87,
                  color: "var(--color-text-secondary)",
                  margin: 0,
                  paddingLeft: 20,
                  listStyleType: "disc",
                }}>
                  {ABOUT_INTERESTS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Enter>
            </div>

            <div className="about-hero-bento-col">
              <Enter delay={40} style={{ marginBottom: 5 }}>
                <BentoHero
                  featured={{ src: "/images/about/bento-large.jpg", alt: "Mudit in London" }}
                  top={{ src: "/images/about/bento-top-right.webp", alt: "Getty Villa courtyard" }}
                  bottom={{ src: "/images/about/bento-bottom-right.avif", alt: "Sitting by a window" }}
                  priority
                />
              </Enter>

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
          </div>
        </div>

        <ScrollReveal>
          <section style={{ marginBottom: "var(--space-7)" }}>
            <SectionLabel>drag my favorite CDs!</SectionLabel>
            <CDPlayer style={{ marginTop: 16, minHeight: 520 }} variant="about" />
          </section>
        </ScrollReveal>

        <section style={{ marginBottom: "var(--space-7)" }}>
          <ScrollReveal><SectionLabel>experience</SectionLabel></ScrollReveal>
          <StaggerReveal style={{ display: "flex", flexDirection: "column" }}>
            {EXPERIENCE.filter((e) => !("hidden" in e && e.hidden)).map(({ slug, company, role, dates, description, logo }) => {
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
              );
            })}
          </StaggerReveal>
        </section>

        <section style={{ marginBottom: "var(--space-7)" }}>
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
