import { annotateSlug } from "@/components/dialogue/annotate";

export type TextChartRow = { label: string; value: number; display: string };

type Props = {
  title: string;
  rows: TextChartRow[];
  /** Column headings for the markdown table that follows the block. */
  columns: [string, string];
  /** Bars scale from 0 to max (default 100). */
  max?: number;
  className?: string;
};

const BAR_CHARS = 12;

/**
 * Dialogue's own chart output in chat: a stone-900 block of DM Mono text with
 * block-character bars, followed by a markdown table. Used in product figures
 * instead of a designed chart.
 */
export default function TextChart({ title, rows, columns, max = 100, className }: Props) {
  const labelWidth = Math.max(...rows.map((r) => r.label.length));
  const valueWidth = Math.max(...rows.map((r) => r.display.length));
  const lines = rows.map((r) => {
    const n = Math.max(1, Math.round((r.value / max) * BAR_CHARS));
    return `${r.label.padEnd(labelWidth)} ${"█".repeat(n).padEnd(BAR_CHARS)} ${r.display.padStart(valueWidth)}`;
  });

  return (
    <div className={["dp-textchart", className].filter(Boolean).join(" ")} data-annotate-part="text-chart">
      <p className="dp-textchart__title" data-annotate-part="text-chart-title">{title}</p>
      <pre className="dp-textchart__block" data-annotate-part="text-chart-block">{lines.join("\n")}</pre>
      <table className="dp-textchart__table" data-annotate-part="text-chart-table">
        <thead>
          <tr>
            <th scope="col">{columns[0]}</th>
            <th scope="col">{columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} data-annotate-part={`text-chart-row-${annotateSlug(r.label)}`}>
              <td>{r.label}</td>
              <td>{r.display}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
