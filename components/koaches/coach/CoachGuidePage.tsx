"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  BarChart3,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  QrCode,
  Share2,
  Sparkles,
  Star,
  User,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { MarketingDemoVideo } from "@/components/koaches/public/MarketingDemoVideo";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { BRAND_NAME } from "@/lib/koaches/constants";
import { cn } from "@/lib/utils";

const VIBER = {
  display: "0968 854 6190",
  href: "viber://chat?number=%2B639688546190",
} as const;

const TOC = [
  { id: "start", label: "Start here" },
  { id: "nav", label: "Getting around" },
  { id: "home", label: "Home" },
  { id: "setup", label: "Set up once" },
  { id: "students", label: "Students" },
  { id: "schedule", label: "Schedule" },
  { id: "session", label: "Sessions" },
  { id: "progress", label: "Progress cards" },
  { id: "programs", label: "Programs" },
  { id: "clinics", label: "Clinics" },
  { id: "social", label: "Social" },
  { id: "money", label: "Earnings & billing" },
  { id: "help", label: "Help" },
] as const;

function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[250px] overflow-hidden rounded-[1.85rem] border-[3px] border-[#111827] bg-[#FAFAF8] shadow-[0_24px_60px_-24px_rgba(20,83,45,0.5)]",
        className
      )}
    >
      <div className="flex items-center justify-center bg-[#111827] py-2">
        <div className="h-1.5 w-16 rounded-full bg-[#4B5563]" />
      </div>
      <div className="min-h-[400px]">{children}</div>
      <div className="border-t border-[#E5E7EB] bg-white px-2 py-2">
        <div className="flex justify-around text-[8px] font-semibold text-[#9CA3AF]">
          {["Home", "Schedule", "Students", "Earnings", "More"].map((t, i) => (
            <span key={t} className={cn("px-1", i === 0 && "text-[#4F8FF7]")}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureGrid({ items }: { items: { icon: LucideIcon; label: string; hint: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex gap-2 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-sm sm:gap-3 sm:rounded-2xl sm:p-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0FDF4] sm:h-10 sm:w-10 sm:rounded-xl">
              <Icon className="h-4 w-4 text-[#166534] sm:h-5 sm:w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-[11px] font-semibold leading-tight text-[#111827] sm:text-sm">
                {item.label}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-[#6B7280] sm:text-xs">{item.hint}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({
  id,
  step,
  title,
  subtitle,
  children,
}: {
  id: string;
  step?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-[6.5rem] border-t border-[#E5E7EB]/80 py-6 first:border-0 sm:scroll-mt-28 sm:py-10 lg:py-12"
    >
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        {step ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] sm:text-[11px]">
            {step}
          </p>
        ) : null}
        <h2 className="font-heading mt-0.5 text-xl font-bold tracking-tight text-[#111827] sm:mt-1 sm:text-2xl lg:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#6B7280] sm:mt-2 sm:text-sm lg:text-base">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-4 sm:mt-6 lg:mt-8">{children}</div>
      </div>
    </section>
  );
}

function Split({
  preview,
  children,
  flip,
}: {
  preview: React.ReactNode;
  children: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:gap-5 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-10",
        flip && "lg:grid-cols-[minmax(0,1fr)_250px]"
      )}
    >
      <div className={cn("mx-auto w-full max-w-[250px]", flip && "lg:order-2")}>{preview}</div>
      <div className={cn("min-w-0 space-y-3 sm:space-y-4", flip && "lg:order-1")}>{children}</div>
    </div>
  );
}

/* ─── Accurate mini previews ─── */

function PreviewHome() {
  return (
    <Phone>
      <div className="bg-gradient-to-br from-[#16A34A] via-[#1a8f48] to-[#4F8FF7] px-3 pb-4 pt-3 text-white">
        <p className="text-[9px] text-white/70">Sunday, Aug 2</p>
        <p className="font-heading mt-1 text-[15px] font-bold leading-tight">Good morning, Lex</p>
        <p className="mt-1 text-[10px] text-white/60">3 sessions on your court today</p>
      </div>
      <div className="space-y-2 p-2.5">
        <div className="rounded-xl bg-[#F3F4F6] p-1">
          <div className="grid grid-cols-2 gap-1">
            <div className="rounded-lg bg-white py-1.5 text-center text-[9px] font-semibold shadow-sm">
              This week
            </div>
            <div className="rounded-lg py-1.5 text-center text-[9px] font-semibold text-[#6B7280]">
              This month
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { l: "Earned", v: "₱8,400", c: "text-[#16A34A]" },
            { l: "Sessions", v: "11", c: "text-[#111827]" },
            { l: "On the way", v: "₱2,400", c: "text-[#4F8FF7]" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-[#E5E7EB] bg-white px-1.5 py-2 text-center">
              <p className="text-[7px] font-bold uppercase tracking-wide text-[#9CA3AF]">{s.l}</p>
              <p className={cn("font-heading mt-0.5 text-[11px] font-bold", s.c)}>{s.v}</p>
            </div>
          ))}
        </div>
        <p className="flex items-center gap-1.5 pt-1 text-[10px] font-bold text-[#14532D]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
          Today
        </p>
        <div className="rounded-2xl border border-[#16A34A]/50 bg-white p-2.5 shadow-sm ring-2 ring-[#16A34A]/15">
          <div className="flex gap-2">
            <div className="w-10 shrink-0 text-center">
              <p className="font-heading text-[13px] font-bold text-[#4F8FF7]">8:00</p>
              <p className="text-[7px] font-bold uppercase text-[#9CA3AF]">AM</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[11px] font-semibold text-[#111827]">Mia Santos</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[7px] font-bold text-[#92400E]">
                  Drop-in
                </span>
                <span className="rounded-full bg-[#E5EFE8] px-1.5 py-0.5 text-[7px] font-bold text-[#3D5C47]">
                  Paid
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <div className="flex gap-2">
            <div className="w-10 shrink-0 text-center">
              <p className="font-heading text-[13px] font-bold text-[#4F8FF7]">10:00</p>
              <p className="text-[7px] font-bold uppercase text-[#9CA3AF]">AM</p>
            </div>
            <div>
              <p className="font-heading text-[11px] font-semibold">Josh Lim</p>
              <span className="mt-1 inline-block rounded-full bg-[#4F8FF7] px-1.5 py-0.5 text-[7px] font-bold text-white">
                Program
              </span>
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

function PreviewSchedule() {
  const days = [
    { d: "Mon", n: "3", off: false },
    { d: "Tue", n: "4", off: false },
    { d: "Wed", n: "5", off: false, active: true },
    { d: "Thu", n: "6", off: false },
    { d: "Fri", n: "7", off: false },
    { d: "Sat", n: "8", off: true },
    { d: "Sun", n: "9", off: true },
  ];
  return (
    <Phone>
      <div className="space-y-2 p-2.5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-[13px] font-semibold">Schedule</p>
          <div className="rounded-lg bg-[#F3F4F6] p-0.5">
            <span className="rounded-md bg-[#16A34A] px-2 py-1 text-[8px] font-semibold text-white">
              Calendar
            </span>
            <span className="px-2 py-1 text-[8px] font-semibold text-[#6B7280]">List</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div
              key={day.d}
              className={cn(
                "rounded-lg px-0.5 py-1.5 text-center",
                day.active
                  ? "bg-[#4F8FF7] text-white"
                  : day.off
                    ? "bg-[#F9FAFB]"
                    : "bg-[#F0FDF4]"
              )}
            >
              <p
                className={cn(
                  "text-[7px] font-bold uppercase",
                  day.active ? "text-white/80" : "text-[#6B7280]"
                )}
              >
                {day.d}
              </p>
              <p
                className={cn(
                  "font-heading text-[11px] font-bold",
                  day.active ? "text-white" : day.off ? "text-[#9CA3AF]" : "text-[#16A34A]"
                )}
              >
                {day.n}
              </p>
              {day.off ? (
                <p className="text-[6px] font-semibold uppercase text-[#9CA3AF]">Off</p>
              ) : null}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[28px_repeat(7,minmax(0,1fr))] gap-1">
          {["8a", "9a", "10a"].map((t) => (
            <div key={t} className="contents">
              <div className="flex items-center justify-end pr-0.5 text-[7px] font-bold text-[#14532D]">
                {t}
              </div>
              {days.map((day, i) => {
                if (day.off) {
                  return <div key={`${t}-${i}`} className="min-h-[28px] rounded-md bg-[#F3F4F6]/80" />;
                }
                if (t === "9a" && i === 2) {
                  return (
                    <div
                      key={`${t}-${i}`}
                      className="flex min-h-[28px] flex-col items-center justify-center rounded-md border border-[#BBF7D0] bg-[#F0FDF4]"
                    >
                      <span className="text-[6px] font-bold text-[#14532D]">Mia</span>
                    </div>
                  );
                }
                if (t === "10a" && i === 1) {
                  return (
                    <div
                      key={`${t}-${i}`}
                      className="flex min-h-[28px] items-center justify-center rounded-md border border-[#DDD6FE] bg-[#F5F3FF]"
                    >
                      <span className="text-[6px] font-bold text-[#5B21B6]">Clinic</span>
                    </div>
                  );
                }
                return (
                  <div
                    key={`${t}-${i}`}
                    className="flex min-h-[28px] items-center justify-center rounded-md border border-[#4F8FF7] bg-[#EFF6FF] text-[7px] font-bold text-[#4F8FF7]"
                  >
                    Open
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1 text-[7px] text-[#6B7280]">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-1.5 py-0.5 font-semibold text-[#1D4ED8]">
            Open = bookable
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 font-semibold">
            Grey = outside / off
          </span>
        </div>
        <div className="flex justify-end gap-2 pt-1 text-[8px] font-semibold text-[#6B7280]">
          <span>Show earlier / later</span>
          <span className="inline-flex items-center gap-0.5">
            <Ban className="h-2.5 w-2.5" /> Mark time off
          </span>
        </div>
      </div>
    </Phone>
  );
}

function PreviewStudents() {
  return (
    <Phone>
      <div className="space-y-2 p-2.5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-[13px] font-semibold">Students</p>
          <span className="rounded-full bg-[#16A34A] px-2 py-1 text-[8px] font-semibold text-white">
            Add student
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0FDF4]">
            <QrCode className="h-4 w-4 text-[#166534]" />
          </div>
          <div>
            <p className="font-heading text-[10px] font-semibold">Student join QR</p>
            <p className="text-[8px] text-[#6B7280]">Tap to show a code players can scan</p>
          </div>
        </div>
        <div className="flex gap-1 overflow-hidden">
          {["Active", "All", "New (1)", "Inactive"].map((c, i) => (
            <span
              key={c}
              className={cn(
                "rounded-full px-2 py-1 text-[8px] font-semibold",
                i === 0 ? "bg-[#16A34A] text-white" : "border border-[#E5E7EB] text-[#6B7280]"
              )}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="rounded-2xl border border-[#16A34A]/30 bg-white p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0FDF4]">
              <Clock className="h-3.5 w-3.5 text-[#16A34A]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[10px] font-semibold">Jordan Lee</p>
              <p className="text-[8px] text-[#6B7280]">New sign-up</p>
            </div>
          </div>
          <div className="mt-2 flex gap-1.5">
            <span className="flex-1 rounded-lg bg-[#16A34A] py-1.5 text-center text-[8px] font-semibold text-white">
              Accept
            </span>
            <span className="flex-1 rounded-lg border border-[#E5E7EB] py-1.5 text-center text-[8px] font-semibold text-[#6B7280]">
              Decline
            </span>
          </div>
        </div>
        {["Mia Santos", "Josh Lim"].map((name) => (
          <div key={name} className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-2.5 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F8FF7] text-[10px] font-bold text-white">
              {name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[10px] font-semibold">{name}</p>
              <span className="mt-0.5 inline-block rounded-full bg-[#E5EFE8] px-1.5 py-0.5 text-[7px] font-bold text-[#3D5C47]">
                Intermediate
              </span>
            </div>
          </div>
        ))}
      </div>
    </Phone>
  );
}

function PreviewSession() {
  return (
    <Phone>
      <div className="space-y-2 p-2.5">
        <div className="rounded-3xl bg-[#14532D] p-3 text-white">
          <div className="flex flex-wrap gap-1">
            <span className="rounded-full bg-[#FACC15] px-1.5 py-0.5 text-[7px] font-bold text-[#14532D]">
              Drop-in
            </span>
            <span className="rounded-full bg-[#FEFCE8] px-1.5 py-0.5 text-[7px] font-bold text-[#854D0E]">
              Needs wrap-up
            </span>
          </div>
          <p className="font-heading mt-2 text-[15px] font-bold">Mia Santos</p>
          <p className="mt-1 text-[11px] text-[#86EFAC]">₱800</p>
          <div className="mt-2 space-y-1 text-[9px] text-white/85">
            <p>Sun, Aug 2 · 8:00-9:00 AM</p>
            <p>Sarazas Court 2</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <p className="font-heading text-[10px] font-semibold">Payment</p>
          <p className="text-[8px] text-[#6B7280]">Session fee ₱800 · tip ₱0</p>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F0FDF4] px-2 py-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-[#16A34A]">
              <Check className="h-3 w-3 text-white" />
            </span>
            <span className="text-[9px] font-semibold text-[#14532D]">Paid</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <p className="font-heading text-[10px] font-semibold">Skills</p>
          {[
            { n: "Dinks", a: 3 },
            { n: "Third shot", a: 4 },
          ].map((s) => (
            <div key={s.n} className="mt-1.5 flex items-center justify-between text-[9px]">
              <span className="font-medium text-[#374151]">{s.n}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-3 w-3",
                      n <= s.a ? "fill-[#FACC15] text-[#FACC15]" : "text-[#E5E7EB]"
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-[#16A34A] py-2.5 text-center text-[10px] font-bold text-white">
          Mark done & continue
        </div>
      </div>
    </Phone>
  );
}

function PreviewProgress() {
  return (
    <Phone>
      <div className="min-h-[400px] bg-gradient-to-b from-[#F8FAFC] via-[#FAFAF8] to-[#F9FAFB] p-3">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white/95 p-3 shadow-sm">
          <p className="text-[8px] font-bold uppercase tracking-wider text-[#16A34A]">
            Session progress
          </p>
          <p className="font-heading mt-1 text-[15px] font-bold text-[#111827]">Mia Santos</p>
          <p className="text-[9px] text-[#6B7280]">Coached by Coach Lex</p>
          <span className="mt-2 inline-block rounded-full bg-[#16A34A] px-2 py-0.5 text-[8px] font-bold text-white">
            Intermediate package
          </span>
          <div className="mt-3 rounded-2xl border border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] to-[#F0FDF4] p-2.5">
            <p className="font-heading text-[11px] font-bold text-[#14532D]">
              Nice climb on third shot drop
            </p>
          </div>
          <div className="mt-2 space-y-1.5">
            {[
              { n: "Dinks", d: "+1" },
              { n: "Third shot", d: "+2" },
            ].map((s) => (
              <div
                key={s.n}
                className="flex items-center justify-between rounded-xl bg-gradient-to-r from-white to-[#F0FDF4] px-2.5 py-2"
              >
                <span className="text-[9px] font-semibold">{s.n}</span>
                <span className="rounded-full bg-[#DCFCE7] px-1.5 py-0.5 text-[8px] font-bold text-[#14532D]">
                  {s.d}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[#14532D] py-2 text-center text-[9px] font-bold text-white">
            Share progress
          </div>
        </div>
      </div>
    </Phone>
  );
}

function PreviewPrograms() {
  return (
    <Phone>
      <div className="space-y-2 p-2.5">
        <p className="font-heading text-[13px] font-semibold">Programs</p>
        <div className="flex items-center gap-2 rounded-2xl border border-[#BFDBFE] bg-white p-2.5 ring-1 ring-[#BFDBFE]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <Zap className="h-4 w-4 text-[#2563EB]" />
          </div>
          <div className="flex-1">
            <p className="font-heading text-[10px] font-semibold">Skills you score</p>
            <p className="text-[8px] text-[#4F8FF7]">Edit →</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-2xl border-2 border-[#16A34A] bg-[#F0FDF4]/30 p-2.5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#16A34A]">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <p className="font-heading text-[9px] font-bold leading-tight">Create Custom Program</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#14532D]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <p className="font-heading text-[9px] font-bold leading-tight">Start from Ready-Made</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-heading text-[11px] font-semibold">8-session Intermediate</p>
            <span className="rounded bg-[#14532D] px-1.5 py-0.5 text-[7px] font-bold text-white">
              Custom
            </span>
          </div>
          <p className="mt-1 text-[9px] font-semibold text-[#4F8FF7]">₱4,800</p>
          <p className="mt-0.5 text-[8px] text-[#6B7280]">2 enrolled · 5 skills</p>
        </div>
      </div>
    </Phone>
  );
}

function PreviewClinics() {
  return (
    <Phone>
      <div className="space-y-2 p-2.5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-[13px] font-semibold">Clinics</p>
          <span className="rounded-full bg-[#16A34A] px-2 py-1 text-[8px] font-semibold text-white">
            New clinic
          </span>
        </div>
        <div className="rounded-3xl bg-[#14532D] p-3 text-white">
          <div className="flex gap-1">
            <span className="rounded-full bg-[#7C3AED] px-1.5 py-0.5 text-[7px] font-bold">Clinic</span>
            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[7px] font-bold">Active</span>
          </div>
          <p className="font-heading mt-2 text-[15px] font-bold">Beginner Saturday</p>
          <p className="mt-1 text-[11px] text-[#86EFAC]">₱6,400 collected</p>
          <div className="mt-2 space-y-1 text-[9px] text-white/85">
            <p className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#86EFAC]" /> Sarazas Court 1
            </p>
            <p className="flex items-center gap-1">
              <Users className="h-3 w-3 text-[#86EFAC]" /> 8 / 10 enrolled
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F3F4F6] p-1">
          <span className="rounded-lg bg-white py-1.5 text-center text-[9px] font-semibold shadow-sm">
            Roster
          </span>
          <span className="rounded-lg py-1.5 text-center text-[9px] font-semibold text-[#6B7280]">
            Sessions
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {["Present", "Present", "Late", "Absent"].map((s, i) => (
            <div
              key={`${s}-${i}`}
              className={cn(
                "rounded-xl px-2 py-2 text-center text-[9px] font-semibold",
                s === "Present"
                  ? "bg-[#DCFCE7] text-[#14532D]"
                  : s === "Late"
                    ? "bg-[#FEF9C3] text-[#854D0E]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
              )}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function PreviewProfile() {
  return (
    <Phone>
      <div className="space-y-2 p-2.5">
        <p className="font-heading text-[13px] font-semibold">Profile</p>
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          <div className="relative h-20 bg-gradient-to-r from-[#16A34A] to-[#4F8FF7]">
            <div className="absolute -bottom-6 left-3 h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow">
              <Image src="/illustrations/mock-coach.webp" alt="" fill className="object-cover" sizes="56px" />
            </div>
          </div>
          <div className="px-3 pb-3 pt-8">
            <p className="font-heading text-[12px] font-bold">Coach Lex</p>
            <p className="mt-1 text-[9px] leading-snug text-[#6B7280]">
              Intermediate & advanced. Weeknights at Sarazas.
            </p>
            <span className="mt-2 inline-block text-[8px] font-semibold text-[#4F8FF7]">Edit bio</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0FDF4]">
              <Clock className="h-4 w-4 text-[#166534]" />
            </div>
            <div className="flex-1">
              <p className="font-heading text-[10px] font-semibold">Working hours</p>
              <p className="text-[8px] text-[#6B7280]">Mon-Fri 8:00 AM - 9:00 PM</p>
            </div>
            <span className="text-[8px] font-semibold text-[#4F8FF7]">Edit</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <p className="font-heading text-[10px] font-semibold">Drop-in rates</p>
          <div className="mt-1.5 space-y-1">
            {[
              { l: "1 player · 1 hr", r: "₱800" },
              { l: "2 players · 1 hr", r: "₱1,200" },
            ].map((row) => (
              <div key={row.l} className="flex justify-between rounded-lg bg-[#F9FAFB] px-2 py-1.5 text-[9px]">
                <span className="text-[#6B7280]">{row.l}</span>
                <span className="font-semibold text-[#14532D]">{row.r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Phone>
  );
}

function PreviewSocial() {
  return (
    <Phone>
      <div className="space-y-2 p-2.5">
        <p className="font-heading text-[13px] font-semibold">Social</p>
        <p className="text-[9px] text-[#6B7280]">Create an IG or FB story from your schedule.</p>
        <p className="text-[9px] font-bold text-[#14532D]">Step 1. Choose a design</p>
        <div className="rounded-2xl border border-[#16A34A] bg-[#F0FDF4] p-2.5">
          <p className="font-heading text-[10px] font-semibold">Today&apos;s openings</p>
          <p className="text-[8px] text-[#6B7280]">Open & booked slots for one day</p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <p className="font-heading text-[10px] font-semibold">Week calendar</p>
          <p className="text-[8px] text-[#6B7280]">Weekly grid with booked & open slots</p>
        </div>
        <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-[#14532D] to-[#16A34A] p-3 text-white">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-white/70">{BRAND_NAME}</p>
          <p className="font-heading mt-2 text-[13px] font-bold">Open slots this week</p>
          <div className="mt-2 space-y-1">
            {["Tue 7:00 PM", "Wed 8:00 AM", "Fri 6:00 PM"].map((t) => (
              <div key={t} className="rounded-lg bg-white/15 px-2 py-1.5 text-[9px] font-semibold">
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-[#16A34A] py-2 text-center text-[9px] font-bold text-white">
          Save image
        </div>
      </div>
    </Phone>
  );
}

function PreviewMoney() {
  return (
    <Phone>
      <div className="space-y-2 p-2.5">
        <p className="font-heading text-[13px] font-semibold">Earnings</p>
        <div className="flex gap-1">
          {["This week", "This month", "All time"].map((p, i) => (
            <span
              key={p}
              className={cn(
                "rounded-full px-2 py-1 text-[8px] font-semibold",
                i === 1 ? "bg-[#16A34A] text-white" : "border border-[#E5E7EB] text-[#6B7280]"
              )}
            >
              {p}
            </span>
          ))}
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9CA3AF]">
            Collected · This month
          </p>
          <p className="font-heading mt-1 text-xl font-bold text-[#111827]">₱24,800</p>
          <p className="mt-1 text-[8px] text-[#6B7280]">18 completed · avg ₱1,377 · ₱1,200 tips</p>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E5E7EB] pt-2">
            <div>
              <p className="text-[8px] text-[#9CA3AF]">Outstanding</p>
              <p className="font-heading text-[12px] font-bold text-[#D97706]">₱3,200</p>
            </div>
            <div>
              <p className="text-[8px] text-[#9CA3AF]">Expected</p>
              <p className="font-heading text-[12px] font-bold text-[#4F8FF7]">₱28,000</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2.5">
          <p className="font-heading text-[10px] font-semibold">Billing</p>
          <p className="mt-1 text-[9px] text-[#6B7280]">Founding plan · Active</p>
          <div className="mt-2 rounded-lg bg-[#F0FDF4] px-2 py-1.5 text-[8px] font-semibold text-[#14532D]">
            Upload receipt when you renew
          </div>
        </div>
      </div>
    </Phone>
  );
}

export function CoachGuidePage() {
  return (
    <div className="coach-portal relative min-h-dvh overflow-x-hidden bg-[#FAFAF8] text-[#111827]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ECFDF5] via-[#FAFAF8] to-[#EFF6FF]"
        aria-hidden
      />
      <PickleballBallBackdrop variant="landing" className="opacity-60" />

      <header className="relative z-[2] sticky top-0 border-b border-[#E5E7EB]/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 px-3 sm:h-14 sm:gap-3 sm:px-4">
          <Link
            href="/coach/dashboard"
            className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-1.5 text-sm font-semibold text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] sm:min-h-[40px] sm:gap-1.5 sm:px-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            App
          </Link>
          <KoachesWordmark className="h-6 sm:h-7" />
          <a
            href="#help"
            className="font-heading inline-flex min-h-[36px] items-center rounded-full bg-[#EFF6FF] px-2.5 text-[11px] font-semibold text-[#1D4ED8] sm:min-h-[40px] sm:px-3 sm:text-xs"
          >
            Help
          </a>
        </div>
        <div className="border-t border-[#E5E7EB]/60">
          <div className="mx-auto flex max-w-5xl gap-0.5 overflow-x-auto px-2 py-1.5 sm:gap-1 sm:px-3 sm:py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="font-heading shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] sm:px-3 sm:py-1.5 sm:text-xs"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-[1]">
        <Section
          id="start"
          step="New coach tutorial"
          title={`Welcome to ${BRAND_NAME}`}
          subtitle="This is your full walkthrough. Every main tool is below, with a preview that matches what you will see in the app."
        >
          <div className="grid items-center gap-4 sm:gap-6 md:grid-cols-[1fr_180px] md:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[
                  { n: "1", t: "Set up Profile", d: "Photo, rates, hours" },
                  { n: "2", t: "Add students", d: "Join link or manual" },
                  { n: "3", t: "Book & wrap up", d: "Schedule to progress card" },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="rounded-xl border border-[#E5E7EB] bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4"
                  >
                    <span className="font-heading flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A] text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
                      {s.n}
                    </span>
                    <p className="font-heading mt-2 text-[11px] font-semibold leading-tight sm:mt-3 sm:text-sm">
                      {s.t}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug text-[#6B7280] sm:text-xs">{s.d}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#111827] sm:rounded-3xl">
                <div className="aspect-video">
                  <MarketingDemoVideo
                    src="/illustrations/record-desktop.mov"
                    className="h-full w-full"
                  />
                </div>
              </div>
              <p className="text-center text-[10px] text-[#9CA3AF] sm:text-xs">Optional video walkthrough</p>
            </div>
            <div className="relative mx-auto hidden h-40 w-40 md:block md:h-48 md:w-48">
              <Image
                src="/illustrations/mascot.webp"
                alt=""
                fill
                priority
                className="object-contain drop-shadow-xl"
                sizes="192px"
              />
            </div>
          </div>
        </Section>

        <Section
          id="nav"
          step="Basics"
          title="Getting around"
          subtitle="Phone uses the bottom bar. Desktop uses the side menu. More holds the rest."
        >
          <div className="grid grid-cols-5 gap-1 sm:gap-2 lg:gap-3">
            {[
              { icon: Home, label: "Home", where: "Bar", detail: "Today + overview" },
              { icon: CalendarDays, label: "Schedule", where: "Bar", detail: "Week calendar" },
              { icon: Users, label: "Students", where: "Bar", detail: "Roster + join QR" },
              { icon: BarChart3, label: "Earnings", where: "Bar", detail: "Money reports" },
              { icon: FileText, label: "More", where: "Sheet", detail: "Programs, clinics, social…" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#E5E7EB] bg-white p-1.5 text-center shadow-sm sm:rounded-2xl sm:p-3 lg:p-4"
                >
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] sm:h-10 sm:w-10 sm:rounded-xl lg:h-12 lg:w-12 lg:rounded-2xl">
                    <Icon className="h-3.5 w-3.5 text-[#4F8FF7] sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                  <p className="font-heading mt-1.5 text-[9px] font-semibold leading-tight sm:mt-2 sm:text-xs lg:text-sm">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-[#9CA3AF] sm:text-[9px] lg:text-[10px]">
                    {item.where}
                  </p>
                  <p className="mt-0.5 hidden text-[10px] text-[#6B7280] lg:block">{item.detail}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-white p-3 sm:mt-4 sm:rounded-2xl sm:p-4">
            <p className="font-heading text-xs font-semibold sm:text-sm">Also in More / sidebar</p>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
              {["Programs", "Clinics", "Social", "Profile", "Billing", "Settings", "This guide"].map(
                (label) => (
                  <span
                    key={label}
                    className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#374151] sm:px-3 sm:py-1.5 sm:text-xs"
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </div>
        </Section>

        <Section
          id="home"
          step="Daily hub"
          title="Home"
          subtitle="Your morning glance. Today's sessions, money strip, and anything that needs a tap."
        >
          <Split preview={<PreviewHome />}>
            <FeatureGrid
              items={[
                { icon: Home, label: "Greeting hero", hint: "Date, how many sessions today" },
                { icon: BarChart3, label: "Week / month strip", hint: "Earned, sessions, on the way" },
                { icon: CalendarDays, label: "Today list", hint: "Next session gets a green ring" },
                { icon: Sparkles, label: "Needs attention", hint: "Progress cards waiting to send" },
                { icon: Check, label: "First-run checklist", hint: "Skills → student → first booking" },
                { icon: FileText, label: "Coming up", hint: "Later sessions further down" },
              ]}
            />
          </Split>
        </Section>

        <Section
          id="setup"
          step="Step 1"
          title="Set up once"
          subtitle="Do this before you book a lot. Players see your public page. The calendar uses your hours as a guide."
        >
          <Split preview={<PreviewProfile />}>
            <FeatureGrid
              items={[
                { icon: User, label: "Photo & bio", hint: "First thing players see on your public page" },
                { icon: Wallet, label: "Drop-in rates", hint: "Tiers by player count and session length" },
                { icon: Clock, label: "Working hours", hint: "Usual days and windows. Off days stay bookable" },
                { icon: MapPin, label: "Courts", hint: "Where you teach. Request a new court if needed" },
                { icon: Zap, label: "Skills you score", hint: "The 1 to 5 skills you rate after sessions" },
                { icon: Link2, label: "Public link", hint: "Share your coach page anytime" },
                { icon: MessageCircle, label: "Contact & socials", hint: "Mobile, Instagram, Facebook" },
                { icon: Star, label: "Player levels", hint: "Who you love coaching most" },
              ]}
            />
            <p className="text-[10px] leading-snug text-[#6B7280] sm:text-xs">
              Tip: use Mark time off on the calendar for one-off breaks. Working hours stay your usual
              pattern.
            </p>
          </Split>
        </Section>

        <Section
          id="students"
          step="Step 2"
          title="Students"
          subtitle="Your roster, join link, and new sign-ups waiting for a yes."
        >
          <Split preview={<PreviewStudents />} flip>
            <FeatureGrid
              items={[
                { icon: QrCode, label: "Join QR", hint: "Players scan to sign up for your roster" },
                { icon: Link2, label: "Join link", hint: "Copy a message for Viber or Messenger" },
                { icon: Check, label: "Accept / decline", hint: "Approve new sign-ups before they join" },
                { icon: Users, label: "Add student", hint: "Add someone manually when you need to" },
                { icon: User, label: "Student profile", hint: "Sessions, notes, program, progress" },
                { icon: Sparkles, label: "Ready to send", hint: "Progress cards waiting on the list" },
              ]}
            />
          </Split>
        </Section>

        <Section
          id="schedule"
          step="Step 3"
          title="Schedule"
          subtitle="Your week. Blue Open slots are inside usual hours. Grey slots are outside or day off, still bookable."
        >
          <Split preview={<PreviewSchedule />}>
            <FeatureGrid
              items={[
                { icon: CalendarDays, label: "Calendar view", hint: "Week grid with Open, booked, time off" },
                { icon: FileText, label: "List view", hint: "Upcoming and past sessions in a list" },
                { icon: Check, label: "Book a slot", hint: "Tap Open for drop-in or program sessions" },
                { icon: Clock, label: "Outside hours", hint: "Grey cells still open when a player asks" },
                { icon: Ban, label: "Mark time off", hint: "Close hours you cannot teach" },
                { icon: CalendarDays, label: "Show earlier / later", hint: "Expand to the full day window" },
                { icon: GraduationCap, label: "Clinic blocks", hint: "Purple cells on clinic days" },
                { icon: Sparkles, label: "Day off columns", hint: "Off chip on the header. Still bookable" },
              ]}
            />
          </Split>
        </Section>

        <Section
          id="session"
          step="Step 4"
          title="Running a session"
          subtitle="Open a booking to manage players, payment, notes, and wrap-up."
        >
          <Split preview={<PreviewSession />} flip>
            <FeatureGrid
              items={[
                {
                  icon: FileText,
                  label: "Session types",
                  hint: "Drop-in (yellow), Program (blue), Clinic (purple)",
                },
                { icon: Wallet, label: "Payment + tip", hint: "Mark Paid. Tips show up in earnings" },
                { icon: Users, label: "Edit players", hint: "Change who is on the session" },
                { icon: Star, label: "Skill ratings", hint: "Score 1 to 5 after you mark it done" },
                { icon: Check, label: "Wrap-up flow", hint: "Mark done → rate → save → optional message" },
                {
                  icon: Clock,
                  label: "Statuses",
                  hint: "Upcoming, Needs wrap-up, Ready to send, Done, Canceled",
                },
              ]}
            />
          </Split>
        </Section>

        <Section
          id="progress"
          step="Step 5"
          title="Progress cards"
          subtitle="After program wrap-ups, send a card players can share. Looks sharp on Viber and Instagram."
        >
          <Split preview={<PreviewProgress />}>
            <FeatureGrid
              items={[
                { icon: Sparkles, label: "Generate card", hint: "Built from the skills you rated" },
                { icon: MessageCircle, label: "Message for student", hint: "Copy a paste-ready note with the link" },
                { icon: Mail, label: "Email the card", hint: "Send to the player. Limited resends" },
                { icon: Share2, label: "Public page", hint: "Students open /progress and share it" },
                { icon: Home, label: "Reminders", hint: "Home and Students nudge you when one is ready" },
                { icon: Star, label: "Before → after", hint: "Shows the climb on each skill" },
              ]}
            />
          </Split>
        </Section>

        <Section
          id="programs"
          step="Packages"
          title="Programs"
          subtitle="Multi-session packages with a price and the skills you want to track."
        >
          <Split preview={<PreviewPrograms />} flip>
            <FeatureGrid
              items={[
                { icon: FileText, label: "Custom program", hint: "Name, sessions, price, skill list" },
                { icon: Sparkles, label: "Ready-made", hint: "Start from a template, then tweak" },
                { icon: Users, label: "Enroll students", hint: "Attach a package to a player" },
                { icon: CalendarDays, label: "Book sessions", hint: "Schedule program sessions from the calendar" },
                { icon: Zap, label: "Program skills", hint: "Can differ from your drop-in skill set" },
                { icon: Wallet, label: "Package price", hint: "Shows on the program and student views" },
              ]}
            />
          </Split>
        </Section>

        <Section
          id="clinics"
          step="Groups"
          title="Clinics"
          subtitle="Group days with one roster across every date. Attendance and payment in one place."
        >
          <Split preview={<PreviewClinics />}>
            <FeatureGrid
              items={[
                { icon: GraduationCap, label: "New clinic", hint: "Dates, court, capacity, pricing mode" },
                { icon: Users, label: "Shared roster", hint: "Same players across all clinic days" },
                { icon: Check, label: "Attendance", hint: "Present, late, or absent on the day" },
                { icon: Wallet, label: "Flat or per-player pay", hint: "Track who has paid" },
                { icon: CalendarDays, label: "On the schedule", hint: "Clinic blocks show up in purple" },
                { icon: BarChart3, label: "Collected", hint: "Revenue sits on the clinic detail" },
              ]}
            />
          </Split>
        </Section>

        <Section
          id="social"
          step="Marketing"
          title="Social stories"
          subtitle="Turn open court time into an IG or FB story image. No redesign after a long day."
        >
          <Split preview={<PreviewSocial />} flip>
            <FeatureGrid
              items={[
                { icon: Share2, label: "Today's openings", hint: "One-day open and booked slots" },
                { icon: CalendarDays, label: "Week calendar", hint: "Full week graphic" },
                { icon: Check, label: "Pick a date", hint: "Live preview before you save" },
                { icon: Share2, label: "Save / share", hint: "Download the PNG for Stories" },
              ]}
            />
          </Split>
        </Section>

        <Section
          id="money"
          step="Money"
          title="Earnings and billing"
          subtitle="See what came in. Keep your PickleKoach plan current."
        >
          <Split preview={<PreviewMoney />}>
            <FeatureGrid
              items={[
                { icon: BarChart3, label: "Collected", hint: "Week, month, or all time" },
                { icon: Wallet, label: "Outstanding", hint: "Unpaid sessions still on the books" },
                { icon: Sparkles, label: "Expected", hint: "If everything gets paid" },
                { icon: Users, label: "Top students", hint: "By sessions or revenue" },
                { icon: GraduationCap, label: "Clinic revenue", hint: "Tracked separately in purple" },
                { icon: CreditCard, label: "Billing", hint: "Plan status and receipt upload" },
              ]}
            />
          </Split>
        </Section>

        <Section id="help" title="You are ready" subtitle="Start with Profile, then book one real session this week.">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="relative min-h-[140px] overflow-hidden rounded-2xl sm:min-h-[200px] sm:rounded-3xl">
              <Image
                src="/illustrations/coaches.webp"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#ECFDF5] p-4 sm:rounded-3xl sm:p-6 lg:p-8">
              <p className="font-heading text-base font-semibold text-[#111827] sm:text-lg">
                Need a live walkthrough?
              </p>
              <p className="mt-1.5 text-xs text-[#4B5563] sm:mt-2 sm:text-sm">
                Message us on Viber. We can hop on and set things up with you.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row">
                <a
                  href={VIBER.href}
                  className="font-heading inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#4F8FF7] px-5 text-sm font-semibold text-white hover:bg-[#3B82F6]"
                >
                  Viber {VIBER.display}
                </a>
                <Link
                  href="/coach/dashboard"
                  className="font-heading inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#16A34A] px-5 text-sm font-semibold text-white hover:bg-[#15803D]"
                >
                  Open the app
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
