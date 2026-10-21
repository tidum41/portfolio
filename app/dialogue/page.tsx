import type { Metadata } from "next";
import { DialogueCaseStudyContent } from "@/components/dialogue/DialogueCaseStudyContent";
import { DIALOGUE_DRAFT } from "@/lib/caseStudies/dialogue";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const description =
  "Dialogue case study on visualizing qualitative interview data so UX researchers can trust study chat answers down to the second.";

export const metadata: Metadata = {
  title: { absolute: "Dialogue, Mudit Mahajan" },
  description,
  alternates: { canonical: `${SITE_URL}/dialogue` },
  robots: DIALOGUE_DRAFT ? { index: false, follow: false } : undefined,
  openGraph: {
    title: "Dialogue, Mudit Mahajan",
    description,
    url: `${SITE_URL}/dialogue`,
  },
};

export default function DialogueCaseStudyPage() {
  return <DialogueCaseStudyContent />;
}
