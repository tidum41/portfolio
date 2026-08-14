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
 * Archive keep-alive — same idea as PersistentWorkShell, Archive only.
 *
 * Remounting `/archive` waited on RSC + BentoGallery + full-image decode,
 * which is why the click felt dead even after the Sanity cache. This shell:
 *   - Mounts once from the root layout (never unmounts on nav).
 *   - Stays in the DOM with visibility/opacity, not display:none, so LQIP
 *     posters can decode while the user is still on Work (nav is intro-hidden
 *     for ~2s — enough time).
 *   - Attaches full image `src` only while `/archive` is showing.
 *   - Replays `.ps3-enter` on each show by toggling the class with `visible`.
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
      className={visible ? "archive-keep-alive" : "archive-keep-alive archive-keep-alive--hidden"}
      aria-hidden={!visible}
      inert={!visible}
      {...(!visible ? { "data-nosnippet": true } : {})}
    >
      <ArchivePageClient items={items} visible={visible} />
    </div>
  );
}
