import type { Metadata } from "next";
import { preconnect } from "react-dom";
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
  // The grid player (public/vendor/hls-light.min.js) is injected by the
  // BootScripts hls boot once the intro finishes, since the cards are hidden
  // until then. A preload here put 117 KB on the first-load critical path, and
  // the hint also fired on every other route that prefetched "/".
  // The warm map is only read on "/" (HLS boot + MuxMediaSlot), so it is
  // written here rather than into every route's document.
  return (
    <script
      id="mux-card-warm"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(warm.playlists).replace(/</g, "\\u003c") }}
    />
  );
}
