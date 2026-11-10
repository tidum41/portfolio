import { redirect } from "next/navigation";
import RemotionPlaygroundGate from "./RemotionPlaygroundGate";

/**
 * DialKit + @remotion/player lab for the JOOLA B2B film.
 * Local `next dev` and Vercel preview only — same gate as DialKit
 * (NEXT_PUBLIC_DIALKIT / VERCEL_ENV). Production redirects home and the
 * player chunk is dead-code-eliminated.
 *
 * Local:   npm run dev → http://localhost:3000/dev/remotion-playground
 * Preview: /dev/remotion-playground on this branch’s Vercel URL
 */
export default function RemotionPlaygroundPage() {
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");
  if (process.env.NEXT_PUBLIC_DIALKIT !== "1") redirect("/");

  return <RemotionPlaygroundGate />;
}
