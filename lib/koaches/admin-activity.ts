import type { Session } from "@/lib/koaches/types";

export type AdminSessionActivityRow = {
  sessionId: string;
  date: string;
  time: string;
  endTime: string;
  type: Session["type"];
  coachId: string;
  coachName: string;
  playerLabel: string;
  playerCount: number;
  hasRatings: boolean;
  progressCardId: string | null;
  emailSendCount: number;
  atEmailLimit: boolean;
};

export type AdminCoachFollowThrough = {
  coachId: string;
  coachName: string;
  doneSessions30d: number;
  withCard30d: number;
  /** 0–100 */
  cardRate: number;
};

export type AdminActivityData = {
  generatedAt: string;
  summary: {
    sessionsDone7d: number;
    sessionsDone30d: number;
    withRatings30d: number;
    withCard30d: number;
    cardsEmailed30d: number;
    missingCard30d: number;
    atEmailLimit: number;
  };
  sessions: AdminSessionActivityRow[];
  coachesNeedingFollowThrough: AdminCoachFollowThrough[];
};
