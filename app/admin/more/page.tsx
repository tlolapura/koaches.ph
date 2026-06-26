import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";

const links = [
  { href: "/admin/courts", label: "Courts", icon: MapPin, desc: "Platform court directory" },
];

export default function AdminMorePage() {
  return (
    <AdminPageShell>
      <AdminPageHeader
        title="More"
        subtitle="Additional admin tools"
        className="mb-6"
      />

      <div className="space-y-2">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="coach-card flex min-h-[64px] items-center gap-4 p-4 transition-colors hover:bg-[#F9FAFB]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEEE9]">
                <Icon className="h-5 w-5 text-[#8B4D3A]" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-semibold">{l.label}</p>
                <p className="text-xs text-[#6B7280]">{l.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#6B7280]" />
            </Link>
          );
        })}
      </div>
    </AdminPageShell>
  );
}
