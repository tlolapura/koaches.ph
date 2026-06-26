"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check } from "lucide-react";
import type { CoachListing } from "@/lib/koaches/types";
import {
  BUDGET_OPTIONS,
  EXPERIENCE_OPTIONS,
  REGIONS,
  recommendCoaches,
  type ExperienceLevel,
  type FinderAnswers,
} from "@/lib/koaches/discovery";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { cn, formatCurrency } from "@/lib/utils";

type CoachFinderProps = {
  open: boolean;
  onClose: () => void;
  coaches: CoachListing[];
  onApply: (answers: FinderAnswers) => void;
};

const STEP_PROMPTS = [
  "Let's find someone great!",
  "Almost there...",
  "Last one — budget lang!",
  "Here's who I'd pick:",
];

export function CoachFinder({ open, onClose, coaches, onApply }: CoachFinderProps) {
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState<string>();
  const [level, setLevel] = useState<ExperienceLevel>();
  const [budgetId, setBudgetId] = useState("any");

  const answers: FinderAnswers = useMemo(() => {
    const budget = BUDGET_OPTIONS.find((b) => b.id === budgetId);
    return { region, level, maxRate: budget?.maxRate };
  }, [region, level, budgetId]);

  const results = useMemo(
    () => (step === 3 ? recommendCoaches(coaches, answers) : []),
    [step, coaches, answers]
  );

  const reset = () => {
    setStep(0);
    setRegion(undefined);
    setLevel(undefined);
    setBudgetId("any");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const finish = () => {
    onApply(answers);
    handleClose();
  };

  if (!open) return null;

  const titles = [
    "Where do you play?",
    "What's your level?",
    "Session budget?",
    "Your top matches",
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        className="absolute inset-0 bg-[var(--k-ink)]/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Close"
      />
      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[var(--k-cream)] shadow-2xl sm:rounded-3xl">
        <div className="border-b border-[var(--k-ink)]/8 px-4 pt-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 pt-1">
              <p className="k-bubble inline-block text-xs">{STEP_PROMPTS[step]}</p>
              <h2 className="k-heading mt-2 text-lg">{titles[step]}</h2>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--k-ink)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-[var(--k-coral)]" : "bg-[var(--k-ink)]/10"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {step === 0 && (
            <div className="space-y-2">
              {REGIONS.map((r) => (
                <QuizOption
                  key={r.id}
                  label={r.label}
                  hint={r.hint}
                  selected={region === r.id}
                  onClick={() => setRegion(r.id)}
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <QuizOption
                  key={opt.id}
                  label={opt.label}
                  hint={opt.hint}
                  selected={level === opt.id}
                  onClick={() => setLevel(opt.id)}
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBudgetId(opt.id)}
                  className={cn("k-chip", budgetId === opt.id && "k-chip-active")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              {results.length === 0 ? (
                <div className="k-card p-6 text-center">
                  <p className="k-heading">No perfect match</p>
                  <p className="k-body mt-1 text-sm text-[var(--k-ink)]/50">
                    We&apos;ll still show you the full list.
                  </p>
                </div>
              ) : (
                results.map(({ coach, reasons }) => (
                  <Link
                    key={coach.id}
                    href={buildPublicCoachPath(coach.slug)}
                    onClick={finish}
                    className="k-card block p-3"
                  >
                    <div className="flex gap-3">
                      {coach.photo ? (
                        <Image
                          src={coach.photo}
                          alt={coach.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFF6FF] text-xs font-bold text-[#1D4ED8]">
                          {coach.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="k-heading text-sm">{coach.name}</p>
                        <p className="k-body text-xs text-[var(--k-coral)]">{coach.specialization}</p>
                        <p className="k-body text-xs font-semibold">
                          {formatCurrency(coach.ratePerSession)}/session
                        </p>
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1 border-t border-[var(--k-ink)]/6 pt-2">
                      {reasons.map((r) => (
                        <li key={r} className="k-body flex gap-1.5 text-[11px] text-[var(--k-ink)]/55">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--k-coral)]" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-[var(--k-ink)]/8 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {step > 0 && step < 3 && (
            <button type="button" className="k-btn k-btn-outline flex-1" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className="k-btn k-btn-primary flex-1 disabled:opacity-40"
              disabled={(step === 0 && !region) || (step === 1 && !level)}
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          ) : (
            <button type="button" className="k-btn k-btn-primary flex-1" onClick={finish}>
              View all coaches
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizOption({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
        selected
          ? "border-[var(--k-coral)] bg-[var(--k-mango-light)]"
          : "border-[var(--k-ink)]/8 bg-white hover:border-[var(--k-coral)]/30"
      )}
    >
      <div>
        <p className="k-heading text-sm">{label}</p>
        {hint && <p className="k-body text-xs text-[var(--k-ink)]/45">{hint}</p>}
      </div>
      {selected && <Check className="h-4 w-4 shrink-0 text-[var(--k-coral)]" />}
    </button>
  );
}
