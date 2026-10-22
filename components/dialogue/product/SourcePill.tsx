import { annotateSlug } from "@/components/dialogue/annotate";

type Props = {
  name: string;
  time: string;
  selected?: boolean;
  disagree?: boolean;
};

/** Name and time are separate spans: name 500, time 400 muted tabular, 6px gap, no separator. */
export default function SourcePill({ name, time, selected, disagree }: Props) {
  return (
    <span
      data-annotate-part={`source-pill-${annotateSlug(name)}`}
      className={[
        "dp-source-pill",
        selected ? "dp-source-pill--selected" : "",
        disagree ? "dp-source-pill--disagree" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="dp-source-pill__name">{name}</span>
      <span className="dp-source-pill__time">{time}</span>
    </span>
  );
}
