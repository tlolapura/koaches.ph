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
  return <div className={cn("mx-auto max-w-3xl px-4 py-6", className)}>{children}</div>;
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
  return (
    <div
      className={cn(
        actions
          ? "flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
          : "flex items-start justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1
          className={cn(
            "font-heading text-2xl font-semibold text-[#111827]",
            !mobileTitle && "hidden md:block"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "text-sm text-[#6B7280]",
              mobileTitle ? "mt-0.5" : "mt-1"
            )}
          >
            {subtitle}
          </p>
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
  return <p className={cn("mt-1 text-xs text-[#6B7280]", className)}>{children}</p>;
}
