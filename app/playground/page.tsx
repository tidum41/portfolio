import type { Metadata } from "next";
import { getPlaygroundGallery } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site";
import PlaygroundPageClient from "./PlaygroundPageClient";

export const metadata: Metadata = {
  title: "play",
  description:
    "Playground — experiments, visuals, and personal work by Mudit Mahajan.",
  alternates: { canonical: `${SITE_URL}/playground` },
  openGraph: {
    title: "play — mudit mahajan",
    description:
      "Playground — experiments, visuals, and personal work by Mudit Mahajan.",
    url: `${SITE_URL}/playground`,
  },
};

export default async function PlaygroundPage() {
    const items = await getPlaygroundGallery();
    return <PlaygroundPageClient items={items} />;
}
