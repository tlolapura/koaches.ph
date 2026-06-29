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

export function InternalProposalToSarazasPage() {
  return (
    <ProposalPageShell subtitle={`A personal letter for Kim and Meds · ${LETTER_DATE}`}>
      <div className="space-y-5">
        <p>Hi Kim and Meds,</p>
        <p>
          My name is Leigh. I'm a developer based here in the Philippines. I play pickleball, probably
          watch too much of it on YouTube, and I built an app called PickleKoach because I kept seeing
          a problem I couldn't ignore.
        </p>
        <p>
          I hope it's okay that I'm reaching out this way. I'm not sure a web page is the right format
          for this. I've never written anything like a co-founder proposal before. But I wanted to put
          my thoughts down properly, and I wanted you both to read them.
        </p>
        <p>
          You two have been on my mind for a while. I've been following what you do through your
          matches, your posts, and everything happening around The Pickle Yard. This isn't something
          I'm copying and sending around. I put your names on it because I mean it.
        </p>
        <p>
          A big part of why I'm writing is that I feel like we care about the same things. Building
          something real. Putting people first. Growing the sport without losing what makes it good.
          Showing up consistently, not just when the cameras are on. That matters to me.
        </p>
      </div>

      <LetterSection title="Where it started">
        <p>
          A friend of mine is a coach. Freelance, not tied to one club. She's at different courts all
          week, different students, different schedules. There's no one place to see everything. Just a
          notebook, handwritten schedules, GCash screenshots filed in a chat. Names, session notes, skill
          notes. All in a list on her phone.
        </p>
        <p>
          Her students love her. They improve. They trust her. But I'd watch her scroll through that list
          before every session and think: she is too good at coaching to be doing this much admin. There
          has to be a better way.
        </p>
        <p>
          You actually know her. I can tell you more when we talk. And if you're interested in meeting up
          to discuss this, I can bring her with me.
        </p>
        <p>
          I know your world is bigger than a notebook problem. You're building community, training
          players, and helping the sport grow in ways most people never see. But I still feel that coaches
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

      <LetterSection title="What I'm looking for">
        <p className="font-medium text-[#111827]">
          Someone to run this with me. A CEO, if that title makes sense. The main brain on how to grow
          it.
        </p>
        <p>
          I'd love to find someone who genuinely wants to build this alongside me. Vision, strategy,
          which coaches to bring on first, how we talk to the community, what we launch and what we wait
          on. The parts that aren't code.
        </p>
        <p>
          In my head, this should feel like a coach's company with a developer behind it. Someone
          running it who understands coaching, understands the community, and knows how to move in that
          world.
        </p>
        <p>
          I'm hoping for a co-founder, if that's something you'd ever be open to. Real involvement, your
          name on it because you believed in it. Not because anyone asked you to pose for a photo.
        </p>
      </LetterSection>

      <LetterSection title="Why you both">
        <p>
          I'll be honest. You're not the only people I could talk to. But when I imagined who could run
          this with me, you two kept coming up. Together.
        </p>
        <p>
          I've been watching what you build as a couple in this sport. You're married, and it shows in
          how you move together. Not just on court, but around it. Kim, you coach. You're certified. You
          know what it feels like to plan sessions, track where a student is, and actually help them get
          better. Meds, you compete and you understand the discipline it takes to keep showing up. You
          both live this every day.
        </p>
        <p>
          And you're embedded in something bigger. The Pickle Yard. Team Philippines. A community of
          players who trust the people around them. That's rare. Most apps are built by developers who
          have never spent a full day at a court. You know what coaches and players actually need because
          you're already in the middle of it.
        </p>
        <p>
          What I built lines up with how you already think about the game. Structured programs. Real
          progress students can see. Not just booking a slot and calling it coaching. Skill rubrics,
          progress cards, the stuff that helps someone feel like they're actually improving. That's the
          heart of PickleKoach.
        </p>
        <p>
          You also have something I simply don't. Trust. People know you. Players listen because you've
          earned it. Coaches would take a recommendation from you seriously. If we ever launched this
          together, that credibility isn't something I can code into an app. But it's the thing that
          would make coaches give us a real shot on day one.
        </p>
        <p>
          And honestly, I think you have the brain to run this. You know how to communicate. You know how
          to build a team. You know how to think long-term. You've already proven you can build something
          together as husband and wife. That matters a lot to me.
        </p>
        <p>
          I'll also say this, and I mean it in a light way. If this is something you two ever wanted to
          explore, I imagine it could be fun bonding. Late-night ideas over coffee. Arguing about pricing
          over dinner. Building something that's yours, not just another tournament on the calendar. I
          don't know if that's how you'd see it, but from the outside, it feels like the kind of project
          a couple like you could actually enjoy.
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
          right partner from the start. Much harder to do alone.
        </p>
      </LetterSection>

      <LetterSection title="How we'd work together">
        <p className="font-medium text-[#111827]">You'd run it. I'd build it.</p>
        <p>
          You'd call the shots on the business side. How we grow, who we talk to, what we launch when.
          How you want to structure things is completely up to you. CEO, chiefs of coaching or
          community or partnerships, whatever feels right. If you have a different idea entirely, I'm
          happy to hear it.
        </p>
        <p>
          I'd handle the tech. Building the product, fixing what's broken, shipping what we agree
          matters. I can help on social media and marketing too, if that would be useful.
        </p>
        <p>
          Equity, compensation, who owns what. I'd want to figure all of that out together, in a real
          conversation. Nothing decided on my end before we talk.
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
          All I'm really hoping for is that you'll take a look and tell me honestly what you think. If
          running this together is something you'd be interested in, I'd be grateful to talk. If not, I
          completely understand. No pressure either way.
        </p>
        <p>
          What I can promise is that I'll keep building, I'll keep listening, and I genuinely care
          about getting this right. For coaches who deserve better than a notebook, and for the students
          who trust them to help them grow.
        </p>
      </LetterSection>

      <ProposalOnTheNameSection />

      <ProposalNextStepsSection
        demoEmail="kim@picklekoach.com"
        closingParagraphs={
          <>
            <p>
              Whenever you have a quiet moment between training, coaching, and everything else on your
              plate, I'd really appreciate you clicking around and seeing if this feels like something
              coaches would genuinely benefit from. Your perspective, both as coaches and as people deep
              in the community, would mean a lot.
            </p>
            <p>
              If you'd ever want to talk about running this together, I'd be so happy to hear from you.
              Happy to grab coffee somewhere, maybe near Parañaque or wherever works for you both, and
              talk it through if you're interested. No pressure at all. But if you did want to explore it,
              I think it could be a really fun thing to build on together. And if you're busy right now,
              or this just isn't the right fit, please don't worry about it at all. I completely
              understand. I'll keep building either way.
            </p>
            <p>
              If you do get a chance to look at it, even a short note with your honest thoughts would
              mean the world to me. Good, bad, or somewhere in between. I'm still figuring this out, and
              your perspective would genuinely help.
            </p>
            <p>
              Thank you so much for reading this far, Kim and Meds. I know your time is precious, and it
              means a lot that you even opened it.
            </p>
          </>
        }
      />

      <ProposalSignature />
    </ProposalPageShell>
  );
}
