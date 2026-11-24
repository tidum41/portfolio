# Dialogue system components (allowlist)

Read design/TASTE.md first. The Dialogue case study is built only by composing the components below. They are the set pinned at b056865 (cursor/dialogue-figure-parity-b9b1) plus the case-study shell.

A new component needs Mudit's explicit OK before it is built. When he approves one, add it to this list in the same PR. `npm run check:dialogue-system` fails when DialogueCaseStudyContent imports a component that is not listed here.

## Case-study shell
- `CaseStudyBody`
- `CaseStudyOpen`
- `CaseStudyPager`
- `CaseStudyTOC`
- `ScrollReveal`

## Figures and frames
- `DialogueProductFigure`
- `DialogueRachelFrame`
- `DialogueLiveFigure`
- `DialogueReactFigure`
- `StaticFigure`
- `DialogueLeadAnswerCompare`
- `DialogueChartLibrary`
- `DialogueInterviewPlayer`

## Product UI (Dialogue's real design system, DM Sans allowed inside)
- `StudyChatShell`
- `ScaledChatViewport`
- `UserMessageBubble`
- `ChatComposer`
- `QuerySearchStep`
- `QuoteFrequencyCard`
- `ThemeRankingCard`
- `CounterEvidence`
- `EvidenceFooter`
- `FollowUpChips`
- `SourcePill`
- `SourcesRow`
- `ClipCard`
- `ClipQuotes`
- `ClipThumbnails`
- `SyncedTranscript`
- `StudyPageChrome`
- `DialogueWordmark`
- `DialogueLauncherButton`
- `DialogueProductScenario`
- `FunnelChart`
- `LineChart`
- `icons`

## Charts
- `ChartVizCard`
- `ChartStackedBar`
- `ChartBarList`
- `ChartDotPlot`
- `ChartGroupedBars`
- `ChartRankList`
- `ChartLinePlot`

- `DenominatorReveal` (PENDING Mudit's OK: added in round depth-r1 at the supervising agent's request so exploration 2 can sit in the Data viz section. Built only from ChartVizCard and chart tokens. Revert: remove this line and the figure; see design/dialogue-explorations/STORY-CHANGES.md)

- `MoreList` (PENDING Mudit's OK: added in consult r1, STATES S12. Lives in DialogueMotionStage.tsx and is shown through `DialogueDemoStill live`. Built only from SourcePill, the quote row and the hero head line. Revert: remove the function, the `still="more"` branch and the Counts figure.)
- `DialogueDemoStill live` (PENDING Mudit's OK: an option on the existing still, not a new file. It renders a frozen final frame of DialogueMotionStage instead of a recorded JPG. Revert: drop the `live` prop and the `LiveStill` function; the JPG paths remain.)

## Scenarios
- `HeroChatCard`
- `HeroStructuredFigure`
- `AnatomyStructureFigure`
- `ChartGalleryFigure`
- `ChartOnlyFigure`
- `FullAnswerFigure`
- `LeadCompareAnswerCard`
- `ParagraphAnswerFigure`
- `QuoteFrameFigure`
- `QuoteListFigure` (consult r1: `grouped` shows quotes under a count per group with no chart, STATES S4)
- `SideSample` (round P8, pending Mudit OK: composed of QuoteListFigure and SourcePill, shows the quotes behind one side of a count as a sample with +N more)
- `DialogueDemoVideo` (round P10: muted looping recording of the live recreation with pause and replay; poster under reduced motion)
- `DialogueChatLive` (round P10: interactive recreation of the study chat on Dialogue's real keyframes, composed of UserMessageBubble, ChartVizCard, ChartStackedBar, SideSample and DialogueInterviewPlayer)
- `StructuredAnswerFigure`
- `ThinDataFigure`

## Not allowed without approval
- Round P "hearthside" figures (BeforeChatFigure, ScopePairFigure, CountsOpenFigure, ComparisonRowsFigure, LevelsToggleFigure, ClipsFigure, ThinPlanFigure, HeroLayeredFigure, QuoteCardH, HearthsideViewport). Their content can be rebuilt from the components above.
- PENDING Mudit's OK, dev page only (`/dev/dialogue-depth`), not importable on /dialogue until moved up into the allowlist: `EvidenceLayer` (explorations 1 and 4), `ChartChosen` (exploration 3), `LiveFigure` (exploration 5). Each lives in components/dialogue/depth/<Name>/ with a README and is gated by `npm run check:dialogue-depth`.
- PENDING (Mudit OK): `DeliveryDateTrial` (depth r2 variant D: composed of UserMessageBubble, AnswerCard, ChartVizCard, ChartBarList, QuoteRow and Grow; the case study's single interaction trial, with a stepped static fallback under reduced motion)
