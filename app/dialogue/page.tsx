import type { Metadata } from "next";
import { preload } from "react-dom";
import { DialogueCaseStudyContent } from "@/components/dialogue/DialogueCaseStudyContent";
import { DIALOGUE_DRAFT, DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";
import { CASE_STUDY_LCP } from "@/lib/caseStudyNav";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const description =
  "Dialogue case study on visualizing qualitative interview data so UX researchers can trust study chat answers down to the second.";

export const metadata: Metadata = {
  title: "Dialogue",
  description,
  alternates: { canonical: `${SITE_URL}/dialogue` },
  robots: DIALOGUE_DRAFT ? { index: false, follow: false } : undefined,
  openGraph: {
    title: `${DIALOGUE_TITLE} | mudit mahajan`,
    description,
    url: `${SITE_URL}/dialogue`,
  },
};

export default function DialogueCaseStudyPage() {
  const lcp = CASE_STUDY_LCP["/dialogue"];
  if (lcp) preload(lcp, { as: "image" });

  return <DialogueCaseStudyContent />;
}
