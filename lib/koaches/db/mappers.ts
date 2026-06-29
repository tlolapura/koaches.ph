import type {
  CoachAchievement,
  CoachApplication,
  CoachProfile,
  Court,
  Program,
  ProgressCard,
  Session,
  SkillDefinition,
  Student,
  StudentIntakeSubmission,
} from "../types";
import { joinPersonName, splitPersonName } from "../person-name";
import { DEFAULT_SESSION_PRICING, getStartingRate } from "../pricing";
import { normalizeSkillRatings } from "../session-progress";

export type DbCoach = {
  id: string;
  user_id: string | null;
  slug: string;
  name: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  bio: string;
  specialization: string;
  rate_per_session: number;
  session_pricing: CoachProfile["sessionPricing"];
  court_ids: string[];
  mobile: string | null;
  instagram: string | null;
  facebook: string | null;
  skill_template_id: string;
  coaching_levels: string[];
  custom_skill_ids: string[] | null;
  skill_label_overrides: Record<string, string> | null;
  custom_skills: SkillDefinition[] | null;
  free_trial_enabled: boolean;
  free_trial_weekly_cap: number;
  subscription_plan: string;
  subscription_expiry: string | null;
  is_active: boolean;
  total_students: number;
  total_sessions: number;
  created_at: string;
  onboarding_completed_at: string | null;
};

export type DbProgram = {
  id: string;
  coach_id: string;
  name: string;
  description: string;
  price: number;
  session_count: number;
  rubric_id: string;
  skill_template_id: string | null;
  preset_id: string | null;
  source: string;
  target_level: string;
  custom_skill_ids: string[] | null;
  skill_label_overrides: Record<string, string> | null;
  custom_skills: SkillDefinition[] | null;
  is_active: boolean;
};

export type DbStudent = {
  id: string;
  coach_id: string;
  name: string;
  first_name: string;
  last_name: string;
  mobile: string;
  email: string;
  status: string;
  program_id: string | null;
  sessions_completed: number;
  enrolled_date: string;
  skill_level: string;
  is_archived: boolean;
  notes: string | null;
  waiver_signed_at: string | null;
};

export type DbSession = {
  id: string;
  coach_id: string;
  student_id: string;
  type: string;
  program_id: string | null;
  session_number: number | null;
  date: string | null;
  time: string;
  end_time: string;
  court_id: string;
  status: string;
  payment_status: string;
  price: number;
  player_count: number;
  participants: Session["participants"];
  notes: string | null;
  ratings_before: Session["ratingsBefore"] | null;
  ratings_after: Session["ratingsAfter"] | null;
  participant_progress: Session["participantProgress"] | null;
};

export type DbIntake = {
  id: string;
  coach_id: string;
  name: string;
  mobile: string;
  email: string;
  emergency_contact: string | null;
  skill_level: string;
  notes: string | null;
  waiver_accepted: boolean;
  signed_name: string;
  submitted_at: string;
  status: string;
};

export type DbProgressCard = {
  id: string;
  student_id: string;
  coach_id: string;
  student_name: string;
  coach_name: string;
  program_name: string;
  program_or_session: string;
  date_completed: string;
  ratings_before: ProgressCard["ratingsBefore"];
  ratings_after: ProgressCard["ratingsAfter"];
  coach_message: string;
  session_id: string | null;
};

export type DbApplication = {
  id: string;
  full_name: string;
  mobile: string;
  email: string;
  bio: string;
  specialization: string;
  instagram: string | null;
  facebook: string | null;
  skill_template_id: string;
  coaching_levels: string[];
  session_pricing: CoachProfile["sessionPricing"];
  preferred_slug: string | null;
  current_student_count: number;
  status: string;
  applied_at: string;
};

export type DbCourt = {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  maps_url: string | null;
  is_active: boolean;
};

export type DbAchievement = {
  id: string;
  coach_id: string;
  kind: string;
  title: string;
  organization: string | null;
  year: string | null;
  detail: string | null;
  sort_order: number;
};

export type DbWorkingHours = {
  coach_id: string;
  day_of_week: number;
  enabled: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type DbBlockedSlot = {
  id: string;
  coach_id: string;
  date: string;
  start_time: string;
  end_time: string;
  label: string | null;
};

export function mapCoach(row: DbCoach): CoachProfile {
  const firstName = row.first_name?.trim() || splitPersonName(row.name).firstName;
  const lastName = row.last_name?.trim() ?? splitPersonName(row.name).lastName;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name?.trim() || joinPersonName(firstName, lastName),
    firstName,
    lastName,
    photo: row.photo_url,
    bio: row.bio,
    specialization: row.specialization,
    ratePerSession: row.rate_per_session,
    sessionPricing:
      row.session_pricing && Array.isArray(row.session_pricing.tiers) && row.session_pricing.tiers.length > 0
        ? row.session_pricing
        : DEFAULT_SESSION_PRICING,
    courtIds: row.court_ids ?? [],
    mobile: row.mobile ?? undefined,
    instagram: row.instagram ?? undefined,
    facebook: row.facebook ?? undefined,
    skillTemplateId: row.skill_template_id as CoachProfile["skillTemplateId"],
    customSkillIds: row.custom_skill_ids ?? undefined,
    customSkills: row.custom_skills ?? undefined,
    skillLabelOverrides: row.skill_label_overrides ?? undefined,
    coachingLevels: (row.coaching_levels?.length
      ? row.coaching_levels
      : [row.skill_template_id]
    ).filter((id): id is CoachProfile["coachingLevels"][number] =>
      id === "beginner" || id === "intermediate" || id === "advanced"
    ),
    freeTrialEnabled: row.free_trial_enabled,
    freeTrialWeeklyCap: row.free_trial_weekly_cap,
    subscriptionPlan: row.subscription_plan as CoachProfile["subscriptionPlan"],
    subscriptionExpiry: row.subscription_expiry ?? "",
    isActive: row.is_active,
    totalStudents: row.total_students,
    totalSessions: row.total_sessions,
    createdAt: row.created_at,
    onboardingCompletedAt: row.onboarding_completed_at ?? undefined,
  };
}

export function mapProgram(row: DbProgram, enrolledStudentIds: string[]): Program {
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    description: row.description,
    price: row.price,
    sessionCount: row.session_count,
    rubricId: row.rubric_id as Program["rubricId"],
    skillTemplateId: (row.skill_template_id ?? row.rubric_id) as Program["rubricId"],
    presetId: row.preset_id as Program["presetId"] | undefined,
    source: row.source as Program["source"],
    targetLevel: row.target_level,
    customSkillIds: row.custom_skill_ids ?? undefined,
    customSkills: row.custom_skills ?? undefined,
    skillLabelOverrides: row.skill_label_overrides ?? undefined,
    enrolledStudentIds,
    isActive: row.is_active,
  };
}

export function mapStudent(row: DbStudent): Student {
  const firstName = row.first_name?.trim() || splitPersonName(row.name).firstName;
  const lastName = row.last_name?.trim() ?? splitPersonName(row.name).lastName;
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name?.trim() || joinPersonName(firstName, lastName),
    firstName,
    lastName,
    mobile: row.mobile,
    email: row.email,
    status: row.status as Student["status"],
    programId: row.program_id ?? undefined,
    sessionsCompleted: row.sessions_completed,
    enrolledDate: row.enrolled_date,
    skillLevel: row.skill_level as Student["skillLevel"],
    isArchived: row.is_archived,
    notes: row.notes ?? undefined,
    waiverSignedAt: row.waiver_signed_at ?? undefined,
  };
}

export function mapSession(row: DbSession): Session {
  const participantProgress = row.participant_progress?.map((entry) => ({
    participantId: entry.participantId,
    ratingsBefore: normalizeSkillRatings(entry.ratingsBefore),
    ratingsAfter: normalizeSkillRatings(entry.ratingsAfter),
  }));

  return {
    id: row.id,
    coachId: row.coach_id,
    studentId: row.student_id,
    type: row.type as Session["type"],
    programId: row.program_id ?? undefined,
    sessionNumber: row.session_number ?? undefined,
    date: row.date ?? undefined,
    time: row.time,
    endTime: row.end_time,
    courtId: row.court_id,
    status: row.status as Session["status"],
    paymentStatus: row.payment_status as Session["paymentStatus"],
    price: row.price,
    playerCount: row.player_count,
    participants: row.participants ?? [],
    notes: row.notes ?? undefined,
    ratingsBefore: normalizeSkillRatings(row.ratings_before ?? undefined),
    ratingsAfter: normalizeSkillRatings(row.ratings_after ?? undefined),
    participantProgress: participantProgress?.length ? participantProgress : undefined,
  };
}

export function mapIntake(row: DbIntake): StudentIntakeSubmission {
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    mobile: row.mobile,
    email: row.email,
    emergencyContact: row.emergency_contact ?? undefined,
    skillLevel: row.skill_level as StudentIntakeSubmission["skillLevel"],
    notes: row.notes ?? undefined,
    waiverAccepted: true,
    signedName: row.signed_name,
    submittedAt: row.submitted_at,
    status: row.status as StudentIntakeSubmission["status"],
  };
}

export function mapProgressCard(row: DbProgressCard): ProgressCard {
  return {
    id: row.id,
    studentId: row.student_id,
    coachId: row.coach_id,
    studentName: row.student_name,
    coachName: row.coach_name,
    programName: row.program_name,
    programOrSession: row.program_or_session,
    dateCompleted: row.date_completed,
    ratingsBefore: normalizeSkillRatings(row.ratings_before),
    ratingsAfter: normalizeSkillRatings(row.ratings_after),
    coachMessage: row.coach_message,
    sessionId: row.session_id ?? undefined,
  };
}

export function mapApplication(row: DbApplication): CoachApplication {
  return {
    id: row.id,
    fullName: row.full_name,
    mobile: row.mobile,
    email: row.email,
    bio: row.bio,
    specialization: row.specialization,
    instagram: row.instagram ?? undefined,
    facebook: row.facebook ?? undefined,
    skillTemplateId: row.skill_template_id as CoachApplication["skillTemplateId"],
    coachingLevels: (row.coaching_levels?.length
      ? row.coaching_levels
      : [row.skill_template_id]
    ).filter((id): id is CoachApplication["coachingLevels"][number] =>
      id === "beginner" || id === "intermediate" || id === "advanced"
    ),
    sessionPricing:
      row.session_pricing && Array.isArray(row.session_pricing.tiers) && row.session_pricing.tiers.length > 0
        ? row.session_pricing
        : DEFAULT_SESSION_PRICING,
    preferredSlug: row.preferred_slug ?? undefined,
    currentStudentCount: row.current_student_count,
    status: row.status as CoachApplication["status"],
    appliedAt: row.applied_at,
  };
}

/** Maps a reviewed application into a coaches row — used when approving applicants. */
export function coachInsertFromApplication(
  app: CoachApplication,
  opts: { coachId: string; slug: string; userId?: string | null }
): Omit<DbCoach, "created_at" | "updated_at"> {
  const { firstName, lastName } = splitPersonName(app.fullName);
  return {
    id: opts.coachId,
    user_id: opts.userId ?? null,
    slug: opts.slug,
    name: joinPersonName(firstName, lastName),
    first_name: firstName,
    last_name: lastName,
    photo_url: null,
    bio: app.bio,
    specialization: app.specialization,
    rate_per_session: getStartingRate(app.sessionPricing),
    session_pricing: app.sessionPricing,
    court_ids: [],
    mobile: app.mobile,
    instagram: app.instagram ?? null,
    facebook: app.facebook ?? null,
    skill_template_id: app.skillTemplateId,
    coaching_levels: app.coachingLevels,
    custom_skill_ids: null,
    skill_label_overrides: {},
    custom_skills: [],
    free_trial_enabled: false,
    free_trial_weekly_cap: 0,
    subscription_plan: "early-bird",
    subscription_expiry: null,
    is_active: true,
    total_students: app.currentStudentCount,
    total_sessions: 0,
    onboarding_completed_at: null,
  };
}

export function mapCourt(row: DbCourt): Court {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    region: row.region,
    mapsUrl: row.maps_url ?? undefined,
    isActive: row.is_active,
  };
}

export function mapAchievement(row: DbAchievement): CoachAchievement {
  return {
    id: row.id,
    kind: row.kind as CoachAchievement["kind"],
    title: row.title,
    organization: row.organization ?? undefined,
    year: row.year ?? undefined,
    detail: row.detail ?? undefined,
  };
}

export function programToDb(program: Program): DbProgram {
  return {
    id: program.id,
    coach_id: program.coachId,
    name: program.name,
    description: program.description,
    price: program.price,
    session_count: program.sessionCount,
    rubric_id: program.rubricId,
    skill_template_id: program.skillTemplateId ?? program.rubricId,
    preset_id: program.presetId ?? null,
    source: program.source,
    target_level: program.targetLevel,
    custom_skill_ids: program.customSkillIds ?? null,
    skill_label_overrides: program.skillLabelOverrides ?? {},
    custom_skills: program.customSkills ?? [],
    is_active: program.isActive,
  };
}

export function studentToDb(student: Student): DbStudent {
  const firstName = student.firstName?.trim() || splitPersonName(student.name).firstName;
  const lastName = student.lastName?.trim() ?? splitPersonName(student.name).lastName;
  return {
    id: student.id,
    coach_id: student.coachId,
    name: student.name?.trim() || joinPersonName(firstName, lastName),
    first_name: firstName,
    last_name: lastName,
    mobile: student.mobile,
    email: student.email,
    status: student.status,
    program_id: student.programId ?? null,
    sessions_completed: student.sessionsCompleted,
    enrolled_date: student.enrolledDate,
    skill_level: student.skillLevel,
    is_archived: student.isArchived,
    notes: student.notes ?? null,
    waiver_signed_at: student.waiverSignedAt ?? null,
  };
}

export function sessionToDb(session: Session): DbSession {
  return {
    id: session.id,
    coach_id: session.coachId,
    student_id: session.studentId,
    type: session.type,
    program_id: session.programId ?? null,
    session_number: session.sessionNumber ?? null,
    date: session.date ?? null,
    time: session.time,
    end_time: session.endTime,
    court_id: session.courtId,
    status: session.status,
    payment_status: session.paymentStatus,
    price: session.price,
    player_count: session.playerCount,
    participants: session.participants,
    notes: session.notes ?? null,
    ratings_before: session.ratingsBefore ?? null,
    ratings_after: session.ratingsAfter ?? null,
    participant_progress: session.participantProgress ?? null,
  };
}
