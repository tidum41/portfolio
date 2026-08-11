import {
  OG_IMAGE_PATH,
  SAME_AS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

/** Serializes site JSON-LD for BootScripts (injected outside the React tree). */
export function getSiteJsonLd(): string {
  const logoUrl = `${SITE_URL}/icon-512.png`;
  const imageUrl = `${SITE_URL}${OG_IMAGE_PATH}`;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#person` },
        inLanguage: "en-US",
        image: imageUrl,
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Mudit Mahajan",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        email: "muditmahajan@ucla.edu",
        jobTitle: "Product Design Intern",
        image: logoUrl,
        worksFor: {
          "@type": "Organization",
          name: "JOOLA",
        },
        affiliation: {
          "@type": "CollegeOrUniversity",
          name: "UCLA",
        },
        sameAs: SAME_AS,
      },
    ],
  });
}
