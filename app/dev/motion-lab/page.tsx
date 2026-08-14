import { redirect } from "next/navigation";
import MotionLabClient from "./MotionLabClient";

/**
 * Lo-fi DialKit playground for page-enter motion.
 * Local `next dev` and Vercel Preview only — blocked on production muditm.com.
 *
 * Local:   npm run dev → http://localhost:3000/dev/motion-lab
 * Preview: /dev/motion-lab on this branch’s Vercel URL
 */
export default function MotionLabPage() {
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  return <MotionLabClient />;
}
