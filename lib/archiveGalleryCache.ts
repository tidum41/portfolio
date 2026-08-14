import type { PlaygroundGalleryItem } from "@/lib/sanity/queries";

let cached: PlaygroundGalleryItem[] | null = null;
let inflight: Promise<PlaygroundGalleryItem[]> | null = null;

export function peekArchiveGallery(): PlaygroundGalleryItem[] | null {
  return cached;
}

export function rememberArchiveGallery(items: PlaygroundGalleryItem[]) {
  if (items.length) cached = items;
}

export function warmArchiveGallery(): Promise<PlaygroundGalleryItem[]> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetch("/api/archive-gallery")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<PlaygroundGalleryItem[]>;
    })
    .then((items) => {
      rememberArchiveGallery(items);
      return items;
    })
    .catch(() => cached ?? [])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
