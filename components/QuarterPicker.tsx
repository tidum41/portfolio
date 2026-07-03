"use client";

import { useState, useRef, useCallback } from "react";

const UCLA_BLUE = "#2D68C4";

type Quarter = {
  id: string;
  label: string;
  moveIn: string;  // YYYY-MM-DD
  moveOut: string; // YYYY-MM-DD
};

const QUARTERS: Quarter[] = [
  { id: "spring", label: "Spring '26", moveIn: "2026-03-29", moveOut: "2026-06-13" },
  { id: "summer", label: "Summer '26", moveIn: "2026-06-22", moveOut: "2026-09-19" },
  { id: "fall",   label: "Fall '26",   moveIn: "2026-09-22", moveOut: "2026-12-13" },
  { id: "winter", label: "Winter '27", moveIn: "2027-01-05", moveOut: "2027-03-26" },
];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

export default function QuarterPicker() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set(["summer"]));
  const [moveIn,   setMoveIn]   = useState<string>(
    QUARTERS.find(q => q.id === "summer")!.moveIn
  );
  const [moveOut,  setMoveOut]  = useState<string>(
    QUARTERS.find(q => q.id === "summer")!.moveOut
  );

  const toggleQuarter = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      if (next.size === 0) {
        // No quarters selected — keep current manual dates
        return next;
      }

      // Derive earliest moveIn and latest moveOut from selected quarters
      const sel = QUARTERS.filter(q => next.has(q.id));
      const earliest = sel.map(q => q.moveIn).sort()[0];
      const latest   = sel.map(q => q.moveOut).sort().at(-1)!;
      setMoveIn(earliest);
      setMoveOut(latest);
      return next;
    });
  }, []);

  const handleMoveIn = (val: string) => {
    setMoveIn(val);
    setSelected(new Set()); // manual override clears quarter selection
  };
  const handleMoveOut = (val: string) => {
    setMoveOut(val);
    setSelected(new Set());
  };

  const inputSt: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    opacity: 0,
    zIndex: 2,
    width: "100%",
    height: "100%",
    cursor: "pointer",
  };

  const dateCardSt: React.CSSProperties = {
    flex: 1,
    padding: "14px 16px",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 8,
    background: "white",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div ref={containerRef} style={{
      background: "white",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 12,
      padding: 20,
      maxWidth: 393,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      fontFamily: "var(--font-sans)",
    }}>

      {/* Date cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {/* Move-in */}
        <div style={dateCardSt}>
          <input type="date" value={moveIn} onChange={e => handleMoveIn(e.target.value)} style={inputSt} />
          <p style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.01em", color: "var(--color-text-muted)", margin: "0 0 4px" }}>Move In</p>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
            {moveIn ? formatDate(moveIn) : "—"}
          </p>
        </div>

        {/* Move-out */}
        <div style={dateCardSt}>
          <input type="date" value={moveOut} onChange={e => handleMoveOut(e.target.value)} style={inputSt} />
          <p style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.01em", color: "var(--color-text-muted)", margin: "0 0 4px" }}>Move Out</p>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
            {moveOut ? formatDate(moveOut) : "—"}
          </p>
        </div>
      </div>

      {/* Quarter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {QUARTERS.map(q => {
          const active = selected.has(q.id);
          return (
            <button
              key={q.id}
              onClick={() => toggleQuarter(q.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1.5px solid ${active ? UCLA_BLUE : "rgba(0,0,0,0.10)"}`,
                background: active ? `rgba(45,104,196,0.08)` : "transparent",
                color: active ? UCLA_BLUE : "var(--color-text-secondary)",
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                transition: "border-color 150ms ease, background-color 150ms ease, color 150ms ease, font-weight 150ms ease",
              }}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 14, marginBottom: 0 }}>
        Select a quarter to autofill dates, or tap the cards to set custom dates.
      </p>
    </div>
  );
}
