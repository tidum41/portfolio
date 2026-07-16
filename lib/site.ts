/** Canonical site config for metadata, sitemap, and structured data. */

export const SITE_URL = "https://www.muditm.com";
export const SITE_NAME = "mudit mahajan";

/** Visible homepage hero — single source of truth for on-page + SEO copy. */
export const HERO_HEADLINE =
  "I'm Mudit, a product designer with a love for craft, curiosity, and rabbit holes";

/**
 * Meta description / OG / JSON-LD — composed from the hero copy so Google
 * isn't stitching mismatched phrases from separate strings.
 */
export const SITE_DESCRIPTION =
  `${HERO_HEADLINE}. Currently @ JOOLA | cognitive science @ UCLA`;

export const FOOTER_LINKS = [
  { label: "linkedin", href: "https://www.linkedin.com/in/muditmahajan14/" },
  { label: "x", href: "https://x.com/muditm14" },
  { label: "email", href: "mailto:muditmahajan@ucla.edu" },
  {
    label: "resume",
    href: "https://drive.google.com/file/d/1SFiqIjwtzkeJ4TEHE7z9_UNWtkyb1ixm/view?usp=drive_link",
  },
] as const;

/** Public profile URLs for schema.org sameAs (excludes mailto / resume). */
export const SAME_AS = FOOTER_LINKS.filter(
  (l) => l.label === "linkedin" || l.label === "x",
).map((l) => l.href);
