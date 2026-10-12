import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import CardLabClient from "./CardLabClient";

export const metadata: Metadata = {
  title: "Card lab",
  robots: { index: false, follow: false },
};

/**
 * Side-by-side project-card iterations. Quiet canvas, no site chrome.
 * Local next dev + Vercel Preview only.
 */
export default function CardLabPage() {
  // Available locally and on Vercel Preview. Blocked on Vercel Production
  // (VERCEL_ENV === "production"). Unset VERCEL_ENV (local next start) is allowed.
  if (process.env.VERCEL_ENV === "production") redirect("/");

  return (
    <Suspense fallback={null}>
      <CardLabClient />
    </Suspense>
  );
}
