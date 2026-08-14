import { Suspense } from "react";
import type { Metadata } from "next";
import { getPlaygroundGallery, type PlaygroundGalleryItem } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site";
import ArchivePageClient from "./ArchivePageClient";

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

function ArchiveShell({ items }: { items: PlaygroundGalleryItem[] }) {
  return <ArchivePageClient items={items} />;
}

async function ArchiveFromServer() {
  const items = await getPlaygroundGallery().catch(
    () => [] as PlaygroundGalleryItem[],
  );
  return <ArchiveShell items={items} />;
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<ArchiveShell items={[]} />}>
      <ArchiveFromServer />
    </Suspense>
  );
}
