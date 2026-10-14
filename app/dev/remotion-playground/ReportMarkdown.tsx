"use client";

import Link from "next/link";
import { TECHNIQUE_PARAM_LINKS } from "./playground-meta";

function linkifyTechniques(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  const keys = Object.keys(TECHNIQUE_PARAM_LINKS).sort((a, b) => b.length - a.length);
  while (remaining.length > 0) {
    let found: { key: string; idx: number } | null = null;
    for (const key of keys) {
      const idx = remaining.toLowerCase().indexOf(key.toLowerCase());
      if (idx >= 0 && (!found || idx < found.idx)) found = { key, idx };
    }
    if (!found) {
      parts.push(remaining);
      break;
    }
    const { key, idx } = found;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    const anchor = TECHNIQUE_PARAM_LINKS[key];
    parts.push(
      <Link key={`${idx}-${key}`} href={`#${anchor}`} className="text-blue-700 underline underline-offset-2">
        {remaining.slice(idx, idx + key.length)}
      </Link>,
    );
    remaining = remaining.slice(idx + key.length);
  }
  return parts;
}

export function ReportMarkdown({ source }: { source: string }) {
  const lines = source.split("\n");
  return (
    <article className="prose prose-sm max-w-none text-neutral-800">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-semibold mt-6 mb-3">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-5 mb-2">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-4 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("|")) {
          return (
            <p key={i} className="font-mono text-xs overflow-x-auto whitespace-pre my-1 text-neutral-600">
              {line}
            </p>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
              {linkifyTechniques(line.slice(2))}
            </li>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          const body = line.replace(/^\d+\.\s/, "");
          return (
            <p key={i} className="text-sm leading-relaxed my-2">
              <span className="font-medium text-neutral-500">{line.match(/^\d+/)?.[0]}.</span>{" "}
              {linkifyTechniques(body)}
            </p>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm leading-relaxed my-1">{linkifyTechniques(line)}</p>;
      })}
    </article>
  );
}
