"use client";

import { useState } from "react";

/**
 * BruinLease IA as a flow map — outlined nodes, thin connectors, one caption.
 * Click a destination to see where that job leads.
 */

const NODES = [
  {
    id: "home",
    label: "Home",
    job: "Browse",
    why: "One feed of standardized listings instead of hopping groups and threads.",
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
    why: "Housing search spans days. Students compare, then come back.",
    next: [
      { label: "Bookmarks" },
      { label: "Listing detail" },
    ],
  },
  {
    id: "chat",
    label: "Chat",
    job: "Coordinate",
    why: "Outreach stays in-app, so basics aren’t asked over DMs.",
    next: [
      { label: "Inbox" },
      { label: "Thread" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    job: "Account",
    why: "Lister tools live here — without crowding seeker jobs.",
    next: [
      { label: "+ List", note: "header, not a tab" },
      { label: "My listings" },
      { label: "Settings" },
    ],
  },
] as const;

type NodeId = (typeof NODES)[number]["id"];

const SOURCES = ["Facebook", "Reddit", "Instagram", "Texts"];

export default function BruinLeaseIAMap() {
  const [active, setActive] = useState<NodeId>("home");
  const node = NODES.find((n) => n.id === active) ?? NODES[0];

  return (
    <div className="bl-ia">
      <style>{CSS}</style>

      <div className="bl-ia-plate">
        <div className="bl-ia-tree" aria-label="BruinLease information architecture">
          <div className="bl-ia-sources">
            {SOURCES.map((name) => (
              <span key={name} className="bl-ia-source">
                {name}
              </span>
            ))}
          </div>

          <div className="bl-ia-line bl-ia-line-v" />

          <div className="bl-ia-root">BruinLease</div>

          <div className="bl-ia-line bl-ia-line-v" />

          <div className="bl-ia-fork">
            {NODES.map((n) => {
              const isActive = n.id === active;
              return (
                <div key={n.id} className="bl-ia-col">
                  <button
                    type="button"
                    className={`bl-ia-node${isActive ? " is-active" : ""}`}
                    aria-pressed={isActive}
                    onClick={() => setActive(n.id)}
                  >
                    <span className="bl-ia-node-label">{n.label}</span>
                    <span className="bl-ia-node-job">{n.job}</span>
                  </button>

                  <ul className={`bl-ia-next${isActive ? " is-active" : ""}`}>
                    {n.next.map((step) => (
                      <li key={step.label} className="bl-ia-next-item">
                        <span className="bl-ia-line bl-ia-line-v bl-ia-line-short" />
                        <span className="bl-ia-leaf">
                          {step.label}
                          {"note" in step && step.note ? (
                            <em className="bl-ia-leaf-note">{step.note}</em>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div key={node.id} className="bl-ia-callout" aria-live="polite">
        <p className="bl-ia-callout-job">{node.job}</p>
        <p className="bl-ia-callout-why">{node.why}</p>
      </div>
    </div>
  );
}

const CSS = `
.bl-ia {
  --bl-ia-ink: var(--color-text-primary);
  --bl-ia-sec: var(--color-text-secondary);
  --bl-ia-ter: var(--color-text-tertiary);
  --bl-ia-muted: var(--color-text-muted);
  --bl-ia-line: color-mix(in srgb, var(--color-text-muted) 55%, transparent);
  --bl-ia-plate: var(--color-accent-subtle);
  --bl-ia-surface: var(--color-badge-bg);
  --bl-ia-border: var(--color-border-subtle);
  --bl-ia-blue: var(--color-ucla-blue);
  --bl-ia-ease: cubic-bezier(0.23, 1, 0.32, 1);
  font-family: var(--font-sans);
  color: var(--bl-ia-ink);
  margin-top: 4px;
}

.bl-ia-plate {
  background: var(--bl-ia-plate);
  border-radius: 8px;
  padding: 36px 24px 28px;
}

.bl-ia-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bl-ia-sources {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 20px;
}

.bl-ia-source {
  font-size: 12px;
  font-weight: 500;
  color: var(--bl-ia-muted);
  letter-spacing: -0.1px;
}

.bl-ia-line {
  background: var(--bl-ia-line);
  flex-shrink: 0;
}

.bl-ia-line-v {
  width: 1px;
  height: 22px;
}

.bl-ia-line-short {
  height: 14px;
  margin: 0 auto;
  display: block;
}

.bl-ia-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid var(--bl-ia-border);
  border-radius: 8px;
  background: var(--bl-ia-surface);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: var(--bl-ia-blue);
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.bl-ia-fork {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
  max-width: 640px;
  position: relative;
  align-items: start;
}

.bl-ia-fork::before {
  content: "";
  position: absolute;
  top: 0;
  left: 12.5%;
  width: 75%;
  height: 1px;
  background: var(--bl-ia-line);
}

.bl-ia-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 22px;
  position: relative;
  min-width: 0;
}

.bl-ia-col::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 22px;
  background: var(--bl-ia-line);
}

.bl-ia-node {
  appearance: none;
  width: 100%;
  max-width: 128px;
  margin: 0;
  padding: 10px 8px 9px;
  border: 1px solid var(--bl-ia-border);
  border-radius: 8px;
  background: var(--bl-ia-surface);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transform: scale(1);
  transition: transform 160ms var(--bl-ia-ease), border-color 160ms var(--bl-ia-ease);
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.bl-ia-node:active { transform: scale(0.97); }
.bl-ia-node:focus-visible {
  outline: 2px solid var(--bl-ia-blue);
  outline-offset: 2px;
}
.bl-ia-node.is-active {
  border-color: color-mix(in srgb, var(--bl-ia-blue) 45%, var(--bl-ia-border));
}
.bl-ia-node.is-active .bl-ia-node-job {
  color: var(--bl-ia-blue);
}

@media (hover: hover) and (pointer: fine) {
  .bl-ia-node:hover {
    border-color: color-mix(in srgb, var(--bl-ia-ink) 18%, var(--bl-ia-border));
  }
}

.bl-ia-node-label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: var(--bl-ia-ink);
  font-family: var(--font-sans-medium, var(--font-sans));
}

.bl-ia-node-job {
  font-size: 11px;
  color: var(--bl-ia-muted);
}

.bl-ia-next {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  opacity: 0.42;
  transition: opacity 180ms var(--bl-ia-ease);
}

.bl-ia-next.is-active {
  opacity: 1;
}

.bl-ia-next-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.bl-ia-leaf {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  max-width: 128px;
  padding: 7px 8px;
  border: 1px dashed var(--bl-ia-border);
  border-radius: 8px;
  background: transparent;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: var(--bl-ia-sec);
  text-align: center;
  font-style: normal;
}

.bl-ia-leaf-note {
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  color: var(--bl-ia-muted);
}

.bl-ia-callout {
  margin: 16px 0 0;
  text-align: center;
  animation: bl-ia-in 180ms var(--bl-ia-ease) both;
}

.bl-ia-callout-job {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bl-ia-ter);
}

.bl-ia-callout-why {
  margin: 0 auto;
  max-width: 42em;
  font-size: 15px;
  line-height: var(--lh-body, 1.72);
  color: var(--bl-ia-sec);
}

@keyframes bl-ia-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bl-ia-callout {
    animation: bl-ia-fade 180ms ease both;
  }
  .bl-ia-next { transition: none; }
  .bl-ia-node { transition: border-color 160ms ease; }
  .bl-ia-node:active { transform: none; }
}

@keyframes bl-ia-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 640px) {
  .bl-ia-plate { padding: 28px 16px 22px; }
  .bl-ia-fork {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 300px;
  }
  .bl-ia-fork::before { display: none; }
  .bl-ia-col { padding-top: 12px; }
  .bl-ia-col::before { display: none; }
}
`;
