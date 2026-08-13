"use client";

import { usePathname } from "next/navigation";
import type { PlaygroundGalleryItem } from "@/lib/sanity/queries";
import ArchivePageClient from "@/app/archive/ArchivePageClient";
import { useKeepAliveInstant } from "@/lib/useKeepAliveInstant";
import { useKeepAliveVisit } from "@/lib/useKeepAliveVisit";
import { onWarmArchive, wasArchiveWarmed } from "@/lib/keepAliveWarm";

/**
 * Session keep-alive for /archive. First visit (or idle/hover warm) mounts
 * the gallery; later visits are display toggles.
 */
export default function PersistentArchiveShell({
  items,
}: {
  items: PlaygroundGalleryItem[];
}) {
  const pathname = usePathname();
  const onArchive = pathname === "/archive";
  const hasVisited = useKeepAliveVisit(onArchive, wasArchiveWarmed(), onWarmArchive);
  const instant = useKeepAliveInstant(onArchive);

  if (!hasVisited) return null;

  return (
    <div
      style={{ display: onArchive ? "block" : "none", position: "relative", zIndex: 1 }}
      aria-hidden={!onArchive}
      inert={!onArchive}
      {...(!onArchive ? { "data-nosnippet": true } : {})}
    >
      <ArchivePageClient items={items} active={onArchive} instant={instant} />
    </div>
  );
}
