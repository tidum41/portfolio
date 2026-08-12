"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { PlaygroundGalleryItem } from "@/lib/sanity/queries";
import ArchivePageClient from "@/app/archive/ArchivePageClient";

/**
 * Session keep-alive for /archive. First visit mounts the gallery; later
 * visits are display toggles (footer fix is gated on `active`).
 */
export default function PersistentArchiveShell({
  items,
}: {
  items: PlaygroundGalleryItem[];
}) {
  const pathname = usePathname();
  const onArchive = pathname === "/archive";
  const [hasVisited, setHasVisited] = useState(onArchive);

  useLayoutEffect(() => {
    if (onArchive) setHasVisited(true);
  }, [onArchive]);

  if (!hasVisited) return null;

  return (
    <div
      style={{ display: onArchive ? "block" : "none", position: "relative", zIndex: 1 }}
      aria-hidden={!onArchive}
      inert={!onArchive}
      {...(!onArchive ? { "data-nosnippet": true } : {})}
    >
      <ArchivePageClient items={items} active={onArchive} />
    </div>
  );
}
