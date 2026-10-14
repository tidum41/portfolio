import { redirect } from "next/navigation";
import RemotionPlaygroundClient from "./RemotionPlaygroundClient";

/**
 * JOOLA B2B Remotion film — live tweak playground for designers.
 * Preview deployments only (same gate as /dev/motion-lab).
 */
export default function RemotionPlaygroundPage() {
  const allow =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";

  if (!allow) redirect("/");

  return <RemotionPlaygroundClient />;
}
