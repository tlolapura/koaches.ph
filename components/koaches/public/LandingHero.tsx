import Link from "next/link";
import type { ReactNode } from "react";
import { PublicBrand } from "@/components/koaches/public/BrandMark";
import { cn } from "@/lib/utils";
import { CourtStatGrid } from "@/components/koaches/coach/CourtStatGrid";

const HERO_GRADIENT =
  "bg-gradient-to-br from-[#16A34A] via-[#1a8f48] to-[#4F8FF7]";

type PublicHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  back?: { href: string; label: string };
  compact?: boolean;
  showBrand?: boolean;
  className?: string;
  children?: ReactNode;
};

export function PublicHero({
  eyebrow,
  title,
  subtitle,
  back,
  compact = false,
  showBrand = true,
  className,
  children,
}: PublicHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden text-white",
        HERO_GRADIENT,
        compact ? "px-4 pb-5 pt-[max(0.75rem,env(safe-area-inset-top))]" : "px-5 pb-7 pt-[max(1rem,env(safe-area-inset-top))]",
        !compact && "md:mx-auto md:max-w-3xl md:rounded-b-2xl md:shadow-[0_12px_40px_rgba(79,143,247,0.22)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#4F8FF7]/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#6B9E78]/25 blur-3xl"
        aria-hidden
      />

      <div className={cn("relative", compact ? "mx-auto max-w-2xl" : "mx-auto max-w-2xl md:max-w-none")}>
        {(showBrand || back) && (
          <div className="flex items-center justify-between gap-3">
            {showBrand ? (
              <PublicBrand light href="/" size={compact ? "sm" : "md"} />
            ) : (
              <span />
            )}
            {back ? (
              <Link
                href={back.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {back.label}
              </Link>
            ) : null}
          </div>
        )}

        {eyebrow ? (
          <span
            className={cn(
              "inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDE047]",
              showBrand || back ? "mt-5" : "mt-0"
            )}
          >
            {eyebrow}
          </span>
        ) : null}

        <h1
          className={cn(
            "font-heading font-bold leading-[1.12] tracking-tight",
            compact
              ? "mt-3 text-2xl sm:text-[1.65rem]"
              : "mt-4 text-[clamp(1.85rem,6.5vw,2.85rem)]"
          )}
        >
          {title}
        </h1>

        {subtitle ? (
          <p
            className={cn(
              "max-w-lg leading-relaxed text-white/70",
              compact ? "mt-1.5 text-sm" : "mt-3 text-sm sm:text-base"
            )}
          >
            {subtitle}
          </p>
        ) : null}

        {children ? <div className={compact ? "mt-4" : "mt-5"}>{children}</div> : null}
      </div>
    </section>
  );
}

export function PublicStatGrid({
  stats,
  className,
}: {
  stats: { value: string; label: string }[];
  className?: string;
}) {
  return <CourtStatGrid stats={stats} className={className} />;
}

type PublicPathCardProps = {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  tag: string;
  tone?: "coral" | "sage" | "navy";
};

const pathTones = {
  coral: {
    card: "border-[#BBF7D0] bg-gradient-to-br from-[#F0FDF4] to-white",
    icon: "bg-[#16A34A] text-white shadow-[0_4px_12px_rgba(22,163,74,0.3)]",
    tag: "bg-[#F0FDF4] text-[#166534]",
  },
  sage: {
    card: "border-[#C5D9CC] bg-gradient-to-br from-[#E5EFE8] to-white",
    icon: "bg-[#6B9E78] text-white shadow-[0_4px_12px_rgba(107,158,120,0.3)]",
    tag: "bg-[#E5EFE8] text-[#3D5C47]",
  },
  navy: {
    card: "border-[#C5D4E8] bg-gradient-to-br from-[#EFF6FF] to-white",
    icon: "bg-[#4F8FF7] text-white shadow-[0_4px_12px_rgba(79,143,247,0.25)]",
    tag: "bg-[#EFF6FF] text-[#1D4ED8]",
  },
};

export function PublicPathCard({
  href,
  icon: Icon,
  title,
  description,
  tag,
  tone = "coral",
}: PublicPathCardProps) {
  const styles = pathTones[tone];

  return (
    <Link
      href={href}
      className={cn(
        "group coach-card relative flex items-start gap-4 p-4 transition-all active:scale-[0.99]",
        styles.card
      )}
    >
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", styles.icon)}>
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1 pr-5">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", styles.tag)}>
          {tag}
        </span>
        <p className="font-heading mt-2 font-semibold text-[#111827]">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-[#6B7280]">{description}</p>
      </div>
      <span
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16A34A]/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#16A34A]"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}

export function PublicFeatureCard({
  icon: Icon,
  title,
  description,
  tone = "coral",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  tone?: keyof typeof pathTones;
}) {
  const styles = pathTones[tone];

  return (
    <article className={cn("coach-card p-4", styles.card)}>
      <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", styles.icon)}>
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <h3 className="font-heading mt-3 font-semibold text-[#111827]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">{description}</p>
    </article>
  );
}
