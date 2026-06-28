import Link from "next/link";
import { KoachesLogo } from "@/components/koaches/KoachesLogo";
import { cn } from "@/lib/utils";

export function AuthLoginScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F0FDF4] opacity-60 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[#EFF6FF] opacity-70 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}

export function AuthLoginCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "coach-card w-full p-6 shadow-[0_8px_30px_rgba(30,58,95,0.08)] sm:p-7",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AuthLoginIntro({
  portalLabel,
  subtitle,
}: {
  portalLabel?: string;
  subtitle?: string;
}) {
  return (
    <div>
      <KoachesLogo size="md" />
      {portalLabel ? (
        <p className="font-heading mt-4 text-xs font-semibold uppercase tracking-wide text-[#4F8FF7]">
          {portalLabel}
        </p>
      ) : null}
      {subtitle ? <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p> : null}
    </div>
  );
}

export function AuthLoginField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="font-heading text-xs font-semibold text-[#374151]">
          {label}
        </label>
        {hint}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function AuthLoginError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]"
    >
      {message}
    </p>
  );
}

export function AuthLoginBackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-[#4F8FF7] hover:underline">
      {children}
    </Link>
  );
}
