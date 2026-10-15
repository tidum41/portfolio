import type { Metadata } from "next";
import { preconnect } from "react-dom";
import { HLS_LIGHT_SRC } from "@/lib/hlsLight";
import { getMuxCardWarmup } from "@/lib/muxCardWarmup";
import {
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

// The real work-page content is rendered by the root layout's persistent
// shell (see components/PersistentWorkShell.tsx) so it never unmounts across
// navigation. This route intentionally renders nothing visible — do not
// reintroduce project-grid / PhoneEmbed imports here.
//
// Metadata lives here (not only in layout) so the homepage description is
// explicit and canonical — same pattern Framer uses for site-level SEO.
export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

export default async function Home() {
  const warm = await getMuxCardWarmup();
  for (const origin of warm.preconnect) {
    preconnect(origin, { crossOrigin: "anonymous" });
  }
  return (
    <>
      {/* Download the player with the HTML. Reduced motion never plays it. */}
      <link
        rel="preload"
        as="script"
        href={HLS_LIGHT_SRC}
        media="(prefers-reduced-motion: no-preference)"
      />
      {/* Phone cards only. Desktop already starts from the full ladder, and
          a wide layout should not pay for the 480p startup segments. */}
      {warm.preload.map((item) => (
        <link
          key={item.href}
          rel="preload"
          as="fetch"
          href={item.href}
          crossOrigin="anonymous"
          media={
            item.aboveFold
              ? "(max-width: 800px) and (prefers-reduced-motion: no-preference)"
              : "(min-width: 768px) and (max-width: 800px) and (prefers-reduced-motion: no-preference)"
          }
        />
      ))}
    </>
  );
}
