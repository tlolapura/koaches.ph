import type { Session, SessionParticipant, SkillRubricId, Program, Student, CoachProfile } from "./types";
import { resolveProgramRubric } from "./program-templates";

export type ParticipantProgramContext = {
  programName: string | null;
  rubricId: SkillRubricId;
  customSkillIds?: string[];
  sessionNumber?: number;
  totalSessions?: number;
};

export type ParticipantProgramLookup = {
  students?: Map<string, Student>;
  programs?: Map<string, Program>;
  coach?: Pick<CoachProfile, "skillTemplateId">;
};

/** Program + rubric for a player — uses their enrolled program, not the session's */
export function resolveParticipantProgramContext(
  participant: SessionParticipant,
  session: Session,
  lookup?: ParticipantProgramLookup
): ParticipantProgramContext {
  const student = participant.studentId ? lookup?.students?.get(participant.studentId) : undefined;

  const program = student?.programId
    ? lookup?.programs?.get(student.programId)
    : session.type === "program" && session.programId
      ? lookup?.programs?.get(session.programId)
      : undefined;

  if (program) {
    return {
      programName: program.name,
      rubricId: resolveProgramRubric(program),
      customSkillIds: program.customSkillIds,
      sessionNumber:
        session.type === "program" && session.sessionNumber != null
          ? session.sessionNumber
          : undefined,
      totalSessions: program.sessionCount,
    };
  }

  return {
    programName: null,
    rubricId: lookup?.coach?.skillTemplateId ?? "intermediate",
  };
}

export function formatParticipantProgramLabel(ctx: ParticipantProgramContext): string {
  return ctx.programName ?? "Drop-in";
}
