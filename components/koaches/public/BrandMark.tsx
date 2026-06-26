import Link from "next/link";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { cn } from "@/lib/utils";

type PublicBrandProps = {
  className?: string;
  /** Light wordmark for navy/dark backgrounds */
  light?: boolean;
  href?: string;
  size?: "sm" | "md" | "lg";
};

export function PublicBrand({
  className,
  light = false,
  href = "/",
  size = "md",
}: PublicBrandProps) {
  const mark = <KoachesWordmark size={size} light={light} className={className} />;

  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex">
      {mark}
    </Link>
  );
}
