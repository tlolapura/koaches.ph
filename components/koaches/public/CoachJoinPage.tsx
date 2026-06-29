import type { CoachProfile } from "@/lib/koaches/types";
import { StudentIntakeWizard } from "@/components/koaches/public/StudentIntakeWizard";

type CoachJoinPageProps = {
  coach: CoachProfile;
};

export function CoachJoinPage({ coach }: CoachJoinPageProps) {
  return <StudentIntakeWizard coach={coach} />;
}
