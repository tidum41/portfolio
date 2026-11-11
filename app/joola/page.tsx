import type { Metadata } from "next";
import ProductCaseStudy from "@/components/ProductCaseStudy";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import CaseStudyRequest from "@/components/CaseStudyRequest";
import CaseStudyTOC from "@/components/CaseStudyTOC";
import {
  getJoolaCaseStudyDraft,
  joolaSanityPreviewActive,
} from "@/lib/sanity/caseStudyDraft";
import { JOOLA_HERO_SRC, JOOLA_TITLE } from "@/lib/caseStudies/joola";
import { SITE_URL } from "@/lib/site";
import type { CaseStudyData, TocItem } from "@/lib/sanity/queries";
import Image from "next/image";

import JoolaCaseStudyClient from "@/components/joola/JoolaCaseStudyClient";

const description = "B2B ordering for JOOLA. Product design internship, summer 2026.";

export const metadata: Metadata = {
  title: JOOLA_TITLE,
  description,
  alternates: { canonical: `${SITE_URL}/joola` },
  openGraph: {
    title: `${JOOLA_TITLE} — Mudit Mahajan`,
    description,
    url: `${SITE_URL}/joola`,
  },
};

const TEAM = [
  { name: "Vinay Bulusu", role: "PM", href: "https://www.linkedin.com/in/vinay-bulusu-442395b9/" },
  { name: "Caroline Kajihara", role: "Head of Digital", href: "https://www.linkedin.com/in/carolinekajihara/" },
  { name: "Rich Bloom", role: "Creative Director", href: "https://www.linkedin.com/in/richbbloom/" },
  { name: "Kannan Mrithunjai", role: "Developer", href: "https://www.linkedin.com/in/kannan-mrithunjai-961b3a13a/" },
  { name: "Sachin Girish", role: "Developer", href: "https://www.linkedin.com/in/sachin-girish1677/" },
] as const;

const FB: CaseStudyData = {
  slug: "joola",
  heroTitle: JOOLA_TITLE,
  tocItems: [
    { _key: "problem", id: "problem", label: "Problem" },
    { _key: "solution", id: "solution", label: "Solution" },
    { _key: "research", id: "research", label: "Research" },
    { _key: "d1", id: "decision-1", label: "Search first" },
    { _key: "d2", id: "decision-2", label: "Case pack steps" },
    { _key: "d3", id: "decision-3", label: "Net 30 credit in use" },
    { _key: "d4", id: "decision-4", label: "Split inbox approvals" },
  ],
};

function mergeDraft(fallback: CaseStudyData, raw: CaseStudyData): CaseStudyData {
  return {
    ...fallback,
    ...Object.fromEntries(
      Object.entries(raw).filter(
        ([, v]) => v != null && (Array.isArray(v) ? v.length > 0 : v !== ""),
      ),
    ),
  };
}

function tocFrom(cs: CaseStudyData): { id: string; label: string }[] {
  const items = (cs.tocItems ?? FB.tocItems ?? []) as TocItem[];
  return items.map((t) => ({ id: t.id, label: t.label }));
}

export default async function JoolaCaseStudyPage() {
  const previewOn = joolaSanityPreviewActive();
  const draft = previewOn ? await getJoolaCaseStudyDraft() : null;

  if (!previewOn || !draft) {
    return <ProductCaseStudy />;
  }

  const cs = mergeDraft(FB, draft);
  const toc = tocFrom(cs);

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">
        <aside className="cs-aside">
          <CaseStudyTOC items={toc} backHref="/" />
        </aside>

        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>
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
                    </a>{" "}
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
                alt="Quick order screen from the JOOLA wholesale prototype, with a saved order, Net 30 credit, and ship date pending."
                width={2400}
                height={1600}
                priority
                fetchPriority="high"
                sizes="(max-width: 767px) calc(100vw - 48px), 750px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </CaseStudyOpen>

          <JoolaCaseStudyClient cs={cs} />

          <CaseStudyRequest />

          <CaseStudyPager href="/joola" />
        </div>
      </div>
    </div>
  );
}
