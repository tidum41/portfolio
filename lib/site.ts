/** Canonical site config for metadata, sitemap, and structured data. */

export const SITE_URL = "https://www.muditm.com";
export const SITE_NAME = "mudit mahajan";

/**
 * Visible homepage hero — single source of truth for on-page + SEO copy.
 *
 * Copy pattern (from portfolios that scan well in one glance):
 *   name + role + one craft verb + one concrete tell
 * School and job already live in the subtitle — don't repeat them here.
 * Keep the exact phrase "rabbit holes": RabbitHoleVideo wraps it as the
 * homepage easter egg.
 *
 * Lead + tell are split so the tell can nowrap as a unit. Joined, they are
 * the H1 / meta description string.
 */
export const HERO_HEADLINE_LEAD =
  "I'm Mudit, a product designer who engineers interactions";
export const HERO_HEADLINE_TELL = "and falls down rabbit holes";
export const HERO_HEADLINE = `${HERO_HEADLINE_LEAD} ${HERO_HEADLINE_TELL}`;

/**
 * Meta description / OG / JSON-LD — composed from the hero copy so Google
 * isn't stitching mismatched phrases from separate strings.
 */
export const SITE_DESCRIPTION =
  `${HERO_HEADLINE}. Currently @ JOOLA | cognitive science @ UCLA`;

/** Default social / Open Graph image (1200×630). */
export const OG_IMAGE_PATH = "/og-default.png";
export const OG_IMAGE_ALT =
  "mudit mahajan — product designer who engineers interactions";

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
