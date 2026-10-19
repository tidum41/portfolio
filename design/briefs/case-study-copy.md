# Case study copy

Mudit approves all copy. Anything in [brackets] is a gap, not a fact. Do not invent metrics, quotes, or team names to fill a bracket.

Bracketed lines are review notes. They are not rendered. A section or field that is only a gap is omitted from the page.

JOOLA below is split into what `/joola` renders and what is withheld. BruinLease is not a new draft: `/ucla-sublease` already exists, and that section is what that page renders today.

---

## JOOLA B2B

Route: `/joola`
Hero file: `public/images/joola/hero-ruth-2.png`
The Mux film stays on the homepage card only. It is not on this page.
The body sections are off the page. After the metadata, an NDA request. There is no password.

### Rendered

Back (same control as /ucla-sublease)
Title: B2B ordering for JOOLA
Hero, then the metadata row in the same place and styles as /ucla-sublease.

Role: Product Design Intern
Timeline: 10 weeks, Summer 2026
Team:
Vinay Bulusu PM
Caroline Kajihara Head of Digital
Rich Bloom Creative Director
Kannan Mrithunjai Developer
Sachin Girish Developer

The eyebrow and the subtitle are off the page. Later sections go between the metadata and the request.

Request:
Under NDA
Full case study available upon request.
Request access → mailto:Mudit14.mahajan@gmail.com?subject=JOOLA%20case%20study%20access

---

## BruinLease

Route: `/ucla-sublease` (existing page, reused)
Homepage card already pointed at this route in Sanity (`project-bruinlease`). The preview pins that href in code.

This is the copy on that page, not a rewrite. Hero meta is the in-repo fallback (`app/ucla-sublease/page.tsx`), which is what the hero renders. Sections below the hero use the production Sanity document `caseStudy` / slug `ucla-sublease` when a field is set, and the same file's fallback otherwise. Numbers here are that existing copy.

### Hero

Tagline: Product Design  ·  Case Study  ·  2026
Title: Simplifying UCLA subleasing

Role: Product Designer / & Frontend
Timeline: 5 Weeks
Tools: Figma, Google Stitch, Claude Code
Collaborators: 1 PM, 1 PMM

Hero film: Mux `gEJdc76IbGz8NzGfdRM7v00biDmwgACII24guyZ01tbVU`

Sanity has a different hero tagline ("Product Design | Case Study · 2025"), role ("Product Design Fellow"), and an extra tool ("Next.js"). The hero component does not read those fields, so they do not show.

### Problem

The Problem

UCLA students struggle with subleasing, using platforms that weren't built for it.

Entering my third year, I needed summer housing for my first time outside a dorm. 2 weeks of Reddit threads, Facebook groups, and texting friends-of-friends, I found something. I got lucky and I knew it. I asked friends if they found a place, and kept hearing the same story with different details.

Image caption: left to right — Facebook, ULoop, Reddit

- No standardized apartment info. Posts are inconsistent in pricing, dates, room details, forcing constant back-and-forth just to get basics.
- Platform switching is common. Students juggle Facebook groups, Reddit threads, Instagram stories, and word of mouth with little reliability.
- Trust is always a concern. Communicating across informal channels with no verification adds anxiety to a process of high importance.

### Research

Research Insights

We surveyed 60 UCLA students across all years and living situations, then conducted 12 interviews with seekers and renters.

My subleasing story turned out to be less unique than I thought, deja vu from conversations with friends scrambling to find a last-minute spot.

75% rated the subleasing process as highly stressful, even students who hadn't done it yet
83% said trust and clear listing information were their top priorities
70% reached out to listings on at least 3 different platforms before securing a sublease.

Seekers lacked confidence in listings, going through multiple points of entry. Listers had no idea why people weren't responding.

The 12-interview heading and the stat lines are Sanity. The two prose paragraphs under them are the in-repo fallback (`researchBodyPre` and `researchCallout`). Sanity's single `researchBody` field is stored but not what this section prints.

### Process

Process

With under 5 weeks to build, I owned design and prototyping end-to-end.

Usability tests with 40 UCLA students were part of the work. Tight constraints shaped my flexible workflow.

Tools:
- Figma — Wireframes and component structure to establish hierarchy.
- Google Stitch — Explored alternate information architectures to see what held up before moving into detail.
- Claude Code — Built interactions and prototyped in real time, allowing for iteration. I was able to focus on creating a feeling.
- Vercel — Deployment and testing on a more native iOS view.

### Design decisions

Condensing apartment info into a standardized format.
Based on research insights, I explored card layouts to communicate apartment details without being overwhelming. This is the first interaction with hundreds of listings, so conveying essential info without additional fluff is important.

Reviews are sifted and displayed by default.
I added apartment reviews from Bruinwalk and Reddit, sources UCLA students already relied on, a feature no competitor in the audit offered and the one testers trusted most. Seekers are able to see those reviews without navigating lengthy forums.

The academic calendar is built-in.
Subleasing demand follows UCLA's academic calendar, not arbitrary calendar windows. One tap eliminates an initial barrier by filtering date ranges that work for you.

In-app messaging keeps everything in one place.
Students were context-switching between Instagram DMs, texts, and email threads to coordinate a single sublease. Bringing messaging into the platform closes the loop and makes the lister–leaser handoff traceable.

Listing-card comparison lines and the "research insights drove key changes" bullets also render, from Sanity when set and from the in-repo fallback otherwise.

### Solution

Solution

BruinLease is a dedicated subleasing platform built specifically for UCLA students.

Digestible listings, quarter-based search, verified identities, and in-app messaging.

Media on the page: hero Mux film above; problem image, Figma exploration image, and decision phone videos when the Sanity assets are set; solution phone uses `public/solution.mp4`.

### Outcome

There is no Outcome section. Sanity `impactLabel`, `impactHeading`, and `impactBody` are empty, and the page does not render one.

### What I'd do next

The page's Reflection section is the closest block. Sanity replaced the fallback "If I could do it differently" item.

Reflection

Verification works if scaled
Verified badges are meaningful callouts, filtering legitimate UCLA students. But right now, our backend only accepts ucla.edu emails. Without opening it to all, the badge adds visual and cognitive noise.

Minimalist doesn't mean boring
I prioritized information clarity. But the UI ended up flatter than I wanted, resulting in loose hierarchy. More visual texture would make the experience feel less like a prototype and more like a product, integrated seamlessly in the college student stack.

Prototyping real time closed the feedback loop
Using Claude Code, I found interaction problems quickly that would have taken longer to workaround in Figma. I could refine micro-interactions and visual details through real time code manipulation, despite a smaller background in code compared to design engineers or PMs.

Usability tests changed the dates
Usability tests with 40 UCLA students led me to replace raw sublet dates on listing cards with academic quarter chips, so students could see each sublet's quarters without checking the academic calendar by hand.
