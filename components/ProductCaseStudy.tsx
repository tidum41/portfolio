import type { ReactNode } from "react";
import Image from "next/image";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyRequest from "@/components/CaseStudyRequest";
import CaseStudyTOC from "@/components/CaseStudyTOC";
import CaseStudyPager from "@/components/CaseStudyPager";
import { JOOLA_HERO_SRC, JOOLA_TITLE } from "@/lib/caseStudies/joola";

const TEAM = [
  { name: "Vinay Bulusu", role: "PM", href: "https://www.linkedin.com/in/vinay-bulusu-442395b9/" },
  { name: "Caroline Kajihara", role: "Head of Digital", href: "https://www.linkedin.com/in/carolinekajihara/" },
  { name: "Rich Bloom", role: "Creative Director", href: "https://www.linkedin.com/in/richbbloom/" },
  { name: "Kannan Mrithunjai", role: "Developer", href: "https://www.linkedin.com/in/kannan-mrithunjai-961b3a13a/" },
  { name: "Sachin Girish", role: "Developer", href: "https://www.linkedin.com/in/sachin-girish1677/" },
] as const;

/**
 * JOOLA uses the BruinLease case-study open: title, hero, then metadata.
 * `body` is the slot for later sections, between that open and the NDA request.
 */
export default function ProductCaseStudy({ body }: { body?: ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">
        <div className="cs-content" style={{ minWidth: 0 }}>
          <aside className="cs-aside">
            <CaseStudyTOC items={[]} backHref="/" />
          </aside>
          <div className="cs-mobile-back">
            <CaseStudyTOC items={[]} backHref="/" mobileBackOnly />
          </div>

          <CaseStudyOpen
            title={JOOLA_TITLE}
            metadata={[
              { _key: "role", label: "Role", values: ["Product design intern"] },
              { _key: "timeline", label: "Timeline", values: ["10 weeks, Summer 2026"] },
              {
                _key: "team",
                label: "Team",
                wide: true,
                values: TEAM.map((person) => (
                  <span key={person.href}>
                    <a className="cs-person-link" href={person.href} target="_blank" rel="noopener noreferrer">
                      {person.name}
                    </a>
                    {" "}
                    <span style={{ color: "var(--color-text-muted)" }}>{person.role}</span>
                  </span>
                )),
              },
              {
                _key: "scope",
                label: "Scope",
                values: ["Product design", "Interaction design", "Prototyping"],
              },
            ]}
          >
            <div className="cs-hero-media-frame">
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
          </CaseStudyOpen>

          {body}

          <CaseStudyRequest />

          <CaseStudyPager href="/joola" />
        </div>
      </div>
    </div>
  );
}
