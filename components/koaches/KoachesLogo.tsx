import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
} as const;

const MASCOT_SIZE_CLASS = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
} as const;

type LogoSize = keyof typeof SIZE_CLASS;

function KoachaMascot({ size, className }: { size: LogoSize; className?: string }) {
  return (
    <Image
      src="/illustrations/mascot.png"
      alt=""
      width={96}
      height={96}
      className={cn("shrink-0 object-contain", MASCOT_SIZE_CLASS[size], className)}
      aria-hidden
      priority
    />
  );
}

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
      <span className="text-[#16A34A]">Koaches</span>
      <span className={light ? "text-white" : "text-[#4F8FF7]"}>PH</span>
    </span>
  );
}

type KoachesLogoProps = {
  size?: LogoSize;
  showText?: boolean;
  light?: boolean;
  className?: string;
};

/** KoachesPH wordmark with mascot */
export function KoachesLogo({
  size = "md",
  showText = true,
  light = false,
  className,
}: KoachesLogoProps) {
  if (!showText) {
    return (
      <div className={cn("inline-flex", className)} aria-label="KoachesPH">
        <KoachaMascot size={size} />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)} aria-label="KoachesPH">
      <KoachaMascot size={size} />
      <WordmarkText size={size} light={light} />
    </div>
  );
}

/** Compact mascot mark for collapsed nav */
export function KoachesMark({
  size = "md",
  className,
}: {
  size?: LogoSize;
  light?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center justify-center", className)} aria-label="KoachesPH">
      <KoachaMascot size={size} />
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
