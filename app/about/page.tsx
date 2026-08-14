import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "about",
  description:
    "About Mudit Mahajan — UCLA product designer. Experience at JOOLA, Beacons AI, Dialogue AI, and more.",
  alternates: { canonical: `${SITE_URL}/about` },
};

// Keep-alive about lives in the root layout (PersistentAboutShell),
// matching `/` + PersistentWorkShell. This route only supplies metadata.
export default function AboutPage() {
  return null;
}
