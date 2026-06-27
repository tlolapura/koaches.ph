import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import type { CoachProfile } from "@/lib/koaches/types";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { coachFirstName } from "@/lib/koaches/person-name";
import { KoachesMark } from "@/components/koaches/KoachesLogo";
import { CoachProfilePhoto } from "@/components/koaches/coach/CoachProfilePhoto";
import { StudentIntakeSection } from "@/components/koaches/public/StudentIntakeSection";

type CoachJoinPageProps = {
  coach: CoachProfile;
};

export function CoachJoinPage({ coach }: CoachJoinPageProps) {
  const firstName = coachFirstName(coach);
  const profilePath = buildPublicCoachPath(coach.slug);

  return (
    <div className="coach-portal min-h-screen bg-[#FAFAF8]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#16A34A] via-[#1a8f48] to-[#4F8FF7] text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#4F8FF7]/25 blur-3xl" aria-hidden />

        <header className="relative mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <Link
            href={profilePath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>
          <KoachesMark size="sm" light />
        </header>

        <div className="relative mx-auto max-w-lg px-4 pb-8 pt-2">
          <div className="flex items-center gap-4">
            <CoachProfilePhoto
              coachId={coach.id}
              name={coach.name}
              defaultPhoto={coach.photo}
              size="lg"
              className="shrink-0 ring-4 ring-white/20"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FDE047]">Join roster</p>
              <h1 className="font-heading mt-1 text-2xl font-bold leading-tight">{coach.name}</h1>
              <p className="mt-1 text-sm text-white/70">
                Already booked with {firstName}? Sign up and complete the waiver below.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-lg px-4 py-6 pb-12">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <UserPlus className="h-5 w-5 text-[#1D4ED8]" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-[#111827]">Roster sign-up</h2>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Coach {firstName} will approve your sign-up before your first session.
            </p>
          </div>
        </div>

        <StudentIntakeSection coach={coach} />
      </main>
    </div>
  );
}
