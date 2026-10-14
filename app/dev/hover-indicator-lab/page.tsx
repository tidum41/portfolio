import { redirect } from "next/navigation";
import { getProjects } from "@/lib/sanity/queries";
import HoverIndicatorLabClient from "./HoverIndicatorLabClient";
import { pickLabProjects } from "./pickLabProjects";

/**
 * Dev / preview lab for project-card hover indicators.
 *
 * Local:   npm run dev → http://localhost:3000/dev/hover-indicator-lab
 * Preview: same path on a Vercel preview deployment
 */
export default async function HoverIndicatorLabPage() {
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  const all = await getProjects();
  const projects = pickLabProjects(all);

  if (projects.length === 0) {
    return (
      <div style={{ padding: 48, fontFamily: "var(--font-sans)" }}>
        No featured projects with thumbnails — check Sanity data.
      </div>
    );
  }

  return <HoverIndicatorLabClient projects={projects} />;
}
