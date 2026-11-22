# JOOLA Wholesale live prototype

Vite + React + TypeScript interactive prototype of the JOOLA B2B wholesale order portal (distributor view + JOOLA sales admin). Illustrative demo data only. Real wholesale figures cannot be disclosed.

## Run

```bash
cd live
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build && npm run preview
```

## DialKit playground

Controls use [DialKit](https://github.com/joshpuckett/dialkit) (`dialkit` + `motion`). The panel is collapsible (bottom-right). It is **not** mounted when `?clean=1` (for screenshots).

| Control | Purpose |
| --- | --- |
| View | Distributor portal / JOOLA sales admin |
| Screen | Navigate to a screen |
| State | default, loading, empty, error, syncing, success, offline, break-ui fixtures |
| Latency | Mock API delay (ms) |
| Failure rate | Random mock failures (0 to 1) |
| Account | Dick's / Baseline / Courtside |
| Pause | Hold pending requests, freeze animations, keep toasts open |
| Step forward | Release one paused event |
| Replay | Re-run the current screen load |

URL sync example:

`?view=portal&screen=cart&state=loading&account=dicks&latency=450&fail=0`

Admin:

`?view=admin&screen=approvals&state=default`

## Structure

Screens and UI live under `src/screens` and `src/components` so Paper export follow-ups can retarget layout without rewriting data. Mock API: `src/api/mock.ts` + pause clock `src/api/clock.ts`. Seed data: `src/data/ledger.ts`.
