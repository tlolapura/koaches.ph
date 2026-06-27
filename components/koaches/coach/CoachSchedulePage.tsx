"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, List } from "lucide-react";
import type { Session } from "@/lib/koaches/types";
import { courtNameFromLookup, useCourts } from "@/hooks/useCourts";
import { formatSessionTimeRange } from "@/lib/koaches/session-time";
import { formatSessionScheduleLabel } from "@/lib/koaches/session-schedule";
import {
  formatSessionParticipantNames,
  getSessionParticipants,
} from "@/lib/koaches/session-participants";
import type { AvailableSlot } from "@/lib/koaches/session-slots";
import { CoachScheduleGrid } from "@/components/koaches/coach/CoachScheduleGrid";
import { AddSessionSheet } from "@/components/koaches/coach/AddSessionSheet";
import {
  EmptyState,
  InitialsAvatar,
  SessionTypeBadge,
  SessionPaymentBadge,
  SessionDisplayStatusBadge,
} from "@/components/koaches/coach/CoachUi";
import { resolveSessionStatus } from "@/lib/koaches/session-lifecycle";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { getSessionStatusLabel } from "@/lib/koaches/session-status";
import { cn, formatCurrency } from "@/lib/utils";
import { useSessionPayment } from "@/hooks/useSessionPayment";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachScheduleSkeleton } from "@/components/koaches/coach/CoachSkeletons";

type ViewMode = "calendar" | "list";
type ListTab = "upcoming" | "done" | "canceled";

const listTabs: ListTab[] = ["upcoming", "done", "canceled"];

function SessionListPaymentBadge({ session }: { session: Session }) {
  const { paymentStatus } = useSessionPayment(session);
  return <SessionPaymentBadge status={paymentStatus} />;
}

function SessionListStatusBadge({ session }: { session: Session }) {
  const { displayStatus } = useSessionStatus(session);
  return <SessionDisplayStatusBadge status={displayStatus} />;
}

function setScheduleParams(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  params: { view?: ViewMode; status?: ListTab; add?: boolean }
) {
  const next = new URLSearchParams();
  const view = params.view ?? "calendar";
  if (view === "list") next.set("view", "list");
  if (view === "list" && params.status && params.status !== "upcoming") {
    next.set("status", params.status);
  }
  if (params.add) next.set("add", "1");
  const qs = next.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

export function CoachSchedulePage() {
  const coachId = usePortalCoachId();
  const { lookup } = useCourts();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const viewMode: ViewMode = searchParams.get("view") === "list" ? "list" : "calendar";
  const listTab: ListTab =
    listTabs.find((t) => t === searchParams.get("status")) ?? "upcoming";

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<{ date: string; startTime: string; endTime: string } | null>(null);

  const { sessions: allSessions, loading } = useCoachSessions(coachId);

  const listSessions = useMemo(() => {
    if (listTab === "upcoming") {
      return allSessions.filter((s) => resolveSessionStatus(s) === "upcoming");
    }
    if (listTab === "done") {
      return allSessions.filter((s) => resolveSessionStatus(s) === "done");
    }
    return allSessions.filter((s) => resolveSessionStatus(s) === "canceled");
  }, [allSessions, listTab]);

  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setSelectedDate(dateParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setAddOpen(true);
      setScheduleParams(router, pathname, { view: viewMode, status: listTab });
    }
  }, [searchParams, router, pathname, viewMode, listTab]);

  const handleSelectDate = (dateKey: string) => setSelectedDate(dateKey);

  const openAddSession = (draft?: { date: string; startTime: string; endTime: string }) => {
    setAddDraft(draft ?? null);
    setAddOpen(true);
  };

  const handleBookSlot = (date: string, slot: AvailableSlot) => {
    setSelectedDate(date);
    openAddSession({ date, startTime: slot.startValue, endTime: slot.endValue });
  };

  if (!coachId) return <CoachScheduleSkeleton />;

  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Schedule"
        subtitle="Calendar and session list"
        actions={
          <div className="flex w-full flex-1 gap-1 rounded-xl bg-[#F3F4F6] p-1 md:max-w-xs md:justify-end">
            {(
              [
                { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
                { id: "list" as const, label: "List", icon: List },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setScheduleParams(router, pathname, { view: id, status: listTab })}
                className={cn(
                  "font-heading flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all min-h-[40px]",
                  viewMode === id ? "bg-[#16A34A] text-white shadow-sm" : "text-[#6B7280]"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
                {label}
              </button>
            ))}
          </div>
        }
      />

      {viewMode === "calendar" ? (
        <div className="mt-6">
          {allSessions.length === 0 && (
            <div className="mb-4">
            <EmptyState
              icon={CalendarDays}
              title="No sessions scheduled"
              description="Book your first session to fill your calendar."
              action={
                <button type="button" onClick={() => openAddSession()} className="coach-btn-primary max-w-xs">
                  Book a session
                </button>
              }
            />
            </div>
          )}
          <CoachScheduleGrid
            date={selectedDate}
            sessions={allSessions}
            onDateChange={handleSelectDate}
            onBookSlot={handleBookSlot}
          />
        </div>
      ) : (
        <>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {listTabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setScheduleParams(router, pathname, { view: "list", status: t })}
                className={cn(
                  "font-heading shrink-0 rounded-full px-4 py-2 text-sm font-semibold min-h-[44px]",
                  listTab === t
                    ? "bg-[#16A34A] text-white"
                    : "bg-white text-[#6B7280] border border-[#E5E7EB]"
                )}
              >
                {getSessionStatusLabel(t)}
              </button>
            ))}
          </div>

          {listSessions.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No sessions here yet"
              action={
                <button
                  type="button"
                  onClick={() => openAddSession()}
                  className="coach-btn-primary max-w-xs"
                >
                  Add session
                </button>
              }
            />
          ) : (
            <div className="mt-6 space-y-3">
              {listSessions.map((s) => {
                const label = formatSessionParticipantNames(s);
                const primary = getSessionParticipants(s)[0];
                return (
                  <Link key={s.id} href={`/coach/sessions/${s.id}`} className="coach-card block p-4">
                    <div className="flex items-start gap-3">
                      <InitialsAvatar name={primary?.name ?? "?"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-heading font-semibold">{label}</p>
                          <span className="shrink-0 text-sm font-semibold text-[#14532D]">
                            {formatCurrency(s.price)}
                          </span>
                        </div>
                        <p className="text-sm text-[#6B7280]">
                          {formatSessionScheduleLabel(s)}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {courtNameFromLookup(lookup, s.courtId)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <SessionTypeBadge type={s.type} />
                          <SessionListStatusBadge session={s} />
                          <SessionListPaymentBadge session={s} />
                          {s.playerCount > 1 && (
                            <span className="rounded-full bg-[#E5EFE8] px-2 py-0.5 text-[10px] font-semibold text-[#3D5C47]">
                              {s.playerCount} players
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      <AddSessionSheet
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAddDraft(null);
        }}
        initialDate={addDraft?.date ?? selectedDate}
        initialStartTime={addDraft?.startTime}
        initialEndTime={addDraft?.endTime}
      />
    </CoachPageShell>
  );
}
