import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

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

// Keep-alive archive lives in the root layout (PersistentArchiveShell),
// matching `/` + PersistentWorkShell. This route only supplies metadata.
export default function ArchivePage() {
  return null;
}
