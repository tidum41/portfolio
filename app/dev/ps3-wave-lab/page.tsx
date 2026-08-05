import { redirect } from "next/navigation";
import PS3WaveLabClient from "./PS3WaveLabClient";

/**
 * DialKit playground for cursor-scale experiments on the PS3 silk wave.
 * Available in local `next dev` and on Vercel Preview — blocked on production
 * muditm.com so the live hero stays untouched.
 *
 * Local:  npm run dev → http://localhost:3000/dev/ps3-wave-lab
 * Preview: /dev/ps3-wave-lab on this branch’s Vercel URL
 */
export default function PS3WaveLabPage() {
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  return <PS3WaveLabClient />;
}
