import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// Content lives in root layout PersistentArchiveShell — same pattern as Work.
export const metadata: Metadata = {
  title: "archive",
  description:
    "Archive — experiments, visuals, and personal work by Mudit Mahajan.",
  alternates: { canonical: `${SITE_URL}/archive` },
  openGraph: {
    title: "archive — mudit mahajan",
    description:
      "Archive — experiments, visuals, and personal work by Mudit Mahajan.",
    url: `${SITE_URL}/archive`,
  },
};

export default function ArchivePage() {
  return null;
}
