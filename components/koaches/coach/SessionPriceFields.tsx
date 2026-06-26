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
  onPlayerCountChange: (count: number) => void;
  onPriceChange: (price: number) => void;
};

export function SessionPriceFields({
  sessionType,
  program,
  pricing,
  playerCount,
  price,
  onPlayerCountChange,
  onPriceChange,
}: SessionPriceFieldsProps) {
  if (sessionType === "program" && program) {
    return (
      <div className="space-y-3">
        <CoachSheetField label="Program bundle" hint="Per player — set on each program, not drop-in rates">
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

  return (
    <div className="grid grid-cols-2 gap-3">
      <CoachSheetField
        label="Players"
        hint={`Drop-in · min ${pricing.minimumPlayers} pax`}
      >
        <input
          type="number"
          min={pricing.minimumPlayers}
          max={pricing.maximumPlayers}
          className="coach-input"
          value={playerCount}
          onChange={(e) => {
            const count = Math.max(
              pricing.minimumPlayers,
              Math.min(pricing.maximumPlayers, Number(e.target.value) || 1)
            );
            onPlayerCountChange(count);
            onPriceChange(
              suggestSessionPrice({ type: "drop-in", playerCount: count, pricing })
            );
          }}
        />
      </CoachSheetField>
      <CoachSheetField
        label="Drop-in rate (₱)"
        hint={suggested !== price ? `Suggested: ${formatCurrency(suggested)}` : undefined}
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
