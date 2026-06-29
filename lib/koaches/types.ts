export type SkillCategory =
  | "fundamentals"
  | "serve-return"
  | "third-shot"
  | "kitchen"
  | "volleys"
  | "movement"
  | "game-iq"
  | "mental";

export type DuprLevel = "2.0" | "2.5" | "3.0" | "3.5" | "4.0" | "4.5+";

/** Base skill rubric — the Google Form-style questionnaire coaches rate students on */
export type SkillRubricId = "beginner" | "intermediate" | "advanced" | "custom";

/** @deprecated Use SkillRubricId */
export type SkillTemplateId = SkillRubricId | "all-around";

export type ProgramPresetId =
  | "open-play-ready"
  | "tournament-ready"
  | "first-paddle"
  | "kitchen-mastery"
  | "competitive-doubles";

export type PresetIconId = "users" | "target" | "trophy" | "kitchen" | "zap";

export type ProgramSource = "preset" | "rubric" | "custom";

export type SkillRating = {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  score: number;
  /** Skill was not worked on in this session — excluded from progress cards and summaries */
  skipped?: boolean;
};

export type SkillDefinition = {
  id: string;
  name: string;
  category: SkillCategory;
};

export type SkillRubric = {
  id: SkillRubricId;
  name: string;
  subtitle: string;
  description: string;
  duprRange: string;
  categories: SkillCategory[];
};

export type ProgramPreset = {
  id: ProgramPresetId;
  name: string;
  description: string;
  tagline: string;
  icon: PresetIconId;
  rubricId: SkillRubricId;
  sessionCount: number;
  price: number;
  targetLevel: string;
};

/** @deprecated Use SkillRubric */
export type SkillTemplate = {
  id: SkillRubricId;
  name: string;
  categories: SkillCategory[];
};

export type Court = {
  id: string;
  name: string;
  address: string;
  city?: string;
  region?: string;
  mapsUrl?: string;
  isActive?: boolean;
};

export type PlatformOwner = {
  name: string;
  email: string;
  role: string;
};

export type Program = {
  id: string;
  coachId: string;
  name: string;
  description: string;
  /** Bundle price per person for the full program */
  price: number;
  sessionCount: number;
  /** Base rubric used for skill ratings in this program */
  rubricId: SkillRubricId;
  /** @deprecated Use rubricId */
  skillTemplateId?: SkillRubricId;
  /** If created from a Koaches preset (Open Play Ready, etc.) */
  presetId?: ProgramPresetId;
  source: ProgramSource;
  targetLevel: string;
  enrolledStudentIds: string[];
  isActive: boolean;
  /** Custom rubric: coach-selected skill IDs (only when rubricId is custom) */
  customSkillIds?: string[];
  /** Coach-defined skills outside the default catalog */
  customSkills?: SkillDefinition[];
  /** Display names keyed by skill ID — only stored when different from defaults */
  skillLabelOverrides?: Record<string, string>;
};

/** Drop-in rate for a group size band (e.g. 1 player, 2 players, 3–4 players) */
export type SessionRateTier = {
  id: string;
  minPlayers: number;
  maxPlayers: number;
  /** Total drop-in price for this group size */
  rate: number;
};

export type CoachSessionPricing = {
  /** Minimum players required to book a drop-in */
  minimumPlayers: number;
  /** Maximum players accepted per drop-in */
  maximumPlayers: number;
  /** Default length when scheduling a new drop-in */
  defaultDurationMinutes: number;
  tiers: SessionRateTier[];
};

export type PromoCode = {
  id: string;
  coachId: string;
  code: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
};

export type CoachProfile = {
  id: string;
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  bio: string;
  specialization: string;
  /** Lowest drop-in tier — quick display; see sessionPricing for full breakdown */
  ratePerSession: number;
  /** Drop-in rates by group size */
  sessionPricing: CoachSessionPricing;
  /** Platform courts this coach teaches at (managed in admin) */
  courtIds: string[];
  /** Public contact */
  mobile?: string;
  instagram?: string;
  facebook?: string;
  skillTemplateId: SkillRubricId;
  /** Drop-in / custom rubric: coach-selected skill IDs (when set, overrides template categories) */
  customSkillIds?: string[];
  /** Coach-defined skills outside the default catalog */
  customSkills?: SkillDefinition[];
  /** Display names keyed by skill ID — only stored when different from defaults */
  skillLabelOverrides?: Record<string, string>;
  /** Player levels this coach works with */
  coachingLevels: Array<Exclude<SkillRubricId, "custom">>;
  freeTrialEnabled: boolean;
  freeTrialWeeklyCap: number;
  subscriptionPlan: "early-bird" | "regular";
  subscriptionExpiry: string;
  isActive: boolean;
  totalStudents: number;
  totalSessions: number;
  createdAt: string;
  onboardingCompletedAt?: string;
};

export type CoachInvoiceStatus = "issued" | "payment_submitted" | "paid" | "overdue" | "void";

export type CoachSubscriptionInvoice = {
  id: string;
  coachId: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  plan: CoachProfile["subscriptionPlan"];
  status: CoachInvoiceStatus;
  issuedAt: string;
  paidAt?: string;
};

export type CoachPaymentMethod = "gcash" | "bank_transfer";

export type CoachPaymentSubmissionStatus = "pending" | "approved" | "rejected";

export type CoachPaymentSubmission = {
  id: string;
  coachId: string;
  invoiceId: string;
  amount: number;
  method: CoachPaymentMethod;
  receiptPath: string;
  receiptFileName: string;
  notes?: string;
  status: CoachPaymentSubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
};

import type { SubscriptionBillingInfo } from "@/lib/koaches/subscription-billing";

export type CoachBillingDashboard = {
  billing: SubscriptionBillingInfo;
  currentInvoice: CoachSubscriptionInvoice | null;
  pendingSubmission: CoachPaymentSubmission | null;
  invoiceHistory: CoachSubscriptionInvoice[];
  submissionHistory: CoachPaymentSubmission[];
};

/** Coach profile with court details for public directory listings */
export type CoachListing = CoachProfile & {
  courts: Court[];
};

export type CoachAchievementKind =
  | "competition"
  | "tournament"
  | "league"
  | "certification"
  | "education";

export type CoachAchievement = {
  id: string;
  kind: CoachAchievementKind;
  title: string;
  organization?: string;
  year?: string;
  detail?: string;
};

export type StudentStatus = "active" | "archived";

export type Student = {
  id: string;
  coachId: string;
  name: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  status: StudentStatus;
  programId?: string;
  sessionsCompleted: number;
  enrolledDate: string;
  skillLevel: DuprLevel;
  isArchived: boolean;
  notes?: string;
  /** ISO date when student signed intake waiver */
  waiverSignedAt?: string;
};

/** Self-registration submitted via coach intake link (demo: localStorage) */
export type StudentIntakeSubmission = {
  id: string;
  coachId: string;
  name: string;
  mobile: string;
  email: string;
  emergencyContact?: string;
  skillLevel: DuprLevel;
  notes?: string;
  waiverAccepted: true;
  signedName: string;
  submittedAt: string;
  status: "pending" | "approved";
};

export type BookingStatus = "pending" | "confirmed" | "past" | "cancelled";

export type Booking = {
  id: string;
  coachId: string;
  studentName: string;
  studentMobile: string;
  studentEmail: string;
  type: "drop-in" | "program" | "free-trial";
  programId?: string;
  preferredDate?: string;
  preferredTime?: string;
  courtId: string;
  promoCode?: string;
  status: BookingStatus;
  createdAt: string;
};

export type SessionStatus = "upcoming" | "done" | "canceled";

export type SessionPaymentStatus = "paid" | "unpaid";

/** Someone in a session — linked to a student on the coach roster */
export type SessionParticipant = {
  id: string;
  name: string;
  /** Set when picked from the coach's student roster */
  studentId?: string;
};

/** Per-player skill ratings within a session */
export type SessionParticipantProgress = {
  participantId: string;
  ratingsBefore?: SkillRating[];
  ratingsAfter?: SkillRating[];
};

export type Session = {
  id: string;
  coachId: string;
  /** Primary roster student (first participant when linked) */
  studentId: string;
  type: "drop-in" | "program";
  programId?: string;
  sessionNumber?: number;
  /** Omitted when the session is booked but not yet placed on the calendar */
  date?: string;
  /** Start time (display format, e.g. "8:00 AM") */
  time: string;
  endTime: string;
  courtId: string;
  status: SessionStatus;
  paymentStatus: SessionPaymentStatus;
  /** Amount charged for this session (for revenue tracking) */
  price: number;
  /** Optional tip on top of session price (PHP, whole pesos) */
  tip?: number;
  /** Group size billed for this session */
  playerCount: number;
  /** All players in this session — each can get their own progress report */
  participants: SessionParticipant[];
  notes?: string;
  /** Single-player sessions — use participantProgress when multiple players */
  ratingsBefore?: SkillRating[];
  ratingsAfter?: SkillRating[];
  /** Per-player ratings for group sessions */
  participantProgress?: SessionParticipantProgress[];
};

export type ProgressCard = {
  id: string;
  studentId: string;
  coachId: string;
  studentName: string;
  coachName: string;
  programName: string;
  programOrSession: string;
  dateCompleted: string;
  ratingsBefore: SkillRating[];
  ratingsAfter: SkillRating[];
  coachMessage: string;
  /** Source session when generated from the coach portal */
  sessionId?: string;
};

export type Certificate = {
  id: string;
  studentId: string;
  coachId: string;
  studentName: string;
  coachName: string;
  programName: string;
  dateCompleted: string;
};

export type CoachApplication = {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  bio: string;
  specialization: string;
  instagram?: string;
  facebook?: string;
  skillTemplateId: SkillRubricId;
  coachingLevels: Array<Exclude<SkillRubricId, "custom">>;
  sessionPricing: CoachSessionPricing;
  preferredSlug?: string;
  currentStudentCount: number;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
};

export type PlatformStats = {
  totalCoaches: number;
  activeCoaches: number;
  pendingCoaches: number;
  totalStudents: number;
  totalSessions: number;
  programsInProgress: number;
  progressCardsGenerated: number;
  certificatesGenerated: number;
  earlyBirdSlotsUsed: number;
  earlyBirdSlotsTotal: number;
};

export type ActivityItem = {
  id: string;
  coachId: string;
  text: string;
  timeAgo: string;
};
