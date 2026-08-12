"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import BentoHeroStatic from "@/components/BentoHeroStatic";
import CdPlayerPoster from "@/components/CdPlayerPoster";
import { CssEntranceStagger, CssEntranceItem } from "@/components/CssEntrance";
import { ScrollReveal, StaggerReveal, StaggerItem } from "@/components/ScrollReveal";
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
 * About CD is visible under the hero on desktop — scroll-gating can't hide it.
 * Show the real product poster immediately, warm the chunk, then mount the live
 * player after the soft-nav hitch window (idle). Audio/dnd stay gated inside the
 * app until the user interacts.
 */
function DeferredAboutCD({ routeActive }: { routeActive: boolean }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!routeActive || live) return;
    let cancelled = false;
    let idleId = 0;
    let delayId = 0;

    const arm = () => {
      if (cancelled) return;
      void import("@/components/CDPlayer").then(() => {
        if (!cancelled) setLive(true);
      });
    };

    // Hero + cursor get the first beat; then idle-mount the live player.
    delayId = window.setTimeout(() => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(arm, { timeout: 1400 });
      } else {
        arm();
      }
    }, 480);

    return () => {
      cancelled = true;
      window.clearTimeout(delayId);
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [routeActive, live]);

  return (
    <section id="about-cd-slot" style={{ marginBottom: "var(--space-7)" }}>
      <SectionLabel>drag my favorite CDs!</SectionLabel>
      <div
        style={{
          position: "relative",
          marginTop: 16,
          minHeight: 520,
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          background: "var(--color-placeholder)",
        }}
      >
        {/* Product poster — same assets as Work grid tile. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: live ? 0 : 1,
            transition: "opacity 0.35s ease",
            pointerEvents: "none",
          }}
        >
          <CdPlayerPoster opacity={1} fade={false} />
        </div>
        {live ? (
          <CDPlayer style={{ marginTop: 0, minHeight: 520 }} variant="about" />
        ) : (
          <div aria-hidden style={{ minHeight: 520 }} />
        )}
      </div>
    </section>
  );
}

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

function AboutHeroCopy() {
  return (
    <>
      <CssEntranceItem>
        <h1 style={{
          fontFamily: "var(--font-page-title)",
          fontSize: 32,
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: "-0.8px",
          color: "var(--color-text-primary)",
          margin: "0 0 4px",
        }}>hello hello, i&apos;m mudit</h1>
      </CssEntranceItem>

      <CssEntranceItem>
        <p style={{
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--color-text-muted)",
          margin: "0 0 24px",
        }}>B.S. Cognitive Science | UCLA &apos;27</p>
      </CssEntranceItem>

      <CssEntranceItem>
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
      </CssEntranceItem>

      <CssEntranceItem>
        <p style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--color-text-secondary)",
          margin: "0 0 4px",
        }}>You can find me</p>
      </CssEntranceItem>

      <CssEntranceItem>
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
      </CssEntranceItem>
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
 * Soft + hard: CSS entrance (Archive/BentoGallery vocabulary). Soft snaps.
 * Bento stays static (production); CD poster→live after settle.
 */
export default function AboutPageContent({
  active,
  softArrival: softArrivalProp,
}: {
  active: boolean;
  softArrival?: boolean;
}) {
  const [softArrival] = useState(() => softArrivalProp ?? peekSoftNavArrival());
  const [belowFold, setBelowFold] = useState(false);

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

  return (
    <div style={{ paddingInline: "var(--page-px)", paddingTop: "var(--space-5)", paddingBottom: "var(--space-9)" }}>
      <div style={{ fontFamily: "var(--font-sans)", maxWidth: "var(--content-max-w)", marginInline: "auto" }}>
        <div style={{ marginBottom: "var(--space-7)" }}>
          <CssEntranceStagger
            active
            instant={softArrival}
            className="about-hero"
            data-soft-hero={softArrival ? "1" : "0"}
          >
            <div className="about-hero-bio">
              <AboutHeroCopy />
            </div>
            <div className="about-hero-bento-col">
              <CssEntranceItem style={{ marginBottom: 5 }}>
                <BentoHeroStatic
                  featured={BENTO.featured}
                  top={BENTO.top}
                  bottom={BENTO.bottom}
                  priority={!softArrival}
                />
              </CssEntranceItem>
              <AboutSocials />
            </div>
          </CssEntranceStagger>
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
