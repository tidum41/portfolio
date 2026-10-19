import DialogueSidebar from "../DialogueSidebar";
import DialogueStatCard from "../DialogueStatCard";
import DialogueBadge from "../DialogueBadge";
import { DurationStatIcon, InsightsStatIcon, InterviewsStatIcon } from "../stat-card-icons";
export default function Frame1DashboardWithChat() {
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
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/6DQA1N0JB69ZE0BCKVS1GVW1XM.jpg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/29JBQM0HCYDE6F3YHQ51PJDCSM.jpg)' }} />
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
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/0D9GFNXEDRKC55BD370T0P0GYJ.svg)' }} />
                                      </div>
                                      <div className="flex shrink-0 rounded-full overflow-clip -ml-2 bg-[#F9FAFB] border-2 border-solid border-[#F8F6F3] size-6">
                                        <div className="aspect-square max-w-full overflow-clip bg-size-[100%_100%] bg-position-[50%] bg-no-repeat size-full" style={{ backgroundImage: 'url(/dialogue/29JBQM0HCYDE6F3YHQ51PJDCSM.jpg)' }} />
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
      <div className="w-[1400px] max-w-[1464px] absolute right-6 z-50 bottom-6">
        <div className="flex overflow-clip size-full">
          <div className="flex basis-0 grow-66 max-h-full max-w-full min-h-0 min-w-0">
            <div className="grow max-h-full max-w-full overflow-clip" />
          </div>
          <div className="items-center flex shrink-0 w-0 justify-center opacity-0 bg-[#E7E5E4]" />
          <div className="flex basis-0 grow-34 max-h-full max-w-full min-h-0 min-w-0">
            <div className="grow max-h-full max-w-full overflow-clip">
              <div className="flex max-h-[496.3px] rounded-3xl bg-[#FCFBF9] border border-solid border-[#E7E5E4]">
                <div className="flex basis-[0%] flex-col grow min-h-0 min-w-0 p-7 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="items-center flex justify-between">
                      <div className="items-center flex gap-2">
                        <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal font-medium text-[#1C1917]">
                          Study chat
                        </div>
                        <div className="items-center flex shrink-0 w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 bg-[#F1EEEA] border border-solid border-[#00000000]">
                          <div className="flex text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
                            Beta
                          </div>
                        </div>
                      </div>
                      <div className="items-center flex shrink-0 justify-center text-center rounded-lg gap-2 size-9">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" fontWeight="500" style={{ height: '16px', flexShrink: '0', width: '16px', textAlign: 'center', overflow: 'clip' }}>
                          <path d="M5 12h14" fontSize="14px" fontWeight="500" fill="none" stroke="oklch(21.6% 0.006 56.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
                        </svg>
                      </div>
                    </div>
                    <div className="text-[12px] leading-[133.333%] text-pretty wrap-normal text-[#57534D]">
                      Answering questions about this study
                    </div>
                  </div>
                  <div className="flex [flex-basis:384px] flex-col grow min-h-0 overflow-clip gap-4 -mx-7">
                    <div className="basis-[0%] grow min-h-0 overflow-clip">
                      <div className="overflow-clip size-full">
                        <div className="flex flex-col px-7 gap-3">
                          <div className="">
                            <div className="flex flex-col w-fit ml-auto max-w-[91.6667%] py-2 px-4 rounded-2xl bg-[#F1EEEA]">
                              <div className="text-[14px] leading-[171.429%] wrap-break-word text-pretty text-[#1C1917]">
                                What are the key themes across all interviews?
                              </div>
                            </div>
                          </div>
                          <div className="">
                            <div className="flex flex-col gap-1 my-2">
                              <div className="flex flex-col py-2 px-4 rounded-[14px] gap-6 border border-solid border-[#E7E5E4]">
                                <div className="items-center flex gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="16px" style={{ height: '16px', width: '16px', overflow: 'clip', flexShrink: '0' }}>
                                    <path d="m21 21-4.34-4.34" fontSize="16px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                    <circle cx="11" cy="11" r="8" fontSize="16px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                  </svg>
                                  <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal font-mono text-[#57534D]">
                                    Querying participants
                                  </div>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="16px" style={{ height: '12px', width: '12px', overflow: 'clip', flexShrink: '0' }}>
                                    <path d="m9 18 6-6-6-6" fontSize="16px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                  </svg>
                                  <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal text-[#57534D]">
                                    15 queried
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col py-2">
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Here's a synthesis of the key themes across all 15 interviews:
                              </div>
                              <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                              <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                                🔑 Key Themes Across All Interviews
                              </div>
                              <div className="h-0 mb-10 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917]" />
                              <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                                1. 🤖 AI vs. Human Moderator Preference: A Divided but Nuanced Picture
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Most participants preferred human moderators, but the reasoning was rarely absolute. Preferences were context-dependent, and many acknowledged real advantages of AI.
                              </div>
                              <div className="mb-4">
                                <div className="inline-block text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-semibold text-[#1C1917]">
                                  Why participants preferred humans:
                                </div>
                              </div>
                              <div className="mb-4 pl-5.5">
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Human connection, empathy, and the ability to read non-verbal cues
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Social accountability motivates better answers
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Familiarity and comfort with human interaction
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col mb-4 py-6 rounded-[14px] gap-6 bg-[#F8F6F3] border border-solid border-[#00000000]">
                                <div className="flex flex-col px-6">
                                  <div className="items-center flex mb-2 gap-2">
                                    <div className="">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" fontWeight="600" style={{ height: '24px', width: '24px', overflow: 'clip' }}>
                                        <path d="M2 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M6 6v11" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M10 3v18" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M14 8v7" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M18 5v13" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M22 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] text-[#57534D]">
                                      Mark, 01:09-01:31
                                    </div>
                                  </div>
                                  <div className="overflow-clip">
                                    <div className="text-[14px] leading-[162.5%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                      I feel like if you're trying to extract data out of me, then a human just feels more personal and when I know that a robot is the one interviewing me and I'm just talking to a robot, that feels lame and that feels like kind of dystopian.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "Connecting with a person is a lot easier than banking on an algorithm." — Katie
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="inline-block text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-semibold text-[#1C1917]">
                                  Why participants leaned toward AI (or were neutral):
                                </div>
                              </div>
                              <div className="mb-4 pl-5.5">
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Reduced social pressure → more honest, candid responses
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Scheduling flexibility and convenience
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    No fear of hurting the interviewer's feelings
                                  </div>
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "I would definitely chose the AI one... I don't need to dress up, I don't need to really behave... I'll be more free and chill and open to talk." — Hannah
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "I said earlier I would be equally as honest, but honestly, maybe I am more honest here. I'm definitely more relaxed." — Emily
                                </div>
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                The key nuance: AI was broadly accepted for low-stakes research contexts, but strongly rejected for high-stakes scenarios (job interviews, personal topics, emotional discussions).
                              </div>
                              <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                              <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                                2. ✅ Onboarding: Smooth Mechanics, Weak Value Communication
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Nearly every participant found the technical onboarding flow intuitive and frictionless. However, a near-universal gap emerged: participants didn't understand what Dialogue AI was or what they were about to do until well into the interview itself.
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "All it says is welcome and start. How was I supposed to know what Dialogue is?" — Mark
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "I don't think I really understood it during the onboarding flow. I feel like I really saw the value of this product when I began interviewing with you, George." — Emily
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "I feel like if I'm a first time user going through this onboarding process, it wouldn't really help me to understand what are some unique values about Dialogue AI." — Hannah
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="inline-block text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-semibold text-[#1C1917]">
                                  Specific friction points mentioned:
                                </div>
                              </div>
                              <div className="mb-4 pl-5.5">
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Location verification wording confused several participants (Mark, Shreya, Elaine)
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Default location set to San Francisco frustrated Michelle
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Interview duration not clearly communicated (Elaine, Tyler)
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Webcam/screen sharing felt unnecessary or invasive to some (Isabella, Melissa, Allen)
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Redundant sign-in buttons on the same screen (Hannah)
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Date picker UI felt clunky (Michelle)
                                  </div>
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="inline-block text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-semibold text-[#1C1917]">
                                  Moments of delight:
                                </div>
                              </div>
                              <div className="mb-4 pl-5.5">
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Google sign-in was universally praised for ease
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Auto-detected location was a pleasant surprise for several participants
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    The live text display synced with the AI voice was appreciated
                                  </div>
                                </div>
                              </div>
                              <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                              <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                                3. 🔒 Trust & Data Privacy: Moderate and Familiarity-Dependent
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Trust levels varied widely (2/10 to 8.5/10), but the most common pattern was moderate trust limited by unfamiliarity rather than specific concerns. The most consistent privacy worries were:
                              </div>
                              <div className="mb-4 pl-5.5">
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Who watches the recordings? Multiple participants were uncomfortable knowing humans would review their video.
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    AI training data fears — concern that responses could be used to train models and resurface elsewhere.
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Webcam/screen sharing felt disproportionate to the task.
                                  </div>
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "I don't know who or how my videos are gonna be looked at by your managers... It makes me feel a little bit unsure and unsecure." — Hannah
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "There is the concern about AI using data to continue training. Data that is in training can be resurfaced in places that you don't want it to be." — Alan
                                </div>
                              </div>
                              <div className="flex flex-col mb-4 py-6 rounded-[14px] gap-6 bg-[#F8F6F3] border border-solid border-[#00000000]">
                                <div className="flex flex-col px-6">
                                  <div className="items-center flex mb-2 gap-2">
                                    <div className="">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" fontWeight="600" style={{ height: '24px', width: '24px', overflow: 'clip' }}>
                                        <path d="M2 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M6 6v11" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M10 3v18" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M14 8v7" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M18 5v13" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M22 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] text-[#57534D]">
                                      Philena, 14:44-14:47
                                    </div>
                                  </div>
                                  <div className="overflow-clip">
                                    <div className="text-[14px] leading-[162.5%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                      Six.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                A key insight: for many participants, trust is a function of exposure, not a fixed barrier. Repeated positive experiences are likely to increase it.
                              </div>
                              <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                              <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                                4. 💰 Motivation to Participate & Recommend: Compensation + Peer Referrals
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Compensation was the single most cited motivator for participation and recommendation across the board. Students framed it as a flexible, well-paying alternative to part-time work.
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "The payoff is significantly better than if I were to work a minimum wage part-time job." — Elaine
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "If I was getting maybe $30 or $40, I think as a student that's pretty good." — Melissa
                                </div>
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Peer recommendations were the most trusted discovery channel — nearly every participant said they'd trust a friend's referral above all else.
                              </div>
                              <div className="flex flex-col mb-4 py-6 rounded-[14px] gap-6 bg-[#F8F6F3] border border-solid border-[#00000000]">
                                <div className="flex flex-col px-6">
                                  <div className="items-center flex mb-2 gap-2">
                                    <div className="">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" fontWeight="600" style={{ height: '24px', width: '24px', overflow: 'clip' }}>
                                        <path d="M2 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M6 6v11" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M10 3v18" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M14 8v7" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M18 5v13" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M22 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] text-[#57534D]">
                                      Michelle, 10:06-10:09
                                    </div>
                                  </div>
                                  <div className="overflow-clip">
                                    <div className="text-[14px] leading-[162.5%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                      Friend.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col mb-4 py-6 rounded-[14px] gap-6 bg-[#F8F6F3] border border-solid border-[#00000000]">
                                <div className="flex flex-col px-6">
                                  <div className="items-center flex mb-2 gap-2">
                                    <div className="">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" fontWeight="600" style={{ height: '24px', width: '24px', overflow: 'clip' }}>
                                        <path d="M2 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M6 6v11" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M10 3v18" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M14 8v7" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M18 5v13" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M22 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] text-[#57534D]">
                                      Michelle, 10:06-10:09
                                    </div>
                                  </div>
                                  <div className="overflow-clip">
                                    <div className="text-[14px] leading-[162.5%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                      Friend.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Other effective channels mentioned: student clubs/orgs (Product Space, ACM), career centers, professors, and campus job boards. Flyers were seen as low-impact.
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "I feel like if people saw it on flyers, they would just say like, oh, that's another AI product... but if they actually experienced it, saw it demoed, they would understand the value." — Emily
                                </div>
                              </div>
                              <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                              <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                                5. 🎙️ AI Voice & Conversational Quality: Exceeded Expectations, But Imperfect
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Most participants were pleasantly surprised by how natural the AI voice sounded — many expected something far more robotic. This was a consistent moment of delight.
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "I expected it to be a lot worse." — Katie
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "The voice is very very smooth and yeah, just generally pretty mellow." — Alan
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "Your voice sounds pretty human-like, it doesn't sound AI robotic." — Emily
                                </div>
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                However, several technical limitations were flagged:
                              </div>
                              <div className="mb-4 pl-5.5">
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Interrupting mid-thought / cutting off participants before they finished (Hannah, Melissa, Tyler)
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    AI latency felt too slow at times (Tyler)
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Overly perfect pacing — paradoxically, the AI sounded toopolished, which made it feel artificial (Emily)
                                  </div>
                                </div>
                                <div className="pl-[5.99999px] my-1">
                                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                    Contextual misunderstanding — the AI picked up background noise as participant input (Ryan)
                                  </div>
                                </div>
                              </div>
                              <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                              <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                                6. 🧠 Honesty Advantage: A Recurring, Underappreciated Insight
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                Across multiple interviews, participants independently noted they felt more comfortable being honest, critical, or candid with AI than with a human — particularly around negative feedback.
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "Because the AI is perceived by us as not having emotions, we are willing to be a little bit more honest and willing to be harsher with our feedback, which is actually more constructive." — Michelle
                                </div>
                              </div>
                              <div className="mb-[18.6666px] mt-[18.6666px] [quotes:'“'_'”'_'‘'_'’'] pl-[15.5555px] border-l-4 border-l-solid border-l-[#1C1917]">
                                <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917]">
                                  "Maybe if I wanted to complain more about the product itself... I feel like I wouldn't be able to be as honest and aggressive about it [with a human]. So I feel like whenever I do have more negative opinions about a product, I would feel more comfortable talking to an AI." — Melissa
                                </div>
                              </div>
                              <div className="flex flex-col mb-4 py-6 rounded-[14px] gap-6 bg-[#F8F6F3] border border-solid border-[#00000000]">
                                <div className="flex flex-col px-6">
                                  <div className="items-center flex mb-2 gap-2">
                                    <div className="">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" fontWeight="600" style={{ height: '24px', width: '24px', overflow: 'clip' }}>
                                        <path d="M2 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M6 6v11" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M10 3v18" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M14 8v7" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M18 5v13" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                        <path d="M22 10v3" fontSize="14px" fontWeight="600" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                                      </svg>
                                    </div>
                                    <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] text-[#57534D]">
                                      Hannah, 51:37-53:24
                                    </div>
                                  </div>
                                  <div className="overflow-clip">
                                    <div className="text-[14px] leading-[162.5%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                      I will definitely be more honest and open with AI cause that wouldn't hurt anyone's feeling.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                This is a core value proposition that resonated organically — and one that Dialogue AI could lean into more explicitly in its positioning.
                              </div>
                              <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                              <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                                Summary Table
                              </div>
                              <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                                | Theme | Key Finding | |---|---| | AI vs. Human Preference | Most prefer humans, but AI wins on honesty & convenience | | Onboarding | Smooth mechanics; weak value communication upfront | | Trust & Privacy | Moderate; limited by unfamiliarity + recording concerns | | Motivation | Compensation #1; peer referrals most trusted channel | | Voice & Conversation | Exceeded expectations; interrupted too often | | Honesty Advantage | AI enables more candid, critical feedback |
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className="flex flex-col p-3 rounded-[14px] gap-2 bg-[#FCFBF9] border border-solid border-[#E5E7EB]">
                      <div className="">
                        <div className="flex field-sizing-content w-full min-h-15 overflow-clip">
                          <div className="h-5 w-98 wrap-break-word [text-wrap:auto] shrink-0 text-[#57534D] text-sm/5">
                            Ask about your study...
                          </div>
                        </div>
                      </div>
                      <div className="items-end flex justify-between gap-2">
                        <div className="items-center flex basis-[0%] grow min-w-0" />
                        <div className="items-center flex shrink-0 justify-center opacity-50 text-center rounded-lg gap-2 bg-[#1C1917] size-9">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="14px" fontWeight="500" style={{ height: '16px', flexShrink: '0', width: '16px', textAlign: 'center', overflow: 'clip' }}>
                            <path d="m5 12 7-7 7 7" fontSize="14px" fontWeight="500" fill="none" stroke="#F8F6F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
                            <path d="M12 19V5" fontSize="14px" fontWeight="500" fill="none" stroke="#F8F6F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', textAlign: 'center', transformOrigin: '0px 0px' }} />
                          </svg>
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
  );
}
