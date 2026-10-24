import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { CHECKOUT_FUNNEL, CHECKOUT_QUESTION, SEGMENT_ADDRESS } from "@/lib/dialogue/product/sampleData";

/**
 * Round I recreation: version one of the answer card. No original asset for
 * the first version survives in the repo, so the markdown table is recreated
 * faithfully from the study's own numbers (the checkout funnel and the
 * segment resets), in the plain black and white the first answers used.
 * Recreated figure, listed for Mudit in the round I report.
 */
export default function DialogueVersionTable() {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame
        label="Version one, the table: where it works, every number is there in funnel order. Where it doesn't, nothing behind a row can be checked."
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
              </tr>
            </thead>
            <tbody>
              {CHECKOUT_FUNNEL.steps.map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td className="dialogue-version-table__num">{s.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dialogue-version-table__title">{SEGMENT_ADDRESS.title}</p>
          <table className="dialogue-version-table__table">
            <thead>
              <tr>
                <th scope="col">Segment</th>
                <th scope="col" className="dialogue-version-table__num">
                  Resets
                </th>
              </tr>
            </thead>
            <tbody>
              {SEGMENT_ADDRESS.rows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td className="dialogue-version-table__num">{r.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogueRachelFrame>
    </figure>
  );
}
