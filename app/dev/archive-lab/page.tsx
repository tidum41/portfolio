import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ArchiveLabClient from "./ArchiveLabClient";

export const metadata: Metadata = {
  title: "Archive lab",
  robots: { index: false, follow: false },
};

/**
 * Archive direction lab with a real DialKit root on the page.
 * Local `next dev` and Vercel Preview only. Not linked from nav.
 *
 * Local: npm run dev → http://localhost:3000/dev/archive-lab
 */
export default function ArchiveLabPage() {
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  return <ArchiveLabClient />;
}
