import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "about",
  description:
    "About Mudit Mahajan — UCLA product designer. Experience at JOOLA, Beacons AI, Dialogue AI, and more.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "about — mudit mahajan",
    description:
      "About Mudit Mahajan — UCLA product designer. Experience, orgs, and links.",
    url: `${SITE_URL}/about`,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
