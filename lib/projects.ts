export interface ProjectData {
  slug: string;
  href?: string;
  title: string;
  category?: string;
  aspectRatio: string;
  imageBg?: string;
  colorBg?: string;
  /** string key maps to a JSX component rendered in page.tsx */
  colorContentKey?: "bruinlease-mockup" | "sviz-logo" | "phone-mockup";
  imageSrc?: string;
  imageAlt?: string;
  prefetch?: boolean;
  isExternal?: boolean;
}

export const projects: ProjectData[] = [
  {
    slug: "bruinlease",
    href: "/ucla-sublease",
    title: "BruinLease",
    category: "product design + frontend",
    aspectRatio: "4/5",
    imageBg: "#dde6ef",
    colorContentKey: "bruinlease-mockup",
    prefetch: true,
  },
  {
    slug: "sviz",
    title: "sviz",
    category: "youtube, personal",
    aspectRatio: "4/3",
    colorBg: "var(--color-lavender-card)",
    colorContentKey: "sviz-logo",
  },
  {
    slug: "asap-rocky",
    title: "asap rocky | rolling loud '25",
    aspectRatio: "4/5",
    imageBg: "#1a1a1a",
  },
  {
    slug: "geonworks",
    title: "geonworks f1-8x I built",
    aspectRatio: "4/3",
    imageBg: "#d8cfc4",
  },
  {
    slug: "2hollis",
    title: "2hollis | october '24",
    aspectRatio: "4/5",
    imageBg: "#2a2a2a",
  },
  {
    slug: "habit-tracker",
    title: "Dumb Habit Tracker",
    category: "product design + frontend",
    aspectRatio: "4/5",
    imageBg: "#f0f0f0",
    colorContentKey: "phone-mockup",
  },
  {
    slug: "jcole",
    title: "j.cole | october '23",
    aspectRatio: "4/3",
    imageBg: "#111",
  },
  {
    slug: "the-marias",
    title: "the marias | opening night oakland",
    aspectRatio: "4/5",
    imageBg: "#1f1b2e",
  },
  {
    slug: "gskt00",
    title: "gskt-00",
    aspectRatio: "4/3",
    imageBg: "#ede8e0",
  },
  {
    slug: "unikorn",
    title: "unikorn",
    aspectRatio: "4/3",
    imageBg: "#f5f0e8",
  },
];
