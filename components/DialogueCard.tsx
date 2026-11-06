import type { CSSProperties } from "react";
import { dialogueDmSans } from "./dialogueProductFonts";


const rootStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  containerType: "inline-size",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5.8cqw 8.5cqw",
  overflow: "hidden",
  background: "#F6F5F2",
  color: "#1c1917",
};


const panelStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  padding: "4cqw 5cqw",
  background: "#FCFBF9",
  border: "1px solid rgba(35, 32, 30, 0.04)",
  borderRadius: "2.4cqw",
  boxShadow:
    "0 1cqw 2.8cqw rgba(35, 32, 30, 0.08), 0 0.3cqw 0.8cqw rgba(35, 32, 30, 0.05)",
  color: "#1c1917",
};


const bubbleStyle: CSSProperties = {
  alignSelf: "flex-end",
  maxWidth: "92%",
  boxSizing: "border-box",
  padding: "1.15cqw 2.35cqw",
  background: "#F1EEEA",
  borderRadius: "2.34cqw",
  fontSize: "2.3cqw",
  fontWeight: 400,
  lineHeight: 1.35,
  color: "#1c1917",
  whiteSpace: "nowrap",
};


const headlineStyle: CSSProperties = {
  margin: "2.2cqw 0 0",
  fontSize: "3.2cqw",
  fontWeight: 500,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  color: "#1c1917",
};


const barStyle: CSSProperties = {
  display: "flex",
  gap: "2px",
  height: "2.9cqw",
  marginTop: "2.4cqw",
};


const legendStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3cqw",
  marginTop: "1.6cqw",
};


const legendGroupStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "1.15cqw",
  minWidth: 0,
};


const chipRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.5cqw",
  marginTop: "2.2cqw",
};


const chipBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "1.2cqw 2.5cqw",
  border: "1px solid #E3E0DB",
  borderRadius: "1.17cqw",
  background: "#FCFBF9",
  fontSize: "2.3cqw",
  fontWeight: 400,
  lineHeight: 1.2,
  color: "#1c1917",
  whiteSpace: "nowrap",
};


const quoteStyle: CSSProperties = {
  marginTop: "2.2cqw",
  padding: "2.3cqw 2.8cqw",
  background: "#EFEEEA",
  border: "1px solid #E7E4DF",
  borderRadius: "1.17cqw",
};


/* Preview is portfolio chrome, not product UI, so it alone keeps --font-sans. */
const previewStyle: CSSProperties = {
  position: "absolute",
  top: 5,
  right: 5,
  zIndex: 2,
  padding: "4px 8px",
  background: "var(--color-badge-bg)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: 8,
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
  fontFamily: "var(--font-sans)",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "16px",
  color: "var(--color-text-card-sub)",
  whiteSpace: "nowrap",
};


export default function DialogueCardMedia() {
  return (
    <div
      role="img"
      aria-label="Dialogue answer card: a shopper asks how people read 'Arrives by Friday', and 225 of 300 shoppers read it as this Friday, with a quote from Ana explaining she planned for this Friday."
      className={`${dialogueDmSans.variable} ${dialogueDmSans.className}`}
      style={{ ...rootStyle, fontFamily: dialogueDmSans.style.fontFamily }}
    >
      <div aria-hidden="true" style={{ display: "contents" }}>
        <span style={previewStyle}>Preview</span>
        <div style={panelStyle}>
          <div style={bubbleStyle}>
            How do shoppers read {"\u201c"}Arrives by Friday{"\u201d"}?
          </div>


          <p style={headlineStyle}>
            225 of 300 shoppers read {"\u2018"}Arrives by Friday{"\u2019"} as
            this Friday.
          </p>


          <div style={barStyle}>
            <div
              style={{
                flex: "75 1 0",
                background: "#A8497A",
                borderRadius: "0.6cqw",
              }}
            />
            <div
              style={{
                flex: "25 1 0",
                background: "#7A716B",
                borderRadius: "0.6cqw",
              }}
            />
          </div>


          <div style={legendStyle}>
            <span style={legendGroupStyle}>
              <span
                style={{
                  width: "1.35cqw",
                  height: "1.35cqw",
                  flex: "0 0 auto",
                  borderRadius: "0.28cqw",
                  background: "#A8497A",
                }}
              />
              <span
                style={{
                  fontSize: "2.35cqw",
                  lineHeight: 1.2,
                  color: "#1c1917",
                  whiteSpace: "nowrap",
                }}
              >
                Read it as this Friday
              </span>
              <span
                style={{ fontSize: "2.35cqw", lineHeight: 1.2, color: "#1c1917" }}
              >
                225
              </span>
            </span>
            <span style={legendGroupStyle}>
              <span
                style={{
                  width: "1.35cqw",
                  height: "1.35cqw",
                  flex: "0 0 auto",
                  borderRadius: "0.28cqw",
                  background: "#7A716B",
                }}
              />
              <span
                style={{
                  fontSize: "2.1cqw",
                  lineHeight: 1.2,
                  color: "#7A716B",
                  whiteSpace: "nowrap",
                }}
              >
                75 Unsure
              </span>
            </span>
          </div>


          <div style={chipRowStyle}>
            <span style={{ ...chipBaseStyle, background: "#EFEEEA" }}>
              Ana&nbsp;&nbsp;04:10
            </span>
            <span style={chipBaseStyle}>Dev&nbsp;&nbsp;11:02</span>
            <span style={{ ...chipBaseStyle, color: "#6F6862" }}>
              +223 more
            </span>
          </div>


          <div style={quoteStyle}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "1.5cqw" }}
            >
              <svg
                width="3cqw"
                height="2.3cqw"
                viewBox="0 0 20 14"
                fill="#7A716B"
                aria-hidden="true"
                focusable="false"
                style={{ flex: "0 0 auto" }}
              >
                <rect x="0" y="5" width="2.4" height="4" rx="1.2" />
                <rect x="4.4" y="2.5" width="2.4" height="9" rx="1.2" />
                <rect x="8.8" y="4" width="2.4" height="6" rx="1.2" />
                <rect x="13.2" y="1.5" width="2.4" height="11" rx="1.2" />
                <rect x="17.6" y="5" width="2.4" height="4" rx="1.2" />
              </svg>
              <span
                style={{
                  fontSize: "2.35cqw",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "#1c1917",
                }}
              >
                Ana
              </span>
              <span
                style={{ fontSize: "2.25cqw", lineHeight: 1.2, color: "#7A716B" }}
              >
                04:10{"\u2013"}04:24
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "2.25cqw",
                  lineHeight: 1.2,
                  color: "#1c1917",
                }}
              >
                00:14
              </span>
            </div>
            <p
              style={{
                margin: "1.2cqw 0 0",
                fontSize: "2.35cqw",
                lineHeight: 1.35,
                color: "#1c1917",
              }}
            >
              It says Friday, so I planned for this Friday.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
