import Image from "next/image";
import { cn } from "@/lib/utils";

const BALL_SRC = "/illustrations/ball.png";

function PickleballBallImage({ className }: { className?: string }) {
  return (
    <Image
      src={BALL_SRC}
      alt=""
      width={256}
      height={256}
      className={cn("h-full w-full object-contain drop-shadow-sm", className)}
      aria-hidden
    />
  );
}

type PickleballBallBackdropProps = {
  className?: string;
  /** portal = coach/admin app shell; landing = white home; login = auth screens */
  variant?: "portal" | "landing" | "login";
};

export function PickleballBallBackdrop({
  className,
  variant = "portal",
}: PickleballBallBackdropProps) {
  const opacity =
    variant === "landing" ? "opacity-[0.14]" : variant === "login" ? "opacity-[0.16]" : "opacity-[0.18]";
  const opacityMid = variant === "landing" ? "opacity-[0.12]" : "opacity-[0.14]";
  const opacitySm = variant === "portal" ? "opacity-[0.11]" : "opacity-[0.10]";

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <PickleballBallImage
        className={cn("absolute -right-8 -top-4 h-44 w-44 sm:h-52 sm:w-52", opacity, "rotate-12")}
      />
      <PickleballBallImage
        className={cn(
          "absolute -bottom-12 -left-10 h-56 w-56 sm:h-64 sm:w-64",
          opacity,
          "-rotate-[18deg]"
        )}
      />
      <PickleballBallImage
        className={cn(
          "absolute top-[36%] right-[6%] h-32 w-32 sm:h-36 sm:w-36",
          opacityMid,
          "rotate-[8deg]"
        )}
      />
      {variant === "portal" && (
        <PickleballBallImage
          className={cn(
            "absolute left-[4%] top-[14%] hidden h-28 w-28 md:block",
            opacitySm,
            "-rotate-6"
          )}
        />
      )}
    </div>
  );
}
