# Reference study for /dialogue (round P7)

Read live on Oct 27 2026 with headless Chrome at 1440x900. Screenshots and text dumps are in `/workspace/dialogue-agent/shots/refs/`. Rachel Chen's pages scroll inside a container, so they were captured as eight viewport shots each (`rachel-1password-0..7.png`, `rachel-figma-0..7.png`). Aditya Das (adityad.as) timed out twice and is not included.

## Sources
| Designer | Case study | URL | Shots |
|---|---|---|---|
| Rachel Chen | 1Password macOS autofill | https://www.rachelchen.tech/projects/1password | `refs/rachel-1password-*.png`, `refs/www_rachelchen_tech_projects_1password.txt` |
| Rachel Chen | Figma ideas on mobile | https://www.rachelchen.tech/projects/figma | `refs/rachel-figma-*.png` |
| Caleb Wu | RevisionDojo search | https://www.calebwu.ca/RevisionDojo | `refs/www_calebwu_ca_RevisionDojo-full.png`, `-part0..3.png` |
| Caleb Wu | Axis | https://www.calebwu.ca/Axis | `refs/www_calebwu_ca_Axis-full.png` |
| Christine Liang | Butternut AI editor | https://christineliangdesign.com/works/butternut-ai | `refs/christineliangdesign_com_works_butternut_ai-full.png` |
| Ori Porat | AI conversational chat | https://www.ori-porat.design/work/ai-chat | `refs/www_ori_porat_design_work_ai_chat-full.png` |
| Sean Marcano | Moneda AI chat | https://www.seanmarcano.com/work/moneda-ai-chat | `refs/www_seanmarcano_com_work_moneda_ai_chat-full.png` |
| Rauno Freiberg (Vercel) | Invisible details of interaction design | https://rauno.me/craft/interaction-design | `refs/rauno_me_craft_interaction_design-full.png` |
| Julia Ro | Designing with AI | https://www.juliarodesign.com/work/designing-with-for-and-alongside-ai | `refs/www_juliarodesign_com_work_designing_with_for_and_alongside_ai-full.png` |

## What each one does

**Rachel Chen, 1Password.** Opens on a large product animation above the title, then one line of context, collaborators, timeline and scope. The problem is a split heading pair: "Native macOS autofill is not supported on 1Password..." and "...but it's not easy when you don't own the operating system!" Then "The final flows were simple, but there was a big problem hidden within." shows the result first and walks back to the hidden problem. Explorations are numbered ("Exploration 1: Disable macOS Autofill on Safari only"), each with a conditional ("If we could disable...") and a verdict heading. Small gray kicker labels sit over each h2 ("macOS Explorations"). Figures carry a "Before" chip inside the frame. Italic one-line asides mark handoffs ("I handed this off to the 1Password for Safari team!"). Ends on Reflection. Density: one claim, one sentence, one large figure, a lot of air.

**Caleb Wu, RevisionDojo.** Three hero images before any problem copy. Every h2 is a claim ("Searching for your IB courses is ridiculously hard"), with one or two sentences. Insights come as a pair of side-by-side cards, each with a heading claim and an illustration. Options are evaluated against named constraints with check and minus rows ("Easy implementation: already built onsite"), followed by a verdict callout ("The search bar was the best option."). The reversal is spelled out: "What we initially assumed to help with precise decision making, actually created decision paralysis." Ends on Key learnings. No metrics; counts come from the domain (6/30 subjects).

**Christine Liang, Butternut.** Splits the surface-level ask from the real question. Shows AI failure as a symptom a reader can picture ("AI Assist would reply 'Changes Done' with no explanation"). Puts the product on a competitive map before solutions.

**Ori Porat.** A section titled "The Hard Calls" and an ending titled "What Shipped and What's Coming". The ending separates what is live from what is next.

**Sean Marcano.** Principle as heading: "Designing for AI means designing the edges, not just the happy path." Maps resolved, ambiguous and failure paths for each intent.

**Rauno Freiberg.** Craft shown through many small live demos, each one detail with a short why. Shows that a familiar pattern earns attention through its details.

**Julia Ro.** Versions as v1 and v2 with the reason for each step ("start simple"), then what changed between them.

## Moves mapped to /dialogue
| Move | Source | Change on /dialogue | Status in P7 |
|---|---|---|---|
| Show the failure as a symptom the reader can see | Liang | Problem figure asks "How many shoppers misread..." and the prose can only say many and some | Done (loop 1) |
| Final first, then what it beat | Rachel, "final flows were simple, but..." | Levels shows the chosen card first at full width, ruled-out pair below, at every width | Done (loop 1) |
| Lead with the hard call | Ori "The Hard Calls"; Caleb evaluation | Data viz leads with the segments pair (counts over percents), the call the body argues | Done (loop 1) |
| Check and minus rows with a verdict line | Caleb Wu | Already in the chart library; the Data shape, Encoding and Tradeoff rows removed so the verdict reads as the conclusion | Done (loop 1) |
| Problem inside the first screen | Rachel, Caleb | Hero body cut to two sentences; problem h2 inside the 1440x900 fold | Done (loop 1) |
| Reversal sentence | Caleb "initially assumed... actually created" | Levels placeholder asks what Mudit assumed would help that ended up hurting | Prompt for Mudit (loop 2) |
| Separate what shipped from what is next | Ori "What shipped and what's coming" | Measure becomes "Counts shipped, and I'd test the rest on speed and depth together" | Done (loop 2) |
| Ending on reflection | Rachel Reflection, Caleb Key learnings | Takeaway keeps the spine line plus a learning placeholder | Prompt for Mudit |
| Craft in the details of a known pattern | Rauno | Clips framed as craft: starts at the moment, transcript follows, loads on tap | Done (P6) |
| Kicker labels over h2s | Rachel | Not applied: would be a new UI element; the TOC already labels sections. Needs Mudit's OK | Open |
| Large product media before the title | Rachel, Caleb | Not applied: TASTE locks figures to the 640 column and the hero order lives in CaseStudyOpen | Open |
| Before chip inside a figure | Rachel | Not applied: TASTE rejects status chips; the caption carries "before" | Rejected by TASTE |
| Paired insight cards | Caleb | Possible for the problem (prose answer next to the count answer) using the chart library pair layout; not built | Open |
