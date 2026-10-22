# Dialogue iterations

Distinct rounds only. No per-patch entries. Newest first. Previews are behind Vercel auth. Each URL is the deployment of the commit named in its entry, or of the tip of the push that carried it where noted.

## DLG56BSHA, Oct 22 2026 (DLG-56 critique fixes)
- Changed: chat cards keep their full radius and shadow (16px room under uncropped cards in the shared scale viewport, clip margin at the sides), the empty chart slot is a 123px dashed placeholder at the hero chart height with the line centered in muted ink, the two source chips stay on one row at 390 (10px chip padding, 12px body padding at 600px and below) and wrap only at 360, caption confirmed visible at 390 and 360.
- Why: Mudit's DLG-56 critique of the screenshots. Cropped figures at 390 (hero, anatomy, full answer) still clip by design.
- Preview: DLG56BURL
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
