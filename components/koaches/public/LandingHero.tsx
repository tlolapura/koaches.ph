import Link from "next/link";
import type { ReactNode } from "react";
import { PublicBrand } from "@/components/koaches/public/BrandMark";
import { cn } from "@/lib/utils";

const HERO_GRADIENT =
  "bg-gradient-to-br from-[#1E3A5F] via-[#264a73] to-[#1a3352]";

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
        !compact && "md:mx-auto md:max-w-3xl md:rounded-b-2xl md:shadow-[0_12px_40px_rgba(30,58,95,0.22)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E07A5F]/20 blur-3xl"
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
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/10 bg-white/10 px-2 py-2.5 text-center backdrop-blur-sm"
        >
          <p className="font-heading text-base font-bold leading-none sm:text-lg">{stat.value}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/55">{stat.label}</p>
        </div>
      ))}
    </div>
  );
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
    card: "border-[#F4C4B8] bg-gradient-to-br from-[#FDEEE9] to-white",
    icon: "bg-[#E07A5F] text-white shadow-[0_4px_12px_rgba(224,122,95,0.3)]",
    tag: "bg-[#FDEEE9] text-[#8B4D3A]",
  },
  sage: {
    card: "border-[#C5D9CC] bg-gradient-to-br from-[#E5EFE8] to-white",
    icon: "bg-[#6B9E78] text-white shadow-[0_4px_12px_rgba(107,158,120,0.3)]",
    tag: "bg-[#E5EFE8] text-[#3D5C47]",
  },
  navy: {
    card: "border-[#C5D4E8] bg-gradient-to-br from-[#EDF2F7] to-white",
    icon: "bg-[#1E3A5F] text-white shadow-[0_4px_12px_rgba(30,58,95,0.25)]",
    tag: "bg-[#EDF2F7] text-[#1E3A5F]",
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
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#E07A5F]/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#E07A5F]"
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
