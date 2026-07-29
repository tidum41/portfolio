import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import AboutV2Page from "./AboutV2Client";

export const metadata: Metadata = {
  title: "about · archive",
  description:
    "Archive sheet — Mudit Mahajan, UCLA product designer. Biography, experience, Product Space, and soundtrack.",
  alternates: { canonical: `${SITE_URL}/about/v2` },
  robots: { index: false, follow: true },
  openGraph: {
    title: "about · archive — mudit mahajan",
    description:
      "Editorial about page — Mudit Mahajan, UCLA product designer.",
    url: `${SITE_URL}/about/v2`,
  },
};

export default function AboutV2Route() {
  return <AboutV2Page />;
}
