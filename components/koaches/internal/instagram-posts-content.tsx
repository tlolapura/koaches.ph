import type { ReactNode } from "react";
import {
  CalendarDays,
  ClipboardList,
  Package,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { BRAND_NAME, SITE_DOMAIN, SITE_TAGLINE } from "@/lib/koaches/constants";
import {
  BrandMark,
  PhoneMock,
  ShotCrop,
  type BackdropVariant,
} from "@/components/koaches/internal/instagram-posts-brand";

const SITE_LINK = SITE_DOMAIN;

export type IgShots = Record<string, string>;

export type InstagramPost = {
  id: string;
  label: string;
  filename: string;
  caption: string;
  backdrop: BackdropVariant;
  /** Default feed 4:5. Use square for FB community posts. */
  format?: "feed" | "square";
  render: (mascotSrc: string, shots: IgShots) => ReactNode;
};

function SiteLink({ light = false }: { light?: boolean }) {
  return (
    <p className={`text-[28px] font-semibold ${light ? "text-white/90" : "text-[#4F8FF7]"}`}>
      {SITE_LINK}
    </p>
  );
}

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "01-intro",
    label: "01 · Brand intro",
    filename: "pk-01-intro.png",
    backdrop: "mint",
    caption: `Meet ${BRAND_NAME}.

Built for pickleball coaches in the Philippines.
Students, sessions, programs, and progress in one place.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <BrandMark mascotSrc={mascotSrc} size="xl" stacked />
          <h1 className="font-heading mt-16 max-w-[920px] text-[72px] font-bold leading-[1.06] tracking-tight text-[#111827]">
            Built for pickleball coaches in the PH.
          </h1>
          <p className="mt-8 max-w-[760px] text-[36px] leading-snug text-[#4B5563]">
            Students, sessions, programs, and progress. One place.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[28px] font-semibold text-[#16A34A]">{SITE_TAGLINE}</p>
          <SiteLink />
        </div>
      </div>
    ),
  },
  {
    id: "02-chat-chaos",
    label: "02 · Chat chaos",
    filename: "pk-02-chat-chaos.png",
    backdrop: "stark",
    caption: `Sound familiar?

Roster buried in Viber.
GCash screenshots in the gallery.
“What was their score last session?” forgotten.

${BRAND_NAME} helps you keep it clean.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col pl-20 pr-16 pb-16 pt-28">
        <h1 className="font-heading max-w-[880px] text-[78px] font-bold leading-[1.02] tracking-tight text-[#111827]">
          Running your roster
          <br />
          on chat gets messy.
        </h1>
        <ol className="mt-20 space-y-12">
          {[
            "Student list buried in Viber or WhatsApp",
            "GCash and Maya screenshots everywhere",
            "Progress stuck in your notes (or nowhere)",
          ].map((line, i) => (
            <li key={line} className="flex items-baseline gap-7">
              <span className="font-heading w-14 shrink-0 text-[48px] font-bold text-[#4F8FF7]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[38px] leading-snug text-[#374151]">{line}</span>
            </li>
          ))}
        </ol>
        <div className="mt-auto flex justify-end">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
        </div>
      </div>
    ),
  },
  {
    id: "03-pillars",
    label: "03 · What you get",
    filename: "pk-03-what-you-get.png",
    backdrop: "split",
    caption: `What ${BRAND_NAME} gives coaches:

Students. Sessions. Programs. Progress cards.
Plus GCash and Maya billing that fits how you already get paid.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full">
        <div className="flex w-[42%] flex-col justify-between px-12 pb-16 pt-24">
          <BrandMark mascotSrc={mascotSrc} size="md" light />
          <div>
            <p className="font-heading text-[48px] font-bold leading-tight text-white">
              Everything around your court time, organized.
            </p>
            <p className="mt-8 text-[26px] font-semibold text-white/75">{SITE_LINK}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-8 px-14 py-16">
          {[
            { n: "01", title: "Students", sub: "Join link, waiver, and roster" },
            { n: "02", title: "Sessions", sub: "Who’s in, notes, and follow-ups" },
            { n: "03", title: "Programs", sub: "Ready-made templates you can tweak" },
            { n: "04", title: "Progress", sub: "Cards you can send after class" },
          ].map((item) => (
            <div key={item.title} className="border-l-4 border-[#16A34A] pl-7">
              <p className="text-[20px] font-bold tracking-[0.12em] text-[#4F8FF7]">{item.n}</p>
              <p className="font-heading mt-1 text-[42px] font-bold text-[#111827]">{item.title}</p>
              <p className="mt-1 text-[26px] leading-snug text-[#6B7280]">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "04-progress",
    label: "04 · Progress cards",
    filename: "pk-04-progress.png",
    backdrop: "sky",
    caption: `After a session, send a progress card.

Copy the message. Paste into Viber, WhatsApp, Messenger, or SMS.

Your student sees what you worked on.
You look organized without extra work.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="relative flex h-full flex-col px-14 pb-14 pt-20">
        <div className="max-w-[640px]">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
          <h1 className="font-heading mt-10 text-[56px] font-bold leading-[1.08] tracking-tight text-[#111827]">
            Progress cards that go where your students already chat.
          </h1>
        </div>
        <div className="relative mt-auto">
          <div
            className="absolute -right-4 -top-10 rounded-[28px] bg-[#16A34A] px-7 py-4 shadow-lg"
            style={{ transform: "rotate(3deg)" }}
          >
            <p className="text-[26px] font-bold text-white">Copy, then paste</p>
          </div>
          <div className="rounded-[40px] border border-[#D6E4FF] bg-white px-12 py-12 shadow-[0_24px_60px_rgba(79,143,247,0.18)]">
            <p className="text-[40px] leading-relaxed text-[#111827]">
              Hi Leigh! Here&apos;s your progress card from today&apos;s session with Coach Ana:
            </p>
            <div className="mt-10 rounded-[24px] bg-[#EFF6FF] px-8 py-6">
              <p className="text-[30px] font-semibold text-[#4F8FF7]">{SITE_LINK}/progress/…</p>
            </div>
            <p className="mt-8 text-[26px] text-[#9CA3AF]">Viber · WhatsApp · Messenger · SMS</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "05-site-cta",
    label: "05 · Visit the site",
    filename: "pk-05-site.png",
    backdrop: "green",
    caption: `${BRAND_NAME} for pickleball coaches in the Philippines.

Students, programs, progress cards, and billing that fits GCash and Maya.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col items-center px-16 pb-20 pt-28 text-center text-white">
        <BrandMark mascotSrc={mascotSrc} size="xl" light wordmark={false} />
        <p className="font-heading mt-8 text-[64px] font-bold leading-none tracking-tight">
          PickleKoach
        </p>
        <div className="mt-auto max-w-[900px]">
          <h1 className="font-heading text-[78px] font-bold leading-[1.04] tracking-tight">
            Coaches: start at {SITE_LINK}
          </h1>
          <p className="mt-8 text-[36px] leading-snug text-white/85">
            Built for how you already run sessions here in the PH.
          </p>
          <div className="mt-14 inline-flex items-center rounded-full bg-white px-12 py-6">
            <p className="font-heading text-[40px] font-bold text-[#16A34A]">{SITE_LINK}</p>
          </div>
        </div>
        <p className="mt-16 text-[28px] font-semibold text-white/70">{SITE_TAGLINE}</p>
      </div>
    ),
  },
  {
    id: "06-for-coaches",
    label: "06 · For coaches",
    filename: "pk-06-for-coaches.png",
    backdrop: "cream",
    caption: `${BRAND_NAME} is for coaches who already have students.

Not a player marketplace.
Tools so you can run your coaching business cleaner.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-28">
        <BrandMark mascotSrc={mascotSrc} size="md" />
        <div className="mt-auto max-w-[920px]">
          <p className="text-[32px] font-semibold text-[#4F8FF7]">Just so we’re clear</p>
          <h1 className="font-heading mt-6 text-[72px] font-bold leading-[1.05] tracking-tight text-[#111827]">
            Made for coaches,
            <br />
            not a marketplace.
          </h1>
          <p className="mt-10 text-[36px] leading-snug text-[#4B5563]">
            You keep your students. We help you manage the work around the court.
          </p>
        </div>
        <div className="mt-16">
          <SiteLink />
        </div>
      </div>
    ),
  },
  {
    id: "07-presets",
    label: "07 · Program presets",
    filename: "pk-07-presets.png",
    backdrop: "mintBottom",
    caption: `Don’t start your program from a blank page.

${BRAND_NAME} has ready-made program templates:
First Paddle, Open Play Ready, Kitchen Mastery, Tournament Ready, Competitive Doubles.

Pick one. Adjust price and sessions. Teach.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-14 pb-14 pt-20">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <h1 className="font-heading mt-10 text-[58px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Ready-made program templates.
        </h1>
        <p className="mt-4 text-[30px] text-[#4B5563]">Pick a preset. Customize. Go.</p>
        <div className="mt-10 space-y-4">
          {[
            { name: "First Paddle", sub: "Brand new to pickleball" },
            { name: "Open Play Ready", sub: "Join open play with confidence" },
            { name: "Kitchen Mastery", sub: "Own the NVZ" },
            { name: "Tournament Ready", sub: "Compete with confidence" },
            { name: "Competitive Doubles", sub: "Tournament doubles prep" },
          ].map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-[24px] border border-[#E5EFE8] bg-white px-7 py-5 shadow-sm"
            >
              <div>
                <p className="font-heading text-[32px] font-bold text-[#111827]">{p.name}</p>
                <p className="text-[24px] text-[#6B7280]">{p.sub}</p>
              </div>
              <span className="text-[22px] font-bold text-[#16A34A]">Preset</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "08-join",
    label: "08 · Join link",
    filename: "pk-08-join.png",
    backdrop: "sky",
    caption: `Students join your roster with a link or QR.

No “download our app” friction.
Name, details, and waiver in one flow.
Then they’re on your list.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-14 pb-14 pt-20">
        <div className="flex items-start justify-between gap-8">
          <h1 className="font-heading max-w-[620px] text-[60px] font-bold leading-[1.06] tracking-tight text-[#111827]">
            Your join link replaces the spreadsheet signup.
          </h1>
          <BrandMark mascotSrc={mascotSrc} size="sm" wordmark={false} />
        </div>
        <div className="mt-auto grid grid-cols-2 gap-6">
          <div className="rounded-[36px] bg-[#16A34A] px-10 py-12 text-white">
            <p className="text-[26px] font-semibold text-white/80">You share</p>
            <p className="font-heading mt-4 text-[44px] font-bold leading-tight">QR or link</p>
            <p className="mt-6 text-[28px] text-white/85">Viber, Messenger, Stories</p>
          </div>
          <div className="rounded-[36px] border-2 border-[#E5EFE8] bg-white px-10 py-12">
            <p className="text-[26px] font-semibold text-[#6B7280]">They complete</p>
            <p className="font-heading mt-4 text-[44px] font-bold leading-tight text-[#111827]">
              Sign-up + waiver
            </p>
            <p className="mt-6 text-[28px] text-[#6B7280]">Straight onto your roster</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "09-billing",
    label: "09 · GCash and Maya",
    filename: "pk-09-billing.png",
    backdrop: "blueBand",
    caption: `Billing that matches how coaches in the PH get paid.

GCash. Maya. Receipts. Follow-ups.
Track what’s due without digging through chat.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <BrandMark mascotSrc={mascotSrc} size="md" />
        <h1 className="font-heading mt-16 max-w-[900px] text-[68px] font-bold leading-[1.05] tracking-tight text-[#111827]">
          Billing that fits GCash and Maya.
        </h1>
        <p className="mt-8 max-w-[800px] text-[36px] leading-snug text-[#4B5563]">
          Track payments. Keep receipts. Follow up without hunting old chats.
        </p>
        <div className="mt-auto flex items-end justify-between text-white">
          <p className="font-heading text-[40px] font-bold">GCash · Maya · receipts</p>
          <SiteLink light />
        </div>
      </div>
    ),
  },
  {
    id: "10-less-admin",
    label: "10 · Less admin",
    filename: "pk-10-less-admin.png",
    backdrop: "mint",
    caption: `Less chasing.
Less “who’s coming today?”
Less typing the same update twelve times.

More time on court.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col items-center justify-center px-16 text-center">
        <p className="text-[32px] font-semibold text-[#16A34A]">The simple promise</p>
        <h1 className="font-heading mt-8 text-[88px] font-bold leading-[1.02] tracking-tight text-[#111827]">
          Less admin.
          <br />
          More court.
        </h1>
        <div className="mt-16">
          <BrandMark mascotSrc={mascotSrc} size="lg" stacked />
        </div>
        <p className="mt-12 text-[30px] font-semibold text-[#4F8FF7]">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "11-sessions",
    label: "11 · Sessions",
    filename: "pk-11-sessions.png",
    backdrop: "stark",
    caption: `Plan sessions without the notebook scramble.

Who’s in. What’s due. What you worked on.
All tied to your students and programs.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col pl-20 pr-14 pb-16 pt-24">
        <p className="text-[28px] font-semibold uppercase tracking-[0.14em] text-[#4F8FF7]">
          Sessions
        </p>
        <h1 className="font-heading mt-8 text-[70px] font-bold leading-[1.04] tracking-tight text-[#111827]">
          Your schedule shouldn’t live in three apps and a notebook.
        </h1>
        <div className="mt-16 grid gap-5">
          {["Upcoming sessions", "Who’s attending", "Notes for next time"].map((t) => (
            <div key={t} className="flex items-center gap-5 rounded-2xl bg-[#F0FDF4] px-7 py-6">
              <span className="h-4 w-4 rounded-full bg-[#16A34A]" />
              <span className="text-[36px] font-semibold text-[#14532D]">{t}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex justify-end">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
        </div>
      </div>
    ),
  },
  {
    id: "12-skill-rubrics",
    label: "12 · Skill rubrics",
    filename: "pk-12-rubrics.png",
    backdrop: "split",
    caption: `Every program comes with a skill rubric by level.

Beginner. Intermediate. Advanced.
Rate skills after each session so progress is clear.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full">
        <div className="flex w-[42%] flex-col justify-end px-12 pb-16 pt-24">
          <BrandMark mascotSrc={mascotSrc} size="md" light />
          <p className="font-heading mt-auto text-[48px] font-bold leading-tight text-white">
            Skill rubrics built into your programs.
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-center px-12">
          <div className="space-y-8">
            {[
              { title: "Beginner", body: "Fundamentals, serve & return, movement" },
              { title: "Intermediate", body: "Third shot, kitchen, volleys" },
              { title: "Advanced", body: "Full game IQ and competitive skills" },
            ].map((item, i) => (
              <div key={item.title}>
                <p className="font-heading text-[48px] font-bold text-[#16A34A]">
                  {String(i + 1).padStart(2, "0")} {item.title}
                </p>
                <p className="mt-2 text-[28px] text-[#6B7280]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "13-profile",
    label: "13 · Public profile",
    filename: "pk-13-profile.png",
    backdrop: "mint",
    caption: `A clean public coach page.

Rates. How to reach you. What you offer.
Easy to share when someone asks for your coach.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <div className="flex justify-center">
          <BrandMark mascotSrc={mascotSrc} size="lg" stacked />
        </div>
        <div className="mt-auto rounded-[40px] border border-[#E5EFE8] bg-white/90 px-12 py-12 shadow-sm">
          <p className="text-[26px] font-bold uppercase tracking-[0.14em] text-[#4F8FF7]">
            Public coach page
          </p>
          <h1 className="font-heading mt-6 text-[56px] font-bold leading-[1.08] text-[#111827]">
            Your profile, ready to share.
          </h1>
          <p className="mt-6 text-[34px] leading-snug text-[#4B5563]">
            Contact, rates, and programs without building a whole website.
          </p>
        </div>
        <p className="mt-10 text-center text-[28px] font-semibold text-[#4F8FF7]">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "14-open-play",
    label: "14 · Open Play Ready",
    filename: "pk-14-open-play.png",
    backdrop: "cream",
    caption: `Preset highlight: Open Play Ready

4 sessions for players who know the rules but need consistency.
Skill rubric included. Price and sessions editable.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col justify-between px-16 py-24">
        <BrandMark mascotSrc={mascotSrc} size="md" />
        <div>
          <p className="text-[28px] font-semibold text-[#16A34A]">Program preset</p>
          <h1 className="font-heading mt-4 text-[78px] font-bold leading-[1.02] tracking-tight text-[#111827]">
            Open Play Ready
          </h1>
          <p className="mt-8 max-w-[820px] text-[36px] leading-snug text-[#4B5563]">
            Help students join open play with confidence. 4 sessions. Beginner rubric built in.
          </p>
        </div>
        <SiteLink />
      </div>
    ),
  },
  {
    id: "15-ph",
    label: "15 · Made for PH",
    filename: "pk-15-ph.png",
    backdrop: "green",
    caption: `Made with Philippine pickleball coaches in mind.

Viber and Messenger sharing.
GCash and Maya billing.
Court-real workflows.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-20 pt-28 text-white">
        <BrandMark mascotSrc={mascotSrc} size="lg" light />
        <div className="mt-auto">
          <h1 className="font-heading text-[76px] font-bold leading-[1.04] tracking-tight">
            Made for coaches
            <br />
            in the Philippines.
          </h1>
          <p className="mt-10 max-w-[860px] text-[36px] leading-snug text-white/85">
            Chat-first sharing. Local payments. The way sessions actually get booked here.
          </p>
          <p className="mt-14 text-[30px] font-semibold text-white/70">{SITE_LINK}</p>
        </div>
      </div>
    ),
  },
  {
    id: "16-before-after",
    label: "16 · Before / after",
    filename: "pk-16-before-after.png",
    backdrop: "stark",
    caption: `Before: roster in chat, progress in your head, payments in screenshots.

After: students, sessions, program templates, and progress cards in one place.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-14 pb-14 pt-20">
        <div className="mb-10 flex justify-end">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-6">
          <div className="flex flex-col rounded-[32px] border-2 border-[#E5E7EB] bg-[#F9FAFB] px-8 py-10">
            <p className="text-[26px] font-bold uppercase tracking-wide text-[#9CA3AF]">Before</p>
            <ul className="mt-10 space-y-8 text-[30px] leading-snug text-[#6B7280]">
              <li>Chat threads as your CRM</li>
              <li>Forgotten session notes</li>
              <li>“Did they pay already?” guessing</li>
            </ul>
          </div>
          <div className="flex flex-col rounded-[32px] bg-[#16A34A] px-8 py-10 text-white">
            <p className="text-[26px] font-bold uppercase tracking-wide text-white/70">After</p>
            <ul className="mt-10 space-y-8 text-[30px] leading-snug">
              <li>Clear student roster</li>
              <li>Progress you can send</li>
              <li>Billing you can track</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "17-kitchen",
    label: "17 · Kitchen Mastery",
    filename: "pk-17-kitchen.png",
    backdrop: "sky",
    caption: `Preset highlight: Kitchen Mastery

8 sessions on dinking, resets, and kitchen positioning.
Intermediate rubric included.

Great for students who rally well but lose points at the net.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <p className="mt-12 text-[28px] font-semibold text-[#4F8FF7]">Program preset</p>
        <h1 className="font-heading mt-4 text-[78px] font-bold leading-[1.04] tracking-tight text-[#111827]">
          Kitchen Mastery
        </h1>
        <p className="mt-8 text-[36px] leading-snug text-[#4B5563]">
          Own the NVZ. 8 sessions. Skills checklist ready for ratings and progress cards.
        </p>
        <div className="mt-auto flex flex-wrap gap-4">
          {["Dinking", "Resets", "Positioning"].map((t) => (
            <span
              key={t}
              className="rounded-full border-2 border-[#16A34A]/30 bg-[#F0FDF4] px-8 py-4 text-[30px] font-semibold text-[#166534]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "18-remember",
    label: "18 · Students remember",
    filename: "pk-18-remember.png",
    backdrop: "mintBottom",
    caption: `Students forget what you drilled last week.

A progress card doesn’t.

Rate skills. Send the card. Keep the momentum.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-28">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <div className="mt-auto">
          <h1 className="font-heading text-[74px] font-bold leading-[1.04] tracking-tight text-[#111827]">
            Help students remember the work.
          </h1>
          <p className="mt-10 max-w-[860px] text-[38px] leading-snug text-[#4B5563]">
            Send a card after the session. They see growth. You look consistent.
          </p>
          <p className="mt-14 text-[30px] font-semibold text-[#16A34A]">{SITE_LINK}</p>
        </div>
      </div>
    ),
  },
  {
    id: "19-first-paddle",
    label: "19 · First Paddle",
    filename: "pk-19-first-paddle.png",
    backdrop: "blueBand",
    caption: `Preset highlight: First Paddle

Gentle intro for absolute beginners.
Scoring, grip, first rallies. 4 structured sessions.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <BrandMark mascotSrc={mascotSrc} size="md" />
        <p className="mt-16 text-[28px] font-semibold text-[#4F8FF7]">Program preset</p>
        <h1 className="font-heading mt-4 text-[76px] font-bold leading-[1.05] tracking-tight text-[#111827]">
          First Paddle
        </h1>
        <p className="mt-8 text-[36px] leading-snug text-[#4B5563]">
          Brand new to pickleball? Give beginners a clear 4-session path.
        </p>
        <div className="mt-auto text-white">
          <p className="font-heading text-[40px] font-bold">Beginner rubric included</p>
          <p className="mt-2 text-[28px] text-white/85">{SITE_LINK}</p>
        </div>
      </div>
    ),
  },
  {
    id: "20-customize",
    label: "20 · Customize presets",
    filename: "pk-20-customize.png",
    backdrop: "cream",
    caption: `Presets are a starting point, not a cage.

Change the name. Adjust sessions and price.
Rename skills. Or build a fully custom program.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col items-center justify-center px-16 text-center">
        <BrandMark mascotSrc={mascotSrc} size="lg" stacked />
        <h1 className="font-heading mt-16 text-[64px] font-bold leading-[1.08] tracking-tight text-[#111827]">
          Start from a template.
          <br />
          Make it yours.
        </h1>
        <p className="mt-10 text-[34px] text-[#6B7280]">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "21-waiver",
    label: "21 · Sign-up + waiver",
    filename: "pk-21-waiver.png",
    backdrop: "stark",
    caption: `Student sign-up and waiver in one flow.

Less paper. Less “please fill this out again.”
Details land on your roster the first time.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col pl-20 pr-16 pb-16 pt-28">
        <h1 className="font-heading text-[72px] font-bold leading-[1.04] tracking-tight text-[#111827]">
          Sign-up and waiver.
          <br />
          One flow.
        </h1>
        <p className="mt-12 max-w-[820px] text-[38px] leading-snug text-[#4B5563]">
          Students join properly: name, details, agreement. No more chasing forms.
        </p>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-[28px] font-semibold text-[#16A34A]">{SITE_TAGLINE}</p>
          <BrandMark mascotSrc={mascotSrc} size="sm" />
        </div>
      </div>
    ),
  },
  {
    id: "22-tournament",
    label: "22 · Tournament Ready",
    filename: "pk-22-tournament.png",
    backdrop: "mint",
    caption: `Preset highlight: Tournament Ready

12 sessions for players leveling up to compete.
Third shots, dinking, match play under pressure.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <div className="mt-4 rounded-[36px] bg-[#FFF7ED] px-10 py-8">
          <p className="text-[30px] font-semibold text-[#C2410C]">Program preset</p>
        </div>
        <h1 className="font-heading mt-10 text-[72px] font-bold leading-[1.05] tracking-tight text-[#111827]">
          Tournament Ready
        </h1>
        <p className="mt-8 text-[34px] leading-snug text-[#4B5563]">
          Build real game skills and mental readiness. Intermediate rubric included.
        </p>
        <div className="mt-auto flex items-center justify-between">
          <BrandMark mascotSrc={mascotSrc} size="md" />
          <SiteLink />
        </div>
      </div>
    ),
  },
  {
    id: "23-stories",
    label: "23 · Story exports",
    filename: "pk-23-stories.png",
    backdrop: "sky",
    caption: `Need a Story for open slots?

Export schedule graphics for Instagram or Facebook Stories.
No Canva scramble after a long day on court.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-14 pb-14 pt-20">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <h1 className="font-heading mt-12 text-[60px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Story-ready schedule posts in a few taps.
        </h1>
        <div className="mt-auto flex justify-center">
          <div className="w-[340px] rounded-[40px] border-4 border-[#111827] bg-gradient-to-b from-[#ECFDF5] to-[#EFF6FF] px-8 py-12 text-center shadow-xl">
            <p className="text-[22px] font-bold uppercase tracking-wide text-[#4F8FF7]">Today</p>
            <p className="font-heading mt-4 text-[48px] font-bold text-[#14532D]">Open slots</p>
            <div className="mt-8 space-y-3">
              {["9:00", "10:30", "4:00"].map((t) => (
                <div
                  key={t}
                  className="rounded-2xl border-2 border-[#16A34A] bg-white py-3 text-[28px] font-bold text-[#166534]"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "24-clinics",
    label: "24 · Clinics",
    filename: "pk-24-clinics.png",
    backdrop: "cream",
    caption: `Running a group clinic?

Set it up, take enrollments, and keep payments clear.
Same coach portal you use for 1:1 sessions.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col justify-center px-16">
        <BrandMark mascotSrc={mascotSrc} size="md" />
        <h1 className="font-heading mt-14 text-[70px] font-bold leading-[1.05] tracking-tight text-[#111827]">
          Clinics for group sessions, too.
        </h1>
        <p className="mt-10 text-[34px] leading-snug text-[#4B5563]">
          Enrollments and payment tracking without a separate system.
        </p>
        <p className="mt-10 text-[34px] text-[#4F8FF7]">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "25-features",
    label: "25 · Feature stack",
    filename: "pk-25-features.png",
    backdrop: "green",
    caption: `Inside ${BRAND_NAME}:

Roster and join links
Sessions and notes
Program presets and skill rubrics
Progress cards
GCash and Maya billing
Public coach profile
Story exports

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col items-center px-12 pb-16 pt-20 text-center text-white">
        <BrandMark mascotSrc={mascotSrc} size="md" light wordmark={false} />
        <div className="mt-auto w-full max-w-[900px] space-y-4 text-left">
          {[
            "Roster and join links",
            "Sessions and notes",
            "Program presets",
            "Progress cards",
            "GCash and Maya billing",
          ].map((word) => (
            <p key={word} className="font-heading text-[48px] font-bold leading-tight tracking-tight">
              {word}
            </p>
          ))}
        </div>
        <p className="mt-12 text-[30px] font-semibold text-white/80">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "26-doubles",
    label: "26 · Competitive Doubles",
    filename: "pk-26-doubles.png",
    backdrop: "mintBottom",
    caption: `Preset highlight: Competitive Doubles

Advanced rubric with stacking, partner communication, and targeting.
12 sessions for players chasing stronger doubles play.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-28">
        <p className="text-[30px] font-semibold text-[#4F8FF7]">Program preset</p>
        <h1 className="font-heading mt-6 text-[68px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Competitive Doubles
        </h1>
        <p className="mt-10 text-[34px] text-[#4B5563]">
          Tournament doubles prep with an advanced skill checklist ready to rate.
        </p>
        <div className="mt-auto flex items-center justify-between">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
          <SiteLink />
        </div>
      </div>
    ),
  },
  {
    id: "27-no-second-job",
    label: "27 · Coaching is the job",
    filename: "pk-27-job.png",
    backdrop: "stark",
    caption: `Coaching is already a job.

Admin shouldn’t feel like a second one.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col pl-20 pr-16 pb-20 pt-32">
        <h1 className="font-heading text-[80px] font-bold leading-[1.02] tracking-tight text-[#111827]">
          Coaching is the job.
          <br />
          Admin shouldn’t be.
        </h1>
        <div className="mt-auto flex justify-end">
          <BrandMark mascotSrc={mascotSrc} size="md" />
        </div>
      </div>
    ),
  },
  {
    id: "28-roster",
    label: "28 · Roster clarity",
    filename: "pk-28-roster.png",
    backdrop: "split",
    caption: `Know who’s active.
Know who’s new.
Know who needs a follow-up.

Roster clarity for pickleball coaches.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full">
        <div className="flex w-[42%] flex-col justify-between px-11 pb-16 pt-24">
          <BrandMark mascotSrc={mascotSrc} size="sm" light />
          <h1 className="font-heading text-[52px] font-bold leading-tight text-white">
            Your roster, finally readable.
          </h1>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-6 px-12">
          {[
            { label: "Active", tone: "bg-[#F0FDF4] text-[#166534]" },
            { label: "New sign-ups", tone: "bg-[#EFF6FF] text-[#1D4ED8]" },
            { label: "Needs follow-up", tone: "bg-[#FFF7ED] text-[#C2410C]" },
          ].map((row) => (
            <div key={row.label} className={`rounded-[28px] px-8 py-7 ${row.tone}`}>
              <p className="font-heading text-[40px] font-bold">{row.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "29-ratings",
    label: "29 · Skill ratings",
    filename: "pk-29-ratings.png",
    backdrop: "sky",
    caption: `Rate skills after a session on a clear 0 to 5 scale.

Not vibes. Not memory.
Progress that students can see on their card.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-14 pb-14 pt-20">
        <div className="flex items-center justify-between">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
          <SiteLink />
        </div>
        <h1 className="font-heading mt-12 text-[58px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Rate the session. Show the growth.
        </h1>
        <div className="mt-auto space-y-5">
          {[
            { skill: "Third shot drop", score: "4" },
            { skill: "Dink consistency", score: "3" },
            { skill: "Kitchen patience", score: "5" },
          ].map((row) => (
            <div
              key={row.skill}
              className="flex items-center justify-between rounded-[28px] border border-[#E5EFE8] bg-white px-8 py-6 shadow-sm"
            >
              <p className="text-[34px] font-semibold text-[#111827]">{row.skill}</p>
              <p className="font-heading text-[44px] font-bold text-[#16A34A]">{row.score}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "30-how-programs",
    label: "30 · How programs work",
    filename: "pk-30-how-programs.png",
    backdrop: "mint",
    caption: `How programs work in ${BRAND_NAME}:

1. Pick a preset or start custom
2. Skill rubric attaches automatically
3. Run sessions and rate skills
4. Send a progress card when they’re done

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <h1 className="font-heading mt-10 text-[56px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          From template to progress card.
        </h1>
        <ol className="mt-12 space-y-7">
          {[
            "Pick a preset or build custom",
            "Skill rubric comes with it",
            "Rate skills each session",
            "Send the progress card",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-5">
              <span className="font-heading flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-[28px] font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-2 text-[34px] font-semibold text-[#111827]">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: "31-weekend",
    label: "31 · After a packed weekend",
    filename: "pk-31-weekend.png",
    backdrop: "cream",
    caption: `Long weekend of sessions?

Don’t lose the notes in your camera roll.
Capture ratings and send progress before you forget.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-28">
        <h1 className="font-heading text-[70px] font-bold leading-[1.05] tracking-tight text-[#111827]">
          After a packed weekend on court…
        </h1>
        <p className="mt-10 text-[40px] leading-snug text-[#4B5563]">
          …don’t let the feedback disappear in your gallery.
        </p>
        <div className="mt-auto flex items-end justify-between">
          <p className="text-[30px] font-semibold text-[#16A34A]">Save it. Send it.</p>
          <BrandMark mascotSrc={mascotSrc} size="md" />
        </div>
      </div>
    ),
  },
  {
    id: "32-early-bird",
    label: "32 · Founding free",
    filename: "pk-32-early-bird.png",
    backdrop: "blueBand",
    caption: `First 30 coaches are free for life.

Same full features: presets, progress cards, roster, billing tools.
After that, ₱299/month.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <BrandMark mascotSrc={mascotSrc} size="md" />
        <h1 className="font-heading mt-16 text-[70px] font-bold leading-[1.05] tracking-tight text-[#111827]">
          First 30 coaches are free for life.
        </h1>
        <p className="mt-8 text-[34px] leading-snug text-[#4B5563]">
          Full access. After that, ₱299 a month.
        </p>
        <div className="mt-auto text-white">
          <p className="font-heading text-[40px] font-bold">Founding coaches</p>
          <p className="mt-2 text-[28px] text-white/85">{SITE_LINK}</p>
        </div>
      </div>
    ),
  },
  {
    id: "33-tagline",
    label: "33 · Tagline",
    filename: "pk-33-tagline.png",
    backdrop: "green",
    caption: `${SITE_TAGLINE}

${BRAND_NAME}
For pickleball coaches in the Philippines.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col items-center justify-center px-16 text-center text-white">
        <BrandMark mascotSrc={mascotSrc} size="xl" light stacked />
        <p className="font-heading mt-20 text-[88px] font-bold leading-none tracking-tight">
          {SITE_TAGLINE}
        </p>
        <p className="mt-14 text-[32px] font-semibold text-white/75">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "34-checklist",
    label: "34 · What’s included",
    filename: "pk-34-included.png",
    backdrop: "mint",
    caption: `What’s included:

✓ Coach portal
✓ Student join + waiver
✓ Sessions and clinics
✓ Program presets and skill rubrics
✓ Progress cards
✓ GCash and Maya billing
✓ Public profile and Story exports

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-14 pb-14 pt-20">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <h1 className="font-heading mt-10 text-[52px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          What’s included
        </h1>
        <ul className="mt-10 space-y-4">
          {[
            "Coach portal",
            "Student join + waiver",
            "Sessions and clinics",
            "Program presets and rubrics",
            "Progress cards",
            "GCash and Maya billing",
            "Public profile and Stories",
          ].map((item) => (
            <li key={item} className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16A34A] text-[24px] font-bold text-white">
                ✓
              </span>
              <span className="text-[32px] font-semibold text-[#111827]">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-auto text-[28px] font-semibold text-[#4F8FF7]">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "35-close",
    label: "35 · Closing invite",
    filename: "pk-35-close.png",
    backdrop: "mint",
    caption: `If you coach pickleball in the Philippines and want cleaner tools…

${BRAND_NAME} is for you.

${SITE_LINK}`,
    render: (mascotSrc) => (
      <div className="flex h-full flex-col px-16 pb-16 pt-24">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <BrandMark mascotSrc={mascotSrc} size="xl" stacked />
          <h1 className="font-heading mt-14 text-[64px] font-bold leading-[1.06] tracking-tight text-[#111827]">
            If you coach pickleball
            <br />
            in the PH, this is for you.
          </h1>
          <div className="mt-12 inline-flex rounded-full bg-[#16A34A] px-12 py-6">
            <p className="font-heading text-[36px] font-bold text-white">{SITE_LINK}</p>
          </div>
        </div>
        <p className="text-center text-[28px] font-semibold text-[#6B7280]">{SITE_TAGLINE}</p>
      </div>
    ),
  },

  // Screenshot posts: big UI + hook (drop PNGs in public/marketing/ig-screenshots/)
  {
    id: "36-shot-dashboard",
    label: "36 · Stop guessing your day",
    filename: "pk-36-dashboard.png",
    backdrop: "mint",
    caption: `You shouldn’t open five chats just to know what’s happening today.

${BRAND_NAME} puts your day in one place: sessions, follow-ups, and what’s next.

Coaches in the PH: try it at ${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="relative flex h-full flex-col overflow-hidden px-12 pt-14">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <h1 className="font-heading mt-7 max-w-[920px] text-[48px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Stop opening five chats just to know your day.
        </h1>
        <div className="relative mt-8 flex flex-1 justify-center">
          <PhoneMock src={shots.dashboard} size="hero" className="absolute bottom-[-80px]" />
        </div>
      </div>
    ),
  },
  {
    id: "37-shot-students",
    label: "37 · Roster out of Viber",
    filename: "pk-37-students.png",
    backdrop: "sky",
    caption: `If your student list still lives in Viber, you already know the pain.

Missed follow-ups. Forgotten names. “Who was that again?”

Move your roster into ${BRAND_NAME} and coach with a clear list.

${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="flex h-full flex-col px-10 pb-12 pt-14">
        <div className="flex items-center justify-between">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
          <SiteLink />
        </div>
        <h1 className="font-heading mt-7 text-[46px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Your students deserve better than a buried chat thread.
        </h1>
        <div className="mt-8 flex flex-1 items-center justify-center">
          <ShotCrop src={shots.students} width={980} height={820} radius={44} />
        </div>
      </div>
    ),
  },
  {
    id: "38-shot-session",
    label: "38 · After class clarity",
    filename: "pk-38-session.png",
    backdrop: "cream",
    caption: `Class ends. Then the admin starts.

Who showed up? What did you work on? Who still owes?

Run the session in ${BRAND_NAME} so notes and next steps don’t disappear.

${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="relative flex h-full overflow-hidden">
        <div className="relative z-10 flex w-[46%] flex-col justify-between px-12 py-16">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
          <div>
            <h1 className="font-heading text-[46px] font-bold leading-[1.06] tracking-tight text-[#111827]">
              When class ends, the work shouldn’t vanish.
            </h1>
            <p className="mt-6 text-[28px] leading-snug text-[#4B5563]">
              Attendance, notes, and what’s next before you leave the court.
            </p>
            <p className="mt-10 text-[28px] font-semibold text-[#4F8FF7]">{SITE_LINK}</p>
          </div>
        </div>
        <div className="absolute bottom-[-60px] right-[-40px]">
          <PhoneMock src={shots.session} size="xl" style={{ transform: "rotate(6deg)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "39-shot-programs",
    label: "39 · Don’t start blank",
    filename: "pk-39-programs.png",
    backdrop: "mintBottom",
    caption: `Blank program pages kill momentum.

${BRAND_NAME} gives you ready-made paths: First Paddle, Open Play Ready, Kitchen Mastery, Tournament Ready, Competitive Doubles.

Pick one. Adjust. Start teaching.

${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="flex h-full flex-col px-10 pb-10 pt-12">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <h1 className="font-heading mt-6 text-[46px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Don’t build every program from zero.
        </h1>
        <p className="mt-3 text-[28px] text-[#4B5563]">Start from a preset. Make it yours.</p>
        <div className="mt-6 flex flex-1 items-end justify-center overflow-hidden">
          <ShotCrop src={shots.programs} width={1000} height={780} radius={36} objectPosition="top" />
        </div>
      </div>
    ),
  },
  {
    id: "40-shot-progress",
    label: "40 · Proof after every session",
    filename: "pk-40-progress.png",
    backdrop: "sky",
    caption: `Students forget what you drilled by Wednesday.

Send a progress card while it’s fresh.
Copy. Paste into Viber or WhatsApp. Look sharp without extra homework.

Try ${BRAND_NAME}: ${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="relative flex h-full flex-col overflow-hidden px-12 pt-14">
        <div className="relative z-10">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
          <h1 className="font-heading mt-7 max-w-[880px] text-[48px] font-bold leading-[1.06] tracking-tight text-[#111827]">
            Send proof of progress before they forget.
          </h1>
        </div>
        <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2">
          <PhoneMock src={shots["progress-card"]} size="hero" />
        </div>
      </div>
    ),
  },
  {
    id: "41-shot-join",
    label: "41 · Kill the spreadsheet signup",
    filename: "pk-41-join.png",
    backdrop: "green",
    caption: `Still collecting names in a sheet or group chat?

Share one join link or QR.
Students sign up, complete the waiver, and land on your roster.

Coaches: start at ${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="flex h-full flex-col items-center px-10 pb-8 pt-14 text-center text-white">
        <BrandMark mascotSrc={mascotSrc} size="sm" light />
        <h1 className="font-heading mt-6 max-w-[900px] text-[48px] font-bold leading-[1.06] tracking-tight">
          One QR. Full sign-up. No spreadsheet chase.
        </h1>
        <div className="mt-8 flex flex-1 items-end justify-center">
          <PhoneMock src={shots["join-qr"]} size="xl" />
        </div>
      </div>
    ),
  },
  {
    id: "42-shot-billing",
    label: "42 · End the GCash guesswork",
    filename: "pk-42-billing.png",
    backdrop: "blueBand",
    caption: `“Did they pay already?” shouldn’t live in your camera roll.

Track what’s due with billing that fits GCash and Maya.
Receipts and follow-ups in one place.

${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="flex h-full flex-col px-10 pb-8 pt-14">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <h1 className="font-heading mt-6 text-[46px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Stop hunting GCash screenshots to know who paid.
        </h1>
        <div className="mt-8 flex flex-1 items-center justify-center">
          <ShotCrop src={shots.billing} width={960} height={700} radius={40} />
        </div>
        <p className="mt-4 text-center text-[28px] font-semibold text-white">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "43-shot-profile",
    label: "43 · Shareable coach page",
    filename: "pk-43-profile.png",
    backdrop: "mint",
    caption: `When someone asks “who’s your coach?”, what do you send?

A clean public page with rates, contact, and what you offer.
No random Facebook album.

Set yours up on ${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="relative flex h-full overflow-hidden px-12 pt-14">
        <div className="relative z-10 max-w-[480px]">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
          <h1 className="font-heading mt-8 text-[46px] font-bold leading-[1.06] tracking-tight text-[#111827]">
            When they ask for your coach page, send this.
          </h1>
          <p className="mt-6 text-[28px] leading-snug text-[#4B5563]">
            Rates, contact, and programs. Ready to share.
          </p>
          <p className="mt-8 text-[28px] font-semibold text-[#4F8FF7]">{SITE_LINK}</p>
        </div>
        <div className="absolute bottom-[-40px] right-[-20px]">
          <PhoneMock src={shots.profile} size="xl" style={{ transform: "rotate(-5deg)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "44-shot-schedule",
    label: "44 · One calendar",
    filename: "pk-44-schedule.png",
    backdrop: "stark",
    caption: `Notebook + Google Calendar + chat reminders = chaos.

See open slots and booked sessions in one schedule.
Plan the week. Show up ready.

${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="flex h-full flex-col pl-14 pr-10 pb-10 pt-16">
        <div className="flex items-start justify-between gap-6">
          <h1 className="font-heading max-w-[620px] text-[48px] font-bold leading-[1.05] tracking-tight text-[#111827]">
            Your week shouldn’t live in three places.
          </h1>
          <BrandMark mascotSrc={mascotSrc} size="sm" />
        </div>
        <div className="mt-8 flex flex-1 items-end justify-center overflow-hidden">
          <ShotCrop src={shots.schedule} width={1020} height={780} radius={32} objectPosition="top" />
        </div>
        <p className="mt-4 text-[28px] font-semibold text-[#4F8FF7]">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "45-shot-skills",
    label: "45 · Rate with intention",
    filename: "pk-45-skills.png",
    backdrop: "sky",
    caption: `“You’re improving” is nice.
A clear skill rating is better.

Rate after class. Feed the progress card. Show students real growth.

Coaches: try it on ${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="relative flex h-full overflow-hidden px-12 pt-14">
        <div className="relative z-10 max-w-[520px]">
          <BrandMark mascotSrc={mascotSrc} size="sm" />
          <h1 className="font-heading mt-8 text-[46px] font-bold leading-[1.06] tracking-tight text-[#111827]">
            “You’re improving” hits different with a real score.
          </h1>
          <p className="mt-6 text-[28px] text-[#4B5563]">
            Rate skills. Send the card. Keep students coming back.
          </p>
          <p className="mt-8 text-[28px] font-semibold text-[#4F8FF7]">{SITE_LINK}</p>
        </div>
        <div className="absolute bottom-[-120px] right-[-60px]">
          <ShotCrop
            src={shots["skill-rating"]}
            width={640}
            height={980}
            radius={48}
            style={{ transform: "rotate(4deg)" }}
          />
        </div>
      </div>
    ),
  },
  {
    id: "46-shot-clinic",
    label: "46 · Clinics without chaos",
    filename: "pk-46-clinic.png",
    backdrop: "cream",
    caption: `Hosting a clinic this month?

Don’t run enrollments on a random form and payments on hope.
Keep group sessions in the same place as your 1:1 coaching.

${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="flex h-full flex-col px-10 pb-8 pt-12">
        <BrandMark mascotSrc={mascotSrc} size="sm" />
        <h1 className="font-heading mt-6 text-[46px] font-bold leading-[1.06] tracking-tight text-[#111827]">
          Group clinics shouldn’t mean a second admin system.
        </h1>
        <div className="mt-8 flex flex-1 items-end justify-center">
          <PhoneMock src={shots.clinic} size="hero" className="mb-[-60px]" />
        </div>
      </div>
    ),
  },
  {
    id: "47-shot-duo",
    label: "47 · From roster to proof",
    filename: "pk-47-duo.png",
    backdrop: "mint",
    caption: `Know who’s on your list.
Show them how they’re growing.

That’s the weekly loop coaches actually need.

See it on ${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="flex h-full flex-col px-8 pb-10 pt-12">
        <div className="px-4 text-center">
          <BrandMark mascotSrc={mascotSrc} size="sm" className="justify-center" />
          <h1 className="font-heading mt-6 text-[44px] font-bold leading-[1.06] tracking-tight text-[#111827]">
            Know your roster. Prove the progress.
          </h1>
        </div>
        <div className="mt-8 flex flex-1 items-end justify-center gap-4 overflow-hidden pb-2">
          <PhoneMock
            src={shots.students}
            size="lg"
            style={{ transform: "rotate(-7deg) translateY(20px)" }}
          />
          <PhoneMock
            src={shots["progress-card"]}
            size="lg"
            style={{ transform: "rotate(7deg) translateY(20px)" }}
          />
        </div>
        <p className="mt-2 text-center text-[28px] font-semibold text-[#4F8FF7]">{SITE_LINK}</p>
      </div>
    ),
  },
  {
    id: "48-shot-presets-phone",
    label: "48 · Teach sooner",
    filename: "pk-48-presets-phone.png",
    backdrop: "split",
    caption: `Want to offer a structured program this week, not next month?

Open a preset. Adjust price and sessions.
Skill rubric is already attached.

Start at ${SITE_LINK}`,
    render: (mascotSrc, shots) => (
      <div className="relative flex h-full overflow-hidden">
        <div className="relative z-10 flex w-[40%] flex-col justify-between px-10 py-16">
          <BrandMark mascotSrc={mascotSrc} size="sm" light />
          <div>
            <h1 className="font-heading text-[44px] font-bold leading-tight text-white">
              Offer a real program this week, not someday.
            </h1>
            <p className="mt-6 text-[26px] leading-snug text-white/85">
              Presets with skills built in. Customize and go.
            </p>
            <p className="mt-8 text-[26px] font-semibold text-white">{SITE_LINK}</p>
          </div>
        </div>
        <div className="absolute bottom-[-80px] right-[-30px]">
          <PhoneMock src={shots.programs} size="hero" />
        </div>
      </div>
    ),
  },
  {
    id: "49-community-coaches",
    label: "49 · Community · early coaches",
    filename: "pk-49-community-coaches.png",
    format: "square",
    backdrop: "mint",
    caption: `Hi coaches!

We’re looking for pickleball coaches in the Philippines who might want to try a small app we’ve been building.

If this sounds like you, we’d love to hear from you:
• It’s hard to keep your schedule clear when your bookings are spread across chats and Notes
• It’s hard to know how much you’re really earning each month
• It’s hard to offer packages or programs, so you mostly end up doing one-time sessions
• After a session, students don’t really know how they did or what to work on next, so follow-through is tough

PickleKoach is just a tool for coaches. It’s not another page where players browse for coaches. FB groups already help with that.

It can help with your schedule, earnings, programs, progress cards, open-slot Stories, and messaging your students. We’re still adding more.

We haven’t launched publicly yet. We’re hoping a few coaches can try it early and tell us what’s helpful and what’s not.

If you’re open to it, please comment or send us a message. Salamat po!

picklekoach.com`,
    render: (mascotSrc) => {
      const pains: { icon: LucideIcon; text: string }[] = [
        { icon: CalendarDays, text: "Bookings are scattered in chats and Notes, so your schedule feels messy" },
        { icon: Wallet, text: "You’re not sure how much you’re really earning each month" },
        { icon: Package, text: "Packages and programs feel hard, so you stick to one-time sessions" },
        {
          icon: ClipboardList,
          text: "After a session, students don’t know how they did or what to work on next",
        },
      ];

      return (
        <div className="flex h-full flex-col px-11 pb-9 pt-9">
          <div className="flex items-center justify-between">
            <BrandMark mascotSrc={mascotSrc} size="sm" />
            <span className="rounded-full bg-[#16A34A] px-4 py-1.5 text-[20px] font-bold text-white">
              Early try-out
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[22px] font-semibold text-[#4F8FF7]">Hi, coaches</p>
            <h1 className="font-heading mt-3 max-w-[920px] text-[58px] font-bold leading-[1.04] tracking-tight text-[#111827]">
              We’re looking for
              <br />
              pickleball coaches
            </h1>
            <p className="mt-4 max-w-[780px] text-[24px] leading-snug text-[#4B5563]">
              If any of this feels familiar, we’d love your help trying an app for you.
            </p>

            <div className="mt-7 w-full max-w-[860px] space-y-2.5">
              {pains.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3.5 rounded-2xl border border-[#BBF7D0] bg-white px-4 py-3 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF5]">
                    <Icon className="h-6 w-6 text-[#16A34A]" strokeWidth={2.25} />
                  </span>
                  <p className="text-[22px] font-semibold leading-snug text-[#14532D]">{text}</p>
                </div>
              ))}
            </div>

            <p className="mt-7 font-heading text-[36px] font-bold text-[#4F8FF7]">{SITE_LINK}</p>
            <p className="mt-2 max-w-[720px] text-[22px] leading-snug text-[#6B7280]">
              Please comment or message us if you’d like to try. Salamat po.
            </p>
          </div>
        </div>
      );
    },
  },
];
