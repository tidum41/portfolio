# Dialogue product tokens (t384)

**Source of truth:** live study-chat `getComputedStyle` measurements on
`research.dialogueai.com` (Insights summary → Study chat open with a response).

Measurement dump (agent uploads only — **do not commit** screenshots/JSON):

- `/home/ubuntu/.cursor/projects/workspace/uploads/measurements_6731.md`
- Raw JSON siblings in the same uploads folder
- Reference grabs: `chat-01-top.png`, `devtools-assistant-body-computed.png`
  (intended path `dialogue-tokens/chat/`; keep out of git)

These override earlier Paper/static-export token guesses (including the old
16/24 panel body and 392px width).

## Panel chrome

| Token | Value |
|-------|-------|
| Width × height | ~**448** × **658** CSS px (measured 447.78 × 658) |
| Border | 1px solid `#e7e5e4` |
| Radius | **24px** |
| Background | `rgb(252,251,249)` / `#fcfbf9` |
| Padding | **28px** |
| Inner gap | **16px** |
| Font | DM Sans; `letter-spacing: normal` |

## Text roles

| Role | size / weight / leading | color | Notes |
|------|-------------------------|-------|-------|
| Assistant body | 14 / 400 / 24 | `#1c1917` | No bubble; full width; `p` margin-bottom 16 |
| User bubble | 14 / 400 / 24 | `#1c1917` | Pad 8×16, radius 16, bg `#f1eeea`, right-aligned |
| Header title (“Study chat”) | 14 / 500 / 20 | `#1c1917` | Also in-response h2/h3 |
| Header subtitle | 12 / 400 / 16 | `#57534d` | Case-study may keep study name |
| Beta badge | 12 / 500 / 16 | `#1c1917` | Pad 2×8, radius 8, bg `#f1eeea` |
| Minimize | 36×36 hit | `#1c1917` | Hairline rule under header |
| Composer | 14 / 400 / 20 placeholder | muted | Pad 12, r14, border `#e5e7eb`; send 36×36 |
| Bold / `strong` | 14 / **600** / 24 | `#1c1917` | Product UI only; site chrome may still cap 500 |
| Quote header | 14 / 400 / 20 | `#57534d` | |
| Quote body | 14 / 400 / **22.75** | `#1c1917` | Card radius 14, bg `#f8f6f3` |
| Status pill | 14 / 400 / 20 mono | `#57534d` | Pad 8×16, radius 14, 1px border |
| Suggestion | 14 / 500 / 20 | `rgb(116,116,116)` | Pad 8×12, radius 8, gap 8 |
| Chart label | 12 / 400 / 16 | `#57534d` | **Not measurable** in t384 (no chart in response). Uses Dialogue’s small role. |

## Code map

| File | Role |
|------|------|
| `components/dialogue/product/tokens.ts` | Typed tokens + `dialogueTextRoles` |
| `components/dialogue/product/tokens.css` | CSS variables on `.dialogue-product-root` |
| `components/dialogue/product/dialogue-product.css` | Component role wiring |
| `ScaledChatViewport` / `DialogueProductFigure` | Inner width **448**; scale as one unit |

## Parity QA

```bash
npm run build && npm run start -- -p 3020
# Side-by-side + computed-style diff (0 mismatches on size/lh/weight/pad/radius):
node scripts/verify-dialogue-t384-tokens.mjs
```

Outputs: `/cursor/stores/self/parity/t384-*`
