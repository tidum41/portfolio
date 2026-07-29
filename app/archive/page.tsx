import type { Metadata } from "next";
import { getPlaygroundGallery } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site";
import ArchivePageClient from "./ArchivePageClient";

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

export default async function ArchivePage() {
  const items = await getPlaygroundGallery();
  return <ArchivePageClient items={items} />;
}
