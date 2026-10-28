# Portfolio reference: top product design case studies

Working reference for the Dialogue case study bot. Read live on Oct 27 and Oct 28 2026 (PT) with headless Chrome at 1440x900. Every quote below is copied from the live page or its text dump, with the source URL next to it. Layout numbers for Rachel Chen come from measuring the rendered DOM at 1440 wide (`shots/refs/rachel-all-layout.txt`). Screenshots and text dumps live in `/workspace/dialogue-agent/shots/refs/`.

How to use this page: Rachel Chen is the model for /dialogue, so her section is the deepest and ends with a mirror checklist. The other studies each get a content breakdown and a visual breakdown. The cross-cutting section at the end maps moves to Dialogue sections.

Coverage: Rachel Chen (8 project pages, 6 full case studies), Caleb Wu (RevisionDojo, Axis), Christine Liang (Butternut), Ori Porat, Sean Marcano, Rauno Freiberg, Julia Ro, plus two new ones, Ali Chitsaz (Basion) and Trang Cao (Spec AI). Aditya Das (adityad.as) failed again on Oct 28: WebFetch returned a 500 and curl got no response, so his notes stay at the two lines already in REFERENCE-CASE-STUDIES.md.

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

## 6. Rauno Freiberg (Vercel): Invisible details of interaction design

https://rauno.me/craft/interaction-design

![rauno-interaction-fold](/workspace/dialogue-agent/shots/refs/rauno-interaction-fold.jpg)
Rauno essay fold. https://rauno.me/craft/interaction-design

### Content breakdown
- **Structure.** Intro, then 13 detail sections (Metaphors, Kinetic Physics, Swipe Gestures, Responsive Gestures, Spatial Consistency, Fluid Morphing, Frequency & Novelty, Fidgetability, Scroll Landmarks, Touch Content Visiblity, Implicit Input, Fitts's Law, Scrolling), Closing Thoughts, Acknowledgments, Resources.
- **Opening.** Sets the stance: "This essay is not a tutorial nor a collection of guidelines."
- **Headings.** One or two word noun labels.
- **Voice.** Observational, precise, short sentences that name a familiar interaction and then its hidden rule: "As a designer, I love to animate everything." then "But it's not so obvious when not to animate something."
- **Backing calls.** Every claim sits next to a live demo or a real iOS example (the Dynamic Island under "Spatial Consistency").
- **Ending.** "There must be a reason."
- **Density.** About 3,500 words with 50 media; a demo every one or two paragraphs.

### Visual breakdown
- Narrow centered column, white background, tiny sticky TOC at left.
- 50 media, mostly small interactive or looping demos in rounded tiles, often phone-sized, with hands on iPad for touch.
- Each demo shows one detail; you can play with many of them.
- Story without text: strong. The demos prove each claim by feel.
- Why it matters for Dialogue: a familiar pattern (a chat answer, a clip player) earns attention through its details when each detail gets its own tiny demo.

---

## 7. Julia Ro: Designing with, for and alongside AI

https://www.juliarodesign.com/work/designing-with-for-and-alongside-ai

![julia-ai-fold](/workspace/dialogue-agent/shots/refs/julia-ai-fold.jpg)
Julia Ro fold. https://www.juliarodesign.com/work/designing-with-for-and-alongside-ai

### Content breakdown
- **Structure.** "What has actually changed?" essay, then "Case Study 1: AI Chat Experience" with Design Challenge, Technical Challenge, Process, v1, v2, Outcomes, Learnings.
- **Opening.** "This is part case study, part blog post."
- **Voice.** Honest and wry: "more heartburn and pivoting."
- **Versions.** "v1 Static prompted question experience" then "v2 Transparent Agent experience". The reason for v1 is risk: "In our ‘start simple’ we intentionally constrained the experience to pre-populated questions with tightly scoped responses."
- **Backing calls.** User truth stated first: "energy traders don’t trust AI in their workflows (yet)." The payoff line: "Rather than asking traders to believe the AI, we gave them the tools to interrogate it."
- **Missing certainty.** "(And when the system doesn’t have a confident answer, it says so, providing partial support without pretending to know everything.)"
- **Metrics.** Process speed instead of outcome numbers ("working feature that internal users were testing in ~1week").
- **Ending.** Three learnings in columns: "Learner + User + Creator", "Designing for a moving target", "With great power…"
- **Density.** About 1,350 words, dense blocks.

### Visual breakdown
- Landscape photo hero, then dark product UI screenshots (trading app, dark mode) at column width, a Storybook component list.
- Dark UI on a white page gives strong contrast; the v1 and v2 screens are the same frame size so the change reads side by side.

---

## 8. New: Ali Chitsaz, Basion "Beyond the Chat Box"

https://alich.design/casestudies/Basion (new pick; Senior Product Designer, Sep 2025 to Jul 2026; location not verified). Picked because it argues the same thing Dialogue does: some answers should not be prose.

![alich-basion-fold](/workspace/dialogue-agent/shots/refs/alich-basion-fold.jpg)
Basion fold: real product UI in a browser frame on a near-black page. https://alich.design/casestudies/Basion

### Content breakdown
- **Structure.** Overview, "Not every answer belongs in a text box", "The onboarding exploration that started GenUI", "From onboarding controls to a reusable system", "Designing the whole conversational lifecycle", "Handling more than the happy path", "From single controls to generated forms", "GenUI beyond data entry", "Collaboration and implementation", "What worked and what remained experimental", "What I learned".
- **Opening.** "Conversation was its main interface" then "But chat was not always the easiest way to answer."
- **Headings.** Claims in sentence case; the honest one is the best: "The components functioned. Agent selection remained inconsistent."
- **Voice.** Calm, precise, no hype. The reasoning is cognitive: "A checklist could give the same question a clearer scope and let the user respond through recognition rather than recall."
- **Decisions.** Each pattern documented in four parts (component, usage documentation, in-chat example, submitted state).
- **Missing metrics.** States them directly: "We did not have reliable GenUI-specific metrics". And names the real limit: "The main limitation was not whether the components could render. It was whether the agent selected them at the right moment."
- **Ending.** Principle line: "Use conversation for context and structured UI for precision."
- **Density.** About 1,600 words, "8 Min Read".

### Visual breakdown
- Dark page, light product UI inside a macOS-style browser frame, large and centered.
- Component sets shown in groups with one caption sentence each ("Components could be combined when a task required several related answers.").
- Story without text: the in-chat example frames show the component appearing inside a real conversation, then collapsing into a compact message after submit.

---

## 9. New: Trang Cao, Spec AI

https://trangcaoportfolio.framer.website/specai (new pick; Product Designer, Winter 2026; location not verified). Picked because its third tradeoff is Dialogue's spine: "More depth or more usability in AI responses?"

![trang-specai-fold](/workspace/dialogue-agent/shots/refs/trang-specai-fold.jpg)
Spec AI fold: bold title and subtitle, UI crop with cursor, left section TOC. https://trangcaoportfolio.framer.website/specai

### Content breakdown
- **Structure.** UI Audit, Competitive analysis, Constraint, Iteration, Trade-offs, Final Experience, What I learned, What's next (the left TOC lists exactly these).
- **Opening.** Audit of the existing product as numbered problems, including "AI responses were long and unstructured."
- **Headings.** The reversal is a heading: "It worked technically, but it broke the experience." with the lesson as H3s: "In AI products, speed to first value matters more than perfect output."
- **Decisions.** "The trade-offs" lists three as questions (force context upfront, show or hide reasoning, depth or usability). The answers live in the figures, not the text dump.
- **Before and after in words.** "Before" / "The experience was built around defining context upfront ." and "After" / "I shifted the flow from setup to intent ."
- **Structured answers.** "Feedback is structured into severity, impact, source and actions, so users can scan fast and act immediately."
- **Ending.** "What I learned" arrow list, then "What’s next".

### Visual breakdown
- Bold sans display type, gray second line, a cropped UI hero with a big blue cursor showing the first click.
- Wireframes are clickable ("Click on each frame to learn more about the process.").
- States shown as labeled sequences: "Emty state" (her spelling), "Default state", "Switching presets".

---

## 10. Cross-cutting

### Patterns most of them share
1. **The problem sits in a heading, early.** Rachel's "..." pair, Caleb's "Searching for your IB courses is ridiculously hard", Christine's "Over 300k users tried it. Fewer than 15% published.", Alich's "Not every answer belongs in a text box".
2. **Final first, process second.** Rachel ("The final flows were simple, but..."), Caleb (solution features, then "Where it all started"), Rachel's Figma and OpenAI (solution introduced before research).
3. **Rejected options are named, with a reason in the same unit.** Rachel's "Exploration 1/2" and verdict H3s, Caleb's check and minus rows, Christine's "rather than moving everything to a collapsible sidebar", Rachel's "Instead of ... I decided".
4. **One explicit reversal.** Caleb "What we initially assumed...", Rachel "First pass" then "However", Trang "It worked technically, but it broke the experience.", Alich "Agent selection remained inconsistent."
5. **Honesty about what is missing beats a weak number.** Sean "The product has not yet launched publicly.", Alich "We did not have reliable GenUI-specific metrics", Ori "Not a final number", Rachel ending with no metrics on 1Password, Notion and OpenAI.
6. **AI failure shown as a visible symptom.** Christine's "Changes Done", Trang's long unstructured answers, Ori's robot icon.
7. **Short endings with two or three lessons, one admitting a limit.** Rachel, Caleb, Christine ("If I had a few more weeks"), Julia.
8. **Real UI in real chrome on quiet backgrounds, one interaction per frame, much of it in motion.** Rachel, Alich, Christine, Rauno.

### Checklist for /dialogue
- [ ] Problem H2 pair inside the 1440x900 fold.
- [ ] Hero clip of the answer card in motion.
- [ ] Final answer card first, then the options it beat.
- [ ] Each option: heading, one "If we..." line, verdict with a reason from Dialogue's real constraints (448 px panel, what Dialogue measures, video weight).
- [ ] One "First pass" and "However" reversal, in Mudit's words.
- [ ] Decisions as "Instead of X, I decided Y".
- [ ] One tradeoff sentence for speed against depth.
- [ ] No invented outcome numbers; say what shipped and what is concept.
- [ ] "What I learned" with two lessons, one a limit.
- [ ] Figures: full column, light well, label inside the well, problem and solution tints.
- [ ] Clips: muted loops that play on view, pause and replay controls.
- [ ] Kickers that double as TOC labels.
- [ ] 800 to 1,100 words; P7 copy is 887 words, which is in range.

### Moves mapped to Dialogue sections
| Dialogue section | Move | Source |
|---|---|---|
| Hero | Autoplay loop of the answer card, wider than the column; meta row in three columns | Rachel, all projects |
| Problem | "..." H2 pair turning on "but"; prose-only answer as the visible symptom | Rachel 1Password and Notion; Christine "Changes Done" |
| Counts / Levels | Chosen card first, ruled-out options below, each with an "If we..." line and verdict | Rachel "Exploration 1"; Caleb evaluation rows |
| Depth (clips) | One interaction per clip, details framed as craft | Rauno; Rachel Etch sequence |
| Data viz | "Instead of X, I decided Y" on counts over percents; tradeoff line | Rachel Notion decisions; Rachel Figma tradeoff |
| Thin data | Structure where precision matters, prose where context matters | Alich "Use conversation for context and structured UI for precision." |
| Reversal (placeholder) | "First pass" then "However" in Mudit's words | Rachel Figma; Caleb |
| Shipped and next | What is live, then what is next, no invented numbers | Ori; Sean "has not yet launched publicly" |
| Takeaway | "What I learned", two lessons, one a limit | Rachel 1Password reflection |
| Whole page | Kickers as TOC, problem and solution well tints | Rachel Notion |
