import type { Metadata } from "next";
import { redirect } from "next/navigation";
import NavMorphClient from "./NavMorphClient";

export const metadata: Metadata = {
  title: "Nav morph",
};

/** Dev-only lab. The live nav uses the outline morph; this page still shows the old melt beside it. */
export default function NavMorphPage() {
  if (process.env.NODE_ENV !== "development") redirect("/");
  return <NavMorphClient />;
}
