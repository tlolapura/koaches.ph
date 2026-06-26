import { cn } from "@/lib/utils";

type CourtStatGridProps = {
  stats: { value: string; label: string }[];
  className?: string;
};

/** Stats row that sits on court gradients — one glass panel, line dividers (no gray boxes). */
export function CourtStatGrid({ stats, className }: CourtStatGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 overflow-hidden rounded-xl bg-black/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] backdrop-blur-md",
        className
      )}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn("px-2 py-2.5 text-center", i > 0 && "border-l border-white/[0.12]")}
        >
          <p className="font-heading text-base font-bold leading-none text-white sm:text-lg">
            {stat.value}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/50">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
