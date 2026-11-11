import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CaseStudyData } from "./queries";
import { sanityClient } from "./client";

const SLUG = "joola";
const DRAFT_ID = "drafts.joola";

/** Local-only: render full JOOLA case study from Sanity draft (or fixture). */
export function joolaSanityPreviewActive(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.SANITY_PREVIEW_DRAFTS === "1"
  );
}

const DRAFT_FIELDS = `{
  slug,
  tocItems[]{ _key, id, label },
  heroTagline, heroTitle,
  problemLabel, problemHeading, problemBody, problemImageCaption, painPoints,
  researchLabel, researchHeading, researchBody,
  d1Label, d1Heading, d1Body,
  d2Label, d2Heading, d2Body,
  d3Label, d3Heading, d3Body,
  d4Label, d4Heading, d4Body,
  solutionLabel, solutionHeading, solutionBody
}`;

function mapRawToCaseStudy(raw: Record<string, unknown> | null): CaseStudyData | null {
  if (!raw || raw.slug !== SLUG) return null;
  return raw as unknown as CaseStudyData;
}

async function loadFixture(): Promise<CaseStudyData | null> {
  const file = path.join(
    process.cwd(),
    "fixtures",
    "sanity",
    "drafts.joola.json",
  );
  const text = await readFile(file, "utf8");
  const raw = JSON.parse(text) as Record<string, unknown>;
  return mapRawToCaseStudy(raw);
}

async function loadDraftFromSanity(): Promise<CaseStudyData | null> {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return null;

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "9vl5qk61",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-06-28",
    token,
    useCdn: false,
    perspective: "previewDrafts",
  });

  const query = `*[_id == $id][0]${DRAFT_FIELDS}`;
  let raw = await client.fetch<Record<string, unknown> | null>(query, {
    id: DRAFT_ID,
  });

  if (!raw) {
    const bySlug = `*[_type == "caseStudy" && slug == $slug][0]${DRAFT_FIELDS}`;
    raw = await client.fetch(bySlug, { slug: SLUG });
  }

  return mapRawToCaseStudy(raw);
}

/** Draft doc for JOOLA preview. Fixture when `SANITY_PREVIEW_DRAFTS=1` and no write token. */
export async function getJoolaCaseStudyDraft(): Promise<CaseStudyData | null> {
  if (!joolaSanityPreviewActive()) return null;

  try {
    const fromApi = await loadDraftFromSanity();
    if (fromApi) return fromApi;
  } catch (err) {
    console.warn("[joola] Sanity draft fetch failed, using fixture:", err);
  }

  return loadFixture();
}

/** Production path: published doc only (unchanged CDN client). */
export async function getPublishedCaseStudyIfAny(
  slug: string,
): Promise<CaseStudyData | null> {
  const query = `*[_type == "caseStudy" && slug == $slug && !(_id in path("drafts.**"))][0]{ slug }`;
  const doc = await sanityClient.fetch<{ slug?: string } | null>(query, {
    slug,
  });
  return doc?.slug ? ({ slug: doc.slug } as CaseStudyData) : null;
}
