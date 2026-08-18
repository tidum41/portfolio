# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **Next.js 16 (App Router, Turbopack) portfolio site** (`muditm`, muditm.com), written in TypeScript and managed with **npm**. Content is served from **hosted Sanity Cloud** (project `9vl5qk61`, dataset `production`); there is no local database. Scripts live in `package.json` (`dev`, `build`, `start`, `typecheck`, `studio`, `seed:sviz`).

Non-obvious caveats:

- **`.env.local` is required to run the app.** The Sanity client (`lib/sanity/client.ts`) reads `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`, falling back to a bogus `placeholder` project. Without the env file, every page returns HTTP 500 with `Dataset "production" not found for project ID "placeholder"`. The startup/update script creates `.env.local` (with the public IDs `9vl5qk61` / `production`, which are also hardcoded in `sanity.config.ts`) if it is missing. `.env.local` is gitignored, so it does not persist via git.
- **Dev server:** `npm run dev` serves on port **3000** (`/`, `/about`, `/playground`, `/ucla-sublease`, `/sviz`, `/studio`, and dev-only `/dev`).
- **Lint is broken:** `npm run lint` runs `next lint`, which was removed in Next.js 16, so it errors with `Invalid project directory ... /workspace/lint`. Use `npm run typecheck` (`tsc --noEmit`) as the working quality gate.
- **`/studio`** (embedded Sanity Studio) logs a harmless React 19 SSR `TypeError: Cannot read properties of null (reading 'useSyncExternalStore')` during server render but still returns 200 and renders client-side.
- **`start-dev.sh`** is a machine-specific helper with hardcoded local paths and port 3005; ignore it and use `npm run dev`.
- Mux videos, PostHog analytics, and external iframe demos are optional external services; the site works without them.
