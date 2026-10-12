/** Low-cost CSS/SVG product UI placeholder — no network media. */

export default function UiPreview({
  className,
  tone = "warm",
}: {
  className?: string;
  tone?: "warm" | "cool" | "ink";
}) {
  return (
    <div
      className={`card-lab__ui-preview card-lab__ui-preview--${tone}${className ? ` ${className}` : ""}`}
      data-cl-ui-preview
      aria-hidden="true"
    >
      <div className="card-lab__ui-preview-bar" />
      <div className="card-lab__ui-preview-body">
        <div className="card-lab__ui-preview-col">
          <span className="card-lab__ui-preview-line" />
          <span className="card-lab__ui-preview-line card-lab__ui-preview-line--short" />
          <span className="card-lab__ui-preview-btn" />
        </div>
        <div className="card-lab__ui-preview-panel" />
      </div>
    </div>
  );
}
