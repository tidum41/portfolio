# Portfolio UX + product-design audit

**Date:** 2026-08-30  
**Lenses:** hiring-manager scan (8s), Swiss / editorial craft, Emil Kowalski motion/polish, standard product-design case-study thinking.  
**Evidence:** live audits at **1440×900**, **768×1024**, and **390×844** plus a full read of `/ucla-sublease` fallback copy and the work hero.

This pass is about *why people leave* and *what a PD hiring manager still cannot see*. The 2026-07 `DESIGN-AUDIT.md` is still right about grid, type roles, and motion. It scored case studies as “strong narratively.” That score was about the **editorial system** (750 column, TOC, type). This pass is about the **PD narrative**. Those are different jobs.

---

## 1. What shipped in this PR (code)

| Surface | Change | Why |
|---|---|---|
| Work hero | New headline that names **cognitive science × interface craft** and keeps the exact phrase `rabbit holes` | Recruiters could not file you in 3 seconds. The rabbit animation requires that substring. |
| Work hero | H1 column `50%` → `min(42rem, 72%)` | The new line is longer; 50% would wrap it into a wall and push cards down. |
| Work hero | `--hero-pt/pb` 80/64 → 64/48 desktop; **32/24 mobile** | First project must be a first-viewport object, not a sliver. |
| BruinLease fallbacks | Hero title, problem/insight H2s, four decision H2s, TOC labels renamed as *bets* | Staff-shaped defaults if Sanity fields are empty. **Live Studio copy still wins** when those fields are filled — paste the rewrite below into Sanity to see it on production. |

---

## 2. Cross-breakpoint scorecard

| Page | 1440 desktop | 768 tablet | 390 mobile | Verdict |
|---|---|---|---|---|
| **Work** | Cards *do* peek; bounce is **copy + competing atmosphere**, not a missing grid | 2-col holds; cards a bit tight; hero wrap OK | 1-col; first card ~50% visible before this PR; no scroll cue | Craft is high. First 8s does not say what to hire you for. |
| **BruinLease** | TOC is generic (“Design Decision 1–4”); 15+ screens; solution after four essays | TOC still on at 768 (switch is 767); stats 3-up is tight | No jump nav; ~4 scrolls before a designed screen that is not the hero phone; D1 stacks well | Looks like a staff case study. Reads like DES INV 1. |
| **About** | Bento crops awkwardly; thesis is warmer than the work hero | Bio column ~380px — cramped next to bento | Bio first (correct); “you can find me” and socials are not tappable proof | Personality is real. Work hero should steal this specificity, not the other way around. |

### Desktop 1440 — what we actually saw

- First viewport: Georgia headline + silk + JOOLA/UCLA line, then **BruinLease + All-in-one** cards. Work *is* visible. The earlier “must scroll 800px” finding was wrong.
- Bounce is not “no work.” Bounce is: **the H1 does not name a hireable niche**, silk + rabbit compete with the thesis, card titles are process-y (“Simplifying UCLA subleasing”), and the All-in-one tile shows personal todos (`record demo video for portfolio`) that read as unfinished.
- CD / habit popups are the craft proof. They should stay **below** the first case-study row in the scan path (they already are on desktop). Do not promote them.

### Tablet 768 — edge of the system

- 768 is the last pixel of the *desktop* layout (`max-width: 767` is mobile). TOC, 2-col work grid, 3-up stats, and about bio+bento all stay on. Nothing is broken.
- Tight, not broken: stats ~220px, about bio ~380px, work cards compressed. If you ever add a `md` band, **800–900** is where 3-up stats and about-bento should stack — not 768.

### Mobile 390 — functional, desktop-first

- No overflow. Hero wrap of `rabbit holes` holds. About order is bio → photos (correct).
- Case study has **no progress, no jump, no “skip to product.”** After problem + three stat tiles, Process is another text wall. That is the phone bounce.
- CD popup: X works; no sheet-style swipe-dismiss. Album tiles in the player are below a 44px thumb target.
- Hero padding was the real mobile work-page issue: too much air before the first card. Tightened in this PR.

---

## 3. Why people leave the work page

Hiring managers do not bounce because the silk is pretty. They bounce because **they cannot answer three questions in eight seconds:**

1. What kind of designer is this?  
2. What is the strongest piece of work?  
3. Should I click it?

| Before (live) | After (this PR + Sanity follow-ups) | Why |
|---|---|---|
| “a product designer with a love for people, curiosity, and rabbit holes” | “I design products at the intersection of **cognitive science and interface craft**, following rabbit holes” | Same warmth, a fileable niche. Attention / mental models / physical-digital is the actual intersection (UCLA cog sci + JOOLA + interaction toys). |
| H1 at 50% width, 80/64 hero padding | Wider measure, shorter hero, mobile 32/24 | More of BruinLease in the first viewport. The work *is* the CTA. |
| Card title: “Simplifying UCLA subleasing” | **Sanity:** “BruinLease” / sub “Quarter-native campus matching” | “Simplifying X” is the most common student-PD verb. The card should say the product and the wedge. |
| All-in-one preview shows your personal todos | Re-record the Mux loop with dummy tasks | Recruiters read “record demo video for portfolio” as the product being unfinished. |
| ~1.9s intro before nav/grid fully settle | Keep the rare delight; do **not** add more hero copy | Extra lines under the subtitle push work down. Credentials stay in the JOOLA · UCLA line. |

**Do not add:** a “selected work” heading, stat pills, or a resume CTA in the hero. Those are SaaS-portfolio tells. The index should stay quiet (Megan Phi / Leo). The fix is a sharper thesis + a sharper first card, not more chrome.

**Do add later (visual, not copy):**

1. Sanity project titles: product name first, wedge second.  
2. Re-shoot All-in-one so the loop is a designed dataset, not your week.  
3. Slightly stronger card-hover underlay (opacity-only is correct; video cards cannot scale).  
4. On mobile only, a 1px bottom fade or a few extra pixels of the first card — you now have the padding; the card itself must finish the sentence.

---

## 4. Home hero text

### Constraint

`RabbitHoleVideo` searches the H1 for the exact substring **`rabbit holes`**. Any rewrite that drops, hyphenates, or splits that phrase breaks the hop + Mux popup.

### What was wrong

The line performed *personality* and hid the hireable intersection in the subtitle. “Love for people, curiosity” is what every junior PD writes. Your actual niche is already on the site: **cognitive science (attention, mental models, decision) × interface craft (cards, quarters as a time primitive, coded prototypes) × physical-digital (JOOLA, CD, habit).** The About bio is more specific than the work hero. That is backwards.

### Shipped line

> I'm Mudit — I design products at the intersection of cognitive science and interface craft, following rabbit holes

Subtitle unchanged: `currently @ JOOLA · cognitive science at ucla`.

### Alternatives (if you want to tune voice)

1. **Attention-first:** “I'm Mudit, a product designer at the intersection of attention, mental models, and rabbit holes.”  
   Shorter. More academic. Less “what I do.”
2. **Embodied:** “I'm Mudit — I prototype how people perceive, decide, and move through products, following rabbit holes.”  
   Stronger verb. Longer wrap.
3. **Physical-digital:** “I'm Mudit. I design physical-digital products through cognitive science and rabbit holes.”  
   Best if JOOLA is the lead story. Weaker for BruinLease.

Keep the shipped line unless you want to lean harder into JOOLA hardware.

---

## 5. BruinLease — how to make it a staff-shaped case study

The page *looks* like a case study: TOC, stat tiles, phone mockups, tool logos, four “Design Decisions.” A recruiter who skims chrome will open it. A hiring manager who reads it will close it as **bootcamp template + good Figma.**

`sviz` is the contrast that should bother you. That page has a mechanism (“the barrier was the information architecture”), a real constraint (1.5× watchability), and an Impact section with outcomes. BruinLease has more PD *theater* and less PD *thinking*. Sanity already has an Impact group. This route never uses it.

### Artifact scorecard (standard PD process)

| Artifact | Status | What to do |
|---|---|---|
| Problem framing (who, JTBD, constraints, why now) | Weak | Name seeker vs lister, the 10-week quarter job, 5-week/PM/PMM scope, what you refused (payments, landlords, map). |
| Insight (not stats) | Weak | The two-sided sentence is the spine. Stats are symptoms. Add so-whats + 2 quotes. |
| Opportunity / HMW / principles | Missing | Wedge in one line. Three principles that justify the four bets. |
| Success metrics | Missing | Unlaunched is fine. “We wouldn’t know” is not. See table below. |
| Competitive / analog | Missing | **ULoop is a competitor, not a caption.** Facebook / ULoop / Reddit / wedge. |
| IA / flows | Missing | Seeker vs lister, 6–8 steps. Which side you designed first, and why. |
| Prioritization / cuts | Missing | Why these four bets. What you cut (map, payments, ranking). Credit PM / PMM with real work. |
| Decision structure | Weak | D1 has iterations. D2–D3 are ship notes. D4 shrugs at A/B. Need options → tradeoff → chose → evidence. |
| Usability / synthesis | Weak | 8 interviews, zero quotes, zero “we changed X after Y.” |
| Impact | Missing | Shipped prototype vs live market. Honest. |
| Reflection / judgment | Weak | R1 (badge with no variance is noise) is the only staff paragraph. Kill “next time I’d test.” |

### Student-coded vs staff-coded

| Student (current) | Staff (target) |
|---|---|
| “Simplifying UCLA subleasing” | A mechanism: quarters vs paragraphs; DMs vs fields |
| Method as H2 (“We surveyed 60…”) | Finding as H2 (“Seekers spray; listers starve”) |
| “Design Decision 1 / 2 / 3 / 4” | Named bets you would defend in a critique |
| “I added an independent layer” / “without additional fluff is important” | Chose / rejected / deferred / would kill |
| Process + tool logos as a section | Tools in metadata; process visible *inside* decisions |
| “I would love to A/B test” | Hypothesis + kill criterion |
| “If I could do it differently… large user audience” | “I shipped a badge that cannot fail, so I would ship it last” |
| Seekers, renters, listers, leasers | Two nouns, forever |
| UI regret (“flatter than I wanted”) | Product regret (badge, which side you under-built) |

### Recommended outline (reorder)

1. **Hero** — mechanism title (not “Simplifying…”).  
2. **Problem** — job, two sides, constraints, why now. Anecdote earns the problem; it is not the problem.  
3. **Landscape** — Facebook / ULoop / Reddit → wedge.  
4. **Insight** — 60/8, then the asymmetry as the H2. Stats as support.  
5. **Opportunity + principles + metrics + cuts** — half a page.  
6. **The product** — today’s Solution, *moved up*. One paragraph + the phone. Reviewers want the thing before four essays.  
7. **Flows** — seeker / lister.  
8. **Four bets** — same artifacts, new titles.  
9. **Impact / honesty**  
10. **Judgment** — 2–3 reflections at R1 quality. No “next time I’d test.”

**Cut:** Process as a section (logo grid). Solution as a feature recap after four decisions. Reflection R2–R4 in current form.

### Hero + opener (paste into Sanity)

**Title:** Students search in quarters. Listings are written in paragraphs.  
**Alt title:** Make the listing answer the DM.

**Opener:**

UCLA subletting is a two-sided matching problem that still runs on Facebook paragraphs, Reddit threads, and ULoop listings that don’t know what a quarter is. Seekers cannot tell if a post is complete or a person is real, so they spray the same five questions across three apps; listers sit on empty inboxes and assume there is no demand. In five weeks I designed BruinLease around that gap: required listing fields, quarter-native search, borrowed building reviews, and `.edu` identity — and I would not ship the verified badge again until it actually discriminated.

### Competitive table (the loudest missing page)

| | Facebook Groups | ULoop | Reddit / Bruinwalk | BruinLease wedge |
|---|---|---|---|---|
| Distribution | Already where students are | Campus-classified SEO | Searchable, slow | Must borrow demand or you are app #4 |
| Trust | Mutuals, profile | Thin identity | Username reputation | `.edu` badge — only if volume exists |
| Structure | Freeform, incomplete | Form-ish, generic college | Threads, not listings | Required fields + standardized card |
| Time model | “June–Sept” in a paragraph | Civil calendar | None | **Quarters as the primary key** |
| Property intel | Comments, maybe | Thin | The actual reviews | In-listing aggregation |

Until you can say *Facebook wins distribution, ULoop wins “exists,” we win quarter-native matching + complete listings on day one*, this is a school project that screenshotted the status quo.

### How we’d know (even unlaunched)

| Type | Metric | Tests |
|---|---|---|
| North star | Time-to-first-serious-reply (seeker) / time-to-first-qualified-lead (lister) | The market, not MAU |
| Seeker | % of listing views that do **not** require a “what’s the rent / dates / room” DM | D1 |
| Lister | Completion rate; time-to-publish; abandon-by-step | D4 |
| Trust | % of threads where both sides are `.edu`; report rate | Badge |
| Calendar | % of searches that use quarter chips vs custom dates | D3 |
| Cold start | % of listings with a matched building review in week 1 | D2 |

If you cannot say “we’d kill the stepped flow if completion dropped below X,” you made a UI, not a product decision.

### Four decision cards (rewrite)

**1 — Complete listings**  
Insight: 83% named clear listing info; the card *is* the marketplace.  
Options: (A) dense grid (B) large editorial (C) hybrid — price isolated, distance + address, verification on the card.  
Chose C. A is inventory theater. B is prettier and slower to compare.  
Evidence: research priority + three density passes. **Not evidence:** “price top left because that’s where eyes go.” Test: time-to-answer “can I afford this, is it in range, is this a student” on a 20-card scroll.

**2 — Borrowed trust**  
Insight: native reviews die in the cold start; seekers already leave the post for Bruinwalk / Reddit.  
Options: (A) link out (B) wait for in-app reviews (C) match public building reviews to address, default-on.  
Chose C — marketplace, not a “layer.”  
Tradeoff: building ≠ this unit; match-on-address will be wrong; ToS is a real question.  
Evidence: interview theme on confidence. Not run: did the stack change message rate?

**3 — Time is quarters**  
Insight: demand is *summer after spring finals*, not June 15.  
Options: (A) start/end pickers (B) free-text “Summer 2026” (C) quarter chips that autofill, custom dates as escape.  
Chose C.  
Tradeoff: off-cycle leases feel second-class; wrong autofill dates destroy trust.  
Show: a Facebook “June-ish” post vs the same listing passing/failing a quarter filter. That one image is the argument.

**4 — Tax the lister**  
Insight: D1 only works if listers complete the fields Facebook lets them skip. Completeness for seekers is a tax on supply.  
Options: (A) long form (B) stepped (C) “post from a screenshot” — not built.  
Chose B for first-time, once-a-year listers.  
Hypothesis: stepped wins if % complete and time-to-first-reply go up even if time-to-publish goes up. Long form wins if step-2 drop-off is worse than sloppy inventory.  
Evidence: none yet. Say that. Name the drawbacks (patronizing vs recreating Facebook).

### Reflection (keep one, rewrite the rest)

Keep R1: a trust signal with no variance is decoration.

Add one more you would defend: *I spent visual cycles on seeker cards and under-designed supply / GTM — the PMM’s actual problem.*

Kill: “more visual texture,” the Claude-as-reflection paragraph (footnote a real interaction you only found in code), and “if I could do it differently I would test.”

### Five highest-leverage content changes (not chrome)

1. Write the ULoop / Facebook / Reddit teardown and state the wedge.  
2. Promote the two-sided sentence to the spine (problem H2 + insight H2 + why D1 and D4 are a pair).  
3. Add “how we’d know” and an honest Impact. Silence reads as “we polished screens.”  
4. Rewrite all four decisions to options + tradeoff + kill criterion. **Cut Process.**  
5. Replace the closer with two judgments. Do not add more screens until the copy survives a hiring manager who never plays the video.

---

## 6. Visual / motion polish (Emil pass)

| Before | After | Why |
|---|---|---|
| Hero H1 `width: 50%` | `width: min(42rem, 72%)` | Longer thesis must not become a four-line stack that hides work |
| `--hero-pt/pb` 80/64 on every viewport | 64/48 desktop; 32/24 at `≤767` | Frequent portfolio scan; first card is the CTA |
| `transition: color 0.25s ease` on `a` and `.nav-link` | Keep; do not add `transition: all` | Exact properties; 250ms is already the top of the UI range |
| Card hover = opacity underlay only, no scale | Keep | Video cards cannot transform an ancestor; scale would letterbox Mux |
| Case-study TOC “Design Decision 1” | Named bets in fallbacks | Hierarchy via language, not another accent |
| Entrance y+fade ~0.45s on every about→work | Leave (plans 002/006) | Soft return is already a known contract; don’t double-motion the hero |
| Silk + scrim + rabbit + H1 in one viewport | Keep silk; thesis now does a job | Atmosphere is leverage only while content is primary |

**Do not animate** the new headline on every return. Cold load still owns the long intro. Soft return stays the wrapper `EntranceItem`.

---

## 7. Other UX nits (do when you next touch the file)

- **About “you can find me”** — the YouTube / 1M line should be a link. Socials need to read as targets (underline already helps; icons are optional).  
- **Case study mobile** — a single “Jump to product” text link under the hero meta is enough. Do not add a floating progress pill.  
- **D1 mobile** — “1 of 3” on the card captions so stacked iterations don’t feel like one-and-done.  
- **Reflection** — break to 2–3 sentence chunks; the 2×2 grid is fine.  
- **CD popup on phone** — sheet dismiss (swipe) is a later craft pass, not a bounce driver.  
- **Footer contact** — already there; don’t enlarge it. Quiet is the brand.

---

## 8. What to do next (priority)

1. **Paste the BruinLease rewrite into Sanity** (title, problem H2/body, research H2, four decision H2s, TOC labels, then the competitive table + metrics + Impact as new fields/sections). Code fallbacks only show when those fields are empty.  
2. **Rename the work-grid card** in the project document: “BruinLease” + “Quarter-native campus matching.”  
3. **Re-record the All-in-one Mux loop** without real personal tasks.  
4. Sit with the new work hero for a day. If it feels too long, swap to alternative 1 (attention / mental models).  
5. Do not add more case-study screens until a hiring manager can skip the video and still repeat the wedge.

---

*Audits: desktop 1440, tablet 768, mobile 390. BruinLease critique against a Stripe / Linear / Figma-adjacent early-career bar.*
