import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
} as const;

const MARK_SIZE_CLASS = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

type LogoSize = keyof typeof SIZE_CLASS;

function WordmarkText({
  size,
  light,
  className,
}: {
  size: LogoSize;
  light?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("font-heading font-bold leading-none tracking-tight", SIZE_CLASS[size], className)}
    >
      <span className="text-[#E07A5F]">Koaches</span>
      <span className={light ? "text-white" : "text-[#1E3A5F]"}>PH</span>
    </span>
  );
}

type KoachesLogoProps = {
  size?: LogoSize;
  showText?: boolean;
  light?: boolean;
  className?: string;
};

/** KoachesPH wordmark */
export function KoachesLogo({
  size = "md",
  showText = true,
  light = false,
  className,
}: KoachesLogoProps) {
  if (!showText) return null;

  return (
    <div className={cn("inline-flex", className)} aria-label="KoachesPH">
      <WordmarkText size={size} light={light} />
    </div>
  );
}

/** Compact wordmark for collapsed nav */
export function KoachesMark({
  size = "md",
  light = false,
  className,
}: {
  size?: LogoSize;
  light?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("font-heading font-bold leading-none", MARK_SIZE_CLASS[size], className)}
      aria-label="KoachesPH"
    >
      <span className="text-[#E07A5F]">K</span>
      <span className={light ? "text-white" : "text-[#1E3A5F]"}>PH</span>
    </span>
  );
}

export function KoachesWordmark({
  className,
  size = "md",
  light = false,
}: {
  className?: string;
  size?: LogoSize;
  light?: boolean;
}) {
  return <KoachesLogo size={size} light={light} className={className} />;
}
