import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import AboutPageContent from "@/components/AboutPageContent";

export const metadata: Metadata = {
  title: "about",
  description:
    "About Mudit Mahajan — UCLA product designer. Experience at JOOLA, Beacons AI, Dialogue AI, and more.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
