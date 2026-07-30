import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

/** Default max width for content images (retina-friendly, avoids full originals). */
export const SANITY_IMG_WIDTH = 2000;
/** Wider tiles / hero-ish Sanity assets. */
export const SANITY_IMG_WIDTH_WIDE = 2400;

export type SanityImageOpts = {
  width?: number;
  quality?: number;
  /** Sanity CDN blur 0–100 — for tiny LQIP-style posters. */
  blur?: number;
};

/**
 * Build a Sanity CDN URL with auto format + quality + width cap.
 * Falls back to undefined when the source can't be resolved.
 */
export function sanityImageUrl(
  source: SanityImageSource | null | undefined,
  opts: SanityImageOpts = {}
): string | undefined {
  if (!source) return undefined;
  const { width = SANITY_IMG_WIDTH, quality = 85, blur } = opts;
  try {
    let img = builder.image(source).auto("format").quality(quality).width(width);
    if (blur != null && blur > 0) img = img.blur(blur);
    const url = img.url();
    return url ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Cap an already-resolved Sanity CDN asset URL with image params.
 * Useful when queries only return `asset.url` (no `_ref`).
 */
export function sanityCdnUrl(
  url: string | null | undefined,
  opts: SanityImageOpts = {}
): string | undefined {
  if (!url) return undefined;
  const { width = SANITY_IMG_WIDTH, quality = 85, blur } = opts;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("sanity.io")) return url;
    u.searchParams.set("auto", "format");
    u.searchParams.set("q", String(quality));
    u.searchParams.set("w", String(width));
    if (blur != null && blur > 0) u.searchParams.set("blur", String(blur));
    return u.toString();
  } catch {
    return url;
  }
}
