# Animation Plans

Plans from `improve-animations` audits. Each file is self-contained for an executor with zero chat context.

| # | Title | Severity | Status |
|---|-------|----------|--------|
| [001](001-theme-toggle-icon-crossfade.md) | ThemeToggle icon crossfade | LOW | DONE |
| [002](002-soft-return-work-entrance-replay.md) | Replay work entrance on about/archive → work | HIGH | TODO |
| [003](003-instant-vs-orchestrated-contract.md) | Document Instant vs Orchestrated nav contract | MEDIUM | TODO |
| [004](004-ps3-pill-return-chorus.md) | Align PS3 pill return with work entrance chorus | MEDIUM | TODO |
| [005](005-entrance-scroll-cohesion.md) | Scroll-reveal duration + dead blur claim | LOW | TODO |
| [006](006-herotext-soft-return-guard.md) | Guard HeroText soft-return double-motion | MEDIUM | TODO |

## Recommended execution order

1. **002** — feel-breaking; do first.
2. **006** — verify-only after 002 (comment; code only if hero still dead).
3. **004** — pill chorus after content entrance works.
4. **003** — comment contract once behavior matches (can land with 002).
5. **005** — polish; independent of 002–004.

Dependencies: `004` and `006` depend on `002`. `003` should reflect post-002 behavior.

## Instant vs Orchestrated map (primary nav)

| Path | Route fade (`AnimationProvider`) | Content entrance | Notes |
| --- | --- | --- | --- |
| Cold load `/` | — | **Orchestrated** intro (`data-intro` → HeroText timeline → grid after `intro-done`) | Rare delight; long timings OK |
| `/` → about / archive | **Soft skip** (`markSoftNav`) | Dest **Orchestrated** (remount `EntranceStagger` / BentoGallery) | Correct today |
| about / archive → `/` | **Soft skip** | **Orchestrated** keep-alive `EntranceItem` replay | **Broken today** — `softReturnRef` forces instant; only PS3 pill remount-animates → plan **002** |
| `/` → case study | **Soft skip** (`warmCaseStudyNav`) | Case study **Orchestrated** | Correct |
| Case study **Back** → `/` | **Instant skip** (`markInstantBack`) | Work **Instant** | **Keep** — scroll restore + no silk remount |
| Case study → `/` via nav “work” | **Soft skip** | Work **Orchestrated** | Same fix as about→work (002) |
| about ↔ archive | **Soft skip** | Both **Orchestrated** remount | Correct |
| Tab / BFCache return on `/` | — | **Orchestrated** `intro-replay` | Keep; not SPA soft return |

**Soft-nav ≠ soft-return.** Soft-nav only skips the opacity crossfade. Soft-return (buggy) incorrectly skipped work content entrance.

## What NOT to change

- **Keep-alive** `PersistentWorkShell` (`display:none`, `hasEverBeenActive`, silk/embed persistence, portal reparent).
- **Case-study Back** `markInstantBack` + instant `EntranceItem` + manual scroll restore.
- **Soft-nav** fade skip in `AnimationProvider` / `HalftoneNavLink` / `warmCaseStudyNav`.
- **PS3Silk** WebGL keep-mounted across client nav.
- **First-load** `introTimings` / intro gate (marketing-length by design).
- **Halftone nav morph** personality (hover; separate from route entrance).

## Audit snapshot (commit `6f8d727`)

### Prioritized findings

| # | Severity | Category | Location | Finding | Fix |
| --- | --- | --- | --- | --- | --- |
| 1 | HIGH | Purpose / cohesion | `PersistentWorkShell.tsx:220-232` | Soft return sets `instant` after first `/` visit → about/archive→work skips hero/grid entrance; only remounting PS3 pill moves | Plan 002 |
| 2 | HIGH | Cohesion | Docblock `PersistentWorkShell.tsx:164-174` vs soft-return code | Documented orchestrated replay contradicts implementation | Plan 002 + 003 |
| 3 | MEDIUM | Purpose | `HeroText.tsx:10-22` `_animated` | Can block inner hero replay; OK if wrapper EntranceItem owns soft return — guard against resetting for SPA return | Plan 006 |
| 4 | MEDIUM | Cohesion | `PS3ControlPanel.tsx` return fade | Pill remount entrance must stay in chorus with post-002 grid (opacity+small Y, shared 450ms / EASE_Y) | Plan 004 |
| 5 | LOW | Cohesion | `ScrollReveal.tsx` StaggerItem `0.7s`; Entrance comment claims blur | Duration drift + dead comment | Plan 005 |
| 6 | LOW | Performance | `HalftoneNavLink` FM `scale` shorthand | Main-thread under load; hover-only — defer | No plan (out of scope) |

### Missed opportunities (additive)

1. Soft-return work entrance (same as finding 1) — highest leverage.
2. Optional small translateY on PS3 return pill so it shares Entrance physicality (plan 004).
3. Do **not** add blur to every EntranceItem — comment was aspirational; blur is for bad crossfades only.

### Stack recon (for executors)

- Next App Router + Framer Motion (`AnimationProvider`, `EntranceItem`, `HeroText`).
- Tokens: `lib/motion.ts` (`EASE_OPACITY`, `EASE_Y`, `EASE_EXIT`, `ENTRANCE_DEFAULTS`) + CSS `--spring-panel`, `--expand-ease`.
- Personality: crisp portfolio; first-load intro may be long; SPA route entrances should stay ~0.45s stagger family.
- Frequency: primary nav (work/about/archive) is tens/day → must feel intentional but not intro-length; case-study Back is recovery → Instant correct.

## Notes

Plans generated from `improve-animations` + Emil design-eng bar + repo `review-animations` STANDARDS. Read-only audit; no source fixes in the advisor pass.
