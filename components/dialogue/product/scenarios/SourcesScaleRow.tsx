"use client";

import { useState } from "react";
import { SOURCES } from "@/lib/dialogue/product/sampleData";

const TOTAL_SOURCES = 18;
const AVATAR_COUNT = 3;
const SHOWN = SOURCES.slice(0, AVATAR_COUNT);

function initials(name: string) {
  return name
    .replace(".", "")
    .split(" ")
    .map((part) => part[0])
    .join("");
}

/**
 * Sources row that scales past a handful of pills: a few initial avatars and
 * a "+N more" button that opens the list. The list names the interviews the
 * page has (from SOURCES) and counts the rest, so nothing is invented.
 */
export default function SourcesScaleRow() {
  const [open, setOpen] = useState(false);
  const moreCount = TOTAL_SOURCES - AVATAR_COUNT;
  const unnamed = TOTAL_SOURCES - SOURCES.length;

  return (
    <div className="dp-sources-scale" data-annotate-part="sources-row">
      <div className="dp-sources-scale__row">
        <span className="dp-sources-scale__avatars" aria-hidden>
          {SHOWN.map((s) => (
            <span key={s.participant} className="dp-sources-scale__avatar">
              {initials(s.participant)}
            </span>
          ))}
        </span>
        <button
          type="button"
          data-interactive
          className="dp-sources-scale__more"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          +{moreCount} more
        </button>
        <span className="dp-sources-scale__count">18 interviews behind this answer</span>
      </div>
      {open ? (
        <ul className="dp-sources-scale__list">
          {SOURCES.map((s) => (
            <li key={`${s.participant}-${s.time}`} className="dp-sources-scale__item">
              <span className="dp-sources-scale__name">{s.participant}</span>
              <span className="dp-sources-scale__time">{s.time}</span>
            </li>
          ))}
          <li className="dp-sources-scale__item dp-sources-scale__item--rest">
            and {unnamed} more interviews at the address step
          </li>
        </ul>
      ) : null}
    </div>
  );
}
