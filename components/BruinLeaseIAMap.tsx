"use client";

import { useState } from "react";

/**
 * Interactive IA map for the BruinLease case study.
 * Isolated artifacts + hierarchy notes — not a dense dashboard.
 */

const TABS = [
  {
    id: "home",
    label: "Home",
    job: "Browse",
    why: "One feed of standardized listings replaces hopping Facebook groups and Reddit threads.",
    connects: ["Search + filters", "Listing detail", "Save / Message"],
    preview: "feed" as const,
  },
  {
    id: "saved",
    label: "Saved",
    job: "Shortlist",
    why: "Housing search is multi-session. Students compare options over days, not in one scroll.",
    connects: ["Bookmarked listings", "Back to detail"],
    preview: "saved" as const,
  },
  {
    id: "chat",
    label: "Chat",
    job: "Coordinate",
    why: "Keep outreach in-app so seekers stop juggling DMs just to ask for basics.",
    connects: ["Conversation list", "Thread", "Listing link"],
    preview: "chat" as const,
  },
  {
    id: "profile",
    label: "Profile",
    job: "Account",
    why: "Lister and settings live here—without crowding the seeker jobs that drive most sessions.",
    connects: ["My listings", "Edit profile", "Settings"],
    preview: "profile" as const,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const BEFORE = ["Facebook", "Reddit", "Instagram", "Texts"];

const SCHEMA = [
  ["Price + room", "Scan first"],
  ["Distance", "Think in walk time"],
  ["Quarters", "Academic calendar"],
  ["Verified", "Trust on-card"],
  ["Bath / roommates", "Fewer DMs"],
  ["Amenities", "Serious filters"],
] as const;

export default function BruinLeaseIAMap() {
  const [active, setActive] = useState<TabId>("home");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="bl-ia">
      <style>{CSS}</style>

      <div className="bl-ia-flow" aria-label="From fragmented channels to one app">
        <div className="bl-ia-before">
          {BEFORE.map((name) => (
            <span key={name} className="bl-ia-chip">
              {name}
            </span>
          ))}
        </div>
        <span className="bl-ia-arrow" aria-hidden>
          →
        </span>
        <div className="bl-ia-after">
          <span className="bl-ia-chip bl-ia-chip-focus">BruinLease</span>
        </div>
      </div>

      <div className="bl-ia-plate">
        <div className="bl-ia-stage">
          <div className="bl-ia-phone" aria-label={`App structure, ${tab.label} selected`}>
            <div className="bl-ia-phone-header">
              <span className="bl-ia-brand">BruinLease</span>
              <div className="bl-ia-list-wrap">
                <span className="bl-ia-list-cta">+ List</span>
                <span className="bl-ia-annot">not a tab</span>
              </div>
            </div>

            <div className="bl-ia-screen">
              <ScreenPreview key={tab.id} kind={tab.preview} />
            </div>

            <nav className="bl-ia-tabbar" aria-label="Primary destinations">
              {TABS.map((t) => {
                const isActive = t.id === active;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`bl-ia-tab${isActive ? " is-active" : ""}`}
                    aria-pressed={isActive}
                    onClick={() => setActive(t.id)}
                  >
                    <TabGlyph id={t.id} active={isActive} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bl-ia-detail" aria-live="polite">
            <div key={tab.id} className="bl-ia-detail-inner">
              <p className="bl-ia-job">{tab.job}</p>
              <h3 className="bl-ia-detail-title">{tab.label}</h3>
              <p className="bl-ia-detail-why">{tab.why}</p>
              <p className="bl-ia-connects">
                {tab.connects.join("  ·  ")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="bl-ia-caption">Primary destinations — tap a tab</p>

      <p className="bl-ia-schema-intro">
        Informal posts force back-and-forth for basics. A shared schema lets seekers compare apples to apples.
      </p>

      <div className="bl-ia-plate">
        <div className="bl-ia-schema">
          <article className="bl-ia-listing" aria-label="Standardized listing card">
            <div className="bl-ia-listing-img" />
            <div className="bl-ia-listing-body">
              <div className="bl-ia-listing-row">
                <span className="bl-ia-listing-price">$2,150</span>
                <span className="bl-ia-listing-badge">Verified</span>
              </div>
              <p className="bl-ia-listing-line">Private room · 0.6 mi from campus</p>
              <p className="bl-ia-listing-line">Spring quarter</p>
              <p className="bl-ia-listing-meta">1 bath · 2 roommates · Parking, laundry</p>
            </div>
          </article>

          <ul className="bl-ia-notes">
            {SCHEMA.map(([title, note]) => (
              <li key={title}>
                <span className="bl-ia-note-title">{title}</span>
                <span className="bl-ia-note-sep" aria-hidden>
                  —
                </span>
                <span className="bl-ia-note-why">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="bl-ia-caption">Breaking down what every listing has to capture</p>
    </div>
  );
}

function ScreenPreview({
  kind,
}: {
  kind: (typeof TABS)[number]["preview"];
}) {
  if (kind === "feed") {
    return (
      <div className="bl-ia-preview">
        <div className="bl-ia-search" />
        {[0, 1].map((i) => (
          <div key={i} className="bl-ia-card">
            <div className="bl-ia-card-img" />
            <div className="bl-ia-card-lines">
              <span className="bl-ia-line bl-ia-line-sm" />
              <span className="bl-ia-line" />
              <span className="bl-ia-line bl-ia-line-mid" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "saved") {
    return (
      <div className="bl-ia-preview">
        <p className="bl-ia-preview-title">Saved</p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="bl-ia-row">
            <div className="bl-ia-row-thumb" />
            <div className="bl-ia-card-lines" style={{ flex: 1 }}>
              <span className="bl-ia-line" />
              <span className="bl-ia-line bl-ia-line-mid" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "chat") {
    return (
      <div className="bl-ia-preview">
        <p className="bl-ia-preview-title">Messages</p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="bl-ia-row">
            <div className="bl-ia-avatar" />
            <div className="bl-ia-card-lines" style={{ flex: 1 }}>
              <span className="bl-ia-line bl-ia-line-sm" />
              <span className="bl-ia-line" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="bl-ia-preview">
      <div className="bl-ia-profile-head">
        <div className="bl-ia-avatar bl-ia-avatar-lg" />
        <div className="bl-ia-card-lines" style={{ flex: 1 }}>
          <span className="bl-ia-line bl-ia-line-sm" />
          <span className="bl-ia-line bl-ia-line-mid" />
        </div>
      </div>
      {["My listings", "Settings", "Verification"].map((label) => (
        <div key={label} className="bl-ia-menu-row">
          {label}
        </div>
      ))}
    </div>
  );
}

function TabGlyph({ id, active }: { id: TabId; active: boolean }) {
  const stroke = active ? "var(--bl-ia-ink)" : "var(--bl-ia-muted)";
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke,
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (id === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }
  if (id === "saved") {
    return (
      <svg {...common}>
        <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }
  if (id === "chat") {
    return (
      <svg {...common}>
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 3v-3.2A2.5 2.5 0 0 1 5 13.5v-7Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19c1.6-3 4-4.5 6.5-4.5S17 16 18.5 19" />
    </svg>
  );
}

const CSS = `
.bl-ia {
  --bl-ia-ink: var(--color-text-primary);
  --bl-ia-sec: var(--color-text-secondary);
  --bl-ia-ter: var(--color-text-tertiary);
  --bl-ia-muted: var(--color-text-muted);
  --bl-ia-plate: var(--color-accent-subtle);
  --bl-ia-surface: var(--color-badge-bg);
  --bl-ia-screen: var(--color-phone-bg);
  --bl-ia-border: var(--color-border-subtle);
  --bl-ia-blue: var(--color-ucla-blue);
  --bl-ia-line: color-mix(in srgb, var(--color-text-primary) 14%, transparent);
  --bl-ia-ease: cubic-bezier(0.23, 1, 0.32, 1);
  font-family: var(--font-sans);
  color: var(--bl-ia-ink);
  margin-top: 8px;
}

.bl-ia-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  margin: 0 0 20px;
}

.bl-ia-before, .bl-ia-after {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.bl-ia-chip {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.1px;
  background: var(--color-placeholder);
  color: var(--bl-ia-muted);
}

.bl-ia-chip-focus {
  background: var(--bl-ia-plate);
  color: var(--bl-ia-ink);
}

.bl-ia-arrow {
  color: var(--bl-ia-muted);
  font-size: 14px;
}

.bl-ia-plate {
  background: var(--bl-ia-plate);
  border-radius: 8px;
  padding: 20px;
}

.bl-ia-caption {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--bl-ia-muted);
  text-align: center;
}

.bl-ia-stage {
  display: grid;
  grid-template-columns: minmax(200px, 240px) 1fr;
  gap: 28px;
  align-items: center;
}

.bl-ia-phone {
  background: var(--bl-ia-surface);
  border: 1px solid var(--bl-ia-border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.bl-ia-phone-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--bl-ia-border);
}

.bl-ia-brand {
  font-size: 13px;
  font-weight: 600;
  color: var(--bl-ia-blue);
}

.bl-ia-list-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.bl-ia-list-cta {
  display: inline-flex;
  align-items: center;
  background: var(--bl-ia-blue);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  border-radius: 999px;
  padding: 5px 10px;
  line-height: 1;
}

.bl-ia-annot {
  font-size: 10px;
  color: var(--bl-ia-ter);
  background: var(--bl-ia-plate);
  border-radius: 4px;
  padding: 2px 6px;
  white-space: nowrap;
}

.bl-ia-screen {
  flex: 1;
  background: var(--bl-ia-screen);
  padding: 10px;
  min-height: 188px;
}

.bl-ia-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: bl-ia-in 180ms var(--bl-ia-ease) both;
}

.bl-ia-preview-title {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--bl-ia-ink);
}

.bl-ia-search {
  height: 28px;
  border-radius: 999px;
  background: var(--bl-ia-surface);
  border: 1px solid var(--bl-ia-border);
  margin-bottom: 4px;
}

.bl-ia-card {
  display: flex;
  gap: 8px;
  background: var(--bl-ia-surface);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid var(--bl-ia-border);
}

.bl-ia-card-img {
  width: 52px;
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--bl-ia-blue) 22%, var(--bl-ia-surface)), var(--bl-ia-plate));
  flex-shrink: 0;
}

.bl-ia-card-lines {
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  min-width: 0;
}

.bl-ia-line {
  display: block;
  height: 6px;
  border-radius: 3px;
  background: var(--bl-ia-line);
  width: 100%;
}

.bl-ia-line-sm { width: 40%; }
.bl-ia-line-mid { width: 70%; }

.bl-ia-row, .bl-ia-profile-head {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bl-ia-surface);
  border: 1px solid var(--bl-ia-border);
  border-radius: 8px;
  padding: 8px;
}

.bl-ia-row-thumb {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--bl-ia-blue) 22%, var(--bl-ia-surface)), var(--bl-ia-plate));
  flex-shrink: 0;
}

.bl-ia-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bl-ia-line);
  flex-shrink: 0;
}

.bl-ia-avatar-lg {
  width: 40px;
  height: 40px;
}

.bl-ia-menu-row {
  background: var(--bl-ia-surface);
  border: 1px solid var(--bl-ia-border);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 11px;
  color: var(--bl-ia-sec);
}

.bl-ia-tabbar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--bl-ia-border);
  background: var(--bl-ia-surface);
  padding: 6px 4px 8px;
}

.bl-ia-tab {
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 2px;
  font-size: 10px;
  font-weight: 500;
  color: var(--bl-ia-muted);
  cursor: pointer;
  border-radius: 8px;
  transform: scale(1);
  transition: transform 160ms var(--bl-ia-ease), color 160ms var(--bl-ia-ease);
}

.bl-ia-tab:active { transform: scale(0.97); }
.bl-ia-tab:focus-visible {
  outline: 2px solid var(--bl-ia-blue);
  outline-offset: 1px;
}
.bl-ia-tab.is-active { color: var(--bl-ia-ink); }

@media (hover: hover) and (pointer: fine) {
  .bl-ia-tab:hover { color: var(--bl-ia-ink); }
}

.bl-ia-detail {
  min-width: 0;
}

.bl-ia-detail-inner {
  animation: bl-ia-in 180ms var(--bl-ia-ease) both;
}

.bl-ia-job {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bl-ia-ter);
}

.bl-ia-detail-title {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.3px;
  line-height: 1.2;
  color: var(--bl-ia-ink);
  font-family: var(--font-sans-medium, var(--font-sans));
}

.bl-ia-detail-why {
  margin: 0 0 14px;
  font-size: 15px;
  line-height: var(--lh-body, 1.65);
  color: var(--bl-ia-sec);
}

.bl-ia-connects {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--bl-ia-muted);
}

.bl-ia-schema-intro {
  margin: 28px 0 16px;
  font-size: var(--fs-body, 15px);
  line-height: var(--lh-body, 1.72);
  letter-spacing: 0.1px;
  color: var(--bl-ia-sec);
}

.bl-ia-schema {
  display: grid;
  grid-template-columns: minmax(200px, 260px) 1fr;
  gap: 28px;
  align-items: center;
}

.bl-ia-listing {
  background: var(--bl-ia-surface);
  border: 1px solid var(--bl-ia-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04);
}

.bl-ia-listing-img {
  height: 92px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--bl-ia-blue) 28%, var(--bl-ia-surface)), var(--bl-ia-plate));
}

.bl-ia-listing-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bl-ia-listing-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.bl-ia-listing-price {
  font-size: 15px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
  color: var(--bl-ia-ink);
  font-family: var(--font-sans-medium, var(--font-sans));
}

.bl-ia-listing-badge {
  font-size: 11px;
  font-weight: 500;
  color: var(--bl-ia-blue);
  background: var(--bl-ia-plate);
  border-radius: 4px;
  padding: 3px 7px;
}

.bl-ia-listing-line {
  margin: 0;
  font-size: 13px;
  color: var(--bl-ia-sec);
}

.bl-ia-listing-meta {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--bl-ia-muted);
}

.bl-ia-notes {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bl-ia-notes li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
  line-height: 1.45;
}

.bl-ia-note-title {
  font-weight: 500;
  color: var(--bl-ia-ink);
}

.bl-ia-note-sep {
  color: var(--bl-ia-muted);
}

.bl-ia-note-why {
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
  .bl-ia-preview,
  .bl-ia-detail-inner {
    animation: bl-ia-fade 180ms ease both;
  }
  .bl-ia-tab {
    transition: color 160ms ease;
  }
  .bl-ia-tab:active { transform: none; }
}

@keyframes bl-ia-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 700px) {
  .bl-ia-plate { padding: 16px; }
  .bl-ia-stage,
  .bl-ia-schema {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .bl-ia-phone {
    max-width: 280px;
    margin: 0 auto;
    width: 100%;
  }
}
`;
