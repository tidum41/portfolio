/** Canonical site config for metadata, sitemap, and structured data. */
export const SITE_URL = "https://www.muditm.com";
export const SITE_NAME = "mudit mahajan";

export const SITE_DESCRIPTION =
  "Portfolio of Mudit Mahajan — UCLA product design student. Case studies in product design, frontend, and creative work.";

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
