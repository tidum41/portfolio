# AGENTS.md

## Cursor Cloud specific instructions

Single Next.js 16 app (App Router, Turbopack, React 19) — Mudit Mahajan's design
portfolio. Content is backed by **Sanity Cloud** (no local database) and videos by
**Mux**, so full end-to-end rendering requires outbound HTTPS to `*.sanity.io` and
`image.mux.com`.

### Running

- Dev server: `npm run dev` (port **3000**). Standard commands live in `package.json`.
- The homepage and `/playground` fetch from Sanity at request time. If the Sanity
  client can't resolve a real project, those routes return **HTTP 500** ("Dataset
  production not found for project ID placeholder"). Case-study pages (`/ucla-sublease`,
  `/sviz`) and `/about` have static fallbacks and render regardless.

### Required env (`.env.local`, gitignored)

The runtime Sanity client (`lib/sanity/client.ts`) defaults to a bogus `placeholder`
project id unless these are set. Create `.env.local` (the values are public — the same
project id is hardcoded in `sanity.config.ts`):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=9vl5qk61
NEXT_PUBLIC_SANITY_DATASET=production
```

Restart the dev server after creating/editing `.env.local`. Optional-only vars
(PostHog, `SANITY_WRITE_TOKEN` for the dev-only `/dev` editor and seed scripts) are not
needed to run or browse the site.

### Lint / typecheck

- `npm run typecheck` (`tsc --noEmit`) works and is the reliable check.
- `npm run lint` is **broken** in this repo: it runs `next lint`, which was removed in
  Next 16, so it errors with `Invalid project directory ... /lint`. The legacy
  `.eslintrc.json` is also incompatible with the installed ESLint 9 flat-config CLI.
  Use `typecheck` for verification until the project migrates to `eslint.config.js`.

### Notes

- `start-dev.sh` / `.claude/launch.json` reference a local macOS path and port 3005 —
  ignore them; use `npm run dev`.
- The "N Issue(s)" badge and dev toolbar in the bottom corner are dev-only tooling
  (agentation / dialkit), not app errors.
