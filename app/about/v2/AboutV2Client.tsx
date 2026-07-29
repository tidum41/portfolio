"use client";

import Image from "next/image";
import Link from "next/link";
import CDPlayer from "@/components/CDPlayer";
import ProductSpacePhotos from "@/components/ProductSpacePhotos";
import {
  ScrollReveal,
  StaggerReveal,
  StaggerItem,
  EntranceStagger,
  EntranceItem,
} from "@/components/ScrollReveal";
import {
  ABOUT_BIO,
  ABOUT_INTERESTS,
  EXPERIENCE,
  ORGS,
  SOCIALS,
} from "@/lib/about";

const HERO_PORTRAIT = {
  src: "/images/about/bento-large.jpg",
  alt: "Mudit in London",
  caption: "London, between trains",
  objectPosition: "55% 12%",
} as const;

const STRIP_PORTRAITS = [
  {
    src: "/images/about/bento-top-right.webp",
    alt: "Getty Villa courtyard",
    objectPosition: "50% 50%",
  },
  {
    src: "/images/about/bento-bottom-right.avif",
    alt: "Sitting by a window",
    objectPosition: "35% 50%",
  },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="about-v2-label">{children}</p>;
}

export default function AboutV2Page() {
  const featuredOrg = ORGS.find((o) => "featured" in o && o.featured);
  const otherOrgs = ORGS.filter((o) => !("featured" in o && o.featured));
  const visibleExp = EXPERIENCE.filter((e) => !("hidden" in e && e.hidden));

  return (
    <div className="about-v2">
      <div className="about-v2-inner">
        <p className="about-v2-back">
          <Link href="/about" className="nav-link about-v2-back-link">
            ← /about
          </Link>
          <span className="about-v2-back-sep" aria-hidden="true">
            ·
          </span>
          <span>archive sheet</span>
        </p>

        {/* ── Hero: Megan lead + Liu photo dialogue ── */}
        <EntranceStagger active className="about-v2-hero">
          <EntranceItem className="about-v2-hero-copy">
            <p className="about-v2-kicker">Mudit Mahajan</p>
            <h1 className="about-v2-lead">
              Designing for an internet that feels a little more human.
            </h1>
            <p className="about-v2-role">
              Product designer · UCLA &apos;27
            </p>
          </EntranceItem>

          <EntranceItem className="about-v2-hero-photo">
            <figure className="about-v2-portrait">
              <div className="about-v2-portrait-frame">
                <Image
                  src={HERO_PORTRAIT.src}
                  alt={HERO_PORTRAIT.alt}
                  fill
                  priority
                  sizes="(max-width: 767px) 72vw, 280px"
                  style={{
                    objectFit: "cover",
                    objectPosition: HERO_PORTRAIT.objectPosition,
                  }}
                />
              </div>
              <figcaption className="about-v2-portrait-cap">
                {HERO_PORTRAIT.caption}
              </figcaption>
            </figure>
          </EntranceItem>
        </EntranceStagger>

        {/* ── Quiet strip (Christina depth, flush not scrapbook) ── */}
        <ScrollReveal>
          <div className="about-v2-strip" aria-label="More portraits">
            {STRIP_PORTRAITS.map((photo) => (
              <div key={photo.src} className="about-v2-strip-item">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 767px) 40vw, 180px"
                  style={{
                    objectFit: "cover",
                    objectPosition: photo.objectPosition,
                  }}
                />
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Biography ── */}
        <ScrollReveal>
          <section className="about-v2-section" aria-labelledby="v2-bio">
            <div className="about-v2-section-head">
              <SectionLabel>
                <span id="v2-bio">Biography</span>
              </SectionLabel>
            </div>
            <div className="about-v2-bio-grid">
              <p className="about-v2-bio">{ABOUT_BIO}</p>
              <div className="about-v2-interests-block">
                <p className="about-v2-bio-lead">
                  When I&apos;m not mid-rabbit-hole, you can usually find me…
                </p>
                <ul className="about-v2-interests">
                  {ABOUT_INTERESTS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Experience (archive ruled list) ── */}
        <ScrollReveal>
          <section className="about-v2-section" aria-labelledby="v2-exp">
            <div className="about-v2-section-head">
              <SectionLabel>
                <span id="v2-exp">Experience</span>
              </SectionLabel>
            </div>
            <StaggerReveal className="about-v2-exp-list">
              {visibleExp.map(({ company, role, dates, description }) => (
                <StaggerItem key={company} className="about-v2-exp-row">
                  <div className="about-v2-exp-main">
                    <p className="about-v2-exp-company">{company}</p>
                    <p className="about-v2-exp-role">{role}</p>
                    <p className="about-v2-exp-desc">{description}</p>
                  </div>
                  <p className="about-v2-exp-date">{dates}</p>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </section>
        </ScrollReveal>

        {/* ── Community + Product Space lookbook ── */}
        <ScrollReveal>
          <section className="about-v2-section" aria-labelledby="v2-crew">
            <div className="about-v2-section-head">
              <SectionLabel>
                <span id="v2-crew">Community</span>
              </SectionLabel>
              <span className="about-v2-aside">where the work happens</span>
            </div>

            {featuredOrg && (
              <div className="about-v2-crew">
                <div className="about-v2-crew-meta">
                  <div>
                    <p className="about-v2-exp-company">{featuredOrg.name}</p>
                    <p className="about-v2-exp-role">{featuredOrg.role}</p>
                  </div>
                </div>
                <p className="about-v2-crew-blurb">
                  Shipping with friends — Beacons AI, Dialogue AI, and the nights
                  between deadlines.
                </p>
                <ProductSpacePhotos
                  variant="lookbook"
                  className="about-v2-crew-photos"
                />
              </div>
            )}

            {otherOrgs.length > 0 && (
              <div className="about-v2-crew-rest">
                {otherOrgs.map(({ name, role }) => (
                  <div key={name} className="about-v2-org-row">
                    <p className="about-v2-exp-company">{name}</p>
                    <p className="about-v2-exp-date">{role}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </ScrollReveal>

        {/* ── Library ── */}
        <ScrollReveal>
          <section className="about-v2-section" aria-labelledby="v2-lib">
            <div className="about-v2-section-head">
              <SectionLabel>
                <span id="v2-lib">Library</span>
              </SectionLabel>
              <span className="about-v2-aside">drag a disc onto the player</span>
            </div>
            <h2 className="about-v2-library-title">Currently spinning</h2>
            <CDPlayer variant="about" />
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <nav aria-label="Social links" className="about-v2-socials">
            {SOCIALS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="nav-link about-v2-social-link"
              >
                {label}
              </a>
            ))}
          </nav>
        </ScrollReveal>
      </div>
    </div>
  );
}
