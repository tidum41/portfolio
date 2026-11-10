# Portfolio reference: top product design case studies

Working reference for the Dialogue case study bot. The question this page answers: **why is this designer a good problem solver, and how does the page prove it?** Every study gets a problem-solving proof (framing and reframing, constraints, options weighed, the turning point, how the decision is justified, how impact or missing impact is handled), then a content breakdown and a visual breakdown.

Read live on Oct 27 and Oct 28 2026 (PT) with headless Chrome at 1440x900. Every quote is copied from the live page, with its URL. Layout numbers come from measuring the rendered DOM at 1440 wide (`shots/refs/*-layout.txt` and `rachel-all-layout.txt`). Screenshots live in `/workspace/dialogue-agent/shots/refs/`.

Coverage: Rachel Chen (deepest, the model for /dialogue), Caleb Wu, Christine Liang, Ori Porat, Sean Marcano, and five studies Mudit called strong: Megan Phi (Tally), Megan Yap (Splunk), Natalie Almosa (Notion Mail), Jess Fong (Patreon, Reddit). Removed on Oct 28 at Mudit's request as "just OK": Rauno Freiberg, Julia Ro, Ali Chitsaz (Basion), Trang Cao (Spec AI). Aditya Das (adityad.as) still does not load.

---

## 1. Rachel Chen (deepest section)

Site: https://www.rachelchen.tech. Every project page she links from the home page:

| Project | URL | Words | Media | Of which video | H2s | Words per H2 |
|---|---|---|---|---|---|---|
| 1Password, macOS autofill | https://www.rachelchen.tech/projects/1password | 809 | 22 | 13 | 16 | about 50 |
| Figma, mobile-first | https://www.rachelchen.tech/projects/figma | 1,163 | 29 | 12 | 16 | about 73 |
| OpenAI, Tomo device | https://www.rachelchen.tech/projects/openai | 1,169 | 33 | 16 | 15 | about 78 |
| Notion, Custom Agents setup | https://www.rachelchen.tech/projects/notion | 833 | 28 | 10 | 13 | about 64 |
| PokerGPT | https://www.rachelchen.tech/projects/pokergpt | 808 | 12 | 4 | 8 | about 101 |
| Earth (Onova) | https://www.rachelchen.tech/projects/earth | 832 | 17 | 6 | 10 | about 83 |
| Etch | https://www.rachelchen.tech/projects/etch | 216 | 7 | 6 | 7 | teaser only |
| Alexa | https://www.rachelchen.tech/projects/alexa | 77 | 1 | 1 | 1 | teaser only |

Word counts include headings, kickers and meta rows, so body prose is a bit lower. The Notion study (June to August 2026) is new since round P7 and is the closest topical match to Dialogue: an AI agent in a chat panel, with cards and pills inside the conversation.

![rachel-1password-hero](/workspace/dialogue-agent/shots/refs/rachel-1password-hero.jpg)
1Password fold: autoplaying product video above the title, then meta row. https://www.rachelchen.tech/projects/1password

### 1.0 How Rachel proves she is a good problem solver

- **Framing and reframing.** She states the user goal, then turns it with the reason it is hard, in two headings: "Native macOS autofill is not supported on 1Password..." / "...but it’s not easy when you don’t own the operating system!" On Figma she reframes from a tool gap to a behavior: "Today’s design tools are not built for sparks of creativity" then "What if Figma enabled designers to capture ideas on-the-go?" https://www.rachelchen.tech/projects/figma
- **Constraints named.** Platform: "This just wasn't possible with Apple's API limitations." Hardware: "A device that is light-weight and always-recording isn’t possible, yet." Translation: "The challenge lies in translating a broad intent in natural language into deterministic agent configurations." https://www.rachelchen.tech/projects/notion
- **Options weighed.** Numbered explorations, each with an "If we could..." sentence and a verdict heading (1Password). Explorations ranked by what each one prioritizes: "Here, the priority is speed over structure." / "fidelity over speed." / "clarity over execution." (Figma).
- **Turning point.** A hidden problem inside a simple result: "The final flows were simple, but there was a big problem hidden within." A first pass that fails: "However, the problem with this approach was that this could actually impede clarity and collaboration".
- **Justification.** The rejected option sits inside the decision sentence: "Instead of a persistent save button that users become blind to, I decided keep the agent settings page as the single source of truth for saving". The cost is said out loud: "This is a trade-off that we're willing to make for mass adoption." https://www.rachelchen.tech/projects/openai
- **Impact or missing impact.** No invented numbers. She reports a handoff ("I handed this off to the 1Password for Safari team!"), a ship ("Here is the 4 part solution I shipped"), or a limit ("The user flow couldn't be perfect, but we had to work with it.").

### 1.1 The page template (same on every project)

1. Hero media, 923 px wide, wider than the text column, above the title. On 1Password, OpenAI, Notion, PokerGPT and Earth it is a video set to autoplay and loop with no controls (`1password.mp4` at 923x519, `notion.mp4` at 923x726). Etch uses a still.
2. H1, a short plain outcome or product line: "Bringing autofill to macOS", "Mobile-first for Figma", "Setup experience for Notion's Custom Agents", "The world's first AI poker coach".
3. Meta row in three equal columns (219 px each): Collaborators, Timeline, Scope. Labels are gray, values are dark.
4. Kicker "Overview", then an H2 that states the product or the question, then one or two sentences.
5. Kicker "Problem", then the problem as an H2, often split across two H2s.
6. One to three middle chapters, each with its own kicker ("Navigating the Mess", "Onboarding Users", "Capturing setup inputs", "Communicating edits", "Hardware Constraints", "Engineering x Design").
7. Kicker "Solution" or "Final Flow" or "Final Designs".
8. Kicker "Reflection", H2 "What I learned", two short lessons, each a bold-ish line plus one sentence.

The left rail is a sticky table of contents built from the kickers. The active item turns orange with a dot; the Notion page nests sub-items (Connections, Entities under "Capturing setup inputs"; Problem, Exploration, Decisions, Solution under "Communicating edits"). See `shots/refs/rachel-notion-4.png`.

### 1.2 Section-by-section structure maps

**1Password** (https://www.rachelchen.tech/projects/1password)
- Overview: "1Password is a password manager, where millions of users keep their life’s secrets."
- Problem, as a pair of H2s: "Native macOS autofill is not supported on 1Password..." then "...but it’s not easy when you don’t own the operating system!"
- Navigating the Mess: "The final flows were simple, but there was a big problem hidden within." Then "Here as the final flows I handed off." (her typo, kept) and "let me show you how i came to discover that problem..."
- Research as an H3 pair: "I researched the password managers on macOS..." then "...and found 3 key players to the problem:"
- Two problem claims as H2s: "Apple passwords is visually dominant over 1Password for macOS." and "The Native macOS dropdown overlays on Safari"
- Mission line: "My mission was to bring clarity to this mess."
- Effort she can count: "I went into the settings of both macOS and Safari, testing every single possible combination of settings to see what would happen."
- Exploration 1, conditional, verdict: "Exploration 1: Disable macOS Autofill on Safari only" / "If we could disable macOS Autofill on Safari only, this would leave only the 1Password for Safari dropdown visible." / H3 verdict "This just wasn't possible with Apple's API limitations."
- Exploration 2, same shape: "Exploration 2: UI Code Fixes" / H3 verdict "This solution would require a lot of engineering effort, and still result in a buggy and unreliable experience."
- Solution plus handoff aside: "Solution: Rely on user-level decisions" / H3 "I handed this off to the 1Password for Safari team!"
- Second solution: "The only workaround is to disable Apple Passwords" then "Solution: Instruct users to turn off Apple Passwords"
- Onboarding Users: question H2 "Where is the entry point to setting up macOS autofill?" with three option cards (Onboarding Modals, Guided Setup, Core Product), then "Do More with 1Password"
- Final Flow: "Discovering & setting up macOS autofill:"
- Reflection: "The simplest designs hold a lot of complexity." and "Flows aren't always perfect because the tech isn't always perfect."

**Figma** (https://www.rachelchen.tech/projects/figma)
- Overview question: "How can Figma enable short bursts of creative work?"
- Role as an H2: "I led the product thinking and prototyped interactions"
- Problem: "Today’s design tools are not built for sparks of creativity" then a "However," paragraph, then the reframe H2 "What if Figma enabled designers to capture ideas on-the-go?"
- Principles: "What is a well-documented idea?" with three captions, e.g. "Ideas should be anchored to context."
- Solution first: "Live Comments: Give rich feedback on-the-go." with H3 story beats "When you’re on the go and your brain won’t stop designing..." and "That idea lives clearly in Figma, waiting for your team to jump in."
- Explorations ranked by priority: "Exploration: Capturing inspiration" ("Here, the priority is speed over structure."), "Exploration: Iteration on-the-go" ("Here, the priority is fidelity over speed."), "Solution: Capturing feedback" ("Here, the priority is clarity over execution.")
- Why: "Why this direction?"
- Sub-problem with first pass and reversal: "First pass: Segmenting into multiple comments" then "However, the problem with this approach was that this could actually impede clarity and collaboration" then "Solution: Sections within a Live Comment" with "The tradeoff is that we can’t respond to smaller snippets of ideas within a longer recording."
- Outcome: "We won the SVSD design competition!"
- Reflection: "Be careful of what you add to a product, even if it seems useful."

**OpenAI, Tomo** (https://www.rachelchen.tech/projects/openai)
- Overview question: "What should OpenAI build as their first AI device?"
- Problem and opportunity as labeled H3s: "Problem: ChatGPT is at the top of the stack." and "Opportunity: Memory is the core of OpenAI’s device ecosystem."
- Solution first: "Introducing Tomo: the AI device that remembers so you don’t have to..."
- Research, form factor, "Why Tomo?" with three short reasons ("Enhances ChatGPT", "Leverages OpenAI’s strengths", "Easier to scale")
- Testing: "Testing and iterating with feedback!" then "Insight 1: Memory for recall, not reliving" and "Insight 2: Surface relevant suggestions"
- Constraint chapter: "A device that is light-weight and always-recording isn’t possible, yet." then "So we had to ask:" then "How do we maximize memory despite constraints of camera battery life?"
- Two options, then the tradeoff: "Context-based Capture", "Manual Capture", "Trading memory for privacy", H3 "This is a trade-off that we're willing to make for mass adoption."
- Reflection: "Social signals matter." and "Think in systems."

**Notion, Custom Agents** (https://www.rachelchen.tech/projects/notion)
- Problem as a pair of H2s again: "Notion’s Custom Agents are powerful..." then "...but with that power comes a setup problem."
- The hard part in one line: "The challenge lies in translating a broad intent in natural language into deterministic agent configurations."
- Role as an H2: "So my role was to bring setup precision to the chat!"
- Chapter "Capturing setup inputs": "The setup experience was broken." then per sub-problem a Problem and a Solution H2 pair: "Connections required manual setup in settings" / "Solution: Connection card"; "Specifying entities was unreliable" / "Solution: Entity survey tool"
- Chapter "Communicating edits": "Editing and saving agents was super confusing", "I explored ways to bring agent edits and saving to the chat!" with three options side by side (Edits & save pill, Save edits in a card, Summarized edits & save card)
- Decisions: "Key interaction decisions", "Decision 1: Keep edits precise and decoupled from saving", "Decision 2: Single save CTA in Settings". Each decision says what she rejected in the same sentence: "Instead of a persistent save button that users become blind to, I decided keep the agent settings page as the single source of truth for saving"
- Solution: "New flow to understand edits and saving" with four numbered captions "01 / Tool steps visualize edits" to "04 / Precise edits tooltip"
- Engineering x Design: "Working in production code improved my designs" with "Designing with technical constraints" and "Iterating in real code"
- Reflection in two columns: "Turning big future visions into small shippable parts" / "Bridge the long-term, “ideal” vision, with incremental ships you can make today." and "Using production code in the design process"

**PokerGPT** (https://www.rachelchen.tech/projects/pokergpt)
- "What if" overview, then solution in one line: "PokerGPT: An AI-powered poker coach providing tailored feedback and analysis."
- Kicker "Becoming My Users": "I didn't know how to play poker... so I learned!"
- Key insight from behavior: "Key Insight: Some players are prompting ChatGPT in a way to get hand analysis, pot odds, game feedback, and playing strategies!"
- Final Designs: "We prioritized a simple, familiar, and clean interface."
- Reflection: "User research is not enough."

**Earth** (https://www.rachelchen.tech/projects/earth): the only one that leads with numbers ("8,000+ users", "7+ events", "97% of users") because she had them. Iteration beat: "Key Finding: Users are not discovering the live dashboard."

**Etch** (https://www.rachelchen.tech/projects/etch): a "How it works" sequence of six imperative H2s over six videos ("Bring your notes into the canvas.", "Draw the relationships.") and "Full case study coming soon!" Useful as the model for a feature walk-through told only in motion.

### 1.3 Content breakdown (Rachel)

- **How it opens.** Product motion first, then a plain H1, then who and when, then one Overview H2. The problem lands in the second kicker, inside the first screen and a half.
- **Heading style.** Every H2 is a full sentence or a question, sentence case, 5 to 15 words. Four recurring shapes:
  - The "..." pair that turns on a "but": "Native macOS autofill is not supported on 1Password..." / "...but it’s not easy when you don’t own the operating system!" and "Notion’s Custom Agents are powerful..." / "...but with that power comes a setup problem."
  - Labeled steps: "Exploration 1:", "Exploration 2:", "Solution:", "Insight 1:", "Decision 1:", "First pass:", "Key Finding:".
  - Questions that open a chapter: "Where is the entry point to setting up macOS autofill?", "Why this direction?", "How do we make it easy to understand and respond to Live Comments?"
  - Verdict H3s under an option: "This just wasn't possible with Apple's API limitations."
- **Kickers.** A gray 15 px label above each H2 names the chapter ("Navigating the Mess", "Hardware Constraints", "Engineering x Design"). They feed the left TOC.
- **Voice.** First person, casual, exclamation marks on the turns: "I handed this off to the 1Password for Safari team!", "So my role was to bring setup precision to the chat!", "I didn't know how to play poker... so I learned!" Ellipses carry suspense across headings. She keeps small typos and lowercase "i" ("let me show you how i came to discover that problem..."), which reads as a person talking.
- **Decisions, rejected options and reversals.** Each option is a heading plus one "If we could..." sentence plus a verdict heading. Reversals use "First pass" then "However": "However, the problem with this approach was that this could actually impede clarity and collaboration". Decisions name the rejected alternative inside the sentence with "Instead of ... I decided": "Instead of forcing a save action on every edit, I decided to keep edits precise in chat, and decoupled from saving."
- **Backing controversial calls.** Three tools: a platform constraint ("Apple's API limitations"), counted effort ("testing every single possible combination of settings"), and the tradeoff said out loud ("The tradeoff is that we can’t respond to smaller snippets of ideas within a longer recording.", "This is a trade-off that we're willing to make for mass adoption.").
- **Missing metrics.** She does not invent any. 1Password, Notion and OpenAI end with no numbers. Outcome slots get filled with what happened instead: a handoff, a competition win ("We won the SVSD design competition!"), a ship ("Here is the 4 part solution I shipped"). Numbers appear only on Earth, where she had them.
- **Ending.** Kicker "Reflection", H2 "What I learned", two lessons. Each lesson is a short claim plus one sentence. One of the two usually admits a limit: "Flows aren't always perfect because the tech isn't always perfect."
- **Word density.** 800 to 1,170 words for a full study, 50 to 100 words per H2, body paragraphs of one or two sentences (23 to 68 px tall at 15 px type, so one to three lines). Depth comes from more headed steps, never longer paragraphs.

### 1.4 Visual breakdown (Rachel)

![rachel-1password-finalflows](/workspace/dialogue-agent/shots/refs/rachel-1password-finalflows.jpg)
"The final flows were simple, but there was a big problem hidden within." over a gray well labeled FINAL FLOWS with three captioned browser frames and pause and replay buttons. https://www.rachelchen.tech/projects/1password

![rachel-notion-problem-solution](/workspace/dialogue-agent/shots/refs/rachel-notion-problem-solution.jpg)
Notion study: amber well captioned "Problem: Connections required manual setup", followed by a lavender well for "Solution: Connection card". Nested TOC on the left. https://www.rachelchen.tech/projects/notion

**Grid and figure sizes (measured at 1440 wide).**
- Text column: 688 px, starting at x=376 (centered). Body 15 px TWK Lausanne in slate at 55 percent opacity; headings in Libre Baskerville, H1 36 px, H2 28 px, color rgb(50, 64, 79).
- Hero: 923 px wide (x=259), breaking out of the column by about 118 px each side. The only element that does.
- Full-column figure: 688 px. This is the default on 1Password (11 of 22 media), OpenAI (11), PokerGPT (8), Earth (11).
- Inset media inside a tinted well: 648 px (20 px padding inside the 688 well). Default on Notion (16 of 28).
- Pairs: two 326 px frames (Figma, OpenAI insights). Triples: 216 px (Notion's three use cases, Figma's three principles). Option row with text beside it: a 373 or 438 px frame on the left with a 243 px caption column on the right (Notion's three save options).
- 411 px frames for app windows that sit centered inside a 688 well (1Password, OpenAI).

**How UI is presented.**
- Bare UI, not device mockups, for desktop work: browser windows and macOS windows sit on a flat light gray well, with a tiny uppercase mono label in the well's top-left ("FINAL FLOWS", "RESEARCH & DISCOVERY") and step labels under each frame ("AUTOFILL PASSWORD", "SAVE PASSKEY", "SIGN IN WITH PASSKEY").
- Phone frames only where the product is mobile (Figma, OpenAI Tomo).
- Color carries meaning on Notion: problem captions are amber rgb(122, 78, 10) on an amber wash, solution captions are purple rgb(78, 58, 130) on a lavender wash, neutral captions are gray. The caption sits inside the well, top-left, as a label ("Problem: Editing and saving was unclear", "Solution: Slack channel survey tool").
- Figma uses uppercase figcaptions ("CREATING LIVE COMMENTS", "REVIEWING LIVE COMMENTS", "SECTIONS WITHIN A LIVE COMMENT").
- Before and after: the same well, side by side or stacked, with the problem well first and the solution well directly under the solution H2.

**Motion.** Video is the default medium, not the exception: 13 of 22 media on 1Password, 16 of 33 on OpenAI, 6 of 7 on Etch. The hero autoplays and loops. In-body videos are muted loops that play when they scroll in (autoplay is off in the markup, loop is on, no native controls), with small round pause and replay buttons in the frame's top-right corner (visible in `rachel-1password-1.png`). Each clip shows one interaction from start to finish, a few seconds long.

**Rhythm and whitespace.** Kicker, H2, one or two lines, one figure, repeat. Large gaps between chapters (a hairline rule between Problem and Navigating the Mess on 1Password). Nothing sits beside the column except the TOC.

**What makes her UI look strong.** It is shown at real size, in real product chrome, in motion, on a quiet background, one interaction per frame. The wells are low contrast so the UI is the only saturated thing on the page. Labels inside the frame do the captioning, so the reader never has to look away.

**How the visuals tell the story without text.** Read only the figures and you get: messy current state (three overlapping dropdowns), the options (three frames in a row), the chosen flow (looping video), the final flow. On Notion the amber then lavender wash alone tells you which frame is the problem and which is the fix.

### 1.5 How /dialogue should mirror Rachel

Content
- [ ] Problem as a two-H2 "..." pair that turns on "but" (e.g. the speed claim, then "...but"). Inside the first screen.
- [ ] One kicker per chapter, also used as the TOC label. Chapter names are plain nouns or gerunds.
- [ ] Every H2 a sentence or question, 5 to 15 words, sentence case.
- [ ] Final first: show the shipped answer card early, then "let me show you how" back to the hidden problem.
- [ ] Options as "Exploration 1:" style headings, one "If we..." sentence each, a verdict H3 with the reason.
- [ ] At least one "First pass:" then "However," reversal.
- [ ] Decisions written as "Instead of X, I decided Y" so the rejected option is in the sentence.
- [ ] Name the tradeoff once, plainly ("The tradeoff is that...").
- [ ] One counted-effort sentence (versions built, combinations tested).
- [ ] No invented outcome numbers; fill the outcome slot with what shipped or was handed off.
- [ ] End on "What I learned" with two lessons, one admitting a limit.
- [ ] 800 to 1,100 words, 50 to 80 words per H2, paragraphs of one or two sentences.
- [ ] Allow a little warmth: one exclamation on a turn, first person throughout.

Visual
- [ ] Hero motion clip above the title, wider than the text column (Rachel: 923 vs 688, ratio 1.34).
- [ ] Meta row in three columns under the H1.
- [ ] Default figure is full column width; inset UI inside a light well with about 20 px padding.
- [ ] Label inside the well, top-left, instead of a caption below (e.g. "Problem: prose answer, no count").
- [ ] Problem and solution wells in two quiet tints, same position, so the pair reads without text.
- [ ] Bare product UI in real chrome; device frames only for mobile.
- [ ] Short muted loops that play on scroll, with small pause and replay controls; one interaction per clip.
- [ ] Options shown as a row of equal frames (216 px triples or 326 px pairs at Rachel's scale) or a frame plus side caption.
- [ ] Sticky left TOC from the kickers, active item marked, sub-items for multi-part chapters.

Note for the bot: TASTE currently locks /dialogue figures to a 640 column and rejects status chips. Rachel's 923 hero and in-well labels conflict with those rules, so they need Mudit's OK before building (same open items as the P7 reference study).

![rachel-figma-hero](/workspace/dialogue-agent/shots/refs/rachel-figma-hero.jpg)
Figma fold: lavender hero, serif H1, three-column meta row, left TOC. https://www.rachelchen.tech/projects/figma

![rachel-openai-hero](/workspace/dialogue-agent/shots/refs/rachel-openai-hero.jpg)
OpenAI Tomo fold. https://www.rachelchen.tech/projects/openai

---

## 2. Caleb Wu: RevisionDojo and Axis

RevisionDojo: https://www.calebwu.ca/RevisionDojo (re-fetched Oct 28, unchanged). Axis: https://www.calebwu.ca/Axis

![caleb-revisiondojo-evaluation](/workspace/dialogue-agent/shots/refs/caleb-revisiondojo-evaluation.jpg)
RevisionDojo: research synthesis board, the relevant versus irrelevant circle diagram, the option carousel with check rows, and the verdict callout. https://www.calebwu.ca/RevisionDojo

### How Caleb proves he is a good problem solver
- **Framing.** A blunt user problem, then two evidence claims: "Searching for your IB courses is ridiculously hard", "Students focus on just 6/30 subjects, so the remaining content adds friction instead of value." https://www.calebwu.ca/RevisionDojo
- **Constraints.** Named in the evaluation heading: "Evaluating ideas against research and technical constraint."
- **Options weighed.** Four options with plus and minus rows, e.g. "Easy implementation: already built onsite" against "Carries stigma from poor maintenance".
- **Turning point.** Testing breaks the first answer: "Users felt way too much pressure to choose a subject, then a corresponding feature."
- **Justification.** "What we initially assumed to help with precise decision making, actually created decision paralysis." The fix is a "middle point": "navigating them to the subject itself".
- **Impact.** None claimed; the page closes on learnings and "This is just a snapshot of the entire design process."

### Content breakdown (RevisionDojo)
- **Structure.** Summary and team, then the solution story first (problem claims, then four feature sections), then "Where it all started" goes back to research, evaluation, prototype, feedback, final, "Key Learnings". Two passes: what it is, then how he got there.
- **Opening.** "RevisionDojo is the fastest growing edtech startup, providing digital IB study tools to 400,000+ users." then "My team developed a scalable navigation system to anchor the products rapid growth."
- **Headings.** Claims with a point of view: "Searching for your IB courses is ridiculously hard", "Students navigate mountains of content.", "No features supported large-scale search.", "Helping users overcome decision paralysis", "Contextualizing a whole feature in just a moment". Small gray kickers above them.
- **Voice.** Casual and punchy: "ridiculously hard", "(and avoid assumptions!!)", "I built many, many, many variations of the searchbar", "Get your hands dirty!"
- **Decisions and rejected options.** "Evaluating ideas against research and technical constraint." Four options, each with pros and cons as rows: "Easy implementation: already built onsite", "Carries stigma from poor maintenance", "Too late in the flow for discovery", "Users consistently skip onboarding". Then the verdict line "The search bar was the best option." and the reason "Initial solutions, while promising, were not uniquely positioned to validate subject resonance for users in the first 2 minutes."
- **Reversal.** "What we initially assumed to help with precise decision making, actually created decision paralysis." Set up by the feedback "Users felt way too much pressure to choose a subject, then a corresponding feature."
- **Backing calls.** Research counts ("60 surveyants & 12 user interviews"), domain counts ("Students focus on just 6/30 subjects"), and a scope number in the solution ("you're choosing from 24 relevant results, not scrolling through hundreds").
- **Missing metrics.** No outcome numbers; the page ends on learnings and "This is just a snapshot of the entire design process."
- **Ending.** "Key Learnings", three dash items, each a bold imperative and one sentence: "Don't reinvent the wheel and over engineer a crazy complicated solution for a simple problem."
- **Density.** About 930 words over 15,662 px; most sections one or two sentences.

### Visual breakdown (RevisionDojo)
- Three hero images before any problem copy: a modal on a light canvas, a laptop mockup, and colorful feature icons.
- UI sits small and centered inside large light gray rounded wells, lots of air around it. The search modal is shown again and again at the same scale, so the reader learns the object.
- Diagrams instead of charts: a big circle with a small red "Relevant" circle makes the content bloat point in one glance.
- Options are a horizontal carousel of cards, each a mini wireframe plus green check rows.
- Verdict and learning lines sit in a separate pill-shaped callout with an icon.
- Feedback shown as a dark purple-tinted prototype screenshot with red annotation arrows.
- Why the UI looks strong: crisp, flat, consistent illustration style for features, so even unfamiliar features read at a glance ("I created illustrations to help communicate their purpose at a glance without relying on heavy text.").
- Story without text: icons scattered, then funneled into a search bar, then the modal.

### Axis (brand, shorter)
- Opening: "Axis Consulting, a pro bono consulting club at Simon Fraser University, needed a bold rebrand to reignite engagement."
- Headings: "Reignite a dying brand", "Visual pillars inspired by core values."
- Learnings with personality: "Some of the weirdest ideas came while I was on the toilet." and "Chase feedback in moderation. Trying to appease a 13+ person executive team is incredibly hard."
- Visual: billboard and portrait mockups, a type specimen ("Apfel Grotezk"), pillar glyphs in a row labeled Strategy, Clarity, Impact, then a tile wall of applications (tote, posters, phone stories). About 220 words, the images do the work.

![caleb-axis-fold](/workspace/dialogue-agent/shots/refs/caleb-axis-fold.jpg)
Axis fold. https://www.calebwu.ca/Axis

---

## 3. Christine Liang: Butternut AI

https://christineliangdesign.com/works/butternut-ai (re-fetched Oct 28; the page now has a new title and section headings compared with the Oct 27 dump).

![christine-butternut-fold](/workspace/dialogue-agent/shots/refs/christine-butternut-fold.jpg)
Butternut fold. https://christineliangdesign.com/works/butternut-ai

### How Christine proves she is a good problem solver
- **Reframing the ask.** "the surface-level ask was to modernize the interface. But the real question was: why were 85% of users abandoning before publishing?" https://christineliangdesign.com/works/butternut-ai
- **Constraints.** The client's: "The client wanted to preserve the feeling of "editing directly on the site.""
- **Options weighed.** A competitive map first, which kills the obvious answer: "The opportunity wasn't to add more features. It was to make the existing ones actually usable."
- **Turning point.** Symptoms a reader can picture: "AI Assist would reply "Changes Done" with no explanation."
- **Justification.** "So rather than moving everything to a collapsible sidebar, I introduced a clear separation between two types of tools: Universal and Contextual."
- **Impact.** Real numbers (2.7 to 4.3), and the open problem stated anyway: "The drop-off between editing and publishing is still the core business problem."

### Content breakdown
- **Structure.** Title "Closing the gap between generate and publish", meta (Role, Tools, Team, Duration), OVERVIEW_, INSIGHTS_, CHALLENGE_, SOLUTION_ (four sub-sections), TAKEAWAYS_, "If I had a few more weeks".
- **Opening.** Metric first: "Redesigning the AI editor for a website builder used by 300k+ users, turning a 2.7 into a 4.3 satisfaction score." Then the overview H2 "Over 300k users tried it. Fewer than 15% published."
- **Reframing the ask.** "the surface-level ask was to modernize the interface. But the real question was: why were 85% of users abandoning before publishing?"
- **Headings.** Problems named as images: "The blank prompt box was setting users up to fail", "AI Assist felt like talking into a void", "One toolbar doing too many jobs". Insight labels in caps: "AI FELT LIKE A BLACK BOX", "PROMPT INPUT HAD NO SCAFFOLDING". Kickers in caps with an underscore: "OVERVIEW_", "TAKEAWAYS_".
- **Voice.** Plain, concrete symptoms: "AI Assist would reply "Changes Done" with no explanation. Users couldn't tell what changed, or how to course-correct."
- **Decisions.** Client constraint as the reason, with the rejected option in the sentence: "So rather than moving everything to a collapsible sidebar, I introduced a clear separation between two types of tools: Universal and Contextual."
- **Backing calls.** A competitive map before solutions: "Butternut had carved out a unique position: high automation, low customization, prioritizing speed over flexibility. The opportunity wasn't to add more features."
- **Metrics.** She has them and puts them in a stat block under "Measurable improvement, and a foundation for scale" (2.7 to 4.3, 80%, 0 to 1, 300k+). Dialogue cannot copy this.
- **Ending.** Honest open problem: "The drop-off between editing and publishing is still the core business problem."
- **Density.** About 800 words over 13,075 px; paragraphs of two to four sentences.

### Visual breakdown
- Large hero of the product (a generated site) in a soft gradient frame.
- Insights as a stacked list of bordered rows with small caps labels.
- A 2x2 competitive map with logos.
- UI shown as overlapping screens on pastel lavender and green gradient backgrounds, many at angles or layered, with bold callout text set into the image ("Conversational & Collaborative").
- Results as a dark stat panel with big numerals.
- What makes it strong: the after states are shown in full context of the editor, not cropped components, so the reader sees the whole canvas stay visible.
- Story without text: blank prompt box, then example sites with prompts; popup over canvas, then side panels that leave the canvas clear.

---

## 4. Ori Porat: AI conversational chat

https://www.ori-porat.design/work/ai-chat

![ori-aichat-fold](/workspace/dialogue-agent/shots/refs/ori-aichat-fold.jpg)
Ori Porat fold. https://www.ori-porat.design/work/ai-chat

### How Ori proves he is a good problem solver
- **Framing.** One object reveals the real problem: "That image stopped me. Not because of the icon itself, but because of what it revealed". https://www.ori-porat.design/work/ai-chat
- **Constraints.** An existing build he did not design: "I found out that a different design had already been partially developed by engineering."
- **Options weighed and turning point.** "The Hard Calls" section names two tensions, the foundation problem and "The trust vs. conversion tension".
- **Justification.** "When I pushed back, I didn’t do it from instinct alone. I did my homework"
- **Impact.** An early number with a caveat: "Not a final number".

### Content breakdown
- **Structure.** "The problem all started with the wrong icon.", "Where I Was Coming From", "Understanding The Biz And More", "What the Work Actually Showed", "Building Blocks, Not a One-Off", "The Hard Calls", a "What Shipped" and "What's Coming" ending, "Connecting the Dots".
- **Opening.** A story with a single object: "The team was running an A/B test on avatar icons" ... "A robot." Then "That image stopped me." and the stakes "Nobody was using it." It closes the intro with "This is the story of how we got there."
- **Headings.** Title case, conversational: "What the Work Actually Showed", "The Hard Calls".
- **Voice.** Long-form essay, reflective, first person: "I came into this without having designed any of the existing implementations. That was useful".
- **Decisions and reversals.** "The Hard Calls" names two: "The foundation problem" (engineering had built a different design; "I had to throw out parts of it and adapt") and "The trust vs. conversion tension".
- **Backing controversial calls.** "When I pushed back, I didn’t do it from instinct alone. I did my homework" with comparable products, UX laws and heuristics.
- **Metrics.** One early number with a caveat: "roughly 3% of users converted directly through chat" and "Not a final number".
- **Ending.** Splits live from next: "The foundation is live." then "What’s next is the part I’m most excited about." then two personal lessons.
- **Density.** About 2,300 words, essay paragraphs of four to six sentences. Much heavier than Rachel; borrow the moves, not the length.

### Visual breakdown
- Only 5 media on a 13,672 px page. A dark product hero, an illustrated "≠" icon metaphor, a "There is no spoon" image, a light chat UI screenshot and a node graph.
- Media is mood and metaphor more than UI; the UI that appears is a full chat screen at column width on white.
- Story without text: weak. This one carries the story in prose. Useful as the counterexample.

---

## 5. Sean Marcano: Moneda AI chat for payments

https://www.seanmarcano.com/work/moneda-ai-chat

![sean-moneda-fold](/workspace/dialogue-agent/shots/refs/sean-moneda-fold.jpg)
Moneda fold. https://www.seanmarcano.com/work/moneda-ai-chat

### How Sean proves he is a good problem solver
- **Framing.** The structured UI is the obstacle, not the user: "Users knew exactly what they wanted to do. The structured UI was the obstacle." https://www.seanmarcano.com/work/moneda-ai-chat
- **Constraints.** Trust in money movement: "They were not comfortable with AI taking action without a clear confirmation step."
- **Options weighed.** Per intent, three paths: resolved, ambiguous, failure.
- **Justification.** Research finding first, then the principle "Trust before capability."
- **Impact.** "The product has not yet launched publicly."

### Content breakdown
- **Structure.** Meta, research H2, "We tested how users understood AI before we designed anything.", "Designing for AI means designing the edges, not just the happy path.", "Designed end to end. Handed to engineering." with labeled callouts THE OPPORTUNITY, KEY RESEARCH FINDING, THE CORE DESIGN PRINCIPLE, WHAT THIS PROJECT ADDED.
- **Opening.** "We had the research. The question was whether AI could make payments feel like a conversation."
- **Headings.** Two-sentence claims; principle as heading.
- **Voice.** Direct and declarative: "The structured UI was the obstacle." and "I wrote the conversation flows in plain text before touching Figma."
- **Decisions.** Edges mapped per intent: "the resolved path, the ambiguous path (AI asks a clarifying question), and the failure path (AI defers to structured UI or a human)". Specific pattern choice: "Suggestions appeared as selectable chips, not pre-filled text."
- **Backing calls.** A research finding in a callout: "Users were comfortable with AI surfacing suggestions. They were not comfortable with AI taking action without a clear confirmation step."
- **Missing metrics.** Says it plainly: "The product has not yet launched publicly." Then states what the project proved.
- **Ending.** "Trust before capability." principle and a reflective callout.
- **Density.** About 800 words; callouts break the prose.

### Visual breakdown
- A phone mockup on a dark rounded panel as the hero; later, pairs of wide screenshots of conversation flow boards in light gray wells.
- Callouts are tinted boxes with an orange small-caps label.
- The phone frame is the familiar WhatsApp shape, which supports the copy ("Familiar bubble layout, familiar input field, familiar send button.").
- Story without text: partial; the flow boards are too small to read at 1440.

---

## 6. Megan Phi: Tally

https://www.meganphi.com/projects/tally (Product Designer, Sep 2024 to May 2025, startup that has since wound down)

![tally-hero](/workspace/dialogue-agent/shots/refs/tally-hero.jpg)
Tally fold: dark page, outcome H1, product UI in a lavender frame. https://www.meganphi.com/projects/tally

![tally-impact-combos](/workspace/dialogue-agent/shots/refs/tally-impact-combos.jpg)
Impact stat tiles, then the "48 different combinations" diagram that makes the problem countable. https://www.meganphi.com/projects/tally

### How Megan Phi proves she is a good problem solver
- **Framing.** She names the gap in the market in one sentence, before any UI: "Existing inventory tools track complete SKUs, leaving made-to-order businesses to rely on spreadsheets to track raw materials."
- **Making the problem countable.** A diagram plus caption turns "complex" into arithmetic: "For a "simple" product: 4 designs x 3 colors x 4 sizes = 48 different combinations". Then a metaphor: "Think of these combinations as recipes with overlapping ingredients."
- **Reframe as an opportunity question.** "What if we used recipes to automate materials inventory?"
- **Evidence for the call.** "We chatted with 10+ businesses from apparel to handmade jewelry. All managed their inventory using spreadsheets." Plus one user quote: "I'll make a Square sale and forget to update my Shopify... if someone buys off my Shopify storefront later... I have to email to cancel their order."
- **Scope as a decision.** MVP from interviews ("We drew from our user interviews to determine high priority needs for an MVP."), v2 deferred ("We roadmapped a v2 based on signal from early user conversations.").
- **Cheap validation first.** "Validating with a chatbot prototype" / "One of our engineers ran his own made-to-order business on this prototype."
- **Decisions with a reason in one line.** "Modals → Drawers" / "Modals yielded inconsistent heights and blocked contextual information."
- **Impact, honestly.** "We've since wound down, but our users fulfilled 2,500+ orders, processing over $120k in revenue." The outcome and the shutdown share one sentence.

### Content breakdown
- **Structure.** Title block, tl;dr, Impact, Background, The Status Quo, Opportunity, Early Validation, Design & Iteration, Solution, Reflection. Each section is a small gray kicker plus a large line.
- **Opening.** Outcome headline: "Empowering small businesses to process over $120k in revenue". Then "We built an all-in-one fulfillment hub for made-to-order businesses."
- **Heading style.** Kicker plus a 32 px claim: "Keeping Tally so you don't have to.", "Here's what happened when we launched Tally with early users.", "Made-to-order businesses face challenges scaling their operations.", "Materials inventory, automated". Sub-headings are short labels: "Incremental Inventory Counter", "Sweating the Details", "Design System".
- **Voice.** Plain, warm, a pun in the tl;dr. Solution steps are imperatives: "Add products to your shop", "Connect your storefronts", "Watch the numbers move", "Cross the finish line with Tally".
- **Decisions and rejected options.** "Modals → Drawers" names the old and new pattern in the heading.
- **Missing or ended impact.** Reports early-user numbers, then says it wound down.
- **Ending.** Numbered reflections: "Launch something... anything." and "Sell a story, not a product."
- **Density.** About 830 words, 23 media, paragraphs of one to three sentences.

### Visual breakdown
- **Grid.** One 664 px column (x=388). Media sits on a near-black well rgb(26, 26, 26) with 4 px radius; the UI inside is usually 531 px wide, so there is about 66 px of dark padding each side. Triples are 213 px tiles with 12 px captions under each ("Manage inventory by materials", "Consolidate invoices across stores", "Streamline fulfillment with daily to-dos"). Pairs are 326 px.
- **Type.** 32 px claims, 20 px sub-claims, 16 px body, 12 px captions.
- **Motion.** 3 videos, muted. "Modals → Drawers" is a 664x480 clip that shows the change; the solution clips autoplay once (loop off).
- **Impact tiles.** Three bordered dark tiles: "10 Businesses", "2.5K Orders", "$120K Processed".
- **Why the UI looks strong.** Light product UI on a dark page, at a single consistent scale, cropped to the part that matters. Semantic color is explained in the copy ("Semantic color coding allows users to identify critical values at a glance.").
- **Story without text.** Tally marks to 48 SKU cards, then the recipe link, then the counter moving.

---

## 7. Megan Yap: Splunk self-healing pipeline

https://meganyap.me/work/splunk (Sole Product Designer, intern, Jul to Aug 2025)

![splunk-hero](/workspace/dialogue-agent/shots/refs/splunk-hero.jpg)
Splunk fold: the hero is one AI investigation card set large on a pink gradient, then the title, a one-line outcome, and an orange meta bar. https://meganyap.me/work/splunk

![splunk-options](/workspace/dialogue-agent/shots/refs/splunk-options.jpg)
Entry point options as large frames with plus and minus rows beside each. https://meganyap.me/work/splunk

### How Megan Yap proves she is a good problem solver
- **Framing as a sequence.** Context, then a plain user problem H2: "It’s difficult and time-consuming to diagnose and resolve data ingestion issues." Then a labeled problem statement: "How might we allow users to efficiently identify potential root causes and remediation steps for triggered alerts?"
- **Constraint found inside the design.** "But here was the problem: these investigations were long latency tasks (they could take several hours), so how would users know how to come back if their corresponding alert was further down the page, or even on the next?"
- **Options weighed visibly.** Three entry points, each with plus and minus rows, e.g. "Separate Investigations page" and "Filter cards" ("Latency problem solved without information redundancy" against "Not up to accessibility standards"). Then a "FINAL PICK" label: "Hybrid approach: status cards + separate filter".
- **Goal as the yardstick.** "MY GOAL" callout: "Deliver exactly the right amount of context and supporting data for users to have trust in the AI diagnosis, without including irrelevant details".
- **Turning point.** "After leading feedback meetings with GDI SMEs, I found something new." The insight: "Each investigated alert can have multiple root causes, and each root cause can have multiple solutions."
- **Justified narrowing.** "We decided to reduce the scope to just high confidence one root cause per issue to avoid overwhelming users."
- **Critique as a starting move.** "I started by critiquing the prototype that was handed off from my manager."
- **Impact.** Three stat tiles: "95%" "FASTER TICKET RESOLUTION", "6,000+" ".CONF25 DEMO AUDIENCE", "50+" "DESIGN ITERATIONS". The third is effort, which Dialogue can copy.

### Content breakdown
- **Structure.** Numbered TOC: "01. Context", "02. User problem", "03. Entry point explorations", "04. Fleshing out the content", "05. Root cause: linear or tree-like?", "06. Final solution". Then Key flows and Reflection.
- **Opening.** "A sunny summer in Boulder, Colorado." as the context H2, then the stakes (demoed to 6,000+ people at .conf).
- **Heading style.** Small caps kicker (12 px, "ENTRY POINT EXPLORATIONS") over a 28 px serif sentence: "I needed to identify how this would integrate with the existing alerts page.", "What do Splunk users actually want to see?", "Figuring out how to deliver dense content in a lightweight way." A question in the TOC itself: "Root cause: linear or tree-like?"
- **Voice.** First person, candid: "Information overload! There’s so much going on." and "Too many tabs and too little content" as captions on rejected layouts.
- **Decisions.** Every chapter ends on a "FINAL PICK" or "FINAL SOLUTION" label and a one-line choice. Pros and cons use "+" and "-": "+ Order of information consumption now follows user workflow".
- **Controversial calls.** Backed by SMEs: "I figured the best people to talk to would be our in-house Getting Data In (GDI) SMEs". And in reflection: "Not all feedback needs to be followed, especially if those giving it are not in the user group being designed for."
- **Ending.** "Making a tangible impact on real users." plus three lessons as H3s, e.g. "In the real world, constraints change all the time".
- **Density.** About 1,070 words, 20 media, paragraphs of two to four sentences.

### Visual breakdown
- **Grid.** 1020 px content area (x=362), text column 928 px. Option frames 663 px with text to the right; pairs of 502 px; final picks 637 px centered inside a 1020 px orange-tinted band rgba(203, 120, 54, 0.2) with 12 px radius. Frames sit on a beige well rgb(234, 230, 219), 12 px radius.
- **Backgrounds.** Dark Splunk UI on vivid macOS-style wallpaper gradients (blue, orange), which makes dark enterprise UI pop.
- **Motion.** 4 videos, all autoplay, loop, muted, no controls: the handoff critique, an entry point option, and two final flows at 714x510.
- **Annotation.** Plus and minus rows next to each frame, a "FINAL PICK" label above the chosen frame, a tree diagram for the multiple root causes.
- **Why the UI looks strong.** The hero is the product's most important object, the AI investigation card, enlarged until its copy is readable: "The likely root cause is schema drift."
- **Story without text.** Three option frames, then one in an orange band; a tree diagram, then a single path.

---

## 8. Natalie Almosa: Notion Mail

https://nataliealmosa.ca/notion-mail (only primary designer, beta October 2024, GA April 2025)

![notionmail-hero](/workspace/dialogue-agent/shots/refs/notionmail-hero.jpg)
Notion Mail fold: full-bleed sky photo, serif H1, the inbox at 1272 px. https://nataliealmosa.ca/notion-mail

![notionmail-inbox](/workspace/dialogue-agent/shots/refs/notionmail-inbox.jpg)
Ownership line, team, then the inbox with a compose window on a soft sky background. https://nataliealmosa.ca/notion-mail

### How Natalie proves she is a good problem solver
- **Framing from research variety.** "No matter how many users we talked to, we never found two who used email the same way."
- **The reframe, in two sentences.** "How do you design for such variety? The answer: don't design the flows. Design the tools." This is the strongest single problem-solving line in the set.
- **Constraint turned into a principle.** The product's own model: "Just like Notion blocks, users can customize their inbox however they wish."
- **Decision with a reason.** Where to put AI: "We decided to inject AI into the most versatile email fundamental—labels." (her em dash, quoted exactly).
- **Showing value early.** "To show value immediately, we surface auto label suggestions to the user that is relevant to their specific use case."
- **Impact.** Ship dates stand in for metrics: "Launched to early beta in October 2024, and released to GA in April, 2025".

### Content breakdown
- **Structure.** Introduction, "How do you elevate email?", "Never write the same email twice", "An AI-Powered Experience". Short; about 400 words.
- **Opening.** H1 "Reimagining the inbox to think like you", then "The first inbox to be personalized for you." and ownership: "I worked end-to-end on every screen, menu and detail."
- **Heading style.** Questions and benefits, serif: "How do you elevate email?", "Never write the same email twice".
- **Voice.** Conversational, talks to the reader: "If you're reading this you're probably a recruiter". A kaomoji in the last line.
- **Density.** Very low text; the screens do most of the work.

### Visual breakdown
- **Grid.** H1 at 64 px over a full-bleed 1440 px photo; a 1272 px hero screen; then an 800 px column with 800x514 frames.
- **Backgrounds.** Every frame sits on the same soft watercolor sky, so a light-gray product looks premium and the set reads as one family.
- **Motion.** No video elements found; all 8 media are images.
- **Why the UI looks strong.** Real data in the screens (named senders, labels like "Work" and "School"), and generous crops that show the whole inbox structure.
- **Story without text.** Inbox, then customized views, then snippets with variables, then auto label suggestions.

---

## 9. Jess Fong: Patreon free content

https://jessfong.com/work/patreon-free-content (Product Design Intern, May to Aug 2026)

![patreon-hero](/workspace/dialogue-agent/shots/refs/patreon-hero.jpg)
Patreon fold: H1, subtitle, meta row, then a wide hero of phone frames on a light well. https://jessfong.com/work/patreon-free-content

![patreon-exploration](/workspace/dialogue-agent/shots/refs/patreon-exploration.jpg)
"Exploration 1: floating toast" with the pro above the clip and the con in a quote block below. https://jessfong.com/work/patreon-free-content

### How Jess proves she is a good problem solver (Patreon)
- **Framing.** A design problem as a perception problem: "An unlocked post shouldn’t look like any other free post." Then the question: "How do we communicate value to earn more investment from fans?"
- **Success criteria stated up front.** "Fans need to understand three things fast: this is normally paid, it was unlocked specifically for them, and free membership means more unlocks like it, enticing them to return."
- **Tension as a heading.** "Where is the line for being attention-grabbing and feeling gimmicky?"
- **Constraint.** What worked on desktop does not port: "on feed, fans are scrolling fast, space is tight, and the same experience couldn't just port over." And time: "The team wanted to push this experiment out in 3 weeks".
- **Options weighed.** Three explorations, each a "Pro:" line, a video, and a "Con:" quote, e.g. "Con: The tooltip would un-ideally require content to be pushed down and would potentially be content overload for a fan at this moment."
- **Testing changes the words.** "My internal testing revealed that "Unlocked for you" was ambiguous, leaving users unsure if a post was actually free or not. I tested leading with "Free for you" instead, which was significantly clearer."
- **Turning point and decision.** "Given density concerns on feed, this led me to believe that the value-proposition moment we were seeking should happen on the post page, not the feed." Heading: "Winning design: Modal as a new-user experience".
- **A rejected idea kept, with a reason.** "Rather than discarding the idea, I kept it in view as a direction worth building toward."
- **Impact without results yet.** Reach and scope instead: "rolling out to ~6M users to test our hypothesis around repeat engagement and conversion." and "I shipped the the feed and email designs that covered 3 variants of the experiment."

### How Jess proves she is a good problem solver (Reddit)
- **Framing as a gap.** "While Reddit had already developed live scoreboards for leagues like the NFL and NBA, there was a gap for MLB community." https://jessfong.com/work/reddit
- **Structure before screens.** "We knew our scoreboard modules would be broken down into three phases: pre-game, live, and post-game." and "I worked backwards to organize overlapping information vs. distinct information across the three phases".
- **Each decision with a reason.** "Adaptive tables" / "This was necessary to accomodate for the number of scores while keeping even spacing." "Simplified visualization" / "The baseball diamond provides immediate visual recognition of game status, reducing cognitive load while tracking live progress."
- **Constraint named in reflection.** "Designing within Reddit’s ecosystem" / "We had to get creative with how we presented complex, dynamic data like live scores and game stats within a limited UI toolkit".
- **Impact honest.** "Our MLB scoreboard module is now being beta-tested in various baseball subreddits."

### Content breakdown (both)
- **Structure (Patreon).** OVERVIEW, PROBLEM, SOLUTION (preview), DEFINE, IDEATE, DESIGN DECISIONS, SOLUTION, EXTENDING CROSS-PLATFORM, FINAL FLOWS, REFLECTION. Left TOC: Overview, Define, Ideate, Design Decisions, Solution, Reflection.
- **Structure (Reddit).** OVERVIEW (Context, Our Goal, My Impact), RESEARCH, DESIGN DECISIONS, SOLUTION (Pre-game, Live Game, Post-game), NEXT STEPS, REFLECTION (Challenges).
- **Opening.** H1 plus a subtitle that says the scope: "Crafting rewarding experiences across Patreon's feed and emails"; Reddit: "Boosting live engagement through live scoreboards, reaching over 1.2 million monthly readers across baseball subreddits."
- **Heading style.** Uppercase 18 px kicker over a 24 px sentence. Sub-decisions as questions: "Where and how do we present the "recsplanation"?", "Do sparkles signify AI?", "What about the email entry point?"
- **Voice.** First person, specific, a little playful ("recsplanation"). Pros and cons are labeled words, not icons.
- **Ending.** "What I learned" with H3 lessons: "Find ways to test conviction when the direction is ambiguous", "Good concepts can point toward what's next, even if they don't fit now".
- **Density.** Patreon about 1,055 words, 21 media (9 video). Reddit about 700 words, 19 media (3 video).

### Visual breakdown (both)
- **Grid.** 800 px column (x=455) with a 200 px mono-type TOC on the left. Heroes break out to 1285 px. Reddit design decisions use a 345 px text column beside a 431 px frame.
- **Frames.** Phone frames on a light gray well for feed work; email layouts as tall full-column images (800x855).
- **Motion.** Patreon's explorations, solution and final flows are all autoplay loop clips at 800x550 to 800x617, so each option is seen moving before its con. "Keep reading" cards have hover videos (autoplay off, loop on).
- **Annotation.** Reddit uses orange leader lines with small mono labels ("Poll for pre-game fan engagement", "Tap to view more stats").
- **Before and after.** Patreon's "Unlocked for you" versus "Free for you" tag, and the sparkle to star icon swap, each in its own frame.
- **Story without text.** Patreon: three moving options, then the modal. Reddit: competitor scoreboards, then the IA map, then the three phases.

![reddit-hero](/workspace/dialogue-agent/shots/refs/reddit-hero.jpg)
Reddit fold. https://jessfong.com/work/reddit

![reddit-decisions](/workspace/dialogue-agent/shots/refs/reddit-decisions.jpg)
Reddit design decisions: a short reason on the left, the annotated frame on the right. https://jessfong.com/work/reddit

---

## 10. Cross-cutting: what makes a case study prove problem solving

### The problem-solving moves most of them share
1. **Reframe the ask.** Christine: "the surface-level ask was to modernize the interface. But the real question was: why were 85% of users abandoning before publishing?" Natalie: "don't design the flows. Design the tools."
2. **State the success criteria before the options.** Jess: "Fans need to understand three things fast". Megan Yap's "MY GOAL" callout.
3. **Make the problem countable.** Megan Phi: "4 designs x 3 colors x 4 sizes = 48 different combinations". Caleb: "6/30 subjects".
4. **Name the constraint where it bites.** Megan Yap: "these investigations were long latency tasks (they could take several hours)". Rachel: "Apple's API limitations". Jess: "space is tight".
5. **Weigh options visibly, each with a cost.** Jess's "Pro:" and "Con:", Megan Yap's plus and minus rows and "FINAL PICK", Caleb's rows, Rachel's "Exploration 1".
6. **Show the turning point.** Megan Yap: "After leading feedback meetings with GDI SMEs, I found something new." Rachel: "However, the problem with this approach..." Jess: "Unlocked for you" was ambiguous.
7. **Justify the decision in one sentence that includes what was rejected.** Rachel: "Instead of ... I decided". Jess: "should happen on the post page, not the feed." Megan Yap: "reduce the scope to just high confidence one root cause per issue to avoid overwhelming users."
8. **Handle impact honestly.** Megan Phi's "We've since wound down, but...", Jess's "now being beta-tested", Megan Yap's "50+" "DESIGN ITERATIONS", Rachel's handoff.

### /dialogue checklist, problem-solving first
- [ ] **Reframe.** One sentence that turns the brief into the real question (from "show research answers" to "a prose answer can't say how many").
- [ ] **Success criteria.** Before options, say what a good answer must let the reader do, in three short clauses (Jess pattern).
- [ ] **Countable problem.** One figure plus caption that turns the problem into arithmetic (Megan Phi pattern), e.g. how many participants a prose answer hides behind "many".
- [ ] **Constraint where it bites.** Name Dialogue's real constraints in the section where they force a choice: the 448 px panel, what Dialogue measures, clip weight.
- [ ] **Options with pros and cons.** Each option frame gets one pro and one con, then a "final pick" line (Megan Yap, Jess).
- [ ] **Turning point.** One "I found something new" or "First pass ... However" moment, in Mudit's words.
- [ ] **Decision sentence with the rejected option.** "Instead of X, I decided Y" or "Y, not X".
- [ ] **A rejected idea kept for later**, with the condition (Jess's tap to unlock).
- [ ] **Impact handled honestly.** Say what shipped and what is concept; use effort counts (versions built, iterations) instead of outcome numbers.
- [ ] **Learnings that name a limit.**

Then the craft checks: problem H2 in the fold; hero is the key object enlarged (Megan Yap's AI card); final pick in a tinted band; muted autoplay loops; one consistent background for all frames (Natalie, Megan Phi); kickers as TOC labels; 800 to 1,100 words.

### Moves mapped to Dialogue sections
| Dialogue section | Problem-solving move | Source |
|---|---|---|
| Hero | Enlarge the answer card itself until its copy is readable | Megan Yap Splunk hero |
| Problem | Reframe: the ask, then the real question | Christine; Natalie |
| Problem figure | Make it countable, figure plus arithmetic caption | Megan Phi "48 different combinations" |
| Before options | Success criteria in three clauses | Jess "three things fast"; Megan Yap "MY GOAL" |
| Counts / Levels | Options with pro and con, "final pick" band | Megan Yap; Jess; Caleb |
| Depth (clips) | Constraint where it bites (clip weight, panel width) | Megan Yap latency; Jess "space is tight" |
| Data viz | Decision sentence naming the rejected option | Rachel Notion; Jess "not the feed" |
| Reversal (placeholder) | Turning point from feedback | Megan Yap "I found something new"; Rachel "First pass" |
| Thin data / ruled out | Rejected idea kept for later, with a condition | Jess tap to unlock |
| Shipped and next | Honest impact plus effort counts | Megan Phi; Megan Yap "50+"; Jess beta |
| Takeaway | Lessons that name a limit | Rachel; Megan Yap |
