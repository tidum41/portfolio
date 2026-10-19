import type { ReactNode } from "react";

type DialogueStatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
};

export default function DialogueStatCard({
  label,
  value,
  icon,
}: DialogueStatCardProps) {
  return (
    <div className="items-start h-27 flex basis-[0%] flex-col grow min-w-15 p-6 rounded-[10px] gap-2 bg-[#FCFBF9] border border-solid border-[#E7E5E4]">
      <div className="items-start self-stretch [container-name:card-header] @container flex auto-rows-min grid-rows-[auto_auto] justify-between gap-1.5">
        <div className="flex w-full justify-between">
          <div className="text-[14px] leading-[142.857%] text-pretty wrap-normal font-medium text-[#1C1917]">
            {label}
          </div>
          <div className="shrink-0 ml-2">{icon}</div>
        </div>
      </div>
      <div className="w-full min-w-0">
        <div className="w-full overflow-clip">
          <div className="text-[18px] leading-[155.556%] text-pretty wrap-normal font-semibold text-[#1C1917] line-clamp-1">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
