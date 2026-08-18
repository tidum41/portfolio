/** Canonical site config for metadata, sitemap, and structured data. */

export const SITE_URL = "https://www.muditm.com";
export const SITE_NAME = "mudit mahajan";

/** Visible homepage hero — single source of truth for on-page + SEO copy. */
export const HERO_HEADLINE =
  "I'm Mudit, a product designer with a love for people, curiosity, and rabbit holes";

/**
 * Meta description / OG / JSON-LD — composed from the hero copy so Google
 * isn't stitching mismatched phrases from separate strings.
 */
export const SITE_DESCRIPTION =
  `${HERO_HEADLINE}. Currently @ JOOLA | cognitive science @ UCLA`;

/** Default social / Open Graph image (1200×630). */
export const OG_IMAGE_PATH = "/og-default.png";
export const OG_IMAGE_ALT =
  "mudit mahajan — product design, people, and rabbit holes";

/** Self-hosted resume (also reachable at /resume). */
export const RESUME_PATH = "/resume.pdf";

export const FOOTER_LINKS = [
  { label: "linkedin", href: "https://www.linkedin.com/in/muditmahajan14/" },
  { label: "x", href: "https://x.com/muditm14" },
  { label: "email", href: "mailto:muditmahajan@ucla.edu" },
  { label: "resume", href: RESUME_PATH },
] as const;

/** Public profile URLs for schema.org sameAs (excludes mailto / resume). */
export const SAME_AS = FOOTER_LINKS.filter(
  (l) => l.label === "linkedin" || l.label === "x",
).map((l) => l.href);
