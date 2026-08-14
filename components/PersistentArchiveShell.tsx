"use client";

import { usePathname } from "next/navigation";
import type { PlaygroundGalleryItem } from "@/lib/sanity/queries";
import ArchivePageClient from "@/app/archive/ArchivePageClient";
import XmbColumn from "@/components/XmbColumn";
import { useKeepAliveInstant } from "@/lib/useKeepAliveInstant";
import { useKeepAliveVisit } from "@/lib/useKeepAliveVisit";
import { useColumnFocus } from "@/lib/useColumnFocus";

/**
 * Session keep-alive for /archive. Mounts on first visit (not idle-premount,
 * which laid the gallery out at 0×0). Shell fades; tiles stay at rest.
 */
export default function PersistentArchiveShell({
  items,
}: {
  items: PlaygroundGalleryItem[];
}) {
  const pathname = usePathname();
  const onArchive = pathname === "/archive";
  const hasVisited = useKeepAliveVisit(onArchive);
  const snap = useKeepAliveInstant(onArchive);
  const phase = useColumnFocus(onArchive, { snap, playMountEnter: true });

  if (!hasVisited) return null;

  return (
    <XmbColumn phase={phase} pin>
      <ArchivePageClient items={items} active={phase !== "hidden"} instant />
    </XmbColumn>
  );
}
