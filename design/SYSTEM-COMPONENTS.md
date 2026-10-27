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
- `QuoteListFigure`
- `StructuredAnswerFigure`
- `ThinDataFigure`

## Not allowed without approval
- Round P "hearthside" figures (BeforeChatFigure, ScopePairFigure, CountsOpenFigure, ComparisonRowsFigure, LevelsToggleFigure, ClipsFigure, ThinPlanFigure, HeroLayeredFigure, QuoteCardH, HearthsideViewport). Their content can be rebuilt from the components above.
