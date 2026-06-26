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
import type { MonthlyMetric } from "@/lib/koaches/admin-data";
import { formatCurrency } from "@/lib/utils";

type AdminRevenueChartProps = {
  data: MonthlyMetric[];
};

export function AdminRevenueChart({ data }: AdminRevenueChartProps) {
  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#71717A" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717A" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: "rgba(22, 163, 74, 0.08)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as MonthlyMetric;
              return (
                <div className="rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm shadow-md">
                  <p className="font-bold">{row.month}</p>
                  <p className="text-text-muted">{row.sessions} sessions</p>
                  <p className="font-heading font-semibold text-[#4F8FF7]">{formatCurrency(row.revenue)}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="revenue" fill="#4F8FF7" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
