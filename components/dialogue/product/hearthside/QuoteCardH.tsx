import { WaveformIcon } from "@/components/dialogue/product/icons";
import type { HearthsideQuote } from "@/lib/dialogue/product/hearthside";

/** The real Dialogue quote card: waveform icon, one line "Name, range", the
    quote under it. Mirrors the restored ClipQuotes markup. */
export default function QuoteCardH({
  quote,
  selected = false,
  part,
}: {
  quote: HearthsideQuote;
  selected?: boolean;
  part?: string;
}) {
  return (
    <div
      className={["dp-clip-quote", selected ? "dp-clip-quote--selected" : ""].filter(Boolean).join(" ")}
      data-annotate-part={part ?? "quote-card"}
    >
      <p className="dp-clip-quote__who">
        <WaveformIcon className="dp-clip-quote__icon" />
        <span className="dp-clip-quote__name">{quote.name}</span>
        <span className="dp-clip-quote__time">{quote.range}</span>
      </p>
      <p className="dp-clip-quote__text">{quote.text}</p>
    </div>
  );
}
