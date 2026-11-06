/**
 * The Structure — static sitemap in the case-study type.
 *
 * Same beats as the copy: four channels fold into BruinLease, List
 * stays in the header, browse / save / message became the tabs.
 * Screens stack under each job so the flow fits at every width —
 * a horizontal “Search → Listing → Save” overflowed the column.
 *
 * Helvetica Neue, solid plate, hairlines. ASCII-table structure
 * (aligned columns, type, arrows) without the mono / dashed chrome.
 */

const SOURCES = ["Facebook", "Reddit", "Instagram", "Texts"] as const;

const JOBS = [
  {
    job: "Browse",
    tab: "Home",
    flow: ["Search", "Listing", "Save"],
  },
  {
    job: "Save",
    tab: "Saved",
    flow: ["Bookmarks", "Listing"],
  },
  {
    job: "Message",
    tab: "Chat",
    flow: ["Inbox", "Thread"],
  },
  {
    job: "Profile",
    tab: "Profile",
    flow: ["Listings", "Settings"],
    sequential: false,
  },
] as const;

export default function BruinLeaseIAMap() {
  return (
    <figure className="bl-ia" aria-label="How the hop across platforms became BruinLease">
      <style>{CSS}</style>
      <div className="bl-ia-plate">
        <ul className="bl-ia-from">
          {SOURCES.map((name) => (
            <li key={name}>
              <Cross />
              <s>{name}</s>
            </li>
          ))}
        </ul>

        <p className="bl-ia-arrow" aria-hidden>
          <ArrowDown />
        </p>

        <div className="bl-ia-app">
          <span className="bl-ia-app-name">BruinLease</span>
          <span className="bl-ia-arrow bl-ia-arrow-h" aria-hidden>
            <ArrowRight />
          </span>
          <span className="bl-ia-list">
            <span>List</span>
            <em>header</em>
          </span>
        </div>

        <p className="bl-ia-arrow bl-ia-into" aria-hidden>
          <ArrowDown />
        </p>

        <div className="bl-ia-fan" aria-hidden>
          <span className="bl-ia-fan-rail" />
        </div>

        <ul className="bl-ia-jobs">
          {JOBS.map((j) => {
            const sequential = !("sequential" in j && j.sequential === false);
            return (
              <li key={j.tab}>
                <div className="bl-ia-head">
                  <span className="bl-ia-job">{j.job}</span>
                  {j.job !== j.tab ? <span className="bl-ia-tab">{j.tab}</span> : null}
                </div>
                <ol className="bl-ia-flow">
                  {j.flow.map((step, i) => (
                    <li key={step}>
                      {i > 0 && sequential ? (
                        <span className="bl-ia-sep" aria-hidden>
                          <ArrowDown />
                        </span>
                      ) : null}
                      {step}
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}

function Cross() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
      <path
        d="M1.5 1.5l5 5M6.5 1.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden>
      <path
        d="M4.5 1v7.2M2.1 6.4L4.5 10l2.4-3.6"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="11" height="9" viewBox="0 0 11 9" aria-hidden>
      <path
        d="M1 4.5h7.2M6.4 2.1L10 4.5 6.4 6.9"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

const CSS = `
.bl-ia{
  --bl-ia-ink: var(--color-text-primary);
  --bl-ia-mute: var(--color-text-tertiary);
  --bl-ia-line: color-mix(in srgb, var(--color-text-primary) 16%, transparent);
  --bl-ia-blue: var(--color-ucla-blue);
  --bl-ia-wrong: #C62828;
  margin: 8px 0 0;
  color: var(--bl-ia-ink);
  -webkit-font-smoothing: antialiased;
}
.bl-ia-plate{
  margin: 0;
  padding: 24px 16px 22px;
  background: var(--color-placeholder);
  border: 1px solid var(--bl-ia-line);
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.1px;
  line-height: 1.35;
  overflow: hidden;
  container-type: inline-size;
}

.bl-ia-from,
.bl-ia-jobs,
.bl-ia-flow{
  list-style: none;
  margin: 0;
  padding: 0;
}
.bl-ia-from{
  display: grid;
  grid-template-columns: auto auto;
  justify-content: center;
  justify-items: start;
  gap: 4px 18px;
}
.bl-ia-from li{
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--bl-ia-wrong);
}
.bl-ia-from s{
  text-decoration: line-through;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  color: var(--bl-ia-mute);
}

.bl-ia-arrow{
  display: flex;
  justify-content: center;
  margin: 10px 0;
  color: var(--bl-ia-blue);
  line-height: 0;
}
.bl-ia-arrow-h{
  margin: 0;
  flex-shrink: 0;
}

.bl-ia-app{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.bl-ia-app-name{
  font-family: var(--font-sans-medium);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: var(--bl-ia-blue);
}
.bl-ia-list{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
}
.bl-ia-list em{
  font-style: normal;
  font-size: 11px;
  color: var(--bl-ia-mute);
}

.bl-ia-fan{ display: none; }

.bl-ia-jobs{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 12px;
  margin-top: 2px;
}
.bl-ia-jobs > li{
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
}
.bl-ia-head{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  min-width: 72px;
  border-bottom: 1px solid var(--bl-ia-line);
}
.bl-ia-job{
  font-family: var(--font-sans-medium);
  font-weight: 500;
  color: var(--bl-ia-blue);
}
.bl-ia-tab{
  font-size: 12px;
  color: var(--bl-ia-mute);
}
.bl-ia-flow{
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-text-secondary);
}
.bl-ia-flow li{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bl-ia-sep{
  display: flex;
  justify-content: center;
  margin: 3px 0;
  color: var(--bl-ia-blue);
  line-height: 0;
}

@container (min-width: 400px){
  .bl-ia-from{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 20px;
  }
}

@container (min-width: 460px){
  .bl-ia-arrow{ margin: 12px 0; }
  .bl-ia-into{ margin-bottom: 0; }

  .bl-ia-fan{
    display: block;
    position: relative;
    height: 12px;
    width: 100%;
  }
  .bl-ia-fan-rail{
    position: absolute;
    left: 12.5%;
    right: 12.5%;
    top: 0;
    border-top: 1px solid var(--bl-ia-blue);
  }

  .bl-ia-jobs{
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px 12px;
  }
  .bl-ia-jobs > li{
    padding-top: 12px;
    position: relative;
  }
  .bl-ia-jobs > li::before{
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 12px;
    background: var(--bl-ia-blue);
    transform: translateX(-0.5px);
  }
}

@media (min-width: 768px){
  .bl-ia-plate{ padding: 32px 24px 28px; }
}
`;
