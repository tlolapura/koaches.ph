import type { Session, SessionPaymentStatus } from "./types";
import { isDoneStatus } from "./session-status";

export const PAYMENT_STATUS_OPTIONS: SessionPaymentStatus[] = ["paid", "unpaid"];

export function getPaymentStatusLabel(status: SessionPaymentStatus): string {
  return status === "paid" ? "Paid" : "Unpaid";
}

export function getPaymentStatusHint(status: SessionPaymentStatus): string {
  return status === "paid"
    ? "Payment collected."
    : "Not yet collected — mark paid once you receive it.";
}

export function resolveSessionPaymentStatus(
  session: Pick<Session, "paymentStatus">
): SessionPaymentStatus {
  return session.paymentStatus;
}

/** Done sessions with payment collected — counts toward revenue */
export function isCollectedSession(
  session: Session,
  paymentStatus: SessionPaymentStatus = resolveSessionPaymentStatus(session)
): boolean {
  return isDoneStatus(session.status) && paymentStatus === "paid";
}

export function sessionTipAmount(session: Pick<Session, "tip">): number {
  const tip = session.tip ?? 0;
  return tip > 0 ? tip : 0;
}

/** Session fee + optional tip — total cash collected when paid */
export function sessionCollectedAmount(session: Pick<Session, "price" | "tip">): number {
  return session.price + sessionTipAmount(session);
}
