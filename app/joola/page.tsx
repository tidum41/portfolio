import type { Metadata } from "next";
import ProductCaseStudy from "@/components/ProductCaseStudy";
import { JOOLA_CASE_STUDY } from "@/lib/caseStudies/joola";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: JOOLA_CASE_STUDY.title,
  description: JOOLA_CASE_STUDY.description,
  alternates: { canonical: `${SITE_URL}/joola` },
  openGraph: {
    title: `${JOOLA_CASE_STUDY.title} — mudit mahajan`,
    description: JOOLA_CASE_STUDY.description,
    url: `${SITE_URL}/joola`,
  },
};

export default function JoolaCaseStudyPage() {
  return <ProductCaseStudy content={JOOLA_CASE_STUDY} />;
}
