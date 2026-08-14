"use client";

import { memo, useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
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
 * The heavy gallery tree must not re-render on Work/About clicks. `visible`
 * is the only prop that matters; a memoized inner skips About ↔ Work. The
 * gallery itself is not mounted until Archive is actually shown.
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
  const [hasShown, setHasShown] = useState(visible);
  if (visible && !hasShown) setHasShown(true);

  useLayoutEffect(() => {
    if (pathname === "/archive") clearArchiveShow();
  }, [pathname]);

  useEffect(() => {
    if (!pending || pathname === "/archive") return;
    const t = window.setTimeout(() => {
      if (window.location.pathname !== "/archive") clearArchiveShow();
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
      {hasShown ? <ArchiveKeepAlive items={items} visible={visible} /> : null}
    </div>
  );
}

const ArchiveKeepAlive = memo(function ArchiveKeepAlive({
  items,
  visible,
}: {
  items: PlaygroundGalleryItem[];
  visible: boolean;
}) {
  return <ArchivePageClient items={items} visible={visible} />;
});
