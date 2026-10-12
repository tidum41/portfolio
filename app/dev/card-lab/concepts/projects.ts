/**
 * Mudit's real work — mirrors homepage grid + case-study copy in the repo.
 * Card-lab concepts must pull titles/roles/years/metrics from here only.
 */

export type WireframeKind =
  | "listings"
  | "tasks"
  | "video"
  | "player"
  | "habits";

export type ProjectMetric = {
  value: string;
  /** Short display line; only use values stated in case-study copy. */
  line: string;
};

export type MuditProject = {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  year: string;
  status: string;
  domain: string;
  taxonomyRest: string;
  taxonomyHover: string;
  brand: string;
  brandInk: string;
  wireframe: WireframeKind;
  metrics: ProjectMetric[];
  pills: string[];
  liveLabel: string;
};

export const MUDIT_PROJECTS: readonly MuditProject[] = [
  {
    id: "bruinlease",
    title: "Simplifying UCLA subleasing",
    subtitle: "product design + frontend",
    role: "Product Designer & Frontend",
    year: "2026",
    status: "Shipped 2026",
    domain: "Product",
    taxonomyRest: "Product / Case study",
    taxonomyHover: "Product / Case study / UCLA subleasing",
    brand: "#3D6B8C",
    brandInk: "#E8F2F8",
    wireframe: "listings",
    metrics: [
      { value: "83%", line: "83% valued trust" },
      { value: "75%", line: "75% found stress" },
    ],
    pills: ["Product designer", "Frontend", "Case study"],
    liveLabel: "Live site",
  },
  {
    id: "todolist",
    title: "Todolist with AI organization",
    subtitle: "product design + full stack",
    role: "Product design + full stack",
    year: "2026",
    status: "In progress",
    domain: "Product",
    taxonomyRest: "Product / Full stack",
    taxonomyHover: "Product / Full stack / AI organization",
    brand: "#2F4A3C",
    brandInk: "#E6F0EA",
    wireframe: "tasks",
    metrics: [
      { value: "XX%", line: "XX% faster reorders" },
      { value: "XX", line: "XX tasks auto-sorted" },
    ],
    pills: ["Design lead", "Full stack", "AI"],
    liveLabel: "Live demo",
  },
  {
    id: "sviz",
    title: "Making custom keyboards accessible",
    subtitle: "Personal YouTube, 1M+ views",
    role: "Self-ran",
    year: "2021",
    status: "Shipped 2021",
    domain: "YouTube",
    taxonomyRest: "YouTube / Content",
    taxonomyHover: "YouTube / Content / Custom keyboards",
    brand: "#1A1A1A",
    brandInk: "#F2F2F2",
    wireframe: "video",
    metrics: [
      { value: "1M+", line: "1M+ total views" },
      { value: "500K+", line: "500K+ on first upload" },
    ],
    pills: ["Self-ran", "YouTube", "2021"],
    liveLabel: "Watch",
  },
  {
    id: "cd-player",
    title: "Drag a CD",
    subtitle: "exploration",
    role: "Exploration",
    year: "2026",
    status: "Playground",
    domain: "Exploration",
    taxonomyRest: "Exploration / Interaction",
    taxonomyHover: "Exploration / Interaction / Drag a CD",
    brand: "#4A3F5C",
    brandInk: "#F0EAF5",
    wireframe: "player",
    metrics: [
      { value: "XX%", line: "XX% completed a drag" },
    ],
    pills: ["Exploration", "Interaction"],
    liveLabel: "Open",
  },
  {
    id: "habit",
    title: "Dumb Habit Tracker",
    subtitle: "product design + frontend",
    role: "Product design + frontend",
    year: "2026",
    status: "Playground",
    domain: "Product",
    taxonomyRest: "Product / Frontend",
    taxonomyHover: "Product / Frontend / Habit tracker",
    brand: "#5C4A32",
    brandInk: "#F5EFE6",
    wireframe: "habits",
    metrics: [
      { value: "XX%", line: "XX% day streak kept" },
    ],
    pills: ["Product", "Frontend", "Mobile"],
    liveLabel: "Open",
  },
] as const;

export const PROJECT_TITLES = MUDIT_PROJECTS.map((p) => p.title);

export function projectById(id: string): MuditProject {
  const p = MUDIT_PROJECTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown project id: ${id}`);
  return p;
}
