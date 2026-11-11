# Prototype surfaces (Emil Kowalski `prototype` skill)

Isolated exploration only. **Nothing here is imported by production screens.**

| Route | Piece | Status |
| --- | --- | --- |
| `/prototypes/approval-queue` | Admin approval queue | Ledger, Triage card, Split inbox. Keys 1–3. `protoState` forces default, empty, approve-override, reject-with-reason, loading. Not promoted |
| `/prototypes/quick-order-row` | Quick-order compact row | Owned by `cursor/qo-line-playground`. Do not edit this route here |

Picker chrome is copied verbatim from `.agents/skills/prototype/PICKER.md`.

When the variants doc lands: one file per named variant + harness, real mock data, working interactions, Emil craft bar (ease-out, &lt;300ms, transform/opacity, reduced motion). Screenshots → `artifacts/prototypes/`. Compare to Paper captures in `artifacts/paper-variants/`. Do not promote; Mudit picks.
