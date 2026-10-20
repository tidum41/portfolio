/**
 * Static recreation of the Dialogue study-page research assistant (collapsed state).
 * Sized in “native” CSS px; parent applies PLACEMENT_UI_SCALE.
 */
export function DialogueAssistantPanel({ docked }: { docked: boolean }) {
  const width = docked ? 300 : 340;
  return (
    <div
      style={{
        width,
        background: "#FFFFFF",
        borderRadius: 14,
        border: "1px solid #E8E4DF",
        boxShadow: "none",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: "#1C1917",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <header style={{ padding: "18px 20px 14px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Research assistant
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "#78716C" }}>
          Checkout usability, 24 interviews
        </div>
      </header>

      <div style={{ padding: "0 16px 16px" }}>
        <div
          style={{
            background: "#F5F0E8",
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 13,
            lineHeight: 1.45,
            color: "#44403C",
            marginBottom: 12,
          }}
        >
          Where did people drop off in checkout?
        </div>

        <div
          style={{
            border: "1px solid #E7E2DC",
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 12,
            color: "#57534E",
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Searched 24 interviews, found 9 relevant moments</span>
          <span style={{ color: "#A8A29E", fontSize: 10 }}>▼</span>
        </div>

        <div
          style={{
            border: "1px solid #E7E2DC",
            borderRadius: 12,
            padding: "14px 14px 12px",
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.45 }}>
            Shipping address{" "}
            <strong style={{ fontWeight: 600 }}>loses 38% of participants</strong>, the largest
            single-step drop in checkout.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <BarRow label="Cart" value={100} highlight={false} />
            <BarRow label="Address" value={62} highlight />
          </div>
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid #EDE9E4",
              fontSize: 11,
              color: "#78716C",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Based on 24 of 24 interviews</span>
            <span style={{ fontSize: 14, color: "#A8A29E" }}>⤢</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
      <span style={{ width: 52, color: "#57534E" }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          background: "#E7E2DC",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 4,
            background: highlight ? "#D9468F" : "#C4BEB6",
          }}
        />
      </div>
      <span style={{ width: 36, textAlign: "right", color: "#57534E", fontSize: 11 }}>
        {value}%
      </span>
    </div>
  );
}

export function DialogueAssistantFab() {
  return (
    <div
      aria-hidden
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        background: "#D9468F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "none",
        flexShrink: 0,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 9.5a4.5 4.5 0 0 1 9 0v.5H7V9.5Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6 10h12v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="14" r="0.75" fill="white" />
        <circle cx="14" cy="14" r="0.75" fill="white" />
      </svg>
    </div>
  );
}
