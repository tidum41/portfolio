import { sanityClient } from "./client";

// ── Design System (shared across all pages) ───────────────────────────────────

export interface DesignSystemData {
  // Typography
  fsDisplay?: number; fsHero?: number; fsH2?: number;
  fwHero?: number; fwH2?: number; fwCardTitle?: number; fsSectionLabel?: number;
  fsH3?: number; fsBody?: number; fsLabel?: number; fsMeta?: number; fsCaption?: number;
  fsStat?: number; fsCardTitle?: number;
  lhBody?: number; lhH2?: number; lsHero?: number; lsH2?: number;
  // Spacing
  sectionGap?: number; sectionPb?: number; pagePx?: number; contentMaxW?: number; cardRadius?: number;
  // Colors
  colorBg?: string; colorTextPrimary?: string; colorTextSecondary?: string;
  colorTextTertiary?: string; colorTextMuted?: string; colorPlaceholder?: string;
  colorBorderSubtle?: string; colorAccent?: string;
}

export const DS_DEFAULTS: Required<DesignSystemData> = {
  fsDisplay: 56, fsHero: 48, fsH2: 30, fwHero: 50, fwH2: 50, fwCardTitle: 50, fsSectionLabel: 15,
  fsH3: 20, fsBody: 15, fsLabel: 16, fsMeta: 14, fsCaption: 12, fsStat: 44, fsCardTitle: 18,
  lhBody: 1.72, lhH2: 1.1, lsHero: -0.5, lsH2: -0.3,
  sectionGap: 80, sectionPb: 64, pagePx: 12, contentMaxW: 750, cardRadius: 4,
  colorBg: "#FBFBFB", colorTextPrimary: "#2E2E2E", colorTextSecondary: "#575757",
  colorTextTertiary: "#767676", colorTextMuted: "#ADADAD", colorPlaceholder: "#EBEBEB",
  colorBorderSubtle: "#E8E4F0", colorAccent: "#9590C2",
};

const DS_QUERY = `*[_type == "designSystem"][0]{
  fsDisplay,fsHero,fsH2,fwHero,fwH2,fwCardTitle,fsSectionLabel,fsH3,fsBody,fsLabel,fsMeta,fsCaption,fsStat,fsCardTitle,
  lhBody,lhH2,lsHero,lsH2,
  sectionGap,sectionPb,pagePx,contentMaxW,cardRadius,
  colorBg,colorTextPrimary,colorTextSecondary,colorTextTertiary,
  colorTextMuted,colorPlaceholder,colorBorderSubtle,colorAccent
}`;

export async function getDesignSystem(): Promise<Required<DesignSystemData>> {
  const raw = await sanityClient.fetch<DesignSystemData | null>(DS_QUERY, {}, { next: { revalidate: 60 } });
  return { ...DS_DEFAULTS, ...(raw ?? {}) };
}

/** Convert a DesignSystemData to a CSS :root{} override block */
export function designSystemToCss(ds: Required<DesignSystemData>): string {
  const accentRgb = ds.colorAccent; // e.g. "#C9622F"
  return `:root{
    --fs-display:${ds.fsDisplay}px;--fs-hero:${ds.fsHero}px;--fs-h2:${ds.fsH2}px;
    --fw-hero:${ds.fwHero * 10};--fw-h2:${ds.fwH2 * 10};--fw-card-title:${ds.fwCardTitle * 10};
    --fs-section-label:${ds.fsSectionLabel}px;
    --fs-h3:${ds.fsH3}px;--fs-body:${ds.fsBody}px;--fs-label:${ds.fsLabel}px;
    --fs-meta:${ds.fsMeta}px;--fs-caption:${ds.fsCaption}px;
    --fs-stat:${ds.fsStat}px;--fs-card-title:${ds.fsCardTitle}px;
    --lh-body:${ds.lhBody};--lh-h2:${ds.lhH2};
    --ls-hero:${ds.lsHero}px;--ls-h2:${ds.lsH2}px;
    --section-gap:${ds.sectionGap}px;--section-pb:${ds.sectionPb}px;
    --page-px:${ds.pagePx}px;--content-max-w:${ds.contentMaxW}px;--radius-card:${ds.cardRadius}px;
    --color-bg:${ds.colorBg};--color-text-primary:${ds.colorTextPrimary};
    --color-text-secondary:${ds.colorTextSecondary};--color-text-tertiary:${ds.colorTextTertiary};
    --color-text-muted:${ds.colorTextMuted};--color-placeholder:${ds.colorPlaceholder};
    --color-border-subtle:${ds.colorBorderSubtle};
    --color-accent:${accentRgb};--color-accent-subtle:${accentRgb}14;
  }`;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export interface SanityProject {
  _id: string;
  title: string;
  subtitle?: string;
  href: string;
  mediaType: "video" | "image";
  muxPlaybackId?: string;
  image?: { asset: { url: string }; hotspot?: { x: number; y: number } };
  aspectRatio: string;
  order?: number;
  featured: boolean;
}

const PROJECTS_QUERY = `*[_type == "project" && featured == true] | order(order asc) {
  _id, title, subtitle, href, mediaType, muxPlaybackId,
  image { asset->{ url }, hotspot },
  aspectRatio, order, featured
}`;

export async function getProjects(): Promise<SanityProject[]> {
  return sanityClient.fetch<SanityProject[]>(PROJECTS_QUERY, {}, { next: { revalidate: 60 } });
}

// ── Case Study ────────────────────────────────────────────────────────────────

export interface CompRow { _key: string; type: "right" | "wrong" | "neutral"; text: string }
export interface Stat    { _key: string; value: string; label: string }
export interface MetaItem{ _key: string; label: string; values: string[] }
export interface ToolItem{ _key: string; tool: string; desc: string }
export interface TocItem { _key: string; id: string; label: string }
export interface ReflectionItem { _key: string; heading: string; body: string }

export interface PhonePos {
  videoX?: number;
  videoY?: number;
  videoScale?: number;
  insetTop?: number;
  insetBottom?: number;
  insetSide?: number;
  screenRadius?: number;
}

export interface CaseStudyData {
  // identity
  slug: string;
  tocItems?: TocItem[];

  // hero
  heroTagline?: string;
  heroTitle?: string;
  heroBg?: string;
  heroMuxId?: string;
  heroPhonePos?: PhonePos;
  metadata?: MetaItem[];

  // problem
  problemLabel?: string;
  problemHeading?: string;
  problemBody?: string;
  problemImageCaption?: string;
  problemImage?: string;
  painPoints?: string[];

  // research
  researchLabel?: string;
  researchHeading?: string;
  researchBody?: string;
  stats?: Stat[];

  // process
  processLabel?: string;
  processHeading?: string;
  processBody?: string;
  processTools?: ToolItem[];

  // decision 1
  d1Label?: string;
  d1Heading?: string;
  d1Body?: string;
  d1CardLabels?: string[];
  d1CompCol1?: CompRow[];
  d1CompCol2?: CompRow[];
  d1CompCol3?: CompRow[];
  d1Insights?: string[];
  decision1CardInitial?: string;
  decision1CardCondensed?: string;
  decision1CardFinal?: string;

  // decision 2
  d2Label?: string;
  d2Heading?: string;
  d2Body?: string;
  ueTestingVideo?: string;
  d2PhonePos?: PhonePos;

  // decision 3
  d3Label?: string;
  d3Heading?: string;
  d3Body?: string;
  oldFlowVideo?: string;
  decision1Video?: string;
  d3BeforePhonePos?: PhonePos;
  d3AfterPhonePos?: PhonePos;

  // decision 4
  d4Label?: string;
  d4Heading?: string;
  d4Body?: string;
  homepageComparison?: string;

  // solution
  solutionLabel?: string;
  solutionHeading?: string;
  solutionBody?: string;
  solutionBg?: string;
  solutionMuxId?: string;
  solutionPhonePos?: PhonePos;

  // reflection
  reflectionLabel?: string;
  reflectionItems?: ReflectionItem[];
}

const PHONE_POS_FRAGMENT = `{ videoX, videoY, videoScale, insetTop, insetBottom, insetSide, screenRadius }`;

const CASE_STUDY_QUERY = `*[_type == "caseStudy" && slug == $slug][0] {
  slug,
  tocItems[]{ _key, id, label },

  heroTagline, heroTitle, heroBg, heroMuxId,
  heroPhonePos ${PHONE_POS_FRAGMENT},
  metadata[]{ _key, label, values },

  problemLabel, problemHeading, problemBody, problemImageCaption,
  problemImage { asset->{ url } },
  painPoints,

  researchLabel, researchHeading, researchBody,
  stats[]{ _key, value, label },

  processLabel, processHeading, processBody,
  processTools[]{ _key, tool, desc },

  d1Label, d1Heading, d1Body,
  d1CardLabels,
  d1CompCol1[]{ _key, type, text },
  d1CompCol2[]{ _key, type, text },
  d1CompCol3[]{ _key, type, text },
  d1Insights,
  decision1CardInitial { asset->{ url } },
  decision1CardCondensed { asset->{ url } },
  decision1CardFinal { asset->{ url } },

  d2Label, d2Heading, d2Body,
  ueTestingVideo { asset->{ url } },
  d2PhonePos ${PHONE_POS_FRAGMENT},

  d3Label, d3Heading, d3Body,
  oldFlowVideo { asset->{ url } },
  decision1Video { asset->{ url } },
  d3BeforePhonePos ${PHONE_POS_FRAGMENT},
  d3AfterPhonePos ${PHONE_POS_FRAGMENT},

  d4Label, d4Heading, d4Body,
  homepageComparison { asset->{ url } },

  solutionLabel, solutionHeading, solutionBody, solutionBg, solutionMuxId,
  solutionPhonePos ${PHONE_POS_FRAGMENT},

  reflectionLabel,
  reflectionItems[]{ _key, heading, body }
}`;

type RawImg  = { asset: { url: string } } | null;
type RawFile = { asset: { url: string } } | null;

export async function getCaseStudy(slug: string): Promise<CaseStudyData> {
  const raw = await sanityClient.fetch<Record<string, unknown> | null>(
    CASE_STUDY_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  );
  if (!raw) return { slug };

  const img  = (f: string) => (raw[f] as RawImg)?.asset?.url;
  const file = (f: string) => (raw[f] as RawFile)?.asset?.url;

  return {
    ...(raw as object),
    problemImage:          img("problemImage"),
    decision1CardInitial:  img("decision1CardInitial"),
    decision1CardCondensed:img("decision1CardCondensed"),
    decision1CardFinal:    img("decision1CardFinal"),
    homepageComparison:    img("homepageComparison"),
    ueTestingVideo:        file("ueTestingVideo"),
    oldFlowVideo:          file("oldFlowVideo"),
    decision1Video:        file("decision1Video"),
  } as CaseStudyData;
}

// Legacy shim — keeps old imports working
export async function getCaseStudyAssets(slug: string) {
  return getCaseStudy(slug);
}
