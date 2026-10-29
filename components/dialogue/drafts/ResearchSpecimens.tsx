"use client";

import { useState } from "react";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import {
  MOCK_DIVERGING,
  MOCK_EVIDENCE_BARS,
  MOCK_MATRIX,
  MOCK_MATRIX_THEMES,
  MOCK_PARTICIPANTS,
  MOCK_TAG,
  MOCK_THEME_COUNTS,
} from "@/components/dialogue/drafts/mockData";

/** Sorted theme bars with count labels like "18 of 24". */
export function DraftSortedThemeCounts() {
  return (
    <ChartVizCard title="Address friction showed up in most interviews">
      <p className="dlg-draft-mock-tag">{MOCK_TAG}</p>
      <ChartBarList
        rows={MOCK_THEME_COUNTS.map((row, i) => ({
          label: row.theme,
          value: row.count,
          display: `${row.count} of ${row.total}`,
          focal: i === 0,
        }))}
        max={MOCK_THEME_COUNTS[0]!.total}
        fillMode="magnitude"
      />
    </ChartVizCard>
  );
}

/** Participant-by-theme matrix (heatmap). */
export function DraftParticipantThemeMatrix() {
  return (
    <ChartVizCard title="Who raised each theme">
      <p className="dlg-draft-mock-tag">{MOCK_TAG}</p>
      <div className="dlg-draft-matrix" role="table" aria-label="Participant by theme matrix">
        <div className="dlg-draft-matrix__row dlg-draft-matrix__row--head" role="row">
          <span className="dlg-draft-matrix__corner" role="columnheader">
            Participant
          </span>
          {MOCK_MATRIX_THEMES.map((t) => (
            <span key={t} className="dlg-draft-matrix__colhead" role="columnheader">
              {t}
            </span>
          ))}
        </div>
        {MOCK_PARTICIPANTS.map((who, ri) => (
          <div key={who} className="dlg-draft-matrix__row" role="row">
            <span className="dlg-draft-matrix__name" role="rowheader">
              {who}
            </span>
            {MOCK_MATRIX[ri]!.map((cell, ci) => (
              <span
                key={`${who}-${MOCK_MATRIX_THEMES[ci]}`}
                className={[
                  "dlg-draft-matrix__cell",
                  cell ? "dlg-draft-matrix__cell--on" : "dlg-draft-matrix__cell--off",
                  cell && ci === 0 ? "dlg-draft-matrix__cell--focal" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="cell"
                aria-label={`${who}, ${MOCK_MATRIX_THEMES[ci]}: ${cell ? "raised" : "did not"}`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="dlg-draft-matrix__note">Filled cells mean the participant raised that theme</p>
    </ChartVizCard>
  );
}

/** Diverging positive and negative bars around zero. */
export function DraftDivergingPosNeg() {
  const max = Math.max(...MOCK_DIVERGING.map((r) => Math.abs(r.value)));
  return (
    <ChartVizCard title="How people felt about the first task">
      <p className="dlg-draft-mock-tag">{MOCK_TAG}</p>
      <div className="dlg-draft-posneg">
        {MOCK_DIVERGING.map((row) => {
          const halfPct = (Math.abs(row.value) / max) * 50;
          const negative = row.value < 0;
          const focal = row.value === Math.max(...MOCK_DIVERGING.map((r) => r.value));
          return (
            <div key={row.label} className="dlg-draft-posneg__row">
              <span className="dlg-draft-posneg__label">{row.label}</span>
              <div className="dlg-draft-posneg__plot">
                <span className="dlg-draft-posneg__zero" aria-hidden />
                <span
                  className={[
                    "dlg-draft-posneg__bar",
                    negative ? "dlg-draft-posneg__bar--neg" : "dlg-draft-posneg__bar--pos",
                    focal ? "dlg-draft-posneg__bar--focal" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    negative
                      ? { width: `${halfPct}%`, right: "50%" }
                      : { width: `${halfPct}%`, left: "50%" }
                  }
                />
              </div>
              <span
                className={[
                  "dlg-draft-posneg__value",
                  focal ? "dlg-draft-posneg__value--focal" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {row.value > 0 ? `+${row.value}` : String(row.value)}
              </span>
            </div>
          );
        })}
      </div>
    </ChartVizCard>
  );
}

/** Evidence-linked bars that open their quotes. */
export function DraftEvidenceLinkedBars() {
  const [open, setOpen] = useState<string | null>(MOCK_EVIDENCE_BARS[0]!.theme);
  const active = MOCK_EVIDENCE_BARS.find((r) => r.theme === open) ?? null;
  const total = MOCK_EVIDENCE_BARS[0]!.total;

  return (
    <ChartVizCard title="Tap a theme to read the quotes behind it">
      <p className="dlg-draft-mock-tag">{MOCK_TAG}</p>
      <ul className="dlg-draft-evidence">
        {MOCK_EVIDENCE_BARS.map((row, i) => {
          const widthPct = (row.count / total) * 100;
          const selected = open === row.theme;
          return (
            <li key={row.theme}>
              <button
                type="button"
                className={[
                  "dlg-draft-evidence__row",
                  selected ? "dlg-draft-evidence__row--open" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-expanded={selected}
                onClick={() => setOpen(selected ? null : row.theme)}
              >
                <span className="dlg-draft-evidence__label">{row.theme}</span>
                <span className="dlg-draft-evidence__track">
                  <span
                    className={[
                      "dlg-draft-evidence__bar",
                      i === 0 ? "dlg-draft-evidence__bar--focal" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ width: `${widthPct}%` }}
                  />
                </span>
                <span className="dlg-draft-evidence__value">
                  {row.count} of {row.total}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {active ? (
        <div className="dlg-draft-evidence__quotes">
          <p className="dlg-draft-evidence__quotes-label">Quotes for {active.theme}</p>
          {active.quotes.map((q) => (
            <blockquote key={`${q.who}-${q.text.slice(0, 12)}`} className="dlg-draft-evidence__quote">
              <span className="dlg-draft-evidence__who">{q.who}</span>
              {q.text}
            </blockquote>
          ))}
        </div>
      ) : (
        <p className="dlg-draft-evidence__hint">Select a bar to open its quotes</p>
      )}
    </ChartVizCard>
  );
}
