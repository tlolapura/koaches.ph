import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LEGAL_ITEMS = [
  { href: "/coach/settings/terms", label: "Terms of Service" },
  { href: "/coach/settings/privacy", label: "Privacy Policy" },
  { href: "/coach/settings/refund-policy", label: "Refund Policy" },
] as const;

type LegalSettingsSectionProps = {
  className?: string;
  onNavigate?: () => void;
};

export function LegalSettingsSection({ className, onNavigate }: LegalSettingsSectionProps) {
  return (
    <div className={cn("coach-card p-4", className)}>
      <p className="font-heading font-semibold text-[#111827]">Legal</p>
      <p className="mt-1 text-sm text-[#6B7280]">Terms, privacy, and billing policies</p>
      <ul className="mt-3 overflow-hidden rounded-xl border border-[#E5E7EB]">
        {LEGAL_ITEMS.map((item, index) => (
          <li key={item.href} className={index > 0 ? "border-t border-[#E5E7EB]" : undefined}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="flex min-h-[48px] items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB]"
            >
              {item.label}
              <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
