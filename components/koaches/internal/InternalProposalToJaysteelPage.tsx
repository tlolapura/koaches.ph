import {
  BuiltFeaturesList,
  COACHES_FOR_1M_MRR,
  LetterSection,
  ProposalNextStepsSection,
  ProposalOnTheNameSection,
  ProposalPageShell,
  ProposalSignature,
  SUBSCRIPTION_MONTHLY_PHP,
} from "@/components/koaches/internal/proposal-shared";

const LETTER_DATE = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

export function InternalProposalToJaysteelPage() {
  return (
    <ProposalPageShell subtitle={`A personal letter for Daks · ${LETTER_DATE}`}>
      <div className="space-y-5">
        <p>Hi Daks,</p>
        <p>
          My name is Leigh. I'm a developer based here in the Philippines. I play pickleball, probably
          watch too much of it on YouTube, and I built an app called PickleKoach because I kept seeing
          a problem I couldn't ignore.
        </p>
        <p>
          You probably know me already. We've bumped into each other on court more than once. If my name
          doesn't ring a bell right away, check my socials at{" "}
          <a
            href="https://instagram.com/leighlaang"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#16A34A] underline underline-offset-2 hover:text-[#15803D]"
          >
            @leighlaang
          </a>
          . I'm pretty sure you'll recognize me.
        </p>
        <p>
          I hope it's okay that I'm reaching out this way. I'm not sure a web page is the right format
          for this. I've never written anything like this before. But I wanted to put my thoughts down
          properly, and I wanted you to read them.
        </p>
        <p>
          I've been thinking about who could help take PickleKoach somewhere real, and your name kept
          coming up. This isn't something I'm copying and sending around. I put your name on it because
          I mean it.
        </p>
      </div>

      <LetterSection title="Where it started">
        <p>
          I kept seeing the same thing around courts. Coaches juggling different students, different
          schedules, different courts. No one place to see everything. Just a notebook, handwritten
          schedules, GCash screenshots filed in a chat. Names, session notes, skill notes. All in a list
          on a phone.
        </p>
        <p>
          The coaching is good. Students improve. They trust their coaches. But too much time goes into
          admin before every session. There has to be a better way.
        </p>
        <p>
          I know your world is bigger than a notebook problem. You build teams, grow communities, and
          help the sport move forward in ways most people never see. But I still feel that coaches
          everywhere deserve better tools behind the scenes. Less chaos on the phone. More time on court
          with the people who matter.
        </p>
        <p>So I started building one.</p>
      </LetterSection>

      <LetterSection title="What I built">
        <p>
          I built this in about a week. I build fast, and I'm proud of what's already there. The portal,
          the programs, the progress cards. Most of what you're reading about, you can actually click
          through today.
        </p>
        <p>
          What I'm not great at is the business side. I'm a developer. I can write code and fix things
          at midnight. But who to go after first, how to price it, how to grow it, what the pitch to a
          coach should sound like, when to launch and when to wait. Those are the decisions I need help
          with.
        </p>
        <p>That's really why I'm writing to you.</p>
        <BuiltFeaturesList />
      </LetterSection>

      <LetterSection title="What I'm open to">
        <p>
          I'm not coming in with one fixed idea of how this has to work. I'm open. Genuinely. Here's what
          I'm thinking, and I'd love your honest take on what makes sense.
        </p>
        <p className="font-medium text-[#111827]">
          Maybe you want to lead this. Run it day to day. Call the shots on growth, partnerships, and
          how we show up in the community.
        </p>
        <p>
          Or maybe you'd rather own the marketing side. You already know how to promote things like
          Sports360. If you have someone in mind who'd be a better fit to lead the company, I'd be happy
          to hear that too. I'm not attached to titles. I just want the right people in the right seats.
        </p>
        <p>
          Partnership is on the table. If there's a way PickleKoach and something you're already building
          or promoting could work together, I'm very open to that conversation. Same with acquisition.
          If you see a path where this folds into something bigger you're already running, I'm willing
          to talk about it. Nothing decided on my end. I'd rather find something that actually works for
          everyone than force a shape that doesn't fit.
        </p>
        <p>
          At the core, I need help on the parts that aren't code. Vision, strategy, marketing, which
          coaches to bring on first, how we talk to the community. I'd handle building the product,
          fixing what's broken, and shipping what we agree matters.
        </p>
      </LetterSection>

      <LetterSection title="Why you, Daks">
        <p>
          I'll be honest. You're not the only person I could talk to. But when I imagined who could help
          move this forward, you kept coming up.
        </p>
        <p>
          You know how to build teams. You've managed squads, organized people, and gotten results when
          it mattered. That's not something every developer can fake. Most apps in this space are built
          by people who've never spent a full day around courts and communities. You have.
        </p>
        <p>
          You also know marketing. You promote Sports360. You understand how to get something in front
          of the right people without making it feel cheap. That's a huge gap on my side, and it's
          exactly where I need help.
        </p>
        <p>
          And you run your own thing too. The Baby Village Studio didn't grow by accident. You've built
          a brand, trained people, and turned something you care about into a real business. That tells
          me you know how to think beyond the next tournament or the next post.
        </p>
        <p>
          You have trust in the community. People know you. Players and coaches listen because you've
          shown up consistently. If we ever launched this properly, that credibility isn't something I
          can code into an app. But it's the thing that would make people give us a real shot.
        </p>
        <p>
          And if you know someone better suited to lead while you handle growth and marketing, that
          honestly might be the smartest setup. I'd rather hear your honest recommendation than have you
          say yes to something that doesn't fit.
        </p>
      </LetterSection>

      <LetterSection title="Why I'd love to move fast">
        <p>
          Could I do this alone? Maybe, eventually. Recruit coaches one by one, learn as I go, figure
          out the business side as I stumble through it.
        </p>
        <p>
          But it would take a long time. And coaches are dealing with the notebook mess right now. Every
          week without a better tool is another week of admin eating into the coaching they actually love
          doing.
        </p>
        <p className="font-medium text-[#111827]">
          I'd love to launch this sooner rather than later, if the timing works for everyone.
        </p>
        <p>
          The pace I have in mind: we talk during the day about what matters most, I build at night, we
          ship the next day. Feedback, fix, launch. Over and over. I think that's possible with the
          right people from the start. Much harder to do alone.
        </p>
      </LetterSection>

      <LetterSection title="How we'd work together">
        <p>
          However we structure it, I'd want you in the loop early. Not as a favor. As someone whose
          judgment I actually trust on the business side.
        </p>
        <p>
          If you lead: you'd call the shots on growth, partnerships, and how we show up. I'd build and
          ship. We'd figure out equity and compensation together in a real conversation.
        </p>
        <p>
          If you lead marketing and bring in a CEO: great. I'd still want to build with whoever ends up
          running day to day. You'd own getting PickleKoach in front of the right people.
        </p>
        <p>
          If it's a partnership or acquisition conversation with something you're already part of, I'm
          open. Let's talk about what that could look like without any pressure.
        </p>
        <p>
          Nothing is decided on my end before we talk. I'd rather get it right than get it fast.
        </p>
      </LetterSection>

      <LetterSection title="The business side">
        <p>
          I'm still figuring this out, and I'd want your input on all of it. But here's the rough picture
          in my head, in case it helps you see where I'm coming from.
        </p>
        <p className="font-medium text-[#111827]">
          Subscription. About ₱{SUBSCRIPTION_MONTHLY_PHP.toLocaleString("en-PH")} per month per coach
          for full access.
        </p>
        <p>
          I know that sounds like another bill. But put it next to what coaches already charge. It's
          roughly ₱{Math.round(SUBSCRIPTION_MONTHLY_PHP / 30)} a day. One extra session a month at even
          ₱500 per head covers the whole thing. If this app saves a coach even an hour of admin a week,
          it pays for itself. I want the price to feel fair. Light enough that coaches don't have to
          think twice, as long as the app is genuinely useful to them.
        </p>
        <p>
          There are already thousands of pickleball coaches in the Philippines alone. Certified,
          part-time, teaching at clubs on the side. And the sport is still growing here. That's just the
          starting point.
        </p>
        <p>
          And if you picture it globally, pickleball is growing fast everywhere. Same notebook problem,
          same admin mess, wherever coaches are trying to run a real business on their phone. If we get
          this right for coaches here, I don't see why it has to stay local.
        </p>
        <p>
          The math, at least on paper: {COACHES_FOR_1M_MRR.toLocaleString("en-PH")} coaches at ₱
          {SUBSCRIPTION_MONTHLY_PHP.toLocaleString("en-PH")} a month is about ₱1M in monthly revenue.
          That's still a small slice of the coaches already out there, in one country, before you even
          think about the rest of the world.
        </p>
        <p>
          I'm not saying any of this is guaranteed. But the sport is growing, coaches are underserved,
          and if we build something they actually want to use, I think there's something real here.
        </p>
        <p>
          Pricing, packaging, early deals for founding coaches. All of that is open. This is just a
          starting thought, not something I'd want to decide without you.
        </p>
      </LetterSection>

      <LetterSection title="The honest part">
        <p className="font-medium text-[#111827]">I might be wrong about some of this.</p>
        <p>
          I don't have a deck full of projections. I don't have funding lined up. What I have is an
          app I built in a week, a belief that this problem is worth solving, and the ability to move
          quickly once someone who knows the business side better than I do is helping steer.
        </p>
        <p>
          All I'm really hoping for is that you'll take a look and tell me honestly what you think.
          Whether that's leading it, leading marketing, introducing me to someone else, or exploring a
          partnership. If none of it fits, I completely understand. No pressure either way.
        </p>
        <p>
          What I can promise is that I'll keep building, I'll keep listening, and I genuinely care
          about getting this right. For coaches who deserve better than a notebook, and for the students
          who trust them to help them grow.
        </p>
      </LetterSection>

      <ProposalOnTheNameSection />

      <ProposalNextStepsSection
        demoEmail="jaysteel@picklekoach.com"
        closingParagraphs={
          <>
            <p>
              Whenever you have a quiet moment, I'd really appreciate you clicking around and seeing if
              this feels like something coaches would genuinely benefit from. Your perspective as someone
              who builds teams and knows this community would mean a lot.
            </p>
            <p>
              If any of this sounds interesting, I'd love to grab coffee and talk it through. Maybe
              somewhere in Taguig or wherever works for you. We've already crossed paths on court, so
              meeting up in person feels natural. And if you're busy right now, or this just isn't the
              right fit, please don't worry about it at all. I completely understand. I'll keep building
              either way.
            </p>
            <p>
              If you do get a chance to look at it, even a short note with your honest thoughts would
              mean the world to me. Good, bad, or somewhere in between. I'm still figuring this out, and
              your perspective would genuinely help.
            </p>
            <p>
              Thank you so much for reading this far, Daks. I know your time is precious, and it means a
              lot that you even opened it.
            </p>
          </>
        }
      />

      <ProposalSignature />
    </ProposalPageShell>
  );
}
