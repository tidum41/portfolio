/* Paper frame 4 — do not hand-edit; regenerate via scripts/build-dialogue-frames.mjs */

export default function Frame4ChatPanel() {
  return (
    <div className="[font-synthesis:none] wrap-anywhere flex flex-col w-[582px] h-[1303px] p-7 gap-4 bg-[#FCFBF9] antialiased text-xs/4">
      <div className="flex flex-col gap-0.5">
        <div className="items-center flex justify-between">
          <div className="items-center flex gap-2">
            <div className="text-[14px] leading-[142.857%] wrap-normal font-medium text-[#1C1917]">
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
        <div className="text-[12px] leading-[133.333%] wrap-normal text-[#57534D]">
          Answering questions about this study
        </div>
      </div>
      <div className="flex [flex-basis:384px] flex-col grow min-h-0 overflow-clip gap-4 -mx-7">
        <div className="basis-[0%] grow min-h-0 overflow-clip">
          <div className="overflow-clip size-full">
            <div className="flex flex-col px-7 gap-3">
              <div className="">
                <div className="flex flex-col w-fit ml-auto max-w-[91.6667%] py-2 px-4 rounded-2xl bg-[#F1EEEA]">
                  <div className="text-[14px] leading-[171.429%] wrap-break-word text-[#1C1917]">
                    can you give me a visual of where viewers are responding from?
                  </div>
                </div>
              </div>
              <div className="">
                <div className="flex flex-col py-2">
                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                    Let me gather location data from all participants at once!
                  </div>
                </div>
                <div className="flex flex-col gap-1 my-2">
                  <div className="flex flex-col py-2 px-4 rounded-[14px] gap-6 border border-solid border-[#E7E5E4]">
                    <div className="items-center flex gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="16px" style={{ height: '16px', width: '16px', overflow: 'clip', flexShrink: '0' }}>
                        <path d="m21 21-4.34-4.34" fontSize="16px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                        <circle cx="11" cy="11" r="8" fontSize="16px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                      </svg>
                      <div className="text-[14px] leading-[142.857%] wrap-normal font-mono text-[#57534D]">
                        Querying participants
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fontSize="16px" style={{ height: '12px', width: '12px', overflow: 'clip', flexShrink: '0' }}>
                        <path d="m9 18 6-6-6-6" fontSize="16px" fill="none" stroke="oklch(44.4% 0.011 73.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ boxSizing: 'border-box', transformOrigin: '0px 0px' }} />
                      </svg>
                      <div className="text-[14px] leading-[142.857%] wrap-normal text-[#57534D]">
                        15 queried
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col py-2">
                  <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                    Here's a geographic breakdown of all 15 participants:
                  </div>
                  <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                  <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                    📍 Participant Locations
                  </div>
                  <div className="mb-5 py-[8.00001px] px-3 rounded-sm overflow-clip bg-[#1C1917]">
                    <div className="inline-block text-[10.2857px] leading-[166.667%] wrap-break-word w-max whitespace-pre font-mono text-[#F5F5F4]">
                      CALIFORNIA, UNITED STATES<br />│<br />├── 🏙️ Los Angeles ████████████████████████████{'  '}14 participants (93%)<br />│{'       '}Elaine, Michelle, Mark, Tyler, Ryan,<br />│{'       '}Shreya, Katie, Emily, Isabella, Hannah,<br />│{'       '}Melissa, Philena, Allen, Alan<br />│<br />└── 🏙️ Campbell ██{'  '}1 participant (7%)<br />{'        '}Kim<br />
                    </div>
                  </div>
                  <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                  <div className="text-[14px] leading-[142.857%] wrap-break-word [text-wrap:auto] font-medium text-[#1C1917] my-2">
                    Summary
                  </div>
                  <div className="text-[14px] mb-4 leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                    | Location | Count | % of Total | |---|---|---| | Los Angeles, CA | 14 | 93% | | Campbell, CA | 1 | 7% | | Total | 15 | 100% |
                  </div>
                  <div className="h-0 overflow-clip shrink-0 border-t border-t-solid border-t-[#1C1917] my-10" />
                  <div className="text-[14px] leading-[171.429%] wrap-break-word [text-wrap:auto] text-[#1C1917]">
                    Nearly all participants (14 of 15) are based in Los Angeles, California, which makes sense given this study was conducted in partnership with Product Space UCLA. The one outlier is Kim, who responded from Campbell, CA (a city in the San Jose/Silicon Valley area). All participants are within California.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <div className="flex flex-col p-3 rounded-[14px] gap-2 bg-[#FCFBF9] border border-solid border-[#FFD8EE]">
          <div className="">
            <div className="flex field-sizing-content w-full min-h-15 overflow-clip [box-shadow:#A6A09B80_0px_0px_0px]">
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
  );
}
