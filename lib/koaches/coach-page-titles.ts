/** Mobile header + desktop page titles derived from pathname */

type CoachPageMeta = {
  title: string;
  back?: { href: string; label: string };
};

const SECTIONS: Array<{ prefix: string; title: string; backHref?: string; backLabel?: string }> = [
  { prefix: "/coach/dashboard", title: "Home" },
  { prefix: "/coach/students", title: "Students", backHref: "/coach/students", backLabel: "Students" },
  { prefix: "/coach/sessions", title: "Schedule", backHref: "/coach/sessions", backLabel: "Schedule" },
  { prefix: "/coach/programs", title: "Programs", backHref: "/coach/programs", backLabel: "Programs" },
  { prefix: "/coach/reports", title: "Reports" },
  { prefix: "/coach/social", title: "Social", backHref: "/coach/dashboard", backLabel: "Home" },
  { prefix: "/coach/profile", title: "Profile", backHref: "/coach/dashboard", backLabel: "Home" },
  { prefix: "/coach/settings/billing", title: "Billing", backHref: "/coach/settings", backLabel: "Settings" },
  { prefix: "/coach/settings/terms", title: "Terms", backHref: "/coach/settings", backLabel: "Settings" },
  { prefix: "/coach/settings/privacy", title: "Privacy", backHref: "/coach/settings", backLabel: "Settings" },
  {
    prefix: "/coach/settings/refund-policy",
    title: "Refund Policy",
    backHref: "/coach/settings",
    backLabel: "Settings",
  },
  { prefix: "/coach/settings", title: "Settings", backHref: "/coach/dashboard", backLabel: "Home" },
  { prefix: "/coach/onboarding", title: "Setup" },
];

function matchSection(pathname: string) {
  if (pathname === "/coach" || pathname === "/coach/") {
    return SECTIONS.find((s) => s.prefix === "/coach/dashboard")!;
  }
  return (
    SECTIONS.find((s) => pathname === s.prefix || pathname.startsWith(`${s.prefix}/`)) ??
    SECTIONS.find((s) => s.prefix === "/coach/dashboard")!
  );
}

export function getCoachPageMeta(pathname: string): CoachPageMeta {
  const section = matchSection(pathname);
  const isDetail = pathname !== section.prefix && pathname.startsWith(`${section.prefix}/`);

  if (isDetail && section.backHref && section.backLabel) {
    return {
      title: section.title,
      back: { href: section.backHref, label: section.backLabel },
    };
  }

  return { title: section.title };
}
