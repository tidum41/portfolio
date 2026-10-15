import { redirect } from "next/navigation";
import ThemeTransitionLabClient from "./ThemeTransitionLabClient";

/**
 * Compare prototype light/dark theme transitions (Bayer dither vs halftone).
 * Local dev + Vercel Preview only.
 *
 * ?transition=dither|halftone also enables transitions site-wide until cleared.
 */
export default function ThemeTransitionLabPage() {
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  return <ThemeTransitionLabClient />;
}
