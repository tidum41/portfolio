# 003 — Document Instant vs Orchestrated nav contract

- **Status**: TODO
- **Commit**: 6f8d727
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files (`lib/instantNav.ts`, `components/AnimationProvider.tsx`, `components/PersistentWorkShell.tsx` comments only — no behavior change beyond aligning comments with plan 002)

## Problem

Three different “skip” mechanisms share vocabulary in comments and confuse executors:

1. **`markInstantBack`** — case-study Back; skip route fade **and** work `EntranceItem` animation; restore scroll.
2. **`markSoftNav`** — primary chrome + work→case-study warm; skip route fade **only**.
3. **`softReturnRef` (bug, fixed in plan 002)** — incorrectly treated soft primary return like instant-back for content.

Without a single written contract, the next performance pass will reintroduce “skip everything on keep-alive return” and recreate the pill-only feel.

Current flag API (`lib/instantNav.ts`):

```1:44:lib/instantNav.ts
// Flags for fast client navigations that should skip the route crossfade.
// Case-study Back uses instant-back (also restores scroll). Primary chrome
// (work / about / archive) and work→case-study (see lib/caseStudyNav.ts)
// use soft-nav so opacity crossfade doesn't compete with keep-alive shells
// or case-study EntranceStagger — durations themselves are unchanged.
// ...
/** Instant-back OR soft primary-nav — AnimationProvider skips the fade. */
export function peekSkipRouteFade(): boolean {
  return peekInstantBack() || peekSoftNav();
}
```

That file correctly describes fade-only soft-nav, but `PersistentWorkShell` soft-return comments disagree. `AnimationProvider` is fade-only (good).

## Target

Add a short, authoritative contract comment block (same text) at the top of `lib/instantNav.ts`, and point `AnimationProvider` + `PersistentWorkShell` at it. No new flags. No runtime API changes.

Paste this map into the `instantNav.ts` header (keep exact wording so future audits match):

```
Motion contract — Instant vs Orchestrated
==========================================
Layer A — Route opacity (AnimationProvider):
  - Soft-nav OR instant-back → skip fade (peekSkipRouteFade).
  - Soft-nav does NOT imply content is instant.

Layer B — Work shell content (PersistentWorkShell EntranceItem):
  - Instant: only peekInstantBack() on this arrival (CaseStudyTOC Back).
  - Orchestrated: all other returns to "/" (about, archive, nav work,
    browser back from primary chrome). Use ENTRANCE_DEFAULTS via EntranceItem.
  - Never fire intro-replay for Layer B soft returns.

Layer C — First-load intro (data-intro / IntroOrchestrator / HeroText / PS3Silk):
  - Cold "/" only (+ tab/BFCache intro-replay). Not used for SPA soft returns.

Layer D — Remounting chrome:
  - about, archive, case studies, PS3ControlPanel: remount → own entrance OK.
  - Keep-alive (silk, grid DOM, embeds): must not remount for perf.
```

Primary path table (for the comment — keep compact):

| From → To | Fade | Content entrance |
| --- | --- | --- |
| Cold `/` | — | Intro then grid stagger |
| `/` ↔ about / archive | soft skip | Dest remount Orchestrated; `/` keep-alive Orchestrated (post-002) |
| `/` → case study | soft skip | Case study Orchestrated |
| Case study Back → `/` | instant skip | Work Instant |
| Case study → `/` via nav | soft skip | Work Orchestrated |
| Tab return on `/` | — | intro-replay Orchestrated |

## Repo conventions to follow

- Flags live only in `lib/instantNav.ts`; case-study warm in `lib/caseStudyNav.ts` calls `markSoftNav`.
- Exemplar of fade-only soft skip: `components/AnimationProvider.tsx` lines 45–68.

## Steps

1. Expand the header comment in `lib/instantNav.ts` with the contract + table above. Keep existing function docs; make them reference “Layer A/B”.
2. In `components/AnimationProvider.tsx`, replace the soft-nav comment with one line: “Layer A only — see lib/instantNav.ts contract.”
3. In `components/PersistentWorkShell.tsx`, after plan 002’s docblock fix, add one line: “Layer B — Instant only when instantArrivalRef (peekInstantBack); see lib/instantNav.ts.”
4. Do not add a new markdown doc unless the repo already wants it; the code comment is the source of truth for executors.

## Boundaries

- Do NOT change runtime behavior in this plan (assumes plan 002 landed, or land 002 first).
- Do NOT add a third sessionStorage key.
- Do NOT change CaseStudyTOC or HalftoneNavLink call sites.

## Verification

- **Mechanical**: grep `softReturn` — should be gone after 002; grep `Layer B` in the three files.
- **Feel check**: none required (comments only) beyond re-running plan 002 feel checks if 002+003 land together.
- **Done when**: a new agent reading only `instantNav.ts` can state which paths are Instant vs Orchestrated without reading the audit chat.
