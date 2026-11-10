# Story principles

A checklist for case study writing and review. Each line is a test: a reviewer can mark it pass or fail on the page in front of them. Sources are named per line and listed in full at the bottom.

- [ ] Every major heading is a claim the section must prove, not a topic label. Test: cover the body, read the heading alone, and it still says something that could be wrong. Example: Rachel Chen, 1Password, "Apple passwords is visually dominant over 1Password for macOS", not "Research".
- [ ] The problem is named in a declarative heading within the first two sections, before any process. Example: Chen puts "Native macOS autofill is not supported on 1Password" in section two and ties it to broken trust in the same breath.
- [ ] Every decision carries its why in the same unit, heading plus paragraph, never in a later section. Example: Linear's auto archive changelog ties the feature to its principle, "Keep a manageable backlog", inside the paragraph that announces it.
- [ ] Each rejected option shows three things in one unit: the option, a one sentence conditional benefit, and a verdict heading with the reason. Example: Chen, "If we could disable macOS Autofill on Safari only, this would leave only the 1Password for Safari dropdown visible", verdict, "This just wasn't possible with Apple's API limitations."
- [ ] The problem state is shown, not described: a screenshot or artefact of the mess appears before the fix. Example: Chen shows the native dropdown overlaying the 1Password dropdown on Safari before proposing anything.
- [ ] Exhaustiveness is proved by naming what was actually tried, never by claiming rigor. Example: Chen writes that she tested every combination of macOS and Safari settings and read Apple's API documentation. The list is the evidence.
- [ ] At least one verdict is delivered by a real constraint, platform, data, or time, not by preference. Example: Chen's Safari explorations both die on Apple's API limits, so the solution has to route around the platform.
- [ ] A general claim is earned by one concrete case first. Example: Stripe's Treasury for agents post opens its proof with one named founder at Kubrio whose agent checks balances, failed payments, and refunds every morning, before any product level claim.
- [ ] Numbers appear only where they were measured, and they sit in the sentence that makes the claim. Example: Vercel's post on AI Gateway reports 16,000 runtime hours against 1,200 hours of actual CPU work, in the paragraph arguing for active CPU pricing.
- [ ] At least one heading carries tension, two forces pulling against each other. Example: Vercel, "Anyone can build agents, but it takes a platform to run them."
- [ ] Each media unit has a label plus at most one caption sentence saying what it proves, with no paragraph that redescribes the screen. Example: Aditya Das, Currents, labels a figure "Live Posting" with one sentence, "Users can see when others comment and post in live time."
- [ ] Sections stay short: a heading and one to two sentences before media does the talking. Example: Caleb Wu, RevisionDojo, runs the whole fast arc as eyebrow label, claim heading, and at most two sentences per unit, including "Students focus on just 6/30 subjects, so the remaining content adds friction instead of value."
- [ ] Decisions are owned in first person. Example: Das opens Currents with "I led everything design-related for Currents", and Wu writes "I created illustrations" for the search decision. If the page cannot say who decided, it has not told the story.
- [ ] A tradeoff is stated as a cost accepted, not a balance celebrated. Example: Chen rejects the UI code fix because it "would require a lot of engineering effort, and still result in a buggy and unreliable experience." The price is named, then the option dies.
- [ ] The closing names one specific imperfection, constraint, or reversal the work still carries. Example: Chen's reflection ends on technical constraints making the flow imperfect; Wu's key learnings admit the first search solution created the decision paralysis it was meant to fix.

- [ ] The cost is named in the same breath as the win, in the same sentence or the one right after it, never deferred to a limitations section. Test: underline every claim of benefit and check a price sits next to it. Example: Stripe's Sessions post recommends A/B testing checkout and admits in the same breath that testing two options "can take up to three weeks".
- [ ] What the writer did not have is admitted out loud, and the sentence after it says what they did anyway. Test: a page with no metrics, no customers, or no access says so in the body, not nowhere. Example: Caleb Wu, RevisionDojo, writes under Metrics that the feature "is currently in development so we don't have metrics on its efficacy yet", then reports what he observed in testing instead.
- [ ] Where there are no outcome metrics, count what can be counted honestly: steps, options, settings, rounds, interviews. Test: every number on the page is a count of something the writer touched, not a result they claim. Example: Chen's proof of diligence is a count of work, every combination of macOS and Safari settings tested, not a percentage improvement.

## Sources

- Rachel Chen, 1Password case study, rachelchen.tech/projects/1password
- Caleb Wu, RevisionDojo case study, calebwu.ca/RevisionDojo
- Aditya Das, Currents case study, adityad.as/currents
- Stripe, "Introducing Stripe Treasury for agents", stripe.com newsroom
- Linear changelog, "Auto-close and auto-archive" and "Agent assisted project updates", linear.app/changelog
- Vercel, "How AI Gateway runs on Fluid compute" and "Anyone can build agents, but it takes a platform to run them", vercel.com/blog
