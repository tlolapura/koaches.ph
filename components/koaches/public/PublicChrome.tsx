"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { CourtStripe } from "@/components/koaches/coach/CourtStripe";
import { PublicBrand } from "@/components/koaches/public/BrandMark";
import { BRAND_NAME, SITE_DOMAIN, SITE_TAGLINE } from "@/lib/koaches/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: "/coaches", label: "Find a coach" },
  { href: "/for-coaches", label: "For coaches" },
  { href: "/coach/login", label: "Coach login" },
];

export function PublicNav({ minimal = false }: { minimal?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (minimal) {
    return (
      <header className="coach-portal shrink-0 border-b border-[#E5E7EB] bg-white">
        <CourtStripe />
        <div className="mx-auto flex h-12 max-w-sm items-center justify-between px-4 sm:max-w-md">
          <Link href="/">
            <KoachesWordmark size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#111827] hover:bg-[#EFF6FF]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </header>
    );
  }

  return (
    <>
      <header className="coach-portal sticky top-0 z-50 shrink-0 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md">
        <CourtStripe />
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <KoachesWordmark size="sm" />
            <span className="hidden text-xs font-medium text-[#9CA3AF] sm:inline">{SITE_TAGLINE}</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#111827] hover:bg-[#EFF6FF] md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/coaches">Find a coach</NavLink>
            <NavLink href="/for-coaches">For coaches</NavLink>
            <NavLink href="/coach/login">Log in</NavLink>
            <Link href="/coaches" className="coach-btn-primary w-auto px-4 py-2 text-sm">
              Browse coaches
            </Link>
          </nav>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#4F8FF7]"
    >
      {children}
    </Link>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={cn(
        "coach-portal fixed inset-0 z-[60] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-[#14532D]/50 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-label="Close menu"
      />
      <div
        className={cn(
          "absolute top-0 right-0 flex h-full w-[min(100%,260px)] flex-col bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <span className="font-heading text-lg font-semibold text-[#111827]">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#EFF6FF]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#EFF6FF]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-[#E5E7EB] p-4">
          <Link href="/coaches" onClick={onClose} className="coach-btn-primary w-full">
            Browse coaches
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="coach-portal shrink-0 bg-[#4F8FF7] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <PublicBrand light href="/" size="sm" />
            <p className="mt-3 max-w-xs text-sm text-white/65">
              Pickleball coaching in the Philippines. {SITE_TAGLINE}
            </p>
          </div>
          <div className="flex gap-10 text-sm">
            <ul className="space-y-2">
              <li><FooterLink href="/">Home</FooterLink></li>
              <li><FooterLink href="/coaches">Find a coach</FooterLink></li>
              <li><FooterLink href="/for-coaches">For coaches</FooterLink></li>
              <li><FooterLink href="/apply">Apply as coach</FooterLink></li>
            </ul>
            <ul className="space-y-2">
              <li><FooterLink href="/coach/login">Coach login</FooterLink></li>
              <li className="text-white/45">hello@{SITE_DOMAIN}</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs text-white/35">© 2026 {BRAND_NAME}</p>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-white/70 transition-colors hover:text-[#FACC15]">
      {children}
    </Link>
  );
}
