import { getPlaygroundGallery } from "@/lib/sanity/queries";
import PlaygroundPageClient from "./PlaygroundPageClient";

export default async function PlaygroundPage() {
    const items = await getPlaygroundGallery();
    return <PlaygroundPageClient items={items} />;
}
