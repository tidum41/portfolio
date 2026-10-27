# Hero findings (87 portfolios, Oct 26 2026)

Method: Playwright with JavaScript on, screenshots at 1440x900 and 390x844, and a script that measured the fold (visible words, largest text px and weight, coverage, where the first large image appears, about, resume and social links, video, custom cursor). Set A: 21 senior design engineers and designers plus 6 students. Set B: 60 live portfolios from [Open Doors](https://opendoorscareers.com/portfolios) (70 listed; 10 were dead, password-locked or failed TLS). **Editor's Picks (EP)** = Portfolio of the Week ([Jenn Choi](https://jennwchoi.com/)) plus the 2025 year-end best-of that rendered ([Rachel Chen](https://www.rachelchen.tech/), [Jackson Ringger](https://chaachiedesigns.framer.website/), [Andrea Da Silva](https://adasilv2.framer.website/), [Airla Fan](https://airladesigns.com/)). Miggy Fajardo's and Howie Gong's sites didn't load. The text signals are regex counts that I checked by hand.

## Findings
1. **Work is visible almost immediately.** In 55 of 60 Open Doors sites a large image or video starts within the first 900px (49 within 600px). All 5 EPs do this. Senior design engineers instead list named projects as text (10 of 21: [Emil](https://emilkowal.ski) Sonner and Vaul, [Paco](https://paco.me) ⌘K). Either way, the hero points at work and isn't a destination on its own.
2. **Juniors go big, seniors go small.** Median largest text is 44px on Open Doors (34 of 60 at 40px or more, only 7 at 24px or less) and 49px on EPs. 12 of 21 seniors top out at 24px or less, usually the name as a label ([shadcn](https://shadcn.com), [Jakub](https://jakub.kr)).
3. **Short copy.** The Open Doors median is 56 words above the fold at 1440, EPs 48, seniors about 108 (in a single narrow column). EPs also leave the most whitespace: median coverage 0.37, against 0.55 for the rest of Open Doors.
4. **"Designer who builds" is the dominant junior claim.** About 15 of 60 Open Doors heroes claim code or shipping in plain words: "Product Designer who ships the code" ([Jenn Choi](https://jennwchoi.com/), EP), "From user research to production code" ([Christine Liang](https://www.christineliangdesign.com/)), "designs how products feel and builds how they work, end to end" ([Uday Shankar](https://www.uxdayshankar.com/)), "I design and build my ideas." ([Justin Shi](https://justinshi.me/)), "a designer built on engineering" ([Beverly Yip](https://www.bevyip.com/)). 23 of 60 mention AI.
5. **Role plus place is how credibility shows up.** 21 of 60 Open Doors heroes have a Currently or Previously @ line ([Rachel Chen](https://www.rachelchen.tech/) @ Ramp, [Michelle Liu](https://www.liumichelle.com/) Instagram, Roblox and NASA, [Caleb Wu](https://www.calebwu.ca/) @ Ando), as do 16 of 21 seniors. School shows on 14 of 60. Numbers almost never appear: 3 of 60, and 2 of 27 in set A.
6. **About and resume are table stakes, and the case studies are the depth.** About links appear on 52 of 60 sites, LinkedIn 53, resume 42, email 40. GitHub appears on only 9 of 60, but it's common among design engineers. 16 of 60 mention NDA or password protection. Card format: media is about 3:2 (median aspect 1.51). EP cards are squarer (1.26) and often hold live UI or video (36 of 60 sites use video, 21 hide the cursor for a custom one).
7. **One personality move, kept up to date.** A live clock or location ([Jenn Choi](https://jennwchoi.com/), [Siddharth Hardikar](https://siddharthhardikar.framer.website/), [Ryo Lu](https://ryo.lu)), a freshness stamp ([Cindy Ly](https://www.cindyly.design/) "Last updated 10/26"), or a toy ([Andrea Da Silva](https://adasilv2.framer.website/)). Intro gates and loaders ([Megan Yap](https://meganyap.me/), [Rita Wang](https://www.ritawangarchive.com/)) leave the first paint empty. Availability lines appear on 7 of 60 ("Open to 2027 roles", [Justin Mason](https://www.justinmasondesign.com/)).

## What Editor's Picks do differently
- **One memorable idea, executed fully,** rather than more signals. 0 of 5 show school, metrics or availability in the hero, and only 1 of 5 has a role-at-company line (Rachel, @ Ramp).
- **Bigger type and fewer words, with more air:** 49px median, 48 words, coverage 0.37.
- **Work at or near the top** in all 5, and squarer cards.
- The idea is either a **sentence with voice** (Rachel's "builds for fun", Jackson's coloured italics, Jenn's "ships the code") or a **hero you can touch** (Andrea's toy canvas, Airla's 3D orbit of work).

## How technical skill shows without the word "technical"
Name the artifact (shadcn: "I created shadcn/ui"), make the hero or a card a working UI ([Carolyn Lee](https://www.carolynlee.me)'s live card, Ryo's ryOS), add code-native details (`npm i`, ⌘K, GitHub link), and name a tool once next to a shipped thing ([Nikolas Klein](https://nikolasklein.de): code layers in Figma). A stack list on its own reads junior.

## Recommended hero for Mudit (revised)
The evidence shifts the structure toward the EP pattern: a name sentence with one build claim, a Currently line, and the work right under it.
1. **Name sentence, about 44 to 52px, Georgia:** "Mudit is a product designer who prototypes in code." (Alternative: "Cognitive science taught me how people think. Code lets me test it.")
2. **One Currently line, small:** "Leading Cursor @ UCLA. Cognitive science at UCLA, graduating June 2027."
3. **Links row:** Work · About · Resume · Email (resume is missing today; 42 of 60 have one).
4. **Work cards right below, labels visible at 1440:** Dialogue, JOOLA, All in One, BruinLease. Keep the live UI inside the cards; that is the technical proof (show over tell).
5. **One personality move:** keep the halftone and drop the extra "Menu" control.
Don't add an availability line or numbers unless Mudit confirms them.
