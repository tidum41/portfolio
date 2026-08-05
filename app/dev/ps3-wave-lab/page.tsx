import { redirect } from "next/navigation";
import PS3WaveLabClient from "./PS3WaveLabClient";

/**
 * DialKit playground for a more playable PS3/XMB-inspired hero wave.
 * Dev-only — does not change the production PS3Silk on "/".
 *
 * Local: npm run dev → http://localhost:3000/dev/ps3-wave-lab
 */
export default function PS3WaveLabPage() {
  if (process.env.NODE_ENV !== "development") redirect("/");
  return <PS3WaveLabClient />;
}
