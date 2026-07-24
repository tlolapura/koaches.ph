"use client";

import type { CoachSessionPricing, Program } from "@/lib/koaches/types";
import { suggestSessionPrice } from "@/lib/koaches/session-pricing";
import { formatProgramBundleSummary } from "@/lib/koaches/program-pricing";
import { formatCurrency } from "@/lib/utils";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";

type SessionPriceFieldsProps = {
  sessionType: "drop-in" | "program";
  program?: Program;
  pricing: CoachSessionPricing;
  playerCount: number;
  price: number;
  onPriceChange: (price: number) => void;
};

export function SessionPriceFields({
  sessionType,
  program,
  pricing,
  playerCount,
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
          hint={`Revenue allocation: ${formatCurrency(program.price)} ÷ ${program.sessionCount} sessions`}
        >
          <input
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
    pricing,
  });
  const perPerson = suggested > 0 ? Math.round(suggested / playerCount) : 0;

  return (
    <CoachSheetField
      label="Session total (₱)"
      hint={
        suggested !== price
          ? `Suggested: ${formatCurrency(perPerson)}/person × ${playerCount} = ${formatCurrency(suggested)}`
          : `${formatCurrency(perPerson)}/person × ${playerCount} players`
      }
    >
      <input
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
