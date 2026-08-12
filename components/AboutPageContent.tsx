"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import BentoHero from "@/components/BentoHero";
import BentoHeroStatic from "@/components/BentoHeroStatic";
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

const BENTO = {
  featured: { src: "/images/about/bento-large.jpg", alt: "Mudit in London" },
  top: { src: "/images/about/bento-top-right.webp", alt: "Getty Villa courtyard" },
  bottom: { src: "/images/about/bento-bottom-right.avif", alt: "Sitting by a window" },
} as const;

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

/**
 * CD stays a placeholder until the user actually scrolls it into view.
 * Previous rootMargin:160px + immediate observe meant the slot was "near"
 * on first About open and armed CdPlayer (~DialKit + audio + dnd) ~400ms
 * into the soft-nav hitch window.
 */
function DeferredAboutCD({ routeActive }: { routeActive: boolean }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!routeActive || ready) return;
    const target = document.getElementById("about-cd-slot");
    if (!target) return;
    let cancelled = false;
    let idleId = 0;
    let armTimer = 0;
    let obs: IntersectionObserver | null = null;

    const enable = () => {
      if (!cancelled) setReady(true);
    };

    // Don't even watch until soft-nav + first paint have room to breathe.
    armTimer = window.setTimeout(() => {
      if (cancelled) return;
      obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          obs?.disconnect();
          if (typeof window.requestIdleCallback === "function") {
            idleId = window.requestIdleCallback(enable, { timeout: 2200 });
          } else {
            window.setTimeout(enable, 320);
          }
        },
        // No positive rootMargin — must be meaningfully in view.
        { rootMargin: "0px", threshold: 0.12 },
      );
      obs.observe(target);
    }, 1600);

    return () => {
      cancelled = true;
      window.clearTimeout(armTimer);
      obs?.disconnect();
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [routeActive, ready]);

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

function SoftHeroItem({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={style}>{children}</div>;
}

function AboutHeroCopy() {
  return (
    <>
      <h1 style={{
        fontFamily: "var(--font-page-title)",
        fontSize: 32,
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: "-0.8px",
        color: "var(--color-text-primary)",
        margin: "0 0 4px",
      }}>hello hello, i&apos;m mudit</h1>

      <p style={{
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--color-text-muted)",
        margin: "0 0 24px",
      }}>B.S. Cognitive Science | UCLA &apos;27</p>

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

      <p style={{
        fontSize: 15,
        lineHeight: 1.6,
        color: "var(--color-text-secondary)",
        margin: "0 0 4px",
      }}>You can find me</p>

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
    </>
  );
}

function AboutSocials() {
  return (
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
  );
}

/**
 * About body used by PersistentAboutShell.
 *
 * First soft-nav paint budget (what was burning the cursor):
 *  - no Framer EntranceStagger/EntranceItem (7× DialKit + motion.divs)
 *  - static bento (no BentoHero DialKit) until idle upgrade
 *  - CD not observed for ~1.6s, then only when actually in view
 *  - experience DialKit deferred until scroll / long idle
 */
export default function AboutPageContent({ active }: { active: boolean }) {
  const [softArrival] = useState(() => peekSoftNavArrival());
  const [belowFold, setBelowFold] = useState(false);
  // Soft first open: static bento. Hard nav / later upgrade: live DialKit.
  const [bentoLive, setBentoLive] = useState(!softArrival);

  useEffect(() => {
    if (!active || belowFold) return;
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;

    const enable = () => {
      if (!cancelled) setBelowFold(true);
    };

    const onScroll = () => {
      if (window.scrollY < 100) return;
      window.removeEventListener("scroll", onScroll);
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(enable, { timeout: 900 });
      } else {
        enable();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Fallback only — was 700ms and raced the soft-nav hitch.
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 4500 });
    } else {
      timeoutId = window.setTimeout(enable, 2500);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [active, belowFold]);

  useEffect(() => {
    if (!active || bentoLive) return;
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    const upgrade = () => {
      if (!cancelled) setBentoLive(true);
    };
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(upgrade, { timeout: 2800 });
    } else {
      timeoutId = window.setTimeout(upgrade, 1200);
    }
    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [active, bentoLive]);

  const bento = bentoLive ? (
    <BentoHero
      featured={BENTO.featured}
      top={BENTO.top}
      bottom={BENTO.bottom}
      priority={!softArrival}
    />
  ) : (
    <BentoHeroStatic
      featured={BENTO.featured}
      top={BENTO.top}
      bottom={BENTO.bottom}
      priority={false}
    />
  );

  return (
    <div style={{ paddingInline: "var(--page-px)", paddingTop: "var(--space-5)", paddingBottom: "var(--space-9)" }}>
      <div style={{ fontFamily: "var(--font-sans)", maxWidth: "var(--content-max-w)", marginInline: "auto" }}>
        <div style={{ marginBottom: "var(--space-7)" }}>
          {softArrival ? (
            <div className="about-hero">
              <div className="about-hero-bio">
                <AboutHeroCopy />
              </div>
              <div className="about-hero-bento-col">
                <SoftHeroItem style={{ marginBottom: 5 }}>{bento}</SoftHeroItem>
                <AboutSocials />
              </div>
            </div>
          ) : (
            <EntranceStagger active instant={false} className="about-hero">
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
                <EntranceItem style={{ marginBottom: 5 }}>{bento}</EntranceItem>
                <AboutSocials />
              </div>
            </EntranceStagger>
          )}
        </div>

        <DeferredAboutCD routeActive={active} />

        {belowFold ? (
          <AboutBelowFold />
        ) : (
          <div aria-hidden style={{ minHeight: 320 }} />
        )}
      </div>
    </div>
  );
}
