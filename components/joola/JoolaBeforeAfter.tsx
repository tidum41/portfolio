/**
 * Static before/after flow figure in the site font (not FK Grotesk).
 * Placeholder-quality code figure Mudit can replace with a Paper board.
 */
export default function JoolaBeforeAfter({ caption }: { caption?: string }) {
  return (
    <figure className="joola-figure">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 16,
          alignItems: "stretch",
          padding: "20px 16px",
          borderRadius: 8,
          border: "1px solid var(--color-border-subtle)",
          background: "var(--color-bg-secondary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <FlowCol
          label="Before"
          steps={[
            "Buyer emails a spreadsheet or product list",
            "Rep keys the order into NetSuite",
            "Stock and payment questions stay in the inbox",
          ]}
        />
        <div
          aria-hidden
          style={{
            alignSelf: "center",
            color: "var(--color-text-muted)",
            fontSize: 20,
            paddingTop: 18,
          }}
        >
          →
        </div>
        <FlowCol
          label="In the portal"
          steps={[
            "Buyer builds the order in Quick Order",
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
      <p
        style={{
          margin: "0 0 12px",
          fontSize: "var(--fs-meta, 12px)",
          color: "var(--color-text-tertiary)",
        }}
      >
        {label}
      </p>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
        {steps.map((step, i) => (
          <li
            key={step}
            style={{
              display: "grid",
              gridTemplateColumns: "22px 1fr",
              gap: 10,
              alignItems: "start",
              fontSize: "var(--fs-sm, 14px)",
              lineHeight: 1.45,
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "var(--color-accent-subtle)",
                color: "var(--color-text-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
