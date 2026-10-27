import type { Metadata } from "next";
import type { CSSProperties } from "react";
import data from "@/lib/dialogue/token-audit/data.json";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Dialogue light-token audit (internal)",
};

type Flag = [string, string];
type Row = {
  path: string;
  prop: string;
  value: string;
  token: string | null;
  text?: string;
  contrast?: number;
  bg?: string;
  font?: string;
  drift?: string;
  flags: Flag[];
};
type Theme = "light" | "dark";
type Version = "ref" | "p3" | "p4";

const VERSIONS: Version[] = ["ref", "p3", "p4"];
const THEMES: Theme[] = ["light", "dark"];
const D = data as unknown as {
  versions: Record<Version, string>;
  labels: Record<string, string>;
  summary: Record<Version, Record<string, Record<string, number> | number>>;
  components: Record<string, Record<Version, Record<Theme, Row[]>>>;
  static: Record<Version, { file: string; line: number; rule: string; text: string }[]>;
  p3Dark: { uncovered: string[]; rawDark: { token: string; value: string }[] };
};

/* Site tokens only: --font-sans, --color-*, --space-*, --radius-*; cherry (--dp-brand value) is the single highlight. */
const page: CSSProperties = {
  fontFamily: "var(--font-sans)",
  color: "var(--color-text-primary)",
  background: "var(--color-bg)",
  padding: "var(--space-5) var(--space-4)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-5)",
};
const h1: CSSProperties = { fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.75rem", margin: 0 };
const h2: CSSProperties = { fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.375rem", margin: 0 };
const muted: CSSProperties = { color: "var(--color-text-secondary)", fontSize: "0.875rem", margin: 0 };
const grid3: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-3)" };
const well = (theme: Theme): CSSProperties => ({
  background: theme === "light" ? "#f7f7f5" : "#1b1e21",
  borderRadius: "var(--radius-control)",
  padding: "var(--space-2)",
});
const red = "#b43f7f";
const table: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" };
const cell: CSSProperties = { textAlign: "left", padding: "var(--space-1) var(--space-1)", borderBottom: "0.0625rem solid var(--color-border-subtle)", verticalAlign: "top" };
const mono: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.75rem" };

function count(v: Version, t: Theme | "static") {
  const s = D.summary[v][t] as Record<string, number>;
  return Object.values(s).reduce((a, b) => a + b, 0);
}

function Flags({ flags }: { flags: Flag[] }) {
  if (!flags.length) return <span style={muted}>ok</span>;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {flags.map(([k, m]) => (
        <li key={k + m} style={{ color: red }}>
          <strong>{D.labels[k] ?? k}</strong>: {m}
        </li>
      ))}
    </ul>
  );
}

function Swatch({ value }: { value: string }) {
  return (
    <span
      aria-hidden
      style={{ display: "inline-block", width: "0.75rem", height: "0.75rem", borderRadius: "var(--radius-xs)", background: value, border: "0.0625rem solid var(--color-border-subtle)", marginRight: "0.375rem", verticalAlign: "middle" }}
    />
  );
}

function ComponentBlock({ id }: { id: string }) {
  const c = D.components[id];
  return (
    <section id={id} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <h2 style={h2}>{id}</h2>
      {THEMES.map((theme) => (
        <div key={theme} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <p style={muted}>{theme === "light" ? "Light mode" : "Dark mode"}</p>
          <div style={grid3}>
            {VERSIONS.map((v) => {
              const rows = c[v][theme];
              const n = rows.reduce((a, r) => a + r.flags.length, 0);
              return (
                <figure key={v} style={{ margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                  <figcaption style={{ fontSize: "0.8125rem", display: "flex", justifyContent: "space-between" }}>
                    <span>{D.versions[v]}</span>
                    <span style={{ color: n ? red : "var(--color-text-secondary)" }}>{n ? `${n} flags` : "no flags"}</span>
                  </figcaption>
                  <div style={well(theme)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/dialogue/token-audit/${id}--${v}--${theme}.png`} alt={`${id}, ${D.versions[v]}, ${theme}`} style={{ width: "100%", height: "auto", display: "block" }} />
                  </div>
                </figure>
              );
            })}
          </div>
        </div>
      ))}
      <details open>
        <summary style={{ fontSize: "0.875rem", cursor: "pointer" }}>Property → token, light mode first (b056865 · P3 · P4)</summary>
        {THEMES.map((theme) => (
          <table key={theme} style={{ ...table, marginTop: "var(--space-2)" }}>
            <thead>
              <tr>
                <th style={cell}>{theme}</th>
                <th style={cell}>Property</th>
                {VERSIONS.map((v) => (
                  <th key={v} style={cell}>{D.versions[v]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(VERSIONS.flatMap((v) => c[v][theme].map((r) => `${r.path}|${r.prop}`)))).map((key) => {
                const [path, prop] = key.split("|");
                const per = VERSIONS.map((v) => c[v][theme].find((r) => r.path === path && r.prop === prop));
                if (!per.some((r) => r && (r.flags.length || r.drift))) return null;
                return (
                  <tr key={key}>
                    <td style={{ ...cell, ...mono }}>{path.split(" > ").pop()}</td>
                    <td style={cell}>{prop}</td>
                    {per.map((r, i) => (
                      <td key={i} style={cell}>
                        {r ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <span style={mono}><Swatch value={r.value} />{r.token ?? "no token"}</span>
                            {r.contrast != null && <span style={muted}>{r.contrast}:1</span>}
                            {r.drift && <span style={{ color: red }}>Drift from {r.drift}</span>}
                            <Flags flags={r.flags} />
                          </div>
                        ) : (
                          <span style={muted}>not rendered</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </details>
    </section>
  );
}

export default function DialogueTokenAuditPage() {
  const ids = Object.keys(D.components);
  return (
    <main style={page}>
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <h1 style={h1}>Dialogue product UI: light-token audit</h1>
        <p style={muted}>
          Each /dialogue/ds-parity component rendered at b056865 (reference), the P3 pass on localhost (4bfc4c4) and P4 (PR #159, 5e6deae), on the case-study figure well. Token = the --dp/--ds role whose resolved value matches the computed value on that root. Static counts come from check:dialogue-system.
        </p>
      </header>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h2 style={h2}>Summary</h2>
        <table style={table}>
          <thead>
            <tr>
              <th style={cell}>Version</th>
              <th style={cell}>Light flags</th>
              <th style={cell}>Dark flags</th>
              <th style={cell}>check:dialogue-system</th>
              <th style={cell}>Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {VERSIONS.map((v) => (
              <tr key={v}>
                <td style={cell}>{D.versions[v]}</td>
                <td style={{ ...cell, color: count(v, "light") ? red : undefined }}>{count(v, "light")}</td>
                <td style={{ ...cell, color: count(v, "dark") ? red : undefined }}>{count(v, "dark")}</td>
                <td style={{ ...cell, color: (D.summary[v].staticTotal as number) ? red : undefined }}>
                  {(D.summary[v].staticTotal as number) ? `FAILED, ${D.summary[v].staticTotal}` : "OK"}
                </td>
                <td style={{ ...cell, ...mono }}>
                  {(["light", "dark", "static"] as const).map((t) => (
                    <div key={t}>
                      {t}: {Object.entries(D.summary[v][t] as Record<string, number>).map(([k, n]) => `${D.labels[k] ?? k} ${n}`).join(" · ") || "none"}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={muted}>
          P3 theme pair: {D.p3Dark.rawDark.length} dark values are raw hex written straight onto role tokens (no DS raw layer behind them), and {D.p3Dark.uncovered.length} colour roles have no dark value at all, so they keep their light value next to light text: {D.p3Dark.uncovered.join(", ")}.
        </p>
        <nav style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", fontSize: "0.875rem" }}>
          {ids.map((id) => (
            <a key={id} href={`#${id}`} style={{ color: "var(--color-text-primary)" }}>{id}</a>
          ))}
          <a href="#static" style={{ color: "var(--color-text-primary)" }}>static checks</a>
        </nav>
      </section>

      {ids.map((id) => (
        <ComponentBlock key={id} id={id} />
      ))}

      <section id="static" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h2 style={h2}>check:dialogue-system, raw colour, fallback, font and allowlist hits</h2>
        <div style={grid3}>
          {VERSIONS.map((v) => (
            <div key={v} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <p style={{ margin: 0, fontSize: "0.875rem" }}>{D.versions[v]}</p>
              {D.static[v].filter((p) => ["raw-color", "token-fallback", "font", "allowlist"].includes(p.rule)).map((p) => (
                <div key={`${p.file}:${p.line}:${p.rule}`} style={{ fontSize: "0.75rem", borderBottom: "0.0625rem solid var(--color-border-subtle)", paddingBottom: "0.25rem" }}>
                  <span style={{ color: red }}>{p.rule}</span> <span style={mono}>{p.file.replace(/^.*\//, "")}:{p.line}</span>
                  <div style={{ ...mono, color: "var(--color-text-secondary)", wordBreak: "break-word" }}>{p.text}</div>
                </div>
              ))}
              {!D.static[v].length && <span style={muted}>OK, no problems</span>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
