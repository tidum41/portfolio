import type { ReactNode } from "react";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyTOC from "@/components/CaseStudyTOC";
import CaseStudyPager from "@/components/CaseStudyPager";
import JoolaPartialBody, { JOOLA_PARTIAL_TOC } from "@/components/JoolaPartialBody";
import ChangeQuantityLoop from "@/components/joola/product/ChangeQuantityLoop";
import { JOOLA_TITLE } from "@/lib/caseStudies/joola";

const TEAM = [
  { name: "Vinay Bulusu", role: "PM", href: "https://www.linkedin.com/in/vinay-bulusu-442395b9/" },
  { name: "Caroline Kajihara", role: "Head of Digital", href: "https://www.linkedin.com/in/carolinekajihara/" },
  { name: "Rich Bloom", role: "Creative Director", href: "https://www.linkedin.com/in/richbbloom/" },
  { name: "Kannan Mrithunjai", role: "Developer", href: "https://www.linkedin.com/in/kannan-mrithunjai-961b3a13a/" },
  { name: "Sachin Girish", role: "Developer", href: "https://www.linkedin.com/in/sachin-girish1677/" },
] as const;

/**
 * JOOLA uses the BruinLease case-study open: title, hero, then metadata.
 * The hero is a looping product moment (Change to 36), not a screenshot.
 * `body` is the slot for the sections after that open.
 */
export default function ProductCaseStudy({ body }: { body?: ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">
        <aside className="cs-aside">
          <CaseStudyTOC items={JOOLA_PARTIAL_TOC} backHref="/" />
        </aside>

        <div className="cs-content" style={{ minWidth: 0 }}>
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
            {/* v10 hero: the key moment, live from the ported prototype components (strategy 1 and 8). */}
            <ChangeQuantityLoop size="hero" />
          </CaseStudyOpen>

          {body ?? <JoolaPartialBody />}

          <CaseStudyPager href="/joola" />
        </div>
      </div>
    </div>
  );
}
