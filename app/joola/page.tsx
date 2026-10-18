import type { Metadata } from "next";
import ProductCaseStudy from "@/components/ProductCaseStudy";
import { JOOLA_SUBTITLE, JOOLA_TITLE } from "@/lib/caseStudies/joola";
import { SITE_URL } from "@/lib/site";

const description = JOOLA_SUBTITLE;

export const metadata: Metadata = {
  title: JOOLA_TITLE,
  description,
  alternates: { canonical: `${SITE_URL}/joola` },
  openGraph: {
    title: `${JOOLA_TITLE} — mudit mahajan`,
    description,
    url: `${SITE_URL}/joola`,
  },
};

export default function JoolaCaseStudyPage() {
  return <ProductCaseStudy />;
}
