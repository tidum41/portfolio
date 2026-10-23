import { CLIPS } from "@/lib/dialogue/product/sampleData";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import { annotateSlug } from "@/components/dialogue/annotate";

const ROWS = CLIPS.slice(0, 2);

/** Hero aside: the quotes behind the chart, each with who said it and where. */
export default function ClipQuotes() {
  return (
    <div className="dp-clip-quotes" data-annotate-part="clip-quotes">
      {ROWS.map((clip) => (
        <div
          key={clip.id}
          className={["dp-clip-quote", clip.participant === "Priya K." ? "dp-clip-quote--selected" : ""]
            .filter(Boolean)
            .join(" ")}
          data-annotate-part={`clip-quote-${annotateSlug(clip.participant)}`}
        >
          <p className="dp-clip-quote__who">
            <WaveformIcon className="dp-clip-quote__icon" />
            <span className="dp-clip-quote__name">{clip.participant}</span>
            <span className="dp-clip-quote__time">{clip.segment}</span>
          </p>
          <p className="dp-clip-quote__text">{clip.transcript}</p>
        </div>
      ))}
    </div>
  );
}
