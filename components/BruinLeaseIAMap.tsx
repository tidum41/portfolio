"use client";

import { useState } from "react";

/**
 * BruinLease structure as a markdown-graph artifact.
 * Channels fold into one place, then the four jobs.
 * Connectors are CSS (so they survive SSR and reflow). A short
 * linear pulse rides the spine — same motion as Emil’s flow demo.
 */

const NODES = [
  {
    id: "home",
    label: "Home",
    job: "Browse",
    next: [
      { label: "Search + filters" },
      { label: "Listing detail" },
      { label: "Save / Message" },
    ],
  },
  {
    id: "saved",
    label: "Saved",
    job: "Shortlist",
    next: [
      { label: "Bookmarks" },
      { label: "Listing detail" },
    ],
  },
  {
    id: "chat",
    label: "Chat",
    job: "Message",
    next: [
      { label: "Inbox" },
      { label: "Thread" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    job: "List",
    next: [
      { label: "+ List", note: "header, not a tab" },
      { label: "My listings" },
      { label: "Settings" },
    ],
  },
] as const;

type NodeId = (typeof NODES)[number]["id"];

const PAIN_CHANNELS = ["Facebook", "Reddit", "Instagram", "Texts"] as const;

const COLOR_WRONG = "#C62828";

export default function BruinLeaseIAMap() {
  const [active, setActive] = useState<NodeId>("home");
  const node = NODES.find((n) => n.id === active) ?? NODES[0];

  return (
    <div className="bl-ia">
      <style>{CSS}</style>
      <figure className="bl-ia-frame" aria-label="How BruinLease is structured">
        <span className="bl-ia-plus bl-ia-plus-tl" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-tr" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-bl" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-br" aria-hidden>+</span>
        <span className="bl-ia-kicker">[ one place ]</span>

        <div className="bl-ia-board">
          <span className="bl-ia-pulse" aria-hidden />

          <p className="bl-ia-caption">what students use now</p>
          <div className="bl-ia-sources">
            {PAIN_CHANNELS.map((name) => (
              <span key={name} className="bl-ia-source">
                <PainX />
                {name}
              </span>
            ))}
          </div>

          <span className="bl-ia-join" aria-hidden>
            <span className="bl-ia-join-rail" />
            <span className="bl-ia-join-plus">+</span>
            <span className="bl-ia-arrow">v</span>
          </span>

          <div className="bl-ia-root">BruinLease</div>

          <span className="bl-ia-join" aria-hidden>
            <span className="bl-ia-arrow">v</span>
          </span>

          <div className="bl-ia-dests" role="group" aria-label="Tabs">
            {NODES.map((n) => {
              const isActive = n.id === active;
              return (
                <button
                  key={n.id}
                  type="button"
                  className={`bl-ia-dest${isActive ? " is-active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => setActive(n.id)}
                >
                  <span className="bl-ia-dest-label">{n.label}</span>
                  <span className="bl-ia-dest-job">{n.job}</span>
                </button>
              );
            })}
          </div>

          <span className="bl-ia-join" aria-hidden>
            <span className="bl-ia-arrow">v</span>
          </span>

          <ol className="bl-ia-leaves" aria-label={`${node.label} leads to`}>
            {node.next.map((step, i) => (
              <li key={step.label} className="bl-ia-leaf">
                {i > 0 ? <span className="bl-ia-arrow">v</span> : null}
                <span className="bl-ia-leaf-label">{step.label}</span>
                {step.note ? (
                  <em className="bl-ia-leaf-note">{step.note}</em>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </figure>
    </div>
  );
}

function PainX() {
  return (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
        stroke={COLOR_WRONG}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const CSS = `
.bl-ia {
  --bl-ia-ink: var(--color-text-primary);
  --bl-ia-sec: var(--color-text-secondary);
  --bl-ia-ter: var(--color-text-tertiary);
  --bl-ia-muted: var(--color-text-muted);
  --bl-ia-line: color-mix(in srgb, var(--color-text-primary) 42%, transparent);
  --bl-ia-blue: var(--color-ucla-blue);
  --bl-ia-ease: cubic-bezier(0.23, 1, 0.32, 1);
  --bl-ia-mono: var(--font-mono);
  --bl-ia-sans: var(--font-sans);
  color: var(--bl-ia-ink);
  margin-top: 8px;
}

.bl-ia-frame {
  position: relative;
  background: var(--color-placeholder);
  border: 1px dashed var(--bl-ia-line);
  border-radius: 0;
  padding: 36px 28px 32px;
}

.bl-ia-plus {
  position: absolute;
  z-index: 2;
  font-family: var(--bl-ia-mono);
  font-size: 13px;
  line-height: 1;
  color: var(--bl-ia-muted);
  pointer-events: none;
  user-select: none;
}
.bl-ia-plus-tl { top: -7px; left: -5px; }
.bl-ia-plus-tr { top: -7px; right: -5px; }
.bl-ia-plus-bl { bottom: -8px; left: -5px; }
.bl-ia-plus-br { bottom: -8px; right: -5px; }

.bl-ia-kicker {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 10px;
  background: var(--color-placeholder);
  color: var(--bl-ia-blue);
  font-family: var(--bl-ia-mono);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.bl-ia-board {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bl-ia-board::before {
  content: "";
  position: absolute;
  top: 42px;
  bottom: 8px;
  left: 50%;
  width: 0;
  border-left: 1px dashed var(--bl-ia-line);
  pointer-events: none;
}

.bl-ia-pulse {
  position: absolute;
  top: 42px;
  bottom: 8px;
  left: 50%;
  width: 2px;
  margin-left: -1px;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}

.bl-ia-pulse::after {
  content: "";
  position: absolute;
  left: 0;
  width: 2px;
  height: 22px;
  background: var(--bl-ia-blue);
  animation: bl-ia-flow 3.4s linear infinite;
}

@keyframes bl-ia-flow {
  from { top: 0; transform: translateY(-100%); }
  to { top: 100%; transform: translateY(0); }
}

.bl-ia-caption {
  position: relative;
  z-index: 1;
  margin: 0 0 12px;
  font-family: var(--bl-ia-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--bl-ia-ter);
  text-align: center;
  background: var(--color-placeholder);
  padding: 0 8px;
}

.bl-ia-sources {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 28px;
  width: 100%;
}

.bl-ia-source {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--bl-ia-sans);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.1px;
  color: var(--bl-ia-sec);
  background: var(--color-placeholder);
  padding: 0 4px;
}

.bl-ia-join {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 520px;
  padding: 14px 0 10px;
}

.bl-ia-join-rail {
  display: block;
  width: 78%;
  height: 0;
  border-top: 1px dashed var(--bl-ia-line);
}

.bl-ia-join-plus {
  font-family: var(--bl-ia-mono);
  font-size: 12px;
  line-height: 1;
  color: var(--bl-ia-muted);
  background: var(--color-placeholder);
  margin-top: -6px;
  padding: 0 4px;
}

.bl-ia-arrow {
  display: block;
  font-family: var(--bl-ia-mono);
  font-size: 11px;
  line-height: 1;
  color: var(--bl-ia-muted);
  background: var(--color-placeholder);
  padding: 6px;
  user-select: none;
}

.bl-ia-root {
  position: relative;
  z-index: 1;
  font-family: var(--font-sans-medium, var(--bl-ia-sans));
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: var(--bl-ia-blue);
  background: var(--color-placeholder);
  padding: 4px 10px;
}

.bl-ia-dests {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 4px;
  width: 100%;
}

.bl-ia-dest {
  appearance: none;
  margin: 0;
  padding: 8px 16px;
  border: none;
  background: var(--color-placeholder);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: 92px;
  color: var(--bl-ia-ink);
  transform: scale(1);
  transition: transform 160ms var(--bl-ia-ease), color 160ms var(--bl-ia-ease);
  -webkit-tap-highlight-color: transparent;
}

.bl-ia-dest:active { transform: scale(0.97); }
.bl-ia-dest:focus-visible {
  outline: 2px solid var(--bl-ia-blue);
  outline-offset: 3px;
}

.bl-ia-dest-label {
  font-family: var(--font-sans-medium, var(--bl-ia-sans));
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.15px;
}

.bl-ia-dest-job {
  font-family: var(--bl-ia-sans);
  font-size: 11px;
  color: var(--bl-ia-muted);
  letter-spacing: 0;
}

.bl-ia-dest.is-active .bl-ia-dest-label,
.bl-ia-dest.is-active .bl-ia-dest-job {
  color: var(--bl-ia-blue);
}

@media (hover: hover) and (pointer: fine) {
  .bl-ia-dest:hover .bl-ia-dest-label {
    color: var(--bl-ia-blue);
  }
}

.bl-ia-leaves {
  position: relative;
  z-index: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bl-ia-leaf {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-placeholder);
  padding: 0 8px;
  text-align: center;
}

.bl-ia-leaf-label {
  font-family: var(--bl-ia-sans);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.1px;
  color: var(--bl-ia-sec);
}

.bl-ia-leaf-note {
  font-family: var(--bl-ia-mono);
  font-style: normal;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--bl-ia-muted);
  margin-top: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .bl-ia-pulse::after { animation: none; opacity: 0; }
  .bl-ia-dest { transition: color 160ms ease; }
  .bl-ia-dest:active { transform: none; }
}

@media (max-width: 767px) {
  .bl-ia-frame { padding: 28px 16px 24px; }
  .bl-ia-sources {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 12px;
  }
  .bl-ia-source { justify-content: center; }
  .bl-ia-join { max-width: none; }
  .bl-ia-join-rail { width: 70%; }
  .bl-ia-dests {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }
  .bl-ia-dest { min-width: 0; width: 100%; padding: 8px 6px; }
}
`;
