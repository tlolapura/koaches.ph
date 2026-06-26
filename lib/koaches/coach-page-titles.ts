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
  { prefix: "/coach/social", title: "Social", backHref: "/coach/more", backLabel: "More" },
  { prefix: "/coach/progress", title: "Progress cards", backHref: "/coach/more", backLabel: "More" },
  { prefix: "/coach/profile", title: "Profile", backHref: "/coach/more", backLabel: "More" },
  { prefix: "/coach/billing", title: "Billing", backHref: "/coach/more", backLabel: "More" },
  { prefix: "/coach/more", title: "More" },
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
