import fs from "node:fs";
import path from "node:path";

const genDir = path.join(process.cwd(), "app/dev/dialogue/_components/generated");
const sidebarOut = path.join(
  process.cwd(),
  "app/dev/dialogue/_components/DialogueSidebar.tsx",
);

const statIcons = `import type { ReactNode } from "react";

export function InterviewsStatIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ height: "16px", width: "16px", overflow: "clip" }}>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DurationStatIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ height: "16px", width: "16px", overflow: "clip" }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6v6l4 2" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InsightsStatIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ height: "16px", width: "16px", overflow: "clip" }}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 18h6" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 22h4" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
`;

fs.writeFileSync(
  path.join(process.cwd(), "app/dev/dialogue/_components/stat-card-icons.tsx"),
  statIcons,
);

const SIDEBAR_START =
  '<div className="h-[709px] flex [width:256px] left-0 absolute z-10 border-r border-r-solid border-r-[#E7E5E4] inset-y-0">';

function extractSidebarBalanced(src) {
  const start = src.indexOf(SIDEBAR_START);
  if (start < 0) throw new Error("sidebar start not found");
  let depth = 0;
  let i = start;
  const openRe = /<div\b(?![^>]*\/\s*>)[^>]*>/;
  while (i < src.length) {
    if (src[i] === "<") {
      const tail = src.slice(i);
      const open = tail.match(openRe);
      if (open && open.index === 0) {
        depth++;
        i += open[0].length;
        continue;
      }
      if (tail.startsWith("</div>")) {
        depth--;
        i += 6;
        if (depth === 0) return src.slice(start, i);
        continue;
      }
    }
    i++;
  }
  throw new Error("sidebar unbalanced");
}

const frame1 = fs.readFileSync(
  path.join(genDir, "Frame1DashboardWithChat.tsx"),
  "utf8",
);
const sidebarInner = extractSidebarBalanced(frame1);
fs.writeFileSync(
  sidebarOut,
  `export default function DialogueSidebar() {\n  return (\n    ${sidebarInner}\n  );\n}\n`,
);

const statCardsBlock = `                <div className="flex w-full gap-8">
                  <DialogueStatCard label="Interviews" value="15" icon={<InterviewsStatIcon />} />
                  <DialogueStatCard label="Avg. duration" value="19m50s" icon={<DurationStatIcon />} />
                  <DialogueStatCard label="Insights" value="-" icon={<InsightsStatIcon />} />
                </div>`;

const headerBadgeOld =
  /<div className="items-center flex shrink-0 w-fit justify-center py-0\.5 px-2 rounded-lg overflow-clip gap-1 bg-\[#DCFCE7\] border border-solid border-\[#00000000\]">\s*<div className="flex text-\[12px\][^<]*<\/div>\s*<\/div>/;

function patchDashboardFile(fileName) {
  let s = fs.readFileSync(path.join(genDir, fileName), "utf8");
  if (s.includes("import DialogueSidebar")) return;
  const sidebar = extractSidebarBalanced(s);
  s =
    `import DialogueSidebar from "../DialogueSidebar";\nimport DialogueStatCard from "../DialogueStatCard";\nimport DialogueBadge from "../DialogueBadge";\nimport { DurationStatIcon, InsightsStatIcon, InterviewsStatIcon } from "../stat-card-icons";\n` +
    s.replace(/^\/\* Paper frame.*?\n\n/, "");
  s = s.replace(sidebar, "<DialogueSidebar />");
  s = s.replace(
    /<div className="flex w-full gap-8">[\s\S]*?<\/div>\s*\n\s*<div className="w-full">\s*\n\s*<div className="flex flex-col w-full gap-2">\s*\n\s*<div className="items-center h-9 flex/,
    `${statCardsBlock}\n                <div className="w-full">\n                  <div className="flex flex-col w-full gap-2">\n                    <div className="items-center h-9 flex`,
  );
  s = s.replace(
    headerBadgeOld,
    `<DialogueBadge tone="success">In progress</DialogueBadge>`,
  );
  fs.writeFileSync(path.join(genDir, fileName), s);
}

patchDashboardFile("Frame1DashboardWithChat.tsx");
patchDashboardFile("Frame3DashboardFab.tsx");
console.log("patched shared components into dashboard frames");
