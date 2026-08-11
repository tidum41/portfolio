import Script from "next/script";
import {
  OG_IMAGE_PATH,
  SAME_AS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export default function JsonLd() {
  const logoUrl = `${SITE_URL}/icon-512.png`;
  const imageUrl = `${SITE_URL}${OG_IMAGE_PATH}`;

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
  };

  // next/script avoids React 19's raw-<script>-in-component console error
  // while keeping JSON-LD in the document for crawlers. beforeInteractive is
  // valid in the App Router root layout (JsonLd is only mounted there).
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- root layout via JsonLd
    <Script
      id="site-jsonld"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
