"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import CopyEmail from "@/components/CopyEmail";
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
import { ENTRANCE_DEFAULTS } from "@/lib/motion";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-page-title)",
      fontSize: "var(--fs-h2)",
      fontWeight: 400,
      lineHeight: "var(--lh-h2)",
      letterSpacing: "-0.8px",
      color: "var(--color-text-primary)",
      margin: "0 0 var(--cs-h2-mb)",
    }}>{children}</h2>
  );
}

/** Compositor fade-up. Resting opacity is 1 — Framer hidden:0 was eating copy. */
const ABOUT_HERO_STEPS = 5;
const ABOUT_ENTER_MS = Math.round(
  Math.min(
    ENTRANCE_DEFAULTS.stagger,
    ENTRANCE_DEFAULTS.maxSpread / (ABOUT_HERO_STEPS - 1),
  ) * 1000,
);
const enterMs = (step: number) => ABOUT_ENTER_MS * step;

function Enter({
  delay = 0,
  children,
  style,
  playEnter,
  enterEpoch,
}: {
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
  playEnter: boolean;
  enterEpoch: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Finished CSS animations do not restart on the same node. Remove → reflow
  // → add on each non-Back About arrival so keep-alive visits still enter.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("ps3-enter");
    if (!playEnter) return;
    void el.offsetWidth;
    el.classList.add("ps3-enter");
  }, [playEnter, enterEpoch]);

  return (
    <div
      ref={ref}
      className={playEnter ? "ps3-enter" : undefined}
      style={
        playEnter
          ? { ...style, ["--ps3-enter-delay" as string]: `${delay}ms` }
          : style
      }
    >
      {children}
    </div>
  );
}

export default function AboutPageContent({
  visible = true,
  playEnter = false,
  enterEpoch = 0,
}: {
  visible?: boolean;
  playEnter?: boolean;
  enterEpoch?: number;
}) {
  return (
    <div style={{ paddingInline: "var(--page-px)", paddingTop: "var(--space-5)", paddingBottom: "var(--space-9)" }}>
      <div style={{ fontFamily: "var(--font-sans)", maxWidth: "var(--content-max-w)", marginInline: "auto" }}>
        <div style={{ marginBottom: "var(--space-7)" }}>
          <div className="about-hero">
            <div className="about-hero-bio">
              <Enter playEnter={playEnter} enterEpoch={enterEpoch} delay={enterMs(0)}>
                <h1 style={{
                  fontFamily: "var(--font-page-title)",
                  fontSize: "var(--fs-h2)",
                  fontWeight: 400,
                  lineHeight: "var(--lh-h2)",
                  letterSpacing: "-0.8px",
                  color: "var(--color-text-primary)",
                  margin: "0 0 var(--space-2)",
                }}>Hello, I&apos;m Mudit</h1>
              </Enter>

              <Enter playEnter={playEnter} enterEpoch={enterEpoch} delay={enterMs(1)}>
                <p style={{
                  fontSize: "var(--fs-meta)",
                  lineHeight: "var(--lh-meta)",
                  color: "var(--color-text-muted)",
                  margin: "0 0 24px",
                }}>B.S. Cognitive Science | UCLA &apos;27</p>
              </Enter>

              <Enter playEnter={playEnter} enterEpoch={enterEpoch} delay={enterMs(2)}>
                <p style={{
                  fontSize: "var(--fs-body)",
                  lineHeight: "var(--lh-body)",
                  letterSpacing: "var(--ls-body)",
                  color: "var(--color-text-secondary)",
                  margin: "0 0 32px",
                  textWrap: "pretty",
                }}>
                  {ABOUT_BIO}
                </p>
              </Enter>

              <Enter playEnter={playEnter} enterEpoch={enterEpoch} delay={enterMs(3)}>
                <p style={{
                  fontSize: "var(--fs-body)",
                  lineHeight: "var(--lh-body)",
                  letterSpacing: "var(--ls-body)",
                  color: "var(--color-text-secondary)",
                  margin: "0 0 4px",
                }}>You can find me</p>
              </Enter>

              <Enter playEnter={playEnter} enterEpoch={enterEpoch} delay={enterMs(4)}>
                <ul style={{
                  fontSize: "var(--fs-body)",
                  lineHeight: "var(--lh-body)",
                  letterSpacing: "var(--ls-body)",
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
              <Enter playEnter={playEnter} enterEpoch={enterEpoch} delay={enterMs(1)} style={{ marginBottom: 5 }}>
                <BentoHero
                  featured={{ src: "/images/about/bento-large.jpg", alt: "Mudit in London" }}
                  top={{ src: "/images/about/bento-top-right.webp", alt: "Getty Villa courtyard" }}
                  bottom={{ src: "/images/about/bento-bottom-right.avif", alt: "Sitting by a window" }}
                  priority={visible}
                />
              </Enter>

              <nav aria-label="Social links" style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
              }}>
                {SOCIALS.map((item) =>
                  "copyEmail" in item ? (
                    <CopyEmail
                      key={item.label}
                      unstyled
                      className="nav-link"
                      style={{
                        fontSize: "var(--fs-meta)",
                        color: "var(--color-text-secondary)",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        textDecorationThickness: "1px",
                      }}
                    >
                      {item.label}
                    </CopyEmail>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link"
                      style={{
                        fontSize: "var(--fs-meta)",
                        color: "var(--color-text-secondary)",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        textDecorationThickness: "1px",
                      }}
                    >
                      {item.label}
                    </a>
                  ),
                )}
              </nav>
            </div>
          </div>
        </div>

        <ScrollReveal>
          <section style={{ marginBottom: "var(--space-7)" }}>
            <SectionLabel>Favorite Albums</SectionLabel>
            <CDPlayer active={visible} style={{ marginTop: 16, minHeight: 520 }} variant="about" />
          </section>
        </ScrollReveal>

        <section style={{ marginBottom: "var(--space-7)" }}>
          <ScrollReveal><SectionLabel>Experience</SectionLabel></ScrollReveal>
          <StaggerReveal style={{ display: "flex", flexDirection: "column" }}>
            {EXPERIENCE.filter((e) => !("hidden" in e && e.hidden)).map((exp) => {
              const { company, role, dates, description } = exp;
              const href = "href" in exp ? exp.href : undefined;
              return (
                <StaggerItem key={company} style={{ padding: "20px 0" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
                    <p style={{ fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--color-text-primary)", margin: 0, minWidth: 0 }}>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="nav-link about-link" style={{ color: "inherit" }}>{company}</a>
                      ) : company}
                    </p>
                    <p style={{ fontSize: "var(--fs-sm)", color: "var(--color-text-muted)", margin: 0, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{dates}</p>
                  </div>
                  <p style={{ fontSize: "var(--fs-sm)", color: "var(--color-text-muted)", margin: "2px 0 0" }}>{role}</p>
                  <p style={{ fontSize: "var(--fs-meta)", lineHeight: 1.5, color: "var(--color-text-secondary)", margin: "8px 0 0", maxWidth: "52ch", textAlign: "left" }}>{description}</p>
                </StaggerItem>
              );
            })}
          </StaggerReveal>
        </section>

        <section style={{ marginBottom: "var(--space-7)" }}>
          <ScrollReveal><SectionLabel>Organizations</SectionLabel></ScrollReveal>
          <StaggerReveal style={{ display: "flex", flexDirection: "column" }}>
            {ORGS.map((org) => {
              const { name, role } = org;
              const href = "href" in org ? org.href : undefined;
              const nameStyle: CSSProperties = {
                fontSize: "var(--fs-body)",
                color: "var(--color-text-primary)",
                margin: 0,
                minWidth: 0,
                flex: 1,
              };
              const linkStyle: CSSProperties = { ...nameStyle };
              return (
              <StaggerItem key={name} style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 16,
                padding: "16px 0",
              }}>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link about-link"
                    style={linkStyle}
                  >
                    {name}
                  </a>
                ) : (
                  <p style={nameStyle}>{name}</p>
                )}
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--color-text-muted)", margin: 0, textAlign: "right" }}>{role}</p>
              </StaggerItem>
              );
            })}
          </StaggerReveal>
        </section>
      </div>
    </div>
  );
}
