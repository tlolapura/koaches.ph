import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Standard coach portal page container */
export function CoachPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("coach-page-shell mx-auto max-w-3xl px-4 pb-6 pt-4 md:py-6", className)}>{children}</div>;
}

type CoachPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Show the in-page title on mobile (e.g. dashboard greeting). Default: desktop only. */
  mobileTitle?: boolean;
  className?: string;
};

/** List / hub page title block — mobile title usually comes from CoachMobileHeader */
export function CoachPageHeader({
  title,
  subtitle,
  actions,
  mobileTitle = false,
  className,
}: CoachPageHeaderProps) {
  const desktopOnly = !mobileTitle && !actions;
  const titleOnDesktopOnly = !mobileTitle;

  return (
    <div
      data-desktop-only={desktopOnly ? "" : undefined}
      className={cn(
        "coach-page-header",
        desktopOnly && "hidden md:block",
        actions
          ? cn(
              "flex flex-col md:flex-row md:items-start md:justify-between",
              titleOnDesktopOnly ? "gap-0 md:gap-4" : "gap-4"
            )
          : "flex items-start justify-between gap-3",
        className
      )}
    >
      <div className={cn("min-w-0 flex-1", titleOnDesktopOnly && "hidden md:block")}>
        <h1 className="font-heading text-2xl font-semibold text-[#111827]">{title}</h1>
        {subtitle && (
          <p className="mt-1 hidden text-sm text-[#6B7280] md:block">{subtitle}</p>
        )}
      </div>
      {actions ? <div className="w-full shrink-0 md:w-auto">{actions}</div> : null}
    </div>
  );
}

type CoachBackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function CoachBackLink({ href, label, className }: CoachBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#6B7280]",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}

type CoachEntityTitleProps = {
  children: React.ReactNode;
  className?: string;
};

/** Primary heading on detail pages (student name, program name, etc.) */
export function CoachEntityTitle({ children, className }: CoachEntityTitleProps) {
  return (
    <h1 className={cn("font-heading text-xl font-bold text-[#111827]", className)}>
      {children}
    </h1>
  );
}

type CoachSectionTitleProps = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm";
};

export function CoachSectionTitle({
  children,
  className,
  size = "default",
}: CoachSectionTitleProps) {
  return (
    <h2
      className={cn(
        "font-heading font-semibold text-[#111827]",
        size === "default" ? "text-lg" : "text-sm",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function CoachSectionHint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("mt-1 hidden text-xs text-[#6B7280] md:block", className)}>{children}</p>;
}
