import DialogueSidebar from "../DialogueSidebar";
import DialogueStatCard from "../DialogueStatCard";
import DialogueBadge from "../DialogueBadge";
import { DurationStatIcon, InsightsStatIcon, InterviewsStatIcon } from "../stat-card-icons";
export default function Frame3DashboardFab() {
  return (
    <div className="[font-synthesis:none] wrap-anywhere flex flex-col w-[1512px] h-[709px] overflow-clip relative bg-[#F8F6F3] antialiased text-xs/4">
      <div className="h-[709px] flex w-full min-h-[709px] shrink-0">
        <div className="">
          <div className="[width:256px]" />
        </div>
        <div className="flex basis-[0%] flex-col grow min-h-0 min-w-0 bg-[#FCFBF9]">
          <div className="flex basis-[0%] flex-col grow min-h-0 overflow-clip">
            <div className="flex flex-col w-full max-w-7xl min-w-0 p-6 my-4 mx-auto">
              <div className="flex flex-col w-full mb-6 gap-6">
                <div className="flex flex-col w-full gap-2">
                  <div className="items-center flex w-full justify-between">
                    <div className="items-center flex gap-2">
                      <div className="text-[20px] leading-[140%] text-pretty wrap-normal font-medium text-[#1C1917]">
                        PS x Dialogue AI User Interview
                      </div>
                      <DialogueBadge tone="success">In progress</DialogueBadge>
                    </div>
                    <div className="items-center flex gap-4">
                      <div className="items-center h-9 flex shrink-0 justify-center py-2 px-4 rounded-lg gap-2 bg-[#F1EEEA]">
                        <div className="flex text-[14px] leading-[142.857%] w-max wrap-normal font-medium text-[#1C1917]">
                          Preview
                        </div>
                      </div>
                      <div className="items-center flex shrink-0 justify-center text-center rounded-lg gap-2 size-7">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" fontWeight="500" style={{ height: '16px', flexShrink: '0', width: '16px', textAlign: 'center', overflow: 'clip' }}>
                          <circle cx="12" cy="12" r="1" fontSize="14px" fontWeight="500" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
                          <circle cx="19" cy="12" r="1" fontSize="14px" fontWeight="500" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
                          <circle cx="5" cy="12" r="1" fontSize="14px" fontWeight="500" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#57534D]">
                      The study reveals that UCLA students are generally receptive to AI-moderated interviews, praising Dialogue AI for its natural voice, intuitive onboarding, and the low-pressure environment it creates. Participants feel more comfortable providing honest, critical feedback to an AI due to the absence of human judgment. However, they strongly prefer human moderators for sensitive or emotional topics and express concerns regarding data privacy and the lack of visual human connection. To drive adoption, Dialogue AI should leverage trusted campus networks, offer clear incentives, and provide more upfront context about the platform's purpose and data usage.
                    </div>
                  </div>
                </div>
                                <div className="flex w-full gap-8">
                  <DialogueStatCard label="Interviews" value="15" icon={<InterviewsStatIcon />} />
                  <DialogueStatCard label="Avg. duration" value="19m50s" icon={<DurationStatIcon />} />
                  <DialogueStatCard label="Insights" value="-" icon={<InsightsStatIcon />} />
                </div>
                <div className="w-full">
                  <div className="flex flex-col w-full gap-2">
                    <div className="items-center h-9 flex w-full justify-between mb-6 p-0.75 rounded-[10px] shrink-0">
                      <div className="flex">
                        <div className="items-center h-[calc(100%-1px)] flex basis-[0%] grow forced-color-adjust-none justify-center text-center py-2 px-4 rounded-lg gap-1 bg-[#F1EEEA] border border-solid border-[#00000000]">
                          <div className="flex text-[14px] leading-[142.857%] text-center w-max wrap-normal font-medium text-[#1C1917]">
                            Overall
                          </div>
                        </div>
                        <div className="items-center h-[calc(100%-1px)] flex basis-[0%] grow justify-center text-center py-2 px-4 rounded-lg gap-1 border border-solid border-[#00000000]">
                          <div className="flex text-[14px] leading-[142.857%] text-center w-max wrap-normal font-medium text-[#1C1917]">
                            Screener
                          </div>
                        </div>
                        <div className="items-center h-[calc(100%-1px)] flex basis-[0%] grow justify-center text-center py-2 px-4 rounded-lg gap-1 border border-solid border-[#00000000]">
                          <div className="flex text-[14px] leading-[142.857%] text-center w-max wrap-normal font-medium text-[#1C1917]">
                            Sections
                          </div>
                        </div>
                        <div className="items-center h-[calc(100%-1px)] flex basis-[0%] grow justify-center text-center py-2 px-4 rounded-lg gap-1 border border-solid border-[#00000000]">
                          <div className="flex text-[14px] leading-[142.857%] text-center w-max wrap-normal font-medium text-[#1C1917]">
                            Participants
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="basis-[0%] grow mb-6">
                      <div className="">
                        <div className="flex flex-col mb-6 py-6 rounded-[14px] gap-6 bg-[#FCFBF9] border border-solid border-[#E7E5E4]">
                          <div className="items-start [container-name:card-header] @container grid auto-rows-min grid-rows-[auto_auto] px-6 gap-1.5">
                            <div className="text-[16px] leading-[100%] text-pretty wrap-normal font-medium text-[#1C1917]">
                              Key insights
                            </div>
                          </div>
                          <div className="px-6">
                            <div className="">
                              <div className="mb-6">
                                <div className="mb-4">
                                  <div className="mb-4 p-3 rounded-lg bg-[#F1EEEA]">
                                    <div className="items-center flex gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" style={{ height: '16px', width: '16px', overflow: 'clip', flexShrink: '0' }}>
                                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '4px', boxSizing: 'border-box', width: '8px', transformOrigin: '0px 0px' }} />
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 11h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 16h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 11h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 16h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                      <div className="inline-block text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#57534D]">
                                        Objective 1
                                      </div>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] mt-1 text-pretty wrap-normal text-[#1C1917]">
                                      Explore how students perceive AI moderation compared to human-led interviews
                                    </div>
                                  </div>
                                  <div className="">
                                    <div className="items-center inline-flex w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 bg-[#F1EEEA] border border-solid border-[#00000000]">
                                      <div className="inline-block text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
                                        Neutral
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pl-6">
                                  <div className="rounded-lg">
                                    <div className="mb-2">
                                      <div className="text-[14px] leading-[142.857%] mb-1 text-pretty wrap-normal font-semibold text-[#1C1917]">
                                        AI moderation is valued for efficiency but lacks the empathy of human interaction.
                                      </div>
                                      <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#1C1917]">
                                        Students perceive AI interviews as highly efficient, convenient, and less intimidating than human-led interviews. However, they note that AI cannot replicate human empathy, pick up on body language, or build genuine rapport. This makes AI ideal for structured research but less suited for deeply personal conversations.
                                      </div>
                                    </div>
                                    <div className="flex">
                                      <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/29JBQM0HCYDE6F3YHQ51PJDCSM.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mb-6">
                                <div className="mb-4">
                                  <div className="mb-4 p-3 rounded-lg bg-[#F1EEEA]">
                                    <div className="items-center flex gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" style={{ height: '16px', width: '16px', overflow: 'clip', flexShrink: '0' }}>
                                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '4px', boxSizing: 'border-box', width: '8px', transformOrigin: '0px 0px' }} />
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 11h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 16h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 11h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 16h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                      <div className="inline-block text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#57534D]">
                                        Objective 2
                                      </div>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] mt-1 text-pretty wrap-normal text-[#1C1917]">
                                      Explore when students feel more comfortable sharing information with AI vs human moderators
                                    </div>
                                  </div>
                                  <div className="">
                                    <div className="items-center inline-flex w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 bg-[#DCFCE7] border border-solid border-[#00000000]">
                                      <div className="inline-block text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
                                        Positive
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pl-6">
                                  <div className="rounded-lg">
                                    <div className="mb-2">
                                      <div className="text-[14px] leading-[142.857%] mb-1 text-pretty wrap-normal font-semibold text-[#1C1917]">
                                        The absence of human judgment encourages more honest and critical feedback.
                                      </div>
                                      <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#1C1917]">
                                        Participants frequently mentioned that they feel more comfortable providing genuine, unfiltered, and even harsh feedback to an AI moderator. Because the AI lacks feelings and judgment, students do not feel the need to people-please or worry about social consequences, leading to higher quality objective data.
                                      </div>
                                    </div>
                                    <div className="flex">
                                      <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/29JBQM0HCYDE6F3YHQ51PJDCSM.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/4HB8VJGX8E1E6CJMQFR26WCGW4.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/6DQA1N0JB69ZE0BCKVS1GVW1XM.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mb-6">
                                <div className="mb-4">
                                  <div className="mb-4 p-3 rounded-lg bg-[#F1EEEA]">
                                    <div className="items-center flex gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" style={{ height: '16px', width: '16px', overflow: 'clip', flexShrink: '0' }}>
                                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '4px', boxSizing: 'border-box', width: '8px', transformOrigin: '0px 0px' }} />
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 11h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 16h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 11h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 16h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                      <div className="inline-block text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#57534D]">
                                        Objective 3
                                      </div>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] mt-1 text-pretty wrap-normal text-[#1C1917]">
                                      Identify topics or contexts where AI moderation is preferred or not preferred
                                    </div>
                                  </div>
                                  <div className="">
                                    <div className="items-center inline-flex w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 bg-[#FFE2E2] border border-solid border-[#00000000]">
                                      <div className="inline-block text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
                                        Negative
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pl-6">
                                  <div className="rounded-lg">
                                    <div className="mb-2">
                                      <div className="text-[14px] leading-[142.857%] mb-1 text-pretty wrap-normal font-semibold text-[#1C1917]">
                                        Students strongly prefer human moderators for sensitive or emotional topics.
                                      </div>
                                      <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#1C1917]">
                                        While AI is accepted for general feedback and technical interviews, participants draw a hard line at discussing highly personal, emotional, or sensitive topics with a machine. They feel that an AI cannot genuinely understand or empathize with complex human experiences, making such conversations feel dystopian or inappropriate.
                                      </div>
                                    </div>
                                    <div className="flex">
                                      <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/29JBQM0HCYDE6F3YHQ51PJDCSM.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mb-6">
                                <div className="mb-4">
                                  <div className="mb-4 p-3 rounded-lg bg-[#F1EEEA]">
                                    <div className="items-center flex gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" style={{ height: '16px', width: '16px', overflow: 'clip', flexShrink: '0' }}>
                                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '4px', boxSizing: 'border-box', width: '8px', transformOrigin: '0px 0px' }} />
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 11h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 16h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 11h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 16h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                      <div className="inline-block text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#57534D]">
                                        Objective 4
                                      </div>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] mt-1 text-pretty wrap-normal text-[#1C1917]">
                                      Determine what motivates students to sign up, return for future interviews, and recommend the platform to peers
                                    </div>
                                  </div>
                                  <div className="">
                                    <div className="items-center inline-flex w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 bg-[#DCFCE7] border border-solid border-[#00000000]">
                                      <div className="inline-block text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
                                        Positive
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pl-6">
                                  <div className="rounded-lg">
                                    <div className="mb-2">
                                      <div className="text-[14px] leading-[142.857%] mb-1 text-pretty wrap-normal font-semibold text-[#1C1917]">
                                        Financial incentives and referral programs are key drivers for student participation.
                                      </div>
                                      <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#1C1917]">
                                        Students are highly motivated by monetary compensation that accurately reflects the time spent on the interview. Additionally, implementing a referral system where students can earn rewards for inviting peers would significantly boost word-of-mouth recommendations and long-term engagement.
                                      </div>
                                    </div>
                                    <div className="flex">
                                      <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/6DQA1N0JB69ZE0BCKVS1GVW1XM.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/29JBQM0HCYDE6F3YHQ51PJDCSM.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/4HB8VJGX8E1E6CJMQFR26WCGW4.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="">
                                <div className="mb-4">
                                  <div className="mb-4 p-3 rounded-lg bg-[#F1EEEA]">
                                    <div className="items-center flex gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" style={{ height: '16px', width: '16px', overflow: 'clip', flexShrink: '0' }}>
                                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '4px', boxSizing: 'border-box', width: '8px', transformOrigin: '0px 0px' }} />
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 11h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M12 16h4" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 11h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M8 16h.01" fontSize="14px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                      <div className="inline-block text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#57534D]">
                                        Objective 5
                                      </div>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] mt-1 text-pretty wrap-normal text-[#1C1917]">
                                      Identify effective discovery and acquisition channels within student communities
                                    </div>
                                  </div>
                                  <div className="">
                                    <div className="items-center inline-flex w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 bg-[#DCFCE7] border border-solid border-[#00000000]">
                                      <div className="inline-block text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
                                        Positive
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pl-6">
                                  <div className="rounded-lg">
                                    <div className="mb-2">
                                      <div className="text-[14px] leading-[142.857%] mb-1 text-pretty wrap-normal font-semibold text-[#1C1917]">
                                        Trusted campus organizations and academic departments are the best acquisition channels.
                                      </div>
                                      <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#1C1917]">
                                        Participants indicated they would be most likely to discover and trust Dialogue AI if it were introduced through credible campus sources. Partnering with student clubs, professors, and research-heavy departments provides the necessary legitimacy to overcome initial skepticism about AI tools.
                                      </div>
                                    </div>
                                    <div className="flex">
                                      <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 size-6">
                                        <div className="items-center flex justify-center rounded-full bg-[#E5E7EB] border-2 border-solid border-[#F8F6F3] size-full">
                                          <div className="flex text-[12px] leading-[133.333%] text-pretty wrap-normal text-[#4A5565]">
                                            +1
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col mb-6 py-6 rounded-[14px] gap-6 bg-[#FCFBF9] border border-solid border-[#E7E5E4]">
                          <div className="items-start [container-name:card-header] @container grid auto-rows-min grid-rows-[auto_auto] px-6 gap-1.5">
                            <div className="text-[16px] leading-[100%] text-pretty wrap-normal font-medium text-[#1C1917]">
                              Popular insights
                            </div>
                          </div>
                          <div className="px-6">
                            <div className="">
                              <div className="mb-6">
                                <div className="mb-4">
                                  <div className="items-center inline-flex w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 bg-[#DCFCE7] border border-solid border-[#00000000]">
                                    <div className="inline-block text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
                                      Positive
                                    </div>
                                  </div>
                                </div>
                                <div className="">
                                  <div className="pl-6">
                                    <div className="mb-4 rounded-lg">
                                      <div className="">
                                        <div className="mb-2">
                                          <div className="text-[14px] mb-1 leading-[142.857%] text-pretty wrap-normal font-semibold text-[#1C1917]">
                                            Email verification is viewed as a necessary and standard security step.
                                          </div>
                                          <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal font-medium text-[#1C1917]">
                                            Users did not mind the extra step of verifying their email, recognizing it as a standard practice for securing accounts. The interface for entering the code was clear, and the emails arrived promptly, resulting in a smooth experience.
                                          </div>
                                        </div>
                                        <div className="-ml-1 py-2">
                                          <div className="flex">
                                            <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/4VX16Z5BXWR4B37R159AKN8YEE.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/4HB8VJGX8E1E6CJMQFR26WCGW4.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 size-6">
                                              <div className="items-center flex justify-center rounded-full bg-[#E5E7EB] border-2 border-solid border-[#F8F6F3] size-full">
                                                <div className="flex text-[12px] leading-[133.333%] text-pretty wrap-normal font-medium text-[#4A5565]">
                                                  +2
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-4 rounded-lg">
                                      <div className="">
                                        <div className="mb-2">
                                          <div className="text-[14px] mb-1 leading-[142.857%] text-pretty wrap-normal font-semibold text-[#1C1917]">
                                            The AI's voice is surprisingly natural and puts users at ease.
                                          </div>
                                          <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal font-medium text-[#1C1917]">
                                            Users were highly impressed by the tone, pacing, and intonation of the AI voice, noting that it sounded much more human than expected. This friendly and supportive voice helped alleviate initial anxieties and made them feel comfortable proceeding.
                                          </div>
                                        </div>
                                        <div className="-ml-1 py-2">
                                          <div className="flex">
                                            <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/6DQA1N0JB69ZE0BCKVS1GVW1XM.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/4HB8VJGX8E1E6CJMQFR26WCGW4.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 size-6">
                                              <div className="items-center flex justify-center rounded-full bg-[#E5E7EB] border-2 border-solid border-[#F8F6F3] size-full">
                                                <div className="flex text-[12px] leading-[133.333%] text-pretty wrap-normal font-medium text-[#4A5565]">
                                                  +2
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-4 rounded-lg">
                                      <div className="">
                                        <div className="mb-2">
                                          <div className="text-[14px] mb-1 leading-[142.857%] text-pretty wrap-normal font-semibold text-[#1C1917]">
                                            Dialogue AI exceeds expectations with its natural conversational flow.
                                          </div>
                                          <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal font-medium text-[#1C1917]">
                                            Participants expected a robotic, text-to-speech experience but were impressed by how well the AI understood them and maintained a smooth conversation. The natural tone and responsiveness made the interview feel much more engaging than previous AI tools they had used.
                                          </div>
                                        </div>
                                        <div className="-ml-1 py-2">
                                          <div className="flex">
                                            <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/29JBQM0HCYDE6F3YHQ51PJDCSM.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/2QBH6RMGWRZ4B6ZX258AXZ1MBE.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 size-6">
                                              <div className="items-center flex justify-center rounded-full bg-[#E5E7EB] border-2 border-solid border-[#F8F6F3] size-full">
                                                <div className="flex text-[12px] leading-[133.333%] text-pretty wrap-normal font-medium text-[#4A5565]">
                                                  +1
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="rounded-lg">
                                      <div className="">
                                        <div className="mb-2">
                                          <div className="text-[14px] mb-1 leading-[142.857%] text-pretty wrap-normal font-semibold text-[#1C1917]">
                                            Google SSO provides a frictionless and expected sign-in experience.
                                          </div>
                                          <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal font-medium text-[#1C1917]">
                                            Participants found the account creation process to be incredibly smooth and standard, largely due to the availability of Google Single Sign-On. It matched their mental models of modern web applications, allowing them to bypass password creation entirely.
                                          </div>
                                        </div>
                                        <div className="-ml-1 py-2">
                                          <div className="flex">
                                            <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/6DQA1N0JB69ZE0BCKVS1GVW1XM.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/1HV8DRRFDP4WW1J0J3PH2HWVZ0.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/2QBH6RMGWRZ4B6ZX258AXZ1MBE.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 size-6">
                                              <div className="items-center flex justify-center rounded-full bg-[#E5E7EB] border-2 border-solid border-[#F8F6F3] size-full">
                                                <div className="flex text-[12px] leading-[133.333%] text-pretty wrap-normal font-medium text-[#4A5565]">
                                                  +1
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="">
                                <div className="mb-4">
                                  <div className="items-center inline-flex w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 bg-[#F1EEEA] border border-solid border-[#00000000]">
                                    <div className="inline-block text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
                                      Neutral
                                    </div>
                                  </div>
                                </div>
                                <div className="">
                                  <div className="pl-6">
                                    <div className="rounded-lg">
                                      <div className="">
                                        <div className="mb-2">
                                          <div className="text-[14px] mb-1 leading-[142.857%] text-pretty wrap-normal font-semibold text-[#1C1917]">
                                            The platform's value becomes clear only after the interview begins.
                                          </div>
                                          <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal font-medium text-[#1C1917]">
                                            Participants noted that the onboarding flow did not effectively communicate the unique value of Dialogue AI. It wasn't until they actually started conversing with the AI that they understood the product's vision and quality.
                                          </div>
                                        </div>
                                        <div className="-ml-1 py-2">
                                          <div className="flex">
                                            <div className="flex shrink-0 rounded-full overflow-clip bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/2QBH6RMGWRZ4B6ZX258AXZ1MBE.jpg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                              <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                            </div>
                                            <div className="flex shrink-0 rounded-full overflow-clip -ml-2 size-6">
                                              <div className="items-center flex justify-center rounded-full bg-[#E5E7EB] border-2 border-solid border-[#F8F6F3] size-full">
                                                <div className="flex text-[12px] leading-[133.333%] text-pretty wrap-normal font-medium text-[#4A5565]">
                                                  +2
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col py-6 rounded-[14px] gap-6 bg-[#FCFBF9] border border-solid border-[#E7E5E4]">
                          <div className="items-start [container-name:card-header] @container grid auto-rows-min grid-rows-[auto_auto] px-6">
                            <div className="text-[16px] leading-[100%] text-pretty wrap-normal font-medium text-[#1C1917]">
                              Recommendations
                            </div>
                          </div>
                          <div className="px-6">
                            <div className="pl-6">
                              <div className="text-[14px] leading-[142.857%] mb-4 text-pretty wrap-normal text-[#1C1917]">
                                Introduce a brief, engaging onboarding tutorial that explains Dialogue AI's purpose, value proposition, and data privacy measures before the interview begins.
                              </div>
                              <div className="text-[14px] leading-[142.857%] mb-4 text-pretty wrap-normal text-[#1C1917]">
                                Implement a referral program and partner with trusted student organizations to drive awareness and acquisition.
                              </div>
                              <div className="text-[14px] leading-[142.857%] mb-4 text-pretty wrap-normal text-[#1C1917]">
                                Add a visual element or avatar for the AI moderator to make the experience feel less sterile and more engaging.
                              </div>
                              <div className="text-[14px] leading-[142.857%] mb-4 text-pretty wrap-normal text-[#1C1917]">
                                Ensure time expectations are clearly and consistently communicated before the interview starts.
                              </div>
                              <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#1C1917]">
                                Provide post-interview feedback or summaries to participants to increase the perceived value of the experience.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="" />
      <div className="" />
      <DialogueSidebar />
      <div className="items-center h-15 flex shrink-0 w-15 justify-center absolute right-6 text-center z-50 bottom-6 p-px rounded-full gap-2 [box-shadow:#0000001A_0px_4px_6px_-1px,#0000001A_0px_2px_4px_-2px]" style={{ backgroundImage: 'linear-gradient(in oklab 180deg, oklab(79.3% 0.142 -0.033) 12%, oklab(100% 0 0) 92%)' }}>
        <div className="items-center flex justify-center text-center rounded-full bg-[#FFD8EE] size-full">
          <div className="grid grid-cols-[max-content] grid-rows-[max-content] mt-0.5 -ml-1 text-center">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fontSize="14px" fontWeight="500" width="24" height="24" style={{ height: '34px', gridColumnStart: '1', gridRowStart: '1', width: '34px', marginLeft: '4px', textAlign: 'center', overflow: 'clip' }}>
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fontSize="14px" fontWeight="500" fill="none" stroke="#B43F7F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
            </svg>
            <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" fontSize="14px" fontWeight="500" width="22" height="22" style={{ height: '16px', gridColumnStart: '1', gridRowStart: '1', width: '16px', marginLeft: '22px', textAlign: 'center', overflow: 'clip' }}>
              <path d="M18.998 2V6M20.998 4H16.998M2.999 16V18M3.999 17H1.999" fontSize="14px" fontWeight="500" fill="none" stroke="oklch(98.7% 0.026 102.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
              <path d="M11 1L12.5 7.5C12.6 7.9 12.8 8.2 13.1 8.5C13.4 8.8 13.7 9 14.1 9.1L20.5 10.7C20.8 10.8 21 11 21 11.3C21 11.6 20.8 11.8 20.5 11.9L14.1 13.5C13.7 13.6 13.4 13.8 13.1 14.1C12.8 14.4 12.6 14.7 12.5 15.1L11 21C10.9 21.3 10.7 21.5 10.4 21.5C10.1 21.5 9.9 21.3 9.8 21L8.3 15.1C8.2 14.7 8 14.4 7.7 14.1C7.4 13.8 7.1 13.6 6.7 13.5L0.5 11.9C0.2 11.8 0 11.6 0 11.3C0 11 0.2 10.8 0.5 10.7L6.7 9.1C7.1 9 7.4 8.8 7.7 8.5C8 8.2 8.2 7.9 8.3 7.5L9.8 1.4C9.9 1.1 10.1 0.9 10.4 0.9C10.7 0.9 10.9 1.1 11 1.4V1Z" fontSize="14px" fontWeight="500" fill="oklch(98.7% 0.026 102.2)" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
