"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LegalLinksProps = {
  className?: string;
};

export function LegalLinks({ className }: LegalLinksProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#9CA3AF]", className)}>
      <Link href="/terms" className="hover:text-[#6B7280] hover:underline">
        Terms
      </Link>
      <span>·</span>
      <Link href="/privacy" className="hover:text-[#6B7280] hover:underline">
        Privacy
      </Link>
      <span>·</span>
      <Link href="/refund-policy" className="hover:text-[#6B7280] hover:underline">
        Refund policy
      </Link>
    </div>
  );
}
