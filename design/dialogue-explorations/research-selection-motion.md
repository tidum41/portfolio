# Selected-segment indicator: cut or travel?

Research for the Dialogue homepage card, Nov 22 2026. Question: when a new bar segment is selected, should the selection frame cut to it instantly or travel there?

## Findings
1. Emil Kowalski ranks interactions by frequency: tens of uses a day (hover, list navigation) means remove or sharply reduce the animation, and core repeated actions get none. https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md
2. Emil shows that an animated highlight in a list feels late next to the input that moved it, and that Raycast's lack of animation is the best experience for something used hundreds of times a day. https://emilkowal.ski/ui/you-dont-need-animations
3. Rauno Freiberg animated the active indicator in bmrks.com, found it sluggish within days even after speeding it up, and felt faster once he removed it (summarised by Learn UI). https://learn-ui.com/chapters/invisible-details/frequency-and-novelty
4. NN/g puts simple feedback such as a toggle at about 100ms, the edge of perception, where a change reads as almost instant but still connected to the action. https://www.nngroup.com/articles/animation-duration/
5. IBM Carbon gives selection and toggle feedback its fastest tokens, fast-01 70ms and fast-02 110ms, with productive easing. Its rule is that components don't animate unless the motion shows something the user would otherwise miss. https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview and https://github.com/carbon-design-system/carbon-components-svelte/blob/master/COMPONENT_GUIDELINES.md
6. Material 3 is the main counter-example. Its tab indicator moves on the default spatial spring and stretches while it travels, and the spec videos run about 700ms. https://md3.io/docs/components/tabs/ and https://github.com/flutter/flutter/pull/141954
7. Vercel's dashboard nav slides its tab indicator and hover pill to the new tab. Nico's write-up rebuilds it at 150ms linear, with a spring option. https://www.nico.fyi/blog/animated-nav-link-tabs-like-vercel
8. Apple's HIG treats a segmented control as a single choice whose job is to show the selection state clearly at a glance. It sets no rule for indicator travel. https://appguidelines.com/human-interface-guidelines/version/22/segmented-controls/

Secondary, unverified: design-system aggregators list Linear's interaction timing as about 160ms with an ease-out curve and no springs (https://mozaika.design/ds/linear).

## Recommendation
Keep the instant cut as the shipped default. The card stands in for an interaction a researcher repeats all day, and both Emil and Carbon say that kind of selection should land within about 100ms or not animate. Travel works when the motion explains where something went. Here the cursor and press already show that, so a sliding frame would add lag and the risk of two frames on screen. If Mudit prefers travel, keep it short (160 to 200ms) with no stretch and no overshoot, so it reads like Vercel's indicator and not like Material's 700ms spring.
