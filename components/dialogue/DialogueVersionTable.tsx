import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import {
  CHECKOUT_FUNNEL,
  CHECKOUT_QUESTION,
  SEGMENT_ADDRESS,
  SENTIMENT_LINE,
} from "@/lib/dialogue/product/sampleData";

/**
 * Round I recreation, made denser in round J: version one of the answer card.
 * No original asset for the first version survives in the repo, so the
 * markdown tables are recreated faithfully from the study's own numbers
 * (the checkout funnel with its step drops, the segment resets, and the
 * sentiment scores), in the plain black and white the first answers used.
 * Recreated figure, listed for Mudit in the round I and J reports.
 */
export default function DialogueVersionTable() {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame
        label="Version one, the table (recreated): where it works, every number is there in funnel order. Where it doesn't, nothing behind a row can be checked."
        tone="system"
      >
        <div className={`dialogue-version-table ${dialogueProductFontClassName}`}>
          <p className="dialogue-version-table__question">{CHECKOUT_QUESTION}</p>
          <p className="dialogue-version-table__title">Drop-off by step</p>
          <table className="dialogue-version-table__table">
            <thead>
              <tr>
                <th scope="col">Step</th>
                <th scope="col" className="dialogue-version-table__num">
                  Still in flow
                </th>
                <th scope="col" className="dialogue-version-table__num">
                  Drop
                </th>
              </tr>
            </thead>
            <tbody>
              {CHECKOUT_FUNNEL.steps.map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td className="dialogue-version-table__num">{s.pct}%</td>
                  <td className="dialogue-version-table__num">
                    {"drop" in s ? `-${s.drop}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dialogue-version-table__note">
            Address is the largest single drop. Delivery and payment lose fewer, and confirm
            keeps most of who is left.
          </p>
          <p className="dialogue-version-table__title">{SEGMENT_ADDRESS.title}</p>
          <table className="dialogue-version-table__table">
            <thead>
              <tr>
                <th scope="col">Segment</th>
                <th scope="col" className="dialogue-version-table__num">
                  Resets
                </th>
                <th scope="col" className="dialogue-version-table__num">
                  Behind mobile
                </th>
              </tr>
            </thead>
            <tbody>
              {SEGMENT_ADDRESS.rows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td className="dialogue-version-table__num">{r.pct}%</td>
                  <td className="dialogue-version-table__num">
                    {r.label === "Mobile" ? "-" : `-${SEGMENT_ADDRESS.rows[0].pct - r.pct} pts`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dialogue-version-table__title">Sentiment by version</p>
          <table className="dialogue-version-table__table">
            <thead>
              <tr>
                <th scope="col">Version</th>
                <th scope="col" className="dialogue-version-table__num">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {SENTIMENT_LINE.points.map((p, i) => (
                <tr key={p.label}>
                  <td>{["First", "Second", "Third"][i]}</td>
                  <td className="dialogue-version-table__num">{p.value.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dialogue-version-table__note">
            Sentiment climbs across the study. Autocomplete ships in the second version.
          </p>
        </div>
      </DialogueRachelFrame>
    </figure>
  );
}
