import Link from "next/link";
import { redirect } from "next/navigation";

const FRAMES = [
  {
    href: "/dev/dialogue/1",
    title: "Frame 1",
    desc: "Study dashboard — insights summary with Study chat open (1512×709)",
  },
  {
    href: "/dev/dialogue/2",
    title: "Frame 2",
    desc: "Study chat transcript — key themes response (474×6005)",
  },
  {
    href: "/dev/dialogue/3",
    title: "Frame 3",
    desc: "Study dashboard — insights summary with chat FAB (1512×709)",
  },
  {
    href: "/dev/dialogue/4",
    title: "Frame 4",
    desc: "Study chat panel — participant locations (582×1303)",
  },
] as const;

export default function DialogueIndexPage() {
  const allow =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";
  if (!allow) redirect("/");

  return (
    <main className="mx-auto max-w-xl p-8 font-sans text-[#1C1917]">
      <h1 className="mb-2 text-xl font-medium">Dialogue AI — Paper frames</h1>
      <p className="mb-6 text-sm text-[#57534D]">
        Static recreations for the case study. Not linked from site navigation.
      </p>
      <ul className="flex flex-col gap-3">
        {FRAMES.map((f) => (
          <li key={f.href}>
            <Link
              href={f.href}
              className="block rounded-lg border border-[#E7E5E4] bg-[#FCFBF9] px-4 py-3 hover:bg-[#F1EEEA]"
            >
              <span className="font-medium">{f.title}</span>
              <span className="mt-1 block text-sm text-[#57534D]">{f.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
