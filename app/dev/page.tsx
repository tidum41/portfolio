import { redirect } from "next/navigation";
import { getCaseStudy, getDesignSystem } from "@/lib/sanity/queries";
import DevEditor from "./Editor";

export default async function DevPage() {
  if (process.env.NODE_ENV !== "development") redirect("/");

  const [cs, ds] = await Promise.all([
    getCaseStudy("ucla-sublease"),
    getDesignSystem(),
  ]);

  return <DevEditor initialData={cs} initialDs={ds} />;
}
