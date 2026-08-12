"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import BentoHero from "@/components/BentoHero";
import { ScrollReveal, StaggerReveal, StaggerItem, EntranceStagger, EntranceItem } from "@/components/ScrollReveal";
import {
  ABOUT_BIO,
  ABOUT_INTERESTS,
  EXPERIENCE,
  ORGS,
  SOCIALS,
} from "@/lib/about";
import { peekSoftNavArrival } from "@/lib/instantNav";
import { useDialKit } from "dialkit";

const CDPlayer = dynamic(() => import("@/components/CDPlayer"), { ssr: false });

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

function DeferredAboutCD() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const target = document.getElementById("about-cd-slot");
    if (!target) return;
    let cancelled = false;
    let idleId = 0;
    const enable = () => {
      if (!cancelled) setReady(true);
    };
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        obs.disconnect();
        if (typeof window.requestIdleCallback === "function") {
          idleId = window.requestIdleCallback(enable, { timeout: 1200 });
        } else {
          enable();
        }
      },
      { rootMargin: "160px 0px" },
    );
    obs.observe(target);
    return () => {
      cancelled = true;
      obs.disconnect();
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [ready]);

  return (
    <section id="about-cd-slot" style={{ marginBottom: "var(--space-7)", minHeight: 520 }}>
      <SectionLabel>drag my favorite CDs!</SectionLabel>
      {ready ? (
        <CDPlayer style={{ marginTop: 16, minHeight: 520 }} variant="about" />
      ) : (
        <div
          aria-hidden
          style={{
            marginTop: 16,
            minHeight: 520,
            borderRadius: "var(--radius-card)",
            background: "var(--color-placeholder)",
          }}
        />
      )}
    </section>
  );
}

/** Experience + orgs — DialKit logos live here so first About paint skips them. */
function AboutBelowFold() {
  const logoDk = useDialKit("About Logos", {
    cursor:      { scale: [1.38, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    joola:       { scale: [1.34, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    beaconsAi:   { scale: [1.38, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    dialogueAi:  { scale: [1.35, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    sokaRecords: { scale: [1.46, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
    mousepad:    { scale: [1.6919374999999999, 0.5, 3, 0.01], offsetX: [0, -20, 20, 1], offsetY: [0, -20, 20, 1] },
  });

  return (
    <>
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
    </>
  );
}

/**
 * About body used by PersistentAboutShell. First paint is hero-only; below-fold
 * (CD / experience DialKit / orgs) mounts on idle after the route is active so
 * Work→About soft-nav isn't competing with that tree on the click frame.
 */
export default function AboutPageContent({ active }: { active: boolean }) {
  const [softArrival] = useState(() => peekSoftNavArrival());
  const [belowFold, setBelowFold] = useState(false);

  useEffect(() => {
    if (!active || belowFold) return;
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    const enable = () => {
      if (!cancelled) setBelowFold(true);
    };
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 700 });
    } else {
      timeoutId = window.setTimeout(enable, 120);
    }
    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [active, belowFold]);

  return (
    <div style={{ paddingInline: "var(--page-px)", paddingTop: "var(--space-5)", paddingBottom: "var(--space-9)" }}>
      <div style={{ fontFamily: "var(--font-sans)", maxWidth: "var(--content-max-w)", marginInline: "auto" }}>
        <div style={{ marginBottom: "var(--space-7)" }}>
          <EntranceStagger active instant={softArrival} className="about-hero">
            <div className="about-hero-bio">
              <EntranceItem>
                <h1 style={{
                  fontFamily: "var(--font-page-title)",
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
                  textWrap: "pretty",
                }}>
                  {ABOUT_BIO}
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
                  {ABOUT_INTERESTS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </EntranceItem>
            </div>

            <div className="about-hero-bento-col">
              <EntranceItem style={{ marginBottom: 5 }}>
                <BentoHero
                  featured={{ src: "/images/about/bento-large.jpg", alt: "Mudit in London" }}
                  top={{ src: "/images/about/bento-top-right.webp", alt: "Getty Villa courtyard" }}
                  bottom={{ src: "/images/about/bento-bottom-right.avif", alt: "Sitting by a window" }}
                  priority={!softArrival}
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

        {/* CD slot stays in the tree (lightweight placeholder) so IO can arm
            without waiting on DialKit below-fold. Live CD only mounts when
            scrolled near — keeps first About paint + cursor free of CD init. */}
        <DeferredAboutCD />

        {belowFold ? (
          <AboutBelowFold />
        ) : (
          <div aria-hidden style={{ minHeight: 320 }} />
        )}
      </div>
    </div>
  );
}
