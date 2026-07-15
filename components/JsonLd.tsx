import { SAME_AS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export default function JsonLd() {
  const data = {
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
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Mudit Mahajan",
        url: SITE_URL,
        email: "muditmahajan@ucla.edu",
        jobTitle: "Product Design Student",
        affiliation: {
          "@type": "CollegeOrUniversity",
          name: "UCLA",
        },
        sameAs: SAME_AS,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
