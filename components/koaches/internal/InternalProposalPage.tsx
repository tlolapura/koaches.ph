import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { BRAND_NAME, SITE_DOMAIN } from "@/lib/koaches/constants";

const PROPOSAL_LIVE_URL = "picklekoach.vercel.app";

const BUILT_FEATURES = [
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

const SUBSCRIPTION_MONTHLY_PHP = 499;
const COACHES_FOR_1M_MRR = 2000;

export function InternalProposalPage() {
  return (
    <div className="min-h-dvh bg-[#FAFAF8] text-[#111827]">
      <div className="h-1 bg-[#16A34A]" aria-hidden />
      <div className="mx-auto max-w-xl px-6 py-14 pb-20 sm:px-8 sm:py-16">
        <KoachesWordmark size="sm" />

        <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-[#9CA3AF]">
          A personal letter · {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
        </p>

        <article className="mt-8 space-y-12 text-[17px] leading-[1.75] text-[#374151]">
          <div className="space-y-5">
            <p>
              I hope it's okay that I'm reaching out this way. I'm not sure a web page is the right
              format for this, honestly. I've never written anything like a co-founder proposal
              before.
            </p>
            <p>
              I'm writing this to you personally. You came to mind, and I'm reaching out one person
              at a time. This isn't something I'm copying and sending around.
            </p>
            <p>
              I'm a developer who plays pickleball, probably watches too much pickleball on YouTube,
              and started building an app because I couldn't stop thinking about a problem I kept
              seeing up close.
            </p>
          </div>

          <LetterSection title="Where it started">
            <p>
              A friend of mine is a coach. Freelance, not in-house at one club. She's at different
              courts all week, different students, different schedules. There's no one place to see
              everything. Just a notebook, handwritten schedules, GCash confirmations screenshot and
              filed in a chat. Names, session notes, skill notes. All in a list on her phone.
            </p>
            <p>
              Her students love her. They improve. They trust her. But I'd watch her scroll through
              that list before every session and think: she is too good at coaching to be doing this
              much admin. There has to be a better way.
            </p>
            <p>So I started building one.</p>
          </LetterSection>

          <LetterSection title="What I built">
            <p>
              I built this in about a week. I build fast, and I'm proud of what's already there. The
              portal, the programs, the progress cards. Most of what you're reading about, you can
              actually click through today.
            </p>
            <p>
              What I know I'm not great at is running the business side of this. I'm a developer. I
              can write code and fix things at midnight. But who to go after first, how to price it,
              how to grow it, what the pitch to a coach should sound like, when to launch and when to
              wait. Those are the decisions I need help with.
            </p>
            <p>That's really why I'm writing to you.</p>

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
          </LetterSection>

          <LetterSection title="What I'm looking for">
            <p className="font-medium text-[#111827]">
              Someone to run this with me. A CEO, if that title makes sense. The main brain on how to
              grow it.
            </p>
            <p>
              I'd love to find someone who genuinely wants to build this alongside me. Vision,
              strategy, which coaches to bring on first, how we talk to the community, what we
              launch and what we wait on. The parts that aren't code.
            </p>
            <p>
              In my head, this should feel like a coach's company with a developer behind it. Someone
              running it who understands coaching, understands the community, and knows how to move
              in that world.
            </p>
            <p>
              I'm hoping for a co-founder, if that's something you'd ever be open to. Equity, real
              involvement, your name on it because you believed in it. Not because anyone asked you
              to pose for a photo.
            </p>
          </LetterSection>

          <LetterSection title="Why you specifically">
            <p>
              I'll be reaching out to coaches and players in the PH on my own too, one conversation at
              a time. That works, but it's slow, and I know a lot of doors are harder to open when
              you're a developer people haven't met yet.
            </p>
            <p>
              You already have something I don't: trust. Coaches and players know you. That would
              mean a lot if we ever launched together. But honestly, the bigger reason I'm writing is
              that I think you have the brain to run this. The network would come naturally with
              someone who actually belongs in this space.
            </p>
          </LetterSection>

          <LetterSection title="Why I'd love to move fast">
            <p>
              Could I do this alone? Maybe, eventually. Recruit coaches one by one, learn as I go,
              figure out the business side as I stumble through it.
            </p>
            <p>
              But it would take a long time. And coaches are dealing with the notebook mess right now.
              Every week without a better tool is another week of admin eating into the coaching they
              actually love doing.
            </p>
            <p className="font-medium text-[#111827]">
              I'd love to launch this sooner rather than later, if the timing works for everyone.
            </p>
            <p>
              The pace I have in mind: we talk during the day about what matters most, I build at
              night, we ship the next day. Feedback, fix, launch. Over and over. I think that's
              possible with the right partner from the start. Much harder to do alone.
            </p>
          </LetterSection>

          <LetterSection title="How we'd work together">
            <p className="font-medium text-[#111827]">You'd run it. I'd build it.</p>
            <p>
              You'd call the shots on the business side. How we grow, who we talk to, what we launch
              when. How you want to structure things is completely up to you. CEO, chiefs of coaching
              or community or partnerships, whatever feels right. If you have a different idea
              entirely, I'm happy to hear it.
            </p>
            <p>
              I'd handle the tech. Building the product, fixing what's broken, shipping what we agree
              matters. I can help on social media and marketing too, if that would be useful.
            </p>
            <p>
              Equity, compensation, who owns what. I'd want to figure all of that out together, in a
              real conversation. Nothing decided on my end before we talk.
            </p>
          </LetterSection>

          <LetterSection title="The business side">
            <p>
              I'm still figuring this out, and I'd want your input on all of it. But here's the rough
              picture in my head, in case it helps you see where I'm coming from.
            </p>
            <p className="font-medium text-[#111827]">
              Subscription. About ₱{SUBSCRIPTION_MONTHLY_PHP.toLocaleString("en-PH")} per month per
              coach for full access.
            </p>
            <p>
              I know that sounds like another bill. But put it next to what coaches already charge.
              It's roughly ₱{Math.round(SUBSCRIPTION_MONTHLY_PHP / 30)} a day. One extra session a
              month at even ₱500 per head covers the whole thing. If this app saves a coach even an
              hour of admin a week, it pays for itself. I want the price to feel fair. Light enough
              that coaches don't have to think twice, as long as the app is genuinely useful to them.
            </p>
            <p>
              There are already thousands of pickleball coaches in the Philippines alone. Certified,
              part-time, teaching at clubs on the side. And the sport is still growing here. That's
              just the starting point.
            </p>
            <p>
              And if you picture it globally, pickleball is growing fast everywhere. Same notebook
              problem, same admin mess, wherever coaches are trying to run a real business on their
              phone. If we get this right for coaches here, I don't see why it has to stay local.
            </p>
            <p>
              The math, at least on paper: {COACHES_FOR_1M_MRR.toLocaleString("en-PH")} coaches at ₱
              {SUBSCRIPTION_MONTHLY_PHP.toLocaleString("en-PH")} a month is about ₱1M in monthly
              revenue. That's still a small slice of the coaches already out there, in one country,
              before you even think about the rest of the world.
            </p>
            <p>
              I'm not saying any of this is guaranteed. But the sport is growing, coaches are
              underserved, and if we build something they actually want to use, I think there's
              something real here.
            </p>
            <p>
              Pricing, packaging, early deals for founding coaches. All of that is open. This is just
              a starting thought, not something I'd want to decide without you.
            </p>
          </LetterSection>

          <LetterSection title="The honest part">
            <p className="font-medium text-[#111827]">I might be wrong about some of this.</p>
            <p>
              I don't have a deck full of projections. I don't have funding lined up. What I have is
              an app I built in a week, a belief that this problem is worth solving, and the ability
              to move quickly once someone who knows the business side better than I do is helping
              steer.
            </p>
            <p>
              All I'm really hoping for is that you'll take a look and tell me honestly what you
              think. If running this together is something you'd be interested in, I'd be grateful to
              talk. If not, I completely understand. No pressure either way.
            </p>
            <p>
              What I can promise is that I'll keep building, I'll keep listening, and I genuinely
              care about getting this right. For coaches like my friend, who deserve better than a
              notebook.
            </p>
          </LetterSection>

          <LetterSection title="On the name">
            <p>
              I initially thought of KoachesPH with the domain koaches.ph. That's where I first saw
              the problem up close, and where I've watched the community grow.
            </p>
            <p>
              But I'm hopeful this could reach coaches beyond the Philippines someday. So I rebranded
              to <strong className="text-[#111827]">{BRAND_NAME}</strong> ({SITE_DOMAIN}).
            </p>
            <p>
              I've secured <strong className="text-[#111827]">@picklekoach</strong> on Facebook and
              Instagram for when we're ready to show up publicly. The live demo for now is at{" "}
              <strong className="text-[#111827]">{PROPOSAL_LIVE_URL}</strong>. Once we have a go
              signal to push this out, I'll buy the {SITE_DOMAIN} domain.
            </p>
            <p>
              If a different name sparks something better for you, I'm very open to that. The mission
              stays the same either way: get the coach core right first. Public listing and booking
              can come later, if there's demand.
            </p>
          </LetterSection>

          <LetterSection title="Next step">
            <p className="font-medium text-[#111827]">If you have time, I'd love for you to take a look.</p>
            <p>
              Everything I've described is built enough to click through on your own. No screen share
              needed unless you'd prefer that.
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
              The demo is live at {PROPOSAL_LIVE_URL} for now. Once we're ready to launch, I'll move
              it to {SITE_DOMAIN}.
            </p>
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-4 text-base sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Demo login
              </p>
              <p className="mt-2 text-[#111827]">
                Email:{" "}
                <span className="font-mono text-sm">sample@picklekoach.com</span>
              </p>
              <p className="text-[#111827]">
                Password: <span className="font-mono text-sm">password</span>
              </p>
            </div>
            <p>
              Whenever you have a quiet moment, I'd really appreciate you clicking around and seeing
              if this feels like something coaches would genuinely benefit from.
            </p>
            <p>
              If you'd ever want to talk about running this together, I'd be so happy to hear from
              you. And if you're busy right now, or this just isn't the right fit, please don't worry
              about it at all. I completely understand. I'll keep building either way.
            </p>
            <p>
              If you do get a chance to look at it, even a short note with your honest thoughts
              would mean the world to me. Good, bad, or somewhere in between. I'm still figuring
              this out, and your perspective would genuinely help.
            </p>
            <p>
              Thank you so much for reading this far. I know your time is precious, and it means a lot
              that you even opened it.
            </p>
          </LetterSection>

          <div className="border-t border-[#E5E7EB] pt-10">
            <p className="text-[#374151]">With gratitude,</p>
            <p className="font-heading mt-4 text-lg font-semibold text-[#111827]">Leigh</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Tech · {BRAND_NAME}
              <br />
              {PROPOSAL_LIVE_URL}
            </p>

            <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                Reach me
              </p>
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
                  <a
                    href="mailto:tlolapura@gmail.com"
                    className="font-medium text-[#4F8FF7] hover:underline"
                  >
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
        </article>

        <p className="mt-12 text-center text-[11px] text-[#9CA3AF]">
          Private · not indexed · share only with people you trust
        </p>
      </div>
    </div>
  );
}

function LetterSection({
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
