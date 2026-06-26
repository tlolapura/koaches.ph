import type { SessionStatus } from "./types";

export const SESSION_STATUS_OPTIONS: SessionStatus[] = ["upcoming", "done", "canceled"];

export function getSessionStatusLabel(status: SessionStatus): string {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "done":
      return "Done";
    case "canceled":
      return "Canceled";
  }
}

export function isCanceledStatus(status: SessionStatus): boolean {
  return status === "canceled";
}

export function isDoneStatus(status: SessionStatus): boolean {
  return status === "done";
}
