"use client";

import { useState } from "react";

/**
 * BruinLease structure as a flow map.
 * Pain-point channels fold into one app with four destinations.
 * Mobile (767px, same as the rest of the case study): even 2×2 of
 * destinations; the selected job's next screens sit under the grid.
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

      <div className="bl-ia-plate">
        <div className="bl-ia-tree" aria-label="How BruinLease is structured">
          <p className="bl-ia-group-label">what students use now</p>
          <div className="bl-ia-sources">
            {PAIN_CHANNELS.map((name) => (
              <span key={name} className="bl-ia-source">
                <PainX />
                {name}
              </span>
            ))}
          </div>

          <div className="bl-ia-line bl-ia-line-v" />
          <p className="bl-ia-fold">one place</p>
          <div className="bl-ia-line bl-ia-line-v" />

          <div className="bl-ia-root">BruinLease</div>

          <div className="bl-ia-line bl-ia-line-v" />

          <div className="bl-ia-fork">
            {NODES.map((n) => {
              const isActive = n.id === active;
              return (
                <div key={n.id} className={`bl-ia-col${isActive ? " is-active" : ""}`}>
                  <button
                    type="button"
                    className={`bl-ia-node${isActive ? " is-active" : ""}`}
                    aria-pressed={isActive}
                    onClick={() => setActive(n.id)}
                  >
                    <span className="bl-ia-node-label">{n.label}</span>
                    <span className="bl-ia-node-job">{n.job}</span>
                  </button>

                  <ul className="bl-ia-next">
                    {n.next.map((step) => (
                      <li key={step.label} className="bl-ia-next-item">
                        <span className="bl-ia-line bl-ia-line-v bl-ia-line-short" />
                        <Leaf step={step} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <ul className="bl-ia-mobile-flow" aria-label={`${node.label} leads to`}>
            {node.next.map((step) => (
              <li key={step.label}>
                <Leaf step={step} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Leaf({
  step,
}: {
  step: { label: string; note?: string };
}) {
  return (
    <span className="bl-ia-leaf">
      {step.label}
      {step.note ? <em className="bl-ia-leaf-note">{step.note}</em> : null}
    </span>
  );
}

function PainX() {
  return (
    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5" stroke={COLOR_WRONG} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const CSS = `
.bl-ia {
  --bl-ia-ink: var(--color-text-primary);
  --bl-ia-sec: var(--color-text-secondary);
  --bl-ia-ter: var(--color-text-tertiary);
  --bl-ia-muted: var(--color-text-muted);
  --bl-ia-line: color-mix(in srgb, var(--color-text-primary) 22%, transparent);
  --bl-ia-surface: var(--color-badge-bg);
  --bl-ia-border: var(--color-border-subtle);
  --bl-ia-blue: var(--color-ucla-blue);
  --bl-ia-ease: cubic-bezier(0.23, 1, 0.32, 1);
  font-family: var(--font-sans);
  color: var(--bl-ia-ink);
  margin-top: 8px;
}

.bl-ia-plate {
  background: var(--color-placeholder);
  border-radius: 8px;
  padding: 28px 20px 24px;
}

.bl-ia-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bl-ia-group-label,
.bl-ia-fold {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--bl-ia-ter);
  text-align: center;
}

.bl-ia-fold {
  padding: 3px 8px;
  background: var(--bl-ia-surface);
  border-radius: 4px;
  color: var(--bl-ia-sec);
}

.bl-ia-sources {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.bl-ia-source {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px 0 8px;
  border-radius: 8px;
  background: var(--bl-ia-surface);
  border: 1px solid color-mix(in srgb, ${COLOR_WRONG} 22%, var(--bl-ia-border));
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: var(--bl-ia-sec);
}

.bl-ia-line {
  background: var(--bl-ia-line);
  flex-shrink: 0;
}

.bl-ia-line-v {
  width: 1px;
  height: 16px;
}

.bl-ia-line-short {
  height: 12px;
  margin: 0 auto;
  display: block;
}

.bl-ia-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid color-mix(in srgb, var(--bl-ia-blue) 40%, var(--bl-ia-border));
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
  padding-top: 20px;
  position: relative;
  min-width: 0;
}

.bl-ia-col::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 20px;
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
  border-color: color-mix(in srgb, var(--bl-ia-blue) 50%, var(--bl-ia-border));
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

.bl-ia-col .bl-ia-next {
  opacity: 0.55;
  transition: opacity 180ms var(--bl-ia-ease);
}
.bl-ia-col.is-active .bl-ia-next {
  opacity: 1;
}

.bl-ia-next {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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
  border: 1px solid var(--bl-ia-border);
  border-radius: 8px;
  background: var(--bl-ia-surface);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: var(--bl-ia-sec);
  text-align: center;
  font-style: normal;
  box-sizing: border-box;
}

.bl-ia-leaf-note {
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  color: var(--bl-ia-muted);
}

.bl-ia-mobile-flow {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .bl-ia-col .bl-ia-next { transition: none; }
  .bl-ia-node { transition: border-color 160ms ease; }
  .bl-ia-node:active { transform: none; }
}

/* Same cutoff as .cs-stats-row / .cs-process-tools / .cs-d1-columns */
@media (max-width: 767px) {
  .bl-ia-plate { padding: 20px 16px; }

  .bl-ia-sources {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    gap: 8px;
  }
  .bl-ia-source {
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
  }

  .bl-ia-fork {
    grid-template-columns: 1fr 1fr;
    width: 100%;
    max-width: none;
    gap: 8px;
  }
  .bl-ia-fork::before,
  .bl-ia-col::before { display: none; }
  .bl-ia-col { padding-top: 0; width: 100%; }
  .bl-ia-node { max-width: none; }

  .bl-ia-fork .bl-ia-next { display: none; }
  .bl-ia-col .bl-ia-next { opacity: 1; }

  .bl-ia-mobile-flow {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }
  .bl-ia-mobile-flow li {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
  }
  .bl-ia-mobile-flow .bl-ia-leaf {
    max-width: none;
  }
}
`;
