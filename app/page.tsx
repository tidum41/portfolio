import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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

export default function Home() {
  return null;
}
