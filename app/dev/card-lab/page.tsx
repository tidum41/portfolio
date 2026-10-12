import { redirect } from "next/navigation";
import { getProjects } from "@/lib/sanity/queries";
import CardLabClient from "./CardLabClient";

/**
 * Side-by-side lab for three project-card directions.
 * Local `next dev` and Vercel Preview only — blocked on production muditm.com.
 *
 * Local:   npm run dev → http://localhost:3000/dev/card-lab
 * Preview: /dev/card-lab on this branch’s Vercel URL
 */
export default async function CardLabPage() {
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  const projects = await getProjects().catch(() => []);

  return <CardLabClient projects={projects} />;
}
