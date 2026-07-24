"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklySessionPoint } from "@/lib/koaches/admin-analytics";

type AdminSessionsTrendChartProps = {
  data: WeeklySessionPoint[];
};

export function AdminSessionsTrendChart({ data }: AdminSessionsTrendChartProps) {
  return (
    <div className="h-48 w-full sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(22, 163, 74, 0.08)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as WeeklySessionPoint;
              return (
                <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-md">
                  <p className="font-semibold text-[#111827]">Week of {row.label}</p>
                  <p className="text-[#6B7280]">
                    {row.sessions} completed session{row.sessions === 1 ? "" : "s"}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="sessions" fill="#16A34A" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
