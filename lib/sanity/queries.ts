import { cache } from "react";
import { unstable_cache } from "next/cache";
import { sanityClient } from "./client";
import {
  sanityImageUrl,
  sanityCdnUrl,
  SANITY_IMG_WIDTH,
  SANITY_IMG_WIDTH_WIDE,
} from "./imageUrl";

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
  fsDisplay: 48, fsHero: 48, fsH2: 30, fwHero: 50, fwH2: 50, fwCardTitle: 50, fsSectionLabel: 15,
  fsH3: 24, fsBody: 15, fsLabel: 15, fsMeta: 14, fsCaption: 12, fsStat: 44, fsCardTitle: 18,
  lhBody: 1.72, lhH2: 1.15, lsHero: -0.5, lsH2: -0.25,
  // One section separation (was pb 64 + mb 80). pb folded into gap.
  sectionGap: 144, sectionPb: 0, pagePx: 24, contentMaxW: 750, cardRadius: 4,
  colorBg: "#FBFBFB", colorTextPrimary: "#2E2E2E", colorTextSecondary: "#575757",
  // Kept in sync with app/globals.css's @theme block — these are a second,
  // independent fallback used to inline-override the CSS when Sanity has no
  // (or invalid) designSystem doc. Originally #767676/#ADADAD (2.17:1 /
  // 4.39:1 against colorBg, both failing WCAG AA); this is what was actually
  // winning the cascade over the globals.css fix until this was found.
  colorTextTertiary: "#6C6C6C", colorTextMuted: "#727272", colorPlaceholder: "#EBEBEB",
  colorBorderSubtle: "#E8E4F0", colorAccent: "#9590C2",
};

const DS_QUERY = `*[_type == "designSystem"][0]{
  fsDisplay,fsHero,fsH2,fwHero,fwH2,fwCardTitle,fsSectionLabel,fsH3,fsBody,fsLabel,fsMeta,fsCaption,fsStat,fsCardTitle,
  lhBody,lhH2,lsHero,lsH2,
  sectionGap,sectionPb,pagePx,contentMaxW,cardRadius,
  colorBg,colorTextPrimary,colorTextSecondary,colorTextTertiary,
  colorTextMuted,colorPlaceholder,colorBorderSubtle,colorAccent
}`;

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;

// designSystemToCss interpolates every field directly into an inline <style>
// tag rendered on every route (app/layout.tsx). Sanity content is
// user-editable, so each field must be constrained to the shape it's
// interpolated as before it can reach that sink: colorFoo fields to a strict
// hex color, everything else to a finite number. Anything malformed is
// dropped in favor of DS_DEFAULTS rather than risk breaking out of the
// <style> tag.
function sanitizeDesignSystem(raw: DesignSystemData | null): DesignSystemData {
  if (!raw) return {};
  const clean: DesignSystemData = {};
  for (const [key, value] of Object.entries(raw) as [keyof DesignSystemData, unknown][]) {
    if (key.startsWith("color")) {
      if (typeof value === "string" && HEX_COLOR_RE.test(value)) (clean[key] as string) = value;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      (clean[key] as number) = value;
    }
  }
  // Migrate the pre–type-system section rhythm (pb 64 + mb 80) to one gap.
  if (clean.sectionGap === 80 && (clean.sectionPb === 64 || clean.sectionPb === undefined)) {
    clean.sectionGap = 144;
    clean.sectionPb = 0;
  }
  if (clean.fsLabel === 16) clean.fsLabel = 15;
  if (clean.fsH3 === 20) clean.fsH3 = 24;
  if (clean.fsDisplay === 56) clean.fsDisplay = 48;
  return clean;
}

async function loadDesignSystem(): Promise<Required<DesignSystemData>> {
  const raw = await sanityClient.fetch<DesignSystemData | null>(DS_QUERY);
  return { ...DS_DEFAULTS, ...sanitizeDesignSystem(raw) };
}

/** `@sanity/client` does not honor `{ next: { tags } }` — wrap like
 *  the playground gallery so layout TTFB is not a live Sanity round-trip.
 *  Bust via Sanity webhook → `/api/revalidate` (`sanity`, `design-system`). */
export const getDesignSystem = cache(
  unstable_cache(loadDesignSystem, ["design-system"], {
    revalidate: 86400,
    tags: ["sanity", "design-system"],
  }),
);

/** Convert a DesignSystemData to a CSS :root{} override block */
export function designSystemToCss(ds: Required<DesignSystemData>): string {
  const accentRgb = ds.colorAccent; // e.g. "#C9622F"
  return `:root{
    --fs-display:${ds.fsDisplay}px;
    --fs-hero:clamp(32px, 6vw, ${ds.fsHero}px);
    --fs-home-hero:clamp(26px, 2.8vw, 36px);
    --fs-h2:${ds.fsH2}px;
    --fw-hero:${ds.fwHero * 10};--fw-h2:${ds.fwH2 * 10};--fw-card-title:${ds.fwCardTitle * 10};
    --fs-section-label:${ds.fsSectionLabel}px;
    --fs-h3:${ds.fsH3}px;--fs-xl:${ds.fsH3}px;
    --fs-body:${ds.fsBody}px;--fs-label:${ds.fsLabel}px;
    --fs-meta:${ds.fsMeta}px;--fs-caption:${ds.fsCaption}px;
    --fs-sm:13px;--fs-lg:${ds.fsCardTitle}px;
    --fs-stat:${ds.fsStat}px;--fs-card-title:${ds.fsCardTitle}px;
    --lh-body:${ds.lhBody};--lh-h2:${ds.lhH2};
    --lh-caption:1.4;--lh-sm:1.55;--lh-meta:1.45;--lh-lg:1.35;--lh-xl:1.25;
    --ls-body:0px;--ls-caption:0px;--ls-sm:0px;--ls-meta:-0.1px;--ls-lg:-0.15px;--ls-xl:-0.25px;
    --ls-hero:${ds.lsHero}px;--ls-h2:${ds.lsH2}px;
    --cs-section-gap:${ds.sectionGap}px;--cs-h2-mt:48px;--cs-h2-mb:24px;--cs-para-gap:16px;
    --section-gap:var(--cs-section-gap);--section-pb:${ds.sectionPb}px;
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
  /** Small quiet line above the card title (e.g. "Case study"). */
  label?: string;
  /** Omit (or leave empty) for a non-clickable card — no link, no pointer. */
  href?: string;
  mediaType: "video" | "image";
  muxPlaybackId?: string;
  image?: { asset: { url: string }; hotspot?: { x: number; y: number } };
  aspectRatio: string;
  order?: number;
  featured: boolean;
  caseStudy?: boolean;
}

const PROJECTS_QUERY = `*[_type == "project" && featured == true] | order(order asc) {
  _id, title, subtitle, href, mediaType, muxPlaybackId,
  image { asset->{ url }, hotspot },
  aspectRatio, order, featured, caseStudy
}`;

/** Homepage card copy, kept in code so a preview can ship without touching
 *  the shared Sanity dataset. Keyed by Sanity _id.
 *  Two lines only: `label` (quiet meta above) + `title` (main). No subtitle. */
const PROJECT_CARD_COPY: Record<string, Pick<SanityProject, "title" | "label">> = {
  "project-bruinlease": {
    title: "Helping UCLA students find a sublease they can trust",
    label: "Case study",
  },
  "project-todolist": {
    title: "Designing a to-do list with AI organization",
    label: "Exploration",
  },
  "project-sviz": {
    title: "Growing a keyboard YouTube channel to 8K subscribers and 1M+ views",
    label: "Community",
  },
};

/** Same-origin Allinone demo embed (seed trimmed; see public/allinone-demo). */
export { ALLINONE_APP_URL } from "@/lib/allinone";
import { ALLINONE_APP_URL } from "@/lib/allinone";

const PROJECT_HREF_OVERRIDES: Record<string, string> = {
  // Already the production Sanity href. Pinned here so the card stays on the
  // existing case study even if that document's href changes.
  "project-bruinlease": "/ucla-sublease",
  // Live Allinone demo URL (replaces the old amber deploy). The home card
  // opens this in ProjectPopup rather than navigating away.
  "project-todolist": ALLINONE_APP_URL,
};

/** Local first card — not in Sanity. Page copy lives in lib/caseStudies/joola.ts. */
const JOOLA_B2B_PROJECT: SanityProject = {
  _id: "project-joola-b2b",
  title: "Designing B2B ordering for the #1 pickleball brand",
  label: "Case study, Internship 2026",
  href: "/joola",
  mediaType: "video",
  muxPlaybackId: "gX4z7zlxZK85I7oNjrxK00ty3zVZtXmrxohRte00hCYs00",
  // Native film is 4:3; matches CD/habit tile rhythm and avoids cover crop.
  aspectRatio: "4 / 3",
  order: 0,
  featured: true,
};

async function loadProjects(): Promise<SanityProject[]> {
  const projects = await sanityClient.fetch<SanityProject[]>(PROJECTS_QUERY);
  const mapped = projects
    .filter((p) => p._id !== JOOLA_B2B_PROJECT._id)
    .map((p) => {
      const copy = PROJECT_CARD_COPY[p._id];
      return {
        ...p,
        ...copy,
        // Drop Sanity subtitle so cards stay on the two-line meta/main hierarchy.
        subtitle: undefined,
        href: PROJECT_HREF_OVERRIDES[p._id] ?? p.href,
      };
    });
  return [JOOLA_B2B_PROJECT, ...mapped];
}

export const getProjects = cache(
  unstable_cache(loadProjects, ["projects-v10-allinone-modal"], {
    revalidate: 86400,
    tags: ["sanity", "projects"],
  }),
);

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
  heroImage?: string;
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
  processImage?: string;

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
  figmaComparison?: string;

  // solution
  solutionLabel?: string;
  solutionHeading?: string;
  solutionBody?: string;
  solutionBg?: string;
  solutionMuxId?: string;
  solutionVideo?: string;
  solutionPhonePos?: PhonePos;

  // impact
  impactLabel?: string;
  impactHeading?: string;
  impactBody?: string;

  // reflection
  reflectionLabel?: string;
  reflectionItems?: ReflectionItem[];
}

const PHONE_POS_FRAGMENT = `{ videoX, videoY, videoScale, insetTop, insetBottom, insetSide, screenRadius }`;

const CASE_STUDY_QUERY = `*[_type == "caseStudy" && slug == $slug][0] {
  slug,
  tocItems[]{ _key, id, label },

  heroTagline, heroTitle, heroBg, heroMuxId,
  heroImage { asset->{ url } },
  heroPhonePos ${PHONE_POS_FRAGMENT},
  metadata[]{ _key, label, values },

  problemLabel, problemHeading, problemBody, problemImageCaption,
  problemImage { asset->{ url } },
  painPoints,

  researchLabel, researchHeading, researchBody,
  stats[]{ _key, value, label },

  processLabel, processHeading, processBody,
  processTools[]{ _key, tool, desc },
  figmaComparison { asset->{ url } },
  processImage { asset->{ url } },

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
  solutionVideo { asset->{ url } },
  solutionPhonePos ${PHONE_POS_FRAGMENT},

  impactLabel, impactHeading, impactBody,

  reflectionLabel,
  reflectionItems[]{ _key, heading, body }
}`;

type RawImg  = { asset: { url: string } } | null;
type RawFile = { asset: { url: string } } | null;

async function loadCaseStudy(slug: string): Promise<CaseStudyData> {
  const raw = await sanityClient.fetch<Record<string, unknown> | null>(
    CASE_STUDY_QUERY,
    { slug },
  );
  if (!raw) return { slug };

  const img  = (f: string, width = SANITY_IMG_WIDTH) =>
    sanityCdnUrl((raw[f] as RawImg)?.asset?.url, { width, quality: 85 });
  const file = (f: string) => (raw[f] as RawFile)?.asset?.url;

  return {
    ...(raw as object),
    problemImage:          img("problemImage"),
    decision1CardInitial:  img("decision1CardInitial"),
    decision1CardCondensed:img("decision1CardCondensed"),
    decision1CardFinal:    img("decision1CardFinal"),
    homepageComparison:    img("homepageComparison"),
    figmaComparison:       img("figmaComparison", SANITY_IMG_WIDTH_WIDE),
    heroImage:             img("heroImage", SANITY_IMG_WIDTH_WIDE),
    processImage:          img("processImage"),
    ueTestingVideo:        file("ueTestingVideo"),
    oldFlowVideo:          file("oldFlowVideo"),
    decision1Video:        file("decision1Video"),
    solutionVideo:         file("solutionVideo"),
  } as CaseStudyData;
}

/** Per-request dedupe + tagged cross-request cache.
 *  Bust via webhook tags `sanity` / `case-study:<slug>`. */
export const getCaseStudy = cache(async (slug: string): Promise<CaseStudyData> => {
  return unstable_cache(() => loadCaseStudy(slug), ["case-study", slug], {
    revalidate: 86400,
    tags: ["sanity", `case-study:${slug}`],
  })();
});

// Legacy shim — keeps old imports working
export async function getCaseStudyAssets(slug: string) {
  return getCaseStudy(slug);
}

// ── Archive Gallery (BentoGallery on /archive; Sanity type still playgroundGallery) ──

export interface PlaygroundGalleryItem {
  key: string;
  src: string;
  /** Tiny LQIP / blurred poster for instant paint + blur-up crossfade. */
  blurDataURL?: string;
  alt?: string;
  caption?: string;
  link?: string;
  colSpan: 1 | 2;
  rowSpan: 1 | 2;
  /** Natural width/height from Sanity image metadata — drives tile height. */
  aspectRatio?: number;
  /** First-viewport tiles — eager + high fetch priority in BentoGallery. */
  priority?: boolean;
}

// Maps the Studio-friendly "shape" field to BentoGallery's grid units.
// When aspectRatio is present, rowSpan is ignored for height — shape mainly
// controls column span (wide/large → 2 cols; square/tall → 1 col).
const SHAPE_TO_SPAN: Record<string, { colSpan: 1 | 2; rowSpan: 1 | 2 }> = {
  square: { colSpan: 1, rowSpan: 1 },
  tall:   { colSpan: 1, rowSpan: 2 },
  wide:   { colSpan: 2, rowSpan: 1 },
  large:  { colSpan: 2, rowSpan: 2 },
};

const PLAYGROUND_GALLERY_QUERY = `*[_type == "playgroundGallery"][0]{
  items[]{
    _key, caption, alt, link, shape,
    image{
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height, aspectRatio }
        }
      }
    }
  }
}`;

interface RawPlaygroundItem {
  _key: string;
  caption?: string;
  alt?: string;
  link?: string;
  shape?: string;
  image?: {
    asset?: {
      _id?: string;
      url?: string;
      metadata?: {
        lqip?: string;
        dimensions?: {
          width?: number;
          height?: number;
          aspectRatio?: number;
        };
      };
    };
  };
}

function playgroundImageSrc(it: RawPlaygroundItem): string | undefined {
  const asset = it.image?.asset;
  if (!asset?._id && !asset?.url) return undefined;
  const shape = it.shape ?? "square";
  const width =
    shape === "wide" || shape === "large"
      ? SANITY_IMG_WIDTH_WIDE
      : SANITY_IMG_WIDTH;
  if (asset._id) {
    const url = sanityImageUrl(
      { asset: { _ref: asset._id } },
      { width, quality: 85 }
    );
    if (url) return url;
  }
  return sanityCdnUrl(asset.url, { width, quality: 85 }) ?? asset.url;
}

/** Instant paint: Sanity LQIP (base64) or a tiny blurred CDN derivative. */
function playgroundBlurDataURL(it: RawPlaygroundItem): string | undefined {
  const asset = it.image?.asset;
  if (!asset) return undefined;
  if (asset.metadata?.lqip) return asset.metadata.lqip;
  if (asset._id) {
    return sanityImageUrl(
      { asset: { _ref: asset._id } },
      { width: 24, quality: 20, blur: 50 }
    );
  }
  return sanityCdnUrl(asset.url, { width: 24, quality: 20, blur: 50 });
}

function playgroundAspectRatio(it: RawPlaygroundItem): number | undefined {
  const dims = it.image?.asset?.metadata?.dimensions;
  if (!dims) return undefined;
  if (dims.aspectRatio && dims.aspectRatio > 0) return dims.aspectRatio;
  if (dims.width && dims.height && dims.height > 0) return dims.width / dims.height;
  return undefined;
}

/** First in list → packed earliest → most visible in the default viewport. */
const PLAYGROUND_PRIORITY = [
  "the marias",
  "asap rocky",
  "j. cole",
  "gunna",
  "playboi carti",
  "geonworks f1-8x",
  "singa unikorn",
];

function playgroundPriorityRank(caption?: string): number {
  const key = (caption ?? "").toLowerCase().trim();
  const idx = PLAYGROUND_PRIORITY.findIndex(
    (p) => key === p || key.includes(p) || p.includes(key)
  );
  return idx === -1 ? PLAYGROUND_PRIORITY.length : idx;
}

async function loadPlaygroundGallery(): Promise<PlaygroundGalleryItem[]> {
  const raw = await sanityClient.fetch<{ items?: RawPlaygroundItem[] } | null>(
    PLAYGROUND_GALLERY_QUERY,
    {},
  );
  const items = raw?.items ?? [];
  const result: PlaygroundGalleryItem[] = [];
  for (const it of items) {
    const src = playgroundImageSrc(it);
    if (!src) continue;
    const span = SHAPE_TO_SPAN[it.shape ?? "square"] ?? SHAPE_TO_SPAN.square;
    const rank = playgroundPriorityRank(it.caption);
    result.push({
      key: it._key,
      src,
      blurDataURL: playgroundBlurDataURL(it),
      alt: it.alt || it.caption,
      caption: it.caption,
      link: it.link,
      aspectRatio: playgroundAspectRatio(it),
      colSpan: span.colSpan,
      rowSpan: span.rowSpan,
      priority: rank < PLAYGROUND_PRIORITY.length,
    });
  }
  result.sort(
    (a, b) =>
      playgroundPriorityRank(a.caption) - playgroundPriorityRank(b.caption) ||
      (a.caption ?? "").localeCompare(b.caption ?? "")
  );
  return result;
}

/** Cross-request cache. `@sanity/client` does not honor `{ next: { tags } }`,
 *  so every archive nav used to hit Sanity live (~1s). Home layout warms this.
 *  Bust via webhook tags `sanity` / `archive`. */
export const getPlaygroundGallery = cache(
  unstable_cache(loadPlaygroundGallery, ["playground-gallery"], {
    revalidate: 86400,
    tags: ["sanity", "archive"],
  }),
);
