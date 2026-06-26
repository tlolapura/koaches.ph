import { cn } from "@/lib/utils";

type SocialIconProps = {
  className?: string;
};

export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("h-4 w-4", className)} aria-hidden>
      <path d="M14 8.5V7.2c0-.7.1-1.2.5-1.5.4-.4 1-.6 1.8-.6h1.2V3h-2.4c-2 0-3.3.5-4.1 1.4-.8.9-1.2 2.2-1.2 4V8.5H7v3.2h2.8V21h4.2v-9.3H17l.5-3.2H14z" />
    </svg>
  );
}
