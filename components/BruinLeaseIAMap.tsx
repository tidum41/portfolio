/**
 * BruinLease information architecture — static sitemap.
 * The whole tree is visible. No interaction, no accent colors.
 */

const SOURCES = ["Facebook", "Reddit", "Instagram", "Texts"] as const;

const BRANCHES = [
  {
    tab: "Home",
    screens: ["Search", "Listing", "Save"],
  },
  {
    tab: "Saved",
    screens: ["Bookmarks", "Listing"],
  },
  {
    tab: "Chat",
    screens: ["Inbox", "Thread"],
  },
  {
    tab: "Profile",
    screens: ["Listings", "Settings"],
  },
] as const;

export default function BruinLeaseIAMap() {
  return (
    <div className="bl-ia">
      <style>{CSS}</style>
      <figure className="bl-ia-plate" aria-label="BruinLease information architecture">
        <ul className="bl-ia-from">
          {SOURCES.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>

        <div className="bl-ia-stem" aria-hidden />

        <div className="bl-ia-app">
          <p className="bl-ia-root">BruinLease</p>
          <p className="bl-ia-list">List</p>
        </div>

        <div className="bl-ia-fork" aria-hidden>
          {BRANCHES.map((branch) => (
            <span key={branch.tab} />
          ))}
        </div>

        <ul className="bl-ia-tree">
          {BRANCHES.map((branch) => (
            <li key={branch.tab} className="bl-ia-branch">
              <p className="bl-ia-tab">{branch.tab}</p>
              <ul>
                {branch.screens.map((screen) => (
                  <li key={screen}>{screen}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </figure>
    </div>
  );
}

const CSS = `
.bl-ia {
  --ia-ink: var(--color-text-primary);
  --ia-mute: var(--color-text-tertiary);
  --ia-line: color-mix(in srgb, var(--color-text-primary) 18%, transparent);
  margin-top: 8px;
  color: var(--ia-ink);
  font-family: var(--font-sans);
}

.bl-ia-plate {
  margin: 0;
  padding: 32px 20px 28px;
  background: var(--color-placeholder);
  border-radius: var(--radius-card);
}

.bl-ia-from,
.bl-ia-tree,
.bl-ia-branch ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.bl-ia-from {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 20px;
}

.bl-ia-from li {
  font-size: 12px;
  letter-spacing: -0.1px;
  color: var(--ia-mute);
  text-decoration: line-through;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.bl-ia-stem {
  width: 1px;
  height: 22px;
  margin: 12px auto 0;
  background: var(--ia-line);
}

.bl-ia-app {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 16px;
}

.bl-ia-root {
  margin: 0;
  font-family: var(--font-sans-medium, var(--font-sans));
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.2px;
}

.bl-ia-list {
  margin: 0;
  font-size: 12px;
  color: var(--ia-mute);
  letter-spacing: -0.1px;
}

.bl-ia-list::before {
  content: "";
  display: inline-block;
  width: 16px;
  height: 1px;
  margin-right: 8px;
  margin-bottom: 3px;
  background: var(--ia-line);
  vertical-align: middle;
}

.bl-ia-fork {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
  max-width: 560px;
  height: 16px;
  margin: 6px auto 0;
  position: relative;
}

.bl-ia-fork::before {
  content: "";
  position: absolute;
  top: 0;
  left: 12.5%;
  width: 75%;
  height: 1px;
  background: var(--ia-line);
}

.bl-ia-fork span {
  display: block;
  width: 1px;
  height: 16px;
  margin: 0 auto;
  background: var(--ia-line);
}

.bl-ia-tree {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 12px;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.bl-ia-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
}

.bl-ia-tab {
  margin: 0 0 10px;
  font-family: var(--font-sans-medium, var(--font-sans));
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.15px;
}

.bl-ia-branch ul {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bl-ia-branch li {
  font-size: 12px;
  letter-spacing: -0.1px;
  color: var(--ia-mute);
  line-height: 1.3;
}

@media (max-width: 767px) {
  .bl-ia-plate { padding: 24px 16px 22px; }
  .bl-ia-fork { display: none; }
  .bl-ia-tree {
    grid-template-columns: 1fr 1fr;
    max-width: none;
    row-gap: 22px;
    margin-top: 4px;
  }
  .bl-ia-branch {
    position: relative;
    padding-top: 12px;
  }
  .bl-ia-branch::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 12px;
    background: var(--ia-line);
  }
}
`;
