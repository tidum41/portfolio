import type { ReactNode } from "react";
import Image from "next/image";
import CaseStudyTOC from "@/components/CaseStudyTOC";
import CaseStudyLock from "@/components/CaseStudyLock";
import MuxMediaSlot from "@/components/MuxMediaSlot";
import {
  JOOLA_EMAIL,
  JOOLA_HERO_SRC,
  JOOLA_MUX_PLAYBACK_ID,
  JOOLA_TITLE,
} from "@/lib/caseStudies/joola";

const TEAM = [
  { name: "Vinay Bulusu", role: "PM", href: "https://www.linkedin.com/in/vinay-bulusu-442395b9/" },
  { name: "Caroline Kajihara", role: "Head of Digital", href: "https://www.linkedin.com/in/carolinekajihara/" },
  { name: "Rich Bloom", role: "Creative Director", href: "https://www.linkedin.com/in/richbbloom/" },
  { name: "Kannan Mrithunjai", role: "Developer", href: "https://www.linkedin.com/in/kannan-mrithunjai-961b3a13a/" },
  { name: "Sachin Girish", role: "Developer", href: "https://www.linkedin.com/in/sachin-girish1677/" },
] as const;

/**
 * Bare JOOLA page. `body` is the slot for later case-study sections,
 * rendered between the film and the NDA lock.
 */
export default function ProductCaseStudy({ body }: { body?: ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">
        <aside className="cs-aside">
          <CaseStudyTOC items={[]} backHref="/" />
        </aside>

        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>
          <div className="cs-mobile-back">
            <CaseStudyTOC items={[]} backHref="/" mobileBackOnly />
          </div>

          <div className="cs-hero-title-wrap">
            <h1
              className="cs-hero-title"
              style={{
                fontFamily: "var(--font-doc-title)",
                fontSize: "var(--fs-hero)",
                fontWeight: "var(--fw-hero)",
                lineHeight: 1.1,
                letterSpacing: "var(--ls-hero)",
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {JOOLA_TITLE}
            </h1>
          </div>

          <dl className="cs-facts">
            <Fact label="Role" value="Product Design Intern" />
            <Fact label="Timeline" value="10 weeks, Summer 2026" />
            <div>
              <dt className="cs-facts-label">Team</dt>
              <dd className="cs-facts-value">
                <ul className="cs-facts-team">
                  {TEAM.map((person) => (
                    <li key={person.href}>
                      <a className="cs-person-link" href={person.href} target="_blank" rel="noopener noreferrer">
                        {person.name}
                      </a>
                      {" "}
                      <span className="cs-facts-role">{person.role}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className="cs-hero-media-wrap" style={{ marginTop: "var(--space-4)" }}>
            <div style={{ borderRadius: "var(--radius-card)", overflow: "hidden" }}>
              <Image
                src={JOOLA_HERO_SRC}
                alt="Quick order screen from the JOOLA wholesale prototype, with tier pricing, a saved order, Net 30 credit, and an order marked ship date pending."
                width={2400}
                height={1600}
                priority
                fetchPriority="high"
                sizes="(max-width: 767px) calc(100vw - 48px), 750px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>

          <div data-case-film={JOOLA_MUX_PLAYBACK_ID} style={{ margin: "8px 0 0" }}>
            <MuxMediaSlot
              playbackId={JOOLA_MUX_PLAYBACK_ID}
              thumbnailTime={0}
              posterWidth={1280}
              posterHeight={960}
              className="mux-media-slot--contain"
              style={{ background: "#F4F4F4", borderRadius: "var(--radius-card)" }}
            />
          </div>

          {body ? <div className="cs-study-body">{body}</div> : null}

          <div style={{ marginTop: "var(--section-gap)" }}>
            <CaseStudyLock email={JOOLA_EMAIL} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="cs-facts-label">{label}</dt>
      <dd className="cs-facts-value">{value}</dd>
    </div>
  );
}
