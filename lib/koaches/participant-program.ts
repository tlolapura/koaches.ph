import type { Session, SessionParticipant, SkillRubricId, Program, Student, CoachProfile, SkillDefinition } from "./types";
import { resolveProgramRubric } from "./program-templates";

export type ParticipantProgramContext = {
  programName: string | null;
  rubricId: SkillRubricId;
  customSkillIds?: string[];
  customSkills?: SkillDefinition[];
  skillLabelOverrides?: Record<string, string>;
  sessionNumber?: number;
  totalSessions?: number;
};

export type ParticipantProgramLookup = {
  students?: Map<string, Student>;
  programs?: Map<string, Program>;
  coach?: Pick<
    CoachProfile,
    "skillTemplateId" | "customSkillIds" | "customSkills" | "skillLabelOverrides"
  >;
};

/** Program + rubric for a player — uses their enrolled program, not the session's */
export function resolveParticipantProgramContext(
  participant: SessionParticipant,
  session: Session,
  lookup?: ParticipantProgramLookup
): ParticipantProgramContext {
  // Drop-in sessions should always use the coach's configured drop-in skills,
  // regardless of any student's enrolled program.
  if (session.type === "drop-in") {
    const coach = lookup?.coach;
    const rubricId = coach?.customSkillIds?.length
      ? "custom"
      : (coach?.skillTemplateId ?? "intermediate");

    return {
      programName: null,
      rubricId,
      customSkillIds: coach?.customSkillIds,
      customSkills: coach?.customSkills,
      skillLabelOverrides: coach?.skillLabelOverrides,
    };
  }

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
      customSkills: program.customSkills,
      skillLabelOverrides: program.skillLabelOverrides,
      sessionNumber:
        session.type === "program" && session.sessionNumber != null
          ? session.sessionNumber
          : undefined,
      totalSessions: program.sessionCount,
    };
  }

  const coach = lookup?.coach;
  const rubricId = coach?.customSkillIds?.length
    ? "custom"
    : (coach?.skillTemplateId ?? "intermediate");

  return {
    programName: null,
    rubricId,
    customSkillIds: coach?.customSkillIds,
    customSkills: coach?.customSkills,
    skillLabelOverrides: coach?.skillLabelOverrides,
  };
}

export function formatParticipantProgramLabel(ctx: ParticipantProgramContext): string {
  return ctx.programName ?? "Drop-in";
}
