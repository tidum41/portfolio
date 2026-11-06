import { sanityCdnUrl } from "@/lib/sanity/imageUrl";
import type { SanityProject } from "@/lib/sanity/queries";
import type { LabProject } from "./types";

function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function projectImageUrl(p: SanityProject): string {
  if (p.mediaType === "video" && p.muxPlaybackId) {
    return `https://image.mux.com/${p.muxPlaybackId}/thumbnail.webp?time=1&width=1280`;
  }
  const raw = p.image?.asset?.url;
  if (raw) return sanityCdnUrl(raw, { width: 1280 }) ?? raw;
  return "";
}

function toLab(p: SanityProject, kind: LabProject["kind"]): LabProject | null {
  const imageUrl = projectImageUrl(p);
  if (!imageUrl) return null;
  return {
    id: p._id,
    title: p.title,
    subtitle: p.subtitle,
    imageUrl,
    aspectRatio: p.aspectRatio || "4 / 3",
    kind,
  };
}

/** Three tiles: internal case study, external demo, and dual affordance copy. */
export function pickLabProjects(all: SanityProject[]): LabProject[] {
  const caseStudySrc =
    all.find((p) => p.caseStudy && !isExternalHref(p.href)) ??
    all.find((p) => !isExternalHref(p.href));
  const demoSrc =
    all.find((p) => isExternalHref(p.href)) ??
    all.find((p) => !p.caseStudy && !isExternalHref(p.href)) ??
    caseStudySrc;

  const caseTile = caseStudySrc ? toLab(caseStudySrc, "case-study") : null;
  const demoTile = demoSrc ? toLab(demoSrc, "demo") : null;
  const fourthSrc =
    all.find(
      (p) =>
        p._id !== caseStudySrc?._id &&
        p._id !== demoSrc?._id &&
        projectImageUrl(p),
    ) ?? null;
  const bothTile = fourthSrc
    ? toLab({ ...fourthSrc, _id: `${fourthSrc._id}-hilab-both` }, "both")
    : caseStudySrc
      ? toLab({ ...caseStudySrc, _id: `${caseStudySrc._id}-hilab-both` }, "both")
      : null;

  return [caseTile, demoTile, bothTile].filter((x): x is LabProject => x != null);
}
