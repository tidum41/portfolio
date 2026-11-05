import type { CSSProperties } from "react";

const rootStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  containerType: "inline-size",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  background: "#F6F5F2",
  fontFamily: "var(--font-sans)",
};

const previewStyle: CSSProperties = {
  position: "absolute",
  top: "5px",
  right: "5px",
  zIndex: 2,
  padding: "4px 8px",
  borderRadius: "8px",
  background: "var(--color-badge-bg, #fff)",
  border: "1px solid rgba(0,0,0,.08)",
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  color: "var(--color-text-card-sub, #555)",
  boxSizing: "border-box",
};

const panelStyle: CSSProperties = {
  width: "74cqw",
  boxSizing: "border-box",
  padding: "4.6cqw 5cqw 5cqw",
  background: "#FCFBF9",
  border: "1px solid rgba(0,0,0,.06)",
  borderRadius: "2.4cqw",
  boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.08)",
  fontFamily: "var(--font-sans)",
  color: "#1f1d1b",
};

const headlineStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: "3.05cqw",
  lineHeight: 1.38,
  letterSpacing: "-0.01em",
  color: "#1f1d1b",
};

const barStyle: CSSProperties = {
  display: "flex",
  gap: "0.35cqw",
  height: "3.15cqw",
  marginTop: "2.9cqw",
};

const barPrimaryStyle: CSSProperties = {
  flex: "0 0 calc(75% - 0.175cqw)",
  background: "#A8497A",
  borderRadius: "0.6cqw",
};

const barSecondaryStyle: CSSProperties = {
  flex: "1 1 auto",
  background: "#7A716B",
  borderRadius: "0.6cqw",
};

const legendStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3cqw",
  marginTop: "2.3cqw",
};

const legendSideStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.95cqw",
  minWidth: 0,
};

const legendDotPrimaryStyle: CSSProperties = {
  flex: "0 0 auto",
  width: "1.35cqw",
  height: "1.35cqw",
  borderRadius: "0.28cqw",
  background: "#A8497A",
};

const legendDotSecondaryStyle: CSSProperties = {
  flex: "0 0 auto",
  width: "1.35cqw",
  height: "1.35cqw",
  borderRadius: "0.28cqw",
  background: "#7A716B",
};

const legendLabelStyle: CSSProperties = {
  fontSize: "2.5cqw",
  lineHeight: 1.25,
  fontWeight: 400,
  color: "#1f1d1b",
  whiteSpace: "nowrap",
};

const legendCountStyle: CSSProperties = {
  fontSize: "2.5cqw",
  lineHeight: 1.25,
  fontWeight: 400,
  color: "#1f1d1b",
};

const legendMutedStyle: CSSProperties = {
  fontSize: "2.15cqw",
  lineHeight: 1.25,
  fontWeight: 400,
  color: "#6b6560",
  whiteSpace: "nowrap",
};

const chipsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.35cqw",
  marginTop: "3.1cqw",
};

const chipBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  boxSizing: "border-box",
  padding: "1.45cqw 2cqw",
  borderRadius: "8px",
  border: "1px solid rgba(0,0,0,.1)",
  background: "#FCFBF9",
  fontSize: "2.35cqw",
  lineHeight: 1,
  fontWeight: 400,
  color: "#1f1d1b",
  whiteSpace: "nowrap",
};

const chipSelectedStyle: CSSProperties = {
  ...chipBaseStyle,
  background: "#EFEEEA",
};

const chipMutedStyle: CSSProperties = {
  ...chipBaseStyle,
  color: "#6b6560",
};

const quoteStyle: CSSProperties = {
  boxSizing: "border-box",
  marginTop: "2.3cqw",
  padding: "2.9cqw 3.05cqw 3.1cqw",
  background: "#EFEEEA",
  border: "1px solid rgba(0,0,0,.05)",
  borderRadius: "8px",
};

const quoteHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.15cqw",
  fontSize: "2.35cqw",
  lineHeight: 1.25,
};

const quoteNameStyle: CSSProperties = {
  fontWeight: 600,
  color: "#1f1d1b",
};

const quoteTimeStyle: CSSProperties = {
  fontWeight: 400,
  color: "#6b6560",
  whiteSpace: "nowrap",
};

const quoteDurationStyle: CSSProperties = {
  marginLeft: "auto",
  fontWeight: 400,
  color: "#1f1d1b",
  whiteSpace: "nowrap",
};

const quoteBodyStyle: CSSProperties = {
  marginTop: "1.9cqw",
  fontSize: "2.5cqw",
  lineHeight: 1.45,
  fontWeight: 400,
  color: "#1f1d1b",
};

export default function DialogueCardMedia() {
  return (
    <div
      style={rootStyle}
      role="img"
      aria-label="Dialogue preview: a generated answer showing 225 of 300 shoppers read Arrives by Friday as this Friday, with a cited interview clip"
    >
      <div aria-hidden="true" style={panelStyle}>
        <p style={headlineStyle}>
          225 of 300 shoppers read &lsquo;Arrives by Friday&rsquo; as this Friday.
        </p>

        <div style={barStyle}>
          <div style={barPrimaryStyle} />
          <div style={barSecondaryStyle} />
        </div>

        <div style={legendStyle}>
          <div style={legendSideStyle}>
            <span style={legendDotPrimaryStyle} />
            <span style={legendLabelStyle}>Read it as this Friday</span>
            <span style={legendCountStyle}>225</span>
          </div>
          <div style={legendSideStyle}>
            <span style={legendDotSecondaryStyle} />
            <span style={legendMutedStyle}>75 Unsure</span>
          </div>
        </div>

        <div style={chipsStyle}>
          <span style={chipSelectedStyle}>Ana 04:10</span>
          <span style={chipBaseStyle}>Dev 11:02</span>
          <span style={chipMutedStyle}>+223 more</span>
        </div>

        <div style={quoteStyle}>
          <div style={quoteHeaderStyle}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ flex: "0 0 auto", display: "block", width: "2.3cqw", height: "2.3cqw" }}
            >
              <rect x="2" y="9" width="2.4" height="6" rx="1.2" fill="#6b6560" />
              <rect x="6.8" y="6" width="2.4" height="12" rx="1.2" fill="#6b6560" />
              <rect x="11.6" y="3.5" width="2.4" height="17" rx="1.2" fill="#6b6560" />
              <rect x="16.4" y="7" width="2.4" height="10" rx="1.2" fill="#6b6560" />
              <rect x="21" y="10" width="1.6" height="4" rx="0.8" fill="#6b6560" />
            </svg>
            <span style={quoteNameStyle}>Ana</span>
            <span style={quoteTimeStyle}>04:10&ndash;04:24</span>
            <span style={quoteDurationStyle}>00:14</span>
          </div>
          <div style={quoteBodyStyle}>
            It says Friday, so I planned for this Friday.
          </div>
        </div>
      </div>

      <div aria-hidden="true" style={previewStyle}>
        Preview
      </div>
    </div>
  );
}
