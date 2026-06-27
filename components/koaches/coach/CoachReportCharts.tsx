"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DuprLevel } from "@/lib/koaches/types";
import type { EarningsTrendPoint } from "@/lib/koaches/coach-reports";
import { formatCurrency } from "@/lib/utils";

const GREEN = "#16A34A";
const BLUE = "#4F8FF7";

type EarningsTrendChartProps = {
  data: EarningsTrendPoint[];
};

export function CoachEarningsTrendChart({ data }: EarningsTrendChartProps) {
  const hasData = data.some((d) => d.collected > 0);

  if (!hasData) {
    return (
      <p className="py-8 text-center text-sm text-[#6B7280]">
        Collected revenue will show here once sessions are marked paid.
      </p>
    );
  }

  return (
    <div className="h-44 w-full sm:h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => (v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`)}
          />
          <Tooltip
            cursor={{ fill: "rgba(22, 163, 74, 0.08)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as EarningsTrendPoint;
              return (
                <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-md">
                  <p className="font-heading font-semibold text-[#111827]">{row.label}</p>
                  <p className="text-[#6B7280]">
                    {row.sessions} session{row.sessions === 1 ? "" : "s"}
                  </p>
                  <p className="font-heading font-semibold text-[#16A34A]">
                    {formatCurrency(row.collected)}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="collected" fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type RevenueMixChartProps = {
  programRevenue: number;
  dropInRevenue: number;
};

export function CoachRevenueMixChart({ programRevenue, dropInRevenue }: RevenueMixChartProps) {
  const total = programRevenue + dropInRevenue;
  const data = [
    { name: "Programs", value: programRevenue, color: GREEN },
    { name: "Drop-in", value: dropInRevenue, color: BLUE },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#6B7280]">No collected revenue in this period.</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="h-36 w-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-md">
                    <p className="font-heading font-semibold">{row.name}</p>
                    <p className="font-semibold" style={{ color: row.color }}>
                      {formatCurrency(row.value)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full space-y-2 sm:flex-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#6B7280]">{item.name}</span>
            </div>
            <span className="font-heading font-semibold text-[#111827]">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type StudentsByLevelChartProps = {
  levels: { level: DuprLevel; count: number }[];
};

export function CoachStudentsByLevelChart({ levels }: StudentsByLevelChartProps) {
  const data = levels.map((l) => ({ label: l.level, count: l.count }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ fill: "rgba(22, 163, 74, 0.08)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-md">
                  <p className="font-heading font-semibold">DUPR {row.label}</p>
                  <p className="text-[#6B7280]">
                    {row.count} student{row.count === 1 ? "" : "s"}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
