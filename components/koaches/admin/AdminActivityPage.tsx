"use client";

import { useMemo, useState } from "react";
import type { AdminActivityData, AdminSessionActivityRow } from "@/lib/koaches/admin-activity";
import { PROGRESS_CARD_EMAIL_MAX_SENDS } from "@/lib/koaches/progress-card-email-limits";
import {
  AdminPageHeader,
  AdminPageShell,
  adminListClass,
  adminListEmptyClass,
  adminListRowClass,
} from "@/components/koaches/admin/AdminPageLayout";
import { cn, formatDisplayDate } from "@/lib/utils";

type AdminActivityPageProps = {
  data: AdminActivityData;
};

type FilterKey = "all" | "missing" | "rated" | "emailed" | "limit";

const cardClass =
  "overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#E5E7EB]/80";

function typeLabel(type: AdminSessionActivityRow["type"]): string {
  if (type === "drop-in") return "Drop-in";
  if (type === "clinic") return "Clinic";
  return "Program";
}

function StatusChips({ row }: { row: AdminSessionActivityRow }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
          row.hasRatings ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#F3F4F6] text-[#6B7280]"
        )}
      >
        {row.hasRatings ? "Rated" : "No ratings"}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
          row.progressCardId ? "bg-[#EFF6FF] text-[#1D4ED8]" : "bg-[#FFF7ED] text-[#C2410C]"
        )}
      >
        {row.progressCardId ? "Card" : "No card"}
      </span>
      {row.progressCardId ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            row.atEmailLimit
              ? "bg-[#FEF2F2] text-[#B91C1C]"
              : row.emailSendCount > 0
                ? "bg-[#F0FDF4] text-[#166534]"
                : "bg-[#F3F4F6] text-[#6B7280]"
          )}
        >
          {row.atEmailLimit
            ? `Limit ${PROGRESS_CARD_EMAIL_MAX_SENDS}/${PROGRESS_CARD_EMAIL_MAX_SENDS}`
            : row.emailSendCount > 0
              ? `Emailed ${row.emailSendCount}×`
              : "Not emailed"}
        </span>
      ) : null}
    </div>
  );
}

export function AdminActivityPage({ data }: AdminActivityPageProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const { summary, sessions, coachesNeedingFollowThrough } = data;

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: sessions.length },
    {
      key: "missing",
      label: "No card",
      count: sessions.filter((s) => !s.progressCardId).length,
    },
    { key: "rated", label: "Rated", count: sessions.filter((s) => s.hasRatings).length },
    {
      key: "emailed",
      label: "Emailed",
      count: sessions.filter((s) => s.emailSendCount > 0).length,
    },
    {
      key: "limit",
      label: "At limit",
      count: sessions.filter((s) => s.atEmailLimit).length,
    },
  ];

  const filtered = useMemo(() => {
    switch (filter) {
      case "missing":
        return sessions.filter((s) => !s.progressCardId);
      case "rated":
        return sessions.filter((s) => s.hasRatings);
      case "emailed":
        return sessions.filter((s) => s.emailSendCount > 0);
      case "limit":
        return sessions.filter((s) => s.atEmailLimit);
      default:
        return sessions;
    }
  }, [filter, sessions]);

  return (
    <AdminPageShell>
      <AdminPageHeader title="Sessions" className="mb-6" />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={cn(cardClass, "p-4")}>
          <p className="text-xs font-medium text-[#6B7280]">Sessions · 7d</p>
          <p className="font-heading mt-1.5 text-2xl font-bold text-[#14532D]">
            {summary.sessionsDone7d}
          </p>
        </div>
        <div className={cn(cardClass, "p-4")}>
          <p className="text-xs font-medium text-[#6B7280]">With card · 30d</p>
          <p className="font-heading mt-1.5 text-2xl font-bold text-[#1D4ED8]">
            {summary.withCard30d}
          </p>
        </div>
        <div className={cn(cardClass, "p-4")}>
          <p className="text-xs font-medium text-[#6B7280]">Missing · 30d</p>
          <p className="font-heading mt-1.5 text-2xl font-bold text-[#9A3412]">
            {summary.missingCard30d}
          </p>
        </div>
        <div className={cn(cardClass, "p-4")}>
          <p className="text-xs font-medium text-[#6B7280]">Emailed · 30d</p>
          <p className="font-heading mt-1.5 text-2xl font-bold text-[#111827]">
            {summary.cardsEmailed30d}
          </p>
        </div>
      </section>

      {coachesNeedingFollowThrough.length > 0 ? (
        <section className={cn(cardClass, "mt-4 p-5")}>
          <h2 className="font-heading font-semibold text-[#111827]">Low card rate</h2>
          <ul className="mt-3 divide-y divide-[#F3F4F6]">
            {coachesNeedingFollowThrough.map((coach) => (
              <li
                key={coach.coachId}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                    {coach.coachName}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {coach.withCard30d}/{coach.doneSessions30d} cards
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#FFF7ED] px-2.5 py-1 text-xs font-bold text-[#9A3412]">
                  {coach.cardRate}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === f.key
                  ? "bg-[#14532D] text-white"
                  : "bg-white text-[#6B7280] ring-1 ring-[#E5E7EB] hover:bg-[#F9FAFB]"
              )}
            >
              {f.label}
              <span className={cn("ml-1.5 tabular-nums", filter === f.key ? "opacity-80" : "")}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={adminListEmptyClass}>No sessions</div>
        ) : (
          <>
            <div className={cn(adminListClass, "md:hidden")}>
              <ul className="divide-y divide-[#F3F4F6]">
                {filtered.map((row) => (
                  <li key={row.sessionId} className={adminListRowClass()}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                          {row.playerLabel}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                          {row.coachName} · {typeLabel(row.type)}
                          {row.playerCount > 1 ? ` · ${row.playerCount}` : ""}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-xs font-medium text-[#374151]">
                        {row.date ? formatDisplayDate(row.date) : "—"}
                        <span className="mt-0.5 block font-normal text-[#9CA3AF]">
                          {row.time}
                          {row.endTime ? `–${row.endTime}` : ""}
                        </span>
                      </p>
                    </div>
                    <div className="mt-2">
                      <StatusChips row={row} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn(adminListClass, "hidden overflow-x-auto md:block")}>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Players</th>
                    <th className="px-4 py-2.5">Coach</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.map((row) => (
                    <tr key={row.sessionId} className="align-top">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <p className="font-medium text-[#111827]">
                          {row.date ? formatDisplayDate(row.date) : "—"}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {row.time}
                          {row.endTime ? `–${row.endTime}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-[#111827]">{row.playerLabel}</p>
                        {row.playerCount > 1 ? (
                          <p className="text-xs text-[#9CA3AF]">{row.playerCount} players</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5 text-[#374151]">{row.coachName}</td>
                      <td className="px-4 py-2.5 text-[#6B7280]">{typeLabel(row.type)}</td>
                      <td className="px-4 py-2.5">
                        <StatusChips row={row} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </AdminPageShell>
  );
}
