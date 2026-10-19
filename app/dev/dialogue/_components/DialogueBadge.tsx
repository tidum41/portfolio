type DialogueBadgeProps = {
  children: string;
  tone?: "success" | "neutral" | "beta";
};

const toneBg: Record<DialogueBadgeProps["tone"] & string, string> = {
  success: "bg-[#DCFCE7]",
  neutral: "bg-[#F1EEEA]",
  beta: "bg-[#F1EEEA]",
};

export default function DialogueBadge({
  children,
  tone = "neutral",
}: DialogueBadgeProps) {
  return (
    <div
      className={`items-center flex shrink-0 w-fit justify-center py-0.5 px-2 rounded-lg overflow-clip gap-1 border border-solid border-[#00000000] ${toneBg[tone]}`}
    >
      <div className="flex text-[12px] leading-[133.333%] w-max wrap-normal font-medium text-[#1C1917]">
        {children}
      </div>
    </div>
  );
}
