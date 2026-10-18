import type { ReactNode } from "react";
import Image from "next/image";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyLock from "@/components/CaseStudyLock";
import MuxMediaSlot from "@/components/MuxMediaSlot";
import {
  JOOLA_EMAIL,
  JOOLA_HERO_SRC,
  JOOLA_MUX_PLAYBACK_ID,
  JOOLA_SUBTITLE,
  JOOLA_TITLE,
} from "@/lib/caseStudies/joola";

const PEOPLE = {
  vinay: "https://www.linkedin.com/in/vinay-bulusu-442395b9/",
  caroline: "https://www.linkedin.com/in/carolinekajihara/",
  rich: "https://www.linkedin.com/in/richbbloom/",
  kannan: "https://www.linkedin.com/in/kannan-mrithunjai-961b3a13a/",
  sachin: "https://www.linkedin.com/in/sachin-girish1677/",
} as const;

/**
 * JOOLA header only: eyebrow, title, subtitle, hero, info row, film, then the NDA lock.
 * Same 750px column as other case studies, without the section nav.
 */
export default function ProductCaseStudy() {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout cs-layout--no-toc">
        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>
          <CaseStudyOpen
            tagline={<Eyebrow />}
            title={JOOLA_TITLE}
            subtitle={JOOLA_SUBTITLE}
            metaColumns={3}
            metadata={[
              { _key: "role", label: "Role", values: ["Product Design Intern"] },
              { _key: "timeline", label: "Timeline", values: ["10 weeks", "Summer 2026"] },
              {
                _key: "collaborators",
                label: "Collaborators",
                wide: true,
                values: [
                  <CollaboratorLine key="vinay" name="Vinay Bulusu" href={PEOPLE.vinay} role="Product Manager" />,
                  <CollaboratorLine key="caroline" name="Caroline Kajihara" href={PEOPLE.caroline} role="Head of Digital" />,
                  <CollaboratorLine key="rich" name="Rich Bloom" href={PEOPLE.rich} role="Senior Global Creative Director" />,
                  <span key="devs">
                    <Person href={PEOPLE.kannan}>Kannan Mrithunjai</Person>
                    {" and "}
                    <Person href={PEOPLE.sachin}>Sachin Girish</Person>
                    {", Developers"}
                  </span>,
                ],
              },
            ]}
          >
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
          </CaseStudyOpen>

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

          <div style={{ marginTop: "var(--section-gap)" }}>
            <CaseStudyLock email={JOOLA_EMAIL} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Eyebrow() {
  const parts = ["Product Design", "Internship", "2026"];
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", columnGap: 16, rowGap: 4 }}>
      {parts.map((part) => (
        <span key={part}>{part}</span>
      ))}
    </span>
  );
}

function Person({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="cs-person-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function CollaboratorLine({ name, href, role }: { name: string; href: string; role: string }) {
  return (
    <>
      <Person href={href}>{name}</Person>
      {`, ${role}`}
    </>
  );
}
