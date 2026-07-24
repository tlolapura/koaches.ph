"use client";

import { useMemo, useState } from "react";
import {
  CalendarCheck2,
  Mail,
  MailWarning,
  Sparkles,
  Users,
} from "lucide-react";
import type { AdminActivityData, AdminSessionActivityRow } from "@/lib/koaches/admin-activity";
import { PROGRESS_CARD_EMAIL_MAX_SENDS } from "@/lib/koaches/progress-card-email-limits";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { cn, formatDisplayDate } from "@/lib/utils";

type AdminActivityPageProps = {
  data: AdminActivityData;
};

type FilterKey = "all" | "missing" | "rated" | "emailed" | "limit";

const cardClass =
  "overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#E5E7EB]/80";

function MetricTile({
  label,
  value,
  sub,
  tone = "green",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "green" | "blue" | "amber" | "slate";
}) {
  const valueColor =
    tone === "blue"
      ? "text-[#1D4ED8]"
      : tone === "amber"
        ? "text-[#9A3412]"
        : tone === "slate"
          ? "text-[#334155]"
          : "text-[#14532D]";

  return (
    <div className={cn(cardClass, "p-4")}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
      <p className={cn("font-heading mt-1.5 text-2xl font-bold leading-none", valueColor)}>
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-xs text-[#6B7280]">{sub}</p> : null}
    </div>
  );
}

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
        {row.progressCardId ? "Card created" : "Missing card"}
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
            ? `Email limit ${PROGRESS_CARD_EMAIL_MAX_SENDS}/${PROGRESS_CARD_EMAIL_MAX_SENDS}`
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
      label: "Missing card",
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
      label: "Email limit",
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
      <AdminPageHeader
        title="Sessions"
        subtitle="Coaching activity — completed sessions and progress card follow-through"
        className="mb-6"
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Sessions · 7d"
          value={summary.sessionsDone7d}
          sub={`${summary.sessionsDone30d} in 30 days`}
        />
        <MetricTile
          label="With card · 30d"
          value={summary.withCard30d}
          sub={`${summary.withRatings30d} rated`}
          tone="blue"
        />
        <MetricTile
          label="Missing card · 30d"
          value={summary.missingCard30d}
          sub="Done sessions without a card"
          tone="amber"
        />
        <MetricTile
          label="Emailed · 30d"
          value={summary.cardsEmailed30d}
          sub={`${summary.atEmailLimit} at ${PROGRESS_CARD_EMAIL_MAX_SENDS}-send limit`}
          tone="slate"
        />
      </section>

      {coachesNeedingFollowThrough.length > 0 ? (
        <section className={cn(cardClass, "mt-4 p-5")}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#C2410C]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-[#111827]">
                Coaches needing follow-through
              </h2>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                ≥2 done sessions in 30 days with under 50% progress-card rate
              </p>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-[#F3F4F6]">
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
                    {coach.withCard30d}/{coach.doneSessions30d} cards · last 30 days
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
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-heading font-semibold text-[#111827]">Recent sessions</h2>
            <p className="text-sm text-[#6B7280]">Completed in the last 90 days</p>
          </div>
        </div>

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
          <div className={cn(cardClass, "flex flex-col items-center px-6 py-12 text-center")}>
            <CalendarCheck2 className="h-8 w-8 text-[#9CA3AF]" />
            <p className="font-heading mt-3 font-semibold text-[#111827]">No sessions match</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Try another filter, or check back after coaches complete sessions.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filtered.map((row) => (
                <article key={row.sessionId} className={cn(cardClass, "p-4")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-heading text-sm font-semibold text-[#111827]">
                        {row.playerLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">
                        {row.coachName} · {typeLabel(row.type)}
                        {row.playerCount > 1 ? ` · ${row.playerCount} players` : ""}
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
                  <div className="mt-3">
                    <StatusChips row={row} />
                  </div>
                </article>
              ))}
            </div>

            <div className={cn(cardClass, "hidden overflow-x-auto md:block")}>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Players</th>
                    <th className="px-5 py-3">Coach</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.map((row) => (
                    <tr key={row.sessionId} className="align-top">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <p className="font-medium text-[#111827]">
                          {row.date ? formatDisplayDate(row.date) : "—"}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {row.time}
                          {row.endTime ? `–${row.endTime}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#111827]">{row.playerLabel}</p>
                        {row.playerCount > 1 ? (
                          <p className="text-xs text-[#9CA3AF]">{row.playerCount} players</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-[#374151]">{row.coachName}</td>
                      <td className="px-5 py-3 text-[#6B7280]">{typeLabel(row.type)}</td>
                      <td className="px-5 py-3">
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

      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#9CA3AF]">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" /> Ratings enable progress cards
        </span>
        <span className="inline-flex items-center gap-1">
          <Mail className="h-3.5 w-3.5" /> Email sends are capped at {PROGRESS_CARD_EMAIL_MAX_SENDS}
        </span>
        <span className="inline-flex items-center gap-1">
          <MailWarning className="h-3.5 w-3.5" /> Missing cards = coaching value not delivered
        </span>
      </p>
    </AdminPageShell>
  );
}
