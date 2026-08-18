import { redirect } from "next/navigation";
import PS3PreviewClient from "./PS3PreviewClient";

// Standalone, no-chrome view of just the PS3Silk pattern — no nav/hero/grid,
// so a real OS-level screenshot only ever captures the pattern itself at
// full native resolution. Exists because the pattern's parent section on the
// real homepage is only ~280px tall regardless of viewport size, and every
// automated capture path available in this session topped out well short of
// "high quality." Open this in a real browser window sized however you like
// and screenshot it directly. Dev-only, matching the rest of /dev.
export default function PS3PreviewPage() {
  if (process.env.NODE_ENV !== "development") redirect("/");

  return <PS3PreviewClient />;
}
