# Dialogue iterations

Distinct rounds only. No per-patch entries. Newest first. Previews are behind Vercel auth. Each URL is the deployment of the commit named in its entry, or of the tip of the push that carried it where noted.

## r24, Oct 23 2026 (text chart reverted, library and anatomy fixes)
- Changed: designed charts back in product figures (r23 palette kept), hero hover restored, question bubbles on the lead compare with a bar chart on the chosen card, anatomy zoomed with real-size labels, lightbox fits the viewport, Paper avatar on Dialogue transcript rows, Phosphor pros and cons icons, a busier first draft for the dropoff pair, new chart title treatment, equal-height concentric library frames.
- Why: Mudit's r24 notes, ledger DLG-99 to DLG-113.
- Preview: none, local build only (no [preview] tag)

## r23, Oct 23 2026 (color pass)
- Changed: chart fills limited to stone-500 plus cherry, stacked bars on stone-500 and stone-600 with white labels, 1px stone-200 card border in light mode, product figures show Dialogue's own text chart (dark block and markdown table) instead of designed charts.
- Why: Mudit's r23 color pass, ledger DLG-95 to DLG-98.
- Preview: none, local build only (no [preview] tag)

## r22, Oct 23 2026 (Agentation notes)
- Changed: skip labels centred in their circles, chart library judged by pro and con lists instead of status chips, full answer gets a lead, supporting and quote hierarchy. No chart colors changed.
- Why: Mudit's r22 notes, ledger DLG-92 to DLG-94.
- Preview: none, local build only (no [preview] tag)

## r20, Oct 23 2026 (Agentation notes on 160151d)
- Changed: anatomy callouts scale with the UI and the composer is DS height, interview player rebuilt from the Paper export with a mirrored skip back, chart library pairs now richer first draft versus simplified chosen, dot plot and stacked bar primitives for variety, DS button for Add to my plan.
- Why: Mudit's r20 notes, ledger DLG-86 to DLG-90.
- Preview: none, local build only (no [preview] tag)

## r19, Oct 22 2026 (Agentation notes)
- Changed: lead compare no longer clips and gets a calmer surface (two extension tokens), figures capped at 640px by scaling, chart titles on their own row, chart library near-miss specimens with numbered markers, thin-data "Add to my plan" copies a prompt, ClipCard accent bar removed, hero footer expand icon dropped.
- Why: Mudit's r19 notes, ledger DLG-79 to DLG-85 (his DLG-70 to 78).
- Preview: none, local build only (no [preview] tag)

## r18, Oct 22 2026 (polish)
- Changed: 390 anatomy shows all five parts, hero search step within two lines (chat column +24px, shorter copy at phone width), hero "-38% drop" tooltip back, transcript player black edge to edge, balanced wrap in the amber warning.
- Why: r18 audit of 3585bb6. DLG-70 to DLG-72.
- Preview: PREVIEW_URL (deployment of COMMIT_SHA)

## r17, Oct 22 2026 (restore plus DS conformance)
- Changed: restored trust signals (amber low-signal warning, evidence footer, "Ask this next study"), counter-evidence expander, Paper section-5 transcript and the anatomy search line, inline clip link and footer; hero aside is now quote rows plus the evidence footer; pill format, send button, focus border, chart-title gap and lead comparison type scale per plan.md; styles/dialogue-tokens.css (DS raw, role tokens, extension block) with the product CSS migrated; check:dialogue-tokens.
- Why: Mudit approved the r17 restore plan and the DS conformance audit. DLG-58 to DLG-69.
- Not restored: study view and hero layout (Mudit's follow-up). Lead comparison card keeps no footer.
- Preview: https://portfolio-q4ati66yx-mudits-projects-d560e6b3.vercel.app (deployment of 3585bb6, protected; check:dialogue-preview, check:annotate and check:site-mobile passed against it)
- Image: ![r17](img/r17-anatomy.webp) early left, now right.

## DLG-57, Oct 22 2026 (Agentation comment box typing)
- Changed: every window or document key listener (ruler mode, lightbox, project popup, quarter picker, bento gallery, motion lab) returns early for editable targets through lib/isEditableTarget, which reads composedPath. The toolbar stops typed characters in the capture phase so other tools' single-letter shortcuts cannot swallow them. check:annotate types the full alphabet, digits and punctuation into the comment box on /dialogue and /.
- Why: Mudit could not type some letters ("c") in the comment box. No site listener reproduces it; the Vercel preview toolbar binds "c" and is the likely source, so the guard is aimed at it. Unverified without a logged-in toolbar session.
- Preview: https://portfolio-dxba7y8op-mudits-projects-d560e6b3.vercel.app (deployment of 99022e7)
- Image: none this round.

## e7cd42c, Oct 22 2026 (Agentation on Dialogue)
- Changed: merged origin/review/agentation (PR #107, 8aa312e), taking its STD-09 over the earlier revert. Every Dialogue figure part (hero, anatomy, library pairs, counter-evidence, thin-data figure, quote player, lightbox) carries data-annotate="dialogue-<figure>/<part>". Kept our CaseStudyLightbox (live children), CaseStudyFigure narrow handling and the BruinLease caption stopgap, with their annotate attributes added.
- Why: Mudit wants Agentation on the Dialogue preview.
- Preview: https://portfolio-mb2mxeofa-mudits-projects-d560e6b3.vercel.app (deployment of 5ebac65, code identical to later script-only commits)
- Image: none this round.

## 40e417f, Oct 22 2026 (DLG-56 critique fixes)
- Changed: chat cards keep their full radius and shadow (16px room under uncropped cards in the shared scale viewport, clip margin at the sides), the empty chart slot is a 123px dashed placeholder at the hero chart height with the line centered in muted ink, the two source chips stay on one row at 390 (10px chip padding, 12px body padding at 600px and below) and wrap only at 360, caption confirmed visible at 390 and 360.
- Why: Mudit's DLG-56 critique of the screenshots. Cropped figures at 390 (hero, anatomy, full answer) still clip by design.
- Preview: https://portfolio-64yzxi9bb-mudits-projects-d560e6b3.vercel.app
- Image: none this round.

## 13b138e, Oct 22 2026 (DLG-56, after r15)
- Changed: the thin-data pair is now one full-width figure on the standard well, with one chat card (question, "2 of 24 interviews" panel, summary, two source chips, the held-back-chart line) and the caption "Thin data. A finding from two interviews must not reach a roadmap as a trend." New section lead, and a pointer under "One answer, start to finish". Chips use the DLG-48 owners. STD-09 was reverted on this branch (a separate agent builds it on review/agentation).
- Why: Mudit approved the replacement (DLG-56, DLG-20).
- Preview: https://portfolio-r010xatx8-mudits-projects-d560e6b3.vercel.app
- Image: none this round.

## 6bb5f1b, Oct 22 2026 (r15)
- Changed: merged origin/main (includes the mobile fixes from PR #106), closing line now reads "Limit: the chat has to hold summary, chart, and clips without feeling crowded." with the DLG-47 spacing kept, and the ledger records Needs Mudit 7 as done and 8 and 9 as declined. The BruinLease caption source is not edited yet.
- Why: Mudit approved my calls Oct 22, DLG-55 and BRL-01. The Sanity edit needs a write token this environment does not have.
- Preview: https://portfolio-1f4bxn31y-mudits-projects-d560e6b3.vercel.app
- Image: none this round.

## 80b31f8, Oct 22 2026 (r14)
- Changed: one owner per timestamp in every figure, one outlined pink Chosen tag, full-width counter-evidence, equal 32px lightbox well padding, 16px overlap on the 390 hero card, library intro trimmed to "Each pair puts the common choice next to mine, on the same data.", problem section figure removed, preview check extended (DLG-48 owners, DLG-52 hero overlap).
- Why: r13 audit and outside review, DLG-48 to DLG-54 and M11.
- Preview: https://portfolio-ow64oer70-mudits-projects-d560e6b3.vercel.app/dialogue (mudits-projects team preview, READY; `npm run check:dialogue-preview` passed against it)
- Image: none this round. The r13 entry's before and after image was removed because its "before" did not show the pre-r13 state.

## a3f5f0a, Oct 22 (r13)
- Changed: lightbox Close with fixed light-on-dark styling, quieter neutral pill outline in dark, hero sources grid filling its card, section spacing above the closing Outcome line, preview check extended (open-lightbox sweep, dark Close clicks, no-trigger assert, SELFTEST).
- Why: r13 audit, DLG-44 to DLG-47 and M10.
- Preview: https://portfolio-my31xb62i-mudits-projects-d560e6b3.vercel.app/dialogue (mudits-projects team preview, the only team this account can reach; READY)

## 226dd8d, Oct 22 (r12)
- Changed: lightbox portaled to document.body with Close anchored to the dialog corner (same 600px cutoff for BruinLease), theme-aware counter-evidence pills, hero sources as a 2x2, one caption token, 390 fixed-structure figure fits, preview check script.
- Why: r12 audit, DLG-31 and DLG-39 to DLG-43.
- Preview: https://portfolio-392868ixu-mudits-projects-d560e6b3.vercel.app (deployment of 226dd8d, protected; `npm run check:dialogue-preview` passed against it)
- Image: ![r12](img/r12-counter-dark.webp) dark counter-evidence after the fix; no before image because the audit preview of 695eaa3 could not be reopened.

## 56f4d73, Oct 22 (r11)
- Changed: theme-aware ink on figure wells, hero sources card with trimmed chat gaps, caption contrast, 600px lightbox cutoff, audit screenshots removed; the lightbox-above-header fix did not take on the preview (Close still hit the nav, fixed in r12).
- Why: r11 audit, DLG-31 to DLG-38.
- Preview: https://portfolio-ehe50danl-mudits-projects-d560e6b3.vercel.app (deployment of ea29e31, the tip that carried 56f4d73; code identical to later log-only commits)
- Image: ![r11](img/r11-hero.webp) hero before (r10) left, after right.

## 183a03d, Oct 22 (r10)
- Changed: transcript on a light card in the quote frame, lightbox safe area, opaque backdrop and hidden contents list, lightbox off at phone width, hero funnel at natural row spacing, BruinLease caption em dash normalised in code.
- Why: r10 audit (dark transcript 1.04:1, lightbox overlap, stretched funnel rows); DLG-07, DLG-15, STD-02.
- Preview: https://portfolio-fj7d2xfn2-mudits-projects-d560e6b3.vercel.app
- Image: ![r10](img/r10-dark-quote.webp) before (r9) left, after right.

## a3ce008, Oct 22 (r9, restore plus lightbox)
- Changed: quote player restored from 657337d with a still-aspect frame and blur box, hero thumbs 3 x 120px, figure well tokens in both themes, library specimens per brief, figure lightbox.
- Why: r9 audit, DLG-17 (Misses M5), DLG-13, DLG-15, DLG-18, DLG-19.
- Preview: https://portfolio-j0swh7ms0-mudits-projects-d560e6b3.vercel.app (tip 03b843b, includes a3ce008)
- Image: ![r9](img/a3ce008-quote.webp) before left, after right.

## 826bc80, Oct 22 (v2 build)
- Changed: straight hero, restored-style quote player, chart library, low-coverage compare, #EEEDEB wells, single-line search status.
- Why: dialogue-v2 brief, DLG-14 to DLG-20, DLG-26.
- Preview: https://portfolio-n6p0w6bow-mudits-projects-d560e6b3.vercel.app (tip 9f220ec, includes 826bc80)
- Image: ![v2](img/826bc80-hero.webp) after only, no before captured.
