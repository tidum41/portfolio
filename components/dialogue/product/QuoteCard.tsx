import { WaveformIcon } from "@/components/dialogue/product/icons";
import { annotateSlug } from "@/components/dialogue/annotate";

/** The real grey quote card (round O): a stone well card whose header is the
    waveform icon and one muted line, "Name, mm:ss", with the quote under it.
    Used by the hero, the problem answer, the compare, and Counts. */
export default function QuoteCard({
  name,
  time,
  text,
}: {
  name: string;
  time: string;
  text: string;
}) {
  return (
    <div className="dp-clip-quote" data-annotate-part={`quote-card-${annotateSlug(name)}`}>
      <p className="dp-clip-quote__who">
        <WaveformIcon className="dp-clip-quote__icon" />
        <span className="dp-quote-card__line">
          {name}, {time}
        </span>
      </p>
      <p className="dp-clip-quote__text">{text}</p>
    </div>
  );
}
