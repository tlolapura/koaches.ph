import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { BRAND_NAME, SITE_DOMAIN } from "@/lib/koaches/constants";

export const PROPOSAL_LIVE_URL = "picklekoach.vercel.app";

export const BUILT_FEATURES = [
  {
    label: "First",
    text: "A coach portal: dashboard, students, schedule, programs, billing. The stuff that replaces the notebook.",
  },
  {
    label: "Then",
    text: "Programs with real structure. Session bundles, skill rubrics by level. Not a generic book-a-slot calendar.",
  },
  {
    label: "Then",
    text: "Progress after sessions. Rate skills 1 to 5, generate a progress card students can share when they finish a program.",
  },
  {
    label: "Then",
    text: "Social exports. Story images for availability, QR for your profile. Marketing without a second job after a long day on court.",
  },
  {
    label: "Later",
    text: "Public coach directory and booking. Only if coaches and players ask for it. The core comes first.",
  },
] as const;

export const SUBSCRIPTION_MONTHLY_PHP = 499;
export const COACHES_FOR_1M_MRR = 2000;

export function LetterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function BuiltFeaturesList() {
  return (
    <ol className="mt-8 space-y-5 border-t border-[#E5E7EB] pt-8">
      {BUILT_FEATURES.map((item, i) => (
        <li key={`${item.label}-${i}`} className="flex gap-4">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#16A34A]">
            {item.label}
          </span>
          <span className="text-base leading-relaxed text-[#6B7280]">{item.text}</span>
        </li>
      ))}
    </ol>
  );
}

export function ProposalOnTheNameSection() {
  return (
    <LetterSection title="On the name">
      <p>
        I initially thought of KoachesPH with the domain koaches.ph. That's where I first saw the
        problem up close, and where I've watched the community grow.
      </p>
      <p>
        But I'm hopeful this could reach coaches beyond the Philippines someday. So I rebranded to{" "}
        <strong className="text-[#111827]">{BRAND_NAME}</strong> ({SITE_DOMAIN}).
      </p>
      <p>
        I've secured <strong className="text-[#111827]">@picklekoach</strong> on Facebook and
        Instagram for when we're ready to show up publicly. The live demo for now is at{" "}
        <strong className="text-[#111827]">{PROPOSAL_LIVE_URL}</strong>. Once we have a go signal to
        push this out, I'll buy the {SITE_DOMAIN} domain.
      </p>
      <p>
        If a different name sparks something better for you, I'm very open to that. The mission stays
        the same either way: get the coach core right first. Public listing and booking can come
        later, if there's demand.
      </p>
    </LetterSection>
  );
}

export const PROPOSAL_DEMO_PASSWORD = "password";

export function ProposalNextStepsSection({
  closingParagraphs,
  demoEmail = "sample@picklekoach.com",
}: {
  closingParagraphs: React.ReactNode;
  demoEmail?: string;
}) {
  return (
    <LetterSection title="Next step">
      <p className="font-medium text-[#111827]">If you have time, I'd love for you to take a look.</p>
      <p>
        Everything I've described is built enough to click through on your own. No screen share needed
        unless you'd prefer that.
      </p>
      <ul className="mt-2 space-y-3 text-base">
        <li>
          <a
            href={`https://${PROPOSAL_LIVE_URL}`}
            className="font-medium text-[#16A34A] underline underline-offset-2 hover:text-[#15803D]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {PROPOSAL_LIVE_URL}
          </a>{" "}
          to see the site
        </li>
        <li>
          <a
            href={`https://${PROPOSAL_LIVE_URL}/apply`}
            className="font-medium text-[#16A34A] underline underline-offset-2 hover:text-[#15803D]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {PROPOSAL_LIVE_URL}/apply
          </a>{" "}
          to walk through the coach application flow
        </li>
        <li>
          Or sign in to the coach portal at{" "}
          <a
            href={`https://${PROPOSAL_LIVE_URL}/coach/login`}
            className="font-medium text-[#16A34A] underline underline-offset-2 hover:text-[#15803D]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {PROPOSAL_LIVE_URL}/coach/login
          </a>
        </li>
      </ul>
      <p className="mt-4 text-base text-[#6B7280]">
        The demo is live at {PROPOSAL_LIVE_URL} for now. Once we're ready to launch, I'll move it to{" "}
        {SITE_DOMAIN}.
      </p>
      <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-4 text-base sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">Demo login</p>
        <p className="mt-2 text-[#111827]">
          Email: <span className="font-mono text-sm">{demoEmail}</span>
        </p>
        <p className="text-[#111827]">
          Password: <span className="font-mono text-sm">{PROPOSAL_DEMO_PASSWORD}</span>
        </p>
      </div>
      {closingParagraphs}
    </LetterSection>
  );
}

export function ProposalSignature() {
  return (
    <div className="border-t border-[#E5E7EB] pt-10">
      <p className="text-[#374151]">With gratitude,</p>
      <p className="font-heading mt-4 text-lg font-semibold text-[#111827]">Leigh</p>
      <p className="mt-1 text-sm text-[#6B7280]">
        Tech · {BRAND_NAME}
        <br />
        {PROPOSAL_LIVE_URL}
      </p>

      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Reach me</p>
        <ul className="mt-3 space-y-2.5 text-sm">
          <li>
            <span className="text-[#6B7280]">Instagram · </span>
            <a
              href="https://instagram.com/leighlaang"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#4F8FF7] hover:underline"
            >
              @leighlaang
            </a>
          </li>
          <li>
            <span className="text-[#6B7280]">Facebook · </span>
            <a
              href="https://www.facebook.com/leighlaang"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#4F8FF7] hover:underline"
            >
              facebook.com/leighlaang
            </a>
          </li>
          <li>
            <span className="text-[#6B7280]">Email · </span>
            <a href="mailto:tlolapura@gmail.com" className="font-medium text-[#4F8FF7] hover:underline">
              tlolapura@gmail.com
            </a>
          </li>
          <li>
            <span className="text-[#6B7280]">Mobile · </span>
            <a href="tel:+639688546190" className="font-medium text-[#4F8FF7] hover:underline">
              0968 854 6190
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function ProposalPageShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#FAFAF8] text-[#111827]">
      <div className="h-1 bg-[#16A34A]" aria-hidden />
      <div className="mx-auto max-w-xl px-6 py-14 pb-20 sm:px-8 sm:py-16">
        <KoachesWordmark size="sm" />
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-[#9CA3AF]">
          {subtitle}
        </p>
        <article className="mt-8 space-y-12 text-[17px] leading-[1.75] text-[#374151]">
          {children}
        </article>
        <p className="mt-12 text-center text-[11px] text-[#9CA3AF]">
          Private · not indexed · share only with people you trust
        </p>
      </div>
    </div>
  );
}