import { useEffect, useState } from "react";
import { useSonner } from "sonner";

/**
 * Explicit polite live region mirroring the latest Sonner toast title so
 * announcements do not depend on Sonner's internal markup alone.
 */
export function ToastLiveRegion() {
  const { toasts } = useSonner();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const latest = toasts[0];
    if (!latest) return;
    const title =
      typeof latest.title === "string"
        ? latest.title
        : typeof latest.title === "number"
          ? String(latest.title)
          : "";
    const description =
      typeof latest.description === "string" ? latest.description : "";
    const next = [title, description].filter(Boolean).join(". ");
    if (next) setAnnouncement(next);
  }, [toasts]);

  return (
    <div
      className="visually-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </div>
  );
}

export default ToastLiveRegion;
