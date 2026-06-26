"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { categoryAverages } from "@/lib/koaches/constants";
import type { SkillCategory } from "@/lib/koaches/types";

type RadarChartProps = {
  before: { category: SkillCategory; score: number }[];
  after: { category: SkillCategory; score: number }[];
  height?: number;
  showLegend?: boolean;
  compact?: boolean;
};

export function RadarChart({ before, after, height = 280, showLegend = true, compact = false }: RadarChartProps) {
  const beforeAvg = categoryAverages(before);
  const afterAvg = categoryAverages(after);

  const data = beforeAvg.map((b, i) => ({
    subject: compact ? b.label.split(" ")[0] : b.label.length > 12 ? `${b.label.slice(0, 10)}…` : b.label,
    fullLabel: b.label,
    before: Number(b.score.toFixed(1)),
    after: Number((afterAvg[i]?.score ?? 0).toFixed(1)),
  }));

  if (!data.length) return null;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: compact ? 9 : 10, fill: "#6B7280" }} />
          <Radar
            name="Before"
            dataKey="before"
            stroke="#14532D"
            fill="transparent"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <Radar
            name="After"
            dataKey="after"
            stroke="#16A34A"
            fill="#16A34A"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value) => <span className="text-[#6B7280]">{value}</span>}
            />
          )}
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillComparisonTable({
  before,
  after,
}: {
  before: { skillId: string; skillName: string; score: number }[];
  after: { skillId: string; skillName: string; score: number }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] text-left text-xs text-[#6B7280]">
            <th className="pb-2 font-medium">Skill</th>
            <th className="pb-2 font-medium">Before</th>
            <th className="pb-2 font-medium">After</th>
            <th className="pb-2 font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {before.map((b) => {
            const a = after.find((x) => x.skillId === b.skillId);
            const diff = (a?.score ?? 0) - b.score;
            return (
              <tr key={b.skillId} className="border-b border-[#E5E7EB]/60">
                <td className="py-2 pr-2 font-medium text-[#111827]">{b.skillName}</td>
                <td className="py-2 text-[#6B7280]">{b.score}</td>
                <td className="py-2 font-semibold text-[#111827]">{a?.score ?? "—"}</td>
                <td className="py-2">
                  {diff > 0 && <span className="text-[#22C55E]">↑ {diff}</span>}
                  {diff < 0 && <span className="text-[#EF4444]">↓ {Math.abs(diff)}</span>}
                  {diff === 0 && <span className="text-[#6B7280]">=</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
