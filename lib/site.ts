/** Canonical site config for metadata, sitemap, and structured data. */

export const SITE_URL = "https://www.muditm.com";
export const SITE_NAME = "Mudit Mahajan";

/** Visible homepage hero — single source of truth for on-page + SEO copy. */
export const HERO_HEADLINE =
  "I’m Mudit, an AI-native product designer who prototypes in code to make tech feel empathetic.";

/**
 * Meta description / OG / JSON-LD — composed from the hero copy so Google
 * isn't stitching mismatched phrases from separate strings.
 */
export const SITE_DESCRIPTION =
  `${HERO_HEADLINE} Leading Cursor @ UCLA. Previously design engineer @ JOOLA.`;

/** Default social / Open Graph image (1200×630). */
export const OG_IMAGE_PATH = "/og-default.png";
export const OG_IMAGE_ALT =
  "Mudit Mahajan — product design, people, and rabbit holes";

/** Self-hosted resume (also reachable at /resume). */
export const RESUME_PATH = "/resume.pdf";

/** Site-wide contact address (copy-to-clipboard in the UI, not mailto). */
export const CONTACT_EMAIL = "muditmahajan@ucla.edu";

export type FooterLinkItem =
  | { label: string; href: string }
  | { label: string; copyEmail: true };

export const FOOTER_LINKS: readonly FooterLinkItem[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/muditmahajan14/" },
  { label: "X", href: "https://x.com/muditm14" },
  { label: "Email", copyEmail: true },
  { label: "Resume", href: RESUME_PATH },
];

/** Public profile URLs for schema.org sameAs (excludes email / resume). */
export const SAME_AS = FOOTER_LINKS.filter(
  (l): l is { label: string; href: string } =>
    "href" in l && (l.label === "LinkedIn" || l.label === "X" || l.label === "linkedin" || l.label === "x"),
).map((l) => l.href);
