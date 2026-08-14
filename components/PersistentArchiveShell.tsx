"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ArchivePageClient from "@/app/archive/ArchivePageClient";
import {
  peekArchiveGallery,
  rememberArchiveGallery,
  warmArchiveGallery,
} from "@/lib/archiveGalleryCache";
import type { PlaygroundGalleryItem } from "@/lib/sanity/queries";

/**
 * Archive keep-alive — same hide contract as PersistentWorkShell.
 *
 * Work uses `display: none` off-route. Archive must too. `visibility: hidden`
 * on this wrapper cannot hide BentoGallery: the canvas (and captions) set
 * `visibility: visible`, and a visible descendant paints through a hidden
 * ancestor. That is the About/Work bento leak.
 *
 * Speed without painting off-route:
 *   - Gallery JSON is seeded from the root layout (no Sanity wait).
 *   - The client tree stays mounted so a return visit does not remount.
 *   - PrimaryRouteWarmup decodes LQIP posters via Image(), not a second grid.
 *   - Full images attach only while `/archive` is showing.
 *   - `.ps3-enter` is added only while visible, so leave/return replays.
 */
export default function PersistentArchiveShell({
  items: serverItems,
}: {
  items: PlaygroundGalleryItem[];
}) {
  const pathname = usePathname();
  const visible = pathname === "/archive";

  if (serverItems.length) rememberArchiveGallery(serverItems);

  const [items, setItems] = useState<PlaygroundGalleryItem[]>(
    () => peekArchiveGallery() ?? serverItems,
  );

  useEffect(() => {
    if (items.length) return;
    let cancelled = false;
    void warmArchiveGallery().then((data) => {
      if (!cancelled && data.length) setItems(data);
    });
    return () => {
      cancelled = true;
    };
  }, [items.length]);

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      aria-hidden={!visible}
      inert={!visible}
      {...(!visible ? { "data-nosnippet": true } : {})}
    >
      <ArchivePageClient items={items} visible={visible} />
    </div>
  );
}
