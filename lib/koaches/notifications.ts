export type PortalNotificationTone = "green" | "blue" | "amber" | "red";

export type PortalNotification = {
  id: string;
  href: string;
  title: string;
  message: string;
  tone: PortalNotificationTone;
};
