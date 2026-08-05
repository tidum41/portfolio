import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "about",
  description:
    "About Mudit Mahajan — UCLA product designer. Experience at JOOLA, Beacons AI, Dialogue AI, and more.",
  alternates: { canonical: `${SITE_URL}/about` },
  // Keep /about reachable by URL + nav, but keep the homepage as the only
  // primary search result for "Mudit Mahajan" / muditm.com.
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  openGraph: {
    title: "about — mudit mahajan",
    description:
      "About Mudit Mahajan — UCLA product designer. Experience, orgs, and links.",
    url: `${SITE_URL}/about`,
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
