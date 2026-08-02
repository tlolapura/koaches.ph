"use client";

import type { CoachSessionPricing, Program } from "@/lib/koaches/types";
import { formatSuggestedDropInHint } from "@/lib/koaches/pricing";
import { suggestSessionPrice } from "@/lib/koaches/session-pricing";
import { formatProgramBundleSummary } from "@/lib/koaches/program-pricing";
import { formatCurrency } from "@/lib/utils";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";

type SessionPriceFieldsProps = {
  sessionType: "drop-in" | "program";
  program?: Program;
  pricing: CoachSessionPricing;
  playerCount: number;
  durationMinutes?: number;
  price: number;
  onPriceChange: (price: number) => void;
};

export function SessionPriceFields({
  sessionType,
  program,
  pricing,
  playerCount,
  durationMinutes,
  price,
  onPriceChange,
}: SessionPriceFieldsProps) {
  if (sessionType === "program" && program) {
    return (
      <div className="space-y-3">
        <CoachSheetField label="Program bundle" hint="Per player. Set on each program, not drop-in rates.">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-sm font-semibold text-[#14532D]">
            {formatProgramBundleSummary(program)}
          </div>
        </CoachSheetField>
        <CoachSheetField
          label="Session value (₱)"
          htmlFor="session-value-input"
          hint={`Revenue allocation: ${formatCurrency(program.price)} ÷ ${program.sessionCount} sessions`}
        >
          <input
            id="session-value-input"
            type="number"
            min={0}
            step={50}
            className="coach-input"
            value={price}
            onChange={(e) => onPriceChange(Math.max(0, Number(e.target.value) || 0))}
          />
        </CoachSheetField>
      </div>
    );
  }

  const suggested = suggestSessionPrice({
    type: "drop-in",
    playerCount,
    durationMinutes,
    pricing,
  });

  return (
    <CoachSheetField
      label="Session total (₱)"
      htmlFor="session-total-input"
      hint={
        durationMinutes
          ? formatSuggestedDropInHint(pricing, playerCount, durationMinutes, suggested)
          : undefined
      }
    >
      <input
        id="session-total-input"
        type="number"
        min={0}
        step={50}
        className="coach-input"
        value={price}
        onChange={(e) => onPriceChange(Math.max(0, Number(e.target.value) || 0))}
      />
    </CoachSheetField>
  );
}
