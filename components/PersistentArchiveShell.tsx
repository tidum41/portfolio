"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import ArchivePageClient from "@/app/archive/ArchivePageClient";
import {
  peekArchiveGallery,
  rememberArchiveGallery,
  warmArchiveGallery,
} from "@/lib/archiveGalleryCache";
import {
  clearArchiveShow,
  peekArchiveShow,
  subscribeArchiveShow,
} from "@/lib/instantNav";
import type { PlaygroundGalleryItem } from "@/lib/sanity/queries";

/**
 * Archive keep-alive — same hide contract as PersistentWorkShell (`display: none`).
 *
 * `markArchiveShow()` paints this shell on the nav click, before Next.js
 * commits `/archive`. LQIP posters render immediately; the interactive
 * bento takes over once it has a real measure.
 */
export default function PersistentArchiveShell({
  items: serverItems,
}: {
  items: PlaygroundGalleryItem[];
}) {
  const pathname = usePathname();
  const pending = useSyncExternalStore(
    subscribeArchiveShow,
    peekArchiveShow,
    () => false,
  );
  const visible = pathname === "/archive" || pending;

  if (serverItems.length) rememberArchiveGallery(serverItems);

  const [items, setItems] = useState<PlaygroundGalleryItem[]>(
    () => peekArchiveGallery() ?? serverItems,
  );

  useEffect(() => {
    if (!pending || pathname === "/archive") return;
    const t = window.setTimeout(() => {
      if (window.location.pathname !== "/archive") {
        clearArchiveShow();
      }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [pending, pathname]);

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
