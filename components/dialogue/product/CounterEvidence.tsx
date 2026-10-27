import { ChevronUpIcon, MessageSquareIcon } from "@/components/dialogue/product/icons";
import { annotateSlug } from "@/components/dialogue/annotate";

/** f6a5192 counter-evidence expander: who disagreed and what they said. */
const AVATARS = ["clip-01", "clip-02", "clip-05"] as const;

const ROWS = [
  { name: "Elena R.", time: "08:12", quote: "I wasn't sure the discount…", photo: "clip-01" },
  { name: "Avery C.", time: "25:02", quote: "I wanted one more look…", photo: "clip-02" },
  { name: "Sam T.", time: "18:22", quote: "Delivery dates looked like…", photo: "clip-05" },
] as const;

const photo = (id: string) => `/dev/dialogue-static/clip-photos/${id}.jpg`;

export default function CounterEvidence() {
  return (
    <div className="dp-counter" aria-hidden data-annotate-part="counter-evidence">
      <p className="dp-counter__label" data-annotate-part="counter-label">
        <MessageSquareIcon className="dp-counter__label-icon" />
        Counter-evidence
      </p>
      <div className="dp-counter__head" data-annotate-part="counter-head">
        <span className="dp-counter__avatars" data-annotate-part="counter-avatars">
          {AVATARS.map((id) => (
            <span key={id} className="dp-counter__avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo(id)} alt="" className="dp-counter__img" loading="eager" decoding="sync" />
            </span>
          ))}
        </span>
        <span className="dp-counter__summary" data-annotate-part="counter-summary">3 had no trouble with address</span>
        <ChevronUpIcon className="dp-counter__chevron" />
      </div>
      <ul className="dp-counter__rows" data-annotate-part="counter-rows">
        {ROWS.map((row) => (
          <li key={row.name} className="dp-counter__row" data-annotate-part={`counter-row-${annotateSlug(row.name)}`}>
            <span className="dp-counter__thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo(row.photo)} alt="" className="dp-counter__img" loading="eager" decoding="sync" />
            </span>
            <span className="dp-counter__body">
              <span className="dp-counter__who">
                <span className="dp-counter__name">{row.name}</span>
                <span className="dp-counter__time">{row.time}</span>
              </span>
              <span className="dp-counter__quote">{row.quote}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
