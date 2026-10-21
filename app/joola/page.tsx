import type { Metadata } from "next";
import ProductCaseStudy from "@/components/ProductCaseStudy";
import { JOOLA_TITLE } from "@/lib/caseStudies/joola";
import { SITE_URL } from "@/lib/site";

const description = "B2B ordering for JOOLA. Product design internship, summer 2026.";

export const metadata: Metadata = {
  title: JOOLA_TITLE,
  description,
  alternates: { canonical: `${SITE_URL}/joola` },
  openGraph: {
    title: `${JOOLA_TITLE}, Mudit Mahajan`,
    description,
    url: `${SITE_URL}/joola`,
  },
};

export default function JoolaCaseStudyPage() {
  return <ProductCaseStudy />;
}
