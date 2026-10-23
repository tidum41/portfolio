import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;
export const metadata: Metadata = {
  title: "Archive",
  description:
    "Archive — experiments, visuals, and personal work by Mudit Mahajan.",
  alternates: { canonical: `${SITE_URL}/archive` },
  openGraph: {
    title: "archive, Mudit Mahajan",
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
