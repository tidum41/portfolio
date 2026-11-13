import type { ReactNode } from "react";
import "./joola-case-study.css";

/**
 * Static before/after flow figure in the site font (not FK Grotesk).
 */
export default function JoolaBeforeAfter({
  caption,
}: {
  caption?: string | ReactNode;
}) {
  return (
    <figure className="joola-figure joola-before-after" data-joola-figure="solution-before-after">
      <div className="joola-before-after__panel">
        <FlowCol
          label="Before"
          steps={[
            "Buyer emails a spreadsheet or product list",
            "Rep keys the order into NetSuite",
            "Stock and payment questions stay in the inbox",
          ]}
        />
        <div className="joola-before-after__arrow" aria-hidden>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </div>
        <FlowCol
          label="In the portal"
          steps={[
            "Buyer builds the order in Quick order",
            "Net 30 and credit show at checkout",
            "A rep steps in when credit or stock needs one",
          ]}
        />
      </div>
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
    </figure>
  );
}

function FlowCol({ label, steps }: { label: string; steps: string[] }) {
  return (
    <div>
      <p className="joola-before-after__col-label">{label}</p>
      <ol className="joola-before-after__list">
        {steps.map((step, i) => (
          <li key={step} className="joola-before-after__step">
            <span className="joola-before-after__num" data-step-num={i + 1}>
              {i + 1}
            </span>
            <span className="joola-before-after__text">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
